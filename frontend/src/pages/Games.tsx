import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { GameCard } from '@/components/GameCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, SlidersHorizontal, Loader2 } from 'lucide-react';

export function Games() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activeDifficulty, setActiveDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [showFilters, setShowFilters] = useState(false);
  
  // State for API data
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      
      if (activeDifficulty !== 'all') {
        params.append('difficulty', activeDifficulty);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const queryString = params.toString();
      const url = `api/games/${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGames(data.results || data); // Handle both paginated and non-paginated responses
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch games on mount and when filters change
  useEffect(() => {
    fetchGames();
  }, [activeCategory, activeDifficulty, searchTerm]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
    }
    
    if (activeDifficulty !== 'all') {
      params.set('difficulty', activeDifficulty);
    }
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    
    setSearchParams(params);
  }, [activeCategory, activeDifficulty, searchTerm, setSearchParams]);

  // Filter games by price range (client-side filtering)
  const filteredGames = useMemo(() => {
    return games.filter(game =>
      game.price >= priceRange[0] && game.price <= priceRange[1]
    );
  }, [games, priceRange]);

  // Calculate game counts per category (you might want to get this from a separate API endpoint)
  const gameCounts = useMemo(() => {
    const counts = {
      all: games.length,
      escape: 0,
      adventure: 0,
      puzzle: 0,
      horror: 0,
      team: 0
    };

    games.forEach(game => {
      if (counts.hasOwnProperty(game.category)) {
        counts[game.category]++;
      }
    });

    return counts;
  }, [games]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setActiveDifficulty(difficulty);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setActiveDifficulty('all');
    setPriceRange([0, 300]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading games...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Error loading games</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchGames} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 text-neon">
            {t('games.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your perfect adventure from our collection of immersive quest experiences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 input-glow"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hover:bg-muted"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="card-glow p-6 rounded-lg space-y-4 animate-slide-in-up">
              <h3 className="font-semibold mb-4">Filter Options</h3>
              
              <div className="space-y-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={activeDifficulty === difficulty ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDifficultyChange(difficulty)}
                        className="capitalize"
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-20 input-glow"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20 input-glow"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriceRange([0, 300])}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          gameCounts={gameCounts}
        />

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary/50">
              {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} found
            </Badge>
            {searchTerm && (
              <Badge variant="secondary">
                Search: "{searchTerm}"
              </Badge>
            )}
            {activeCategory !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                Category: {activeCategory}
              </Badge>
            )}
            {activeDifficulty !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                Difficulty: {activeDifficulty}
              </Badge>
            )}
          </div>
          
          {(searchTerm || activeCategory !== 'all' || activeDifficulty !== 'all' || 
            priceRange[0] !== 0 || priceRange[1] !== 300) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}