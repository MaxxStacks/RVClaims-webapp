import { MessageCircle, Phone, Mail, MessageSquare, ArrowLeft, Users, FileText, HelpCircle, Calculator, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";

type Department = 'sales' | 'claims' | 'technical' | 'accountsPayable' | 'accountsReceivable';

interface DepartmentInfo {
  icon: React.ComponentType<any>;
  key: Department;
}

export function ChatbotWidget() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'departments' | 'contact'>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const departments: DepartmentInfo[] = [
    { icon: Users, key: 'sales' },
    { icon: FileText, key: 'claims' },
    { icon: HelpCircle, key: 'technical' },
    { icon: Calculator, key: 'accountsPayable' },
    { icon: DollarSign, key: 'accountsReceivable' }
  ];

  const handleDepartmentSelect = (dept: Department) => {
    setSelectedDepartment(dept);
    setStep('contact');
  };

  const handleBack = () => {
    setStep('departments');
    setSelectedDepartment(null);
  };

  const handleContactMethod = (method: 'phone' | 'email' | 'chat') => {
    // This would integrate with actual contact systems
    const contactInfo = {
      phone: '1-800-RV-CLAIM',
      email: 'support@rvclaims.ca',
      chat: 'Live chat would open here'
    };

    if (method === 'phone') {
      window.open(`tel:${contactInfo.phone}`, '_self');
    } else if (method === 'email') {
      window.open(`mailto:${contactInfo.email}?subject=RV Claims Support - ${selectedDepartment}`, '_self');
    } else {
      // Chat functionality would be implemented here
      alert(`${t('chatbot.contactMethods.chat')} - Integration with live chat system would happen here`);
    }
  };

  return (
    <Dialog onOpenChange={() => { setStep('departments'); setSelectedDepartment(null); }}>
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
            {step === 'departments' ? t('chatbot.title') : t('chatbot.contactMethods.title')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'departments' 
              ? t('chatbot.description')
              : t('chatbot.contactMethods.description').replace('{department}', selectedDepartment ? t(`chatbot.departments.${selectedDepartment}`) : '')
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'departments' ? (
          <div className="space-y-3">
            {departments.map(({ icon: Icon, key }) => (
              <button
                key={key}
                onClick={() => handleDepartmentSelect(key)}
                className="w-full flex items-center space-x-4 p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                data-testid={`button-department-${key}`}
              >
                <Icon className="text-primary" size={24} />
                <div>
                  <p className="font-medium">{t(`chatbot.departments.${key}`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(`chatbot.departmentDescriptions.${key}`)}
                  </p>
                </div>
              </button>
            ))}
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
                    1-800-RV-CLAIM • {t('chatbot.phoneInfo')}
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
