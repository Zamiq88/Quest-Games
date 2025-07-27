
// First, install the required packages:
// npm install react-i18next i18next i18next-browser-languagedetector

// src/i18n.ts (create this file)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
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
        contact: "Contact Us",
        home: "Home",
        games: "Games",
        about: "About"
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
      categories: {
        escape: "Escape Room",
        adventure: "Adventure",
        horror: "Horror",
        mystery: "Mystery",
        action: "Action",
        puzzle: "Puzzle"
      },
      difficulty: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard"
      },
      status: {
        available: "Available Now",
        coming_soon: "Coming Soon",
        maintenance: "Maintenance",
        unavailable: "Unavailable"
      },
      badges: {
        featured: "Featured"
      },
      buttons: {
        bookNow: "Book Now",
        viewDetails: "View Details"
      },
      games: {
        noFeatured: "No featured games available at the moment.",
        viewAll: "View All Games"
      },
      common: {
        loading: "Loading...",
        retry: "Try Again",
        minutes: "min",
        upTo: "Up to"
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
        contact: "Contáctanos",
        home: "Inicio",
        games: "Juegos",
        about: "Acerca de"
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
      categories: {
        escape: "Sala de Escape",
        adventure: "Aventura",
        horror: "Terror",
        mystery: "Misterio",
        action: "Acción",
        puzzle: "Rompecabezas"
      },
      difficulty: {
        easy: "Fácil",
        medium: "Medio",
        hard: "Difícil"
      },
      status: {
        available: "Disponible Ahora",
        coming_soon: "Próximamente",
        maintenance: "Mantenimiento",
        unavailable: "No Disponible"
      },
      badges: {
        featured: "Destacado"
      },
      buttons: {
        bookNow: "Reservar Ahora",
        viewDetails: "Ver Detalles"
      },
      games: {
        noFeatured: "No hay juegos destacados disponibles en este momento.",
        viewAll: "Ver Todos los Juegos"
      },
      common: {
        loading: "Cargando...",
        retry: "Intentar de Nuevo",
        minutes: "min",
        upTo: "Hasta"
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
        contact: "Зв'язатися з нами",
        home: "Головна",
        games: "Ігри",
        about: "Про нас"
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
      categories: {
        escape: "Кімната Втечі",
        adventure: "Пригода",
        horror: "Жахи",
        mystery: "Таємниця",
        action: "Бойовик",
        puzzle: "Головоломка"
      },
      difficulty: {
        easy: "Легко",
        medium: "Середньо",
        hard: "Важко"
      },
      status: {
        available: "Доступно Зараз",
        coming_soon: "Незабаром",
        maintenance: "Технічне Обслуговування",
        unavailable: "Недоступно"
      },
      badges: {
        featured: "Рекомендований"
      },
      buttons: {
        bookNow: "Забронювати Зараз",
        viewDetails: "Переглянути Деталі"
      },
      games: {
        noFeatured: "Наразі немає рекомендованих ігор.",
        viewAll: "Переглянути Всі Ігри"
      },
      common: {
        loading: "Завантаження...",
        retry: "Спробувати Знову",
        minutes: "хв",
        upTo: "До"
      },
      errors: {
        fetchGames: "Не вдалося завантажити рекомендовані ігри. Спробуйте пізніше."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false, // Set to false to avoid loading issues
    },
    
    debug: process.env.NODE_ENV === 'development', // Enable debug in development
  });

export default i18n;