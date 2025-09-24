'use client';

import { SectionsRenderer } from '@/theme/core/preview-context';
import { ServiceHeroSection } from './ServiceHeroSection';
import { ServiceDescriptionSection } from './ServiceDescriptionSection';
import { ServicePricingSection } from './ServicePricingSection';
import { ServiceContactSection } from './ServiceContactSection';

export default function ServiceDetail({ serviceSlug }: { serviceSlug: string }) {
  return (
    <SectionsRenderer
      className="main"
      filterSections={(sections) => 
        sections.filter((section: any) => section.serviceSlug === serviceSlug)
      }
      renderSection={(section: any, index: number) => {
        switch (section.type) {
          case 'serviceHero':
            return (
              <ServiceHeroSection
                basePath={`sections.${section.id}`}
                title={section.data.title}
                subtitle={section.data.subtitle}
                heroImage={section.data.heroImage}
              />
            );
          case 'serviceDescription':
            return (
              <ServiceDescriptionSection
                basePath={`sections.${section.id}`}
                description={section.data.description}
                features={section.data.features}
              />
            );
          case 'servicePricing':
            return (
              <ServicePricingSection
                basePath={`sections.${section.id}`}
                title={section.data.title}
                basePrice={section.data.basePrice}
                currency={section.data.currency}
                billing={section.data.billing}
                ctaText={section.data.ctaText}
              />
            );
          case 'serviceContact':
            return (
              <ServiceContactSection
                basePath={`sections.${section.id}`}
                title={section.data.title}
                message={section.data.message}
                ctaText={section.data.ctaText}
              />
            );
          default:
            console.warn(`No component found for section type: ${section.type}`);
            return null;
        }
      }}
    />
  );
}


