// functions/api/chat.js

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. Get the array of messages from the frontend
    const { messages } = await request.json();

    // 2. Send the conversation history to Mistral AI
    const response = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
      messages: messages, 
      max_tokens: 1024,
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