import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calculator, Users, FileText, BarChart3 } from "lucide-react"
import { EditableText, EditableList } from "@/theme/core/editable-text"
import { EditableImage } from "@/theme/core/editable-image"

interface ServicesSectionProps {
  data: {
    title: string
    subtitle: string
    items: Array<{
      name: string
      description: string
      price: string
      image?: string
    }>
  }
}

const serviceIcons = {
  "Monthly Bookkeeping": Calculator,
  "Payroll Processing": Users,
  "AP/AR Management": FileText,
  "Financial Reporting": BarChart3,
}

export function ServicesSection({ data }: ServicesSectionProps) {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.services.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-4 block"
          />
          <EditableText
            path="sections.services.subtitle"
            value={data.subtitle}
            className="text-lg text-slate-600 block"
          />
        </div>

        <EditableList
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          path="sections.services.items"
          items={data.items}
          renderItem={(service, index) => {
            const IconComponent = serviceIcons[service.name as keyof typeof serviceIcons] || Calculator
            return (
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow h-[340px] flex flex-col">
                <CardHeader className="text-center pb-4">
                  {service.image ? (
                    <EditableImage
                      path={`sections.services.items.${index}.image`}
                      src={service.image}
                      alt={service.name}
                      width={80}
                      height={80}
                      className="rounded-lg mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    <EditableText
                      path={`sections.services.items.${index}.name`}
                      value={service.name}
                      className="block truncate"
                    />
                  </CardTitle>
                  <EditableText
                    path={`sections.services.items.${index}.description`}
                    value={service.description}
                    className="text-sm text-slate-600 block line-clamp-3"
                  />
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-2">
                      <EditableText
                        path={`sections.services.items.${index}.price`}
                        value={service.price}
                        className="block"
                      />
                    </div>
                    <p className="text-xs text-slate-500">per month</p>
                  </div>
                </CardContent>
              </Card>
            )
          }}
        />
      </div>
    </section>
  )
}
