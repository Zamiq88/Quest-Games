from django.urls import path
from billing.views import CreatePaymentURLApi
from billing.views import StripeWebhookView
from billing.views import PaymentSuccessView
from django.views.generic.base import TemplateView

app_name='billing'


urlpatterns = [
    # API endpoints
    path('create-payment/', CreatePaymentURLApi.as_view(), name='create_payment'),
    
    # Stripe webhook (CRITICAL for payment processing)
    path('webhooks/stripe/', StripeWebhookView.as_view(), name='stripe_webhook'),
    
    # User-facing redirects (for UX only)
    path('payment-success/', PaymentSuccessView.as_view(), name='payment_success'),
    path('payment-cancelled/', TemplateView.as_view(template_name='payment_cancelled.html'), name='payment_cancelled'),
]