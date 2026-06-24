export const onRequestPost = async (context) => {
  const request = context.request;
  const env = context.env;
  
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    const submission = {
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };

    await env.FORMS_DB.put(submission.id, JSON.stringify(submission));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Data saved successfully!'
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};