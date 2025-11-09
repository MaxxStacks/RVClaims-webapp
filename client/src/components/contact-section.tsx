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
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900" data-testid="text-contact-title">
            {t('contactSection.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto" data-testid="text-contact-description">
            {t('contactSection.description')}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {t('contactSection.statsValue1')}
            </div>
            <div className="text-sm text-gray-600">
              {t('contactSection.statsLabel1')}
            </div>
          </div>
          <div className="w-px h-12 bg-gray-300"></div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {t('contactSection.statsValue2')}
            </div>
            <div className="text-sm text-gray-600">
              {t('contactSection.statsLabel2')}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Trust Elements (1/3) */}
          <div className="space-y-6">
            {/* Trust Badges */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Why Dealers Choose Us</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {t('contactSection.trustBadge1')}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="text-primary mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {t('contactSection.trustBadge2')}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="text-gray-900 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {t('contactSection.trustBadge3')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Anonymous Testimonial */}
            <div className="bg-gray-900 rounded-lg p-5">
              <Quote className="text-white/20 mb-2" size={24} />
              <p className="text-white text-sm mb-3 italic leading-relaxed">
                "{t('contactSection.testimonialQuote')}"
              </p>
              <div className="text-white/70 text-xs font-medium">
                — {t('contactSection.testimonialAuthor')}
              </div>
            </div>
          </div>

          {/* Right Column - Lead Capture Form (2/3) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-contact">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div>
                <Label htmlFor="message" className="text-sm font-medium mb-1.5 block">
                  {t('contactSection.form.message')}
                </Label>
                <Textarea
                  id="message"
                  rows={2}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us about your dealership..."
                  data-testid="input-message"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold bg-green-500 hover:bg-green-600 text-white"
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
        </div>
      </div>
    </section>
  );
}
