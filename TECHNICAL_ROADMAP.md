# Technical Roadmap

This project is already a working retro publishing space: chat-room posts, a live feed, a draggable board, Supabase-backed content, image uploads, and a streaming creative assistant. The next phase should make it feel less like a single-user CMS and more like a production creative platform.

## 1. Real-Time Collaboration

- Add Supabase Realtime subscriptions for board item create/update/delete events.
- Show presence for active admins/editors, including online status and live cursor positions on the board.
- Use optimistic updates for drag, resize, text, and layer changes, with rollback when the server rejects a mutation.
- Add conflict handling with `updated_at` or version counters so simultaneous edits do not silently overwrite each other.
- Publish live feed and chat-log updates without requiring a refresh.

## 2. Permissions And Multi-Tenancy

- Replace the single admin flow with Supabase Auth accounts.
- Add workspaces or teams that own posts, board items, live feed entries, media, and settings.
- Define roles such as `admin`, `editor`, `contributor`, and `viewer`.
- Support private drafts, public posts, private boards, and workspace-only content.
- Move access control into Supabase row-level security policies tied to workspace membership and role.

## 3. Reliable Rich Editing

- Add debounced autosave for board edits and post composition.
- Keep a local undo/redo stack for board movements, text changes, style changes, and item deletion.
- Store draft recovery data in local storage so refreshes or crashes do not lose in-progress work.
- Add board snapshots and restore points for major publish moments.
- Add keyboard shortcuts, snapping, alignment guides, grouping, and export to image/PDF.

## 4. Search And Discovery

- Add full-text search across posts, messages, image captions, live feed entries, and board text.
- Filter by handle, tag, date range, board item, post, feed item, and content type.
- Add archive pages by month, theme, tag, or handle.
- Store semantic tags and related-content signals for recommendations.
- Rank results with a mix of text relevance, recency, tags, and content type.

## 5. Product-Native AI

- Let the assistant draft posts from notes, chat logs, live feed entries, or board text.
- Generate captions for uploaded images and board pins.
- Offer tone transformations for drafts while preserving the author's voice.
- Suggest tags, categories, titles, blurbs, and related posts.
- Summarize boards, posts, archives, or selected content.
- Add retrieval over prior posts, board items, and feed entries so answers can use site context.
- Run moderation or safety checks before publication.

## 6. Observability And Production Readiness

- Add structured logs around uploads, publishing, admin actions, and AI streaming.
- Track AI and upload failures with request IDs.
- Add request tracing around `/api/openrouter-chat`, `/api/upload`, posts, live feed, and board routes.
- Add rate limits for login, uploads, and AI requests.
- Add retry handling for transient upload and streaming failures.
- Add health checks for Supabase, storage, and AI provider configuration.
- Keep admin audit logs for create, update, delete, publish, login, and role changes.

## 7. Performance Engineering

- Optimize uploaded images and serve responsive variants.
- Cache public posts, board data, and live feed responses where freshness allows.
- Paginate or infinite-scroll post and feed pages.
- Lazy-load media-heavy board areas and modal images.
- Improve stream buffering for smoother AI responses.
- Virtualize board rendering if a board grows to hundreds of items.
- Split bundles by route so admin/editor code does not ship to public pages.

## 8. Data Modeling And Schema Evolution

- Normalize posts, messages, media, board items, captions, tags, users, workspaces, and memberships.
- Add migration files for every schema change, with a clear rollback note.
- Use soft deletes for recoverable content.
- Add version or audit tables for posts, board items, live feed entries, and workspace settings.
- Schedule cleanup for orphaned uploads.
- Add content integrity validation for media URLs, board bounds, message ordering, slugs, and publish states.

## 9. Social Publishing

- Add comments and reactions for posts, live feed entries, and board pins.
- Add saved collections and public profiles.
- Add follows for profiles, tags, or boards.
- Support reblogs/reposts with attribution.
- Add scheduled publishing and pinned featured content.
- Add moderation queues, reporting, and role-gated review workflows.

## Recommended Build Order

1. Permissions and multi-tenancy, because every later feature needs ownership and roles.
2. Reliable editor persistence, because autosave and versions protect creative work.
3. Real-time board/feed updates, because the current board model is a natural fit for subscriptions.
4. Search and discovery, because the existing posts/messages/feed data can be indexed incrementally.
5. Product-native AI, backed by retrieval over the indexed content.
6. Observability, performance, and schema hardening as each production feature lands.
