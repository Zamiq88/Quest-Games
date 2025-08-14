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
    




def create_payment_gateway(payment):
    """Create payment gateway for reservation payment"""
    if payment.payment_type == 'online':
        # FIXED: Use reservation data instead of non-existent product
        reservation = payment.invoice.reservation
        language = reservation.language
        game_title = reservation.game.title[language] if reservation and reservation.game else "Game Reservation"
        
        data = {
            'invoice_id': payment.invoice.invoice_id,
            'user_id': payment.invoice.user.id if payment.invoice.user else None,
            'email': payment.invoice.user.email if payment.invoice.user else "guest@example.com",
            'callback_url': payment.invoice.callback_url,
            'reservation_description': f"{game_title} - {reservation.date} at {reservation.time}"  # ✅ Fixed
        }
        
        gateway = PaymentGateway(
            payment.currency,
            payment.amount,
            data,
            payment.payment_gateway
        )
        
        # Set callback URL
        callback_url = f'{settings.BASE_URL}/billing/payment-result/{payment.invoice.pk}'
        gateway.set_callback_url(callback_url)
        
        # Process payment
        gateway.proceed_stripe()
        
        # Update payment with reference
        payment.reference = gateway.get_reference()
        payment.payment_gateway = gateway.get_payment_gateway()
        payment.url = gateway.get_payment_url()  # ✅ Store payment URL
        
        # Update invoice payment method
        if payment.payment_gateway:
            payment.invoice.payment_method = payment.payment_gateway
            payment.invoice.save()
        
        payment.save()
        
        return gateway.get_payment_url()
    
    return None