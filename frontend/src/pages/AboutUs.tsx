import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Mail, 
  Shield, 
  FileText, 
  Cookie,
  Scale,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe
} from 'lucide-react';

// Legal documents content with translations
const useLegalDocuments = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const documents = {
    privacy: {
      id: 'privacy',
      title: t('legal.privacy.title', 'Privacy Policy'),
      description: t('legal.privacy.description', 'Information about how we collect, use and protect your personal data.'),
      icon: <Shield className="w-5 h-5" />,
      content: {
        en: `# PRIVACY POLICY

## 1. DATA CONTROLLER IDENTIFICATION

**Data Controller:**
- **Name:** Lesia Ovcharova  
- **Tax ID (NIF):** Y8615652G
- **Address:** Calle Corredor Jerónimo Valenzuela 6, 3B
- **City:** Málaga, 29007, Spain
- **Email:** vidadenoche666@gmail.com

## 2. PURPOSES OF DATA PROCESSING

We collect data only for:
- Booking management and service provision
- Customer service and query resolution
- Commercial communications (with your consent)
- Compliance with legal obligations

## 3. USER RIGHTS

You may exercise your rights of:
- Access, rectification and erasure of data
- Restriction and portability of processing
- Opposition to processing
- Withdrawal of consent

To exercise these rights, contact: vidadenoche666@gmail.com

## 4. RETENTION AND SECURITY

- We retain your data for the time necessary for the purpose of processing
- We implement technical and organizational security measures
- We do not make international transfers without adequate safeguards

You may file a complaint with the Spanish Data Protection Agency.

---
*Last updated: January 2025*`,
        es: `# POLÍTICA DE PRIVACIDAD

## 1. IDENTIFICACIÓN DEL RESPONSABLE

**Responsable del tratamiento de datos:**
- **Nombre:** Lesia Ovcharova
- **NIF:** Y8615652G
- **Dirección:** Calle Corredor Jerónimo Valenzuela 6, 3B
- **Ciudad:** Málaga, 29007, España
- **Email:** vidadenoche666@gmail.com

## 2. FINALIDADES DEL TRATAMIENTO

Recopilamos datos únicamente para:
- Gestión de reservas y prestación del servicio
- Atención al cliente y resolución de consultas
- Comunicaciones comerciales (con su consentimiento)
- Cumplimiento de obligaciones legales

## 3. DERECHOS DE LOS USUARIOS

Puede ejercer sus derechos de:
- Acceso, rectificación y supresión de datos
- Limitación y portabilidad del tratamiento
- Oposición al tratamiento
- Retirada del consentimiento

Para ejercer estos derechos, contacte: vidadenoche666@gmail.com

## 4. CONSERVACIÓN Y SEGURIDAD

- Conservamos sus datos el tiempo necesario para la finalidad del tratamiento
- Implementamos medidas técnicas y organizativas de seguridad
- No realizamos transferencias internacionales sin garantías adecuadas

Puede presentar reclamación ante la Agencia Española de Protección de Datos.

---
*Última actualización: Enero 2025*`,
        uk: `# ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ

## 1. ІДЕНТИФІКАЦІЯ КОНТРОЛЕРА ДАНИХ

**Контролер обробки даних:**
- **Ім'я:** Лесія Овчарова
- **Податковий номер (NIF):** Y8615652G
- **Адреса:** Calle Corredor Jerónimo Valenzuela 6, 3B
- **Місто:** Малага, 29007, Іспанія
- **Email:** vidadenoche666@gmail.com

## 2. ЦІЛІ ОБРОБКИ ДАНИХ

Ми збираємо дані тільки для:
- Управління бронюваннями та надання послуг
- Обслуговування клієнтів та вирішення запитів
- Комерційних комунікацій (за вашою згодою)
- Дотримання правових зобов'язань

## 3. ПРАВА КОРИСТУВАЧІВ

Ви можете здійснювати свої права на:
- Доступ, виправлення та видалення даних
- Обмеження та переносимість обробки
- Заперечення проти обробки
- Відкликання згоди

Для здійснення цих прав звертайтеся: vidadenoche666@gmail.com

## 4. ЗБЕРІГАННЯ ТА БЕЗПЕКА

- Ми зберігаємо ваші дані час, необхідний для мети обробки
- Ми впроваджуємо технічні та організаційні заходи безпеки
- Ми не здійснюємо міжнародних передач без відповідних гарантій

Ви можете подати скаргу до Іспанського агентства захисту даних.

---
*Останнє оновлення: Січень 2025*`
      }
    },
    terms: {
      id: 'terms',
      title: t('legal.terms.title', 'Terms and Conditions'),
      description: t('legal.terms.description', 'Terms of use for our services and booking policy.'),
      icon: <FileText className="w-5 h-5" />,
      content: {
        en: `# TERMS AND CONDITIONS

## 1. SERVICE PROVIDER

**Lesia Ovcharova**
- Tax ID (NIF): Y8615652G  
- Address: Calle Corredor Jerónimo Valenzuela 6, 3B, 29007 Málaga
- Email: vidadenoche666@gmail.com

## 2. BOOKING POLICY

### Booking Process
- Only persons 18 years or older can make bookings
- Minors must be accompanied by a responsible adult
- €30 prepayment required to confirm booking

### Cancellations
- **More than 48h:** Full refund minus €5 administrative fee
- **Less than 48h:** No refund of prepayment
- **No-show:** Total amount forfeited

## 3. CONDITIONS OF USE

- Arrival 15 minutes before scheduled time
- Access prohibited while intoxicated
- Not recommended for people with cardiovascular problems, epilepsy or claustrophobia
- During the game: prohibited use of mobile phones, photography, food or drinks

## 4. LIABILITY

- Participants play at their own risk
- We are not responsible for lost or damaged items
- Intentional damages will be charged to players

## 5. RIGHT OF WITHDRAWAL

Not applicable to leisure services with specific execution date (Art. 103 RDL 1/2007).

Jurisdiction: Courts of Málaga, Spain

---
*Last updated: January 2025*`,
        es: `# TÉRMINOS Y CONDICIONES

## 1. PRESTADOR DEL SERVICIO

**Lesia Ovcharova**
- NIF: Y8615652G  
- Dirección: Calle Corredor Jerónimo Valenzuela 6, 3B, 29007 Málaga
- Email: vidadenoche666@gmail.com

## 2. POLÍTICA DE RESERVAS

### Proceso de Reserva
- Solo personas mayores de 18 años pueden realizar reservas
- Menores deben estar acompañados por adulto responsable
- Se requiere prepago de €30 para confirmar reserva

### Cancelaciones
- **Más de 48h:** Reembolso completo menos €5 gastos administrativos
- **Menos de 48h:** No se reembolsa el prepago
- **No presentarse:** Se pierde el importe total

## 3. CONDICIONES DE USO

- Llegada 15 minutos antes del horario reservado
- Prohibido acceso en estado de embriaguez
- No recomendado para personas con problemas cardiovasculares, epilepsia o claustrofobia
- Durante el juego: prohibido uso de móviles, fotografías, comida o bebidas

## 4. RESPONSABILIDAD

- Participantes juegan bajo su propia responsabilidad
- No nos responsabilizamos de objetos perdidos o dañados
- Daños intencionados serán repercutidos a los jugadores

## 5. DERECHO DE DESISTIMIENTO

No aplicable a servicios de ocio con fecha específica de ejecución (Art. 103 RDL 1/2007).

Jurisdicción: Tribunales de Málaga, España

---
*Última actualización: Enero 2025*`,
        uk: `# УМОВИ ТА ПОЛОЖЕННЯ

## 1. ПОСТАЧАЛЬНИК ПОСЛУГ

**Лесія Овчарова**
- Податковий номер (NIF): Y8615652G  
- Адреса: Calle Corredor Jerónimo Valenzuela 6, 3B, 29007 Málaga
- Email: vidadenoche666@gmail.com

## 2. ПОЛІТИКА БРОНЮВАННЯ

### Процес бронювання
- Тільки особи від 18 років можуть здійснювати бронювання
- Неповнолітні повинні супроводжуватися відповідальним дорослим
- Необхідна передоплата €30 для підтвердження бронювання

### Скасування
- **Більше 48 годин:** Повне відшкодування мінус €5 адміністративний збір
- **Менше 48 годин:** Передоплата не повертається
- **Неявка:** Втрачається повна сума

## 3. УМОВИ ВИКОРИСТАННЯ

- Прибуття за 15 хвилин до призначеного часу
- Заборонений доступ у стані сп'яніння
- Не рекомендується для людей з серцево-судинними проблемами, епілепсією або клаустрофобією
- Під час гри: заборонено використання мобільних телефонів, фотографування, їжа або напої

## 4. ВІДПОВІДАЛЬНІСТЬ

- Учасники грають на свій ризик
- Ми не несемо відповідальності за втрачені або пошкоджені речі
- Навмисні пошкодження будуть стягнуті з гравців

## 5. ПРАВО ВІДМОВИ

Не застосовується до розважальних послуг з конкретною датою виконання (Ст. 103 RDL 1/2007).

Юрисдикція: Суди Малаги, Іспанія

---
*Останнє оновлення: Січень 2025*`
      }
    },
    cookies: {
      id: 'cookies',
      title: t('legal.cookies.title', 'Cookies Policy'),
      description: t('legal.cookies.description', 'Information about cookies we use on our website.'),
      icon: <Cookie className="w-5 h-5" />,
      content: {
        en: `# COOKIES POLICY

## What are cookies?

Cookies are small files stored on your device when you visit our website to improve your browsing experience.

## Types of cookies we use

### Technical Cookies (Necessary)
- Session identification
- Temporary booking data  
- Language preferences
- **These cookies are essential and cannot be disabled**

### Analytics Cookies
- Google Analytics: To understand how users interact with the site
- **Require your consent**

### Marketing Cookies
- Facebook Pixel: For personalized advertising
- **Require your consent**

## Cookie management

You can manage cookies through:
- The consent banner when visiting the site
- Your browser settings
- Contacting us at: vidadenoche666@gmail.com

## Cookies used

| Name | Type | Duration | Purpose |
|------|------|----------|---------|
| PHPSESSID | Technical | Session | User identification |
| language | Personalization | 1 year | Preferred language |
| _ga | Analytics | 2 years | Google Analytics |
| cookie_consent | Technical | 1 year | Cookie consent |

For more information about third-party cookies, see Google and Facebook privacy policies.

---
*Last updated: January 2025*`,
        es: `# POLÍTICA DE COOKIES

## ¿Qué son las cookies?

Las cookies son pequeños archivos que se almacenan en su dispositivo cuando visita nuestro sitio web para mejorar su experiencia de navegación.

## Tipos de cookies que utilizamos

### Cookies Técnicas (Necesarias)
- Identificación de sesión
- Datos de reserva temporales  
- Preferencias de idioma
- **Estas cookies son esenciales y no pueden desactivarse**

### Cookies de Análisis
- Google Analytics: Para entender cómo los usuarios interactúan con el sitio
- **Requieren su consentimiento**

### Cookies de Marketing
- Facebook Pixel: Para publicidad personalizada
- **Requieren su consentimiento**

## Gestión de cookies

Puede gestionar las cookies a través de:
- El banner de consentimiento al visitar el sitio
- La configuración de su navegador
- Contactándonos en: vidadenoche666@gmail.com

## Cookies utilizadas

| Nombre | Tipo | Duración | Propósito |
|--------|------|----------|-----------|
| PHPSESSID | Técnica | Sesión | Identificación usuario |
| language | Personalización | 1 año | Idioma preferido |
| _ga | Analítica | 2 años | Google Analytics |
| cookie_consent | Técnica | 1 año | Consentimiento cookies |

Para más información sobre cookies de terceros, consulte las políticas de privacidad de Google y Facebook.

---
*Última actualización: Enero 2025*`,
        uk: `# ПОЛІТИКА ФАЙЛІВ COOKIE

## Що таке файли cookie?

Файли cookie - це невеликі файли, що зберігаються на вашому пристрої при відвідуванні нашого веб-сайту для покращення вашого досвіду перегляду.

## Типи файлів cookie, які ми використовуємо

### Технічні файли cookie (Необхідні)
- Ідентифікація сесії
- Тимчасові дані бронювання  
- Мовні налаштування
- **Ці файли cookie є важливими і не можуть бути відключені**

### Аналітичні файли cookie
- Google Analytics: Щоб зрозуміти, як користувачі взаємодіють із сайтом
- **Потребують вашої згоди**

### Маркетингові файли cookie
- Facebook Pixel: Для персоналізованої реклами
- **Потребують вашої згоди**

## Управління файлами cookie

Ви можете керувати файлами cookie через:
- Банер згоди при відвідуванні сайту
- Налаштування вашого браузера
- Зв'язавшись з нами: vidadenoche666@gmail.com

## Використовувані файли cookie

| Назва | Тип | Тривалість | Призначення |
|-------|-----|------------|-------------|
| PHPSESSID | Технічний | Сесія | Ідентифікація користувача |
| language | Персоналізація | 1 рік | Мова за замовчуванням |
| _ga | Аналітичний | 2 роки | Google Analytics |
| cookie_consent | Технічний | 1 рік | Згода на cookie |

Для отримання додаткової інформації про сторонні файли cookie див. політики конфіденційності Google та Facebook.

---
*Останнє оновлення: Січень 2025*`
      }
    },
    legal: {
      id: 'legal',
      title: t('legal.notice.title', 'Legal Notice'),
      description: t('legal.notice.description', 'Legal information about the website and terms of use.'),
      icon: <Scale className="w-5 h-5" />,
      content: {
        en: `# LEGAL NOTICE

## 1. IDENTIFYING DATA

In compliance with Law 34/2002 on Information Society Services:

**Website Owner:** Lesia Ovcharova
**Tax ID (NIF):** Y8615652G  
**Address:** Calle Corredor Jerónimo Valenzuela 6, 3B, 29007 Málaga
**Email:** vidadenoche666@gmail.com
**Activity:** Operation of escape rooms

## 2. CONDITIONS OF USE

Navigation through this website implies acceptance of these conditions.

### Permitted Use
- Access to information about our services
- Making bookings
- Contact with the company

### Prohibited Use
- Illicit activities or those contrary to public order
- Damage to computer systems
- Dissemination of inappropriate content

## 3. INTELLECTUAL PROPERTY

All content (texts, images, design, etc.) is property of Lesia Ovcharova and protected by copyright.

Reproduction without express authorization is prohibited.

## 4. LIABILITY

- We strive to keep information updated
- We do not guarantee continuous site availability
- We are not responsible for external link content

## 5. LEGISLATION AND JURISDICTION

- Applicable legislation: Spanish
- Competent courts: Málaga, Spain

## 6. MODIFICATIONS

We reserve the right to modify this legal notice without prior notice.

---
*Last updated: January 2025*`,
        es: `# AVISO LEGAL

## 1. DATOS IDENTIFICATIVOS

En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información:

**Titular:** Lesia Ovcharova
**NIF:** Y8615652G  
**Domicilio:** Calle Corredor Jerónimo Valenzuela 6, 3B, 29007 Málaga
**Email:** vidadenoche666@gmail.com
**Actividad:** Explotación de salas de escape room

## 2. CONDICIONES DE USO

La navegación por este sitio web implica la aceptación de estas condiciones.

### Uso Permitido
- Acceso a información sobre nuestros servicios
- Realización de reservas
- Contacto con la empresa

### Uso Prohibido
- Actividades ilícitas o contrarias al orden público
- Daños a sistemas informáticos
- Difusión de contenidos inapropiados

## 3. PROPIEDAD INTELECTUAL

Todos los contenidos (textos, imágenes, diseño, etc.) son propiedad de Lesia Ovcharova y están protegidos por derechos de autor.

Prohibida la reproducción sin autorización expresa.

## 4. RESPONSABILIDAD

- Nos esforzamos por mantener la información actualizada
- No garantizamos la disponibilidad continua del sitio
- No nos responsabilizamos del contenido de enlaces externos

## 5. LEGISLACIÓN Y JURISDICCIÓN

- Legislación aplicable: Española
- Tribunales competentes: Málaga, España

## 6. MODIFICACIONES

Nos reservamos el derecho a modificar este aviso legal sin previo aviso.

---
*Última actualización: Enero 2025*`,
        uk: `# ЮРИДИЧНЕ ПОВІДОМЛЕННЯ

## 1. ІДЕНТИФІКАЦІЙНІ ДАНІ

Відповідно до Закону 34/2002 про послуги інформаційного суспільства:

**Власник веб-сайту:** Лесія Овчарова
**Податковий номер (NIF):** Y8615652G  
**Адреса:** Calle Corredor Jerónimo Valenzuela 6, 3B, 29007 Málага
**Email:** vidadenoche666@gmail.com
**Діяльність:** Експлуатація кімнат-квестів

## 2. УМОВИ ВИКОРИСТАННЯ

Навігація по цьому веб-сайту означає прийняття цих умов.

### Дозволене використання
- Доступ до інформації про наші послуги
- Здійснення бронювань
- Контакт з компанією

### Заборонене використання
- Незаконна діяльність або діяльність, що суперечить громадському порядку
- Пошкодження комп'ютерних систем
- Поширення неприйнятного контенту

## 3. ІНТЕЛЕКТУАЛЬНА ВЛАСНІСТЬ

Весь контент (тексти, зображення, дизайн тощо) є власністю Лесії Овчарової і захищений авторськими правами.

Відтворення без явного дозволу заборонено.

## 4. ВІДПОВІДАЛЬНІСТЬ

- Ми прагнемо підтримувати інформацію оновленою
- Ми не гарантуємо безперервну доступність сайту
- Ми не несемо відповідальності за контент зовнішніх посилань

## 5. ЗАКОНОДАВСТВО ТА ЮРИСДИКЦІЯ

- Діюче законодавство: Іспанське
- Компетентні суди: Малага, Іспанія

## 6. МОДИФІКАЦІЇ

Ми залишаємо за собою право змінювати це юридичне повідомлення без попереднього повідомлення.

---
*Останнє оновлення: Січень 2025*`
      }
    }
  };

  return Object.values(documents).map(doc => ({
    ...doc,
    content: doc.content[currentLanguage] || doc.content['en'] || doc.content['es']
  }));
};

