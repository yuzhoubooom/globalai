export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // THIS IS THE CRITICAL PART
    // It reads the API base URL from the Vercel Environment Variable.
    const API_BASE_URL = process.env.API_BASE_URL;

    if (!API_BASE_URL) {
       return new Response(JSON.stringify({ error: 'Backend is not configured. API_BASE_URL is missing.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUrl = `${API_BASE_URL}/v1/dashboard/billing/credit_grants`;


    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
       return new Response(JSON.stringify({ error: data.error ? data.error.message : 'Failed to fetch from provider API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
