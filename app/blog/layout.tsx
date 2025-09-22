import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Summit Books & Tax",
  description: "Latest articles and insights from Summit Books & Tax",
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blog-layout">
      {children}
    </div>
  )
}
