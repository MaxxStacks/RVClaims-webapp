interface ChatResponse {
  keywords: string[];
  response: {
    en: string;
    fr: string;
  };
}

export const chatbotResponses: ChatResponse[] = [
  {
    keywords: ['pricing', 'price', 'cost', 'how much', 'combien', 'prix', 'tarif'],
    response: {
      en: `We offer three pricing plans:

**Essential Plan - $349/month**
Perfect for small dealers (1-2 technicians)
- Up to 25 claims/month
- Basic reporting
- Email support (24hr response)
- Single user account

**Professional Plan - $749/month** (MOST POPULAR)
Perfect for medium dealers (3-5 technicians)
- Up to 75 claims/month
- Advanced analytics & reporting
- Priority support (4hr response)
- Up to 3 user accounts
- Dedicated account manager

**Enterprise Plan - Custom Pricing**
Perfect for large dealers (6+ technicians)
- Unlimited claims
- 24/7 priority support (1hr response)
- Unlimited user accounts
- API access & custom integrations

**Save 20% with annual billing!**

We also offer add-ons: Recall Processing ($199/mo), Extended Warranty Management ($299/mo), Parts Ordering Integration ($149/mo), and more.

Would you like to speak with our team? Call (888) 245-3204 or click Contact below.`,
      fr: `Nous offrons trois plans tarifaires :

**Plan Essentiel - 349$/mois**
Parfait pour les petits concessionnaires (1-2 techniciens)
- Jusqu'à 25 réclamations/mois
- Rapports de base
- Support par email (réponse 24h)
- Compte utilisateur unique

**Plan Professionnel - 749$/mois** (LE PLUS POPULAIRE)
Parfait pour les concessionnaires moyens (3-5 techniciens)
- Jusqu'à 75 réclamations/mois
- Analytiques et rapports avancés
- Support prioritaire (réponse 4h)
- Jusqu'à 3 comptes utilisateurs
- Gestionnaire de compte dédié

**Plan Entreprise - Tarification personnalisée**
Parfait pour les grands concessionnaires (6+ techniciens)
- Réclamations illimitées
- Support prioritaire 24/7 (réponse 1h)
- Comptes utilisateurs illimités
- Accès API et intégrations personnalisées

**Économisez 20% avec la facturation annuelle!**

Nous offrons aussi des modules complémentaires : Traitement des rappels (199$/mois), Gestion de garantie prolongée (299$/mois), Intégration de commande de pièces (149$/mois), et plus.

Souhaitez-vous parler à notre équipe? Appelez le (888) 245-3204 ou cliquez sur Contact ci-dessous.`
    }
  },
  {
    keywords: ['service', 'what do you do', 'help', 'offer', 'provide', 'qu\'est-ce que', 'services', 'offrez'],
    response: {
      en: `RV Claims Canada specializes in A-Z warranty claims processing for Canadian RV dealerships. **We help dealers get PAID by manufacturers for warranty work** - protecting your bottom line and maximizing revenue.

**Our Core Services:**
- Complete warranty claims management (PDI, In-Service, Goodwill)
- Recall processing
- Technical support claims
- Parts & labor authorization
- Documentation & submission
- Follow-up & resolution

**Why Choose Us:**
- 99.1% approval rate (industry-leading)
- 500+ claims processed monthly
- 15 years of expertise
- Expert claim preparation reduces denials
- Maximize your labor and parts revenue

**Coming Soon:**
- Financing Solutions (Q2 2026)
- F&I Services (Q2 2026)
- RV Marketplace (Q1 2026)
- Live Auctions (Q3 2026)

Ready to increase your claim revenue? Call (888) 245-3204 or request contact below.`,
      fr: `RV Claims Canada se spécialise dans le traitement de réclamations de garantie de A à Z pour les concessionnaires VR canadiens. **Nous aidons les concessionnaires à être PAYÉS par les fabricants pour le travail de garantie** - protégeant vos profits et maximisant vos revenus.

**Nos Services Principaux:**
- Gestion complète des réclamations de garantie (PDI, En service, Bonne volonté)
- Traitement des rappels
- Réclamations de support technique
- Autorisation de pièces et main-d'œuvre
- Documentation et soumission
- Suivi et résolution

**Pourquoi Nous Choisir:**
- 99,1% de taux d'approbation (meilleur de l'industrie)
- 500+ réclamations traitées mensuellement
- 15 ans d'expertise
- Préparation experte réduit les refus
- Maximisez vos revenus de main-d'œuvre et pièces

**Bientôt Disponible:**
- Solutions de financement (T2 2026)
- Services F&I (T2 2026)
- Marché VR (T1 2026)
- Enchères en direct (T3 2026)

Prêt à augmenter vos revenus de réclamations? Appelez le (888) 245-3204 ou demandez un contact ci-dessous.`
    }
  },
  {
    keywords: ['revenue', 'increase', 'maximize', 'make money', 'profit', 'earn', 'get paid', 'revenus', 'augmenter', 'maximiser', 'payé'],
    response: {
      en: `**How RV Claims Increases Your Revenue:**

We help dealerships maximize warranty claim revenue through:

1. **Expert Claim Preparation** - Our 15 years of experience means we know exactly how to present claims for maximum authorization

2. **99.1% Approval Rate** - Industry-leading approval rate means more claims PAID, not denied

3. **Labor Rate Optimization** - We ensure you're billing at optimal rates for your market

4. **Parts Markup Consultation** - Maximize parts revenue while staying compliant

5. **Denial Reduction** - Expert preparation dramatically reduces costly claim denials

6. **Process Efficiency** - Faster claim processing = faster payment = better cash flow

**The Bottom Line:** We help you get paid by manufacturers for warranty work, so you're not left holding the bill. Our dealers see significant revenue increases within the first quarter.

Want to see how much revenue you're leaving on the table? Call (888) 245-3204 for a free consultation.`,
      fr: `**Comment RV Claims Augmente Vos Revenus:**

Nous aidons les concessionnaires à maximiser les revenus de réclamations de garantie grâce à :

1. **Préparation Experte des Réclamations** - Nos 15 ans d'expérience signifient que nous savons exactement comment présenter les réclamations pour une autorisation maximale

2. **99,1% de Taux d'Approbation** - Taux d'approbation leader de l'industrie signifie plus de réclamations PAYÉES, non refusées

3. **Optimisation du Taux de Main-d'œuvre** - Nous assurons que vous facturez aux taux optimaux pour votre marché

4. **Consultation sur la Marge des Pièces** - Maximisez les revenus des pièces tout en restant conforme

5. **Réduction des Refus** - La préparation experte réduit considérablement les refus coûteux de réclamations

6. **Efficacité des Processus** - Traitement plus rapide des réclamations = paiement plus rapide = meilleur flux de trésorerie

**L'Essentiel:** Nous vous aidons à être payé par les fabricants pour le travail de garantie, afin que vous ne restiez pas avec la facture. Nos concessionnaires voient des augmentations significatives de revenus dès le premier trimestre.

Vous voulez voir combien de revenus vous laissez sur la table? Appelez le (888) 245-3204 pour une consultation gratuite.`
    }
  },
  {
    keywords: ['approval rate', 'success', 'statistics', 'stats', 'taux d\'approbation', 'statistiques', 'succès'],
    response: {
      en: `**RV Claims Canada Statistics:**

- **99.1% approval rate** - Industry-leading claim authorization
- **500+ claims processed monthly** - High-volume expertise
- **15 years of experience** - Deep industry knowledge
- **Works with all major North American RV manufacturers**
- **Specialized in the Canadian RV dealership market**

Our track record speaks for itself. When you work with RV Claims, you're working with proven experts who help you get paid by manufacturers for warranty work.

Ready to improve your approval rate? Call (888) 245-3204 or request contact below.`,
      fr: `**Statistiques de RV Claims Canada:**

- **99,1% de taux d'approbation** - Autorisation de réclamations leader de l'industrie
- **500+ réclamations traitées mensuellement** - Expertise à haut volume
- **15 ans d'expérience** - Connaissance approfondie de l'industrie
- **Travaille avec tous les principaux fabricants VR nord-américains**
- **Spécialisé dans le marché des concessionnaires VR canadiens**

Notre bilan parle de lui-même. Lorsque vous travaillez avec RV Claims, vous travaillez avec des experts éprouvés qui vous aident à être payé par les fabricants pour le travail de garantie.

Prêt à améliorer votre taux d'approbation? Appelez le (888) 245-3204 ou demandez un contact ci-dessous.`
    }
  },
  {
    keywords: ['marketplace', 'buy', 'sell', 'consumer', 'b2c', 'marché'],
    response: {
      en: `**RV Marketplace - Launching Q1 2026**

Our B2C consumer-facing marketplace will connect RV buyers with trusted Canadian dealerships:

- Browse inventory from multiple dealerships
- Transparent pricing
- Financing options
- Connect directly with dealers

**Sign up for early access now!** Contact us at (888) 245-3204 or support@rvclaims.ca

While you wait, learn how our Claims Processing service can increase your dealership revenue today.`,
      fr: `**Marché VR - Lancement T1 2026**

Notre marché B2C pour consommateurs connectera les acheteurs de VR avec des concessionnaires canadiens de confiance :

- Parcourir l'inventaire de plusieurs concessionnaires
- Tarification transparente
- Options de financement
- Connexion directe avec les concessionnaires

**Inscrivez-vous dès maintenant pour un accès anticipé!** Contactez-nous au (888) 245-3204 ou support@rvclaims.ca

En attendant, découvrez comment notre service de traitement des réclamations peut augmenter les revenus de votre concessionnaire dès aujourd'hui.`
    }
  },
  {
    keywords: ['auction', 'wholesale', 'dealer to dealer', 'b2b', 'trade', 'enchères'],
    response: {
      en: `**Live Auctions - Launching Q3 2026 (January 16-18, 2026)**

Our B2B dealer-to-dealer wholesale platform will revolutionize how Canadian RV dealers trade units:

- Competitive bidding system
- Trade units between dealerships
- Verified dealer network only
- Secure transactions
- Real-time auction platform

**First auction event: January 16-18, 2026**

Interested in participating? Call (888) 245-3204 for more information.

In the meantime, discover how our Claims Processing service (available now) can boost your dealership's bottom line.`,
      fr: `**Enchères en Direct - Lancement T3 2026 (16-18 janvier 2026)**

Notre plateforme B2B de gros entre concessionnaires révolutionnera la façon dont les concessionnaires VR canadiens échangent des unités :

- Système d'enchères compétitif
- Échange d'unités entre concessionnaires
- Réseau de concessionnaires vérifiés uniquement
- Transactions sécurisées
- Plateforme d'enchères en temps réel

**Premier événement d'enchères : 16-18 janvier 2026**

Intéressé à participer? Appelez le (888) 245-3204 pour plus d'informations.

En attendant, découvrez comment notre service de traitement des réclamations (disponible maintenant) peut améliorer les résultats de votre concessionnaire.`
    }
  },
  {
    keywords: ['financing', 'f&i', 'finance', 'insurance', 'financement', 'assurance'],
    response: {
      en: `**Financing & F&I Services - Launching Q2 2026**

We're expanding our services to include:

- **Financing Solutions** - Flexible financing options for RV purchases
- **F&I Services** - Complete Finance and Insurance solutions for dealerships

These services will complement our industry-leading Claims Processing service to provide end-to-end revenue optimization for your dealership.

**Available Now:** Our Claims Processing service with 99.1% approval rate is helping dealerships maximize warranty claim revenue today.

Want to learn more or get started with Claims Processing? Call (888) 245-3204.`,
      fr: `**Solutions de Financement et Services F&I - Lancement T2 2026**

Nous élargissons nos services pour inclure :

- **Solutions de financement** - Options de financement flexibles pour les achats de VR
- **Services F&I** - Solutions complètes de finance et d'assurance pour les concessionnaires

Ces services compléteront notre service de traitement des réclamations leader de l'industrie pour fournir une optimisation des revenus de bout en bout pour votre concessionnaire.

**Disponible Maintenant:** Notre service de traitement des réclamations avec un taux d'approbation de 99,1% aide les concessionnaires à maximiser les revenus de réclamations de garantie dès aujourd'hui.

Vous voulez en savoir plus ou commencer avec le traitement des réclamations? Appelez le (888) 245-3204.`
    }
  },
  {
    keywords: ['contact', 'call', 'email', 'phone', 'reach', 'speak', 'talk', 'contacter', 'appeler', 'parler'],
    response: {
      en: `**Contact RV Claims Canada:**

📞 **Phone:** (888) 245-3204
📧 **Email:** support@rvclaims.ca

We offer bilingual support in English and French.

**Ready to get started?** Click the "Contact" quick action below to request a consultation, or call us directly at (888) 245-3204.

Our team is ready to show you how we can help increase your warranty claim revenue with our 99.1% approval rate.`,
      fr: `**Contacter RV Claims Canada:**

📞 **Téléphone:** (888) 245-3204
📧 **Courriel:** support@rvclaims.ca

Nous offrons un support bilingue en anglais et en français.

**Prêt à commencer?** Cliquez sur l'action rapide "Contact" ci-dessous pour demander une consultation, ou appelez-nous directement au (888) 245-3204.

Notre équipe est prête à vous montrer comment nous pouvons aider à augmenter vos revenus de réclamations de garantie avec notre taux d'approbation de 99,1%.`
    }
  },
  {
    keywords: ['add-on', 'addon', 'extra', 'additional', 'recall', 'extended warranty', 'parts', 'training', 'module', 'complémentaire'],
    response: {
      en: `**Available Add-Ons (All Plans):**

1. **Recall Processing** - $199/month
   Complete recall management and processing

2. **Extended Warranty Management** - $299/month
   Full extended warranty processing

3. **Parts Ordering Integration** - $149/month
   Seamless parts ordering system integration

4. **Training Package** - $499/month
   Ongoing staff training & certification programs

5. **Marketing Support** - $399/month
   Co-branded marketing materials for your dealership

6. **Advanced Analytics** - $249/month
   Deep-dive reporting & business insights

Add-ons can be combined with any plan. Call (888) 245-3204 to discuss which add-ons would benefit your dealership most.`,
      fr: `**Modules Complémentaires Disponibles (Tous les plans):**

1. **Traitement des Rappels** - 199$/mois
   Gestion et traitement complets des rappels

2. **Gestion de Garantie Prolongée** - 299$/mois
   Traitement complet de garantie prolongée

3. **Intégration de Commande de Pièces** - 149$/mois
   Intégration du système de commande de pièces sans faille

4. **Package de Formation** - 499$/mois
   Formation continue du personnel et programmes de certification

5. **Support Marketing** - 399$/mois
   Matériel marketing co-marqué pour votre concessionnaire

6. **Analytiques Avancées** - 249$/mois
   Rapports approfondis et informations commerciales

Les modules complémentaires peuvent être combinés avec n'importe quel plan. Appelez le (888) 245-3204 pour discuter des modules qui bénéficieraient le plus à votre concessionnaire.`
    }
  },
  {
    keywords: ['start', 'begin', 'get started', 'sign up', 'onboard', 'commencer', 'démarrer', 'inscrire'],
    response: {
      en: `**Getting Started with RV Claims:**

Ready to maximize your warranty claim revenue? Here's how to get started:

1. **Choose Your Plan**
   - Essential ($349/mo) - Small dealers
   - Professional ($749/mo) - Medium dealers (Most Popular)
   - Enterprise (Custom) - Large dealers

2. **Contact Us**
   - Call: (888) 245-3204
   - Email: support@rvclaims.ca
   - Or click "Contact" below

3. **Quick Onboarding**
   We'll set up your account and integrate with your workflow

4. **Start Submitting Claims**
   Begin experiencing our 99.1% approval rate immediately

**Save 20% with annual billing!**

Ready to take the next step? Click Contact below or call (888) 245-3204 now.`,
      fr: `**Démarrer avec RV Claims:**

Prêt à maximiser vos revenus de réclamations de garantie? Voici comment commencer :

1. **Choisissez Votre Plan**
   - Essentiel (349$/mois) - Petits concessionnaires
   - Professionnel (749$/mois) - Concessionnaires moyens (Le plus populaire)
   - Entreprise (Personnalisé) - Grands concessionnaires

2. **Contactez-Nous**
   - Téléphone: (888) 245-3204
   - Courriel: support@rvclaims.ca
   - Ou cliquez sur "Contact" ci-dessous

3. **Intégration Rapide**
   Nous configurerons votre compte et l'intégrerons à votre flux de travail

4. **Commencez à Soumettre des Réclamations**
   Commencez à bénéficier de notre taux d'approbation de 99,1% immédiatement

**Économisez 20% avec la facturation annuelle!**

Prêt à passer à l'étape suivante? Cliquez sur Contact ci-dessous ou appelez le (888) 245-3204 maintenant.`
    }
  }
];

