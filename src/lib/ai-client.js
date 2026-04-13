/**
 * AI Client Utility
 * 
 * Provides a clean interface for calling the LLM API through the secure
 * Next.js API route proxy. This keeps the Modal API key server-side.
 * 
 * Usage:
 *   import { invokeLLM, generateImage } from '@/lib/ai-client';
 *   const result = await invokeLLM('Analyze this business...');
 *   const image = await generateImage('Professional blog header...');
 */

const LLM_API_URL = '/api/llm';
const IMAGE_API_URL = '/api/llm/image';

/**
 * Call the LLM with a text prompt
 * @param {string} prompt - The prompt to send to the LLM
 * @param {object} options - Optional settings
 * @param {string} options.model - Model to use
 * @param {number} options.temperature - Temperature (0-1)
 * @returns {Promise<string>} The LLM response text
 */
export async function invokeLLM(prompt, options = {}) {
  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      model: options.model,
      temperature: options.temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'LLM request failed' }));
    throw new Error(error.error || `LLM request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.content;
}

/**
 * Generate an image from a text prompt
 * @param {string} prompt - Description of the image to generate
 * @returns {Promise<{image_url: string, revised_prompt: string}>}
 */
export async function generateImage(prompt) {
  const response = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Image generation failed' }));
    throw new Error(error.error || `Image generation failed with status ${response.status}`);
  }

  return response.json();
}
