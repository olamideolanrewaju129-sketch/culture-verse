import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Ask Your Roots endpoint
router.post('/ask', optionalAuth, async (req: AuthRequest, res) => {
  const { question, culture } = req.body;

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Please provide a cultural question to explore.' });
  }

  const queryTerms = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w: string) => w.length > 2);

  // 1. Retrieve relevant cultural library resources for grounding
  let searchCondition = '';
  const searchParams: any[] = [];

  if (queryTerms.length > 0) {
    const likeClauses = queryTerms.map(() => `(LOWER(cr.title) LIKE ? OR LOWER(cr.summary) LIKE ? OR LOWER(cr.content) LIKE ?)`).join(' OR ');
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

  if (culture && culture !== 'all') {
    sql += ` AND (c.slug = ? OR c.id = ?)`;
    searchParams.unshift(culture, culture);
  }

  sql += searchCondition;
  sql += ` LIMIT 4`;

  let matchedResources: any[] = [];
  try {
    matchedResources = db.prepare(sql).all(...searchParams);
  } catch (err) {
    console.error('AI search grounding error:', err);
  }

  // If specific search had zero matches, get top 3 related culture resources
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
    if (culture && culture !== 'all') {
      fallbackSql += ` AND (c.slug = ? OR c.id = ?)`;
      fallbackParams.push(culture, culture);
    }
    fallbackSql += ` LIMIT 3`;
    matchedResources = db.prepare(fallbackSql).all(...fallbackParams);
  }

  // Check for configured Gemma or Gemini API credentials
  const gemmaApiKey = process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY;
  const gemmaEndpoint = process.env.GEMMA_ENDPOINT;

  const libraryContext = matchedResources
    .map(
      r => `Source: "${r.title}" (${r.culture_name} - ${r.category_name})\nSummary: ${r.summary}\nKey Content Excerpt: ${r.content.substring(0, 500)}...`
    )
    .join('\n\n');

  // If live Gemma endpoint or Gemini API is configured:
  if (gemmaApiKey || gemmaEndpoint) {
    try {
      const endpoint = gemmaEndpoint || `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemmaApiKey}`;
      
      const systemInstruction = `You are "Ask Your Roots", an AI African cultural learning and preservation assistant on CultureVerse.
Provide respectful, accurate, educational answers grounded in African cultural traditions (Yoruba, Igbo, Hausa).
Adhere strictly to these principles:
- Ground your answer in the provided Cultural Library sources where relevant.
- Clearly distinguish between oral traditions, documented historical records, linguistic conventions, and religious beliefs.
- Never invent historical facts, fake citations, or fake quotations from elders.
- If the knowledge is incomplete or regionally variable, honestly acknowledge that practices vary across communities.`;

      const promptText = `${systemInstruction}\n\nCultural Library Context:\n${libraryContext}\n\nUser Question: ${question}\n\nPlease provide an educational, respectful, well-structured answer:`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedAnswer =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Thank you for your question. Here is the relevant cultural information preserved in our library.';

        return res.json({
          status: 'success',
          provider: 'gemma_inference_live',
          answer: generatedAnswer,
          sources: matchedResources.map(r => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            culture_name: r.culture_name,
            category_name: r.category_name,
            summary: r.summary,
          })),
        });
      }
    } catch (apiErr: any) {
      console.warn('[AI] External inference call failed, switching to grounded library provider:', apiErr?.message);
    }
  }

  // Graceful grounded library assistant mode (Transparently truthful about model connection):
  // Generate a faithful, grounded response based directly on the authentic cultural resources in the database
  let groundedAnswer = '';
  if (matchedResources.length > 0) {
    groundedAnswer = `Based on the curated records in the CultureVerse Cultural Library:\n\n`;
    for (const resItem of matchedResources) {
      groundedAnswer += `**${resItem.title}** (${resItem.culture_name})\n${resItem.summary}\n\n`;
    }
    groundedAnswer += `*Note on Regional Variation:* Practices and oral accounts often vary across individual families, towns, and historical eras. Explore the linked sources below for detailed historical and anthropological context.`;
  } else {
    groundedAnswer = `The CultureVerse library currently has limited verified documentation matching your query: "${question}".\n\nBecause CultureVerse preserves authentic heritage and does not fabricate historical claims, we encourage you or a knowledgeable community elder to submit an oral history or suggest this topic in our Knowledge Gaps registry!`;
  }

  return res.json({
    status: 'grounded_library_mode',
    provider: gemmaApiKey ? 'gemma_fallback' : 'unconfigured_gemma_model',
    model_status_note: !gemmaApiKey
      ? 'Live Gemma inference API key (GEMMA_API_KEY) is not currently configured in the environment. Responses are grounded directly on authentic CultureVerse database library archives.'
      : 'Gemma endpoint connection error; serving verified library documentation directly.',
    answer: groundedAnswer,
    sources: matchedResources.map(r => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      culture_name: r.culture_name,
      category_name: r.category_name,
      summary: r.summary,
    })),
  });
});

export default router;
