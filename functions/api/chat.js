export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    // 1. Generate embedding
    const queryEmbedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: userQuestion });
    const queryVector = queryEmbedding.data[0];

    // 2. Query Vectorize
    const matches = await env.VECTORIZE.query(queryVector, { topK: 3, returnMetadata: true });
    const contextText = matches.matches.map(m => m.metadata.text).join('\n');

    // 3. Call AI (Llama 3)
    const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: `You are ClimatoKil AI. Answer using ONLY this context:\n${contextText}` },
        { role: 'user', content: userQuestion }
      ]
    });

    // 4. Extract the text (Handles different AI response formats)
    const reply = aiResponse.response || (aiResponse.result && aiResponse.result.response) || "I couldn't find an answer.";

    console.log("SUCCESSFUL REPLY:", reply);

    // 5. Send back JSON with the key "reply"
    return new Response(JSON.stringify({ reply: reply }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return new Response(JSON.stringify({ reply: "Error: " + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}