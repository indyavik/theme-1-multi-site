import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { EditableText } from "@/components/ui/editable-text"
import { EditableImage } from "@/components/ui/editable-image"

interface TestimonialsSectionProps {
  data: {
    title: string
    items: Array<{
      quote: string
      author: string
      company: string
      rating: number
      authorImage?: string
    }>
  }
}

export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <EditableText
            path="sections.testimonials.title"
            value={data.title}
            className="font-sans font-bold text-3xl lg:text-4xl text-slate-900 mb-4 block"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((testimonial, index) => (
            <Card key={index} className="bg-slate-50 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-emerald-600 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <EditableText
                  path={`sections.testimonials.items.${index}.quote`}
                  value={testimonial.quote}
                  className="text-slate-700 mb-4 italic block"
                />
                
                <div className="border-t pt-4">
                  <div className="flex items-center gap-3">
                    {testimonial.authorImage ? (
                      <EditableImage
                        path={`sections.testimonials.items.${index}.authorImage`}
                        src={testimonial.authorImage}
                        alt={testimonial.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 font-semibold text-sm">
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <EditableText
                        path={`sections.testimonials.items.${index}.author`}
                        value={testimonial.author}
                        className="font-semibold text-slate-900 block"
                      />
                      <EditableText
                        path={`sections.testimonials.items.${index}.company`}
                        value={testimonial.company}
                        className="text-sm text-slate-600 block"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
