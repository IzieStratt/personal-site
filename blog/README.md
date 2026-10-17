# blog

    node blog/server.js     # editor at http://localhost:4747/admin/, preview at http://localhost:4747/
    node blog/build.js      # rebuild the static pages without the editor

Posts live in `blog/posts/*.md` and build into `website/public/__subdomains/blog`. Publish with `scripts/deploy.fish`.

- Attached images/files go to `website/public/cdn/blog/<year>/`.
- Every external link is snapshotted to `website/public/cdn/archives/websites/<site>_<yyyymmdd-hhmmss>/` the first time a post is saved with it
  (index in `blog/archives.json`), and shown with a superscript "archive" link. Tick "re-archive links" to take a fresh snapshot.
- Nutshell: `[:text](#Heading)` or `[:text](https://site/page#Heading)`. The script is self-hosted at `cdn/nutshell/nutshell.js`.
- In a post, `#` is rendered as an h2 (the title is the h1).

## Comments

Visitors comment with a name plus a website domain *or* an email, in markdown, with replies (threads, 4 levels deep). Emails are stored in the database but never sent to browsers. No reply emails are sent.

- API: `comments.js` (in the site worker), storage: Cloudflare D1, schema: `blog/schema.sql`. The client is `blog/comments-client.js`, copied to the blog as `comments.js` on build.
- Spam: honeypot field, same-origin only, comments only on posts that exist, 3/minute and 20/day per visitor (hashed IP), and the mode below.
- Mode (set in the editor's "comments" section): `review` holds new comments until you approve them (default), `open` shows them right away, `off` stops new ones.
- Per post (the "comments on this post" pills in the editor, or `comments:` in the post's front matter): `on` takes comments even when the blog-wide mode is off (they wait for approval), `locked` keeps the existing ones but takes no more, `off` hides the comment section. Blank follows the blog-wide mode. The worker reads this from the built post page, so rebuild and deploy after changing it.
- Moderation lives in the local editor and runs `wrangler d1` with your own login, so there is no admin URL or password on the public site.

One-time setup (until it's done the comment box says comments aren't available):

    wrangler d1 create izie-blog
    # paste the printed block into wrangler.jsonc as:
    #   "d1_databases": [{ "binding": "COMMENTS", "database_name": "izie-blog", "database_id": "<id>" }]
    wrangler d1 execute izie-blog --remote --file blog/schema.sql
    scripts/deploy.fish
    # optional: wrangler secret put COMMENT_SALT   (any random string, makes the hashed IPs unguessable)

To try it locally without touching Cloudflare, see `COMMENTS_LOCAL`, `COMMENTS_WRANGLER_CONFIG` and `COMMENTS_API` in `comments-admin.js` and `server.js`.
