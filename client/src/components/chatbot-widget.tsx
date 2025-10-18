import { MessageCircle, Phone, Mail, MessageSquare, ArrowLeft, Users, FileText, HelpCircle, Calculator, DollarSign, Package, Shield, Briefcase, Headphones, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";

type MainCategory = 'business' | 'support' | 'accounting';
type Section = 'sales' | 'claims' | 'technical' | 'accountsPayable' | 'accountsReceivable' | 'parts' | 'extendedWarranty';

interface CategoryInfo {
  icon: React.ComponentType<any>;
  key: MainCategory;
  sections: Section[];
}

interface SectionInfo {
  icon: React.ComponentType<any>;
  key: Section;
}

export function ChatbotWidget() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'categories' | 'sections' | 'contact'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const categories: CategoryInfo[] = [
    { icon: Briefcase, key: 'business', sections: ['sales', 'extendedWarranty'] },
    { icon: Headphones, key: 'support', sections: ['claims', 'technical', 'parts'] },
    { icon: Wallet, key: 'accounting', sections: ['accountsPayable', 'accountsReceivable'] }
  ];

  const sections: SectionInfo[] = [
    { icon: Users, key: 'sales' },
    { icon: Shield, key: 'extendedWarranty' },
    { icon: FileText, key: 'claims' },
    { icon: HelpCircle, key: 'technical' },
    { icon: Package, key: 'parts' },
    { icon: Calculator, key: 'accountsPayable' },
    { icon: DollarSign, key: 'accountsReceivable' }
  ];

  const handleCategorySelect = (category: MainCategory) => {
    setSelectedCategory(category);
    setStep('sections');
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSection(section);
    setStep('contact');
  };

  const handleBack = () => {
    if (step === 'contact') {
      setStep('sections');
      setSelectedSection(null);
    } else if (step === 'sections') {
      setStep('categories');
      setSelectedCategory(null);
    }
  };

  const handleContactMethod = (method: 'phone' | 'email' | 'chat') => {
    // This would integrate with actual contact systems
    const contactInfo = {
      phone: '(888) 245-3204',
      email: 'support@rvclaims.ca',
      chat: 'Live chat would open here'
    };

    if (method === 'phone') {
      window.open(`tel:${contactInfo.phone}`, '_self');
    } else if (method === 'email') {
      window.open(`mailto:${contactInfo.email}?subject=RV Claims Support - ${selectedSection}`, '_self');
    } else {
      // Chat functionality would be implemented here
      alert(`${t('chatbot.contactMethods.chat')} - Integration with live chat system would happen here`);
    }
  };

  const getCurrentSections = () => {
    if (!selectedCategory) return [];
    const category = categories.find(c => c.key === selectedCategory);
    return sections.filter(s => category?.sections.includes(s.key));
  };

  return (
    <Dialog onOpenChange={() => { setStep('categories'); setSelectedCategory(null); setSelectedSection(null); }}>
      <DialogTrigger asChild>
        <Button
          className="chatbot-widget"
          data-testid="button-chatbot"
          aria-label="Open support chat"
        >
          <MessageCircle size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === 'categories' ? t('chatbot.title') : 
             step === 'sections' ? t('chatbot.selectSection') :
             t('chatbot.contactMethods.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'categories' 
              ? t('chatbot.description')
              : step === 'sections'
              ? t('chatbot.sectionDescription')
              : t('chatbot.contactMethods.description').replace('{department}', selectedSection ? t(`chatbot.sections.${selectedSection}`) : '')
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'categories' ? (
          <div className="space-y-3">
            {categories.map(({ icon: Icon, key }) => (
              <button
                key={key}
                onClick={() => handleCategorySelect(key)}
                className="w-full flex items-center space-x-4 p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                data-testid={`button-category-${key}`}
              >
                <Icon className="text-primary" size={24} />
                <div>
                  <p className="font-medium">{t(`chatbot.categories.${key}`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(`chatbot.categoryDescriptions.${key}`)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : step === 'sections' ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-2 text-muted-foreground hover:text-foreground"
              data-testid="button-back"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('chatbot.backButton')}
            </Button>
            <div className="space-y-3">
              {getCurrentSections().map(({ icon: Icon, key }) => (
                <button
                  key={key}
                  onClick={() => handleSectionSelect(key)}
                  className="w-full flex items-center space-x-4 p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                  data-testid={`button-section-${key}`}
                >
                  <Icon className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">{t(`chatbot.sections.${key}`)}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`chatbot.sectionDescriptions.${key}`)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-2 text-muted-foreground hover:text-foreground"
              data-testid="button-back"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('chatbot.backButton')}
            </Button>

            <div className="space-y-3">
              <button
                onClick={() => handleContactMethod('phone')}
                className="w-full flex items-center space-x-4 p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                data-testid="button-contact-phone"
              >
                <Phone className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{t('chatbot.contactMethods.phone')}</p>
                  <p className="text-sm text-muted-foreground">
                    (888) 245-3204 • {t('chatbot.phoneInfo')}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleContactMethod('email')}
                className="w-full flex items-center space-x-4 p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                data-testid="button-contact-email"
              >
                <Mail className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{t('chatbot.contactMethods.email')}</p>
                  <p className="text-sm text-muted-foreground">
                    support@rvclaims.ca • {t('chatbot.emailInfo')}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleContactMethod('chat')}
                className="w-full flex items-center space-x-4 p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                data-testid="button-contact-chat"
              >
                <MessageSquare className="text-primary" size={20} />
                <div>
                  <p className="font-medium">{t('chatbot.contactMethods.chat')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('chatbot.chatInfo')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
