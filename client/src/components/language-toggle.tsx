import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex bg-white border border-border rounded-md overflow-hidden h-8">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none border-0 px-3 py-1 h-8 ${language === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        onClick={() => setLanguage('en')}
        data-testid="button-language-en"
      >
        EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none border-0 px-3 py-1 h-8 ${language === 'fr' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        onClick={() => setLanguage('fr')}
        data-testid="button-language-fr"
      >
        FR
      </Button>
    </div>
  );
}
