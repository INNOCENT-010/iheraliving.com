-- ============================================================
-- IHE'RA — Seed Data
-- ============================================================

-- Sample products
insert into products (name, slug, tagline, description, category, status, price_on_request, cover_image, materials, featured, sort_order) values
(
  'Volcanic Stone Panel',
  'volcanic-stone-panel',
  'Raw earth, refined.',
  'A dramatic architectural panel sourced from volcanic basalt. Each piece carries the memory of geological formation — unique veining, weight, and texture that cannot be replicated. Designed for feature walls, reception lobbies, and spaces where first impressions are permanent.',
  'surfaces',
  'active',
  true,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  ARRAY['Volcanic Basalt', 'Natural Stone', 'Honed Finish'],
  true,
  1
),
(
  'Travertine Feature Wall System',
  'travertine-feature-wall',
  'Ancient material. Contemporary application.',
  'Classic travertine reimagined as a modular wall system. The characteristic voids and cross-cut patterns create a surface that changes with light — golden at dawn, deep amber at dusk. Available in Roman Classic, Silver, and Walnut varieties.',
  'surfaces',
  'active',
  true,
  'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800',
  ARRAY['Travertine', 'Natural Stone', 'Cross-Cut'],
  true,
  2
),
(
  'Brushed Brass Decorative Panel',
  'brushed-brass-panel',
  'Metal as architecture.',
  'Precision-engineered brass panels with a brushed satin finish. The warm gold tones create an extraordinary interplay of light, transforming walls into living surfaces that evolve through the day.',
  'surfaces',
  'active',
  true,
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
  ARRAY['Brushed Brass', 'Metal', 'Satin Finish'],
  false,
  3
),
(
  'Bespoke Feature Wall',
  'bespoke-feature-wall',
  'Your vision. Our craft.',
  'A fully bespoke service for clients who demand absolute singularity. From material selection and pattern development to installation, our team creates feature walls that are entirely original to your space.',
  'surfaces',
  'active',
  true,
  'https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?w=800',
  ARRAY['Various', 'Client-Specified'],
  true,
  4
),
(
  'Microcement Finish',
  'microcement-finish',
  'Seamless. Timeless. Coming soon.',
  'Ultra-thin microcement application for walls and floors. Creates a continuous, joint-free surface with extraordinary depth and character. Available in 40+ curated colorways.',
  'surfaces',
  'coming_soon',
  true,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  ARRAY['Microcement', 'Polymer-Modified'],
  false,
  5
);

-- Sample journal entries
insert into journal_entries (title, slug, excerpt, content, status, published_at, read_time, tags, sort_order) values
(
  'Why Architectural Surfaces Matter',
  'why-architectural-surfaces-matter',
  'The walls of a space are not neutral. They are the first thing felt, the last thing remembered. A surface is never just a surface.',
  '<h2>The First Impression Is Permanent</h2><p>Before furniture is chosen, before lighting is hung, before a single object is placed — the walls speak. Architectural surfaces set the emotional register of every room they occupy. They are the canvas that everything else responds to.</p><p>At IHE''RA, we believe surface selection is the single most consequential design decision in any interior. Yet it is often treated as an afterthought.</p><h2>Texture Changes How We Feel</h2><p>There is growing evidence that tactile richness in our environments directly affects our psychological state. Smooth surfaces read as controlled and minimal. Rough, varied textures create warmth, depth, and the sense of being held by a space.</p><p>The difference between a painted wall and a travertine feature wall is not merely aesthetic — it is experiential. One is seen. The other is felt.</p>',
  'published',
  now() - interval '7 days',
  6,
  ARRAY['surfaces', 'design-philosophy', 'materials'],
  1
),
(
  'The Art of Layered Lighting',
  'art-of-layered-lighting',
  'Light is not decoration. It is the medium through which all other design decisions become visible — or disappear.',
  '<h2>Light Is Architecture</h2><p>The most expensive furniture in an poorly lit room will feel cheap. The simplest space, lit with intention, becomes memorable. Lighting is not an accessory to interior design — it is its essential language.</p><p>Layered lighting combines ambient, task, and accent sources to create depth, drama, and flexibility. A room that cannot adapt its lighting cannot adapt its mood.</p>',
  'published',
  now() - interval '3 days',
  5,
  ARRAY['lighting', 'design-philosophy'],
  2
),
(
  'Material Study No. 01: Travertine',
  'material-study-travertine',
  'Formed over millions of years in thermal springs, travertine carries geological time within every vein. We examine why this ancient stone remains the most compelling surface in contemporary luxury interiors.',
  '<h2>Geology as Design</h2><p>Travertine is formed by the rapid precipitation of calcium carbonate, typically in hot springs and limestone caves. The characteristic holes and voids in the stone are created by carbon dioxide bubbles trapped during formation — nature''s own texture design.</p><p>What makes travertine enduringly relevant is precisely this authenticity. In an era of synthetic surfaces and perfect replications, the irregularity of travertine reads as rare.</p>',
  'published',
  now() - interval '1 day',
  7,
  ARRAY['materials', 'travertine', 'surfaces'],
  3
),
(
  'Creating Warm Modern Interiors',
  'creating-warm-modern-interiors',
  'The modern interior has a coldness problem. We explore how considered material and surface choices restore warmth without sacrificing precision.',
  '<h2>The Warmth Equation</h2><p>Contemporary design''s obsession with minimalism has produced spaces of extraordinary clarity — and frequent emotional vacancy. Clean lines and restrained palettes are necessary but not sufficient conditions for a space that people want to inhabit.</p><p>Warmth in an interior comes from material richness: the variation of natural stone, the warmth of brass against charcoal, the depth of textured surfaces that absorb and reflect light in unpredictable ways.</p>',
  'draft',
  null,
  8,
  ARRAY['interiors', 'design-philosophy', 'warmth'],
  4
);

-- Link journals to products
insert into product_journals (product_id, journal_id)
select p.id, j.id
from products p, journal_entries j
where p.slug = 'travertine-feature-wall'
  and j.slug = 'material-study-travertine';

insert into product_journals (product_id, journal_id)
select p.id, j.id
from products p, journal_entries j
where p.slug = 'volcanic-stone-panel'
  and j.slug = 'why-architectural-surfaces-matter';
