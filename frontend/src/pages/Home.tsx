// src/pages/Home.tsx - Complete component with API integration
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { useGames } from '@/hooks/useGames';
import { ArrowRight, Play, Shield, Users, Trophy } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

export function Home() {
  const { t } = useTranslation();
  const { games, loading, error } = useGames();
  
  // Get featured games (these will already have localized titles/descriptions)
  const featuredGames = games.filter(game => game.is_featured).slice(0, 3);

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
              {t('hero.description', 'Experience thrilling escape rooms and immersive adventures in the heart of Spain')}
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
                  {t('nav.contact', 'Contact')}
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
              {t('featured.subtitle', 'Experience our most popular and thrilling quest adventures')}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted/20 rounded-lg animate-pulse card-glow">
                  <div className="p-6 space-y-4">
                    <div className="h-40 bg-muted/30 rounded-lg" />
                    <div className="h-4 bg-muted/30 rounded w-3/4" />
                    <div className="h-3 bg-muted/30 rounded w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted/30 rounded" />
                      <div className="h-3 bg-muted/30 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2 text-red-400">
                {t('common.error', 'Something went wrong')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('error.loadingGames', 'Unable to load games at the moment')}
              </p>
              <p className="text-sm text-muted-foreground/70 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="border-primary/50 hover:bg-primary/10"
              >
                {t('common.retry', 'Try Again')}
              </Button>
            </div>
          )}

          {/* Games Grid */}
          {!loading && !error && (
            <>
              {featuredGames.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {featuredGames.map((game) => (
                    <GameCard key={game.id} game={game} featured />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('games.noFeatured', 'No featured games available')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('games.checkBack', 'Check back soon for exciting new adventures!')}
                  </p>
                </div>
              )}
            </>
          )}

          {/* View All Games Button */}
          <div className="text-center">
            <Link to="/games">
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-glow border-primary/50 hover:bg-primary/10 px-8 py-4 text-lg"
                disabled={loading}
              >
                {loading 
                  ? t('common.loading', 'Loading...')
                  : t('games.viewAll', 'View All Games')
                }
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section (Optional) */}
      <section className="py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{games.length}+</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.games', 'Unique Games')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.players', 'Happy Players')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-yellow-400">4.9</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.rating', 'Average Rating')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">98%</div>
              <div className="text-sm text-muted-foreground">
                {t('stats.success', 'Success Rate')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">
            {t('cta.title', 'Ready for Your Adventure?')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('cta.description', 'Join thousands of adventurers who have discovered the thrill of our escape rooms')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/games">
              <Button size="lg" className="btn-glow bg-primary hover:bg-primary/90 px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                {t('cta.book', 'Book Now')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-primary/50 hover:bg-primary/10">
                {t('cta.learn', 'Learn More')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}