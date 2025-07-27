// components/LanguageSwitcher.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    languages.find(lang => lang.code === i18n.language) || languages[0]
  );

  // Update current language when i18n language changes
  useEffect(() => {
    const updateCurrentLanguage = () => {
      const newLang = languages.find(lang => lang.code === i18n.language) || languages[0];
      setCurrentLanguage(newLang);
      console.log('Language updated to:', i18n.language); // Debug log
    };

    updateCurrentLanguage();
    
    // Listen for language changes
    i18n.on('languageChanged', updateCurrentLanguage);
    
    return () => {
      i18n.off('languageChanged', updateCurrentLanguage);
    };
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      console.log('Changing language to:', languageCode); // Debug log
      
      // Change language
      await i18n.changeLanguage(languageCode);
      
      // Save to localStorage
      localStorage.setItem('language', languageCode);
      
      // Update local state
      const newLang = languages.find(lang => lang.code === languageCode) || languages[0];
      setCurrentLanguage(newLang);
      
      // Close dropdown
      setIsOpen(false);
      
      console.log('Language changed successfully to:', languageCode);
      console.log('Test translation:', i18n.t('hero.title')); // Debug log
      
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-muted/50 border-border hover:bg-muted transition-colors"
        >
          <Globe className="w-4 h-4 mr-2" />
          <span className="mr-1">{currentLanguage.flag}</span>
          {currentLanguage.code.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card border-border backdrop-blur-lg min-w-[160px]"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`cursor-pointer hover:bg-muted transition-colors ${
              currentLanguage.code === language.code ? 'bg-muted/50' : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Optional: Translation Debug Component (remove in production)
export function TranslationDebug() {
  const { t, i18n } = useTranslation();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 p-3 bg-black/80 text-white text-xs rounded-lg max-w-xs">
      <div className="mb-2 font-bold">Translation Debug</div>
      <div>Language: {i18n.language}</div>
      <div>Hero Title: {t('hero.title')}</div>
      <div>Nav Contact: {t('nav.contact')}</div>
      <div className="mt-2 space-x-1">
        <button 
          onClick={() => i18n.changeLanguage('en')}
          className="px-2 py-1 bg-blue-600 rounded text-xs"
        >
          EN
        </button>
        <button 
          onClick={() => i18n.changeLanguage('es')}
          className="px-2 py-1 bg-red-600 rounded text-xs"
        >
          ES
        </button>
        <button 
          onClick={() => i18n.changeLanguage('uk')}
          className="px-2 py-1 bg-yellow-600 rounded text-xs"
        >
          UK
        </button>
      </div>
    </div>
  );
}