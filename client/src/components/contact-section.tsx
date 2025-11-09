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
      className="py-20 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
      }}
    >
      {/* Subtle Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900" data-testid="text-contact-title">
            {t('contactSection.title')}
          </h2>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed" data-testid="text-contact-description">
            {t('contactSection.description')}
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-primary mb-2">
              {t('contactSection.statsValue1')}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {t('contactSection.statsLabel1')}
            </div>
          </div>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center shadow-sm">
            <div className="text-4xl font-bold text-green-500 mb-2">
              {t('contactSection.statsValue2')}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {t('contactSection.statsLabel2')}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Trust Elements */}
          <div className="space-y-8">
            {/* Trust Badges */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Why Dealers Choose Us</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-green-600" size={24} />
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

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-primary" size={24} />
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

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-900/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-gray-900" size={24} />
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

            {/* Anonymous Testimonial */}
            <div className="bg-gray-900 rounded-xl p-8 shadow-lg relative">
              <Quote className="absolute top-6 right-6 text-white/10" size={48} />
              <div className="relative">
                <p className="text-white text-lg mb-4 italic leading-relaxed">
                  "{t('contactSection.testimonialQuote')}"
                </p>
                <div className="text-white/80 font-medium">
                  — {t('contactSection.testimonialAuthor')}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Lead Capture Form */}
          <div className="bg-white border-2 border-primary/20 rounded-2xl p-8 shadow-xl">
            <div className="bg-primary text-white text-center py-3 px-4 rounded-lg mb-6 font-semibold">
              Get Your Free Claims Analysis
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact">
              <div>
                <Label htmlFor="dealershipName" className="block text-sm font-medium mb-2">
                  {t('contactSection.form.dealershipName')} *
                </Label>
                <Input
                  id="dealershipName"
                  value={formData.dealershipName}
                  onChange={(e) => handleChange('dealershipName', e.target.value)}
                  required
                  className="h-12"
                  data-testid="input-dealership-name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.firstName')} *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    className="h-12"
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.lastName')} *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    className="h-12"
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.email')} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className="h-12"
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.phone')} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                    className="h-12"
                    data-testid="input-phone"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="interest" className="block text-sm font-medium mb-2">
                  {t('contactSection.form.interestLabel')} *
                </Label>
                <Select value={formData.interest} onValueChange={(value) => handleChange('interest', value)} required>
                  <SelectTrigger className="h-12" data-testid="select-interest">
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
                <Label htmlFor="message" className="block text-sm font-medium mb-2">
                  {t('contactSection.form.message')}
                </Label>
                <Textarea
                  id="message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us about your current claims volume, challenges, or goals..."
                  data-testid="input-message"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isSubmitting}
                data-testid="button-submit-contact"
              >
                {isSubmitting 
                  ? (language === 'en' ? 'Sending...' : 'Envoi...')
                  : t('contactSection.form.submit')
                }
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to receive communications from RV Claims Canada. We respect your privacy and never share your information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
