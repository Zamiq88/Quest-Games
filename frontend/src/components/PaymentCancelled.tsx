// PaymentCancelled.jsx - Component for when user cancels payment
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, GamepadIcon } from 'lucide-react';

export function PaymentCancelled() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="card-glow">
          <CardContent className="p-8 text-center">
            {/* Cancelled Icon and Title */}
            <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-orbitron font-bold text-orange-600 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your payment was cancelled. No charges were made to your account.
            </p>

            {/* Information Box */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-lg mb-3">What happens next?</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Your reservation was created but is pending payment</p>
                <p>• You can try the payment process again anytime</p>
                <p>• Unpaid reservations will be automatically cancelled after 24 hours</p>
                <p>• No charges were made to your payment method</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/reservations')}
                className="w-full btn-glow text-lg py-6"
              >
                View My Reservations & Complete Payment
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                <Button
                  onClick={() => navigate('/games')}
                  variant="outline"
                  className="w-full"
                >
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  Browse Games
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                Need help? Contact our support team if you're experiencing issues with payment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}