import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";

export function ContactSection() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dealershipName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    interest: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/contact", {
        ...formData,
        subject: formData.interest,
        language
      });
      
      toast({
        title: language === 'en' ? "Success!" : "Succès!",
        description: language === 'en' 
          ? "Your message has been sent. We'll contact you within 2 hours."
          : "Votre message a été envoyé. Nous vous contacterons dans les 2 heures.",
      });

      setFormData({
        dealershipName: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        interest: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: language === 'en' ? "Error" : "Erreur",
        description: language === 'en'
          ? "Failed to send message. Please try again."
          : "Échec de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section 
      id="contact" 
      className="py-20 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4" data-testid="text-contact-title">
            {t('contactSection.title')}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8" data-testid="text-contact-description">
            {t('contactSection.description')}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">
                {t('contactSection.statsValue1')}
              </div>
              <div className="text-sm text-gray-600 text-left">
                {t('contactSection.statsLabel1')}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">
                {t('contactSection.statsValue2')}
              </div>
              <div className="text-sm text-gray-600 text-left">
                {t('contactSection.statsLabel2')}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="text-primary" size={16} />
              <span>{t('contactSection.trustBadge1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-primary" size={16} />
              <span>{t('contactSection.trustBadge2')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-primary" size={16} />
              <span>{t('contactSection.trustBadge3')}</span>
            </div>
          </div>
        </div>

        {/* Hero Form */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="dealershipName" className="text-sm font-medium mb-2 block">
                  {t('contactSection.form.dealershipName')} *
                </Label>
                <Input
                  id="dealershipName"
                  value={formData.dealershipName}
                  onChange={(e) => handleChange('dealershipName', e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-dealership-name"
                />
              </div>
              
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium mb-2 block">
                  {t('contactSection.form.firstName')} *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-first-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium mb-2 block">
                  {t('contactSection.form.lastName')} *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-last-name"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  {t('contactSection.form.email')} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                  {t('contactSection.form.phone')} *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="h-11"
                  data-testid="input-phone"
                />
              </div>
              
              <div>
                <Label htmlFor="interest" className="text-sm font-medium mb-2 block">
                  {t('contactSection.form.interestLabel')} *
                </Label>
                <Select value={formData.interest} onValueChange={(value) => handleChange('interest', value)} required>
                  <SelectTrigger className="h-11" aria-label={t('contactSection.form.interestLabel')} data-testid="select-interest">
                    <SelectValue placeholder={t('contactSection.form.interestPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claims-processing" data-testid="option-claims-processing">
                      {t('contactSection.form.interests.claimsProcessing')}
                    </SelectItem>
                    <SelectItem value="revenue-optimization" data-testid="option-revenue-optimization">
                      {t('contactSection.form.interests.revenueOptimization')}
                    </SelectItem>
                    <SelectItem value="full-service" data-testid="option-full-service">
                      {t('contactSection.form.interests.fullService')}
                    </SelectItem>
                    <SelectItem value="consultation" data-testid="option-consultation">
                      {t('contactSection.form.interests.consultation')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                {t('contactSection.form.message')}
              </Label>
              <Textarea
                id="message"
                rows={3}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Tell us about your current claims volume and challenges..."
                data-testid="input-message"
              />
            </div>
            
            <Button 
              type="submit" 
              size="lg"
              className="w-full h-14 text-lg font-semibold"
              disabled={isSubmitting}
              data-testid="button-submit-contact"
            >
              {isSubmitting 
                ? (language === 'en' ? 'Sending...' : 'Envoi...')
                : t('contactSection.form.submit')
              }
            </Button>

            <p className="text-xs text-center text-gray-500 mt-4">
              {language === 'en' 
                ? "No commitment required. We'll analyze your current claims process and show you exactly where you're losing money."
                : "Aucun engagement requis. Nous analyserons votre processus de réclamations actuel et vous montrerons exactement où vous perdez de l'argent."
              }
            </p>
          </form>

          {/* Testimonial */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-700 italic mb-2">
              "{t('contactSection.testimonialQuote')}"
            </p>
            <p className="text-sm text-gray-600">
              — {t('contactSection.testimonialAuthor')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
