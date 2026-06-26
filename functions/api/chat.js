cat > functions/api/chat.js << 'EOF'
export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: userQuestion });
    const queryVector = queryEmbedding.data[0];

    const matches = await env.VECTORIZE.query(queryVector, { topK: 3, returnMetadata: true });
    const contextText = matches.matches.map(m => m.metadata.text).join('\n');

    // Using Qwen model (Highly stable on Cloudflare)
    const aiResponse = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
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
EOF