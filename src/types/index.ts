export type ProductCategory = 'surfaces' | 'lighting' | 'objects' | 'textiles' | 'bespoke'
export type ProductStatus   = 'active' | 'coming_soon' | 'archived'
export type JournalStatus   = 'draft' | 'published'
export type EnquiryStatus   = 'new' | 'read' | 'replied' | 'archived'
export type ProductTemplate = 'textile' | 'surface' | 'lighting' | 'object'


export type SectionType =
  | 'detail'
  | 'highlights'
  | 'colourways'
  | 'materials'
  | 'specifications'
  | 'applications'
  | 'finishes'
  | 'dimensions'
  | 'variants'
  | 'perspectives'
  | 'material_story'

  
export interface SectionItem {
  id:         string
  section_id: string
  image_url:  string | null
  title:      string | null
  subtitle:   string | null
  body:       string | null
  sort_order: number
  created_at: string
}

export interface ProductSection {
  id:           string
  product_id:   string
  section_type: SectionType
  header:       string
  sort_order:   number
  created_at:   string
  items?:       SectionItem[]
}

export interface Product {
  id:                string
  name:              string
  slug:              string
  tagline:           string | null
  subtitle:          string | null
  description:       string | null
  brand_statement:   string | null
  footer_statement:  string | null
  collection_label:  string | null
  category:          ProductCategory
  template:          ProductTemplate
  status:            ProductStatus
  price:             number | null
  price_on_request:  boolean
  cover_image:       string | null
  images:            string[]
  materials:         string[]
  dimensions:        Record<string, string> | null
  sort_order:        number
  featured:          boolean
  created_at:        string
  updated_at:        string
  sections?:         ProductSection[]
  journals?:         JournalEntry[]
}

export interface JournalEntry {
  id:           string
  title:        string
  slug:         string
  excerpt:      string | null
  content:      string | null
  cover_image:  string | null
  status:       JournalStatus
  published_at: string | null
  read_time:    number
  tags:         string[]
  sort_order:   number
  created_at:   string
  updated_at:   string
  products?:    Product[]
}

export interface ProductJournal {
  id:         string
  product_id: string
  journal_id: string
  created_at: string
}



export interface PageView {
  id:         string
  path:       string
  referrer:   string | null
  user_agent: string | null
  viewed_at:  string
}

export interface SiteSetting {
  key:        string
  value:      unknown
  updated_at: string
}
export interface Enquiry {
  id:            string
  name:          string
  email:         string
  phone:         string | null
  message:       string
  product_id:    string | null
  status:        'new' | 'read' | 'replied' | 'archived'
  email_sent:    boolean
  reply_message: string | null
  replied_at:    string | null
  created_at:    string
}