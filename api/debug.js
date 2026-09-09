/**
 * Debug endpoint — shows the format of stored env vars (masked).
 * Remove this file after confirming credentials are correct.
 */
export default function handler(req, res) {
  const projectId = process.env.WATSONX_PROJECT_ID || '';
  const apiKey = process.env.WATSONX_API_KEY || '';
  const region = process.env.WATSONX_REGION || 'us-south';

  // UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidPattern.test(projectId);

  return res.status(200).json({
    projectId_length: projectId.length,
    projectId_preview: projectId.slice(0, 8) + '...' + projectId.slice(-4),
    projectId_isValidUUID: isValidUUID,
    projectId_raw_chars: [...projectId].map(c => c === '-' ? '-' : 'x').join(''),
    apiKey_set: apiKey.length > 0,
    apiKey_length: apiKey.length,
    region,
  });
}
