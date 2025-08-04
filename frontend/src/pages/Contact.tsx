import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Instagram,
  Send,
  Loader2
} from 'lucide-react';

// WhatsApp SVG Icon Component
const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.525 3.687"/>
  </svg>
);

export function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contacts data from backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/contacts/');
        const result = await response.json();
        
        if (result.success) {
          setContactData(result.data);
        } else {
          setError(result.message || t('contact.errorLoading'));
        }
      } catch (err) {
        setError(t('contact.errorLoading'));
        console.error('Error fetching contacts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t('contact.form.success'),
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  // Generate social links based on backend data
  const getSocialLinks = () => {
    if (!contactData) return [];
    
    const links = [];
    
    if (contactData.facebook_page) {
      links.push({
        name: 'facebook',
        icon: <Facebook className="w-6 h-6" />,
        url: contactData.facebook_page,
        color: 'hover:text-blue-500'
      });
    }
    
    if (contactData.instagram_page) {
      links.push({
        name: 'instagram',
        icon: <Instagram className="w-6 h-6" />,
        url: contactData.instagram_page,
        color: 'hover:text-pink-500'
      });
    }
    
    if (contactData.whatsapp_number) {
      // Format WhatsApp URL
      const whatsappUrl = `https://wa.me/${contactData.whatsapp_number.replace(/[^\d]/g, '')}?text=${encodeURIComponent("Hi! I'm interested in booking a quest game.")}`;
      
      links.push({
        name: 'whatsapp',
        icon: <WhatsAppIcon className="w-6 h-6" />,
        url: whatsappUrl,
        color: 'hover:text-green-500'
      });
    }
    
    return links;
  };

  // Updated contactInfo with proper translations
  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-primary" />,
      title: t('contact.labels.address'),
      content: contactData?.address || t('common.loading')
    },
    {
      icon: <Phone className="w-6 h-6 text-accent" />,
      title: t('contact.labels.phone'),
      content: contactData?.whatsapp_number || t('common.loading')
    },
    {
      icon: <Mail className="w-6 h-6 text-yellow-400" />,
      title: t('contact.labels.email'),
      content: contactData?.email || t('common.loading')
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t('contact.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 mb-4">{t('common.error')}: {error}</p>
              <Button onClick={() => window.location.reload()}>
                {t('contact.retry')}
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
            {t('contact.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('contact.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Business Info Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="card-glow">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {info.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{info.title}</h3>
                    <p className="text-muted-foreground text-sm">{info.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Media */}
            {getSocialLinks().length > 0 && (
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-center">{t('contact.social.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center space-x-8">
                    {getSocialLinks().map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-3 rounded-full bg-muted transition-all duration-300 hover:scale-110 ${social.color}`}
                        title={t(`contact.social.${social.name}`)}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Placeholder */}
            <Card className="card-glow">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>{t('contact.map.title')}</p>
                    <p className="text-sm">{t('contact.map.comingSoon')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron text-center">
                {t('contact.form.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('contact.form.name')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="input-glow"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('contact.form.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="input-glow"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="input-glow"
                  />
                </div>

                <div>
                  <Label htmlFor="message">{t('contact.form.message')}</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="input-glow"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-glow text-lg py-6"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {t('common.loading')}
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('contact.form.send')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}