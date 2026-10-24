# Turning on Discord login for the site

The login needs Netlify functions, which Netlify Drop cannot run. Deploy the site from a Git repo (or the Netlify CLI) instead.

## 1. Put the site in a GitHub repo
Create a repo (for example `pengu-site`) and upload everything in this folder, including `netlify.toml` and the `netlify` folder. Keep the files at the top level of the repo, not inside another folder.

## 2. Connect it to Netlify
In Netlify: **Add new site, Import an existing project, GitHub**, pick `pengu-site`. Netlify reads `netlify.toml` automatically. Use the existing pengubot site if you want to keep its address.

## 3. Discord Developer Portal (your app)
Open the app, go to **OAuth2**, add this under **Redirects**:
`https://pengubot.netlify.app/.netlify/functions/discord-callback`

Then click **Reset Secret** and copy the new Client Secret. Do not paste it in chat.

## 4. Netlify environment variables
In Netlify: **Site configuration, Environment variables**, add:
- `DISCORD_CLIENT_SECRET` = the Client Secret from step 3
- `SESSION_SECRET` = a long random string. Make one by running this in a terminal:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Optional: `SITE_ORIGIN` = `https://pengubot.netlify.app` (already the default).

Redeploy after adding them.

## 5. Test
Open the site, click **Log in with Discord**, approve, and you should see your name in the header.

Login only reads your public name and avatar. It does not give the site access to your Discord account or your game data.
