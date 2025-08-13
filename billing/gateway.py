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

 


    def proceed_stripe(self):
        stripe = Stripe()
        stripe.transaction(self.__amount,
                           self.__currency,
                           self.__data.get('email'),
                           self.__data.get('packet_name'),
                           )

        self.__reference = stripe.get_reference()
        self.__payment_url = stripe.get_payment_url()
        self.__payment_gateway = 'stripe'

 

    def get_reference(self):
        return self.__reference

    def get_payment_url(self):
        return self.__payment_url

    def set_ip_address(self, ip):
        self._ip_address = ip

    def set_callback_url(self, url):
        self.__callback_url = url

    def set_env(self, env):
        self.__env = env

    def get_payment_gateway(self):
        return self.__payment_gateway