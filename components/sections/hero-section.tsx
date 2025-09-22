import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { EditableText } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"

interface HeroSectionProps {
  data: {
    shortHeadline: string
    subHeadline: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    heroImage: string
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-secondary via-background to-card py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/5 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left animate-fade-in">
            <EditableText
              path="sections.hero-main.shortHeadline"
              value={data.shortHeadline}
              className="font-heading font-bold text-4xl lg:text-6xl text-foreground mb-6 text-balance leading-tight block"
            />
            
            <EditableText
              path="sections.hero-main.subHeadline"
              value={data.subHeadline}
              className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed max-w-2xl block"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg btn-hover-lift shadow-lg"
                asChild
              >
                <a href={data.primaryCta?.href || '#'}>
                  <EditableText
                    path="sections.hero-main.primaryCta.label"
                    value={data.primaryCta?.label || 'Get Started'}
                  />
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-lg btn-hover-lift transition-all duration-300 bg-transparent"
                asChild
              >
                <a href={data.secondaryCta?.href || '#'}>
                  <EditableText
                    path="sections.hero-main.secondaryCta.label"
                    value={data.secondaryCta?.label || 'Learn More'}
                  />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex-1 flex justify-center animate-fade-in">
            <div className="relative">
              <div className="bg-white rounded-lg p-4 shadow-2xl">
                <EditableImage
                  path="sections.hero-main.heroImage"
                  src={data.heroImage}
                  alt="Professional accountant"
                  width={500}
                  height={500}
                  className="rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
