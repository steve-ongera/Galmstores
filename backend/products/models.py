from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# ─── CATEGORIES ────────────────────────────────────────────────────────────────

class Category(TimeStampedModel):
    CATEGORY_CHOICES = [
        ('skincare', 'Skin Care'),
        ('hair', 'Human Hair'),
        ('earrings', 'Earrings'),
        ('stickons', 'Stick-Ons'),
        ('handbags', 'Handbags'),
    ]
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SubCategory(TimeStampedModel):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='subcategories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Sub Categories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.category.name}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} > {self.name}"


# ─── BRAND ─────────────────────────────────────────────────────────────────────

class Brand(TimeStampedModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ─── PRODUCT ───────────────────────────────────────────────────────────────────

class Product(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, max_length=300)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='Weight in grams')
    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)
    total_sold = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['is_featured', 'is_active']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if not self.sku:
            self.sku = f"GS-{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def discount_percentage(self):
        if self.compare_at_price and self.compare_at_price > self.price:
            return int(((self.compare_at_price - self.price) / self.compare_at_price) * 100)
        return 0

    @property
    def is_in_stock(self):
        return self.stock > 0

    def __str__(self):
        return self.name


class ProductImage(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class ProductVariant(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)  # e.g. "Size", "Color", "Length"
    value = models.CharField(max_length=100)  # e.g. "Large", "Pink", "18 inch"
    slug = models.SlugField(blank=True)
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='variants/', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.name}-{self.value}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"


# ─── SKINCARE SPECIFIC ─────────────────────────────────────────────────────────

class SkincareProduct(TimeStampedModel):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='skincare_details')
    skin_type = models.CharField(max_length=100, blank=True)  # oily, dry, combination, all
    key_ingredients = models.TextField(blank=True)
    how_to_use = models.TextField(blank=True)
    volume_ml = models.PositiveIntegerField(null=True, blank=True)
    spf = models.PositiveIntegerField(null=True, blank=True)
    is_vegan = models.BooleanField(default=False)
    is_cruelty_free = models.BooleanField(default=False)
    is_fragrance_free = models.BooleanField(default=False)
    expiry_months = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"Skincare: {self.product.name}"


# ─── HAIR SPECIFIC ─────────────────────────────────────────────────────────────

class HairProduct(TimeStampedModel):
    HAIR_TEXTURE_CHOICES = [
        ('straight', 'Straight'),
        ('wavy', 'Wavy'),
        ('curly', 'Curly'),
        ('coily', 'Coily'),
        ('kinky', 'Kinky'),
    ]
    HAIR_TYPE_CHOICES = [
        ('virgin', 'Virgin Hair'),
        ('remy', 'Remy Hair'),
        ('non_remy', 'Non-Remy Hair'),
        ('synthetic', 'Synthetic'),
    ]
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='hair_details')
    hair_type = models.CharField(max_length=20, choices=HAIR_TYPE_CHOICES)
    texture = models.CharField(max_length=20, choices=HAIR_TEXTURE_CHOICES)
    length_inches = models.PositiveIntegerField(null=True, blank=True)
    color = models.CharField(max_length=100, blank=True)
    origin = models.CharField(max_length=100, blank=True)  # Brazilian, Peruvian etc
    density = models.CharField(max_length=50, blank=True)  # 150%, 180%
    can_be_dyed = models.BooleanField(default=True)
    can_be_bleached = models.BooleanField(default=False)
    lifespan_years = models.PositiveIntegerField(null=True, blank=True)
    weft_type = models.CharField(max_length=100, blank=True)  # machine, hand-tied

    def __str__(self):
        return f"Hair: {self.product.name}"


# ─── EARRINGS SPECIFIC ─────────────────────────────────────────────────────────

