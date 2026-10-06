import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseServerConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

export function getSupabaseServerClient() {
  if (!isSupabaseServerConfigured) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Perform cosine vector similarity search using pgvector in Supabase
 * matching knowledge chunks.
 */
export async function matchKnowledgeChunks(queryEmbedding: number[], matchThreshold = 0.5, matchCount = 5) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });

    if (error) {
      console.warn('[Supabase Vector Search] RPC error:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('[Supabase Vector Search] Query failed:', err);
    return [];
  }
}
