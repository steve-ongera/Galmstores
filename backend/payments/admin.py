from django.contrib import admin
from django.utils.html import format_html
from .models import Payment, MpesaTransaction, PayPalTransaction


# ─── PAYMENT ───────────────────────────────────────────────────────────────────

class MpesaTransactionInline(admin.StackedInline):
    model = MpesaTransaction
    extra = 0
    readonly_fields = ('merchant_request_id', 'checkout_request_id', 'mpesa_receipt_number',
                       'transaction_date', 'result_code', 'result_description',
                       'raw_callback', 'created_at', 'updated_at')
    can_delete = False


class PayPalTransactionInline(admin.StackedInline):
    model = PayPalTransaction
    extra = 0
    readonly_fields = ('paypal_order_id', 'paypal_payer_id', 'paypal_payment_id',
                       'capture_id', 'payer_email', 'status', 'raw_response',
                       'created_at', 'updated_at')
    can_delete = False


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'method', 'colored_status', 'amount', 'currency', 'reference', 'created_at')
    list_filter = ('method', 'status', 'currency', 'created_at')
    search_fields = ('reference', 'order__order_number')
    readonly_fields = ('id', 'created_at', 'updated_at', 'gateway_response')
    ordering = ('-created_at',)
    inlines = [MpesaTransactionInline, PayPalTransactionInline]

    def colored_status(self, obj):
        colors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'completed': '#10b981',
            'failed': '#ef4444',
            'cancelled': '#6b7280',
            'refunded': '#8b5cf6',
        }
        color = colors.get(obj.status, '#000')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_status_display())
    colored_status.short_description = 'Status'


@admin.register(MpesaTransaction)
class MpesaTransactionAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'mpesa_receipt_number', 'result_code', 'transaction_date', 'created_at')
    list_filter = ('result_code', 'created_at')
    search_fields = ('phone_number', 'mpesa_receipt_number', 'merchant_request_id', 'checkout_request_id')
    readonly_fields = ('merchant_request_id', 'checkout_request_id', 'mpesa_receipt_number',
                       'transaction_date', 'raw_callback', 'created_at', 'updated_at')


@admin.register(PayPalTransaction)
class PayPalTransactionAdmin(admin.ModelAdmin):
    list_display = ('paypal_order_id', 'payer_email', 'status', 'capture_id', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('paypal_order_id', 'paypal_payer_id', 'paypal_payment_id', 'payer_email', 'capture_id')
    readonly_fields = ('paypal_order_id', 'paypal_payer_id', 'paypal_payment_id',
                       'capture_id', 'raw_response', 'created_at', 'updated_at')