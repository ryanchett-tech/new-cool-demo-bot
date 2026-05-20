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

To automatically delete users with the `SJH` attribute after 30 days, set this up in JumpCloud:

### Step 1 — Create a Dynamic User Group

1. In the JumpCloud Admin Portal, go to **User Groups → + New Group**
2. Name it: `SJH Provisioned - Auto Expire`
3. Under **Group Members**, select **Dynamic**
4. Add condition: `Custom Attribute` → `created_by` → `is` → `SJH`
5. Save the group

### Step 2 — Set Up a Workflow

If your JumpCloud plan supports Workflows/Automations:

1. Go to **Automations → Workflows → + New Workflow**
2. Trigger: **Scheduled** (daily)
3. Condition: User is member of `SJH Provisioned - Auto Expire` AND `sjh_created_at` is older than 30 days
4. Action: **Delete User**

### Alternative — Cron Script

If Workflows aren't available on your plan, use the included expiry script:

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

---

## One Thing I Need From You

> **Confirm your JumpCloud plan** — Workflow/Automation features require a Business or Enterprise tier. If you have access, the dynamic group + workflow approach is the cleanest hands-off solution. If not, the cron script handles it automatically — just let me know and I'll build that out next!