export const defaultResponse = {
  en: `I'm here to help you learn about RV Claims Canada's services for Canadian RV dealerships.

**I can tell you about:**
- Our pricing plans and packages
- How we help increase your warranty claim revenue
- Our 99.1% approval rate and services
- Upcoming platforms (RV Marketplace, Live Auctions)
- Add-on services and features

**Popular questions:**
- "What are your pricing plans?"
- "How can you help increase my revenue?"
- "What services do you offer?"
- "When does the RV Marketplace launch?"

For specific questions or to speak with our team:
📞 (888) 245-3204
📧 support@rvclaims.ca

What would you like to know?`,
  fr: `Je suis ici pour vous aider à en savoir plus sur les services de RV Claims Canada pour les concessionnaires VR canadiens.

**Je peux vous parler de:**
- Nos plans tarifaires et forfaits
- Comment nous aidons à augmenter vos revenus de réclamations de garantie
- Notre taux d'approbation de 99,1% et nos services
- Plateformes à venir (Marché VR, Enchères en direct)
- Services et fonctionnalités complémentaires

**Questions populaires:**
- "Quels sont vos plans tarifaires?"
- "Comment pouvez-vous aider à augmenter mes revenus?"
- "Quels services offrez-vous?"
- "Quand le Marché VR sera-t-il lancé?"

Pour des questions spécifiques ou pour parler avec notre équipe:
📞 (888) 245-3204
📧 support@rvclaims.ca

Que souhaitez-vous savoir?`
};

export function findBestResponse(message: string, language: 'en' | 'fr' = 'en'): string {
  const lowerMessage = message.toLowerCase();
  
  for (const response of chatbotResponses) {
    for (const keyword of response.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return response.response[language];
      }
    }
  }
  
  return defaultResponse[language];
}
