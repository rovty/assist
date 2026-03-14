# API Documentation

## Overview

The Assist platform exposes a unified REST API through the **API Gateway** (port 3000). All microservices are accessible via prefixed routes. Authentication uses JWT bearer tokens.

## Base URL

```
http://localhost:3000
```

## Interactive Docs

The API Gateway auto-generates OpenAPI 3.1 specification from Fastify route schemas. Interactive documentation is available:

- **Swagger UI:** http://localhost:3000/docs
- All endpoints, schemas, and authentication requirements are documented inline.

## Authentication

### JWT Bearer Token

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Obtaining a Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "agent@company.com", "password": "secret"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "usr_...", "name": "Agent", "email": "agent@company.com", "role": "admin" }
}
```

### API Keys

For server-to-server integrations, generate an API key:

```bash
curl -X POST http://localhost:3000/api-keys \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Integration", "scopes": ["conversations:read", "conversations:write"]}'
```

---

## Route Reference

### Auth Service (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user and workspace |
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/logout` | Invalidate token |
| POST | `/auth/forgot-password` | Request password reset email |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user profile |

### Users (`/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List workspace members |
| GET | `/users/:id` | Get user details |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Remove user from workspace |
| POST | `/users/invite` | Invite user to workspace |

### Tenants (`/tenants`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants/:id` | Get tenant/workspace details |
| PATCH | `/tenants/:id` | Update workspace settings |
| GET | `/tenants/:id/usage` | Get workspace usage stats |

### Conversations (`/conversations`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/conversations` | List conversations (filterable) |
| POST | `/conversations` | Create conversation |
| GET | `/conversations/:id` | Get conversation details |
| PATCH | `/conversations/:id` | Update conversation (assign, status) |
| GET | `/conversations/:id/messages` | Get messages |
| POST | `/conversations/:id/messages` | Send message |
| POST | `/conversations/:id/resolve` | Resolve conversation |

### Contacts (`/contacts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts` | List contacts |
| POST | `/contacts` | Create contact |
| GET | `/contacts/:id` | Get contact details |
| PATCH | `/contacts/:id` | Update contact |

### AI Engine (`/ai`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/generate` | Generate AI response |
| POST | `/ai/summarize` | Summarize conversation |
| POST | `/ai/suggest` | Get reply suggestions |
| POST | `/ai/classify` | Classify message intent |

### Knowledge Base (`/kb`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kb/sources` | List KB sources |
| POST | `/kb/sources` | Add source (URL or file) |
| DELETE | `/kb/sources/:id` | Remove source |
| POST | `/kb/search` | Search knowledge base |
| POST | `/kb/sources/:id/sync` | Re-sync source |

### Media (`/media`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/media/upload` | Upload file (multipart) |
| GET | `/media/:id` | Get/download file |
| DELETE | `/media/:id` | Delete file |

### Channels (`/channels`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/channels` | List connected channels |
| POST | `/channels` | Connect a channel |
| PATCH | `/channels/:id` | Update channel config |
| DELETE | `/channels/:id` | Disconnect channel |
| POST | `/channels/:id/test` | Send test message |

### Analytics (`/analytics`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Dashboard overview stats |
| GET | `/analytics/conversations` | Conversation analytics |
| GET | `/analytics/agents` | Agent performance |
| GET | `/analytics/bots` | Bot engagement metrics |
| GET | `/analytics/export` | Export analytics data |

### Notifications (`/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| POST | `/notifications/read-all` | Mark all as read |

### Webhooks (`/webhooks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhooks` | List webhook endpoints |
| POST | `/webhooks` | Create webhook |
| PATCH | `/webhooks/:id` | Update webhook |
| DELETE | `/webhooks/:id` | Delete webhook |
| GET | `/webhooks/:id/logs` | Get delivery logs |

