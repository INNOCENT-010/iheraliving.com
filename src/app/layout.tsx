import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       "IHE'RA — Curated Living",
  description: "IHE'RA is a design-led living brand focused on architectural surfaces, lighting, and curated objects that bring depth, warmth, and intention to every space.",
  keywords:    ['interior design', 'architectural surfaces', 'luxury living', 'Nigeria', 'Lagos'],
  icons: {
    icon:  '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title:       "IHE'RA — Curated Living",
    description: 'Architectural surfaces, lighting, and curated objects.',
    type:        'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ihera-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="grain">{children}</body>
    </html>
  )
}