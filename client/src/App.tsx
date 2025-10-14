import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import ClaimsProcessing from "@/pages/claims-processing";
import Technology from "@/pages/technology";
import RevenueServices from "@/pages/revenue-services";
import RvCoverage from "@/pages/rv-coverage";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import ClientLogin from "@/pages/client-login";
import Financing from "@/pages/financing";
import WarrantyExtendedService from "@/pages/warranty-extended-service";
import FIServices from "@/pages/fi-services";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/claims-processing" component={ClaimsProcessing} />
      <Route path="/technology" component={Technology} />
      <Route path="/revenue-services" component={RevenueServices} />
      <Route path="/rv-coverage" component={RvCoverage} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/client-login" component={ClientLogin} />
      <Route path="/financing" component={Financing} />
      <Route path="/warranty-extended-service" component={WarrantyExtendedService} />
      <Route path="/fi-services" component={FIServices} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="overflow-x-hidden w-full">
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
