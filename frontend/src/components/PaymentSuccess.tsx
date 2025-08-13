// PaymentSuccess.jsx - Component to handle Stripe payment success redirect
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, AlertCircle, GamepadIcon } from 'lucide-react';

// Helper function to get current language
const getCurrentLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'es', 'uk'];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

// API request function
const makeAPIRequest = async (url, options = {}) => {
  const language = getCurrentLanguage();
  const accessToken = localStorage.getItem('access_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-Language': language,
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const separator = url.includes('?') ? '&' : '?';
  const urlWithLang = `${url}${separator}lang=${language}`;

  try {
    const response = await fetch(urlWithLang, defaultOptions);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export function PaymentSuccess() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [paymentData, setPaymentData] = useState(null);
  const [reservationData, setReservationData] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    checkPaymentStatus();
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await makeAPIRequest(`/billing/payment-success/?session_id=${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setPaymentData(data);
        
        // If we have a reservation ID, fetch reservation details
        if (data.reservation_id) {
          fetchReservationDetails(data.reservation_id);
        }
        
        toast({
          title: "Payment Successful!",
          description: "Your reservation has been confirmed.",
        });
      } else {
        setStatus('error');
        toast({
          title: "Payment Issue",
          description: data.message || "There was an issue with your payment.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
      toast({
        title: "Error",
        description: "Failed to verify payment status.",
        variant: "destructive"
      });
    }
  };

  const fetchReservationDetails = async (reservationId) => {
    try {
      const response = await makeAPIRequest(`/api/reservations/${reservationId}/`);
      if (response.ok) {
        const data = await response.json();
        setReservationData(data);
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">Processing Payment...</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment with Stripe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Payment Error</h2>
            <p className="text-muted-foreground mb-6">
              There was an issue processing your payment. Please contact support if you were charged.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/games')} className="w-full">
                <GamepadIcon className="w-4 h-4 mr-2" />
                Browse Games
              </Button>
              <Button onClick={() => navigate('/reservations')} variant="outline" className="w-full">
                View My Reservations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="card-glow">
          <CardContent className="p-8 text-center">
            {/* Success Icon and Title */}
            <div className="text-6xl mb-6">🎉</div>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-orbitron font-bold text-green-600 mb-2">
              Payment Successful!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your reservation has been confirmed and payment processed.
            </p>

            {/* Reservation Details */}
            {reservationData && (
              <div className="bg-muted/50 p-6 rounded-lg mb-8 text-left">
                <h3 className="font-semibold text-lg mb-4 text-center">Booking Details</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono font-semibold">{reservationData.reference_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game:</span>
                    <span className="font-medium">{reservationData.game?.title || 'Game'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(reservationData.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{reservationData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Players:</span>
                    <span className="font-medium">{reservationData.players}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-semibold">Total Paid:</span>
                    <span className="font-bold text-green-600">€{reservationData.total_price}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-8">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✓ Payment confirmed via Stripe
                <br />
                ✓ Confirmation email sent
                <br />
                ✓ Reservation confirmed
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/reservations')}
                className="w-full btn-glow text-lg py-6"
              >
                View All My Reservations
              </Button>
              
              <Button
                onClick={() => navigate('/games')}
                variant="outline"
                className="w-full"
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                Book Another Game
              </Button>
              
              <p className="text-sm text-muted-foreground mt-6">
                Please arrive 15 minutes before your scheduled time.
                <br />
                Bring a valid ID for verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}