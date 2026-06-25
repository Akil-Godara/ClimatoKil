// functions/api/chat.js

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { prompt } = await request.json();

    // This is the latest and best Gemma model on Cloudflare (27 Billion Parameters)
    const response = await env.AI.run('@cf/google/gemma-3-27b-it', {
      prompt: prompt,
      max_tokens: 2000, // Long, detailed answers
    });

    return new Response(JSON.stringify({ 
      success: true, 
      reply: response.response 
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}