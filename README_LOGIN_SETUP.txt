CEA HUB protected login setup

Upload the CONTENTS of this folder to your ce-hub-dashboard GitHub repo.

Then add these Environment Variables in Netlify for the HUB site:

SUPABASE_URL = https://sjgrbcqgkxwvzetjhutf.supabase.co
SUPABASE_KEY = your Supabase publishable/anon key
HUB_USERNAME = choose-your-user
HUB_PASSWORD = choose-your-password
HUB_SECRET = any long random text, for example: ce-hub-secret-change-this-to-a-long-random-value-2026

After saving variables:
Netlify > Deploys > Trigger deploy > Deploy site

How to test:
1. Open https://ce-hub-dashboard.netlify.app
2. You should see the CEA HUB login screen.
3. Log in with HUB_USERNAME and HUB_PASSWORD.
4. Open https://ce-hub-dashboard.netlify.app/.netlify/functions/hub-data while logged in: it should show leads/partners.
5. Open the same URL in incognito without logging in: it should show Unauthorized.
