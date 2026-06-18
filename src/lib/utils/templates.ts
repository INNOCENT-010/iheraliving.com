import type { ProductTemplate, SectionType } from '@/types'

export interface TemplateSectionDef {
  section_type: SectionType
  header:       string
  description:  string
  max_items:    number
  has_image:    boolean
  has_title:    boolean
  has_subtitle: boolean
  has_body:     boolean
}

export interface TemplateDef {
  id:          ProductTemplate
  label:       string
  description: string
  sections:    TemplateSectionDef[]
}

export const TEMPLATES: TemplateDef[] = [
  {
    id:          'textile',
    label:       'Textile / Soft Furnishing',
    description: 'Curtains, drapes, upholstery, soft architectural elements',
    sections: [
      {
        section_type: 'detail',
        header:       'The Detail',
        description:  'One close-up image + craft description paragraph',
        max_items:    1,
        has_image:    true,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'highlights',
        header:       'Feature Highlights',
        description:  'Up to 4 detail images with title and caption',
        max_items:    4,
        has_image:    true,
        has_title:    true,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'colourways',
        header:       'Colourways',
        description:  'Up to 6 swatches with name and mood words',
        max_items:    6,
        has_image:    true,
        has_title:    true,
        has_subtitle: true,
        has_body:     false,
      },
      {
        section_type: 'materials',
        header:       'Material & Embroidery',
        description:  'Up to 4 material close-ups with name and description',
        max_items:    4,
        has_image:    true,
        has_title:    true,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'specifications',
        header:       'Specifications',
        description:  'List of functional attributes — one per line',
        max_items:    12,
        has_image:    false,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
    ],
  },
  {
    id:          'surface',
    label:       'Surface / Architectural',
    description: 'Stone panels, microcement, decorative finishes, feature walls',
    sections: [
      {
        section_type: 'detail',
        header:       'The Material',
        description:  'Texture close-up + material story paragraph',
        max_items:    1,
        has_image:    true,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'applications',
        header:       'Applications',
        description:  'Up to 4 installed space shots with caption',
        max_items:    4,
        has_image:    true,
        has_title:    true,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'finishes',
        header:       'Available Finishes',
        description:  'Up to 6 finish swatches with name and description',
        max_items:    6,
        has_image:    true,
        has_title:    true,
        has_subtitle: true,
        has_body:     false,
      },
      {
        section_type: 'specifications',
        header:       'Dimensions & Specifications',
        description:  'Technical details — one per line',
        max_items:    12,
        has_image:    false,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
    ],
  },
  {
    id:          'lighting',
    label:       'Lighting',
    description: 'Fixtures, pendants, table lamps, architectural lighting',
    sections: [
      {
        section_type: 'detail',
        header:       'The Light',
        description:  'Atmospheric shot + lighting philosophy paragraph',
        max_items:    1,
        has_image:    true,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'highlights',
        header:       'Details',
        description:  'Up to 4 detail shots with title and caption',
        max_items:    4,
        has_image:    true,
        has_title:    true,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'variants',
        header:       'Variants',
        description:  'Up to 6 variants with image, name and description',
        max_items:    6,
        has_image:    true,
        has_title:    true,
        has_subtitle: true,
        has_body:     true,
      },
      {
        section_type: 'specifications',
        header:       'Specifications',
        description:  'Technical specs — one per line',
        max_items:    12,
        has_image:    false,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
    ],
  },
  {
    id:          'object',
    label:       'Object / Decorative',
    description: 'Vessels, candles, sculptural pieces, decorative objects',
    sections: [
      {
        section_type: 'detail',
        header:       'The Piece',
        description:  'Detail shot + object story paragraph',
        max_items:    1,
        has_image:    true,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'perspectives',
        header:       'Perspectives',
        description:  'Up to 4 angles with view name and caption',
        max_items:    4,
        has_image:    true,
        has_title:    true,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'material_story',
        header:       'Material Story',
        description:  'Free text lines about the material',
        max_items:    8,
        has_image:    false,
        has_title:    true,
        has_subtitle: false,
        has_body:     true,
      },
      {
        section_type: 'specifications',
        header:       'Specifications',
        description:  'Dimensions and details — one per line',
        max_items:    12,
        has_image:    false,
        has_title:    false,
        has_subtitle: false,
        has_body:     true,
      },
    ],
  },
]

export function getTemplate(id: ProductTemplate): TemplateDef | undefined {
  return TEMPLATES.find(t => t.id === id)
}