import { CheckCircle } from "lucide-react"
import { EditableText } from "@/components/ui/editable-text"

interface WhyChooseUsSectionProps {
  data: {
    title: string
    bullets: string[]
  }
}

export function WhyChooseUsSection({ data }: WhyChooseUsSectionProps) {
  return (
    <section className="py-16 bg-emerald-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.why-choose-us.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-4 block"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.bullets.map((bullet, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <EditableText
                path={`sections.why-choose-us.bullets.${index}`}
                value={bullet}
                className="text-slate-700 text-lg block"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
