// Updated Reservations.jsx with disclaimer checkbox
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BookingData, TimeSlot } from '@/types/game';
import { Calendar as CalendarIcon, Clock, Users, Mail, ArrowLeft, Check, User, GamepadIcon, Info, AlertTriangle } from 'lucide-react';

// JWT Token Management
const JWT_STORAGE = {
  setTokens: (tokens) => {
    if (tokens.access) {
      localStorage.setItem('access_token', tokens.access);
    }
    if (tokens.refresh) {
      localStorage.setItem('refresh_token', tokens.refresh);
    }
  },
  
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },
  
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },
  
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};

// CSRF Hook
const useCsrf = () => {
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCsrfTokenFromCookie = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/csrf-token/', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } else {
        const cookieToken = getCsrfTokenFromCookie();
        setCsrfToken(cookieToken);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      const cookieToken = getCsrfTokenFromCookie();
      setCsrfToken(cookieToken);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cookieToken = getCsrfTokenFromCookie();
    if (cookieToken) {
      setCsrfToken(cookieToken);
      setLoading(false);
    } else {
      fetchCsrfToken();
    }
  }, []);

  return { csrfToken, loading, refetch: fetchCsrfToken };
};

// Helper function to get current language from localStorage or i18n
const getCurrentLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'es', 'uk'];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

