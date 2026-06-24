type KVNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

// Define the environment type
export interface Env {
  FORMS_DB: KVNamespace;
}

// Handle POST requests
export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;
  
  try {
    // Get form data
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Create data object
    const submission = {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    // Save to KV - use timestamp as key
    await env.FORMS_DB.put(submission.id, JSON.stringify(submission));
    
    // Return success
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Data saved successfully!'
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    // Return error
    return new Response(JSON.stringify({ 
      success: false,
      error: message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};