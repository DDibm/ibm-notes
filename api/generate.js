/**
 * Vercel serverless function — /api/generate
 *
 * Generates flashcards or a presentation outline from a project's notes
 * using IBM watsonx.ai (Granite 3.3).
 *
 * Body:
 *   type        — "flashcards" | "presentation"
 *   projectContent — string (the project's output + rawNotes)
 *   projectTitle   — string
 */

const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';

async function getIAMToken(apiKey) {
  const res = await fetch(IAM_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
  });
  if (!res.ok) throw new Error(`IAM token fetch failed (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

function buildFlashcardsPrompt(title, content) {
  return `You are an expert educator creating study flashcards from notes.

Given the following notes titled "${title}", generate exactly 12 flashcards.

Return ONLY a valid JSON array with this exact shape — no markdown, no explanation, just the JSON:
[
  { "front": "Question or term", "back": "Answer or definition" },
  ...
]

Rules:
- front: a clear, concise question or key term (max 15 words)
- back: a clear, accurate answer or explanation (max 60 words)
- Cover the most important concepts, definitions, processes, and facts
- Vary the types: definitions, how-it-works, comparisons, fill-in-the-blank style

NOTES:
${content.slice(0, 6000)}`;
}

function buildPresentationPrompt(title, content) {
  return `You are an expert educator creating a learning presentation from notes.

Given the following notes titled "${title}", generate a 8-slide presentation.

Return ONLY a valid JSON array with this exact shape — no markdown, no explanation, just the JSON:
[
  {
    "slideNumber": 1,
    "title": "Slide title",
    "type": "title" | "concept" | "list" | "comparison" | "summary",
    "content": "Main body text or explanation (2-4 sentences)",
    "bullets": ["bullet 1", "bullet 2", "bullet 3"],
    "speakerNote": "What to say when presenting this slide (1-2 sentences)"
  },
  ...
]

Slide structure:
- Slide 1: Title slide (type: "title") — overview of the topic
- Slides 2-7: Core concepts (type: "concept", "list", or "comparison")
- Slide 8: Summary / key takeaways (type: "summary")

Rules:
- title: max 8 words
- content: 2-4 sentences, plain explanation
- bullets: 3-5 bullet points (short, scannable)
- speakerNote: conversational, 1-2 sentences
- For "comparison" slides, bullets should be pairs like "A vs B"

NOTES:
${content.slice(0, 6000)}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, projectContent, projectTitle } = req.body;

  if (!type || !projectContent) {
    return res.status(400).json({ error: 'type and projectContent are required' });
  }

  const apiKey = process.env.WATSONX_API_KEY;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const region = process.env.WATSONX_REGION || 'us-south';

  if (!apiKey || !projectId) {
    return res.status(500).json({
      error: 'Server not configured. Set WATSONX_API_KEY and WATSONX_PROJECT_ID.',
    });
  }

  const prompt =
    type === 'flashcards'
      ? buildFlashcardsPrompt(projectTitle, projectContent)
      : buildPresentationPrompt(projectTitle, projectContent);

  try {
    const iamToken = await getIAMToken(apiKey);
    const url = `https://${region}.ml.cloud.ibm.com/ml/v1/text/chat?version=2024-05-31`;

    const payload = {
      model_id: 'ibm/granite-3-3-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      project_id: projectId,
      parameters: {
        max_new_tokens: 2048,
        temperature: 0.3, // lower = more structured/predictable JSON
        top_p: 0.9,
      },
    };

    const watsonRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!watsonRes.ok) {
      const errText = await watsonRes.text();
      return res.status(watsonRes.status).json({ error: `watsonx.ai error: ${errText}` });
    }

    const data = await watsonRes.json();
    const raw = data?.choices?.[0]?.message?.content || data?.results?.[0]?.generated_text || '';

    // Extract JSON array from the response (model may wrap it in markdown)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Model did not return valid JSON. Try again.' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ type, data: parsed });
  } catch (err) {
    console.error('Generate handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
