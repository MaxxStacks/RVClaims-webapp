import { MessageCircle, Send, X, Phone, Mail, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import favicon from "@assets/rvclaims_favicon_1761203145358.png";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ContactFormData {
  dealershipName: string;
  contactName: string;
  email: string;
  phone: string;
}

export function ChatbotWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    dealershipName: '',
    contactName: '',
    email: '',
    phone: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        role: 'assistant',
        content: language === 'fr' 
          ? "Bonjour! Je suis l'assistant virtuel RV Claims. Je peux vous aider à comprendre nos services, nos prix et comment nous pouvons augmenter vos revenus de réclamations. Comment puis-je vous aider aujourd'hui?"
          : "Hello! I'm the RV Claims virtual assistant. I can help you understand our services, pricing, and how we can increase your claim revenue. How can I help you today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          language,
          conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage.content += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: language === 'fr'
          ? "Désolé, une erreur s'est produite. Veuillez réessayer ou nous contacter au (888) 245-3204."
          : "Sorry, an error occurred. Please try again or contact us at (888) 245-3204.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleQuickAction = (action: string) => {
    const quickMessages: Record<string, { en: string; fr: string }> = {
      pricing: {
        en: "What are your pricing plans?",
        fr: "Quels sont vos plans tarifaires?"
      },
      services: {
        en: "Tell me about your claims processing services",
        fr: "Parlez-moi de vos services de traitement des réclamations"
      },
      revenue: {
        en: "How can you help increase my claim revenue?",
        fr: "Comment pouvez-vous m'aider à augmenter mes revenus de réclamations?"
      },
      contact: {
        en: "I'd like to schedule a call",
        fr: "Je voudrais planifier un appel"
      }
    };

    const message = quickMessages[action]?.[language];
    if (message) {
      if (action === 'contact') {
        setShowContactForm(true);
      } else {
        sendMessage(message);
      }
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactMessage = language === 'fr'
      ? `Je voudrais être contacté. Nom de la concession: ${contactForm.dealershipName}, Contact: ${contactForm.contactName}, Email: ${contactForm.email}, Téléphone: ${contactForm.phone}`
      : `I'd like to be contacted. Dealership: ${contactForm.dealershipName}, Contact: ${contactForm.contactName}, Email: ${contactForm.email}, Phone: ${contactForm.phone}`;
    
    await sendMessage(contactMessage);
    setShowContactForm(false);
    setContactForm({ dealershipName: '', contactName: '', email: '', phone: '' });
  };

  return (
    <>
      {!isOpen && (
        <Button
          className="chatbot-widget"
          onClick={() => setIsOpen(true)}
          data-testid="button-chatbot"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[400px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-[1000] border border-gray-200">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={favicon} alt="RV Claims" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">RV Claims Assistant</h3>
                <p className="text-xs text-white/80">
                  {language === 'fr' ? 'En ligne maintenant' : 'Online now'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessages([]);
                  setShowContactForm(false);
                }}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                data-testid="button-new-chat"
                title={language === 'fr' ? 'Nouvelle conversation' : 'New chat'}
              >
                <RotateCcw size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                data-testid="button-close-chat"
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          {/* Contact Form or Messages */}
          {showContactForm ? (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {language === 'fr' ? 'Demande de contact' : 'Contact Request'}
              </h3>
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="dealership" className="text-sm font-medium">
                    {language === 'fr' ? 'Concession' : 'Dealership'}
                  </Label>
                  <Input
                    id="dealership"
                    value={contactForm.dealershipName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, dealershipName: e.target.value }))}
                    className="h-10 mt-1"
                    required
                    data-testid="input-contact-dealership"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="contact-name" className="text-sm font-medium">
                      {language === 'fr' ? 'Nom' : 'Name'}
                    </Label>
                    <Input
                      id="contact-name"
                      value={contactForm.contactName}
                      onChange={(e) => setContactForm(prev => ({ ...prev, contactName: e.target.value }))}
                      className="h-10 mt-1"
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      {language === 'fr' ? 'Téléphone' : 'Phone'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="h-10 mt-1"
                      required
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="h-10 mt-1"
                    required
                    data-testid="input-contact-email"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" size="default" className="flex-1" data-testid="button-submit-contact">
                    {language === 'fr' ? 'Envoyer' : 'Submit'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="default" 
                    onClick={() => setShowContactForm(false)}
                    data-testid="button-cancel-contact"
                  >
                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      }`}
                      data-testid={`message-${msg.role}-${idx}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 shadow-sm border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-gray-600">
                          {language === 'fr' ? 'En train de taper...' : 'Typing...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length === 1 && !isLoading && (
                <div className="px-4 pb-2 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2">
                    {language === 'fr' ? 'Actions rapides:' : 'Quick actions:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction('pricing')}
                      className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-lg px-3 py-2 transition-colors"
                      data-testid="button-quick-pricing"
                    >
                      {language === 'fr' ? 'Tarifs' : 'Pricing'}
                    </button>
                    <button
                      onClick={() => handleQuickAction('services')}
                      className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-lg px-3 py-2 transition-colors"
                      data-testid="button-quick-services"
                    >
                      {language === 'fr' ? 'Services' : 'Services'}
                    </button>
                    <button
                      onClick={() => handleQuickAction('revenue')}
                      className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-lg px-3 py-2 transition-colors"
                      data-testid="button-quick-revenue"
                    >
                      {language === 'fr' ? 'Revenus' : 'Revenue'}
                    </button>
                    <button
                      onClick={() => handleQuickAction('contact')}
                      className="text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-lg px-3 py-2 transition-colors"
                      data-testid="button-quick-contact"
                    >
                      {language === 'fr' ? 'Contact' : 'Contact'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === 'fr' ? 'Tapez votre message...' : 'Type your message...'}
                disabled={isLoading}
                className="flex-1 h-10"
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputValue.trim() || isLoading}
                className="h-10 px-4"
                data-testid="button-send-message"
              >
                <Send size={16} />
              </Button>
            </form>
            
            <div className="flex gap-3 mt-2 justify-center">
              <a
                href="tel:8882453204"
                className="text-xs text-gray-600 hover:text-primary flex items-center gap-1"
                data-testid="link-chat-phone"
              >
                <Phone size={12} />
                (888) 245-3204
              </a>
              <a
                href="mailto:support@rvclaims.ca"
                className="text-xs text-gray-600 hover:text-primary flex items-center gap-1"
                data-testid="link-chat-email"
              >
                <Mail size={12} />
                support@rvclaims.ca
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
