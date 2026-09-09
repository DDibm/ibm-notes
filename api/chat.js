/**
 * Vercel serverless function — /api/chat
 *
 * Proxies requests to watsonx.ai text generation API.
 * Keeps IBM Cloud credentials server-side only.
 *
 * Required environment variables (set in Vercel project settings):
 *   WATSONX_API_KEY      — IBM Cloud API key
 *   WATSONX_PROJECT_ID   — watsonx.ai project ID
 *   WATSONX_REGION       — e.g. "us-south" (default) or "eu-de", "jp-tok"
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IAM token fetch failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  const apiKey = process.env.WATSONX_API_KEY;
  const projectId = process.env.WATSONX_PROJECT_ID;
  const region = process.env.WATSONX_REGION || 'us-south';

  if (!apiKey || !projectId) {
    return res.status(500).json({
      error:
        'Server is not configured. Set WATSONX_API_KEY and WATSONX_PROJECT_ID in Vercel environment variables.',
    });
  }

  try {
    // Exchange API key for a short-lived IAM bearer token
    const iamToken = await getIAMToken(apiKey);

    const watsonxUrl = `https://${region}.ml.cloud.ibm.com/ml/v1/text/chat?version=2024-05-31`;

    // Build the messages array — prepend the system prompt if provided
    const allMessages = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const payload = {
      model_id: 'ibm/granite-3-3-8b-instruct',
      messages: allMessages,
      project_id: projectId,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
      },
    };

    const watsonRes = await fetch(watsonxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!watsonRes.ok) {
      const errText = await watsonRes.text();
      console.error('watsonx.ai error:', errText);
      return res.status(watsonRes.status).json({
        error: `watsonx.ai returned ${watsonRes.status}`,
        detail: errText,
      });
    }

    const data = await watsonRes.json();

    // Extract the assistant reply from the response
    const reply =
      data?.choices?.[0]?.message?.content ||
      data?.results?.[0]?.generated_text ||
      'No response received.';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
