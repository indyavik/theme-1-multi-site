import { EditableText } from "@/components/ui/editable-text"

interface ServicePricingSectionProps {
  basePath: string;
  title: string;
  basePrice: number;
  currency: string;
  billing: string;
  ctaText: string;
}

export function ServicePricingSection({ 
  basePath,
  title, 
  basePrice, 
  currency, 
  billing, 
  ctaText 
}: ServicePricingSectionProps) {
  const formatPrice = (price: number, currency: string) => {
    let validCurrency = 'USD';
    if (currency && typeof currency === 'string' && currency.length === 3 && !currency.includes('{')) {
      validCurrency = currency.toUpperCase();
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: validCurrency,
      }).format(price);
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    }
  };

  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <EditableText
            path={`${basePath}.title`}
            value={title}
            className="text-3xl font-bold text-gray-900 mb-4"
          />
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <EditableText
                  path={`${basePath}.basePrice`}
                  value={basePrice}
                  type="number"
                  className="inline-block"
                />
              </div>
              <div className="text-gray-600 capitalize">
                per <EditableText
                  path={`${basePath}.billing`}
                  value={billing}
                  className="inline"
                />
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Full service included</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Monthly reporting</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Dedicated support</span>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <EditableText
                path={`${basePath}.ctaText`}
                value={ctaText}
                className="block"
              >
                {ctaText}
              </EditableText>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


