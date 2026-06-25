export async function onRequest(context) {
  const { request, env } = context;
  const { messages } = await request.json();
  
  // Get the last thing the user said
  const userQuestion = messages[messages.length - 1].content;

  try {
    // 1. Turn the user's question into a vector
    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
      inputs: [userQuestion] 
    });

    // 2. Search Vectorize for the best matching climate facts
    const matches = await env.VECTORIZE_INDEX.query(queryEmbedding.data[0], { 
      topK: 3, 
      returnMetadata: true 
    });

    // 3. Combine the matched facts into a "context" string
    const contextText = matches.matches.map(m => m.metadata.text).join('\n');

    // 4. Ask the AI to answer using ONLY those facts
    const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: `You are ClimatoKil AI. Answer the user's question using ONLY this context data:\n\n${contextText}\n\nIf the answer is not in the context, say "I don't have specific data on that in my archive yet."` },
        ...messages
      ]
    });

    return new Response(JSON.stringify({ reply: aiResponse.response }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ reply: "Error processing request: " + error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}