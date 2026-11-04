import type { APIRoute } from 'astro';
import { llmsFullTxt } from '../lib/llms';

// Version complète de llms.txt, carte entière comprise : voir src/lib/llms.ts.
export const GET: APIRoute = ({ site }) =>
  new Response(llmsFullTxt(site!), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
