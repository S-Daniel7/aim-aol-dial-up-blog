## Environment

The creative chat page uses OpenAI's Responses API from the server-side
`/api/chat` route. Add this to `.env.local` before using `/chat`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_MODEL` is optional; the app falls back to `gpt-4.1-mini`.
