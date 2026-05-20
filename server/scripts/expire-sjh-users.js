#!/usr/bin/env node
/**
 * expire-sjh-users.js
 * Runs daily (via cron) to delete JumpCloud users tagged with created_by=SJH
 * who were created more than 30 days ago.
 *
 * Usage: node expire-sjh-users.js
 * Cron:  0 2 * * * cd /path/to/server && node scripts/expire-sjh-users.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const JC_API = 'https://console.jumpcloud.com/api';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const headers = {
  'x-api-key': process.env.JUMPCLOUD_API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

async function getAllSJHUsers() {
  let skip = 0;
  const limit = 100;
  const results = [];

  while (true) {
    const r = await axios.get(`${JC_API}/systemusers?limit=${limit}&skip=${skip}`, { headers });
    const users = r.data.results || [];
    if (users.length === 0) break;

    const sjhUsers = users.filter(u =>
      Array.isArray(u.attributes) &&
      u.attributes.some(a => a.name === 'created_by' && a.value === 'SJH')
    );
    results.push(...sjhUsers);

    if (users.length < limit) break;
    skip += limit;
  }

  return results;
}

async function run() {
  console.log(`[expire-sjh-users] Starting run at ${new Date().toISOString()}`);

  if (!process.env.JUMPCLOUD_API_KEY) {
    console.error('[expire-sjh-users] ERROR: JUMPCLOUD_API_KEY not set in .env');
    process.exit(1);
  }

  const sjhUsers = await getAllSJHUsers();
  console.log(`[expire-sjh-users] Found ${sjhUsers.length} SJH-tagged users`);

  const now = Date.now();
  let deleted = 0;
  let skipped = 0;

  for (const user of sjhUsers) {
    const createdAtAttr = user.attributes?.find(a => a.name === 'sjh_created_at');
    const createdAt = createdAtAttr ? new Date(createdAtAttr.value).getTime() : null;

    if (!createdAt) {
      console.log(`  [SKIP] ${user.username} — no sjh_created_at attribute found`);
      skipped++;
      continue;
    }

    const ageMs = now - createdAt;
    const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

    if (ageMs < THIRTY_DAYS_MS) {
      console.log(`  [SKIP] ${user.username} — ${ageDays} days old (< 30)`);
      skipped++;
      continue;
    }

    try {
      await axios.delete(`${JC_API}/systemusers/${user.id}`, { headers });
      console.log(`  [DELETE] ${user.username} — ${ageDays} days old ✓`);
      deleted++;
    } catch (e) {
      console.error(`  [ERROR] Failed to delete ${user.username}:`, e.response?.data || e.message);
    }
  }

  console.log(`[expire-sjh-users] Done. Deleted: ${deleted} | Skipped: ${skipped}`);
}

run().catch(e => {
  console.error('[expire-sjh-users] Fatal error:', e.message);
  process.exit(1);
});
