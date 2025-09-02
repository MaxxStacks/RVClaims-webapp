import { useState } from "react";
import { Phone, Mail, MapPin, Code } from "lucide-react";
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
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/contact", {
        ...formData,
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
        subject: "",
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
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-contact-title">
            {t('contactSection.title')}
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-contact-description">
            {t('contactSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4" data-testid="contact-phone">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t('contactSection.phone.title')}
                  </h4>
                  <p className="text-muted-foreground">1-800-RV-CLAIM</p>
                  <p className="text-muted-foreground text-sm">
                    {t('contactSection.phone.hours')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4" data-testid="contact-email">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t('contactSection.email.title')}
                  </h4>
                  <p className="text-muted-foreground">support@rvclaims.ca</p>
                  <p className="text-muted-foreground text-sm">
                    {t('contactSection.email.response')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4" data-testid="contact-location">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t('contactSection.location.title')}
                  </h4>
                  <p className="text-muted-foreground">
                    {t('contactSection.location.address')}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t('contactSection.location.coverage')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4" data-testid="contact-development">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {t('contactSection.development.title')}
                  </h4>
                  <p className="text-muted-foreground">
                    {t('contactSection.development.address')}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t('contactSection.development.focus')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-contact">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dealershipName" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.dealershipName')}
                  </Label>
                  <Input
                    id="dealershipName"
                    value={formData.dealershipName}
                    onChange={(e) => handleChange('dealershipName', e.target.value)}
                    required
                    data-testid="input-dealership-name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      {t('contactSection.form.firstName')}
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
                    <Label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      {t('contactSection.form.lastName')}
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
                
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.email')}
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
                  <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.phone')}
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
                  <Label htmlFor="subject" className="block text-sm font-medium mb-2">
                    {t('contactSection.form.subject')}
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => handleChange('subject', value)}>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder={t('contactSection.form.subjectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="become-client" data-testid="option-become-client">
                        {t('contactSection.form.subjects.becomeClient')}
                      </SelectItem>
                      <SelectItem value="billing" data-testid="option-billing">
                        {t('contactSection.form.subjects.billing')}
                      </SelectItem>
                      <SelectItem value="technical-support" data-testid="option-technical-support">
                        {t('contactSection.form.subjects.technicalSupport')}
                      </SelectItem>
                      <SelectItem value="accounts-payable" data-testid="option-accounts-payable">
                        {t('contactSection.form.subjects.accountsPayable')}
                      </SelectItem>
                      <SelectItem value="accounts-receivable" data-testid="option-accounts-receivable">
                        {t('contactSection.form.subjects.accountsReceivable')}
                      </SelectItem>
                      <SelectItem value="feature-request" data-testid="option-feature-request">
                        {t('contactSection.form.subjects.featureRequest')}
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
                    rows={4}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    required
                    data-testid="input-message"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
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
