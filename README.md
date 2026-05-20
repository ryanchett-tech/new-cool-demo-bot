# New Cool Demo Bot 🤖
### JumpCloud HRIS Integration

A lightweight HRIS integration tool for creating and managing JumpCloud users — with automatic custom attribute stamping (`created_by = SJH`) on every provisioned user.

---

## Features

- ✅ **Create users** in JumpCloud with full profile fields
- ✅ **Auto-stamps** `created_by = SJH` and `sjh_created_at` as custom attributes on every user
- ✅ **Update users** — edit name, email, department, job title, phone
- ✅ **Delete users** directly from the UI
- ✅ **Visual badge** on any user carrying the SJH attribute

---

## Project Structure

```
new-cool-demo-bot/
├── client/
│   └── index.html       # Single-file frontend (Preact, no build step)
├── server/
│   ├── index.js         # Express API server
│   ├── package.json
│   └── .env.example     # Copy to .env and add your API key
└── README.md
```

---

## Setup

### 1. Get your JumpCloud API Key

1. Log into the JumpCloud Admin Portal
2. Go to your profile (top-right) → **API Settings**
3. Copy your API key

### 2. Configure the server

```bash
cd server
cp .env.example .env
# Edit .env and paste your JUMPCLOUD_API_KEY
```

### 3. Install dependencies & start the server

```bash
cd server
npm install
npm start        # production
# or
npm run dev      # with hot-reload via nodemon
```

Server runs on `http://localhost:3001` by default.

### 4. Open the frontend

Just open `client/index.html` in your browser. No build step needed.

The API_BASE field at the top of the UI defaults to `http://localhost:3001` — change it if your server runs elsewhere.

---

## Custom Attribute — SJH Stamp

Every user created through this app automatically receives:

| Attribute Name     | Value                        |
|--------------------|------------------------------|
| `created_by`       | `SJH`                        |
| `sjh_created_at`   | ISO timestamp of creation    |

These attributes are preserved on every update as well.

---

## 30-Day Auto-Delete Workflow (JumpCloud Setup)

This app is designed to work with JumpCloud's native Workflows feature to automatically delete SJH-provisioned users after 30 days.

### Step 1 — Create a Dynamic User Group

1. In the JumpCloud Admin Portal, go to **User Groups → + New Group**
2. Name it: `SJH Provisioned - Auto Expire`
3. Under **Group Members**, switch to **Dynamic**
4. Add a condition: `Custom Attribute` → `created_by` → `equals` → `SJH`
5. Save the group — it will automatically populate with any user carrying that attribute

### Step 2 — Create the Workflow

1. Go to **Automations → Workflows → + New Workflow**
2. Name it: `Auto-Delete SJH Users After 30 Days`
3. **Trigger:** Set to **Scheduled** → Daily (recommended: 2:00 AM)
4. **Condition:** Add a filter for users where:
   - Group membership = `SJH Provisioned - Auto Expire`
   - AND `sjh_created_at` custom attribute date is **more than 30 days ago**
5. **Action:** Select **Delete User**
6. Save and enable the workflow

Once active, any user created through the bot will be automatically cleaned up exactly 30 days after provisioning — zero manual work required.

### Note on Date Filtering

JumpCloud's Workflow date filtering on custom attributes can vary slightly by plan/version. If date math on a custom attribute string isn't supported directly, use the included fallback script:

```bash
node server/scripts/expire-sjh-users.js
```

This can be scheduled via cron or GitHub Actions — see the **Alternative Cron Script** section below.

### Alternative — Cron Script

If you prefer a code-based approach, use the included expiry script:

```bash
cd server
node scripts/expire-sjh-users.js
```

Add it to a daily cron job:
```
0 2 * * * cd /path/to/server && node scripts/expire-sjh-users.js
```

This script will:
1. Fetch all users with `created_by = SJH`
2. Check if `sjh_created_at` is > 30 days ago
3. Delete those users via the JumpCloud API

---

## API Endpoints

| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| GET    | `/api/users`       | List all users         |
| GET    | `/api/users/:id`   | Get a single user      |
| POST   | `/api/users`       | Create a user          |
| PUT    | `/api/users/:id`   | Update a user          |
| DELETE | `/api/users/:id`   | Delete a user          |
