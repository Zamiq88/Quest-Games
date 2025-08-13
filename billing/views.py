from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.shortcuts import get_object_or_404
from games.models import Reservation
from billing.models import Invoice
from billing.models import Payment
from billing.utils import create_payment_gateway
from django.conf import settings
import stripe
import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator




class CreatePaymentURLApi(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        print('payment view called')
        try:
            reservation_id = request.data.get('reservation_id')
            print('idddddd',reservation_id)
            
            if not reservation_id:
                return Response({'error': 'Reservation ID is required'}, status=400)
            
            # Get reservation and ensure it belongs to the user
            reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
            
            # Check if reservation is in valid state for payment
            if reservation.status not in ['pending']:
                return Response({
                    'error': f'Reservation status "{reservation.status}" is not valid for payment'
                }, status=400)
            
            # Check if reservation already has a completed payment
            existing_invoice = Invoice.objects.filter(reservation=reservation).first()
            if existing_invoice:
                # Check if payment is already completed
                if existing_invoice.get_payment_status() == 'Completed':
                    return Response({'error': 'Payment already completed'}, status=400)
                
                # If pending payment exists, return existing payment URL
                existing_payment = existing_invoice.payments.filter(status='pending').first()
                if existing_payment and existing_payment.url:
                    return Response({
                        'payment_url': existing_payment.url,
                        'invoice_id': existing_invoice.invoice_id,
                        'payment_id': existing_payment.id
                    })
            
            # Create new invoice if none exists
            if not existing_invoice:
                invoice = Invoice.objects.create(
                    user=request.user,
                    reservation=reservation,
                    total=reservation.total_price,
                    callback_url=f'{settings.BASE_URL}/payment-success',
                    cancel_url=f'{settings.BASE_URL}/payment-cancelled'
                )
            else:
                invoice = existing_invoice
            
            # Create new payment
            payment = invoice.create_payment()
            
            # Generate payment URL
            payment_url = create_payment_gateway(payment)
            
            if payment_url:
                return Response({
                    'payment_url': payment_url,
                    'invoice_id': invoice.invoice_id,
                    'payment_id': payment.id,
                    'reservation_id': reservation.id
                })
            else:
                return Response({'error': 'Failed to create payment URL'}, status=400)
                
        except Exception as e:
            print(f"Error creating payment URL: {str(e)}")
            return Response({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    """
    Stripe webhook handler for secure payment processing
    This is the RECOMMENDED way to handle payment confirmations
    """
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            # Invalid payload
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            # Invalid signature
            return HttpResponse(status=400)
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self.handle_successful_payment(session)
            
        elif event['type'] == 'checkout.session.expired':
            session = event['data']['object']
            self.handle_expired_payment(session)
            
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            self.handle_failed_payment(payment_intent)
        
        return HttpResponse(status=200)
    
    def handle_successful_payment(self, session):
        """Handle successful payment"""
        try:
            # Find payment by Stripe session ID
            payment = Payment.objects.get(reference=session['id'])
            
            # Update payment status
            payment.status = 'completed'
            payment.paid_date = timezone.now().date()
            payment.details = session  # Store full Stripe data
            payment.save()
            
            # Update reservation status
            if payment.invoice.reservation:
                reservation = payment.invoice.reservation
                reservation.status = 'confirmed'
                reservation.save()
                
                # Send confirmation email (optional)
                # send_booking_confirmation_email(reservation)
                
            print(f"✅ Payment completed: {payment.id}")
            
        except Payment.DoesNotExist:
            print(f"❌ Payment not found for session: {session['id']}")
        except Exception as e:
            print(f"❌ Error processing payment: {str(e)}")
    
    def handle_expired_payment(self, session):
        """Handle expired/cancelled payment"""
        try:
            payment = Payment.objects.get(reference=session['id'])
            payment.status = 'timeout'
            payment.save()
            print(f"⏰ Payment expired: {payment.id}")
        except Payment.DoesNotExist:
            print(f"❌ Payment not found for expired session: {session['id']}")
    
    def handle_failed_payment(self, payment_intent):
        """Handle failed payment"""
        # Note: You might need to link payment_intent to your Payment model
        # This depends on your Stripe integration setup
        print(f"❌ Payment failed: {payment_intent['id']}")


# Simple success page redirect (for user experience only)
class PaymentSuccessView(APIView):
    """
    Simple redirect handler for user experience
    NOT for payment processing - that's done via webhook
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        session_id = request.GET.get('session_id')
        
        if session_id:
            try:
                # Just check if payment exists and redirect accordingly
                payment = Payment.objects.get(reference=session_id)
                
                return Response({
                    'status': 'success',
                    'message': 'Payment is being processed',
                    'reservation_id': payment.invoice.reservation.id if payment.invoice.reservation else None,
                    'redirect_url': '/reservations'  # Redirect to user's reservations
                })
                
            except Payment.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Payment session not found',
                    'redirect_url': '/games'
                }, status=404)
        
        return Response({
            'status': 'error',
            'message': 'Invalid payment session',
            'redirect_url': '/games'
        }, status=400)