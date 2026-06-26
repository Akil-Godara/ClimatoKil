export async function onRequest(context) {
  const { env } = context;
  
  const climateData = [
    { id: 'afg-temp', text: 'Afghanistan average temperature increased by +1.8°C since 1960. Warming rate exceeds global average.' },
    { id: 'pak-glacier', text: 'Pakistan glacier mass loss is -35% in Karakoram and Himalayas. Over 7,000 glaciers at risk.' },
    { id: 'ind-water', text: 'India water resources depletion is -45%. Groundwater depletion in Punjab and Rajasthan is critical.' },
    { id: 'sa-monsoon', text: 'South Asia monsoon patterns are becoming erratic. Extreme rainfall events increased by 75% since 1950.' },
    { id: 'heatwaves', text: 'Heatwaves in South Asia are becoming more frequent and intense, with temperatures exceeding 50°C in some regions.' }
  ];

  try {
    for (const item of climateData) {
      // IMPORTANT: We use 'text' here, not 'inputs'
      const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { 
        text: item.text 
      });
      
      await env.VECTORIZE.insert([{
        id: item.id,
        values: embedding.data[0],
        metadata: { text: item.text }
      }]);
    }

    return new Response('✅ Success! Seeded ' + climateData.length + ' vectors. Now delete this file.', {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    return new Response(' Error: ' + error.message, { status: 500 });
  }
}