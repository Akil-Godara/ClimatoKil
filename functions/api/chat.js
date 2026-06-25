// functions/api/chat.js

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { prompt } = await request.json();

    // Mistral 7B - Very smart and works perfectly on Cloudflare
    const response = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
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