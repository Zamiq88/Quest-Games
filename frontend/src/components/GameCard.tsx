import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Clock, Users, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Game } from '@/types/game';

interface GameCardProps {
  game: Game;
  featured?: boolean;
}

export function GameCard({ game, featured = false }: GameCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if description needs truncation (adjust character limit as needed)
  const DESCRIPTION_LIMIT = 120;
  const needsTruncation = game.description.length > DESCRIPTION_LIMIT;
  const displayDescription = isExpanded || !needsTruncation 
    ? game.description 
    : `${game.description.slice(0, DESCRIPTION_LIMIT)}...`;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'escape': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'adventure': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'puzzle': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'horror': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'team': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any parent link navigation
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={`card-glow group overflow-hidden ${featured ? 'ring-2 ring-primary/50' : ''}`}>
      <CardHeader className="p-0 relative">
        <div className="aspect-video overflow-hidden">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        
        {featured && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-accent text-accent-foreground font-bold">
              <Star className="w-3 h-3 mr-1" />
              {t('games.featured', 'Featured')}
            </Badge>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge className={getCategoryColor(game.category)}>
            {t(`games.categories.${game.category}`, game.category)}
          </Badge>
          <Badge className={getDifficultyColor(game.difficulty)}>
            {t(`difficulty.${game.difficulty}`, game.difficulty)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-orbitron font-bold mb-3 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        
        <div className="mb-4">
          <p className={`text-muted-foreground transition-all duration-300 ${
            isExpanded ? 'line-clamp-none' : 'line-clamp-2'
          }`}>
            {displayDescription}
          </p>
          
          {needsTruncation && (
            <button
              onClick={toggleExpanded}
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mt-2 font-medium"
            >
              {isExpanded ? (
                <>
                  {t('common.showLess', 'Show less')}
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  {t('common.showMore', 'Show more')}
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{t('games.duration', { duration: game.duration })}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{t('games.maxPlayers', { max_players: game.max_players })}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            {t('games.price', { price: game.price })}
            <span className="text-sm text-muted-foreground ml-1">
              {game.category === 'team' ? t('games.perGroup') : t('games.perPerson')}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Link to={`/reservations?game=${game.id}`} className="w-full">
          <Button className="w-full btn-glow bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            {t('games.bookNow', 'Book Now')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}