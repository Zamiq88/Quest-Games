from rest_framework.views import APIView


class CreatePaymentURLApi(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            plan_type = request.data.get('selectedPlan')
            
            if not plan_type or plan_type not in ['premium', 'pro']:
                return Response({'error': 'Invalid plan type'}, status=400)
            
            product, _ = Product.objects.get_or_create(title=plan_type)
            
            # Get or create user subscription
            subscription, created = UserSubscription.objects.get_or_create(user=request.user)
            
            # Create invoice
            invoice = Invoice.objects.create(
                user=request.user,
                product=product,
                total=product.price,
                subscription=subscription,
                invoice_type='subscription'
            )
            
            # Create payment
            payment = invoice.create_payment()
            
            # Create Stripe checkout session for subscription
            payment_url = create_subscription_payment_gateway(payment)
            
            return Response({'payment_url': payment_url})
            
        except Exception as e:
            logger.error(f"Error creating payment URL: {str(e)}")
            return Response({'error': str(e)}, status=400)
