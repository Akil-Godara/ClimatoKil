export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Test 1: Check if AI binding works
    const aiTest = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
      inputs: ['test'] 
    });
    
    // Test 2: Check if Vectorize binding works
    const vectorTest = await env.VECTORIZE.query([0, 0, 0, 0], { topK: 1 });
    
    return new Response(JSON.stringify({
      aiWorking: !!aiTest,
      vectorizeWorking: true,
      vectorCount: vectorTest.count || 0,
      message: vectorCount === 0 ? '⚠️ Vectorize is empty! Need to seed data.' : '✅ All systems working!'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
