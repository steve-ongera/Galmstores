from rest_framework import serializers
from ..products.models import Payment, MpesaTransaction, PayPalTransaction


class MpesaSTKPushSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    order_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class MpesaCallbackSerializer(serializers.Serializer):
    Body = serializers.DictField()


class PayPalCreateOrderSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()


class PayPalCaptureSerializer(serializers.Serializer):
    paypal_order_id = serializers.CharField()
    order_id = serializers.UUIDField()


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'method', 'status', 'amount',
            'currency', 'reference', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'reference', 'created_at', 'updated_at']


class MpesaTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MpesaTransaction
        fields = [
            'id', 'phone_number', 'merchant_request_id',
            'checkout_request_id', 'mpesa_receipt_number',
            'transaction_date', 'result_code', 'result_description',
            'created_at'
        ]


class PayPalTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayPalTransaction
        fields = [
            'id', 'paypal_order_id', 'paypal_payer_id',
            'capture_id', 'payer_email', 'status', 'created_at'
        ]