# n8n-nodes-zappy

[n8n](https://n8n.io/) community nodes for the [Zappy](https://zappy.com.br) WhatsApp API.

## Nodes

- **Zappy** — Send text, image, and document messages via WhatsApp
- **Zappy Trigger** — Listen for incoming WhatsApp events (messages, connection updates, acks)

## Installation

In your n8n instance, go to **Settings → Community Nodes** and install:

```
n8n-nodes-zappy
```

## Credentials

1. Log in to your [Zappy dashboard](https://dashboard.zappy.api.br)
2. Generate an API Key (starts with `zap_`)
3. In n8n, create a **Zappy API** credential with your API Key and Base URL (`https://zappy.api.br`)

## Usage

### Sending a message

Use the **Zappy** node with:

- **Instance** — select the connected WhatsApp number
- **To** — recipient phone number with country code, no `+` (e.g. `5511999999999`)
- **Message Type** — `text`, `image`, or `document`

### Receiving events

Use the **Zappy Trigger** node with:

- **Instance ID** — the ID of your WhatsApp instance (found in the Zappy dashboard)
- **Events** — one or more of: `message.received`, `message.sent`, `connection.update`, `message.ack`

The node automatically registers and removes the webhook on n8n workflow activate/deactivate.

## Resources

- [Zappy documentation](https://docs.zappy.com.br)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
