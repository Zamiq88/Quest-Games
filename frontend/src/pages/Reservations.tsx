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
import { useToast } from '@/hooks/use-toast';
import { getGameById } from '@/data/games';
import { BookingData, TimeSlot } from '@/types/game';
import { Calendar, Clock, Users, Facebook, Mail, ArrowLeft, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export function Reservations() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const gameId = searchParams.get('game');
  const game = gameId ? getGameById(gameId) : null;

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    gameId: gameId || '',
    players: 2,
    totalPrice: 0
  });

  // Mock time slots
  const timeSlots: TimeSlot[] = [
    { time: '10:00', available: true },
    { time: '12:00', available: true },
    { time: '14:00', available: false },
    { time: '16:00', available: true },
    { time: '18:00', available: true },
    { time: '20:00', available: true },
  ];

  useEffect(() => {
    if (game && bookingData.players) {
      const totalPrice = game.price * (game.category === 'team' ? 1 : bookingData.players);
      setBookingData(prev => ({ ...prev, totalPrice }));
    }
  }, [game, bookingData.players]);

  const handleDateTimeSelect = (date: Date, time: string) => {
    setBookingData(prev => ({ ...prev, date, time }));
    setStep(2);
  };

  const handlePlayersSelect = (players: number) => {
    setBookingData(prev => ({ ...prev, players }));
    setStep(3);
  };

  const handleFacebookAuth = () => {
    setBookingData(prev => ({ ...prev, facebookAuth: true }));
    setStep(4);
  };

  const handleEmailAuth = (email: string) => {
    setBookingData(prev => ({ ...prev, email, facebookAuth: false }));
    setStep(5);
  };

  const handleVerificationCode = (code: string) => {
    setBookingData(prev => ({ ...prev, verificationCode: code }));
    setStep(4);
  };

  const handleConfirmBooking = () => {
    const referenceNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
    const finalBookingData = { ...bookingData, referenceNumber };
    
    // Store booking in localStorage (simulate backend)
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(finalBookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    toast({
      title: t('booking.bookingSuccess'),
      description: t('booking.referenceNumber', { number: referenceNumber }),
    });

    setStep(6);
  };

  if (!game) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="card-glow max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Game not found</h2>
            <p className="text-muted-foreground mb-4">
              Please select a game from our collection to continue with booking.
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
                  <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('booking.selectTime')}</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-base font-medium mb-4 block">Select Date</Label>
                    <DatePicker
                      selected={bookingData.date}
                      onChange={(date: Date | null) => date && setBookingData(prev => ({ ...prev, date }))}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                      className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                      placeholderText="Choose a date"
                      dateFormat="MMMM d, yyyy"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">Available Times</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={slot.available ? "outline" : "secondary"}
                          disabled={!slot.available || !bookingData.date}
                          onClick={() => bookingData.date && handleDateTimeSelect(bookingData.date, slot.time)}
                          className="h-12"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Player Count */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">{t('booking.selectPlayers')}</h2>
                  <p className="text-muted-foreground">
                    {game.minPlayers} - {game.maxPlayers} players allowed
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => bookingData.players && bookingData.players > game.minPlayers && 
                        setBookingData(prev => ({ ...prev, players: (prev.players || 2) - 1 }))}
                      disabled={!bookingData.players || bookingData.players <= game.minPlayers}
                    >
                      -
                    </Button>
                    
                    <div className="text-2xl font-bold w-16 text-center">
                      {bookingData.players}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => bookingData.players && bookingData.players < game.maxPlayers && 
                        setBookingData(prev => ({ ...prev, players: (prev.players || 2) + 1 }))}
                      disabled={!bookingData.players || bookingData.players >= game.maxPlayers}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => bookingData.players && handlePlayersSelect(bookingData.players)}
                    className="btn-glow"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Authentication */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">{t('booking.authentication')}</h2>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <Button
                    onClick={handleFacebookAuth}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Facebook className="w-5 h-5 mr-2" />
                    {t('booking.facebookLogin')}
                  </Button>

                  <div className="text-center text-muted-foreground">
                    {t('booking.orDivider')}
                  </div>

                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder={t('booking.emailPlaceholder')}
                      value={bookingData.email || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      className="input-glow"
                    />
                    <Button
                      onClick={() => bookingData.email && handleEmailAuth(bookingData.email)}
                      disabled={!bookingData.email}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t('booking.emailLogin')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Email Verification */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">{t('booking.verificationCode')}</h2>
                  <p className="text-muted-foreground">
                    We've sent a verification code to {bookingData.email}
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <Input
                    placeholder={t('booking.codePlaceholder')}
                    value={bookingData.verificationCode || ''}
                    onChange={(e) => setBookingData(prev => ({ ...prev, verificationCode: e.target.value }))}
                    className="input-glow text-center text-lg"
                    maxLength={6}
                  />
                  <Button
                    onClick={() => bookingData.verificationCode && handleVerificationCode(bookingData.verificationCode)}
                    disabled={!bookingData.verificationCode || bookingData.verificationCode.length !== 6}
                    className="w-full mt-4 btn-glow"
                  >
                    Verify Code
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Final Details */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-center mb-6">Booking Details</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requirements" className="text-base font-medium">
                      {t('booking.specialRequirements')}
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder={t('booking.requirementsPlaceholder')}
                      value={bookingData.specialRequirements || ''}
                      onChange={(e) => setBookingData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      className="input-glow mt-2"
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-lg">{t('booking.totalPrice')}</h3>
                    <div className="flex justify-between">
                      <span>Game: {game.title}</span>
                      <span>{t('games.price', { price: game.price })} x {bookingData.players}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>Total:</span>
                      <span>{t('games.price', { price: bookingData.totalPrice })}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmBooking}
                    className="w-full btn-glow text-lg py-6"
                  >
                    {t('booking.confirmBooking')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Confirmation */}
            {step === 6 && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-orbitron font-bold text-accent">
                  {t('booking.bookingSuccess')}
                </h2>
                <div className="text-2xl font-semibold">
                  {t('booking.referenceNumber', { number: bookingData.referenceNumber })}
                </div>
                <p className="text-muted-foreground">
                  {t('booking.confirmationEmail')}
                </p>
                
                <div className="bg-muted/50 p-6 rounded-lg max-w-md mx-auto">
                  <h3 className="font-semibold mb-4">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Game:</span>
                      <span>{game.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{bookingData.date?.toLocaleDateString()}</span>
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
                      <span>{t('games.price', { price: bookingData.totalPrice })}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/games')}
                  variant="outline"
                  className="mt-6"
                >
                  {t('booking.backToGames')}
                </Button>
              </div>
            )}

            {/* Back Button */}
            {step > 1 && step < 6 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}