import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar } from "lucide-react"
import { EditableText } from "@/theme/core/editable-text"
import { EditableImage } from "@/theme/core/editable-image"

interface BlogTeaserSectionProps {
  data: {
    title: string
    items: Array<{
      title: string
      excerpt: string
      href: string
      date: string
      image?: string
    }>
  }
}

export function BlogTeaserSection({ data }: BlogTeaserSectionProps) {
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.blogTeaser.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-4 block"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((post, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              {post.image && (
                <div className="aspect-video overflow-hidden">
                  <EditableImage
                    path={`sections.blogTeaser.items.${index}.image`}
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  <EditableText
                    path={`sections.blogTeaser.items.${index}.title`}
                    value={post.title}
                    className="block"
                  />
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <EditableText
                    path={`sections.blogTeaser.items.${index}.date`}
                    value={post.date}
                    className="block"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <EditableText
                  path={`sections.blogTeaser.items.${index}.excerpt`}
                  value={post.excerpt}
                  className="text-slate-600 mb-4 block"
                />
                <a
                  href={post.href}
                  className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
