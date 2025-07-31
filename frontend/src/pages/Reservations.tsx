// Updated Reservations.jsx - Fixed date handling to prevent timezone issues
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
import { Calendar } from '@/components/ui/calendar'; // Use your custom calendar instead of react-datepicker
import { useToast } from '@/hooks/use-toast';
import { BookingData, TimeSlot } from '@/types/game';
import { Calendar as CalendarIcon, Clock, Users, Mail, ArrowLeft, Check, User, GamepadIcon } from 'lucide-react';

// Helper function to format date consistently
const formatDateForAPI = (date) => {
  if (!date) return null;
  // Ensure we get the local date without timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const gameId = searchParams.get('game');
  
  // Add state for game data and loading
  const [game, setGame] = useState(null);
  const [gameLoading, setGameLoading] = useState(true);
  const [gameError, setGameError] = useState(null);

  // Add state for user reservations
  const [userReservations, setUserReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  const [step, setStep] = useState(1);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    gameId: gameId || '',
    players: 2,
    totalPrice: 0,
    firstName: '',
    lastName: '',
    email: '',
    otpSent: false,
    emailVerified: false,
    otp: ''
  });

  // Fetch user reservations
  const fetchUserReservations = async () => {
    setReservationsLoading(true);
    try {
      const response = await fetch('/api/reservations/');
      
      if (response.ok) {
        const data = await response.json();
        setUserReservations(data);
      } else if (response.status === 401) {
        // User not authenticated, that's okay
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

  // Check if user is authenticated and fetch reservations
  useEffect(() => {
    fetchUserReservations();
  }, []);

  // Fetch game data from backend only if gameId is provided
  useEffect(() => {
    if (gameId) {
      setGameLoading(true);
      fetch(`/api/games/${gameId}/`)
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
    } else {
      setGameLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (game && bookingData.players) {
      const totalPrice = game.price * (game.category === 'team' ? 1 : bookingData.players);
      setBookingData(prev => ({ ...prev, totalPrice }));
    }
  }, [game, bookingData.players]);

  // Fetch available times when date is selected
  const fetchAvailableTimes = async (selectedDate) => {
    if (!selectedDate || !gameId) return;

    setLoading(true);
    try {
      const dateStr = formatDateForAPI(selectedDate);
      console.log('Fetching times for date:', dateStr, 'Original date:', selectedDate); // Debug log
      
      const response = await fetch(`/api/games/available-times/?game_id=${gameId}&date=${dateStr}`);
      const data = await response.json();
      
      if (response.ok) {
        setTimeSlots(data.time_slots);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load available times",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available times",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleDateSelect = (date) => {
    console.log('Date selected:', date, 'Formatted:', formatDateForAPI(date)); // Debug log
    setBookingData(prev => ({ ...prev, date }));
    fetchAvailableTimes(date);
  };

  const handleTimeSelect = (time) => {
    setBookingData(prev => ({ ...prev, time }));
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

    setLoading(true);
    try {
      const response = await fetch('/api/games/send-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: bookingData.email,
          first_name: bookingData.firstName,
          last_name: bookingData.lastName
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBookingData(prev => ({ ...prev, otpSent: true }));
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        });
        setStep(4);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
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

    setLoading(true);
    try {
      const response = await fetch('/api/games/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: bookingData.email,
          otp: bookingData.otp
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBookingData(prev => ({ ...prev, emailVerified: true }));
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified",
        });
        setStep(5);
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Invalid verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const dateStr = formatDateForAPI(bookingData.date);
      console.log('Confirming booking with date:', dateStr); // Debug log
      
      const response = await fetch('/api/games/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      });

      const data = await response.json();
      
      if (response.ok) {
        setBookingData(prev => ({ ...prev, referenceNumber: data.reservation.reference_number }));
        // Refresh user reservations after successful booking
        fetchUserReservations();
        toast({
          title: "Booking Confirmed!",
          description: `Your reference number is ${data.reservation.reference_number}`,
        });
        setStep(6);
      } else {
        toast({
          title: "Booking Failed",
          description: data.error || "Failed to create booking",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // If no gameId is provided, show reservations list
  if (!gameId) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-orbitron font-bold mb-4 text-neon">
              My Reservations
            </h1>
            <p className="text-muted-foreground">
              View and manage your game reservations
            </p>
          </div>

          {/* Reservations List */}
          <Card className="card-glow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">Your Bookings</CardTitle>
                <Button onClick={() => navigate('/games')} className="btn-glow">
                  <GamepadIcon className="w-4 h-4 mr-2" />
                  Book New Game
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
                  <span>Loading your reservations...</span>
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
                            Reference: <span className="font-mono">{reservation.reference_number}</span>
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
                            <span className="text-muted-foreground text-sm">Date:</span>
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
                            <span className="text-muted-foreground text-sm">Time:</span>
                            <div className="font-medium">{reservation.time}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground text-sm">Players:</span>
                            <div className="font-medium">{reservation.players}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 text-primary">€</div>
                          <div>
                            <span className="text-muted-foreground text-sm">Total:</span>
                            <div className="font-medium text-primary">€{reservation.total_price}</div>
                          </div>
                        </div>
                      </div>
                      
                      {reservation.special_requirements && (
                        <div className="pt-4 border-t border-border">
                          <span className="text-muted-foreground text-sm font-medium">Special Requirements:</span>
                          <div className="text-sm mt-1 bg-muted/50 p-3 rounded">
                            {reservation.special_requirements}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                        <span className="text-xs text-muted-foreground">
                          Booked on {new Date(reservation.created_at).toLocaleDateString()}
                        </span>
                        
                        {reservation.status === 'confirmed' && new Date(reservation.date) > new Date() && (
                          <Button variant="outline" size="sm">
                            Modify Booking
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GamepadIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Reservations Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't made any game reservations yet. Ready to start your adventure?
                  </p>
                  <Button onClick={() => navigate('/games')} className="btn-glow">
                    <GamepadIcon className="w-4 h-4 mr-2" />
                    Browse Games
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state while fetching game
  if (gameLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading game details...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if game fetch failed
  if (gameError || !game) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">
              {gameError === 'Game not found' ? 'Game not found' : 'Error loading game'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {gameError === 'Game not found' 
                ? 'Please select a game from our collection to continue with booking.'
                : 'There was an error loading the game details. Please try again.'
              }
            </p>
            <Button onClick={() => navigate('/games')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
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
            <span>{t('games.difficulty.' + game.difficulty.toLowerCase())}</span>
          </div>
          
          {/* User Reservations Quick Link */}
          {userReservations.length > 0 && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/reservations')}
                className="mb-4"
              >
                View My Reservations ({userReservations.length})
              </Button>
            </div>
          )}
        </div>

        {/* Progress Steps */}
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

        {/* Step Content */}
        <Card className="card-glow">
          <CardContent className="p-8">
            {/* Step 1: Date & Time Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CalendarIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Select Date & Time</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Select Date</Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={bookingData.date}
                        onSelect={handleDateSelect}
                        disabled={(date) => 
                          date < new Date() || 
                          date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                        className="rounded-md border"
                      />
                    </div>
                    {bookingData.date && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-md text-center">
                        <p className="font-medium">Selected Date:</p>
                        <p className="text-primary">{formatDateForDisplay(bookingData.date)}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">Available Times</Label>
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={slot.available ? "outline" : "secondary"}
                            disabled={!slot.available}
                            onClick={() => handleTimeSelect(slot.time)}
                            className="h-12"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : bookingData.date ? (
                      <p className="text-muted-foreground text-center py-8">
                        No available times for selected date
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Please select a date first
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Player Count */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Number of Players</h2>
                  <p className="text-muted-foreground">
                    1 - {game.max_players} players allowed
                  </p>
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
                        players: Math.min(game.max_players, prev.players + 1) 
                      }))}
                      disabled={bookingData.players >= game.max_players}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <Button onClick={() => handlePlayersSelect(bookingData.players)} className="btn-glow">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Information */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Your Information</h2>
                  <p className="text-muted-foreground">
                    We'll send your booking confirmation to this email
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="input-glow mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={bookingData.lastName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="input-glow mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Email Verification */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Verify Your Email</h2>
                  <p className="text-muted-foreground">
                    We've sent a 6-digit verification code to <strong>{bookingData.email}</strong>
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
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
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="text-sm"
                    >
                      Didn't receive the code? Resend
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Special Requirements & Final Confirmation */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-center mb-6">Final Details</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requirements" className="text-base font-medium">
                      Special Requirements (Optional)
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="Any special requests, accessibility needs, or celebrations..."
                      value={bookingData.specialRequirements || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      className="input-glow mt-2"
                      rows={4}
                    />
                  </div>

                  <Separator />

                  {/* Booking Summary */}
                  <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg">Booking Summary</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Game:</span>
                        <span className="font-medium">{game.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{formatDateForDisplay(bookingData.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium">{bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <span className="font-medium">{bookingData.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{bookingData.firstName} {bookingData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="font-medium">{bookingData.email}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total Price:</span>
                        <span>€{bookingData.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    className="w-full btn-glow text-lg py-6"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {step === 6 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-orbitron font-bold text-accent">
                  Booking Confirmed!
                </h2>
                <div className="text-2xl font-semibold">
                  Reference: <span className="text-primary">{bookingData.referenceNumber}</span>
                </div>
                <p className="text-muted-foreground">
                  A confirmation email has been sent to <strong>{bookingData.email}</strong>
                </p>
                
                <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
                  <h3 className="font-semibold mb-4">Booking Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Game:</span>
                      <span>{game.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{formatDateForDisplay(bookingData.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span>{bookingData.players}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>€{bookingData.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/games')}
                    variant="outline"
                  >
                    Book Another Game
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/reservations')}
                    className="btn-glow"
                  >
                    View All Reservations
                  </Button>
                  
                  <p className="text-sm text-muted-foreground">
                    Please arrive 15 minutes before your scheduled time.
                  </p>
                </div>
              </div>
            )}

            {/* Back Button */}
            {step > 1 && step < 6 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}