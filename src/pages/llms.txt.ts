import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/llms';

// Résumé du site pour les modèles de langage : voir src/lib/llms.ts.
export const GET: APIRoute = ({ site }) =>
  new Response(llmsTxt(site!), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
