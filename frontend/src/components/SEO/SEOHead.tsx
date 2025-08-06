import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  gameData?: any;
  noIndex?: boolean;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  gameData,
  noIndex = false
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Get business info from translations
  const businessName = t('seo.businessName');
  const businessPhone = t('seo.businessPhone');
  const businessAddress = t('seo.businessAddress');
  const businessEmail = t('seo.businessEmail');
  const baseUrl = "https://vidadenoche.com"; // UPDATE with your actual domain
  
  const siteTitle = t('seo.siteTitle');
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || t('seo.defaultDescription');
  const finalKeywords = keywords || t('seo.defaultKeywords');
  
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const finalImage = image || `${baseUrl}/images/og-default.jpg`;

  // Local business structured data
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": businessName,
    "description": finalDescription,
    "url": baseUrl,
    "telephone": businessPhone,
    "email": businessEmail,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "29007 Мalaga, calle Corredor Jerónimo Valenzuela 6, 3B", // UPDATE with real address
      "addressLocality": "Málaga",
      "addressRegion": "Andalucía",
      "postalCode": "29001",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "36.7213", // UPDATE with your real coordinates
      "longitude": "-4.4214"
    },
    "openingHours": [
      "Mo-Th 16:00-23:00",
      "Fr-Sa 12:00-24:00", 
      "Su 12:00-23:00"
    ],
    "priceRange": "€€",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150"
    },
    "image": finalImage,
    "hasMap": "https://goo.gl/maps/YOURLINK" // UPDATE with your Google Maps link
  };

  // Game-specific structured data
  const gameSchema = gameData ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": gameData.title,
    "description": gameData.description,
    "image": gameData.image_url,
    "brand": {
      "@type": "Brand",
      "name": businessName
    },
    "offers": {
      "@type": "Offer",
      "price": gameData.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": businessName
      }
    }
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLang} />
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={businessName} />
      
      {/* No Index for private pages */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Geographic targeting for Málaga */}
      <meta name="geo.region" content="ES-AN" />
      <meta name="geo.placename" content="Málaga" />
      <meta name="geo.position" content="36.7213;-4.4214" />
      <meta name="ICBM" content="36.7213, -4.4214" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={currentLang === 'es' ? 'es_ES' : currentLang === 'en' ? 'en_US' : 'uk_UA'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Hreflang for multilingual SEO */}
      <link rel="alternate" hrefLang="es" href={`${baseUrl}/es${url || ''}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${url || ''}`} />
      <link rel="alternate" hrefLang="uk" href={`${baseUrl}/uk${url || ''}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${url || ''}`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      
      {gameSchema && (
        <script type="application/ld+json">
          {JSON.stringify(gameSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;