class EarringProduct(TimeStampedModel):
    EARRING_TYPE_CHOICES = [
        ('studs', 'Studs'),
        ('hoops', 'Hoops'),
        ('drop', 'Drop'),
        ('chandelier', 'Chandelier'),
        ('huggie', 'Huggie'),
        ('threader', 'Threader'),
        ('ear_cuff', 'Ear Cuff'),
        ('clip_on', 'Clip-On'),
    ]
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='earring_details')
    earring_type = models.CharField(max_length=20, choices=EARRING_TYPE_CHOICES)
    material = models.CharField(max_length=100, blank=True)  # Gold-plated, Silver, Stainless
    gemstone = models.CharField(max_length=100, blank=True)
    length_mm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    width_mm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_hypoallergenic = models.BooleanField(default=False)
    is_waterproof = models.BooleanField(default=False)
    closure_type = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Earring: {self.product.name}"


# ─── STICK-ONS SPECIFIC ────────────────────────────────────────────────────────

class StickonProduct(TimeStampedModel):
    STICKON_TYPE_CHOICES = [
        ('nail_art', 'Nail Art'),
        ('body_sticker', 'Body Sticker'),
        ('face_jewel', 'Face Jewel'),
        ('tattoo', 'Temporary Tattoo'),
        ('rhinestone', 'Rhinestone'),
        ('hair_sticker', 'Hair Sticker'),
    ]
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='stickon_details')
    stickon_type = models.CharField(max_length=20, choices=STICKON_TYPE_CHOICES)
    pieces_per_pack = models.PositiveIntegerField(default=1)
    application_area = models.CharField(max_length=100, blank=True)
    duration_hours = models.PositiveIntegerField(null=True, blank=True)
    is_reusable = models.BooleanField(default=False)
    is_waterproof = models.BooleanField(default=False)
    design_theme = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Stick-on: {self.product.name}"


# ─── HANDBAG SPECIFIC ──────────────────────────────────────────────────────────

class HandbagProduct(TimeStampedModel):
    BAG_TYPE_CHOICES = [
        ('tote', 'Tote Bag'),
        ('clutch', 'Clutch'),
        ('crossbody', 'Crossbody'),
        ('shoulder', 'Shoulder Bag'),
        ('backpack', 'Backpack'),
        ('satchel', 'Satchel'),
        ('bucket', 'Bucket Bag'),
        ('mini', 'Mini Bag'),
        ('evening', 'Evening Bag'),
    ]
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='handbag_details')
    bag_type = models.CharField(max_length=20, choices=BAG_TYPE_CHOICES)
    material = models.CharField(max_length=100, blank=True)  # PU leather, genuine leather
    color = models.CharField(max_length=100, blank=True)
    lining_material = models.CharField(max_length=100, blank=True)
    closure_type = models.CharField(max_length=100, blank=True)  # zipper, magnetic
    number_of_pockets = models.PositiveIntegerField(default=1)
    strap_type = models.CharField(max_length=100, blank=True)
    strap_length_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    width_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    depth_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_waterproof = models.BooleanField(default=False)

    def __str__(self):
        return f"Handbag: {self.product.name}"


# ─── REVIEWS ───────────────────────────────────────────────────────────────────

class ProductReview(TimeStampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()  # 1–5
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    helpful_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}★)"


# ─── WISHLIST ──────────────────────────────────────────────────────────────────

class Wishlist(TimeStampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')

    def __str__(self):
        return f"Wishlist: {self.user.username}"


class WishlistItem(TimeStampedModel):
    wishlist = models.ForeignKey(Wishlist, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('wishlist', 'product')

    def __str__(self):
        return f"{self.wishlist.user.username} - {self.product.name}"


# ─── FLASH SALE / BANNER ───────────────────────────────────────────────────────

class Banner(TimeStampedModel):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    image = models.ImageField(upload_to='banners/')
    link_url = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class FlashSale(TimeStampedModel):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    discount_percentage = models.PositiveIntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    products = models.ManyToManyField(Product, related_name='flash_sales', blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title