// Enhanced API request function with CSRF and JWT support
const makeAPIRequest = async (url, options = {}, csrfToken = null) => {
  const language = getCurrentLanguage();
  const accessToken = JWT_STORAGE.getAccessToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'X-Language': language,
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      ...(csrfToken && options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase()) ? {
        'X-CSRFToken': csrfToken
      } : {}),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const separator = url.includes('?') ? '&' : '?';
  const urlWithLang = `${url}${separator}lang=${language}`;

  console.log(`Making API request to: ${urlWithLang} with language: ${language}, CSRF: ${csrfToken ? 'present' : 'missing'}, JWT: ${accessToken ? 'present' : 'missing'}`);
  
  try {
    const response = await fetch(urlWithLang, defaultOptions);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper function to format date consistently
const formatDateForAPI = (date) => {
  if (!date) return null;
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Helper function to get current date properly
const getToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// Helper function to format date for display
const formatDateForDisplay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export function Reservations() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { csrfToken, loading: csrfLoading, refetch: refetchCsrf } = useCsrf();
  
  const gameId = searchParams.get('game');
  
  const [game, setGame] = useState(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState(null);
  const [userReservations, setUserReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    gameId: gameId || '',
    players: 2,
    totalPrice: 0,
    firstName: '',
    lastName: '',
    email: '',
    otpSent: false,
    emailVerified: false,
    otp: '',
    disclaimerAccepted: false
  });

  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('Language changed to:', i18n.language);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const fetchUserReservations = async () => {
    setReservationsLoading(true);
    try {
      const response = await makeAPIRequest('/api/reservations/', {}, csrfToken);
      
      if (response.ok) {
        const data = await response.json();
        setUserReservations(data);
      } else if (response.status === 401) {
        setUserReservations([]);
      } else {
        console.error('Failed to fetch reservations');
        setUserReservations([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setUserReservations([]);
    }
    setReservationsLoading(false);
  };

  useEffect(() => {
    if (!csrfLoading) {
      fetchUserReservations();
    }
  }, [csrfLoading, csrfToken]);

  useEffect(() => {
    if (gameId && !csrfLoading) {
      setGameLoading(true);
      makeAPIRequest(`/api/games/${gameId}/`, {}, csrfToken)
        .then(response => {
          if (!response.ok) {
            throw new Error('Game not found');
          }
          return response.json();
        })
        .then(data => {
          setGame(data);
          setGameError(null);
        })
        .catch(error => {
          console.error('Failed to fetch game:', error);
          setGameError(error.message);
          setGame(null);
        })
        .finally(() => {
          setGameLoading(false);
        });
    } else if (!gameId) {
      setGameLoading(false);
    }
  }, [gameId, csrfLoading, csrfToken]);

  useEffect(() => {
    if (game && bookingData.players) {
      const totalPrice = game.price * (game.category === 'team' ? 1 : bookingData.players);
      setBookingData(prev => ({ ...prev, totalPrice }));
    }
  }, [game, bookingData.players]);

  const fetchAvailableTimes = async (selectedDate) => {
    if (!selectedDate || !gameId) return;

    setLoading(true);
    setAvailabilityInfo(null);
    
    try {
      const dateStr = formatDateForAPI(selectedDate);
      console.log('Fetching times for date:', dateStr, 'Original date:', selectedDate);
      
      const response = await makeAPIRequest(`/api/games/available-times/?game_id=${gameId}&date=${dateStr}`, {}, csrfToken);
      const data = await response.json();
      
      if (response.ok) {
        setTimeSlots(data.time_slots);
      } else {
        if (data.error && data.error.includes('Game available from')) {
          setAvailabilityInfo({
            type: 'info',
            message: data.error
          });
        } else if (data.error === 'Cannot book for past dates') {
          setAvailabilityInfo({
            type: 'warning',
            message: 'Cannot book for past dates'
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to load available times",
            variant: "destructive"
          });
        }
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available times:', error);
      toast({
        title: "Error",
        description: "Failed to load available times",
        variant: "destructive"
      });
      setTimeSlots([]);
    }
    setLoading(false);
  };

  const handleDateSelect = (date) => {
    console.log('Date selected:', date, 'Formatted:', formatDateForAPI(date));
    setBookingData(prev => ({ ...prev, date }));
    setSelectedTimeSlot(null);
    fetchAvailableTimes(date);
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBookingData(prev => ({ 
      ...prev, 
      time: timeSlot.time,
      players: Math.min(prev.players, timeSlot.available_capacity) || 1
    }));
    setStep(2);
  };

  const handlePlayersSelect = (players) => {
    setBookingData(prev => ({ ...prev, players }));
    setStep(3);
  };

  const handleSendOTP = async () => {
    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!csrfToken) {
      toast({
        title: "Security Error",
        description: "Security token missing. Please refresh the page.",
        variant: "destructive"
      });
      refetchCsrf();
      return;
    }

    setLoading(true);
    try {
      const response = await makeAPIRequest('/api/games/send-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: bookingData.email,
          first_name: bookingData.firstName,
          last_name: bookingData.lastName
        })
      }, csrfToken);

      const data = await response.json();
      
      if (response.ok) {
        setBookingData(prev => ({ ...prev, otpSent: true }));
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        });
        setStep(4);
        
        console.log('OTP sent with language:', getCurrentLanguage(), 'Response:', data);
      } else {
        if (response.status === 403) {
          toast({
            title: "Security Error",
            description: "Security verification failed. Please refresh the page and try again.",
            variant: "destructive"
          });
          refetchCsrf();
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to send verification code",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!bookingData.otp || bookingData.otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    if (!csrfToken) {
      toast({
        title: "Security Error",
        description: "Security token missing. Please refresh the page.",
        variant: "destructive"
      });
      refetchCsrf();
      return;
    }

    setLoading(true);
    try {
      const response = await makeAPIRequest('/api/games/verify-otp/', {
        method: 'POST',
        body: JSON.stringify({
          email: bookingData.email,
          otp: bookingData.otp
        })
      }, csrfToken);

      const data = await response.json();
      
      if (response.ok) {
        setBookingData(prev => ({ ...prev, emailVerified: true }));
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified",
        });
        setStep(5);
      } else {
        if (response.status === 403) {
          toast({
            title: "Security Error",
            description: "Security verification failed. Please refresh the page and try again.",
            variant: "destructive"
          });
          refetchCsrf();
        } else {
          toast({
            title: "Verification Failed",
            description: data.error || "Invalid verification code",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleConfirmBooking = async () => {
    if (!csrfToken) {
      toast({
        title: "Security Error",
        description: "Security token missing. Please refresh the page.",
        variant: "destructive"
      });
      refetchCsrf();
      return;
    }

    setLoading(true);
    try {
      const dateStr = formatDateForAPI(bookingData.date);
      console.log('Creating reservation with date:', dateStr);
      
      const reservationResponse = await makeAPIRequest('/api/games/create/', {
        method: 'POST',
        body: JSON.stringify({
          game: parseInt(gameId),
          date: dateStr,
          time: bookingData.time,
          players: bookingData.players,
          special_requirements: bookingData.specialRequirements || '',
          email: bookingData.email,
          first_name: bookingData.firstName,
          last_name: bookingData.lastName
        })
      }, csrfToken);

      const reservationData = await reservationResponse.json();
      
      if (reservationResponse.ok) {
        if (reservationData.tokens) {
          JWT_STORAGE.setTokens(reservationData.tokens);
          console.log('JWT tokens stored successfully');
        }
        
        const reservationId = reservationData.reservation.reference_number;
        console.log('Reservation created successfully:', reservationId);
        
        const paymentResponse = await makeAPIRequest('/billing/create-payment/', {
          method: 'POST',
          body: JSON.stringify({
            reservation_id: reservationData.reservation.id
          })
        }, csrfToken);

        const paymentData = await paymentResponse.json();
        
        if (paymentResponse.ok && paymentData.payment_url) {
          setBookingData(prev => ({ 
            ...prev, 
            reservationId: reservationData.reservation.id,
            referenceNumber: reservationId,
            paymentUrl: paymentData.payment_url
          }));
          
          toast({
            title: "Reservation Created!",
            description: "Redirecting to payment...",
          });
          
          setTimeout(() => {
            window.location.href = paymentData.payment_url;
          }, 1500);
          
        } else {
          toast({
            title: "Payment Error",
            description: paymentData.error || "Failed to create payment. Please try again.",
            variant: "destructive"
          });
        }
        
      } else {
        if (reservationResponse.status === 403) {
          toast({
            title: "Security Error",
            description: "Security verification failed. Please refresh the page and try again.",
            variant: "destructive"
          });
          refetchCsrf();
        } else {
          toast({
            title: "Reservation Failed",
            description: reservationData.error || "Failed to create reservation",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error in booking process:', error);
      toast({
        title: "Error",
        description: "Failed to process booking. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  if (csrfLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">{t('common.loading')}</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-orbitron font-bold mb-4 text-neon">
            {t('reservations.title')}
            </h1>
            <p className="text-muted-foreground">
            {t('reservations.subtitle')}
            </p>
          </div>

          <Card className="card-glow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">{t('reservations.yourBookings')}</CardTitle>
                <Button onClick={() => navigate('/games')} className="btn-glow">
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  {t('reservations.bookNewGame')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
                  <span>{t('reservations.loadingReservations')}</span>
                </div>
              ) : userReservations.length > 0 ? (
                <div className="space-y-6">
                  {userReservations.map((reservation) => (
                    <div key={reservation.id} className="border border-border rounded-lg p-6 bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-xl mb-1">
                            {reservation.game?.title || 'Game'}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                          {t('reservations.reference')}: <span className="font-mono">{reservation.reference_number}</span>
                          </div>
                        </div>
                        <Badge variant={
                          reservation.status === 'confirmed' ? 'default' :
                          reservation.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        } className="text-sm px-3 py-1">
                          {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground text-sm">{t('reservations.date')}:</span>
                            <div className="font-medium">{new Date(reservation.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground text-sm">{t('reservations.time')}:</span>
                            <div className="font-medium">{reservation.time}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground text-sm">{t('reservations.players')}:</span>
                            <div className="font-medium">{reservation.players}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 text-primary">€</div>
                          <div>
                            <span className="text-muted-foreground text-sm">{t('reservations.total')}:</span>
                            <div className="font-medium text-primary">€{reservation.total_price}</div>
                          </div>
                        </div>
                      </div>
                      
                      {reservation.special_requirements && (
                        <div className="pt-4 border-t border-border">
                          <span className="text-muted-foreground text-sm font-medium">{t('reservations.specialRequirements')}:</span>
                          <div className="text-sm mt-1 bg-muted/50 p-3 rounded">
                            {reservation.special_requirements}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                        <span className="text-xs text-muted-foreground">
                        {t('reservations.bookedOn')} {new Date(reservation.created_at).toLocaleDateString()}
                        </span>
                        
                        {reservation.status === 'confirmed' && new Date(reservation.date) > new Date() && (
                          <Button variant="outline" size="sm">
                            {t('reservations.modifyBooking')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GamepadIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('reservations.noReservationsYet')}</h3>
                  <p className="text-muted-foreground mb-6">
                  {t('reservations.noReservationsDescription')}
                  </p>
                  <Button onClick={() => navigate('/games')} className="btn-glow">
                    <GamepadIcon className="w-4 h-4 mr-2" />
                    {t('reservations.browseGames')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">{t('common.loading')}</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameError || !game) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
            {gameError === 'Game not found' ? t('reservations.gameNotFound') : t('reservations.errorLoadingGame')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {gameError === 'Game not found' 
                ? t('reservations.gameNotFoundDescription')
                : t('reservations.errorLoadingGameDescription')
              }
            </p>
            <Button onClick={() => navigate('/games')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('reservations.backToGames')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold mb-4 text-neon">
            {t('booking.title')}
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Badge variant="outline" className="border-primary/50">
              {game.title}
            </Badge>
            <span>•</span>
            <span>{t('games.duration', { duration: game.duration })}</span>
            <span>•</span>
            <span>{t('difficulty.' + game.difficulty.toLowerCase())}</span>
          </div>
          
          {userReservations.length > 0 && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/reservations')}
                className="mb-4"
              >
                {t('reservations.viewMy')} ({userReservations.length})
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step >= stepNumber 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 6 && (
                  <div className={`w-8 h-0.5 mx-2 transition-all ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="card-glow">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('reservations.dateTimeSelection.title')}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-base font-medium mb-4 block">{t('reservations.dateTimeSelection.selectDate')}</Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={bookingData.date}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          const today = getToday();
                          const checkDate = new Date(date);
                          checkDate.setHours(0, 0, 0, 0);
                          
                          return (
                            checkDate < today || 
                            checkDate > new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
                          );
                        }}
                        className="rounded-md border"
                      />
                    </div>
                    {bookingData.date && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-md text-center">
                        <p className="font-medium">{t('reservations.dateTimeSelection.selectedDate')}:</p>
                        <p className="text-primary">{formatDateForDisplay(bookingData.date)}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">{t('reservations.dateTimeSelection.availableTimes')}</Label>
                    
                    {availabilityInfo && (
                      <div className={`p-4 rounded-lg mb-4 flex items-start space-x-3 ${
                        availabilityInfo.type === 'info' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      }`}>
                        <Info className={`w-5 h-5 mt-0.5 ${
                          availabilityInfo.type === 'info' 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`} />
                        <div>
                          <p className={`text-sm font-medium ${
                            availabilityInfo.type === 'info' 
                              ? 'text-blue-800 dark:text-blue-200' 
                              : 'text-yellow-800 dark:text-yellow-200'
                          }`}>
                            {availabilityInfo.message}
                          </p>
                          {availabilityInfo.type === 'info' && (
                            <p className={`text-xs mt-1 ${
                              availabilityInfo.type === 'info' 
                                ? 'text-blue-600 dark:text-blue-300' 
                                : 'text-yellow-600 dark:text-yellow-300'
                            }`}>
                             {t('reservations.dateTimeSelection.selectDifferentDate')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={slot.available ? "outline" : "secondary"}
                            disabled={!slot.available}
                            onClick={() => handleTimeSelect(slot)}
                            className="h-16 flex flex-col items-center justify-center text-center p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold text-lg">{slot.time}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {slot.available ? (
                                <span className="text-green-600">
                                  {slot.available_capacity} {t('reservations.dateTimeSelection.available')} {slot.max_capacity} 
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  {t('reservations.dateTimeSelection.fullyBooked')}
                                </span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : bookingData.date && !availabilityInfo ? (
                      <p className="text-muted-foreground text-center py-8">
                        {t('reservations.dateTimeSelection.noAvailableTimes')}
                      </p>
                    ) : !bookingData.date ? (
                      <p className="text-muted-foreground text-center py-8">
                        {t('reservations.dateTimeSelection.selectDateFirst')}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('reservations.playerSelection.title')}</h2>
                  {selectedTimeSlot && (
                    <div className="bg-muted/50 p-4 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('reservations.playerSelection.selectedTime')}: <span className="font-semibold">{selectedTimeSlot.time}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-green-600 font-medium">
                          {selectedTimeSlot.available_capacity} {t('reservations.playerSelection.spotsAvailable')}
                        </span>
                        <span className="text-muted-foreground"> / {selectedTimeSlot.max_capacity} {t('reservations.playerSelection.total')}</span>
                      </p>
                      {selectedTimeSlot.used_capacity > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedTimeSlot.used_capacity} {t('reservations.playerSelection.alreadyBooked')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setBookingData(prev => ({ 
                        ...prev, 
                        players: Math.max(1, prev.players - 1) 
                      }))}
                      disabled={bookingData.players <= 1}
                    >
                      -
                    </Button>
                    
                    <div className="text-2xl font-bold w-16 text-center">
                      {bookingData.players}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setBookingData(prev => ({ 
                        ...prev, 
                        players: Math.min(
                          selectedTimeSlot ? selectedTimeSlot.available_capacity : game.max_players, 
                          prev.players + 1
                        ) 
                      }))}
                      disabled={
                        selectedTimeSlot 
                          ? bookingData.players >= selectedTimeSlot.available_capacity
                          : bookingData.players >= game.max_players
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {selectedTimeSlot && bookingData.players > selectedTimeSlot.available_capacity && (
                  <div className="text-center">
                    <p className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md max-w-md mx-auto">
                      {t('reservations.playerSelection.exceedsCapacity', { 
                        available: selectedTimeSlot.available_capacity 
                      })}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <Button 
                    onClick={() => handlePlayersSelect(bookingData.players)} 
                    className="btn-glow"
                    disabled={
                      selectedTimeSlot 
                        ? bookingData.players > selectedTimeSlot.available_capacity || bookingData.players < 1
                        : bookingData.players < 1 || bookingData.players > game.max_players
                    }
                  >
                    {t('reservations.playerSelection.continue')}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('reservations.personalInfo.title')}</h2>
                  <p className="text-muted-foreground">
                  {t('reservations.personalInfo.description')}
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="firstName">{t('reservations.personalInfo.firstName')} *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder={t('reservations.personalInfo.firstNamePlaceholder')}
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="input-glow mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">{t('reservations.personalInfo.lastName')} *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder={t('reservations.personalInfo.lastNamePlaceholder')}
                      value={bookingData.lastName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="input-glow mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t('reservations.personalInfo.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('reservations.personalInfo.emailPlaceholder')}
                      value={bookingData.email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-glow mt-2"
                      required
                    />
                  </div>

                  <Button
                    onClick={handleSendOTP}
                    disabled={loading || !bookingData.firstName || !bookingData.lastName || !bookingData.email}
                    className="w-full btn-glow"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('reservations.personalInfo.sending')}
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        {t('reservations.personalInfo.sendVerificationCode')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2"> {t('reservations.emailVerification.title')}</h2>
                  <p className="text-muted-foreground">
                  {t('reservations.emailVerification.description')} <strong>{bookingData.email}</strong>
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="otp">{t('reservations.emailVerification.verificationCode')}</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder={t('reservations.emailVerification.codePlaceholder')}
                      value={bookingData.otp}
                      onChange={(e) => setBookingData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                      className="input-glow text-center text-lg tracking-widest mt-2"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={loading || bookingData.otp.length !== 6}
                    className="w-full btn-glow"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('reservations.emailVerification.verifying')}
                      </>
                    ) : (
                      t('reservations.emailVerification.verifyCode')
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="text-sm"
                    >
                      {t('reservations.emailVerification.resendCode')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-center mb-6">{t('reservations.finalDetails.title')}</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requirements" className="text-base font-medium">
                      {t('reservations.finalDetails.specialRequirements')}
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder={t('reservations.finalDetails.requirementsPlaceholder')}
                      value={bookingData.specialRequirements || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      className="input-glow mt-2"
                      rows={4}
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg">{t('reservations.finalDetails.bookingSummary')}</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>{t('reservations.finalDetails.game')}:</span>
                        <span className="font-medium">{game.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('reservations.finalDetails.date')}:</span>
                        <span className="font-medium">{formatDateForDisplay(bookingData.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('reservations.finalDetails.time')}:</span>
                        <span className="font-medium">{bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('reservations.finalDetails.players')}:</span>
                        <span className="font-medium">{bookingData.players}</span>
                      </div>
                      {selectedTimeSlot && (
                        <div className="flex justify-between">
                          <span>{t('reservations.finalDetails.capacity')}:</span>
                          <span className="font-medium">
                            {selectedTimeSlot.used_capacity + bookingData.players}/{selectedTimeSlot.max_capacity} {t('reservations.finalDetails.afterBooking')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>{t('reservations.finalDetails.name')}:</span>
                        <span className="font-medium">{bookingData.firstName} {bookingData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('reservations.finalDetails.email')}:</span>
                        <span className="font-medium">{bookingData.email}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>{t('reservations.finalDetails.totalPrice')}:</span>
                        <span>€{bookingData.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="disclaimer"
                        checked={bookingData.disclaimerAccepted}
                        onCheckedChange={(checked) => 
                          setBookingData(prev => ({ ...prev, disclaimerAccepted: checked === true }))
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor="disclaimer" 
                          className="text-sm font-medium cursor-pointer flex items-start"
                        >
                          <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                          <span>
                            {t('reservations.finalDetails.disclaimerText')}{' '}
                            <button
                              type="button"
                              onClick={() => setShowDisclaimer(true)}
                              className="text-primary hover:underline font-semibold"
                            >
                              {t('reservations.finalDetails.disclaimerLink')}
                            </button>
                          </span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmBooking}
                    disabled={loading || !bookingData.disclaimerAccepted}
                    className="w-full btn-glow text-lg py-6"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('reservations.finalDetails.processing')}
                      </>
                    ) : (
                      <>
                        💳 {t('reservations.finalDetails.proceedToPayment')}
                      </>
                    )}
                  </Button>
                  
                  {!bookingData.disclaimerAccepted && (
                    <p className="text-xs text-center text-muted-foreground">
                      {t('reservations.finalDetails.mustAcceptDisclaimer')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-orbitron font-bold text-accent">
                {t('reservations.confirmation.title')}
                </h2>
                <div className="text-2xl font-semibold">
                {t('reservations.confirmation.reference')}: <span className="text-primary">{bookingData.referenceNumber}</span>
                </div>
                <p className="text-muted-foreground">
                {t('reservations.confirmation.emailSent')} <strong>{bookingData.email}</strong>
                </p>
                
                {JWT_STORAGE.isAuthenticated() && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg max-w-md mx-auto">
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      ✓ {t('reservations.confirmation.accountCreated')}
                    </p>
                  </div>
                )}
                
                <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
                  <h3 className="font-semibold mb-4">{t('reservations.confirmation.bookingDetails')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('reservations.confirmation.game')}:</span>
                      <span>{game.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservations.confirmation.date')}:</span>
                      <span>{formatDateForDisplay(bookingData.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservations.confirmation.time')}:</span>
                      <span>{bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservations.confirmation.players')}:</span>
                      <span>{bookingData.players}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>{t('reservations.confirmation.total')}:</span>
                      <span>€{bookingData.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/games')}
                    variant="outline"
                  >
                    {t('reservations.confirmation.bookAnotherGame')}
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/reservations')}
                    className="btn-glow"
                  >
                    {t('reservations.confirmation.viewAllReservations')}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                  {t('reservations.confirmation.arrivalNote')}
                  </p>
                </div>
              </div>
            )}

            {step > 1 && step < 6 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
                {t('reservations.disclaimer.title')}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-left space-y-4 text-sm leading-relaxed">
              <p className="font-medium text-foreground">
                {t('reservations.disclaimer.content')}
              </p>
            </DialogDescription>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDisclaimer(false)}
              >
                {t('reservations.disclaimer.close')}
              </Button>
              <Button
                onClick={() => {
                  setBookingData(prev => ({ ...prev, disclaimerAccepted: true }));
                  setShowDisclaimer(false);
                }}
                className="btn-glow"
              >
                {t('reservations.disclaimer.acceptAndContinue')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}