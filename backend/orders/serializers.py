from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Address, Coupon
from products.serializers import ProductListSerializer


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'full_name', 'phone', 'address_line1', 'address_line2',
            'city', 'county', 'postal_code', 'country', 'is_default', 'created_at'
        ]
        read_only_fields = ['created_at']


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    unit_price = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_id', 'variant_id',
            'quantity', 'unit_price', 'subtotal'
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    item_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_slug',
            'variant_name', 'quantity', 'unit_price', 'subtotal', 'image_url'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)
    shipping_address_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status',
            'subtotal', 'shipping_cost', 'discount_amount', 'total',
            'coupon_code', 'notes', 'tracking_number',
            'shipping_address', 'shipping_address_id',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'order_number', 'subtotal', 'total', 'payment_status',
            'tracking_number', 'created_at', 'updated_at'
        ]


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    order_total = serializers.DecimalField(max_digits=10, decimal_places=2)


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type',
            'discount_value', 'minimum_order_amount',
            'maximum_discount_amount', 'valid_from', 'valid_until'
        ]