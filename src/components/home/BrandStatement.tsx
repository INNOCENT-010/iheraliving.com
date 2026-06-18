export default function BrandStatement() {
  return (
    <section className="py-28 px-8 md:px-16 max-w-screen-xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="brass-line mb-8 block" />
          <h2 className="font-display text-4xl md:text-5xl text-cream leading-tight">
            Design is not decoration.
            <br />
            <em className="text-brass">It is intention.</em>
          </h2>
        </div>
        <div>
          <p className="font-body text-sm text-cream/50 leading-loose max-w-md">
            IHE&apos;RA is a design-led living brand focused on architectural surfaces,
            lighting, and curated objects that bring depth, warmth, and intention
            to every space. We work with clients who understand that the quality
            of their environment is the quality of their daily life.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div>
              <p className="font-display text-3xl text-brass">150+</p>
              <p className="font-body text-xs tracking-widest uppercase text-cream/40 mt-1">Projects</p>
            </div>
            <div className="w-px h-12 bg-brass/20" />
            <div>
              <p className="font-display text-3xl text-brass">12+</p>
              <p className="font-body text-xs tracking-widest uppercase text-cream/40 mt-1">Years</p>
            </div>
            <div className="w-px h-12 bg-brass/20" />
            <div>
              <p className="font-display text-3xl text-brass">4</p>
              <p className="font-body text-xs tracking-widest uppercase text-cream/40 mt-1">Collections</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
