from django.conf import settings
import stripe
import logging

logger = logging.getLogger(__name__)

class Stripe:
    def __init__(self):
        if settings.STRIPE_LIVE_MODE:
            self.__stripe_public_key = settings.STRIPE_LIVE_PUBLIC_KEY
            self.__stripe_secret_key = settings.STRIPE_LIVE_SECRET_KEY
        else:
            self.__stripe_public_key = settings.STRIPE_TEST_PUBLIC_KEY
            self.__stripe_secret_key = settings.STRIPE_TEST_SECRET_KEY
        self.__domain = f"{settings.BASE_URL}"
        self.__payment_url = ''
        self.__reference = ''
    
    def transaction(self, amount, currency, customer_email, reservation_description, payment_id=None):
        stripe.api_key = self.__stripe_secret_key
        
        # Create metadata to link back to your payment
        metadata = {}
        if payment_id:
            metadata['payment_id'] = str(payment_id)
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': currency,
                        'unit_amount': int(float(amount) * 100),
                        'product_data': {
                            'name': reservation_description,
                        },
                    },
                    'quantity': 1,
                },
            ],
            customer_email=customer_email,
            mode='payment',
            # Success URL just shows success message - webhook handles processing
            success_url=self.__domain + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=self.__domain + '/payment-cancelled',
            metadata=metadata,  # Add metadata for webhook processing
        )
        
        self.__reference = checkout_session.id
        self.__payment_url = checkout_session.url
    
    def get_payment_url(self):
        return self.__payment_url
    
    def get_reference(self):
        return self.__reference
    
    def check_status(self, session_id):
        """
        This method is still useful for manual status checks
        But primary processing should be via webhook
        """
        stripe.api_key = self.__stripe_secret_key
        result = stripe.checkout.Session.retrieve(session_id)
        return result.payment_status == 'paid'