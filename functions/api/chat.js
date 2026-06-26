export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: userQuestion });
    const queryVector = queryEmbedding.data[0];

    const matches = await env.VECTORIZE.query(queryVector, { topK: 3, returnMetadata: true });
    const contextText = matches.matches.map(m => m.metadata.text).join('\n');

    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are ClimatoKil AI. Answer using ONLY this context:\n' + contextText },
        { role: 'user', content: userQuestion }
      ]
    });

    const reply = aiResponse.response || 'I could not find an answer.';

    return new Response(JSON.stringify({ reply: reply }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ reply: 'Error: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}