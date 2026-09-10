# Simple Cloudflare Pages website

This is one Cloudflare Worker ([`wrangler.jsonc`](wrangler.jsonc)) serving static files from `website/public` plus a wildcard route for `*.izie.top`. Subdomain sites live right inside `website/public/__subdomains/`, so there is only one place to edit.

## Where things go

```text
website/
└── public/                         <- files for izie.top
    ├── index.html                  <- izie.top/
    ├── 404.html                    <- shown for an address that does not exist
    ├── this-part-here/
    │   └── index.html              <- izie.top/this-part-here/
    ├── another-folder/
    │   └── and-so-on/
    │       └── index.html          <- izie.top/another-folder/and-so-on/
    ├── cdn/
    │   └── example.txt             <- izie.top/cdn/example.txt
    └── __subdomains/               <- wildcard subdomains
        ├── blog/
        │   └── index.html          <- blog.izie.top/
        └── vs/
            └── overview/
                └── index.html      <- vs.izie.top/overview/
```

Everything in `website/public` is published. Files elsewhere (like this guide) are not part of the website.

### Edit a subdomain

Edit files directly under `website/public/__subdomains/<name>/`. For example `website/public/__subdomains/vs/index.html` is `vs.izie.top/`. No syncing or copying needed.

### Add a new subdomain

Make a new folder `website/public/__subdomains/status/` containing `index.html`, then add a route for it in `wrangler.jsonc`:

```jsonc
{
  "pattern": "status.izie.top/*",
  "zone_name": "izie.top"
}
```

The regex in [`worker.js`](worker.js) maps `anything.izie.top` to `/__subdomains/anything/`, so the folder name is the subdomain.

## Publish changes

Run from the repository root:

```fish
fish scripts/deploy.fish "describe your change"
```

That commits `worker.js`, `wrangler.jsonc`, `scripts`, and `website/public/__subdomains`, then pushes to GitHub. The connected Cloudflare Worker deploys from that push.

## Test it on your computer

```sh
python3 -m http.server 8000 --directory website/public
```

Then open <http://localhost:8000>. Stop the test server by pressing **Control+C** in the terminal.

The wildcard subdomain logic only runs in the Worker, so locally you can preview a subdomain by serving its folder directly, e.g. `python3 -m http.server 8000 --directory website/public/__subdomains/vs`.