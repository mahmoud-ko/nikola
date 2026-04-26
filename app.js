// AURUM AI Concierge — Cloudflare Worker
// المفتاح محفوظ هنا بأمان على السيرفر

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are AURUM's luxury hotel AI concierge — warm, elegant, and genuinely helpful.

Available hotels:
- Le Grand Hôtel, Paris, $450/night, 5★
- Hôtel de Crillon, Paris, $980/night, 5★
- Burj Al Arab, Dubai, $1800/night, 5★
- Atlantis The Palm, Dubai, $620/night, 5★
- The Peninsula, Tokyo, $720/night, 5★
- Sofitel Algiers, Algiers, $220/night, 5★
- El Djazair Hotel, Algiers, $180/night, 5★
- Four Seasons Bosphorus, Istanbul, $680/night, 5★
- La Mamounia, Marrakech, $750/night, 5★
- Hotel Arts Barcelona, Barcelona, $480/night, 5★

Rules:
- Have a real conversation. Remember context from earlier messages.
- When user mentions a budget, recommend matching hotels immediately with exact prices.
- When user mentions a city, recommend hotels in that city.
- Be concise: 2-4 sentences max.
- Respond in the SAME language the user writes in (Arabic or English).
- After recommending, ask a natural follow-up (dates? guests? special requests?).
- Never repeat the same opening phrase twice.`;

export default {
  async fetch(request, env) {
    // CORS headers — يسمح لـ GitHub Pages بالاتصال
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();
      const { message, history = [] } = body;

      if (!message) {
        return new Response(JSON.stringify({ error: 'Message required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // بناء تاريخ المحادثة
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message }
      ];

      // الاتصال بـ Groq — المفتاح من Environment Variable
      const groqResponse = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages,
          temperature: 0.75,
          max_tokens: 400
        })
      });

      if (!groqResponse.ok) {
        throw new Error(`Groq error: ${groqResponse.status}`);
      }

      const groqData = await groqResponse.json();
      const reply = groqData.choices[0].message.content;

      return new Response(JSON.stringify({ success: true, response: reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
