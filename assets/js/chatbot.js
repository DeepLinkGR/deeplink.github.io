/**
 * DeepLink FAQ chatbot: a static, client-side assistant with canned answers.
 * No network requests; matching is keyword based and bilingual (el / en).
 */
(function () {
  "use strict";

  /* ---------- Knowledge base ----------
   * Keywords are matched against the normalised message (lower-case, no accents, ς -> σ).
   * A single-word keyword matches any word that starts with it (so stems work);
   * a keyword of 3 characters or fewer must match a whole word;
   * a multi-word keyword must appear as a phrase and scores per word.
   * On a tie the intent listed first wins, so specific intents come before generic ones
   * (the AI overview comes first so a bare "AI" question gets the overview).
   * An intent with `requires` only matches when at least one of those keywords is present.
   */
  const AI_TERMS = [
    "ai", "a.i.", "τεχνητη νοημοσυνη", "νοημοσυν", "artificial", "chatgpt", "gpt", "llm", "openai", "claude",
    "gemini", "copilot", "machine learning", "μηχανικη μαθηση", "αυτοματ", "automat", "chatbot"
  ];
  const withAI = function (list) { return AI_TERMS.concat(list); };

  const INTENTS = [
    {
      id: "ai",
      keywords: {
        el: withAI(["βοηθα το ai", "βοηθησει το ai", "τι κανει το ai", "παραδειγματα ai", "μειωση κοστουσ", "μειωσω το κοστοσ", "μειωσουμε το κοστοσ", "αποδοτικ", "παραγωγικοτητ", "εξοικονομ", "γλιτωσω χρονο"]),
        en: ["how can ai help", "ai help", "ai examples", "what can ai do", "cut cost", "cut costs", "reduce cost", "reduce costs", "efficien", "productiv", "save time", "saving"]
      },
      answer: {
        el: "Βοηθάμε επιχειρήσεις να αξιοποιήσουν την τεχνητή νοημοσύνη (AI) για να μειώσουν το κόστος και να δουλεύουν πιο αποδοτικά. Ενδεικτικά:\n• Ψηφιακός βοηθός 24/7 για τους πελάτες σας, συνδεδεμένος με τα δικά σας δεδομένα\n• Αυτόματη εξαγωγή στοιχείων από τιμολόγια και παραστατικά\n• Ταξινόμηση email και έτοιμα προσχέδια απαντήσεων\n• Περιγραφές προϊόντων, μεταφράσεις και κείμενα SEO σε λίγα λεπτά\n• Αναζήτηση στα εσωτερικά έγγραφα της εταιρείας με απλές ερωτήσεις\nΞεκινάμε από τις εργασίες που σας τρώνε τον περισσότερο χρόνο.",
        en: "We help businesses use artificial intelligence (AI) to cut costs and work more efficiently. For example:\n• A 24/7 assistant for your customers, connected to your own data\n• Automatic data extraction from invoices and documents\n• Email sorting with ready-to-send draft replies\n• Product descriptions, translations and SEO copy in minutes\n• Searching your internal documents with plain questions\nWe start with the tasks that take up most of your time."
      },
      chips: {
        el: ["AI για e-shop", "AI για γραφεία & λογιστήρια", "AI για ξενοδοχεία & τουρισμό", "AI για εξυπηρέτηση πελατών"],
        en: ["AI for e-shops", "AI for offices & accounting", "AI for hotels & tourism", "AI for customer service"]
      }
    },
    {
      id: "ai_eshop",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["e-shop", "eshop", "καταστημ", "λιανικ", "προιοντ"]),
        en: ["e-shop", "eshop", "online store", "shop", "store", "ecommerce", "e-commerce", "retail", "product"]
      },
      answer: {
        el: "Το AI σε ένα e-shop, για παράδειγμα:\n• Αυτόματες περιγραφές προϊόντων και μεταφράσεις για εκατοντάδες κωδικούς σε λίγα λεπτά\n• Βοηθός αγορών 24/7 που απαντά για διαθεσιμότητα, μεγέθη και αποστολές\n• Έξυπνες προτάσεις προϊόντων («μπορεί να σας ενδιαφέρει επίσης…») που μεγαλώνουν το καλάθι\n• Σύνοψη κριτικών και έγκαιρος εντοπισμός παραπόνων\n• Πρόβλεψη ζήτησης για καλύτερη διαχείριση αποθέματος",
        en: "AI in an e-shop, for example:\n• Product descriptions and translations for hundreds of SKUs in minutes\n• A 24/7 shopping assistant that answers questions about stock, sizes and shipping\n• Smart product recommendations (\"you may also like…\") that grow the basket\n• Review summaries and early detection of complaints\n• Demand forecasting for better stock management"
      },
      chips: { el: ["Πόσο κοστίζει το AI;", "Πώς ξεκινάμε με AI;"], en: ["How much does AI cost?", "How do we start with AI?"] }
    },
    {
      id: "ai_office",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["γραφει", "λογιστ", "τιμολογ", "παραστατικ", "εγγραφ", "συμβασ", "δικηγορ", "διοικητικ", "email", "συσκεψ"]),
        en: ["office", "accounting", "accountant", "invoice", "document", "contract", "law firm", "admin", "back office", "email", "meeting"]
      },
      answer: {
        el: "Το AI σε γραφεία, λογιστήρια και διοικητικές εργασίες, για παράδειγμα:\n• Αυτόματη ανάγνωση τιμολογίων, αποδείξεων και παραστατικών και καταχώρηση στο λογιστικό σας πρόγραμμα\n• Ταξινόμηση εισερχόμενων email και έτοιμα προσχέδια απαντήσεων\n• Σύνοψη συμβάσεων και μεγάλων εγγράφων σε δευτερόλεπτα\n• Εσωτερικός βοηθός που απαντά από τις διαδικασίες και τα αρχεία της εταιρείας σας\n• Απομαγνητοφώνηση συσκέψεων και αυτόματα πρακτικά με τις ενέργειες που συμφωνήθηκαν",
        en: "AI in offices, accounting and admin work, for example:\n• Reading invoices, receipts and other documents automatically and entering them into your accounting software\n• Sorting incoming email and drafting replies\n• Summarising contracts and long documents in seconds\n• An internal assistant that answers from your company's procedures and files\n• Meeting transcription and automatic minutes with the agreed action items"
      },
      chips: { el: ["Είναι ασφαλή τα δεδομένα μου;", "Πώς ξεκινάμε με AI;"], en: ["Is my data safe?", "How do we start with AI?"] }
    },
    {
      id: "ai_tourism",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["ξενοδοχ", "τουρισ", "ενοικιαζομεν", "δωματι", "κρατησ", "εστιατορ", "airbnb", "booking", "επισκεπτ"]),
        en: ["hotel", "tourism", "tourist", "rooms", "rental", "booking", "reservation", "restaurant", "airbnb", "guest"]
      },
      answer: {
        el: "Το AI σε ξενοδοχεία, ενοικιαζόμενα και εστίαση, για παράδειγμα:\n• Πολύγλωσσος βοηθός για τους επισκέπτες σας στο site ή στο Viber/WhatsApp: check-in, πρωινό, μεταφορές, προτάσεις για την περιοχή\n• Γρήγορες απαντήσεις σε αιτήματα και ερωτήσεις κρατήσεων\n• Επαγγελματικές απαντήσεις σε κριτικές σε Google και Booking\n• Μεταφράσεις μενού και περιγραφών σε πολλές γλώσσες\n• Προτάσεις τιμολόγησης με βάση την πληρότητα και την εποχικότητα",
        en: "AI for hotels, rentals and restaurants, for example:\n• A multilingual guest assistant on your site or on Viber/WhatsApp: check-in, breakfast, transfers, local tips\n• Fast replies to booking enquiries\n• Professional responses to Google and Booking reviews\n• Menu and description translations into many languages\n• Pricing suggestions based on occupancy and seasonality"
      },
      chips: { el: ["Πόσο κοστίζει το AI;", "Πώς ξεκινάμε με AI;"], en: ["How much does AI cost?", "How do we start with AI?"] }
    },
    {
      id: "ai_support",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["εξυπηρετησ", "πελατ", "αιτηματ", "τηλεφωνικ", "helpdesk"]),
        en: ["customer service", "customer support", "customers", "support", "helpdesk", "tickets", "call center"]
      },
      answer: {
        el: "Το AI στην εξυπηρέτηση πελατών, για παράδειγμα:\n• Chatbot που απαντά αμέσως στις συχνές ερωτήσεις, 24 ώρες το 24ωρο, σε πολλές γλώσσες\n• Αυτόματη κατηγοριοποίηση και ιεράρχηση αιτημάτων\n• Προτεινόμενες απαντήσεις για τους υπαλλήλους σας, ώστε να απαντούν πιο γρήγορα\n• Παράδοση της συζήτησης σε άνθρωπο όταν η ερώτηση είναι σύνθετη",
        en: "AI in customer service, for example:\n• A chatbot that answers common questions instantly, 24/7, in many languages\n• Automatic categorisation and prioritisation of requests\n• Suggested replies for your staff so they answer faster\n• Hand-off to a person when a question is complex"
      },
      chips: { el: ["Θα αντικαταστήσει το AI τους υπαλλήλους;", "Πώς ξεκινάμε με AI;"], en: ["Will AI replace my staff?", "How do we start with AI?"] }
    },
    {
      id: "ai_jobs",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["αντικαταστ", "υπαλληλ", "προσωπικ", "εργαζομεν", "απολυ", "θεσεισ εργασιασ"]),
        en: ["replace", "staff", "employees", "jobs", "workers", "people", "layoff"]
      },
      answer: {
        el: "Ο στόχος δεν είναι να αντικαταστήσει τους ανθρώπους σας, αλλά να τους απαλλάξει από τη ρουτίνα: καταχωρήσεις, αντιγραφές, επαναλαμβανόμενες απαντήσεις. Έτσι αφιερώνουν τον χρόνο τους σε ό,τι πραγματικά προσθέτει αξία: πελάτες, ποιότητα και ανάπτυξη.",
        en: "The goal isn't to replace your people but to free them from routine work: data entry, copy-pasting, repetitive replies. That way they spend their time on what really adds value: customers, quality and growth."
      }
    },
    {
      id: "ai_privacy",
      requires: AI_TERMS.concat(["δεδομεν", "data", "gdpr", "privacy", "απορρητ"]),
      keywords: {
        el: withAI(["δεδομεν", "ασφαλ", "gdpr", "απορρητ", "προσωπικα", "εμπιστευτ"]),
        en: ["data", "safe", "secure", "security", "gdpr", "privacy", "confidential"]
      },
      answer: {
        el: "Η ασφάλεια των δεδομένων σας είναι προτεραιότητα:\n• Σχεδιασμός σύμφωνα με τον GDPR\n• Επαγγελματικές υπηρεσίες AI που δεν χρησιμοποιούν τα δεδομένα σας για εκπαίδευση\n• Όπου χρειάζεται, μοντέλα που τρέχουν στους δικούς σας server\n• Έλεγχος πρόσβασης και ανθρώπινη έγκριση στις κρίσιμες αποφάσεις",
        en: "Keeping your data safe is a priority:\n• Designed with GDPR in mind\n• Business-grade AI services that don't use your data for training\n• Where needed, models that run on your own servers\n• Access control and human approval for critical decisions"
      }
    },
    {
      id: "ai_price",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["κοστ", "τιμη", "ποσο", "ακριβ", "επενδυσ", "αποσβεσ", "χρεωσ"]),
        en: ["cost", "price", "how much", "budget", "expensive", "investment", "roi"]
      },
      answer: {
        el: "Δεν χρειάζεται μεγάλη επένδυση για να ξεκινήσετε. Προτείνουμε ένα μικρό πιλοτικό έργο σε μία συγκεκριμένη εργασία, με ξεκάθαρο στόχο, π.χ. πόσες ώρες εξοικονομούνται τον μήνα. Οι υπηρεσίες AI χρεώνονται συνήθως ανάλογα με τη χρήση, οπότε το κόστος μεγαλώνει μόνο όσο μεγαλώνει και το όφελος.",
        en: "You don't need a big investment to start. We suggest a small pilot on one specific task with a clear goal, e.g. how many hours are saved per month. AI services are usually billed by usage, so costs only grow as the benefit grows."
      },
      chips: { el: ["Πώς ξεκινάμε με AI;"], en: ["How do we start with AI?"] }
    },
    {
      id: "ai_start",
      requires: AI_TERMS,
      keywords: {
        el: withAI(["ξεκιν", "αρχισ", "πωσ", "βημα", "πιλοτ", "εφαρμοσ"]),
        en: ["start", "begin", "how do", "how can", "first step", "pilot", "implement", "roadmap"]
      },
      answer: {
        el: "Συνήθως σε 4 βήματα:\n1. Σύντομη συζήτηση για να εντοπίσουμε τις επαναλαμβανόμενες, χρονοβόρες εργασίες σας\n2. Επιλογή της εργασίας με το μεγαλύτερο όφελος\n3. Πιλοτική λύση μέσα σε λίγες εβδομάδες, πάνω στα εργαλεία που ήδη χρησιμοποιείτε\n4. Μέτρηση αποτελεσμάτων και επέκταση σε περισσότερες εργασίες",
        en: "Usually in 4 steps:\n1. A short call to spot your repetitive, time-consuming tasks\n2. Pick the task with the biggest benefit\n3. A pilot within a few weeks, built on the tools you already use\n4. Measure the results and expand to more tasks"
      },
      chips: { el: ["Είναι ασφαλή τα δεδομένα μου;", "Πόσο κοστίζει το AI;"], en: ["Is my data safe?", "How much does AI cost?"] }
    },
    {
      id: "price",
      keywords: {
        el: ["τιμη", "τιμεσ", "κοστ", "ποσο κανει", "ποσο κοστιζει", "ποσο θα", "χρεωσ", "λεφτα", "ευρω", "προυπολογισμ", "φθην", "ακριβ"],
        en: ["price", "pricing", "cost", "how much", "budget", "cheap", "expensive", "fee", "rates"]
      },
      answer: {
        el: "Το κόστος εξαρτάται από το έργο: το μέγεθος, τις λειτουργίες και τον σχεδιασμό που χρειάζεστε. Κάθε πρόταση την προσαρμόζουμε στις ανάγκες και τον προϋπολογισμό σας, χωρίς κρυφές χρεώσεις.",
        en: "Pricing depends on the project: its size, the features and the design you need. Every proposal is tailored to your needs and budget, with no hidden fees."
      },
      chips: { el: ["Πόσο χρόνο χρειάζεται;", "Φτιάχνετε e-shop;"], en: ["How long does it take?", "Do you build e-shops?"] }
    },
    {
      id: "time",
      keywords: {
        el: ["ποσο χρονο", "ποσο καιρο", "ποσεσ μερεσ", "ποσεσ εβδομαδεσ", "διαρκει", "διαρκεια", "χρονοδιαγραμμα", "ποτε θα", "παραδοσ", "γρηγορα"],
        en: ["how long", "timeline", "time frame", "duration", "deadline", "when will", "how fast", "delivery"]
      },
      answer: {
        el: "Ο χρόνος υλοποίησης εξαρτάται από το εύρος του έργου. Μια απλή ιστοσελίδα είναι έτοιμη πολύ πιο γρήγορα από ένα e-shop ή μια εφαρμογή. Στην αρχή συμφωνούμε μαζί ένα ξεκάθαρο χρονοδιάγραμμα.",
        en: "It depends on the scope. A simple website is ready much sooner than an e-shop or an app. We agree on a clear timeline together at the start."
      }
    },
    {
      id: "eshop",
      keywords: {
        el: ["e-shop", "eshop", "ηλεκτρονικο καταστημα", "ηλεκτρονικου καταστηματοσ", "καταστημα", "πωλησ", "woocommerce", "πουλαω", "πουλησω"],
        en: ["e-shop", "eshop", "online store", "online shop", "shop", "store", "ecommerce", "e-commerce", "woocommerce", "sell online"]
      },
      answer: {
        el: "Ναι! Κατασκευάζουμε ολοκληρωμένα ηλεκτρονικά καταστήματα με WordPress και WooCommerce:\n• Κατάλογος προϊόντων με φίλτρα και αναζήτηση\n• Ασφαλείς online πληρωμές\n• Μεταφορικά και σύνδεση με courier\n• Διασύνδεση με ERP και λογιστικό πρόγραμμα\n• Εκπαίδευση για να το διαχειρίζεστε εύκολα μόνοι σας",
        en: "Yes! We build complete online stores with WordPress and WooCommerce:\n• Product catalogue with filters and search\n• Secure online payments\n• Shipping rates and courier integration\n• Integration with your ERP and accounting software\n• Training so you can manage it easily yourself"
      },
      chips: { el: ["Πόσο κοστίζει;", "Κάνετε SEO;"], en: ["How much does it cost?", "Do you do SEO?"] }
    },
    {
      id: "seo",
      keywords: {
        el: ["seo", "marketing", "μαρκετινγκ", "google", "προωθησ", "διαφημισ", "αναζητησ", "κατατασσ", "επισκεψιμοτητα"],
        en: ["seo", "marketing", "google", "promotion", "promote", "advertis", "ranking", "search engine", "traffic"]
      },
      answer: {
        el: "Βελτιώνουμε τη θέση και την εικόνα σας στο διαδίκτυο, ώστε να σας βρίσκουν περισσότεροι πελάτες:\n• Τεχνικό SEO και ταχύτητα σελίδων\n• Έρευνα λέξεων-κλειδιών και βελτιστοποίηση κειμένων\n• Google Business Profile για την τοπική αναζήτηση\n• Διαφημίσεις σε Google Ads και social media\n• Μετρήσεις και αναφορές με Google Analytics",
        en: "We improve your position and image online so more customers can find you:\n• Technical SEO and page speed\n• Keyword research and content optimisation\n• Google Business Profile for local search\n• Google Ads and social media advertising\n• Tracking and reports with Google Analytics"
      }
    },
    {
      id: "hosting",
      keywords: {
        el: ["φιλοξενι", "hosting", "domain", "ονομα χωρου", "κατοχυρωσ", "server", "σερβερ"],
        en: ["hosting", "host", "domain", "server", "register a name"]
      },
      answer: {
        el: "Αναλαμβάνουμε όλα τα στάδια: από την κατοχύρωση του ονόματος (domain) και την κατασκευή, μέχρι τη φιλοξενία στους server μας και την προώθηση της ιστοσελίδας σας.",
        en: "We handle every stage: from registering your domain name and building the site, to hosting it on our servers and promoting it."
      }
    },
    {
      id: "tech",
      keywords: {
        el: ["τεχνολογι", "wordpress", "dotnet", ".net", "γλωσσ", "προγραμματισ", "framework", "cms"],
        en: ["technolog", "tech stack", "stack", "wordpress", "dotnet", ".net", "framework", "language", "cms"]
      },
      answer: {
        el: "Δουλεύουμε με σύγχρονες τεχνολογίες, όπως WordPress και WooCommerce για ιστοσελίδες και e-shop, .NET για προσαρμοσμένες εφαρμογές, και σύγχρονα μοντέλα AI για αυτοματοποιήσεις και ψηφιακούς βοηθούς. Διαλέγουμε ό,τι ταιριάζει καλύτερα στο έργο σας.",
        en: "We work with modern technologies, such as WordPress and WooCommerce for websites and e-shops, .NET for custom applications, and modern AI models for automation and virtual assistants. We pick whatever suits your project best."
      }
    },
    {
      id: "website",
      keywords: {
        el: ["ιστοσελιδ", "ιστοτοπ", "σελιδα", "site", "website", "εφαρμογ", "app", "κινητ", "tablet", "responsive"],
        en: ["website", "web site", "site", "web page", "webpage", "app", "application", "mobile", "tablet", "responsive"]
      },
      answer: {
        el: "Κατασκευάζουμε γρήγορες, ασφαλείς ιστοσελίδες και εφαρμογές που δείχνουν άψογα σε κινητά, tablet και υπολογιστές:\n• Εταιρικές ιστοσελίδες και landing pages\n• Web εφαρμογές και custom λογισμικό (.NET)\n• Εύκολη διαχείριση περιεχομένου με WordPress\n• Domain, φιλοξενία και πιστοποιητικό SSL",
        en: "We build fast, secure websites and apps that look great on phones, tablets and computers:\n• Company websites and landing pages\n• Web apps and custom software (.NET)\n• Easy content management with WordPress\n• Domain, hosting and SSL certificate"
      },
      chips: { el: ["Πόσο κοστίζει μια ιστοσελίδα;", "Πόσο χρόνο χρειάζεται;"], en: ["How much does a website cost?", "How long does it take?"] }
    },
    {
      id: "services",
      keywords: {
        el: ["υπηρεσι", "τι κανετε", "τι προσφερετε", "με τι ασχολ", "δουλεια σασ", "λυσεισ"],
        en: ["service", "what do you do", "what do you offer", "offer", "solutions", "help me with"]
      },
      answer: {
        el: "Η DeepLink προσφέρει:\n• Κατασκευή ιστοσελίδων και εφαρμογών\n• Κατασκευή e-shop\n• Υπηρεσίες marketing και SEO\n• Λύσεις τεχνητής νοημοσύνης (AI) για μείωση κόστους και πιο αποδοτική δουλειά\n• Κατοχύρωση domain και φιλοξενία",
        en: "DeepLink offers:\n• Website and app development\n• E-shop development\n• Marketing and SEO services\n• AI solutions to cut costs and work more efficiently\n• Domain registration and hosting"
      },
      chips: { el: ["Πώς βοηθά το AI την επιχείρησή μου;", "Φτιάχνετε e-shop;", "Κάνετε SEO;"], en: ["How can AI help my business?", "Do you build e-shops?", "Do you do SEO?"] }
    },
    {
      id: "location",
      keywords: {
        el: ["βρισκεστε", "βρισκεσαι", "διευθυνσ", "σερρεσ", "περιοχ", "τοποθεσι", "εδρα", "γραφει", "πολη"],
        en: ["where", "location", "located", "address", "office", "based", "serres", "city"]
      },
      answer: {
        el: "Βρισκόμαστε στις Σέρρες, αλλά συνεργαζόμαστε με πελάτες από όλη την Ελλάδα και το εξωτερικό.",
        en: "We're based in Serres, Greece, but we work with clients from all over Greece and abroad."
      }
    },
    {
      id: "contact",
      keywords: {
        el: ["επικοινων", "προσφορα", "ραντεβου", "τηλεφων", "email", "μιλησουμε", "συναντησ", "συνεργασ", "ξεκινησουμε"],
        en: ["contact", "quote", "proposal", "call", "phone", "email", "meet", "talk", "get in touch", "reach you", "hire", "work with you"]
      },
      answer: {
        el: "Θα χαρούμε πολύ να μιλήσουμε για το έργο σας! Είμαστε στις Σέρρες και επενδύουμε σε μακροχρόνιες σχέσεις συνεργασίας με τους πελάτες μας.",
        en: "We'd love to hear about your project! We're based in Serres and invest in long-term partnerships with our clients."
      }
    },
    {
      id: "support",
      keywords: {
        el: ["υποστηριξ", "συντηρησ", "αναβαθμισ", "βοηθεια μετα", "ενημερωσ", "προβλημα"],
        en: ["support", "maintenance", "maintain", "update", "after launch", "problem", "fix"]
      },
      answer: {
        el: "Δεν σας αφήνουμε μετά την παράδοση. Είμαστε δίπλα σας με συνέπεια για υποστήριξη, ενημερώσεις και βελτιώσεις, γιατί επενδύουμε σε μακροχρόνιες σχέσεις.",
        en: "We don't disappear after launch. We stay by your side for support, updates and improvements, because we invest in long-term relationships."
      }
    },
    {
      id: "values",
      keywords: {
        el: ["αξιεσ", "αξια", "ποιοτητα", "αξιοπιστ", "ικανοποιησ", "εμπιστ", "γιατι εσασ", "γιατι να"],
        en: ["values", "quality", "reliab", "trust", "satisfaction", "why you", "why should", "why choose"]
      },
      answer: {
        el: "Οι αξίες μας είναι τρεις: η ικανοποίηση του πελάτη, η αξιοπιστία και η ποιότητα. Σε κάθε έργο προσπαθούμε να είμαστε αντάξιοι της εμπιστοσύνης σας.",
        en: "Our three core values are customer satisfaction, reliability and quality. In every project we work hard to earn your trust."
      }
    },
    {
      id: "who",
      keywords: {
        el: ["ποιοι ειστε", "ποιοσ εισαι", "εταιρει", "deeplink", "ομαδα", "σχετικα", "εμπειρι"],
        en: ["who are you", "about you", "about deeplink", "company", "deeplink", "team", "experience"]
      },
      answer: {
        el: "Η DeepLink είναι μια ομάδα από καταξιωμένους μηχανικούς πληροφορικής με μεγάλη εμπειρία. Σχεδιάζουμε και αναπτύσσουμε καινοτόμες, εντυπωσιακές και ποιοτικές ιστοσελίδες, e-shop και εφαρμογές.",
        en: "DeepLink is a team of experienced software engineers. We design and build innovative, impressive and high-quality websites, e-shops and applications."
      },
      chips: { el: ["Τι υπηρεσίες προσφέρετε;", "Ποιες είναι οι αξίες σας;"], en: ["What services do you offer?", "What are your values?"] }
    },
    {
      id: "bot",
      keywords: {
        el: ["bot", "ρομποτ", "ανθρωποσ", "πραγματικοσ", "εισαι ai", "εισαι τεχνητη νοημοσυνη"],
        en: ["bot", "robot", "human", "real person", "are you ai", "are you an ai"]
      },
      answer: {
        el: "Είμαι ο ψηφιακός βοηθός της DeepLink 🙂 Απαντώ σε συχνές ερωτήσεις για τις υπηρεσίες μας.",
        en: "I'm DeepLink's virtual assistant 🙂 I answer common questions about our services."
      }
    },
    {
      id: "thanks",
      keywords: {
        el: ["ευχαριστ", "αντιο", "γεια χαρα", "τα λεμε", "καληνυχτα", "τελεια", "ωραια"],
        en: ["thank", "thanks", "thx", "bye", "goodbye", "see you", "great", "perfect", "cool"]
      },
      answer: {
        el: "Να 'στε καλά! Αν έχετε άλλη ερώτηση, είμαι εδώ. 😊",
        en: "You're welcome! If you have any other question, I'm here. 😊"
      }
    },
    {
      id: "greeting",
      keywords: {
        el: ["γεια", "καλημερα", "καλησπερα", "χαιρετε", "χαιρετω", "γεια σασ", "γεια σου"],
        en: ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "greetings"]
      },
      answer: {
        el: "Γεια σας! 👋 Πώς μπορώ να βοηθήσω; Ρωτήστε με για τις υπηρεσίες μας, το κόστος ή τον χρόνο υλοποίησης.",
        en: "Hello! 👋 How can I help? Ask me about our services, pricing or timelines."
      }
    }
  ];

  const TEXT = {
    el: {
      title: "DeepLink Assistant",
      status: "Online",
      placeholder: "Γράψτε την ερώτησή σας…",
      send: "Αποστολή",
      open: "Άνοιγμα συνομιλίας",
      close: "Κλείσιμο συνομιλίας",
      reset: "Νέα συνομιλία",
      welcome: "Γεια σας! 👋 Είμαι ο ψηφιακός βοηθός της DeepLink. Ρωτήστε με ό,τι θέλετε για τις υπηρεσίες μας.\n(You can also ask in English.)",
      fallback: "Δεν είμαι σίγουρος ότι κατάλαβα. 🤔 Μπορώ να σας πω για τις υπηρεσίες μας, το AI, το κόστος, τον χρόνο υλοποίησης, τα e-shop, το SEO ή πού βρισκόμαστε.",
      chips: ["Τι υπηρεσίες προσφέρετε;", "Πώς βοηθά το AI την επιχείρησή μου;", "Φτιάχνετε e-shop;", "Πόσο κοστίζει μια ιστοσελίδα;", "Πού βρίσκεστε;"]
    },
    en: {
      title: "DeepLink Assistant",
      status: "Online",
      placeholder: "Type your question…",
      send: "Send",
      open: "Open chat",
      close: "Close chat",
      reset: "New conversation",
      welcome: "Hello! 👋 I'm DeepLink's virtual assistant. Ask me anything about our services.",
      fallback: "I'm not sure I understood. 🤔 I can tell you about our services, AI, pricing, timelines, e-shops, SEO or where we're based.",
      chips: ["What services do you offer?", "How can AI help my business?", "Do you build e-shops?", "How much does a website cost?", "Where are you based?"]
    }
  };

  const STORE_KEY = "deeplink-chat-v1";

  /* ---------- Matching ---------- */
  function normalise(s) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/ς/g, "σ")
      .replace(/[^\p{L}\p{N}.\-\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Pre-normalise keywords once (duplicates removed so shared terms count once).
  INTENTS.forEach(function (intent) {
    intent.norm = Array.from(new Set([].concat(intent.keywords.el, intent.keywords.en).map(normalise)));
    if (intent.requires) intent.req = intent.requires.map(normalise);
  });

  function detectLang(s) {
    return /[Ͱ-Ͽἀ-῿]/.test(s) ? "el" : "en";
  }

  // Returns the keyword's weight if it matches the message, otherwise 0.
  function match(kw, msg, words) {
    if (kw.indexOf(" ") !== -1) return msg.indexOf(kw) !== -1 ? kw.split(" ").length : 0;
    if (kw.length <= 3) return words.indexOf(kw) !== -1 ? 1 : 0;
    return words.some(function (w) { return w.indexOf(kw) === 0; }) ? 1 : 0;
  }

  function score(intent, msg, words) {
    if (intent.req && !intent.req.some(function (kw) { return match(kw, msg, words); })) return 0;
    return intent.norm.reduce(function (total, kw) { return total + match(kw, msg, words); }, 0);
  }

  function reply(text) {
    const lang = detectLang(text);
    const msg = normalise(text);
    const words = msg.split(" ");
    let best = null;
    let bestScore = 0;
    INTENTS.forEach(function (intent) {
      const s = score(intent, msg, words);
      if (s > bestScore) { best = intent; bestScore = s; }
    });
    if (!best) return { lang: lang, text: TEXT[lang].fallback, chips: TEXT[lang].chips.slice(0, 4) };
    return { lang: lang, text: best.answer[lang], chips: best.chips ? best.chips[lang] : [] };
  }

  /* ---------- State ---------- */
  let state = { lang: (document.documentElement.lang || "el").slice(0, 2) === "en" ? "en" : "el", messages: [] };
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
    if (saved && Array.isArray(saved.messages)) state = saved;
  } catch (e) { /* storage unavailable */ }

  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------- UI ---------- */
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  const t = function () { return TEXT[state.lang]; };

  const launcher = el("button", "dlc-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-controls", "dlc-panel");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = '<i class="bi bi-chat-dots-fill dlc-icon-open" aria-hidden="true"></i><i class="bi bi-x-lg dlc-icon-close" aria-hidden="true"></i>';

  const panel = el("div", "dlc-panel");
  panel.id = "dlc-panel";
  panel.setAttribute("role", "dialog");
  panel.hidden = true;

  const header = el("div", "dlc-header");
  const avatar = el("img", "dlc-avatar");
  avatar.src = "assets/img/logo.webp";
  avatar.alt = "";
  const headText = el("div", "dlc-head-text");
  const title = el("strong", null, t().title);
  const status = el("span", "dlc-status", t().status);
  headText.append(title, status);
  const resetBtn = el("button", "dlc-icon-btn");
  resetBtn.type = "button";
  resetBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>';
  const closeBtn = el("button", "dlc-icon-btn");
  closeBtn.type = "button";
  closeBtn.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
  header.append(avatar, headText, resetBtn, closeBtn);

  const log = el("div", "dlc-log");
  log.setAttribute("aria-live", "polite");

  const form = el("form", "dlc-form");
  const input = el("input", "dlc-input");
  input.type = "text";
  input.maxLength = 300;
  input.autocomplete = "off";
  const sendBtn = el("button", "dlc-send");
  sendBtn.type = "submit";
  sendBtn.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
  form.append(input, sendBtn);

  panel.append(header, log, form);
  document.body.append(panel, launcher);

  function applyLabels() {
    panel.setAttribute("aria-label", t().title);
    input.placeholder = t().placeholder;
    input.setAttribute("aria-label", t().placeholder);
    sendBtn.setAttribute("aria-label", t().send);
    resetBtn.setAttribute("aria-label", t().reset);
    resetBtn.title = t().reset;
    closeBtn.setAttribute("aria-label", t().close);
    launcher.setAttribute("aria-label", panel.hidden ? t().open : t().close);
  }

  function renderMessage(m) {
    const row = el("div", "dlc-msg dlc-" + m.from);
    row.append(el("div", "dlc-bubble", m.text));
    log.append(row);
    if (m.chips && m.chips.length) {
      const chips = el("div", "dlc-chips");
      m.chips.forEach(function (c) {
        const chip = el("button", "dlc-chip", c);
        chip.type = "button";
        chip.addEventListener("click", function () { send(c); });
        chips.append(chip);
      });
      log.append(chips);
    }
  }

  function renderAll() {
    log.textContent = "";
    state.messages.forEach(renderMessage);
    scrollDown();
  }

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function push(m) {
    // Only the latest bot message keeps clickable suggestions.
    log.querySelectorAll(".dlc-chips").forEach(function (c) { c.remove(); });
    state.messages.forEach(function (x) { delete x.chips; });
    state.messages.push(m);
    renderMessage(m);
    scrollDown();
    save();
  }

  function welcome() {
    push({ from: "bot", text: t().welcome, chips: t().chips });
  }

  let busy = false;
  function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    push({ from: "user", text: text });
    const answer = reply(text);
    if (answer.lang !== state.lang) { state.lang = answer.lang; applyLabels(); }

    const typing = el("div", "dlc-msg dlc-bot dlc-typing");
    typing.innerHTML = '<div class="dlc-bubble"><span></span><span></span><span></span></div>';
    log.append(typing);
    scrollDown();

    setTimeout(function () {
      typing.remove();
      push({ from: "bot", text: answer.text, chips: answer.chips });
      busy = false;
    }, 600 + Math.random() * 300);
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.classList.toggle("dlc-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    applyLabels();
    if (open) {
      if (!state.messages.length) welcome();
      scrollDown();
      input.focus();
    }
  }

  launcher.addEventListener("click", function () { setOpen(panel.hidden); });
  closeBtn.addEventListener("click", function () { setOpen(false); launcher.focus(); });
  resetBtn.addEventListener("click", function () {
    state.messages = [];
    log.textContent = "";
    welcome();
    input.focus();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    send(v);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { setOpen(false); launcher.focus(); }
  });

  applyLabels();
  renderAll();
})();
