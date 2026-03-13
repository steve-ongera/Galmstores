from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AddressViewSet, CartViewSet, OrderViewSet, CouponViewSet

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='address')
router.register('cart', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')
router.register('coupons', CouponViewSet, basename='coupon')

urlpatterns = [
    path('', include(router.urls)),
]