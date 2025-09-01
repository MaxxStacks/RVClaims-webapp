import { MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";

export function ChatbotWidget() {
  const { t, language } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="chatbot-widget"
          data-testid="button-chatbot"
          aria-label="Open support chat"
        >
          <MessageCircle size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {language === 'en' ? 'Get Expert Support' : 'Obtenir un support expert'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Our claims experts are ready to help you optimize your RV warranty revenue. Contact us directly for immediate assistance.'
              : 'Nos experts en réclamations sont prêts à vous aider à optimiser vos revenus de garantie VR. Contactez-nous directement pour une assistance immédiate.'
            }
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
              <Phone className="text-primary" size={20} />
              <div>
                <p className="font-medium">1-800-RV-CLAIM</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Mon-Fri, 8AM-6PM EST' : 'Lun-Ven, 8h-18h EST'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-accent rounded-lg">
              <Mail className="text-primary" size={20} />
              <div>
                <p className="font-medium">claims@rvclaimtrack.ca</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Response within 2 hours' : 'Réponse sous 2 heures'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
