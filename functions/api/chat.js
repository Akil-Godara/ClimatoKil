export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
      text: userQuestion 
    });

    const matches = await env.VECTORIZE.query(queryEmbedding.data[0], { 
      topK: 3, 
      returnMetadata: true 
    });

    const contextText = matches.matches && matches.matches.length > 0
      ? matches.matches.map(m => m.metadata?.text || '').filter(Boolean).join('\n')
      : 'No relevant climate data found in archive.';

    const aiResponse = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
      messages: [
        { role: 'system', content: `You are ClimatoKil AI. Use this context:\n\n${contextText}` },
        { role: 'user', content: userQuestion }
      ]
    });

    const reply = aiResponse.response || aiResponse.result || JSON.stringify(aiResponse);

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ reply: `Error: ${error.message}` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}