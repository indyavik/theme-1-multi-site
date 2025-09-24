import { EditableText } from "@/theme/core/editable-text";
import { EditableImage } from "@/theme/core/editable-image";

interface AboutUsHeroSectionProps {
  data: {
    title: string;
    content: string;
    image: string;
  };
}

export function AboutUsHeroSection({ data }: AboutUsHeroSectionProps) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content - Left Side */}
          <div>
            <EditableText
              path="sections.about-us-hero.title"
              value={data.title}
              className="text-4xl font-bold text-gray-900 mb-6"
            />
            
            <div className="text-lg text-gray-600 leading-relaxed">
              <EditableText
                path="sections.about-us-hero.content"
                value={data.content}
                className="prose prose-lg max-w-none"
                multiline={true}
              />
            </div>
          </div>
          
          {/* Image - Right Side */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <EditableImage
                path="sections.about-us-hero.image"
                src={data.image}
                alt={data.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
