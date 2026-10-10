import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';
import { askGemma } from '../services/gemmaService.js';

const router = Router();

// POST /api/ai/ask - Ask Your Roots Gemma AI Assistant
router.post('/ask', optionalAuth, async (req: AuthRequest, res) => {
  const { question, culture } = req.body;

  // 1. Validation
  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Please provide a valid cultural question to explore.' });
  }

  const validCultures = ['yoruba', 'igbo', 'hausa', 'all'];
  if (culture && !validCultures.includes(culture.toLowerCase())) {
    // If culture is not recognised, check if it matches a culture ID or return error
    const cultureExists = db.prepare('SELECT id FROM cultures WHERE slug = ? OR id = ?').get(culture, culture);
    if (!cultureExists) {
      return res.status(400).json({
        error: `Unsupported culture: "${culture}". Supported learning traditions are Yoruba, Igbo, and Hausa.`,
      });
    }
  }

  const cleanQuestion = question.trim();

  // 2. Retrieve relevant published cultural resources from database for grounding
  const queryTerms = cleanQuestion
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w: string) => w.length > 2);

  let searchCondition = '';
  const searchParams: any[] = [];

  if (queryTerms.length > 0) {
    const likeClauses = queryTerms
      .map(() => `(LOWER(cr.title) LIKE ? OR LOWER(cr.summary) LIKE ? OR LOWER(cr.content) LIKE ?)`)
      .join(' OR ');
    searchCondition = ` AND (${likeClauses})`;
    for (const term of queryTerms) {
      const p = `%${term}%`;
      searchParams.push(p, p, p);
    }
  }

  let sql = `
    SELECT cr.id, cr.title, cr.slug, cr.summary, cr.content, cr.content_type,
           c.name as culture_name, c.slug as culture_slug,
           cat.name as category_name
    FROM cultural_resources cr
    JOIN cultures c ON cr.culture_id = c.id
    JOIN categories cat ON cr.category_id = cat.id
    WHERE cr.status = 'published'
  `;

  if (culture && culture.toLowerCase() !== 'all') {
    sql += ` AND (c.slug = ? OR c.id = ?)`;
    searchParams.unshift(culture.toLowerCase(), culture.toLowerCase());
  }

  sql += searchCondition;
  sql += ` LIMIT 5`;

  let matchedResources: any[] = [];
  try {
    matchedResources = db.prepare(sql).all(...searchParams);
  } catch (err) {
    console.error('[AI] Grounding retrieval error:', err);
  }

  // If specific keyword search yielded no matches, fetch general resources from the culture
  if (matchedResources.length === 0) {
    let fallbackSql = `
      SELECT cr.id, cr.title, cr.slug, cr.summary, cr.content, cr.content_type,
             c.name as culture_name, c.slug as culture_slug,
             cat.name as category_name
      FROM cultural_resources cr
      JOIN cultures c ON cr.culture_id = c.id
      JOIN categories cat ON cr.category_id = cat.id
      WHERE cr.status = 'published'
    `;
    const fallbackParams: any[] = [];
    if (culture && culture.toLowerCase() !== 'all') {
      fallbackSql += ` AND (c.slug = ? OR c.id = ?)`;
      fallbackParams.push(culture.toLowerCase(), culture.toLowerCase());
    }
    fallbackSql += ` LIMIT 3`;
    try {
      matchedResources = db.prepare(fallbackSql).all(...fallbackParams);
    } catch (err) {
      console.error('[AI] Fallback retrieval error:', err);
    }
  }

  // Format cultural context for Gemma
  const culturalContext = matchedResources.length > 0
    ? matchedResources
        .map(
          (r, idx) =>
            `[Resource ${idx + 1}] Title: "${r.title}" (Culture: ${r.culture_name}, Category: ${r.category_name}, Format: ${r.content_type})
Summary: ${r.summary}
Archival Details: ${r.content.substring(0, 800)}`
        )
        .join('\n\n')
    : 'No directly matching published resources found in the CultureVerse database for this query.';

  // Format standard sources list
  const sources = matchedResources.map(r => ({
    title: r.title,
    resourceId: r.id,
    id: r.id,
    slug: r.slug,
    culture_name: r.culture_name,
    category_name: r.category_name,
    summary: r.summary,
  }));

  // 3. Check API key presence
  const apiKey = process.env.GEMINI_API_KEY || process.env.CultureVerse_API_Key || process.env.GEMMA_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      status: 'missing_credentials',
      answer: matchedResources.length > 0
        ? `*Server Note: GEMINI_API_KEY is not configured. Direct database library excerpts:*\n\n` +
          matchedResources.map(r => `**${r.title}** (${r.culture_name}): ${r.summary}`).join('\n\n')
        : 'Cultural database documentation unavailable.',
      sources,
    });
  }

  // 4. Pass to askGemma
  try {
    const answer = await askGemma(cleanQuestion, culturalContext);

    return res.json({
      status: 'success',
      model: process.env.GEMMA_MODEL ?? 'gemma-4-26b-a4b-it',
      answer,
      sources,
    });
  } catch (aiErr: any) {
    console.error('[AI] Gemma execution error:', aiErr?.message || aiErr);
    
    // Transparently handle AI provider errors without fabricating fake AI answers
    const errorMessage = aiErr?.message || 'Error communicating with Gemma AI service.';
    return res.status(502).json({
      status: 'provider_error',
      error: `AI provider error: ${errorMessage}`,
      model: process.env.GEMMA_MODEL ?? 'gemma-4-26b-a4b-it',
      answer: matchedResources.length > 0
        ? `Gemma AI service encountered a temporary provider issue. However, here is verified documentation retrieved directly from the CultureVerse archive for your question:\n\n` +
          matchedResources.map(r => `**${r.title}** (${r.culture_name}): ${r.summary}`).join('\n\n')
        : 'The AI provider is temporarily unavailable and no matching archive records were found for this query.',
      sources,
    });
  }
});

export default router;
