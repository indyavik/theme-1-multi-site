export const siteData = {
  site: {
    brand: "TechFlow Solutions",
    city: "Austin, TX",
    slug: "techflow-solutions-austin",
    locale: "en",
    tone: "modern",
  },
  sections: [
    {
      id: "hero-main",
      type: "hero",
      enabled: true,
      order: 10,
      data: {
        shortHeadline: "Custom Software Development That Scales",
        subHeadline: "Full-stack solutions for startups and growing businesses—built right the first time.",
        primaryCta: { label: "Start Your Project", href: "#contact" },
        secondaryCta: { label: "View Our Work", href: "#services" },
      },
    },
    {
      id: "about",
      type: "about",
      enabled: true,
      order: 20,
      data: {
        title: "About TechFlow Solutions",
        story: "Expert development team specializing in React, Node.js, and cloud architecture with 8+ years building scalable applications.",
        credentials: ["AWS Certified", "React Expert", "Node.js Specialist"],
        badges: ["Y Combinator Alumni", "Top Rated on Upwork"],
      },
    },
    {
      id: "services",
      type: "services",
      enabled: true,
      order: 30,
      data: {
        items: [
          {
            name: "Web Application Development",
            summary: "Full-stack web apps that perform.",
            bullets: ["React/Next.js frontend", "Node.js/Python backend", "Database design"],
          },
          { 
            name: "Mobile Apps", 
            bullets: ["React Native", "iOS/Android deployment", "Cross-platform optimization"] 
          },
          { 
            name: "Cloud Infrastructure", 
            bullets: ["AWS/GCP setup", "CI/CD pipelines", "Scalable architecture"] 
          },
          { 
            name: "Technical Consulting", 
            bullets: ["Architecture review", "Code audits", "Team mentoring"] 
          },
        ],
      },
    },
    {
      id: "industries",
      type: "industriesServed",
      enabled: true,
      order: 40,
      data: { items: ["SaaS Startups", "E-commerce", "FinTech", "HealthTech", "EdTech"] },
    },
    {
      id: "pricing",
      type: "pricing",
      enabled: true,
      order: 50,
      data: {
        note: "Flexible engagement models. Fixed-price projects and hourly consulting available.",
        plans: [
          {
            name: "MVP Development",
            priceDisplay: "$15k-50k",
            ctaLabel: "Get Quote",
            ctaHref: "#contact",
            includes: ["Full-stack development", "3-month timeline", "Deployment included"],
          },
          {
            name: "Ongoing Development",
            priceDisplay: "$8k-15k/mo",
            ctaLabel: "Schedule Call",
            ctaHref: "#contact",
            includes: ["Dedicated team", "Weekly sprints", "Unlimited revisions"],
          },
        ],
      },
    },
    {
      id: "proof",
      type: "testimonials",
      enabled: true,
      order: 60,
      data: {
        items: [
          { quote: "They built our entire platform in 4 months. Incredible quality and speed.", author: "Sarah Chen", company: "DataViz Pro" },
          { quote: "Best development partner we've worked with. Highly recommend.", author: "Mike Rodriguez", company: "GreenTech Innovations" },
        ],
      },
    },
    {
      id: "why-us",
      type: "whyChooseUs",
      enabled: true,
      order: 70,
      data: {
        bullets: [
          "Senior-level developers only",
          "Agile methodology with weekly demos",
          "Modern tech stack (React, Node.js, AWS)",
          "Fixed timelines and budgets",
        ],
      },
    },
    {
      id: "contact",
      type: "contact",
      enabled: true,
      order: 80,
      data: {
        phone: "(512) 555-0199",
        email: "hello@techflowsolutions.dev",
        address: "1234 Congress Ave, Austin, TX",
        calendarUrl: "https://calendly.com/techflow-solutions/consultation",
        primaryCta: { label: "Schedule Free Consultation", href: "https://calendly.com/techflow-solutions/consultation" },
        form: {
          enabled: true,
          fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "company", label: "Company", type: "text", required: false },
            { name: "message", label: "Tell us about your project", type: "textarea", required: true },
          ],
        },
      },
    },
    {
      id: "faq",
      type: "faq",
      enabled: true,
      order: 90,
      data: {
        items: [
          { q: "What's your typical project timeline?", a: "Most projects range from 2-6 months depending on complexity. We provide detailed timelines upfront." },
          { q: "Do you work with existing codebases?", a: "Absolutely! We can audit, refactor, or extend your existing applications." },
          { q: "What technologies do you specialize in?", a: "React, Next.js, Node.js, Python, AWS, and modern database technologies." },
        ],
      },
    },
    {
      id: "blog",
      type: "blogTeaser",
      enabled: true,
      order: 100,
      data: {
        items: [
          {
            title: "Building Scalable React Applications",
            href: "/blog/scalable-react-apps",
            excerpt: "Best practices for large-scale React development",
          },
          { 
            title: "AWS vs GCP: Choosing Your Cloud Platform", 
            href: "/blog/aws-vs-gcp",
            excerpt: "A comprehensive comparison for startups"
          },
        ],
      },
    },
    {
      id: "footer",
      type: "footer",
      enabled: true,
      order: 110,
      data: {
        brand: "TechFlow Solutions",
        email: "hello@techflowsolutions.dev",
        phone: "(512) 555-0199",
        address: "1234 Congress Ave, Austin, TX",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Blog", href: "/blog" },
          { label: "Case Studies", href: "/case-studies" },
        ],
      },
    },
  ],
} as const

export type SiteData = typeof siteData
export type Section = SiteData["sections"][number] 