// src/pages/Games.tsx - Updated with API integration
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { GameCard } from '@/components/GameCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGames } from '@/hooks/useGames';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';

export function Games() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { games, loading, error, refetch } = useGames();
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [activeDifficulty, setActiveDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [activeStatus, setActiveStatus] = useState(searchParams.get('status') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
  const [showFilters, setShowFilters] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
    }
    
    if (activeDifficulty !== 'all') {
      params.set('difficulty', activeDifficulty);
    }
    
    if (activeStatus !== 'all') {
      params.set('status', activeStatus);
    }
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    
    setSearchParams(params);
  }, [activeCategory, activeDifficulty, activeStatus, searchTerm, setSearchParams]);

  // Filter games (client-side filtering since we get localized data from API)
  const filteredGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    
    return games.filter(game => {
      // Search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          game.title.toLowerCase().includes(searchLower) ||
          game.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (activeCategory !== 'all' && game.category !== activeCategory) {
        return false;
      }
      
      // Difficulty filter
      if (activeDifficulty !== 'all' && game.difficulty !== activeDifficulty) {
        return false;
      }
      
      // Status filter
      if (activeStatus !== 'all' && game.status !== activeStatus) {
        return false;
      }
      
      // Price filter
      if (game.price < priceRange[0] || game.price > priceRange[1]) {
        return false;
      }
      
      return true;
    });
  }, [games, searchTerm, activeCategory, activeDifficulty, activeStatus, priceRange]);

  // Calculate game counts per category
  const gameCounts = useMemo(() => {
    if (!games || games.length === 0) {
      return {
        all: 0,
        escape: 0,
        adventure: 0,
        puzzle: 0,
        horror: 0,
        team: 0
      };
    }

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
        counts[game.category as keyof typeof counts]++;
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

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setActiveDifficulty('all');
    setActiveStatus('all');
    setPriceRange([0, 50]);
    setSearchParams({});
  };

  const hasActiveFilters = 
    searchTerm.trim() || 
    activeCategory !== 'all' || 
    activeDifficulty !== 'all' || 
    activeStatus !== 'all' ||
    priceRange[0] !== 0 || 
    priceRange[1] !== 50;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 text-neon">
              {t('games.title', 'Our Games')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('games.subtitle', 'Discover your perfect adventure from our collection of immersive quest experiences')}
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">{t('common.loading', 'Loading games...')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2 text-red-400">
                {t('error.loadingGames', 'Error loading games')}
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={refetch} variant="outline" className="border-primary/50">
                {t('common.retry', 'Try Again')}
              </Button>
            </div>
          </div>
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
            {t('games.title', 'Our Games')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('games.subtitle', 'Discover your perfect adventure from our collection of immersive quest experiences')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('games.search', 'Search games...')}
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
              {t('games.filters', 'Filters')}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="card-glow p-6 rounded-lg space-y-6 animate-slide-in-up">
              <h3 className="font-semibold mb-4">{t('games.filterOptions', 'Filter Options')}</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('games.difficulty', 'Difficulty')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: t('difficulty.all', 'All') },
                      { key: 'easy', label: t('difficulty.easy', 'Easy') },
                      { key: 'medium', label: t('difficulty.medium', 'Medium') },
                      { key: 'hard', label: t('difficulty.hard', 'Hard') }
                    ].map((difficulty) => (
                      <Button
                        key={difficulty.key}
                        variant={activeDifficulty === difficulty.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleDifficultyChange(difficulty.key)}
                        className="capitalize"
                      >
                        {difficulty.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('games.availability', 'Availability')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: t('status.all', 'All') },
                      { key: 'available_now', label: t('status.available', 'Available Now') },
                      { key: 'pre_reservation', label: t('status.preorder', 'Pre-reservation') }
                    ].map((status) => (
                      <Button
                        key={status.key}
                        variant={activeStatus === status.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(status.key)}
                        className="capitalize"
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('games.priceRange', 'Price Range')} (€)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-20 input-glow"
                      min="0"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20 input-glow"
                      min="0"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPriceRange([0, 50])}
                    >
                      {t('games.reset', 'Reset')}
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

        {/* Results Count and Active Filters */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary/50">
              {filteredGames.length} {filteredGames.length === 1 
                ? t('games.gameFound', 'game found') 
                : t('games.gamesFound', 'games found')
              }
            </Badge>
            
            {searchTerm && (
              <Badge variant="secondary">
                {t('games.searchLabel', 'Search')}: "{searchTerm}"
              </Badge>
            )}
            
            {activeCategory !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                {t('games.categoryLabel', 'Category')}: {t(`category.${activeCategory}`, activeCategory)}
              </Badge>
            )}
            
            {activeDifficulty !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                {t('games.difficultyLabel', 'Difficulty')}: {t(`difficulty.${activeDifficulty}`, activeDifficulty)}
              </Badge>
            )}
            
            {activeStatus !== 'all' && (
              <Badge variant="secondary" className="capitalize">
                {t('games.statusLabel', 'Status')}: {t(`status.${activeStatus}`, activeStatus)}
              </Badge>
            )}
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('games.clearAll', 'Clear all')}
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
            <h3 className="text-xl font-semibold mb-2">
              {t('games.noResults', 'No games found')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? t('games.noResultsWithFilters', 'Try adjusting your search or filter criteria')
                : t('games.noGamesAvailable', 'No games are currently available')
              }
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-primary/50 hover:bg-primary/10"
              >
                {t('games.clearFilters', 'Clear all filters')}
              </Button>
            )}
          </div>
        )}

        {/* Statistics Section */}
        {games.length > 0 && (
          <section className="py-16 bg-muted/5 rounded-lg mb-8">
            <div className="text-center">
              <h3 className="text-2xl font-orbitron font-bold mb-8">
                {t('games.statistics', 'Game Statistics')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">{games.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('stats.totalGames', 'Total Games')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-accent">
                    {games.filter(g => g.is_featured).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('stats.featured', 'Featured')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-yellow-400">
                    {games.filter(g => g.status === 'available_now').length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('stats.available', 'Available Now')}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-400">
                    €{Math.min(...games.map(g => g.price))} - €{Math.max(...games.map(g => g.price))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('stats.priceRange', 'Price Range')}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}