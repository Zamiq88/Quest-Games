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
      
      // Fetch games with language parameter
      const response = await fetch(`/api/games/?lang=${language}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter out any null results (inactive games)
      const activeGames = data.filter((game: Game | null) => game !== null);
      
      setGames(activeGames);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        setGames(getMockGames(language));
      }
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
      }
    ],
    es: [
      {
        id: 1,
        title: 'Escape de la Prisión',
        description: '¡Una emocionante experiencia de escape. Usa la lógica y el trabajo en equipo para liberarte!',
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
      }
    ]
  };

  return mockData[language as keyof typeof mockData] || mockData.en;
}