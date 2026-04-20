const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID;
// We will redirect to this backend endpoint:
const REDIRECT_URI = `http://localhost:5000/api/auth/discord/callback`;

// GET /api/auth/discord/link
const linkDiscord = (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token diperlukan');

  // We use state to pass the JWT token to the callback
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join&state=${token}`;
  
  res.redirect(discordAuthUrl);
};

// GET /api/auth/discord/callback
const discordCallback = async (req, res) => {
  const { code, state: token } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!code || !token) {
    return res.redirect(`${FRONTEND_URL}/dashboard?discord=error`);
  }

  try {
    // 1. Verify user token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows: users } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (!users.length) throw new Error('User not found');
    const user = users[0];

    // 2. Exchange code for access token
    const tokenParams = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    });

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString()
    });
    
    if (!tokenRes.ok) {
      const e = await tokenRes.text();
      console.error('Discord Token Error:', e);
      throw new Error('Failed to get discord access token');
    }
    const tokenData = await tokenRes.json();
    const discordAccessToken = tokenData.access_token;

    // 3. Get Discord User Profile
    const meRes = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': `Bearer ${discordAccessToken}` }
    });
    const meData = await meRes.json();
    const discordId = meData.id;
    const discordUsername = meData.username;

    // 4. Update Database
    await pool.query('UPDATE users SET discord_id = $1, discord_username = $2 WHERE id = $3', [discordId, discordUsername, user.id]);

    // 5. Add to Guild and Assign Role (if premium)
    if (user.is_active) {
      // Endpoint: PUT /guilds/{guild.id}/members/{user.id}
      // This will add them to the server if not present, and assign the roles array.
      const addGuildRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_token: discordAccessToken,
          roles: [DISCORD_ROLE_ID]
        })
      });

      // 204 No Content means they were ALREADY in the guild. In this case, Discord does NOT modify roles automatically here.
      // We have to explicitly add the role via another endpoint.
      if (addGuildRes.status === 204) {
        await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}/roles/${DISCORD_ROLE_ID}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
          }
        });
        console.log(`✅ Assigned Premium role to existing guild member ${discordUsername}`);
      } else if (addGuildRes.status === 201) {
        console.log(`✅ Added ${discordUsername} to guild and assigned Premium role`);
      } else {
        const errorText = await addGuildRes.text();
        console.error('Failed to add to guild:', errorText);
      }
    }

    // Success response -> back to dashboard
    res.redirect(`${FRONTEND_URL}/dashboard?discord=success`);

  } catch (error) {
    console.error('Discord Callback Error:', error);
    res.redirect(`${FRONTEND_URL}/dashboard?discord=error`);
  }
};

module.exports = { linkDiscord, discordCallback };
