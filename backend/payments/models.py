from django.db import models
import uuid


class Payment(models.Model):
    METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('paypal', 'PayPal'),
        ('card', 'Credit/Debit Card'),
        ('cod', 'Cash on Delivery'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='KES')
    reference = models.CharField(max_length=200, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.method} - {self.amount} - {self.status}"


class MpesaTransaction(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='mpesa')
    phone_number = models.CharField(max_length=15)
    merchant_request_id = models.CharField(max_length=200, blank=True)
    checkout_request_id = models.CharField(max_length=200, blank=True)
    mpesa_receipt_number = models.CharField(max_length=100, blank=True)
    transaction_date = models.CharField(max_length=50, blank=True)
    result_code = models.CharField(max_length=10, blank=True)
    result_description = models.TextField(blank=True)
    raw_callback = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MPesa: {self.phone_number} - {self.mpesa_receipt_number}"


class PayPalTransaction(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='paypal')
    paypal_order_id = models.CharField(max_length=200, blank=True)
    paypal_payer_id = models.CharField(max_length=200, blank=True)
    paypal_payment_id = models.CharField(max_length=200, blank=True)
    capture_id = models.CharField(max_length=200, blank=True)
    payer_email = models.EmailField(blank=True)
    status = models.CharField(max_length=50, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PayPal: {self.paypal_order_id} - {self.status}"