### Bots (`/bots`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bots` | List bots |
| POST | `/bots` | Create bot |
| GET | `/bots/:id` | Get bot details |
| PATCH | `/bots/:id` | Update bot |
| DELETE | `/bots/:id` | Delete bot |
| POST | `/bots/:id/publish` | Publish bot |
| POST | `/bots/:id/simulate` | Simulate bot flow |

### Leads/CRM (`/leads`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List leads |
| POST | `/leads` | Create lead |
| GET | `/leads/:id` | Get lead details |
| PATCH | `/leads/:id` | Update lead |
| DELETE | `/leads/:id` | Delete lead |
| PATCH | `/leads/:id/stage` | Move pipeline stage |
| POST | `/leads/:id/score` | Update lead score |

### Billing (`/billing`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing` | Get current billing info |
| GET | `/billing/plans` | List available plans |
| POST | `/billing/subscribe` | Subscribe to plan |
| POST | `/billing/cancel` | Cancel subscription |
| GET | `/billing/invoices` | List invoices |
| GET | `/billing/usage` | Get current usage |

### Scheduler (`/scheduler`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scheduler/jobs` | List scheduled jobs |
| POST | `/scheduler/jobs` | Create a job |
| DELETE | `/scheduler/jobs/:id` | Cancel a job |

### Agent Workspace (`/workspace`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspace/queue` | Get agent queue |
| PATCH | `/workspace/status` | Set agent status |
| GET | `/workspace/canned-responses` | List canned responses |
| POST | `/workspace/canned-responses` | Create canned response |

### Health (`/health`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Gateway health check |

---

## Code Examples

### JavaScript (fetch)

```javascript
const API = 'http://localhost:3000';

// Login
const loginRes = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'agent@company.com', password: 'secret' }),
});
const { token } = await loginRes.json();

// List conversations
const res = await fetch(`${API}/conversations`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { conversations } = await res.json();
```

### Python (requests)

```python
import requests

API = "http://localhost:3000"

# Login
res = requests.post(f"{API}/auth/login", json={"email": "agent@company.com", "password": "secret"})
token = res.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# List conversations
conversations = requests.get(f"{API}/conversations", headers=headers).json()
```

### Go (net/http)

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    api := "http://localhost:3000"

    // Login
    body, _ := json.Marshal(map[string]string{"email": "agent@company.com", "password": "secret"})
    resp, _ := http.Post(api+"/auth/login", "application/json", bytes.NewReader(body))
    defer resp.Body.Close()

    var login struct{ Token string }
    json.NewDecoder(resp.Body).Decode(&login)

    // List conversations
    req, _ := http.NewRequest("GET", api+"/conversations", nil)
    req.Header.Set("Authorization", "Bearer "+login.Token)
    http.DefaultClient.Do(req)
}
```

---

## Webhook Payloads

When events occur, the system sends POST requests to registered webhook URLs:

### Event Types

| Event | Payload |
|-------|---------|
| `conversation.created` | `{ conversationId, contactId, channel }` |
| `conversation.resolved` | `{ conversationId, resolvedBy, duration }` |
| `message.received` | `{ conversationId, messageId, sender, text }` |
| `message.sent` | `{ conversationId, messageId, sender, text }` |
| `lead.created` | `{ leadId, name, email, company }` |
| `lead.stage_changed` | `{ leadId, fromStage, toStage }` |
| `bot.triggered` | `{ botId, conversationId, trigger }` |
| `agent.status_changed` | `{ agentId, status }` |

### Webhook Security

All webhook payloads include a signature header:

```
X-Assist-Signature: sha256=<hmac_hex>
```

Verify the signature using your webhook secret:

```javascript
import crypto from 'crypto';

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expected}`));
}
```

---

## Rate Limiting

The API Gateway enforces rate limits:

- **Default:** 100 requests per minute per tenant
- **Auth endpoints:** 20 requests per minute per IP
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

When rate limited, the API returns HTTP 429 with a `Retry-After` header.

---

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [{ "field": "email", "message": "must be a valid email" }]
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 409 | Conflict — duplicate resource |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |
