import { EditableText } from "@/theme/core/editable-text"
import { EditableImage } from "@/theme/core/editable-image"

interface ServiceHeroSectionProps {
  basePath: string;
  title: string;
  subtitle: string;
  heroImage: string;
}

export function ServiceHeroSection({ basePath, title, subtitle, heroImage }: ServiceHeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <EditableText
                path={`${basePath}.title`}
                value={title}
                className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              />
            </div>
            
            <div>
              <EditableText
                path={`${basePath}.subtitle`}
                value={subtitle}
                className="text-xl text-gray-600 leading-relaxed"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Started
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="relative">
            <EditableImage
              path={`${basePath}.heroImage`}
              src={heroImage}
              alt={title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


