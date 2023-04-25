import type { SupabaseClientOptions } from '@supabase/supabase-js';
import type { JwtFromRequestFunction } from 'passport-jwt';

export interface ISupabaseAuthStrategyOptions {
  supabaseUrl: string;
  supabaseKey: string;
  supabaseOptions: SupabaseClientOptions;
  extractor: JwtFromRequestFunction;
}
