export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    // 1. Generate embedding
    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
      text: userQuestion 
    });

    // 2. Query Vectorize
    const matches = await env.VECTORIZE.query(queryEmbedding.data[0], { 
      topK: 3, 
      returnMetadata: true 
    });

    // 3. Build context
    const contextText = matches.matches && matches.matches.length > 0
      ? matches.matches.map(m => m.metadata?.text || '').filter(Boolean).join('\n')
      : 'No specific climate data found in the archive for this query.';

    // 4. Call Llama 3 (Much faster and more reliable than Mistral)
    const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: `You are ClimatoKil AI. Answer the user's question using ONLY this context:\n\n${contextText}\n\nKeep your answer short and factual.` },
        { role: 'user', content: userQuestion }
      ]
    });

    // 5. Get the text response
    const reply = aiResponse.response || aiResponse.result || "I couldn't generate a response.";

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // This ensures the frontend always gets a readable error
    return new Response(JSON.stringify({ reply: `Error: ${error.message || 'Unknown server error'}` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}