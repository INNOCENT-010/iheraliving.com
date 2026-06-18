import SubscribeForm from '@/components/layout/SubscribeForm'

interface FooterProps {
  settings: Record<string, string>
}

const NAV = [
  { href: '/surfaces',   label: 'Surfaces'   },
  { href: '/lighting',   label: 'Lighting'   },
  { href: '/objects',    label: 'Objects'    },
  { href: '/collection', label: 'Collection' },
  { href: '/studio',     label: 'Studio'     },
  { href: '/journal',    label: 'Journal'    },
  { href: '/contact',    label: 'Contact'    },
]

export default function Footer({ settings }: FooterProps) {
  const instagram = settings.contact_instagram || 'https://instagram.com'
  const whatsapp  = settings.contact_whatsapp  || 'https://wa.me/234'
  const email     = settings.contact_email     || 'hello@ihera.com'
  const statement = settings.brand_statement   || 'Curated Living.'

  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-screen-xl mx-auto px-8 md:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p
              className="font-display text-2xl mb-3"
              style={{ color: 'var(--text)' }}
            >
              IHE&apos;RA
            </p>
            <p
              className="font-body text-xs leading-relaxed"
              style={{ color: 'var(--text-faint)' }}
            >
              {statement}
            </p>
          </div>

          {/* Navigate */}
          <div>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-5"
              style={{ color: 'var(--brass)' }}
            >
              Navigate
            </p>
            <div className="flex flex-col gap-3">
              {NAV.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-body text-xs transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-5"
              style={{ color: 'var(--brass)' }}
            >
              Connect
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="font-body text-xs transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
              >
                Instagram
              </a>
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="font-body text-xs transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
              >
                WhatsApp
              </a>
              <a
                href={`mailto:${email}`}
                className="font-body text-xs transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
              >
                {email}
              </a>
            </div>
          </div>

          {/* Location */}
          <div>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-5"
              style={{ color: 'var(--brass)' }}
            >
              Location
            </p>
            <p
              className="font-body text-xs leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Lagos, Nigeria
            </p>
            <p
              className="font-body text-xs mt-2"
              style={{ color: 'var(--text-faint)' }}
            >
              {email}
            </p>
          </div>

          {/* Subscribe */}
          <div>
            <p
              className="font-body text-[9px] tracking-widest uppercase mb-5"
              style={{ color: 'var(--brass)' }}
            >
              Stay Informed
            </p>
            <SubscribeForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            © {new Date().getFullYear()} IHE&apos;RA — Curated Living
          </p>
          <p
            className="font-body text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}