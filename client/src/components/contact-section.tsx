import { useState } from "react";
import { TrendingUp, Shield, Clock, Quote } from "lucide-react";
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
      className="py-16 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="text-contact-title">
            {t('contactSection.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-testid="text-contact-description">
            {t('contactSection.description')}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-12 mb-10">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-1">
              {t('contactSection.statsValue1')}
            </div>
            <div className="text-sm text-gray-600">
              {t('contactSection.statsLabel1')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-1">
              {t('contactSection.statsValue2')}
            </div>
            <div className="text-sm text-gray-600">
              {t('contactSection.statsLabel2')}
            </div>
          </div>
        </div>

        {/* Full Width Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-contact">
              <div>
                <Label htmlFor="dealershipName" className="text-sm font-medium mb-1.5 block">
                  {t('contactSection.form.dealershipName')} *
                </Label>
                <Input
                  id="dealershipName"
                  value={formData.dealershipName}
                  onChange={(e) => handleChange('dealershipName', e.target.value)}
                  required
                  data-testid="input-dealership-name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium mb-1.5 block">
                    {t('contactSection.form.firstName')} *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    data-testid="input-first-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium mb-1.5 block">
                    {t('contactSection.form.lastName')} *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                    {t('contactSection.form.email')} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">
                    {t('contactSection.form.phone')} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="interest" className="text-sm font-medium mb-1.5 block">
                  {t('contactSection.form.interestLabel')} *
                </Label>
                <Select value={formData.interest} onValueChange={(value) => handleChange('interest', value)} required>
                  <SelectTrigger data-testid="select-interest">
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
              
              <div>
                <Label htmlFor="message" className="text-sm font-medium mb-1.5 block">
                  {t('contactSection.form.message')}
                </Label>
                <Textarea
                  id="message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us about your dealership..."
                  data-testid="input-message"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                disabled={isSubmitting}
                data-testid="button-submit-contact"
              >
                {isSubmitting 
                  ? (language === 'en' ? 'Sending...' : 'Envoi...')
                  : t('contactSection.form.submit')
                }
              </Button>
            </form>
          </div>

          {/* Right Column - Trust Elements */}
          <div className="space-y-6">
            {/* Trust Badges */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Dealers Choose Us</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-primary" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {t('contactSection.trustBadge1')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Fast, reliable communication when you need it
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-primary" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {t('contactSection.trustBadge2')}
                    </div>
                    <div className="text-sm text-gray-600">
                      99.1% approval rate protects your bottom line
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-primary" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {t('contactSection.trustBadge3')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Your client relationships stay private
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gray-900 rounded-lg p-6">
              <Quote className="text-white/20 mb-3" size={32} />
              <p className="text-white text-sm mb-4 italic leading-relaxed">
                "{t('contactSection.testimonialQuote')}"
              </p>
              <div className="text-white/70 text-xs font-medium">
                — {t('contactSection.testimonialAuthor')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
