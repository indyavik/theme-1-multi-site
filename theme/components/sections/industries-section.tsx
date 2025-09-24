import { Building2 } from "lucide-react"
import { EditableText, EditableList } from "@/theme/core/editable-text"

type IndustryItem = { name: string } | string
interface IndustriesSectionProps {
  data: {
    title: string
    items: IndustryItem[]
  }
}

export function IndustriesSection({ data }: IndustriesSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.industriesServed.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-4 block"
          />
        </div>

        <EditableList
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          path="sections.industriesServed.items"
          items={data.items}
          renderItem={(industry, index) => (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Building2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              {typeof industry === 'string' ? (
                <EditableText
                  path={`sections.industriesServed.items.${index}.name`}
                  value={industry}
                  className="text-slate-700 font-medium block"
                />
              ) : (
                <EditableText
                  path={`sections.industriesServed.items.${index}.name`}
                  value={(industry as any)?.name || ''}
                  className="text-slate-700 font-medium block"
                />
              )}
            </div>
          )}
        />
      </div>
    </section>
  )
}
