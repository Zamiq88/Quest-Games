import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  gameCounts: Record<string, number>;
}

const categories = ['all', 'escape', 'adventure', 'puzzle', 'horror', 'team'];

export function CategoryFilter({ activeCategory, onCategoryChange, gameCounts }: CategoryFilterProps) {
  const { t } = useTranslation();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'all': return '🎮';
      case 'escape': return '🔒';
      case 'adventure': return '⚔️';
      case 'puzzle': return '🧩';
      case 'horror': return '👻';
      case 'team': return '👥';
      default: return '🎯';
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category)}
          className={`relative transition-all duration-300 ${
            activeCategory === category
              ? 'btn-glow bg-primary text-primary-foreground shadow-glow-primary'
              : 'hover:bg-muted hover:border-primary/50'
          }`}
        >
          <span className="mr-2 text-lg">{getCategoryIcon(category)}</span>
          {t(`games.categories.${category}`)}
          
          {gameCounts[category] > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 text-xs bg-muted text-muted-foreground"
            >
              {gameCounts[category]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}