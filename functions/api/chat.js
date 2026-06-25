// functions/api/chat.js

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { prompt } = await request.json();

    // Try Gemma 7B - Best balance of smart & fast
    const response = await env.AI.run('@cf/google/gemma-7b-it', {
      prompt: prompt,
      max_tokens: 2000,
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