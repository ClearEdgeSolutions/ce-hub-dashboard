exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { id, updates, action, performed_by } = JSON.parse(event.body);

    if (!id || !updates) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing lead id or updates" }),
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    });

    const result = await response.text();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Supabase update failed", details: result }),
      };
    }

    await fetch(`${SUPABASE_URL}/rest/v1/activity_log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        record_type: "lead",
        record_id: id,
        action: action || "lead_updated",
        performed_by: performed_by || "CEA Admin",
        notes: JSON.stringify(updates),
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: JSON.parse(result) }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
