	exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;
  
  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing url parameter" }) };
  }

  // Whitelist: only allow Yahoo Finance and rss2json
  const allowed = [
    "query1.finance.yahoo.com",
    "query2.finance.yahoo.com",
    "api.rss2json.com",
  ];
  
  let parsed;
  try { parsed = new URL(url); } catch { 
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid URL" }) }; 
  }
  
  if (!allowed.some(d => parsed.hostname === d || parsed.hostname.endsWith("." + d))) {
    return { statusCode: 403, body: JSON.stringify({ error: "Domain not allowed: " + parsed.hostname }) };
  }

  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });
    
    const text = await resp.text();
    
    return {
      statusCode: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=30",
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
