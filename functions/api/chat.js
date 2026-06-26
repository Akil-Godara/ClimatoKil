cat > functions/api/chat.js << 'EOF'
export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    console.log('User question:', userQuestion);
    console.log('AI binding:', !!env.AI);
    console.log('Vectorize binding:', !!env.VECTORIZE);

    // 1. Generate embedding (Using 'text' property)
    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
      text: userQuestion 
    });

    console.log('Embedding generated:', queryEmbedding.data?.[0]?.length, 'dimensions');

    // 2. Query Vectorize
    const matches = await env.VECTORIZE.query(queryEmbedding.data[0], { 
      topK: 3, 
      returnMetadata: true 
    });

    console.log('Vectorize matches:', matches.count || matches.matches?.length || 0);

    // 3. Build context
    const contextText = matches.matches && matches.matches.length > 0
      ? matches.matches.map(m => m.metadata?.text || '').filter(Boolean).join('\n')
      : 'No relevant climate data found in archive.';

    // 4. Call Mistral 7B
    const aiResponse = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
      messages: [
        { role: 'system', content: `You are ClimatoKil AI. Use this context:\n\n${contextText}` },
        { role: 'user', content: userQuestion }
      ]
    });

    console.log('AI response:', aiResponse);

    const reply = aiResponse.response || aiResponse.result || JSON.stringify(aiResponse);

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      reply: `Error: ${error.message || 'Unknown error'}`,
      details: error.toString()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
EOF