import billing.models
from django.conf import settings
from billing.gateway import PaymentGateway

def check_invoice_id(invoice_id):
    if not billing.models.Invoice.objects.filter(invoice_id=invoice_id).exists():
        return invoice_id
    else:
        new_invoice_id = int(invoice_id) + 1
        if invoice_id.startswith('0'):
            new_invoice_id = f"{0}{int(invoice_id)+1}"
        return check_invoice_id(new_invoice_id)
    




def create_subscription_payment_gateway(payment):
    """Create subscription payment gateway (modified from your existing function)"""
    if payment.payment_type == 'online':
        data = {
            'invoice_id': payment.invoice.invoice_id,
            'user_id': payment.invoice.user.id,
            'email': payment.invoice.user.email,
            'callback_url': payment.invoice.callback_url,
            'packet_name': payment.invoice.product.product_display()
        }
        
        gateway = PaymentGateway(
            payment.currency, 
            payment.amount, 
            data,
            payment.payment_gateway,
            subscription_mode=True  # New parameter
        )
        
        gateway.set_callback_url(f'{settings.BASE_URL}/billing/payment-result/{payment.invoice.pk}')
        gateway.proceed_stripe()
        
        payment.reference = gateway.get_reference()
        payment.payment_gateway = gateway.get_payment_gateway()
        
        if payment.payment_gateway:
            payment.invoice.payment_method = payment.payment_gateway
            payment.invoice.save()
        
        payment.save()
        
        return gateway.get_payment_url()