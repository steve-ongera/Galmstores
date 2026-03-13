from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MpesaViewSet, PayPalViewSet

router = DefaultRouter()
router.register('mpesa', MpesaViewSet, basename='mpesa')
router.register('paypal', PayPalViewSet, basename='paypal')

urlpatterns = [
    path('', include(router.urls)),
]