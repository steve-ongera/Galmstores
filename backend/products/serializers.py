from rest_framework import serializers
from .models import (
    Category, SubCategory, Brand, Product, ProductImage,
    ProductVariant, ProductReview, SkincareProduct, HairProduct,
    EarringProduct, StickonProduct, HandbagProduct, Wishlist,
    WishlistItem, Banner, FlashSale
)


class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active']


class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'category_type', 'description',
            'image', 'is_active', 'meta_title', 'meta_description',
            'subcategories', 'product_count'
        ]

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'value', 'slug', 'price_modifier', 'stock', 'sku', 'image']


class SkincareDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkincareProduct
        exclude = ['id', 'product', 'created_at', 'updated_at']


class HairDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HairProduct
        exclude = ['id', 'product', 'created_at', 'updated_at']


class EarringDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EarringProduct
        exclude = ['id', 'product', 'created_at', 'updated_at']


class StickonDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = StickonProduct
        exclude = ['id', 'product', 'created_at', 'updated_at']


class HandbagDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = HandbagProduct
        exclude = ['id', 'product', 'created_at', 'updated_at']


class ProductReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = [
            'id', 'username', 'avatar', 'rating', 'title', 'body',
            'is_verified_purchase', 'helpful_count', 'created_at'
        ]
        read_only_fields = ['is_verified_purchase', 'helpful_count']

    def get_avatar(self, obj):
        return None  # Extend with profile avatar later


class ProductListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'short_description',
            'price', 'compare_at_price', 'discount_percentage',
            'is_in_stock', 'stock', 'is_featured', 'is_bestseller',
            'is_new_arrival', 'average_rating', 'total_reviews',
            'total_sold', 'primary_image', 'category_name', 'category_slug',
            'created_at'
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
            return img.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True, source='reviews')
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    skincare_details = SkincareDetailSerializer(read_only=True)
    hair_details = HairDetailSerializer(read_only=True)
    earring_details = EarringDetailSerializer(read_only=True)
    stickon_details = StickonDetailSerializer(read_only=True)
    handbag_details = HandbagDetailSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'description', 'short_description',
            'price', 'compare_at_price', 'discount_percentage', 'cost_price',
            'stock', 'is_in_stock', 'is_active', 'is_featured', 'is_bestseller',
            'is_new_arrival', 'weight', 'meta_title', 'meta_description',
            'average_rating', 'total_reviews', 'total_sold',
            'images', 'variants', 'category', 'brand', 'reviews',
            'skincare_details', 'hair_details', 'earring_details',
            'stickon_details', 'handbag_details', 'created_at', 'updated_at'
        ]


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'link_url', 'order']


class FlashSaleSerializer(serializers.ModelSerializer):
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = FlashSale
        fields = [
            'id', 'title', 'slug', 'discount_percentage',
            'start_time', 'end_time', 'products', 'is_active'
        ]


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'created_at']

    def create(self, validated_data):
        wishlist = self.context['wishlist']
        return WishlistItem.objects.create(wishlist=wishlist, **validated_data)


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'total_items']

    def get_total_items(self, obj):
        return obj.items.count()