from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
import base64
from datetime import datetime
from django.conf import settings
from .models import Payment, MpesaTransaction, PayPalTransaction
from .serializers import (
    MpesaSTKPushSerializer, MpesaCallbackSerializer,
    PayPalCreateOrderSerializer, PayPalCaptureSerializer,
    PaymentSerializer
)
from orders.models import Order


# ─── M-PESA ────────────────────────────────────────────────────────────────────

def get_mpesa_access_token():
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()
    response = requests.get(
        settings.MPESA_AUTH_URL,
        headers={"Authorization": f"Basic {credentials}"}
    )
    return response.json().get('access_token')


def get_mpesa_password():
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    shortcode = settings.MPESA_SHORTCODE
    passkey = settings.MPESA_PASSKEY
    raw = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp


class MpesaViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def stk_push(self, request):
        serializer = MpesaSTKPushSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data['phone_number']
        order_id = serializer.validated_data['order_id']
        amount = int(serializer.validated_data['amount'])

        # Normalize phone number to 254XXXXXXXXX
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+'):
            phone = phone[1:]

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            access_token = get_mpesa_access_token()
            password, timestamp = get_mpesa_password()

            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone,
                "PartyB": settings.MPESA_SHORTCODE,
                "PhoneNumber": phone,
                "CallBackURL": settings.MPESA_CALLBACK_URL,
                "AccountReference": order.order_number,
                "TransactionDesc": f"Payment for {order.order_number}"
            }

            response = requests.post(
                settings.MPESA_STK_PUSH_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            data = response.json()

            payment = Payment.objects.create(
                order=order,
                method='mpesa',
                amount=amount,
                currency='KES',
                gateway_response=data
            )

            MpesaTransaction.objects.create(
                payment=payment,
                phone_number=phone,
                merchant_request_id=data.get('MerchantRequestID', ''),
                checkout_request_id=data.get('CheckoutRequestID', '')
            )

            return Response({
                'message': 'STK Push sent. Enter your M-Pesa PIN.',
                'checkout_request_id': data.get('CheckoutRequestID'),
                'merchant_request_id': data.get('MerchantRequestID'),
                'payment_id': str(payment.id)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def callback(self, request):
        """M-Pesa callback endpoint — must be publicly accessible."""
        body = request.data.get('Body', {})
        stk_callback = body.get('stkCallback', {})
        checkout_request_id = stk_callback.get('CheckoutRequestID', '')
        result_code = str(stk_callback.get('ResultCode', ''))
        result_desc = stk_callback.get('ResultDesc', '')

        try:
            mpesa_tx = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
            mpesa_tx.result_code = result_code
            mpesa_tx.result_description = result_desc
            mpesa_tx.raw_callback = request.data

            if result_code == '0':
                metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                meta_dict = {item['Name']: item.get('Value') for item in metadata}
                mpesa_tx.mpesa_receipt_number = str(meta_dict.get('MpesaReceiptNumber', ''))
                mpesa_tx.transaction_date = str(meta_dict.get('TransactionDate', ''))
                mpesa_tx.payment.status = 'completed'
                mpesa_tx.payment.reference = mpesa_tx.mpesa_receipt_number
                mpesa_tx.payment.order.payment_status = 'paid'
                mpesa_tx.payment.order.status = 'confirmed'
                mpesa_tx.payment.order.save()
                mpesa_tx.payment.save()
            else:
                mpesa_tx.payment.status = 'failed'
                mpesa_tx.payment.save()

            mpesa_tx.save()

        except MpesaTransaction.DoesNotExist:
            pass

        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

    @action(detail=False, methods=['get'])
    def check_status(self, request):
        payment_id = request.query_params.get('payment_id')
        try:
            payment = Payment.objects.get(id=payment_id, order__user=request.user)
            return Response({
                'status': payment.status,
                'order_status': payment.order.payment_status
            })
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=404)


# ─── PAYPAL ────────────────────────────────────────────────────────────────────

def get_paypal_access_token():
    credentials = base64.b64encode(
        f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}".encode()
    ).decode()
    response = requests.post(
        f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token",
        data={"grant_type": "client_credentials"},
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )
    return response.json().get('access_token')


class PayPalViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        serializer = PayPalCreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        amount_usd = str(round(float(order.total) / 130, 2))  # KES to USD approx

        try:
            access_token = get_paypal_access_token()
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "reference_id": order.order_number,
                    "amount": {
                        "currency_code": "USD",
                        "value": amount_usd
                    },
                    "description": f"GlamStore Order {order.order_number}"
                }],
                "application_context": {
                    "brand_name": "GlamStore",
                    "return_url": settings.PAYPAL_RETURN_URL,
                    "cancel_url": settings.PAYPAL_CANCEL_URL
                }
            }

            response = requests.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
                json=payload,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            data = response.json()

            payment = Payment.objects.create(
                order=order,
                method='paypal',
                amount=order.total,
                currency='KES',
                gateway_response=data
            )

            PayPalTransaction.objects.create(
                payment=payment,
                paypal_order_id=data.get('id', ''),
                status=data.get('status', ''),
                raw_response=data
            )

            approval_link = next(
                (link['href'] for link in data.get('links', []) if link['rel'] == 'approve'),
                None
            )

            return Response({
                'paypal_order_id': data.get('id'),
                'approval_url': approval_link,
                'payment_id': str(payment.id)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=['post'])
    def capture(self, request):
        serializer = PayPalCaptureSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        paypal_order_id = serializer.validated_data['paypal_order_id']
        order_id = serializer.validated_data['order_id']

        try:
            access_token = get_paypal_access_token()
            response = requests.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{paypal_order_id}/capture",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }
            )
            data = response.json()

            tx = PayPalTransaction.objects.get(paypal_order_id=paypal_order_id)
            tx.status = data.get('status', '')
            tx.raw_response = data

            if data.get('status') == 'COMPLETED':
                capture = data['purchase_units'][0]['payments']['captures'][0]
                tx.capture_id = capture.get('id', '')
                payer = data.get('payer', {})
                tx.paypal_payer_id = payer.get('payer_id', '')
                tx.payer_email = payer.get('email_address', '')
                tx.payment.status = 'completed'
                tx.payment.reference = tx.capture_id
                tx.payment.order.payment_status = 'paid'
                tx.payment.order.status = 'confirmed'
                tx.payment.order.save()
                tx.payment.save()

            tx.save()

            return Response({'status': data.get('status'), 'message': 'Payment captured'})

        except Exception as e:
            return Response({'error': str(e)}, status=500)