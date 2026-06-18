// Auto-generated types from Supabase CLI
// Run: npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
// For now, we use manual types from @/types/index.ts

export type Database = {
  public: {
    Tables: {
      products:        { Row: Record<string, unknown> }
      journal_entries: { Row: Record<string, unknown> }
      product_journals:{ Row: Record<string, unknown> }
      page_views:      { Row: Record<string, unknown> }
      enquiries:       { Row: Record<string, unknown> }
      site_settings:   { Row: Record<string, unknown> }
    }
  }
}
