import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { ArrowRight, Play, Shield, Users, Trophy, Loader2 } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

// Updated Game interface with translation support
interface Game {
  id: number;
  title_localized: string;
  description_localized: string;
  title_translations?: { [key: string]: string };
  description_translations?: { [key: string]: string };
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
  const { t, i18n } = useTranslation();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Features using your translation keys
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Safe & Secure", // Add this to your JSON files
      description: "State-of-the-art safety protocols and secure booking system."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Team Building", // Add this to your JSON files
      description: "Perfect for corporate events and team bonding experiences."
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "Award Winning", // Add this to your JSON files
      description: "Recognized as the best quest experience in the city."
    }
  ];

  // Fetch featured games function with language parameter
  const fetchFeaturedGames = async (language: string = 'en'): Promise<Game[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/games/featured/?lang=${language}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching featured games:', error);
      throw error;
    }
  };

  // Function to get localized game data
  const getLocalizedGameData = (game: Game, language: string) => {
    const title = game.title_translations?.[language] || 
                 game.title_translations?.['en'] || 
                 game.title_localized || 
                 'Untitled Game';
                 
    const description = game.description_translations?.[language] || 
                       game.description_translations?.['en'] || 
                       game.description_localized || 
                       'No description available';
    
    return {
      ...game,
      title_localized: title,
      description_localized: description
    };
  };

  // Update games when language changes
  useEffect(() => {
    if (featuredGames.length > 0) {
      const updatedGames = featuredGames.map(game => 
        getLocalizedGameData(game, i18n.language)
      );
      setFeaturedGames(updatedGames);
    }
  }, [i18n.language]);

  // Fetch featured games on component mount and language change
  useEffect(() => {
    const loadFeaturedGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const games = await fetchFeaturedGames(i18n.language);
        
        const localizedGames = games.map(game => 
          getLocalizedGameData(game, i18n.language)
        );
        
        setFeaturedGames(localizedGames);
      } catch (err) {
        console.error('Error fetching featured games:', err);
        setError(t('common.error', 'Something went wrong'));
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedGames();
  }, [t, API_BASE_URL, i18n.language]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Using your existing translation keys */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-900/30 to-background/80 z-10" />
          <img
            src={heroBackground}
            alt="Quest Game Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-orbitron font-black">
              <span className="block text-neon">{t('hero.title')}</span>
              <span className="block text-accent text-glow">{t('hero.subtitle')}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link to="/games">
                <Button size="lg" className="btn-glow bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold">
                  <Play className="w-5 h-5 mr-2" />
                  {t('hero.cta')}
                </Button>
              </Link>
              
              <Link to="/contact">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg hover:bg-muted border-primary/50">
                  {t('nav.contact')}
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
              {t('hero.featured')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our most popular and thrilling quest adventures
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">{t('common.loading')}</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={handleRetry} 
                variant="outline"
                className="border-primary/50 hover:bg-primary/10"
              >
                {t('common.retry')}
              </Button>
            </div>
          )}

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
                    No featured games available at the moment.
                  </p>
                  <Link to="/games">
                    <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
                      View All Games
                    </Button>
                  </Link>
                </div>
              )}

              {featuredGames.length > 0 && (
                <div className="text-center">
                  <Link to="/games">
                    <Button size="lg" variant="outline" className="btn-glow border-primary/50 hover:bg-primary/10">
                      View All Games
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