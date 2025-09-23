import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditableText, EditableList } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"

interface TeamSectionProps {
  data: {
    title: string
    subtitle: string
    items: Array<{ name: string; role: string; city: string; bio: string; image: string }>
  }
}

export function TeamSection({ data }: TeamSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.team.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-2 block"
          />
          <EditableText
            path="sections.team.subtitle"
            value={data.subtitle}
            className="text-slate-600 block"
          />
        </div>

        <EditableList
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          path="sections.team.items"
          items={data.items}
          renderItem={(member, index) => (
            <Card className="bg-slate-50 border-0 shadow-lg">
              <CardHeader className="pb-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white shadow">
                  <EditableImage
                    path={`sections.team.items.${index}.image`}
                    src={member.image}
                    alt={member.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    <EditableText
                      path={`sections.team.items.${index}.name`}
                      value={member.name}
                      className="block"
                      placeholder="Full name"
                    />
                  </CardTitle>
                  <EditableText
                    path={`sections.team.items.${index}.role`}
                    value={member.role}
                    className="text-sm text-slate-600 block"
                    placeholder="Role / Title"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <EditableText
                  path={`sections.team.items.${index}.city`}
                  value={member.city}
                  className="text-xs text-slate-500 mb-2 block"
                  placeholder="City"
                />
                <EditableText
                  path={`sections.team.items.${index}.bio`}
                  value={member.bio}
                  className="text-slate-700 text-sm block"
                  placeholder="Short bio"
                />
              </CardContent>
            </Card>
          )}
        />
      </div>
    </section>
  )
}


