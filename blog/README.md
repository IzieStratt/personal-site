# blog

    node blog/server.js     # opens the editor at http://localhost:4747/admin/ (--no-open to skip), preview at http://localhost:4747/
    node blog/build.js      # rebuild the static pages without the editor

Posts live in `blog/posts/*.md` and build into `website/public/__subdomains/blog`.

The editor's **publish** button saves the post, commits only the blog's files (posts, built pages, attachments, archives) with the message `blog: <post title>`, and pushes the current branch. GitHub deploys from `main`. Anything else you have uncommitted is left alone. If a push fails, the commit is kept and the next publish pushes it.

- Attached images/files go to `website/public/cdn/blog/<year>/`.
- Every external link is snapshotted to `website/public/cdn/archives/websites/<site>_<yyyymmdd-hhmmss>/` the first time a post is saved with it
  (index in `blog/archives.json`), and shown with a superscript "archive" link. Tick "re-archive links" to take a fresh snapshot.
- Nutshell: `[:text](#Heading)` or `[:text](https://site/page#Heading)`. The script is self-hosted at `cdn/nutshell/nutshell.js`.
- In a post, `#` is rendered as an h2 (the title is the h1).

## Online editor (blog.izie.top/admin)

Sign in with a passkey, write, and publish from any browser. Saving commits the post to `main` through the GitHub API (`blog-github.js`). The `blog-build` workflow then archives new links, rebuilds the pages, and commits them back. GitHub deploys from `main`. Moderation (approve / hide / delete comments, the comment mode) runs against the D1 database directly (`blog-admin.js`). `blog-passkeys.js` does the sign-in.

One-time setup (the site fails closed until these exist: no passkey can be created without the setup code):

    # 1. the database tables for passkeys and sessions (safe to rerun)
    wrangler d1 execute izie-blog --remote --file blog/schema.sql
    # 2. a fine-grained GitHub token: this repo only, Contents: read and write
    wrangler secret put GITHUB_TOKEN
    # 3. a one-time setup code (24+ characters). use it once, for your first passkey, then it does nothing
    head -c 36 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32 | wrangler secret put BLOG_ADMIN_SETUP
    # 4. push to main (deploys the worker), then open https://blog.izie.top/admin/ and create the passkey

Limits: a save writes one file per commit (uploads are capped at 25MB). Listing posts reads each file, so the post list works well up to a few dozen posts on the free Workers plan. Passkeys are per device; add a second device from the signed-in editor. Sessions last 12 hours.

The local editor (`node blog/server.js`) still works for previewing and uses `wrangler d1` for moderation.

## Comments

Visitors comment with a name plus a website domain *or* an email, in markdown, with replies (threads, 4 levels deep). Emails are stored in the database but never sent to browsers. No reply emails are sent.

- API: `comments.js` (in the site worker), storage: Cloudflare D1, schema: `blog/schema.sql`. The client is `blog/comments-client.js`, copied to the blog as `comments.js` on build.
- Spam: honeypot field, same-origin only, comments only on posts that exist, 3/minute and 20/day per visitor (hashed IP), and the mode below.
- Mode (set in the editor's "comments" section): `review` holds new comments until you approve them (default), `open` shows them right away, `off` stops new ones.
- Per post (the "comments on this post" pills in the editor, or `comments:` in the post's front matter): `on` takes comments even when the blog-wide mode is off (they wait for approval), `locked` keeps the existing ones but takes no more, `off` hides the comment section. Blank follows the blog-wide mode. The worker reads this from the built post page, so rebuild and deploy after changing it.
- Moderation lives in the online editor (passkey sign-in), or in the local editor (`wrangler d1`, your own login).

One-time setup (until it's done the comment box says comments aren't available):

    wrangler d1 create izie-blog
    # paste the printed block into wrangler.jsonc as:
    #   "d1_databases": [{ "binding": "COMMENTS", "database_name": "izie-blog", "database_id": "<id>" }]
    wrangler d1 execute izie-blog --remote --file blog/schema.sql
    scripts/deploy.fish
    # COMMENT_SALT (random secret for the hashed IPs) is already set on the worker; check with `wrangler secret list` after deploying.
    # on a fresh account:  head -c 96 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 25 | wrangler secret put COMMENT_SALT

To try it locally without touching Cloudflare, see `COMMENTS_LOCAL`, `COMMENTS_WRANGLER_CONFIG` and `COMMENTS_API` in `comments-admin.js` and `server.js`.
