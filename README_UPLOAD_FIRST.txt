CEA HUB LIVE PACKAGE

Upload the CONTENTS of this folder to the root of the empty GitHub repo connected to your CEA HUB Netlify site.
Do NOT upload this folder as a single folder inside the repo. The root should look like:

index.html
_headers
netlify.toml
netlify/functions/hub-data.js
supabase_hub_read_policies.sql

Netlify settings needed on the CEA HUB site:
1. Site configuration > Environment variables
2. Add:
   SUPABASE_URL = https://sjgrbcqgkxwvzetjhutf.supabase.co
   SUPABASE_KEY = sb_publishable_dIek41t_shwMSKbv1aUQbA_QE29KUaO
3. Trigger deploy > Deploy site

If the HUB opens but does not show data:
- Open https://YOUR-HUB-DOMAIN/.netlify/functions/hub-data
- If it returns an RLS/select error, run supabase_hub_read_policies.sql in Supabase SQL Editor.
