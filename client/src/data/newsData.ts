export type NewsCategory = 'company' | 'product' | 'industry';

export interface NewsArticle {
  id: string;
  date: string;
  category: NewsCategory;
  image: string;
  en: {
    title: string;
    summary: string;
    content: string;
  };
  fr: {
    title: string;
    summary: string;
    content: string;
  };
}

export const newsArticles: NewsArticle[] = [
  {
    id: 'ds360-secures-11-million-funding',
    date: '2026-03-18',
    category: 'company',
    image: '',
    en: {
      title: 'DealerSuite 360 Secures $1.1 Million in Private Funding to Reshape the North American RV Industry',
      summary: 'DealerSuite 360 has secured $1.1 million in private funding to accelerate product development, expand the engineering team, and drive North American market expansion — starting with Canada.',
      content: `<p>DealerSuite 360, the all-in-one dealership operating platform purpose-built for the RV industry, today announced the close of $1.1 million in private funding. The capital will be deployed over the next 18 months to accelerate product development, grow the engineering team, and fund an aggressive North American expansion strategy beginning in Canada, with the United States to follow.</p>

<p>The investment marks a defining moment for a platform that was born out of a simple but frustrating truth: RV dealerships have been underserved by technology for decades. Fragmented tools, manual processes, and a complete absence of AI-powered intelligence have left dealers managing complex operations — warranty claims, financing, F&I, customer portals — across a patchwork of disconnected software and spreadsheets.</p>

<p>"We built DealerSuite 360 because dealers deserve better," said Jonathan, CEO of DealerSuite 360 and founder of Maxx Stacks, the technology advisory firm behind the platform. "The RV industry is a multi-billion dollar market that has been largely ignored by modern software. We're changing that — one module at a time — until dealers have a single platform that handles everything from the moment a unit arrives on the lot to the day it leaves the customer's driveway."</p>

<p>The funding validates both the scale of the market opportunity and the team's capacity to execute. With approximately 7,400 RV dealerships operating across North America and a combined industry revenue approaching $56 billion, the addressable market is substantial — and the competitive landscape remains wide open. No existing platform combines AI-powered operations, outsourced claims processing, and a full dealership service ecosystem in a single subscription.</p>

<p>The capital will be allocated across four priorities: continued development of core platform modules, expansion of the AI intelligence layer, infrastructure to support the dealer network at scale, and a go-to-market effort targeting Canadian dealerships in the 2026 operating season.</p>

<p>Critically, DealerSuite 360 is not starting from zero. The platform is already in active beta with its first dealer partner, with the dealersuite360.com claims processing module live and processing real transactions. That operational foundation — combined with new capital — positions the company to move fast.</p>

<p>The US market expansion, planned under the DealerSuite 360 brand, is targeted for Q3 2026. International expansion and enterprise licensing are under consideration for 2027.</p>

<p>For dealerships interested in joining the platform, early access sign-ups are open at dealersuite360.com. New clients who sign up before April 30, 2026 are eligible for a 5% discount on claim fees, parts, and services.</p>`,
    },
    fr: {
      title: "DealerSuite 360 obtient 1,1 million de dollars en financement privé pour transformer l\u2019industrie du VR en Amérique du Nord",
      summary: 'DealerSuite 360 a sécurisé un financement privé de 1,1 million de dollars pour accélérer le développement de ses produits, agrandir son équipe d\'ingénierie et piloter son expansion en Amérique du Nord — en commençant par le Canada.',
      content: `<p>DealerSuite 360, la plateforme opérationnelle tout-en-un conçue spécifiquement pour l'industrie du VR, annonce aujourd'hui la clôture d'un financement privé de 1,1 million de dollars. Ce capital sera déployé sur les 18 prochains mois afin d'accélérer le développement des produits, d'agrandir l'équipe d'ingénierie et de financer une stratégie d'expansion agressive en Amérique du Nord, débutant au Canada et s'étendant ensuite aux États-Unis.</p>

<p>Cet investissement marque un moment décisif pour une plateforme née d'une réalité simple mais frustrante : les concessionnaires de VR ont été mal desservis par la technologie pendant des décennies. Des outils fragmentés, des processus manuels et l'absence totale d'intelligence artificielle ont contraint les concessionnaires à gérer des opérations complexes — réclamations de garantie, financement, F&A, portails clients — à travers un patchwork de logiciels déconnectés et de feuilles de calcul.</p>

<p>« Nous avons construit DealerSuite 360 parce que les concessionnaires méritent mieux », a déclaré Jonathan, PDG de DealerSuite 360 et fondateur de Maxx Stacks, la firme de conseil en technologie à l'origine de la plateforme. « L'industrie du VR est un marché de plusieurs milliards de dollars qui a été largement ignoré par les logiciels modernes. Nous changeons cela — module par module — jusqu'à ce que les concessionnaires disposent d'une seule plateforme qui gère tout, depuis le moment où une unité arrive sur le terrain jusqu'au jour où elle quitte l'allée du client. »</p>

<p>Ce financement valide à la fois l'ampleur de l'opportunité de marché et la capacité de l'équipe à exécuter. Avec environ 7 400 concessionnaires de VR opérant en Amérique du Nord et un chiffre d'affaires combiné de l'industrie avoisinant les 56 milliards de dollars, le marché adressable est considérable — et le paysage concurrentiel reste largement ouvert. Aucune plateforme existante ne combine opérations propulsées par l'IA, traitement externalisé des réclamations et écosystème complet de services pour concessionnaires dans un seul abonnement.</p>

<p>Le capital sera alloué à quatre priorités : le développement continu des modules de la plateforme principale, l'expansion de la couche d'intelligence artificielle, l'infrastructure pour soutenir le réseau de concessionnaires à grande échelle, et une mise sur le marché ciblant les concessionnaires canadiens pour la saison d'exploitation 2026.</p>

<p>DealerSuite 360 ne part pas de zéro. La plateforme est déjà en bêta active avec son premier partenaire concessionnaire, le module de traitement des réclamations dealersuite360.com étant en production et traitant de vraies transactions. Cette base opérationnelle — combinée au nouveau capital — positionne l'entreprise pour avancer rapidement.</p>

<p>L'expansion sur le marché américain, prévue sous la marque DealerSuite 360, est ciblée pour le troisième trimestre 2026. L'expansion internationale et les licences d'entreprise sont envisagées pour 2027.</p>`,
    },
  },
  {
    id: 'introducing-dealsersuite-360-all-in-one-platform',
    date: '2026-03-15',
    category: 'product',
    image: '',
    en: {
      title: 'Introducing DealerSuite 360: The All-in-One Platform Built for RV Dealerships',
      summary: 'DealerSuite 360 is a modular, AI-powered SaaS platform designed from the ground up for RV dealerships — covering everything from warranty claims to F&I, live auctions, and branded customer portals.',
      content: `<p>Today, we're giving the broader industry its first comprehensive look at DealerSuite 360 — the platform we've been building, refining, and testing with our first dealer partner over the past year. What started as a specialized claims processing tool has grown into something far more ambitious: a complete dealership operating system.</p>

<h3>One Platform. Every Service.</h3>

<p>DealerSuite 360 is a modular, all-in-one SaaS platform designed specifically for RV dealerships. Unlike legacy DMS software that was built for automotive and retrofitted for RV, we started from scratch — with the unique workflows, claim types, manufacturer relationships, and customer expectations of the RV industry at the center of every design decision.</p>

<p>The platform is organized into five core module categories:</p>

<ul>
  <li><strong>Warranty Claims Management</strong> — A-Z processing for DAF, PDI, Warranty, Extended Warranty, and Insurance claims across all major manufacturers</li>
  <li><strong>Financial Services</strong> — Financing integration, F&I outsourcing, and extended warranty plan management</li>
  <li><strong>Revenue Growth Tools</strong> — Digital marketing, parts management, service department support, and trade-in programs</li>
  <li><strong>Dealer Marketplace & Live Auctions</strong> — Dealer-to-dealer inventory listings and live bidding for new, used, and overstock units</li>
  <li><strong>Consumer Direct Services</strong> — Roadside assistance, extended warranty, and protection packages sold directly to RV owners</li>
</ul>

<h3>Built for Three Layers of Users</h3>

<p>DealerSuite 360 operates across a three-layer architecture: Operator (us), Dealer, and Customer. Each layer has its own portal, its own permissions, and its own view of the data. Dealer groups and service providers get full oversight. Individual dealers see only their own data. Customers see only what their dealer chooses to share. Multi-tenant isolation is absolute.</p>

<h3>White-Label by Default</h3>

<p>Every dealer on DealerSuite 360 gets a white-label customer portal — fully branded with their logo, colors, and custom domain via CNAME. To the end customer, they're interacting with their dealer's platform, not a third-party SaaS product. That brand consistency builds trust and drives customer retention.</p>

<h3>Modern Architecture. No Retrofitting.</h3>

<p>The platform is built on React 18, TypeScript, Node.js, and PostgreSQL — with AI deeply embedded throughout, not bolted on as an afterthought. We're currently in beta in Canada, with the US market expansion under the DealerSuite 360 brand planned for Q3 2026.</p>

<p>Sign-ups are open at dealersuite360.com. Dealers who join before April 30, 2026 receive a 5% discount on claim fees, parts, and services for the season.</p>`,
    },
    fr: {
      title: 'Présentation de DealerSuite 360 : La plateforme tout-en-un conçue pour les concessionnaires de VR',
      summary: 'DealerSuite 360 est une plateforme SaaS modulaire propulsée par l\'IA, conçue de zéro pour les concessionnaires de VR — couvrant tout, des réclamations de garantie au F&A, aux enchères en direct et aux portails clients personnalisés.',
      content: `<p>Aujourd'hui, nous offrons à l'industrie un premier aperçu complet de DealerSuite 360 — la plateforme que nous avons construite, affinée et testée avec notre premier partenaire concessionnaire au cours de la dernière année. Ce qui a commencé comme un outil spécialisé de traitement des réclamations s'est transformé en quelque chose de bien plus ambitieux : un système d'exploitation complet pour les concessionnaires.</p>

<h3>Une plateforme. Tous les services.</h3>

<p>DealerSuite 360 est une plateforme SaaS modulaire tout-en-un conçue spécifiquement pour les concessionnaires de VR. Contrairement aux logiciels DMS hérités construits pour l'automobile et adaptés au VR, nous avons tout construit à partir de zéro — avec les flux de travail uniques, les types de réclamations, les relations avec les fabricants et les attentes des clients de l'industrie du VR au centre de chaque décision de conception.</p>

<p>La plateforme est organisée en cinq catégories de modules principaux :</p>

<ul>
  <li><strong>Gestion des réclamations de garantie</strong> — Traitement de A à Z pour les réclamations DAF, PDI, Garantie, Garantie prolongée et Assurance auprès de tous les principaux fabricants</li>
  <li><strong>Services financiers</strong> — Intégration du financement, externalisation du F&A et gestion des plans de garantie prolongée</li>
  <li><strong>Outils de croissance des revenus</strong> — Marketing numérique, gestion des pièces, support du service après-vente et programmes de reprise</li>
  <li><strong>Marché des concessionnaires et enchères en direct</strong> — Listes d'inventaire entre concessionnaires et enchères en direct pour les unités neuves, usagées et en surplus</li>
  <li><strong>Services directs aux consommateurs</strong> — Assistance routière, garantie prolongée et forfaits de protection vendus directement aux propriétaires de VR</li>
</ul>

<h3>Conçu pour trois niveaux d'utilisateurs</h3>

<p>DealerSuite 360 fonctionne sur une architecture à trois niveaux : Opérateur (nous), Concessionnaire et Client. Chaque niveau possède son propre portail, ses propres permissions et sa propre vue des données. Les groupes de concessionnaires et les prestataires de services bénéficient d'une surveillance complète. Les concessionnaires individuels ne voient que leurs propres données. Les clients ne voient que ce que leur concessionnaire choisit de partager. L'isolation multi-locataires est absolue.</p>

<h3>Marque blanche par défaut</h3>

<p>Chaque concessionnaire sur DealerSuite 360 bénéficie d'un portail client en marque blanche — entièrement personnalisé avec leur logo, leurs couleurs et leur domaine personnalisé via CNAME. Pour le client final, il interagit avec la plateforme de son concessionnaire, et non avec un produit SaaS tiers. Cette cohérence de marque renforce la confiance et fidélise les clients.</p>

<h3>Architecture moderne. Sans adaptation forcée.</h3>

<p>La plateforme est construite sur React 18, TypeScript, Node.js et PostgreSQL — avec l'IA profondément intégrée tout au long, et non ajoutée en tant qu'accessoire. Nous sommes actuellement en bêta au Canada, avec l'expansion sur le marché américain sous la marque DealerSuite 360 prévue pour le troisième trimestre 2026.</p>`,
    },
  },
  {
    id: 'ai-powering-rv-dealership-operations',
    date: '2026-03-12',
    category: 'product',
    image: '',
    en: {
      title: 'How AI is Powering the Future of RV Dealership Operations',
      summary: 'DealerSuite 360 is embedding AI throughout its platform as core operational tooling — from an AI F&I Presenter that handles remote product presentations to a Document Scanner that reads warranty certificates and auto-populates claims.',
      content: `<p>When we talk about AI at DealerSuite 360, we're not talking about a chatbot answering FAQs or a dashboard widget that surfaces basic analytics. We're talking about AI embedded into the core operational workflows of a dealership — replacing manual, error-prone tasks with intelligent automation that makes every team member more effective and every customer interaction more personalized.</p>

<p>Here's a detailed look at three AI capabilities currently in active development for 2026 release:</p>

<h3>AI F&I Presenter</h3>

<p>The Finance and Insurance product presentation is one of the most revenue-critical — and notoriously inconsistent — interactions in a dealership. DealerSuite 360's AI F&I Presenter replaces the in-person presentation with a live video AI avatar that handles remote F&I product presentations with the precision and consistency of your best F&I manager, available at any hour.</p>

<p>Here's how it works: after a deal is structured, the dealer generates a personalized presentation link tied to the customer's profile. The AI avatar greets the customer by name, already knows their unit, financing terms, and deal details. It walks through the product portfolio — GAP insurance, extended warranties, protection packages — adapts its pace to the customer, handles objections in real time, and answers questions. Products the customer accepts auto-sync directly to the dealer's portal for one-click finalization. No paperwork delay. No inconsistent pitch.</p>

<h3>AI Document Scanner</h3>

<p>Dealerships handle enormous volumes of paperwork: warranty certificates, manufacturer correspondence, inspection reports, invoices, and more. The AI Document Scanner transforms this paper trail into structured, searchable data automatically.</p>

<p>Scan any document — physical or digital — and the AI extracts the relevant data and auto-populates fields across the platform. More importantly, it detects the VIN from any scanned document and automatically files it to the correct unit record. A warranty certificate scanned on Monday is linked to the right unit, the right claim, and the right dealer by the time the morning coffee is poured.</p>

<h3>AI Unit Tag Scanner (Mobile)</h3>

<p>Every RV has a physical VIN and specification tag on its exterior. Getting that data into the system typically means manual transcription — a slow, error-prone process that creates downstream problems throughout the unit's lifecycle. The AI Unit Tag Scanner solves this at intake.</p>

<p>Using the DealerSuite 360 mobile app, a technician or lot staff member simply points their camera at the tag. The AI reads the VIN, weight ratings, brand, model, year, and configuration data — and auto-populates the unit dashboard in seconds. No manual entry. No transcription errors. The unit is in the system before the lot manager walks back inside.</p>

<p>These are not future promises or roadmap aspirations — they are actively in development, with scheduled release windows in 2026. Each capability represents a direct reduction in manual labor, a direct improvement in data quality, and a direct increase in dealership revenue efficiency.</p>`,
    },
    fr: {
      title: "Comment l\u2019IA propulse l\u2019avenir des opérations des concessionnaires de VR",
      summary: 'DealerSuite 360 intègre l\'IA dans toute sa plateforme comme outil opérationnel central — d\'un Présentateur F&A IA qui gère les présentations de produits à distance à un Scanneur de documents qui lit les certificats de garantie et remplit automatiquement les réclamations.',
      content: `<p>Lorsque nous parlons d'IA chez DealerSuite 360, nous ne parlons pas d'un chatbot répondant à des FAQ ou d'un widget de tableau de bord affichant des analyses de base. Nous parlons d'une IA intégrée dans les flux de travail opérationnels essentiels d'un concessionnaire — remplaçant les tâches manuelles et sujettes aux erreurs par une automatisation intelligente qui rend chaque membre de l'équipe plus efficace et chaque interaction client plus personnalisée.</p>

<p>Voici un aperçu détaillé de trois capacités d'IA actuellement en développement actif pour la sortie en 2026 :</p>

<h3>Présentateur F&A IA</h3>

<p>La présentation des produits de Financement et Assurance est l'une des interactions les plus déterminantes pour les revenus — et notoirement inconsistante — dans un concessionnaire. Le Présentateur F&A IA de DealerSuite 360 remplace la présentation en personne par un avatar vidéo IA en direct qui gère les présentations de produits F&A à distance avec la précision et la cohérence de votre meilleur gestionnaire F&A, disponible à toute heure.</p>

<p>Voici comment cela fonctionne : après la structuration d'un accord, le concessionnaire génère un lien de présentation personnalisé lié au profil du client. L'avatar IA accueille le client par son nom, connaît déjà son unité, ses conditions de financement et les détails de l'accord. Il présente le portefeuille de produits — assurance GAP, garanties prolongées, forfaits de protection — adapte son rythme au client, gère les objections en temps réel et répond aux questions. Les produits que le client accepte se synchronisent automatiquement avec le portail du concessionnaire pour une finalisation en un clic. Aucun délai de paperasserie. Aucun argumentaire incohérent.</p>

<h3>Scanneur de documents IA</h3>

<p>Les concessionnaires gèrent d'énormes volumes de paperasse : certificats de garantie, correspondances des fabricants, rapports d'inspection, factures, et plus encore. Le Scanneur de documents IA transforme automatiquement cette piste papier en données structurées et consultables.</p>

<p>Scannez n'importe quel document — physique ou numérique — et l'IA extrait les données pertinentes et remplit automatiquement les champs sur toute la plateforme. Plus important encore, il détecte le NIV dans tout document scanné et le classe automatiquement dans le bon dossier d'unité. Un certificat de garantie scanné le lundi matin est lié à la bonne unité, à la bonne réclamation et au bon concessionnaire avant que le café du matin soit versé.</p>

<h3>Scanneur d'étiquette d'unité IA (Mobile)</h3>

<p>Chaque VR possède une étiquette physique de NIV et de spécifications sur son extérieur. La saisie de ces données dans le système implique généralement une transcription manuelle — un processus lent et sujet aux erreurs qui crée des problèmes en aval tout au long du cycle de vie de l'unité. Le Scanneur d'étiquette d'unité IA résout ce problème à la réception.</p>

<p>En utilisant l'application mobile DealerSuite 360, un technicien ou un membre du personnel de la cour pointe simplement son appareil photo vers l'étiquette. L'IA lit le NIV, les classifications de poids, la marque, le modèle, l'année et les données de configuration — et remplit automatiquement le tableau de bord de l'unité en quelques secondes. Aucune saisie manuelle. Aucune erreur de transcription.</p>

<p>Ce ne sont pas des promesses futures — elles sont activement en développement, avec des fenêtres de sortie prévues en 2026.</p>`,
    },
  },
  {
    id: 'warranty-claims-management-reimagined',
    date: '2026-03-10',
    category: 'product',
    image: '',
    en: {
      title: 'Warranty Claims Management, Reimagined for the RV Industry',
      summary: 'Dealer Suite 360 was the first module built and battle-tested — now fully integrated into DealerSuite 360. It handles the complete claim lifecycle across all major manufacturers with per-line FRC tracking, photo documentation, and role-based access.',
      content: `<p>Before there was DealerSuite 360, there was Dealer Suite 360 — a warranty claims processing service built out of direct experience with the frustrations Canadian RV dealers face every day. Too many manufacturers. Too many portals. Too many denials from claims that could have been approved with better preparation. Dealer Suite 360 was built to fix that. Now, it's the foundational module inside DealerSuite 360.</p>

<h3>What It Handles</h3>

<p>The claims module processes five claim types that cover virtually every scenario a dealer encounters:</p>

<ul>
  <li><strong>DAF (Dealer Authorization Form)</strong> — The inspection performed when a unit first arrives at the dealership, documenting any pre-delivery issues</li>
  <li><strong>PDI (Pre-Delivery Inspection)</strong> — The final comprehensive check before a unit is handed over to a customer</li>
  <li><strong>Warranty</strong> — Customer-reported issues during the active manufacturer warranty period</li>
  <li><strong>Extended Warranty</strong> — Issues covered by a purchased extended service plan after the factory warranty expires</li>
  <li><strong>Insurance</strong> — Claims for collision, weather, theft, and liability events</li>
</ul>

<p>Supported manufacturers include Jayco, Forest River, Heartland, Columbia NW, Keystone, and Midwest Auto — with new manufacturers added as the network grows.</p>

<h3>The Full Claim Lifecycle</h3>

<p>Every claim follows a structured lifecycle that keeps all parties aligned: Inspect → Add FRC Lines → Document with Photos → Submit to Operator → Operator Reviews and Submits to Manufacturer → Manufacturer Approves/Denies per Line → Parts Ordered → Repairs Completed → Invoice Generated → Payment Processed → Claim Closed.</p>

<p>This isn't just tracking — it's a managed process. Each step has accountability. Each stakeholder sees what they need to see, and nothing more.</p>

<h3>Per-Line FRC Tracking</h3>

<p>The most critical architectural decision in the claims module is how it handles manufacturer failure reason codes (FRCs). Each claim contains multiple FRC lines, and each line is independently approved or denied by the manufacturer. The platform tracks every line separately — with its own status, its own required photo documentation, its own parts order, and its own approval outcome. This granularity is what separates professional claims management from guesswork.</p>

<h3>Photo Documentation</h3>

<p>Photo quality directly impacts approval rates and dealer revenue. The platform requires photo documentation per FRC line — not per claim — ensuring that each individual issue is supported by the close-up and contextual shots that manufacturers require. In a future AI update, photo quality will be assessed automatically before submission.</p>

<h3>Role-Based Access</h3>

<p>Dealer Owners, Dealer Staff, Operator Admins, and Operator Staff each see the data and controls appropriate to their role. Nothing more, nothing less. The right people have the right access — and no one can accidentally (or intentionally) see data that isn't theirs.</p>

<p>Dealer Suite 360 has been battle-tested in real dealership conditions. As the entry module into Dealer Suite 360, it is the platform's most mature capability and the starting point for every new dealer relationship.</p>`,
    },
    fr: {
      title: "La gestion des réclamations de garantie, réinventée pour l\u2019industrie du VR",
      summary: 'Dealer Suite 360 a été le premier module construit et éprouvé en conditions réelles — maintenant entièrement intégré dans DealerSuite 360. Il gère le cycle de vie complet des réclamations auprès de tous les grands fabricants avec un suivi FRC par ligne, une documentation photographique et un accès basé sur les rôles.',
      content: `<p>Avant qu'il y ait DealerSuite 360, il y avait Dealer Suite 360 — un service de traitement des réclamations de garantie construit à partir de l'expérience directe des frustrations auxquelles font face les concessionnaires canadiens de VR chaque jour. Trop de fabricants. Trop de portails. Trop de refus pour des réclamations qui auraient pu être approuvées avec une meilleure préparation. Dealer Suite 360 a été construit pour remédier à cela. Maintenant, c'est le module fondamental de DealerSuite 360.</p>

<h3>Ce qu'il gère</h3>

<p>Le module de réclamations traite cinq types de réclamations couvrant pratiquement tous les scénarios rencontrés par un concessionnaire :</p>

<ul>
  <li><strong>DAF (Formulaire d'autorisation du concessionnaire)</strong> — L'inspection effectuée à l'arrivée d'une unité chez le concessionnaire, documentant tout problème avant livraison</li>
  <li><strong>PDI (Inspection pré-livraison)</strong> — La vérification finale complète avant la remise d'une unité à un client</li>
  <li><strong>Garantie</strong> — Problèmes signalés par les clients pendant la période de garantie active du fabricant</li>
  <li><strong>Garantie prolongée</strong> — Problèmes couverts par un plan de service prolongé acheté après l'expiration de la garantie d'usine</li>
  <li><strong>Assurance</strong> — Réclamations pour les événements de collision, météorologiques, de vol et de responsabilité civile</li>
</ul>

<p>Les fabricants pris en charge incluent Jayco, Forest River, Heartland, Columbia NW, Keystone et Midwest Auto — avec de nouveaux fabricants ajoutés à mesure que le réseau se développe.</p>

<h3>Le cycle de vie complet des réclamations</h3>

<p>Chaque réclamation suit un cycle de vie structuré qui maintient toutes les parties alignées : Inspection → Ajout de lignes FRC → Documentation photographique → Soumission à l'opérateur → L'opérateur examine et soumet au fabricant → Le fabricant approuve/refuse par ligne → Pièces commandées → Réparations effectuées → Facture générée → Paiement traité → Réclamation clôturée.</p>

<p>Ce n'est pas seulement un suivi — c'est un processus géré. Chaque étape a une responsabilité. Chaque partie prenante voit ce qu'elle doit voir, et rien de plus.</p>

<h3>Suivi FRC par ligne</h3>

<p>La décision architecturale la plus critique dans le module de réclamations concerne la gestion des codes de raison d'échec (FRC) des fabricants. Chaque réclamation contient plusieurs lignes FRC, et chaque ligne est approuvée ou refusée indépendamment par le fabricant. La plateforme suit chaque ligne séparément — avec son propre statut, sa propre documentation photographique requise, sa propre commande de pièces et son propre résultat d'approbation.</p>

<h3>Documentation photographique</h3>

<p>La qualité des photos a un impact direct sur les taux d'approbation et les revenus des concessionnaires. La plateforme exige une documentation photographique par ligne FRC — et non par réclamation — garantissant que chaque problème individuel est soutenu par les photos en gros plan et contextuelles que les fabricants exigent.</p>

<p>Dealer Suite 360 a été éprouvé dans des conditions réelles de concessionnaire. En tant que module d'entrée dans Dealer Suite 360, c'est la capacité la plus mature de la plateforme et le point de départ de chaque nouvelle relation avec un concessionnaire.</p>`,
    },
  },
  {
    id: 'dealer-marketplace-live-auctions',
    date: '2026-03-07',
    category: 'product',
    image: '',
    en: {
      title: 'A Private Dealer Marketplace with Live Auctions — Built into Your Platform',
      summary: 'DealerSuite 360 includes a built-in dealer-to-dealer marketplace with live auction functionality, identity protection, Stripe escrow security, and a Public Showcase add-on — all inside the same platform dealers use for claims and operations.',
      content: `<p>One of the most significant gaps in the RV dealer ecosystem has always been inventory liquidity. When a dealer has overstock, aged units, or trade-ins that don't match their lot's profile, their options have traditionally been limited: wholesale to a third-party auction house at unfavorable margins, list on a public platform competing with their own customers, or sit on inventory and absorb carrying costs. DealerSuite 360 is changing that with a built-in dealer marketplace and live auction system that operates entirely within the platform.</p>

<h3>Dealer-to-Dealer Marketplace</h3>

<p>The core marketplace allows verified dealers on the DealerSuite 360 network to list RV units directly to other verified dealers. Listings include full unit details, condition reports, photos, and pricing — everything a buying dealer needs to make an informed decision without leaving the platform.</p>

<p>Identity protection is built into the design. Dealer names are hidden in all listings to maintain competitive fairness. Buyers see the unit details; they don't see which competitor is selling. When a deal is agreed upon, the platform facilitates the connection — but only after both parties have committed to the transaction terms.</p>

<h3>Live Auction Functionality</h3>

<p>For units where competitive bidding is the right approach, the platform supports live auctions with real-time bidding mechanics. Dealers can run auctions on their timeline — setting start prices, reserve values, and auction windows — while the platform manages all bid activity, notifications, and winner determination automatically.</p>

<h3>Verified Membership & Security</h3>

<p>Marketplace access requires a verified dealer membership at $499 per year, subject to manual staff verification. This isn't a frictionless sign-up — it's an intentional gate to ensure that only legitimate, operating dealerships participate in the network. Unverified accounts cannot list or bid.</p>

<p>Transaction security is enforced through Stripe escrow: a $500 hold is placed on the buyer's account at the point of bid commitment, protecting sellers from non-payment and giving buyers confidence that the transaction is financially backed. The platform charges a flat $250 commission on each completed sale, keeping fees transparent and predictable.</p>

<h3>Public Showcase Add-On</h3>

<p>For dealers who want to expand their auction reach beyond the verified dealer network, the Public Showcase add-on ($299 per year) enables monthly 24-hour public auctions where verified public accounts — individual buyers who have completed identity verification — can browse listings and submit bids. This gives dealers a controlled channel to retail overstock at auction pricing without the fees and friction of a third-party platform.</p>

<p>The dealer marketplace is currently in active development and scheduled for release in Q3 2026 as part of the DealerSuite 360 platform expansion.</p>`,
    },
    fr: {
      title: 'Un marché privé pour concessionnaires avec enchères en direct — intégré à votre plateforme',
      summary: 'DealerSuite 360 comprend un marché intégré de concessionnaire à concessionnaire avec des fonctionnalités d\'enchères en direct, la protection d\'identité, la sécurité par séquestre Stripe et un module complémentaire Vitrine publique — le tout dans la même plateforme que les concessionnaires utilisent pour les réclamations et les opérations.',
      content: `<p>L'un des écarts les plus significatifs dans l'écosystème des concessionnaires de VR a toujours été la liquidité des stocks. Quand un concessionnaire a des surplus, des unités vieillissantes ou des reprises qui ne correspondent pas au profil de son terrain, ses options ont traditionnellement été limitées : vendre en gros à une maison d'enchères tierce avec des marges défavorables, lister sur une plateforme publique en concurrençant ses propres clients, ou maintenir des stocks et absorber les coûts de détention. DealerSuite 360 change cela avec un marché intégré pour concessionnaires et un système d'enchères en direct qui fonctionne entièrement au sein de la plateforme.</p>

<h3>Marché de concessionnaire à concessionnaire</h3>

<p>Le marché principal permet aux concessionnaires vérifiés sur le réseau DealerSuite 360 de lister des unités VR directement à d'autres concessionnaires vérifiés. Les annonces comprennent tous les détails de l'unité, les rapports d'état, les photos et la tarification — tout ce dont un concessionnaire acheteur a besoin pour prendre une décision éclairée sans quitter la plateforme.</p>

<p>La protection de l'identité est intégrée dans la conception. Les noms des concessionnaires sont masqués dans toutes les annonces pour maintenir l'équité concurrentielle. Les acheteurs voient les détails de l'unité ; ils ne voient pas quel concurrent vend.</p>

<h3>Fonctionnalité d'enchères en direct</h3>

<p>Pour les unités où les enchères compétitives sont la bonne approche, la plateforme prend en charge les enchères en direct avec des mécaniques d'enchères en temps réel. Les concessionnaires peuvent organiser des enchères selon leur calendrier — fixant des prix de départ, des valeurs de réserve et des fenêtres d'enchères — tandis que la plateforme gère automatiquement toute l'activité d'enchères, les notifications et la détermination du gagnant.</p>

<h3>Adhésion vérifiée et sécurité</h3>

<p>L'accès au marché nécessite une adhésion de concessionnaire vérifiée à 499 $ par an, soumise à une vérification manuelle du personnel. La sécurité des transactions est appliquée via le séquestre Stripe : une retenue de 500 $ est placée sur le compte de l'acheteur au moment de l'engagement d'enchère, protégeant les vendeurs contre le non-paiement. La plateforme facture une commission fixe de 250 $ sur chaque vente conclue.</p>

<h3>Module complémentaire Vitrine publique</h3>

<p>Pour les concessionnaires qui souhaitent étendre leur portée aux enchères au-delà du réseau de concessionnaires vérifiés, le module complémentaire Vitrine publique (299 $ par an) permet des enchères publiques mensuelles de 24 heures où des comptes publics vérifiés peuvent parcourir les annonces et soumettre des offres.</p>

<p>Le marché des concessionnaires est actuellement en développement actif et prévu pour le troisième trimestre 2026.</p>`,
    },
  },
  {
    id: 'branded-customer-portal-rv-owners',
    date: '2026-03-03',
    category: 'product',
    image: '',
    en: {
      title: 'Empowering RV Owners with a Branded Customer Portal',
      summary: 'Every dealer on DealerSuite 360 gets a white-label customer portal — fully branded with their logo, colors, and custom domain — giving RV owners self-serve access to their unit\'s warranty info, claim status, issue reporting, and dealer messaging.',
      content: `<p>The relationship between an RV dealer and their customer doesn't end at delivery. It continues through warranty claims, service appointments, parts orders, and the inevitable questions and issues that arise over the ownership lifecycle of a recreational vehicle. For most dealers, managing that ongoing relationship means phone calls, emails, and sticky notes — a fragmented, reactive process that erodes trust and consumes service bandwidth.</p>

<p>DealerSuite 360's Customer Portal changes that equation. Every dealer on the platform gets a white-label customer portal, fully branded and deployed under their own domain, that gives RV owners a structured, self-serve channel for everything that happens after the sale.</p>

<h3>Fully White-Label</h3>

<p>The customer portal carries the dealer's brand — their logo, their colors, their domain name via CNAME configuration. To the customer, they're not using a third-party SaaS product. They're using their dealer's platform. The operator (DealerSuite 360) is completely invisible. This brand consistency is intentional: it strengthens the dealer-customer relationship and reinforces the dealer's identity as a professional, technology-forward organization.</p>

<h3>What Customers Can Access</h3>

<p>Customers access the portal via a dealer-issued invite link tied to their VIN after purchase. Once inside, they have access to:</p>

<ul>
  <li><strong>Unit Dashboard</strong> — Full unit details, warranty expiry dates, extended warranty coverage, and service history</li>
  <li><strong>Claim Status Tracking</strong> — Simplified, customer-friendly view of active and historical warranty claims without exposing the operational complexity behind them</li>
  <li><strong>Issue Submission</strong> — Customers can report new issues with photos, descriptions, and severity ratings directly from the portal, eliminating the phone-tag cycle</li>
  <li><strong>Parts Orders</strong> — Track ordered parts from request to delivery</li>
  <li><strong>Documents</strong> — Warranty certificates, inspection reports, and purchase documents in one place</li>
  <li><strong>Dealer Messaging</strong> — Direct communication channel between the customer and their dealer's service team</li>
</ul>

<h3>Reducing Support Burden</h3>

<p>Every customer who can look up their warranty status, check their claim progress, or submit an issue through the portal is a customer who isn't calling the service desk. That freed capacity represents real operational savings — and a better customer experience simultaneously. Self-serve access reduces support calls while giving owners the transparency they increasingly expect from every service provider they interact with.</p>

<h3>Future Capabilities</h3>

<p>The customer portal roadmap includes integration with DealerSuite 360's AI F&I Presenter, allowing dealers to send personalized product presentations directly through the portal post-purchase. Roadside assistance integration is also planned, giving customers 24/7 emergency access from within the same branded experience.</p>

<p>The Customer Portal is live today as part of DealerSuite 360. Every new dealer who joins the platform gets access to it as part of their standard subscription.</p>`,
    },
    fr: {
      title: 'Donner du pouvoir aux propriétaires de VR avec un portail client personnalisé',
      summary: 'Chaque concessionnaire sur DealerSuite 360 bénéficie d\'un portail client en marque blanche — entièrement personnalisé avec leur logo, leurs couleurs et leur domaine — donnant aux propriétaires de VR un accès en libre-service aux informations de garantie, au statut des réclamations, à la signalisation des problèmes et à la messagerie du concessionnaire.',
      content: `<p>La relation entre un concessionnaire de VR et son client ne se termine pas à la livraison. Elle se poursuit à travers les réclamations de garantie, les rendez-vous de service, les commandes de pièces et les inévitables questions et problèmes qui surviennent tout au long du cycle de vie de possession d'un véhicule récréatif. Pour la plupart des concessionnaires, gérer cette relation continue signifie des appels téléphoniques, des courriels et des post-it — un processus fragmenté et réactif qui érode la confiance et consomme la bande passante du service.</p>

<p>Le Portail Client de DealerSuite 360 change cette équation. Chaque concessionnaire sur la plateforme obtient un portail client en marque blanche, entièrement personnalisé et déployé sous son propre domaine, qui donne aux propriétaires de VR un canal structuré et en libre-service pour tout ce qui se passe après la vente.</p>

<h3>Entièrement en marque blanche</h3>

<p>Le portail client porte la marque du concessionnaire — son logo, ses couleurs, son nom de domaine via la configuration CNAME. Pour le client, il n'utilise pas un produit SaaS tiers. Il utilise la plateforme de son concessionnaire. L'opérateur (DealerSuite 360) est complètement invisible. Cette cohérence de marque est intentionnelle : elle renforce la relation concessionnaire-client et affirme l'identité du concessionnaire comme une organisation professionnelle et tournée vers la technologie.</p>

<h3>Ce à quoi les clients peuvent accéder</h3>

<p>Les clients accèdent au portail via un lien d'invitation émis par le concessionnaire lié à leur NIV après l'achat. Une fois à l'intérieur, ils ont accès à :</p>

<ul>
  <li><strong>Tableau de bord de l'unité</strong> — Détails complets de l'unité, dates d'expiration de la garantie, couverture de garantie prolongée et historique de service</li>
  <li><strong>Suivi du statut des réclamations</strong> — Vue simplifiée et conviviale des réclamations de garantie actives et historiques</li>
  <li><strong>Soumission de problèmes</strong> — Les clients peuvent signaler de nouveaux problèmes avec des photos, des descriptions et des évaluations de gravité directement depuis le portail</li>
  <li><strong>Commandes de pièces</strong> — Suivi des pièces commandées de la demande à la livraison</li>
  <li><strong>Documents</strong> — Certificats de garantie, rapports d'inspection et documents d'achat en un seul endroit</li>
  <li><strong>Messagerie du concessionnaire</strong> — Canal de communication direct entre le client et l'équipe de service de son concessionnaire</li>
</ul>

<h3>Réduction de la charge de support</h3>

<p>Chaque client qui peut consulter son statut de garantie, vérifier l'avancement de sa réclamation ou soumettre un problème via le portail est un client qui n'appelle pas le service d'assistance. Cette capacité libérée représente de vraies économies opérationnelles — et une meilleure expérience client simultanément.</p>

<p>La feuille de route du Portail Client comprend l'intégration avec le Présentateur F&A IA de DealerSuite 360 et l'intégration de l'assistance routière, offrant aux clients un accès d'urgence 24h/24 depuis la même expérience de marque.</p>

<p>Le Portail Client est disponible aujourd'hui dans le cadre de DealerSuite 360. Chaque nouveau concessionnaire qui rejoint la plateforme y a accès dans le cadre de son abonnement standard.</p>`,
    },
  },
];
