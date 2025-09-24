interface FooterSectionProps {
  data: {
    brand: string
    email: string
    phone: string
    address: string
    links: Array<{
      label: string
      href: string
    }>
  }
}

export function FooterSection({ data }: FooterSectionProps) {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-sans font-bold text-xl mb-4">{data.brand}</h3>
            <p className="text-slate-300 mb-4">
              Professional bookkeeping services for small businesses in Seattle and beyond.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-slate-300">
              <div>{data.phone}</div>
              <div>{data.email}</div>
              <div>{data.address}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <div className="space-y-2">
              {data.links.map((link, index) => (
                <div key={index}>
                  <a href={link.href} className="text-slate-300 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 {data.brand}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
