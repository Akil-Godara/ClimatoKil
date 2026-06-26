export async function onRequest(context) {
  const { env } = context;
  
  const bindings = {};
  
  // Check AI
  bindings.AI = !!env.AI;
  
  // Check Vectorize
  bindings.VECTORIZE = !!env.VECTORIZE;
  
  // List all available env keys
  bindings.allEnvKeys = Object.keys(env);
  
  // Try to access vectorize to see what happens
  let vectorizeInfo = 'Not accessible';
  if (env.VECTORIZE) {
    try {
      vectorizeInfo = 'Accessible!';
    } catch (e) {
      vectorizeInfo = 'Error: ' + e.message;
    }
  }
  bindings.vectorizeInfo = vectorizeInfo;
  
  return new Response(JSON.stringify(bindings, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}