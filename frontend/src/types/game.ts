export interface Game {
  id: string;
  title: string;
  category: 'escape' | 'adventure' | 'puzzle' | 'horror' | 'team';
  description: string;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  price: number;
  image: string;
  max_players: number;
  minPlayers: number;
  featured?: boolean;
}

export interface BookingData {
  gameId: string;
  date: Date;
  time: string;
  players: number;
  email?: string;
  facebookAuth?: boolean;
  verificationCode?: string;
  specialRequirements?: string;
  totalPrice: number;
  referenceNumber?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}