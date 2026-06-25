// functions/api/chat.js

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Get the user's message from the frontend
    const { prompt } = await request.json();

    // 2. Send the message to Google's Gemma AI model with more tokens
    const response = await env.AI.run('@cf/google/gemma-2b-it', {
      prompt: prompt,
      max_tokens: 2000, // Increased for longer, detailed responses
    });

    // 3. Send the AI's response back to the frontend
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