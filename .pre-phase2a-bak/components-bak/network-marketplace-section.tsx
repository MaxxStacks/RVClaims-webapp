import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { ServiceBadge } from "@/components/service-badge";
import { Network, TrendingUp, Users, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertNetworkWaitlistSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function NetworkMarketplaceSection() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertNetworkWaitlistSchema),
    defaultValues: {
      email: "",
      dealershipName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: { email: string; dealershipName?: string }) => {
      const response = await fetch("/api/network-waitlist", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to join waitlist");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to the waitlist. We'll notify you when the network launches in 2026.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { email: string; dealershipName?: string }) => {
    mutation.mutate(data);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="mb-6">
            <ServiceBadge quarter="Q1" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground" data-testid="text-network-title">
            {t('networkMarketplace.title')}
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8" data-testid="text-network-subtitle">
            {t('networkMarketplace.subtitle')}
          </p>
        </div>

        {/* Feature Cards with Border Design */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="relative group" data-testid="card-network-feature-1">
            <div className="absolute inset-0 bg-primary/5 rounded-lg transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Network className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center">Nationwide Network</h3>
              <p className="text-sm text-muted-foreground text-center">Connect with verified dealers across North America</p>
            </div>
          </div>

          <div className="relative group" data-testid="card-network-feature-2">
            <div className="absolute inset-0 bg-primary/5 rounded-lg transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center">Boost Sales</h3>
              <p className="text-sm text-muted-foreground text-center">Move inventory faster and increase revenue</p>
            </div>
          </div>

          <div className="relative group" data-testid="card-network-feature-3">
            <div className="absolute inset-0 bg-primary/5 rounded-lg transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center">Trusted Ecosystem</h3>
              <p className="text-sm text-muted-foreground text-center">Verified dealers with transparent transaction history</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center border border-border">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Be First to Access the Network</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the waitlist for exclusive early access to the Dealer Suite 360 Network Marketplace in 2026
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setOpen(true)}
              className="gap-2"
              data-testid="button-network-join"
            >
              {t('networkMarketplace.cta.primary')}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild 
              data-testid="button-network-contact"
            >
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md" data-testid="dialog-network-waitlist">
            <DialogHeader>
              <DialogTitle className="text-2xl">Join the Waitlist</DialogTitle>
              <DialogDescription>
                Be among the first dealers to access the Dealer Suite 360 Network Marketplace when it launches in 2026.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          type="email"
                          data-testid="input-waitlist-email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dealershipName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dealership Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your Dealership Name" 
                          data-testid="input-waitlist-dealership"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                    data-testid="button-waitlist-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={mutation.isPending}
                    data-testid="button-waitlist-submit"
                  >
                    {mutation.isPending ? "Joining..." : "Join Waitlist"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
