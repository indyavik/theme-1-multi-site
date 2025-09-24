import { CheckCircle } from "lucide-react"
import { EditableText } from "@/theme/core/editable-text"

interface WhyChooseUsSectionProps {
  data: {
    title: string
    // Accept new shape from schema ({ name: string }) and legacy string[]
    bullets: Array<{ name: string } | string>
  }
}

export function WhyChooseUsSection({ data }: WhyChooseUsSectionProps) {
  // Normalize bullets so component can handle both { name }[] and string[]
  const items = Array.isArray(data.bullets)
    ? data.bullets.map((b: any) => (typeof b === 'string' ? { name: b } : b))
    : [];
  return (
    <section className="py-16 bg-emerald-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.whyChooseUs.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-4 block"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((bullet, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <EditableText
                path={`sections.whyChooseUs.bullets.${index}.name`}
                value={bullet?.name ?? ''}
                className="text-slate-700 text-lg block"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
