import Link from 'next/link'

const services = [
  { number: '01', title: 'Interior Styling',      description: 'Cohesive styling across furniture, objects, surfaces, and light. We work from a defined concept — not a mood board.' },
  { number: '02', title: 'Material Selection',    description: 'Surface and material curation for residential and commercial projects. We specify with precision — no generic choices.' },
  { number: '03', title: 'Lighting Consultation', description: 'Layered lighting design that considers the architecture, the activities, and the emotional register of every room.' },
  { number: '04', title: 'Design Advisory',       description: 'Strategic design guidance for clients making major decisions. Our knowledge is a product. We charge accordingly.' },
]

export default function StudioPage() {
  return (
    <div className="min-h-screen pt-32 pb-24" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-screen-xl mx-auto px-8 md:px-16 border-t" style={{ borderColor: 'var(--border)' }}>
        {services.map((service, i) => (
          <div
            key={service.number}
            className="p-10 md:p-16"
            style={{
              borderBottom: '1px solid var(--border)',
              borderRight: i % 2 === 0 ? '1px solid var(--border)' : undefined,
            }}
          >
            <span className="font-mono text-xs block mb-6" style={{ color: 'var(--text-faint)' }}>{service.number}</span>
            <h3 className="font-display text-2xl mb-4" style={{ color: 'var(--text)' }}>{service.title}</h3>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{service.description}</p>
          </div>
        ))}
      </div>
      <div className="px-10 md:px-20 py-20 max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <p className="font-display text-3xl md:text-4xl italic max-w-sm leading-snug" style={{ color: 'var(--text-muted)' }}>
          Every great space begins with a conversation.
        </p>
        <Link href="/contact" className="font-body text-[10px] tracking-widest uppercase px-10 py-4" style={{ backgroundColor: 'var(--brass)', color: 'var(--bg)' }}>
          Begin a Conversation
        </Link>
      </div>
    </div>
  )
}