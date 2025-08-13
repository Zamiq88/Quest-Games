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
        

    def transaction(self, amount, currency, customer_email, reservation):
        stripe.api_key = self.__stripe_secret_key
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': currency,
                        'unit_amount': int(float(amount) * 100),
                        'product_data': {
                            'name': reservation,
                            'images': None,
                        },
                    },
                    'quantity': 1,
                },
            ],
            customer_email=customer_email,
            mode='payment',
            success_url=self.__domain + '/billing/callback?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=settings.BASE_URL,
        )
        self.__reference = checkout_session.id
        self.__payment_url = checkout_session.url

    def get_payment_url(self):
        return self.__payment_url

    def get_reference(self):
        return self.__reference

    def check_status(self, session_id):
        stripe.api_key = self.__stripe_secret_key
        result = stripe.checkout.Session.retrieve(session_id)
        if result.payment_status == 'paid':
            return True
        else:
            return False