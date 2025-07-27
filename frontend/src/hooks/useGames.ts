import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface Game {
  id: number;
  title: string;  // This will be the localized title from the API
  description: string;  // This will be the localized description from the API
  category: string;
  difficulty: string;
  status: string;
  image: string;
  price: number;
  max_players: number;
  duration: number;
  working_hours_start: string;
  working_hours_end: string;
  working_hours?: string;
  is_featured: boolean;
  is_active: boolean;
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();

  const fetchGames = async (language: string = 'en') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching games for language: ${language}`);
      
      // Fetch games with language parameter
      const response = await fetch(`/api/games/?lang=${language}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Handle different response formats
      let gamesArray: Game[] = [];
      
      if (Array.isArray(data)) {
        // Direct array response
        gamesArray = data;
      } else if (data && typeof data === 'object') {
        // Check for common API response patterns
        if (Array.isArray(data.results)) {
          // Paginated response
          gamesArray = data.results;
        } else if (Array.isArray(data.data)) {
          // Wrapped response
          gamesArray = data.data;
        } else if (Array.isArray(data.games)) {
          // Named games array
          gamesArray = data.games;
        } else {
          console.warn('Unexpected API response format:', data);
          gamesArray = [];
        }
      } else {
        console.warn('API response is not an object or array:', data);
        gamesArray = [];
      }
      
      console.log('Processed games array:', gamesArray);
      
      // Filter out any null results (inactive games) and ensure valid games
      const activeGames = gamesArray
        .filter((game: Game | null) => game !== null && game !== undefined)
        .filter((game: Game) => game.id && game.title); // Ensure basic required fields
      
      console.log('Active games after filtering:', activeGames);
      setGames(activeGames);
      
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Always fallback to mock data if API fails
      console.log('Falling back to mock data');
      setGames(getMockGames(language));
    } finally {
      setLoading(false);
    }
  };

  // Fetch games when component mounts or language changes
  useEffect(() => {
    fetchGames(i18n.language);
  }, [i18n.language]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      fetchGames(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return { games, loading, error, refetch: () => fetchGames(i18n.language) };
}

// Mock data fallback for development
function getMockGames(language: string): Game[] {
  console.log(`Loading mock data for language: ${language}`);
  
  const mockData = {
    en: [
      {
        id: 1,
        title: 'Prison Escape',
        description: 'A thrilling escape room experience. Use logic and teamwork to break free!',
        category: 'escape',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/prison-escape.jpg',
        price: 25.00,
        max_players: 6,
        duration: 60,
        working_hours_start: '10:00',
        working_hours_end: '22:00',
        working_hours: '10:00-22:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 2,
        title: 'Zombie Apocalypse',
        description: 'Survive the zombie world! Find the cure and save humanity.',
        category: 'horror',
        difficulty: 'hard',
        status: 'available_now',
        image: '/images/zombie-apocalypse.jpg',
        price: 30.00,
        max_players: 8,
        duration: 90,
        working_hours_start: '12:00',
        working_hours_end: '23:00',
        working_hours: '12:00-23:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 3,
        title: 'Pirate Treasure',
        description: 'Embark on a swashbuckling adventure to find the legendary pirate treasure!',
        category: 'adventure',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/pirate-treasure.jpg',
        price: 28.00,
        max_players: 5,
        duration: 75,
        working_hours_start: '11:00',
        working_hours_end: '22:00',
        working_hours: '11:00-22:00',
        is_featured: false,
        is_active: true
      },
      {
        id: 4,
        title: 'Mystery Mansion',
        description: 'Solve puzzles and uncover secrets in this mysterious Victorian mansion.',
        category: 'puzzle',
        difficulty: 'easy',
        status: 'available_now',
        image: '/images/mystery-mansion.jpg',
        price: 22.00,
        max_players: 4,
        duration: 45,
        working_hours_start: '10:00',
        working_hours_end: '21:00',
        working_hours: '10:00-21:00',
        is_featured: false,
        is_active: true
      },
      {
        id: 5,
        title: 'Corporate Challenge',
        description: 'Perfect team building experience designed for corporate groups.',
        category: 'team',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/corporate-challenge.jpg',
        price: 35.00,
        max_players: 10,
        duration: 120,
        working_hours_start: '09:00',
        working_hours_end: '20:00',
        working_hours: '09:00-20:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 6,
        title: 'Atlantis Mysteries',
        description: 'New underwater adventure coming next month! Pre-reservations now open.',
        category: 'adventure',
        difficulty: 'hard',
        status: 'pre_reservation',
        image: '/images/atlantis-mysteries.jpg',
        price: 32.00,
        max_players: 6,
        duration: 90,
        working_hours_start: '10:00',
        working_hours_end: '22:00',
        working_hours: '10:00-22:00',
        is_featured: true,
        is_active: true
      }
    ],
    es: [
      {
        id: 1,
        title: 'Escape de la Prisión',
        description: '¡Una emocionante experiencia de escape! Usa la lógica y el trabajo en equipo para liberarte.',
        category: 'escape',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/prison-escape.jpg',
        price: 25.00,
        max_players: 6,
        duration: 60,
        working_hours_start: '10:00',
        working_hours_end: '22:00',
        working_hours: '10:00-22:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 2,
        title: 'Apocalipsis Zombi',
        description: '¡Sobrevive al mundo zombi! Encuentra la cura y salva a la humanidad.',
        category: 'horror',
        difficulty: 'hard',
        status: 'available_now',
        image: '/images/zombie-apocalypse.jpg',
        price: 30.00,
        max_players: 8,
        duration: 90,
        working_hours_start: '12:00',
        working_hours_end: '23:00',
        working_hours: '12:00-23:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 3,
        title: 'Tesoro Pirata',
        description: '¡Embárcate en una aventura de corsarios para encontrar el legendario tesoro pirata!',
        category: 'adventure',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/pirate-treasure.jpg',
        price: 28.00,
        max_players: 5,
        duration: 75,
        working_hours_start: '11:00',
        working_hours_end: '22:00',
        working_hours: '11:00-22:00',
        is_featured: false,
        is_active: true
      },
      {
        id: 4,
        title: 'Mansión Misteriosa',
        description: 'Resuelve acertijos y descubre secretos en esta misteriosa mansión victoriana.',
        category: 'puzzle',
        difficulty: 'easy',
        status: 'available_now',
        image: '/images/mystery-mansion.jpg',
        price: 22.00,
        max_players: 4,
        duration: 45,
        working_hours_start: '10:00',
        working_hours_end: '21:00',
        working_hours: '10:00-21:00',
        is_featured: false,
        is_active: true
      },
      {
        id: 5,
        title: 'Desafío Corporativo',
        description: 'Experiencia perfecta de construcción de equipos diseñada para grupos corporativos.',
        category: 'team',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/corporate-challenge.jpg',
        price: 35.00,
        max_players: 10,
        duration: 120,
        working_hours_start: '09:00',
        working_hours_end: '20:00',
        working_hours: '09:00-20:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 6,
        title: 'Misterios de la Atlántida',
        description: '¡Nueva aventura submarina el próximo mes! Pre-reservas abiertas ahora.',
        category: 'adventure',
        difficulty: 'hard',
        status: 'pre_reservation',
        image: '/images/atlantis-mysteries.jpg',
        price: 32.00,
        max_players: 6,
        duration: 90,
        working_hours_start: '10:00',
        working_hours_end: '22:00',
        working_hours: '10:00-22:00',
        is_featured: true,
        is_active: true
      }
    ],
    uk: [
      {
        id: 1,
        title: 'Втеча з В\'язниці',
        description: 'Захоплюючий досвід кімнати втечі. Використовуйте логіку та командну роботу!',
        category: 'escape',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/prison-escape.jpg',
        price: 25.00,
        max_players: 6,
        duration: 60,
        working_hours_start: '10:00',
        working_hours_end: '22:00',
        working_hours: '10:00-22:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 2,
        title: 'Зомбі Апокаліпсис',
        description: 'Виживіть у світі зомбі! Знайдіть ліки та врятуйте людство.',
        category: 'horror',
        difficulty: 'hard',
        status: 'available_now',
        image: '/images/zombie-apocalypse.jpg',
        price: 30.00,
        max_players: 8,
        duration: 90,
        working_hours_start: '12:00',
        working_hours_end: '23:00',
        working_hours: '12:00-23:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 3,
        title: 'Піратський Скарб',
        description: 'Вирушайте в морську пригоду, щоб знайти легендарний піратський скарб!',
        category: 'adventure',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/pirate-treasure.jpg',
        price: 28.00,
        max_players: 5,
        duration: 75,
        working_hours_start: '11:00',
        working_hours_end: '22:00',
        working_hours: '11:00-22:00',
        is_featured: false,
        is_active: true
      },
      {
        id: 4,
        title: 'Таємнича Садиба',
        description: 'Розгадайте головоломки та розкрийте таємниці у цій загадковій вікторіанській садибі.',
        category: 'puzzle',
        difficulty: 'easy',
        status: 'available_now',
        image: '/images/mystery-mansion.jpg',
        price: 22.00,
        max_players: 4,
        duration: 45,
        working_hours_start: '10:00',
        working_hours_end: '21:00',
        working_hours: '10:00-21:00',
        is_featured: false,
        is_active: true
      },
      {
        id: 5,
        title: 'Корпоративний Виклик',
        description: 'Ідеальний досвід командної роботи, розроблений для корпоративних груп.',
        category: 'team',
        difficulty: 'medium',
        status: 'available_now',
        image: '/images/corporate-challenge.jpg',
        price: 35.00,
        max_players: 10,
        duration: 120,
        working_hours_start: '09:00',
        working_hours_end: '20:00',
        working_hours: '09:00-20:00',
        is_featured: true,
        is_active: true
      },
      {
        id: 6,
        title: 'Таємниці Атлантиди',
        description: 'Нова підводна пригода наступного місяця! Попередні бронювання вже відкриті.',
        category: 'adventure',
        difficulty: 'hard',
        status: 'pre_reservation',
        image: '/images/atlantis-mysteries.jpg',
        price: 32.00,
        max_players: 6,
        duration: 90,
        working_hours_start: '10:00',
        working_hours_end: '22:00',
        working_hours: '10:00-22:00',
        is_featured: true,
        is_active: true
      }
    ]
  };

  const selectedData = mockData[language as keyof typeof mockData] || mockData.en;
  console.log(`Mock data loaded: ${selectedData.length} games`);
  return selectedData;
}