export function AboutUs() {
  const { t, i18n } = useTranslation();
  const [activeDocument, setActiveDocument] = useState(null);
  const legalDocuments = useLegalDocuments();
  const currentLanguage = i18n.language;

  const businessInfo = {
    owner: "Lesia Ovcharova",
    nif: "Y8615652G",
    address: "Calle Corredor Jerónimo Valenzuela 6, 3B",
    city: "Málaga",
    postalCode: "29007",
    province: "Málaga",
    country: "España",
    email: "vidadenoche666@gmail.com"
  };

  const toggleDocument = (documentId) => {
    setActiveDocument(activeDocument === documentId ? null : documentId);
  };

  const getLanguageName = (langCode) => {
    const languages = {
      'en': 'English',
      'es': 'Español', 
      'uk': 'Українська'
    };
    return languages[langCode] || langCode.toUpperCase();
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 text-neon">
            {t('about.title', 'About Us')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('about.subtitle', 'Learn more about our business and legal information')}
          </p>
        </div>

        {/* Language Indicator */}
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('about.currentLanguage', 'Current Language')}: {getLanguageName(currentLanguage)}
          </Badge>
        </div>

        {/* Business Information */}
        <Card className="card-glow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-primary" />
              {t('about.businessInfo', 'Business Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('about.owner', 'Business Owner')}</p>
                    <p className="text-muted-foreground">{businessInfo.owner}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('about.taxId', 'Tax ID (NIF)')}</p>
                    <p className="text-muted-foreground font-mono">{businessInfo.nif}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('about.contact', 'Contact')}</p>
                    <a 
                      href={`mailto:${businessInfo.email}`}
                      className="text-primary hover:underline"
                    >
                      {businessInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('about.address', 'Address')}</p>
                    <div className="text-muted-foreground">
                      <p>{businessInfo.address}</p>
                      <p>{businessInfo.postalCode} {businessInfo.city}</p>
                      <p>{businessInfo.province}, {businessInfo.country}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('about.compliance', 'Legal Compliance')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">GDPR</Badge>
                      <Badge variant="outline">LSSI-CE</Badge>
                      <Badge variant="outline">LOPDGDD</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal Documents */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Scale className="w-6 h-6 text-primary" />
              {t('about.legalDocuments', 'Legal Documents')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('about.legalDescription', 'Access our legal policies and terms of service')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {legalDocuments.map((doc, index) => (
                <div key={doc.id} className="border border-border rounded-lg">
                  <button
                    onClick={() => toggleDocument(doc.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {doc.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getLanguageName(currentLanguage)}
                      </Badge>
                      {activeDocument === doc.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                  
                  {activeDocument === doc.id && (
                    <div className="border-t border-border">
                      <div className="p-4 bg-muted/20">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {doc.content}
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(doc.content);
                            }}
                          >
                            {t('about.copyText', 'Copy Text')}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([doc.content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${doc.id}-policy-${currentLanguage}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('about.downloadTxt', 'Download TXT')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="card-glow mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t('about.contactUs', 'Contact Us')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">{t('about.businessInquiries', 'Business Inquiries')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('about.businessText', 'For bookings, questions about our escape rooms, or general business inquiries.')}
                </p>
                <Button asChild className="btn-glow">
                  <a href={`mailto:${businessInfo.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    {t('about.sendEmail', 'Send Email')}
                  </a>
                </Button>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">{t('about.legalInquiries', 'Legal & Privacy Inquiries')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('about.legalText', 'For questions about data protection, privacy rights, or legal matters.')}
                </p>
                <Button variant="outline" asChild>
                  <a href={`mailto:${businessInfo.email}?subject=${encodeURIComponent(t('about.legalSubject', 'Legal Inquiry'))}`}>
                    <Shield className="w-4 h-4 mr-2" />
                    {t('about.legalContact', 'Legal Contact')}
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}