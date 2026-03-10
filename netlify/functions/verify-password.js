exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST" }, body: "" };
  }
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  try {
    const { app_slug, password } = JSON.parse(event.body);

    if (password === ADMIN_PASSWORD) {
      const token = Buffer.from(JSON.stringify({ role: "admin", ts: Date.now() })).toString("base64");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ ok: true, role: "admin", token }),
      };
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_passwords?slug=eq.${app_slug}&select=password`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await res.json();

    if (rows.length > 0 && rows[0].password === password) {
      const token = Buffer.from(JSON.stringify({ role: "viewer", app: app_slug, ts: Date.now() })).toString("base64");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ ok: true, role: "viewer", token }),
      };
    }

    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: "Wrong password" }),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
