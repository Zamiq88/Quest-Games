export interface Game {
  id: string;
  title: string;
  category: 'escape' | 'adventure' | 'puzzle' | 'horror' | 'team';
  description: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard'; // Also fixed to match Django choices
  price: number;
  image: string;
  max_players: number; // Changed from maxPlayers
  featured?: boolean;
  // Add other fields from your Django model
  status: 'available_now' | 'pre_reservation';
  working_hours_start: string;
  working_hours_end: string;
  working_hours?: string;
  is_featured: boolean;
  is_active: boolean;
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