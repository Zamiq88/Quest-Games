import { Game } from '@/types/game';

export const games: Game[] = [
  {
    id: '1',
    title: 'The Lost Treasure',
    category: 'adventure',
    description: 'Navigate through ancient ruins and solve mysterious puzzles to find the legendary treasure of Captain Blackwood.',
    duration: 60,
    difficulty: 'Medium',
    price: 35,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
    maxPlayers: 6,
    minPlayers: 2,
    featured: true
  },
  {
    id: '2',
    title: 'Zombie Apocalypse',
    category: 'horror',
    description: 'Survive the undead outbreak in this terrifying experience. Find the cure before you become one of them.',
    duration: 45,
    difficulty: 'Hard',
    price: 40,
    image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=500&h=300&fit=crop',
    maxPlayers: 4,
    minPlayers: 2,
    featured: true
  },
  {
    id: '3',
    title: 'Corporate Escape',
    category: 'team',
    description: 'Perfect for team building! Work together to escape the corporate maze and improve your communication skills.',
    duration: 75,
    difficulty: 'Easy',
    price: 200,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop',
    maxPlayers: 10,
    minPlayers: 4,
    featured: false
  },
  {
    id: '4',
    title: "The Detective's Office",
    category: 'puzzle',
    description: 'Step into the shoes of a famous detective and solve the mystery that has baffled Scotland Yard.',
    duration: 55,
    difficulty: 'Medium',
    price: 30,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
    maxPlayers: 5,
    minPlayers: 2,
    featured: true
  },
  {
    id: '5',
    title: 'Space Station Omega',
    category: 'escape',
    description: 'Repair the space station before oxygen runs out. A high-tech adventure in zero gravity simulation.',
    duration: 60,
    difficulty: 'Hard',
    price: 45,
    image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=500&h=300&fit=crop',
    maxPlayers: 6,
    minPlayers: 3,
    featured: false
  },
  {
    id: '6',
    title: 'The Haunted Manor',
    category: 'horror',
    description: 'Enter the cursed manor where spirits roam. Uncover the dark secrets before dawn breaks.',
    duration: 50,
    difficulty: 'Medium',
    price: 38,
    image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c88a?w=500&h=300&fit=crop',
    maxPlayers: 6,
    minPlayers: 2,
    featured: false
  },
  {
    id: '7',
    title: 'Pirate Ship Adventure',
    category: 'adventure',
    description: 'Sail the seven seas and find the hidden treasure on this interactive pirate ship experience.',
    duration: 65,
    difficulty: 'Easy',
    price: 32,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
    maxPlayers: 8,
    minPlayers: 3,
    featured: false
  },
  {
    id: '8',
    title: 'The Enigma Machine',
    category: 'puzzle',
    description: 'Crack the codes of World War II in this historically immersive puzzle experience.',
    duration: 70,
    difficulty: 'Hard',
    price: 42,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop',
    maxPlayers: 4,
    minPlayers: 2,
    featured: false
  },
  {
    id: '9',
    title: 'Bank Heist',
    category: 'escape',
    description: 'Plan and execute the perfect heist. Get in, get the money, and get out before the alarm goes off.',
    duration: 55,
    difficulty: 'Medium',
    price: 36,
    image: 'https://images.unsplash.com/photo-1541560052-77e59a6025b4?w=500&h=300&fit=crop',
    maxPlayers: 6,
    minPlayers: 3,
    featured: true
  },
  {
    id: '10',
    title: 'Wizard School',
    category: 'adventure',
    description: 'Learn magic and solve mystical puzzles in this enchanting adventure for all ages.',
    duration: 60,
    difficulty: 'Easy',
    price: 28,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop',
    maxPlayers: 8,
    minPlayers: 2,
    featured: false
  },
  {
    id: '11',
    title: 'Mission: Impossible',
    category: 'team',
    description: 'Complete impossible missions with your team. Perfect for corporate events and team building.',
    duration: 80,
    difficulty: 'Hard',
    price: 250,
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500&h=300&fit=crop',
    maxPlayers: 12,
    minPlayers: 6,
    featured: false
  },
  {
    id: '12',
    title: 'The Serial Killer',
    category: 'horror',
    description: 'Track down a serial killer before they strike again. Not for the faint of heart.',
    duration: 45,
    difficulty: 'Hard',
    price: 42,
    image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&h=300&fit=crop',
    maxPlayers: 4,
    minPlayers: 2,
    featured: false
  },
  {
    id: '13',
    title: 'Time Machine',
    category: 'puzzle',
    description: 'Travel through time and fix historical anomalies before the timeline collapses.',
    duration: 75,
    difficulty: 'Medium',
    price: 39,
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop',
    maxPlayers: 6,
    minPlayers: 3,
    featured: false
  },
  {
    id: '14',
    title: 'Prison Break',
    category: 'escape',
    description: 'Escape from maximum security prison. Use your wits and teamwork to break free.',
    duration: 50,
    difficulty: 'Medium',
    price: 34,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=300&fit=crop',
    maxPlayers: 6,
    minPlayers: 2,
    featured: false
  },
  {
    id: '15',
    title: 'Startup Challenge',
    category: 'team',
    description: 'Build a startup from scratch in this business-focused team building experience.',
    duration: 90,
    difficulty: 'Easy',
    price: 180,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&h=300&fit=crop',
    maxPlayers: 8,
    minPlayers: 4,
    featured: false
  }
];

export const getGamesByCategory = (category: string) => {
  if (category === 'all') return games;
  return games.filter(game => game.category === category);
};

export const getFeaturedGames = () => {
  return games.filter(game => game.featured);
};

export const getGameById = (id: string) => {
  return games.find(game => game.id === id);
};