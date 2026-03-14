# orders/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Address, Cart, CartItem, Order, OrderItem, Coupon


# ─── ADDRESS ───────────────────────────────────────────────────────────────────

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'city', 'country', 'is_default', 'created_at')
    list_filter = ('country', 'is_default')
    search_fields = ('full_name', 'user__username', 'city', 'phone')


# ─── CART ──────────────────────────────────────────────────────────────────────

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('unit_price', 'subtotal', 'added_at')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'item_count', 'total', 'created_at')
    search_fields = ('user__username', 'session_key')
    readonly_fields = ('id', 'total', 'item_count', 'created_at', 'updated_at')
    inlines = [CartItemInline]


# ─── ORDER ─────────────────────────────────────────────────────────────────────

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'variant_name', 'unit_price', 'subtotal', 'image_url')
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'colored_status', 'payment_status',
                    'total', 'tracking_number', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__username', 'tracking_number', 'coupon_code')
    readonly_fields = ('id', 'order_number', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Info', {
            'fields': ('id', 'order_number', 'user', 'shipping_address', 'notes')
        }),
        ('Status', {
            'fields': ('status', 'payment_status', 'tracking_number')
        }),
        ('Financials', {
            'fields': ('subtotal', 'shipping_cost', 'discount_amount', 'total', 'coupon_code')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def colored_status(self, obj):
        colors = {
            'pending': '#f59e0b',
            'confirmed': '#3b82f6',
            'processing': '#6366f1',
            'shipped': '#0ea5e9',
            'delivered': '#10b981',
            'cancelled': '#ef4444',
            'refunded': '#8b5cf6',
        }
        color = colors.get(obj.status, '#000')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_status_display())
    colored_status.short_description = 'Status'


# ─── COUPON ────────────────────────────────────────────────────────────────────

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'used_count',
                    'usage_limit', 'valid_from', 'valid_until', 'is_active')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code',)
    list_editable = ('is_active',)
    readonly_fields = ('used_count', 'created_at')
    prepopulated_fields = {'slug': ('code',)}