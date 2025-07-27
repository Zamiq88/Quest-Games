import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { ArrowRight, Play, Shield, Users, Trophy, Loader2 } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

// Game interface
interface Game {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  image: string;
  image_url?: string;
  price: string;
  max_players: number;
  duration: number;
  working_hours_start: string;
  working_hours_end: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function Home() {
  const { t } = useTranslation();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: t('features.safe.title', 'Safe & Secure'),
      description: t('features.safe.description', 'State-of-the-art safety protocols and secure booking system.')
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: t('features.team.title', 'Team Building'),
      description: t('features.team.description', 'Perfect for corporate events and team bonding experiences.')
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: t('features.award.title', 'Award Winning'),
      description: t('features.award.description', 'Recognized as the best quest experience in the city.')
    }
  ];

  // Fetch featured games function
  const fetchFeaturedGames = async (): Promise<Game[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/games/featured/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || data; // Handle both paginated and non-paginated responses
    } catch (error) {
      console.error('Error fetching featured games:', error);
      throw error;
    }
  };

  // Retry function for error state
  const handleRetry = () => {
    window.location.reload();
  };

  // Fetch featured games on component mount
  useEffect(() => {
    const loadFeaturedGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const games = await fetchFeaturedGames();
        setFeaturedGames(games);
      } catch (err) {
        console.error('Error fetching featured games:', err);
        setError(t('errors.fetchGames', 'Failed to load featured games. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedGames();
  }, []); // Added missing dependency array

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/30 to-background/80 z-10" />
          <img
            src={heroBackground}
            alt="Quest Game Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-orbitron font-black">
              <span className="block text-neon">{t('hero.title', 'Ultimate Quest')}</span>
              <span className="block text-accent text-glow">{t('hero.subtitle', 'Adventures')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.description', 'Immerse yourself in thrilling adventures and mind-bending puzzles. Book your unforgettable quest experience today!')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link to="/games">
                <Button size="lg" className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  {t('hero.cta', 'Start Your Quest')}
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg hover:bg-muted border-primary/50">
                  {t('nav.contact', 'Contact Us')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-10 w-12 h-12 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center space-y-4 p-6 card-glow rounded-lg"
              >
                <div className="flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-orbitron font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-orbitron font-bold mb-4 text-neon">
              {t('hero.featured', 'Featured Games')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('hero.featuredDescription', 'Experience our most popular and thrilling quest adventures')}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">{t('common.loading', 'Loading...')}</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={handleRetry} 
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
              >
                {t('common.retry', 'Try Again')}
              </Button>
            </div>
          )}

          {/* Featured Games Grid */}
          {!loading && !error && (
            <>
              {featuredGames.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {featuredGames.slice(0, 6).map((game) => (
                    <GameCard key={game.id} game={game} featured />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {t('games.noFeatured', 'No featured games available at the moment.')}
                  </p>
                  <Link to="/games">
                    <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                      {t('games.viewAll', 'View All Games')}
                    </Button>
                  </Link>
                </div>
              )}

              {featuredGames.length > 0 && (
                <div className="text-center">
                  <Link to="/games">
                    <Button size="lg" variant="outline" className="btn-glow border-primary/50 hover:bg-primary/10">
                      {t('games.viewAll', 'View All Games')}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// i18n/resources.ts - Translation resources
export const resources = {
  en: {
    translation: {
      hero: {
        title: "Ultimate Quest",
        subtitle: "Adventures",
        description: "Immerse yourself in thrilling adventures and mind-bending puzzles. Book your unforgettable quest experience today!",
        cta: "Start Your Quest",
        featured: "Featured Games",
        featuredDescription: "Experience our most popular and thrilling quest adventures"
      },
      nav: {
        contact: "Contact Us"
      },
      features: {
        safe: {
          title: "Safe & Secure",
          description: "State-of-the-art safety protocols and secure booking system."
        },
        team: {
          title: "Team Building",  
          description: "Perfect for corporate events and team bonding experiences."
        },
        award: {
          title: "Award Winning",
          description: "Recognized as the best quest experience in the city."
        }
      },
      games: {
        noFeatured: "No featured games available at the moment.",
        viewAll: "View All Games"
      },
      common: {
        loading: "Loading...",
        retry: "Try Again"
      },
      errors: {
        fetchGames: "Failed to load featured games. Please try again later."
      }
    }
  },
  es: {
    translation: {
      hero: {
        title: "Aventuras",
        subtitle: "Definitivas",
        description: "Sumérgete en aventuras emocionantes y rompecabezas que desafían la mente. ¡Reserva tu experiencia de aventura inolvidable hoy!",
        cta: "Comienza Tu Aventura",
        featured: "Juegos Destacados",
        featuredDescription: "Experimenta nuestras aventuras más populares y emocionantes"
      },
      nav: {
        contact: "Contáctanos"
      },
      features: {
        safe: {
          title: "Seguro y Protegido",
          description: "Protocolos de seguridad de vanguardia y sistema de reservas seguro."
        },
        team: {
          title: "Trabajo en Equipo",
          description: "Perfecto para eventos corporativos y experiencias de vinculación de equipos."
        },
        award: {
          title: "Premiado",
          description: "Reconocido como la mejor experiencia de aventura en la ciudad."
        }
      },
      games: {
        noFeatured: "No hay juegos destacados disponibles en este momento.",
        viewAll: "Ver Todos los Juegos"
      },
      common: {
        loading: "Cargando...",
        retry: "Intentar de Nuevo"
      },
      errors: {
        fetchGames: "Error al cargar los juegos destacados. Inténtalo de nuevo más tarde."
      }
    }
  },
  uk: {
    translation: {
      hero: {
        title: "Неймовірні",
        subtitle: "Пригоди",
        description: "Зануртесь у захоплюючі пригоди та головоломки, що викликають розум. Забронюйте свій незабутній квест сьогодні!",
        cta: "Почати Пригоду",
        featured: "Рекомендовані Ігри",
        featuredDescription: "Спробуйте наші найпопулярніші та найзахоплюючіші квест-пригоди"
      },
      nav: {
        contact: "Зв'язатися з нами"
      },
      features: {
        safe: {
          title: "Безпечно та Надійно",
          description: "Сучасні протоколи безпеки та надійна система бронювання."
        },
        team: {
          title: "Командна Робота",
          description: "Ідеально підходить для корпоративних заходів та командної згуртованості."
        },
        award: {
          title: "Нагороджений",
          description: "Визнаний як найкращий квест-досвід у місті."
        }
      },
      games: {
        noFeatured: "Наразі немає рекомендованих ігор.",
        viewAll: "Переглянути Всі Ігри"
      },
      common: {
        loading: "Завантаження...",
        retry: "Спробувати Знову"
      },
      errors: {
        fetchGames: "Не вдалося завантажити рекомендовані ігри. Спробуйте пізніше."
      }
    }
  }
};