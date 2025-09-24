/**
 * SITE SCHEMA - Central Configuration & Validation System
 * 
 * Defines the structure, validation rules, and defaults for all site data.
 * This is the single source of truth for what fields exist and how they behave.
 * 
 * Key Sections:
 * - _meta: Schema versioning and metadata
 * - site: Global site information (brand, slug, locale, etc.)
 * - features: Feature flags (blogEnabled, etc.)
 * - sectionTypes: Available section types with their schemas
 * - pages: Page type definitions and allowed sections
 * 
 * Schema Features:
 * - Field validation (type, maxLength, required, etc.)
 * - Editing controls (editable, description, options)
 * - Localization support (localized: true)
 * - Default values for new sections
 * - Display names for UI components
 * 
 * Usage: Import and use for validation, type checking, and UI generation
 * 
 * Example:
 * const heroSchema = siteSchema.sectionTypes.hero.schema
 * const isEditable = siteSchema.sectionTypes.hero.schema.title.editable
 */

export const siteSchema = {
  _meta: {
    schemaVersion: 1
  },
  site: {
    brand: { type: "string", editable: true, localized: true, maxLength: 50, description: "Business name" },
    city: { type: "string", editable: true, localized: true, maxLength: 50, description: "Business city" },
    slug: { type: "string", editable: false, maxLength: 30, description: "URL slug" },
    locale: { type: "string", editable: false, maxLength: 10, description: "Site locale" },
    tone: { type: "string", editable: true, localized: true, maxLength: 20, description: "Brand tone" }
  },
  features: {
    blogEnabled: { type: "boolean", editable: true, description: "Enable blog pages" }
  },
  // Registry of available section types for the picker
  sectionTypes: {
    hero: {
      displayName: 'Hero Section',
      description: 'Main banner with headline and call-to-action',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        shortHeadline: { type: "string", editable: true, localized: true, maxLength: 100, description: "Main headline" },
        subHeadline: { type: "string", editable: true, localized: true, maxLength: 200, description: "Sub headline" },
        primaryCta: {
          label: { type: "string", editable: true, localized: true, maxLength: 30, description: "Primary button text" },
          href: { type: "string", editable: false, maxLength: 100, description: "Primary button link" }
        },
        secondaryCta: {
          label: { type: "string", editable: true, localized: true, maxLength: 25, description: "Secondary button text" },
          href: { type: "string", editable: false, maxLength: 100, description: "Secondary button link" }
        },
        heroImage: { type: "image", editable: true, maxLength: 200, description: "Hero section image" }
      },
      defaultData: {
        shortHeadline: 'Your Business Headline',
        subHeadline: 'Compelling subtitle that explains your value proposition',
        primaryCta: { label: 'Get Started', href: '#contact' },
        secondaryCta: { label: 'Learn More', href: '#about' },
        heroImage: '/placeholder.jpg'
      }
    },
    about: {
      displayName: 'About Section',
      description: 'Information about your business',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "About section title" },
        story: { type: "richtext", editable: true, localized: true, maxLength: 1000, description: "About story text" },
        credentials: { 
          type: "array", 
          editable: true, 
          description: "Professional credentials",
          itemSchema: {
            name: { type: "string", editable: true, localized: true, maxLength: 100, description: "Credential name" }
          }
        },
        badges: { 
          type: "array", 
          editable: true, 
          description: "Certification badges",
          itemSchema: {
            name: { type: "string", editable: true, localized: true, maxLength: 100, description: "Badge name" }
          }
        },
        aboutImage: { type: "image", editable: true, maxLength: 200, description: "About section image" }
      },
      defaultData: {
        title: 'About Us',
        story: 'Tell your business story here...',
        credentials: [{ name: 'Professional Certification' }],
        badges: [{ name: 'Trusted Partner' }],
        aboutImage: ''
      }
    },
    services: {
      displayName: 'Services Section',
      description: 'List of services you offer',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Services section title" },
        subtitle: { type: "string", editable: true, localized: true, maxLength: 200, description: "Services section subtitle" },
        items: {
          type: "array",
          editable: true,
          description: "List of services",
          maxItems: 4,
          itemSchema: {
            name: { type: "string", editable: true, localized: true, maxLength: 50, description: "Service name" },
            description: { type: "string", editable: true, localized: true, maxLength: 200, description: "Service description" },
            price: { type: "string", editable: true, localized: true, maxLength: 20, description: "Service price" },
            image: { type: "image", editable: true, maxLength: 200, description: "Service image" }
          }
        }
      },
      defaultData: {
        title: 'Our Services',
        subtitle: 'Comprehensive bookkeeping solutions tailored to your business needs',
        items: [
          { name: 'Service 1', description: 'Description of service 1', price: '$100', image: '' }
        ]
      }
    },
    contact: {
      displayName: 'Contact Section',
      description: 'Contact information and form',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Contact section title" },
        phone: { type: "string", editable: true, maxLength: 20, description: "Phone number" },
        email: { type: "string", editable: true, maxLength: 100, description: "Email address" },
        address: { type: "string", editable: true, localized: true, maxLength: 200, description: "Business address" },
        primaryCta: {
          label: { type: "string", editable: true, localized: true, maxLength: 30, description: "Contact button text" },
          href: { type: "string", editable: false, maxLength: 100, description: "Contact button link" }
        },
        form: {
          enabled: { type: "boolean", editable: true, description: "Enable contact form" },
          fields: {
            type: "array",
            editable: true,
            description: "Form fields",
            itemSchema: {
              name: { type: "string", editable: true, maxLength: 50, description: "Field key" },
              label: { type: "string", editable: true, localized: true, maxLength: 100, description: "Field label" },
              type: { type: "select", editable: true, description: "Field type", options: ["text", "email", "textarea"] },
              required: { type: "boolean", editable: true, description: "Required" }
            }
          }
        }
      },
      defaultData: {
        title: 'Get In Touch',
        phone: '(555) 123-4567',
        email: 'hello@example.com',
        address: '123 Main St, City, State',
        primaryCta: { label: 'Contact Us', href: '#contact' },
        form: {
          enabled: true,
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'message', label: 'How can we help?', type: 'textarea', required: true }
          ]
        }
      }
    },
    testimonials: {
      displayName: 'Testimonials Section',
      description: 'Customer reviews and testimonials',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Testimonials section title" },
        items: {
          type: "array",
          editable: true,
          description: "Customer testimonials",
          itemSchema: {
            quote: { type: "richtext", editable: true, localized: true, maxLength: 500, description: "Testimonial quote" },
            author: { type: "string", editable: true, localized: true, maxLength: 50, description: "Testimonial author" },
            company: { type: "string", editable: true, localized: true, maxLength: 50, description: "Author company" },
            rating: { type: "number", editable: true, description: "Rating out of 5" },
            authorImage: { type: "image", editable: true, maxLength: 200, description: "Author profile image" }
          }
        }
      },
      defaultData: {
        title: 'What Our Clients Say',
        items: [
          { quote: 'Great service!', author: 'John Doe', company: 'ABC Corp', rating: 5, authorImage: '' }
        ]
      }
    },
    whyChooseUs: {
      displayName: 'Why Choose Us Section',
      description: 'Reasons to choose your business',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Why choose us section title" },
        bullets: {
          type: "array",
          editable: true,
          description: "Reasons to choose us",
          itemSchema: {
            name: { type: "string", editable: true, localized: true, maxLength: 100, description: "Reason bullet point" }
          }
        }
      },
      defaultData: {
        title: 'Why Choose Us',
        bullets: [{ name: 'Reason 1' }, { name: 'Reason 2' }, { name: 'Reason 3' }]
      }
    },
    industriesServed: {
      displayName: 'Industries Section',
      description: 'Industries you serve',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Industries section title" },
        items: {
          type: "array",
          editable: true,
          description: "Industries we serve",
          maxItems: 6,
          itemSchema: {
            name: { type: "string", editable: true, localized: true, maxLength: 50, description: "Industry name" }
            // icon: { type: "image", editable: true, description: "Industry icon" },
            // blurb: { type: "string", editable: true, localized: true, maxLength: 120, description: "Short blurb" }
          }
        }
      },
      defaultData: {
        title: 'Industries We Serve',
        items: [
          { name: 'Industry 1' },
          { name: 'Industry 2' },
          { name: 'Industry 3' }
        ]
      }
    },
    blogTeaser: {
      displayName: 'Blog Section',
      description: 'Latest blog posts or articles',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Blog section title" },
        items: {
          type: "array",
          editable: true,
          description: "Latest blog posts",
          itemSchema: {
            title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Blog post title" },
            excerpt: { type: "string", editable: true, localized: true, maxLength: 200, description: "Blog post excerpt" },
            href: { type: "string", editable: false, maxLength: 100, description: "Blog post URL" },
            date: { type: "date", editable: true, description: "Blog post date" },
            image: { type: "image", editable: true, maxLength: 200, description: "Blog post featured image" }
          }
        }
      },
      defaultData: {
        title: 'Latest Insights',
        items: [
          { title: 'Blog Post 1', excerpt: 'Brief description...', href: '/blog/post-1', date: '2024-01-15', image: '' }
        ]
      }
    },
    team: {
      displayName: 'Team / Meet the Experts',
      description: 'Profiles of key team members with headshots',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: 'string', editable: true, localized: true, maxLength: 100, description: 'Team section title' },
        subtitle: { type: 'string', editable: true, localized: true, maxLength: 200, description: 'Short intro for team' },
        items: {
          type: 'array',
          editable: true,
          description: 'Team members',
          maxItems: 6,
          itemSchema: {
            name: { type: 'string', editable: true, localized: true, maxLength: 60, description: 'Member name' },
            role: { type: 'string', editable: true, localized: true, maxLength: 60, description: 'Member role/title' },
            city: { type: 'string', editable: true, localized: true, maxLength: 60, description: 'City for SEO' },
            bio: { type: 'richtext', editable: true, localized: true, maxLength: 600, description: 'Short bio' },
            image: { type: 'image', editable: true, maxLength: 200, description: 'Headshot' }
          }
        }
      },
      defaultData: {
        title: 'Meet the Experts',
        subtitle: 'Our experienced team of bookkeeping professionals',
        items: [
          { name: 'Alex Johnson', role: 'Senior Bookkeeper', city: 'Seattle', bio: '10+ years helping SMBs thrive.', image: '/placeholder-user.jpg' },
          { name: 'Priya Patel', role: 'Payroll Specialist', city: 'Seattle', bio: 'Ensuring accurate and timely payrolls.', image: '/placeholder-user.jpg' },
          { name: 'Marcus Lee', role: 'Reporting Analyst', city: 'Seattle', bio: 'Turning numbers into insights.', image: '/placeholder-user.jpg' }
        ]
      }
    },
    // Service page sections
    serviceHero: {
      displayName: 'Service Hero',
      description: 'Service page header section',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Service title" },
        subtitle: { type: "string", editable: true, localized: true, maxLength: 200, description: "Service subtitle" },
        heroImage: { type: "image", editable: true, maxLength: 200, description: "Service hero image" }
      },
      defaultData: {
        title: 'Service Name',
        subtitle: 'Service description',
        heroImage: '/placeholder.jpg'
      }
    },
    serviceDescription: {
      displayName: 'Service Description',
      description: 'Detailed service information',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        description: { type: "richtext", editable: true, localized: true, maxLength: 2000, description: "Detailed service description" },
        features: {
          type: "array",
          editable: true,
          description: "Service features",
          itemSchema: {
            name: { type: "string", editable: true, localized: true, maxLength: 100, description: "Feature" }
          }
        }
      },
      defaultData: {
        description: 'Detailed service description...',
        features: [{ name: 'Feature 1' }, { name: 'Feature 2' }, { name: 'Feature 3' }]
      }
    },
    servicePricing: {
      displayName: 'Service Pricing',
      description: 'Service pricing information',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Pricing section title" },
        basePrice: { type: "number", editable: true, description: "Base service price" },
        currency: { type: "select", editable: true, maxLength: 10, description: "Currency code", options: ["USD", "EUR", "GBP", "CAD"] },
        billing: { type: "select", editable: true, maxLength: 20, description: "Billing frequency", options: ["monthly", "yearly", "one-time"] },
        ctaText: { type: "string", editable: true, localized: true, maxLength: 30, description: "Call to action text" }
      },
      defaultData: {
        title: 'Pricing & Packages',
        basePrice: 300,
        currency: 'USD',
        billing: 'monthly',
        ctaText: 'Get Started'
      }
    },
    serviceContact: {
      displayName: 'Service Contact',
      description: 'Service contact section',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "Contact section title" },
        message: { type: "string", editable: true, localized: true, maxLength: 200, description: "Contact message" },
        ctaText: { type: "string", editable: true, localized: true, maxLength: 30, description: "Contact button text" }
      },
      defaultData: {
        title: 'Ready to Get Started?',
        message: 'Contact us today to discuss your needs.',
        ctaText: 'Contact Us'
      }
    },
    // About Us page sections
    aboutUsHero: {
      displayName: 'About Us Hero',
      description: 'About us page header with title, text, and image',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: "string", editable: true, localized: true, maxLength: 100, description: "About us page title" },
        content: { type: "richtext", editable: true, localized: true, maxLength: 2000, description: "About us main content" },
        image: { type: "image", editable: true, maxLength: 200, description: "About us image" }
      },
      defaultData: {
        title: 'About Us',
        content: 'Tell your story here. Share your company\'s mission, values, and what makes you unique...',
        image: '/placeholder.jpg'
      }
    },
    // Blog sections
    blogList: {
      displayName: 'Blog List',
      description: 'Lists blog posts from backend with configurable layout',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        title: { type: 'string', editable: true, localized: true, maxLength: 100, description: 'Page title' },
        intro: { type: 'richtext', editable: true, localized: true, maxLength: 500, description: 'Intro text above list' },
        pageSize: { type: 'number', editable: true, description: 'Posts per page' },
        layout: { type: 'select', editable: true, description: 'List layout', options: ['list', 'grid'] },
        showDates: { type: 'boolean', editable: true, description: 'Show publish dates' },
        showAuthors: { type: 'boolean', editable: true, description: 'Show authors' }
      },
      defaultData: {
        title: 'Latest Articles & Insights',
        intro: '',
        pageSize: 10,
        layout: 'list',
        showDates: true,
        showAuthors: false
      }
    },
    blogArticle: {
      displayName: 'Blog Article',
      description: 'Renders a single blog post with optional overrides',
      singleton: true,
      region: 'main',
      allowedRegions: ['main'],
      schema: {
        heroTitleOverride: { type: 'string', editable: true, localized: true, maxLength: 120, description: 'Override article title' },
        heroImageOverride: { type: 'image', editable: true, maxLength: 200, description: 'Override hero image' },
        showToc: { type: 'boolean', editable: true, description: 'Show table of contents' },
        showShare: { type: 'boolean', editable: true, description: 'Show share buttons' },
        showAuthorBox: { type: 'boolean', editable: true, description: 'Show author box' }
      },
      defaultData: {
        heroTitleOverride: '',
        heroImageOverride: '',
        showToc: false,
        showShare: true,
        showAuthorBox: true
      }
    }
  },
  pages: {
    home: {
      allowedSectionTypes: ["hero", "about", "services", "team", "contact", "testimonials", "whyChooseUs", "industriesServed", "blogTeaser"]
    },
    "service-detail": {
      allowedSectionTypes: ["serviceHero", "serviceDescription", "servicePricing", "serviceContact"]
    },
    "about-us": {
      allowedSectionTypes: ["aboutUsHero"]
    },
    "blog-index": {
      allowedSectionTypes: ["blogList"]
    },
    "blog-post": {
      allowedSectionTypes: ["blogArticle"]
    }
  }
} as const;

// Type definitions for better TypeScript support
export type SiteSchema = typeof siteSchema;
export type SectionType = keyof typeof siteSchema.sectionTypes;
export type SectionTypeConfig = typeof siteSchema.sectionTypes[SectionType];
export type FieldSchema = {
  type: "string" | "number" | "boolean" | "image" | "array" | "richtext" | "select" | "color" | "date";
  maxLength?: number;
  editable: boolean;
  localized?: boolean;
  description: string;
  options?: string[];
  itemSchema?: any;
  maxItems?: number;
};

// Extended field type definitions
export type ExtendedFieldType = "string" | "number" | "boolean" | "image" | "array" | "richtext" | "select" | "color" | "date";

// Localized value type for i18n support
export interface LocalizedValue {
  value: string;
  isTranslated: boolean;
  isFallback: boolean;
  availableLocales: string[];
}