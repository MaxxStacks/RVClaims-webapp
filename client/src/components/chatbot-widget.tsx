import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatbotWidget() {
  const openChatbot = () => {
    // TODO: Implement Wall Street-grade chatbot integration
    alert('Chatbot integration would connect to enterprise-grade AI platform here');
  };

  return (
    <Button
      className="chatbot-widget"
      onClick={openChatbot}
      data-testid="button-chatbot"
      aria-label="Open chatbot"
    >
      <MessageCircle size={24} />
    </Button>
  );
}
