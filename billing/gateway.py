from django.conf import settings
from billing.service import Stripe


class PaymentGateway:
    _ip_address = '127.0.0.1'
    
    def __init__(self, currency, amount, data, gateway):
        self.__currency = currency
        self.__amount = amount
        self.__data = data
        self.__gateway = gateway
        self.__payment_gateway = ''
        self.__callback_url = ''
        self.__payment_url = ''
        self.__reference = ''
    
    def proceed_stripe(self, payment_id=None):
        stripe_handler = Stripe()
        stripe_handler.transaction(
            self.__amount,
            self.__currency,
            self.__data.get('email'),
            self.__data.get('reservation_description'),
            payment_id=payment_id  # Pass payment ID for webhook tracking
        )
        
        self.__reference = stripe_handler.get_reference()
        self.__payment_url = stripe_handler.get_payment_url()
        self.__payment_gateway = 'stripe'
    
    def get_reference(self):
        return self.__reference
    
    def get_payment_url(self):
        return self.__payment_url
    
    def get_payment_gateway(self):
        return self.__payment_gateway