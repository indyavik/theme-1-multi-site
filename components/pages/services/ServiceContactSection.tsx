import { EditableText } from "@/components/ui/editable-text"

interface ServiceContactSectionProps {
  basePath: string;
  title: string;
  message: string;
  ctaText: string;
}

export function ServiceContactSection({ basePath, title, message, ctaText }: ServiceContactSectionProps) {
  return (
    <section className="bg-blue-600 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <EditableText
            path={`${basePath}.title`}
            value={title}
            className="text-3xl font-bold text-white mb-6"
          />
          
          <EditableText
            path={`${basePath}.message`}
            value={message}
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {ctaText}
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Call (206) 555-0123
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


