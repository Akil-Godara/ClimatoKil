// Simple backend for Cloudflare Pages
export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  
  // 1. Get data from the form
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // 2. Save to Cloudflare KV Binding
  const timestamp = new Date().toISOString();
  const dataToSave = { name, email, message, timestamp };
  
  // Save to KV
  await env.FORMS_DB.put(timestamp, JSON.stringify(dataToSave));

  // 3. Send success message back
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};