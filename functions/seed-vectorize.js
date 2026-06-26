export async function onRequest(context) {
  const { env } = context;
  
  const climateData = [
    { id: 'afg-temp', text: 'Afghanistan average temperature increased by +1.8°C since 1960.' },
    { id: 'pak-glacier', text: 'Pakistan glacier mass loss is -35% in Karakoram.' },
    { id: 'ind-water', text: 'India water resources depletion is -45%.' },
    { id: 'sa-monsoon', text: 'South Asia monsoon patterns becoming erratic.' },
    { id: 'heatwaves', text: 'Heatwaves exceeding 50°C in South Asia.' }
  ];

  try {
    for (const item of climateData) {
      const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: item.text });
      
      await env.VECTORIZE.insert([{
        id: item.id,
        values: embedding.data[0],
        metadata: { text: item.text }
      }]);
    }

    return new Response('Success! Seeded ' + climateData.length + ' vectors.', {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}