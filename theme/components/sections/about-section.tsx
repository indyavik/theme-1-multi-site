import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Shield } from "lucide-react"
import { EditableText } from "@/theme/core/editable-text"
import { EditableImage } from "@/theme/core/editable-image"

interface AboutSectionProps {
  data: {
    title: string
    story: string
    credentials: Array<{ name: string }>
    badges: Array<{ name: string }>
    aboutImage?: string
  }
}

export function AboutSection({ data }: AboutSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <EditableText
              path="sections.about.title"
              value={data.title}
              className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-6 block"
            />
            <EditableText
              path="sections.about.story"
              value={data.story}
              className="text-lg text-slate-600 mb-8 leading-relaxed block"
            />
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Professional Credentials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.credentials.map((credential, index) => (
                    <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                      <EditableText
                        path={`sections.about.credentials.${index}.name`}
                        value={credential.name}
                        className="block"
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="border-emerald-200 text-emerald-700">
                      <EditableText
                        path={`sections.about.badges.${index}.name`}
                        value={badge.name}
                        className="block"
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:order-first">
            <Card className="bg-slate-50 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  {data.aboutImage ? (
                    <EditableImage
                      path="sections.about.aboutImage"
                      src={data.aboutImage}
                      alt="About us"
                      width={300}
                      height={300}
                      className="rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-12 h-12 text-emerald-600" />
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-900 mb-2">Trusted Professionals</h3>
                  <p className="text-slate-600 text-sm">
                    With years of experience and industry certifications, we provide reliable bookkeeping services you can count on.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
