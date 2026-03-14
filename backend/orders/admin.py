# products/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, SubCategory, Brand, Product, ProductImage,
    ProductVariant, SkincareProduct, HairProduct, EarringProduct,
    StickonProduct, HandbagProduct, ProductReview, Wishlist,
    WishlistItem, Banner, FlashSale,
)


# ─── CATEGORIES ────────────────────────────────────────────────────────────────

class SubCategoryInline(admin.TabularInline):
    model = SubCategory
    extra = 1
    fields = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category_type', 'is_active', 'created_at')
    list_filter = ('category_type', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SubCategoryInline]


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


# ─── BRAND ─────────────────────────────────────────────────────────────────────

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


# ─── PRODUCT ───────────────────────────────────────────────────────────────────

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('name', 'value', 'price_modifier', 'stock', 'sku')


class SkincareProductInline(admin.StackedInline):
    model = SkincareProduct
    extra = 0
    can_delete = False


class HairProductInline(admin.StackedInline):
    model = HairProduct
    extra = 0
    can_delete = False


class EarringProductInline(admin.StackedInline):
    model = EarringProduct
    extra = 0
    can_delete = False


class StickonProductInline(admin.StackedInline):
    model = StickonProduct
    extra = 0
    can_delete = False


class HandbagProductInline(admin.StackedInline):
    model = HandbagProduct
    extra = 0
    can_delete = False


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'is_active', 'is_featured',
                    'is_bestseller', 'average_rating', 'total_sold', 'created_at')
    list_filter = ('category', 'is_active', 'is_featured', 'is_bestseller', 'is_new_arrival')
    search_fields = ('name', 'sku', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('id', 'sku', 'average_rating', 'total_reviews', 'total_sold', 'created_at', 'updated_at')
    list_editable = ('is_active', 'is_featured', 'price', 'stock')
    ordering = ('-created_at',)
    inlines = [
        ProductImageInline,
        ProductVariantInline,
        SkincareProductInline,
        HairProductInline,
        EarringProductInline,
        StickonProductInline,
        HandbagProductInline,
    ]
    fieldsets = (
        ('Core Info', {
            'fields': ('id', 'name', 'slug', 'sku', 'category', 'subcategory', 'brand',
                       'description', 'short_description')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'compare_at_price', 'cost_price', 'stock', 'weight')
        }),
        ('Flags', {
            'fields': ('is_active', 'is_featured', 'is_bestseller', 'is_new_arrival')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Stats', {
            'fields': ('average_rating', 'total_reviews', 'total_sold'),
            'classes': ('collapse',)
        }),
    )


# ─── REVIEWS ───────────────────────────────────────────────────────────────────

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'title', 'is_verified_purchase', 'is_approved', 'created_at')
    list_filter = ('rating', 'is_verified_purchase', 'is_approved')
    search_fields = ('product__name', 'user__username', 'title')
    list_editable = ('is_approved',)
    readonly_fields = ('helpful_count', 'created_at', 'updated_at')


# ─── WISHLIST ──────────────────────────────────────────────────────────────────

class WishlistItemInline(admin.TabularInline):
    model = WishlistItem
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username',)
    inlines = [WishlistItemInline]


# ─── BANNER & FLASH SALE ───────────────────────────────────────────────────────

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'order', 'created_at')
    list_editable = ('is_active', 'order')


@admin.register(FlashSale)
class FlashSaleAdmin(admin.ModelAdmin):
    list_display = ('title', 'discount_percentage', 'start_time', 'end_time', 'is_active')
    list_filter = ('is_active',)
    filter_horizontal = ('products',)
    prepopulated_fields = {'slug': ('title',)}