# Simple Cloudflare Pages website

The root [`wrangler.jsonc`](wrangler.jsonc) also makes the main site directly deployable with `npx wrangler deploy`. It tells Cloudflare Workers Static Assets that the public files are in `website/public`.

This repository is arranged so the folder names match the web addresses as closely as possible.

## Where things go

```text
website/
└── public/                         <- files for example.com
    ├── index.html                  <- example.com/
    ├── 404.html                    <- shown for an address that does not exist
    ├── this-part-here/
    │   └── index.html              <- example.com/this-part-here/
    ├── another-folder/
    │   └── and-so-on/
    │       └── index.html          <- example.com/another-folder/and-so-on/
    └── cdn/
        ├── example.txt             <- example.com/cdn/example.txt
        └── example-image.svg       <- example.com/cdn/example-image.svg

subdomains/
└── blog/
    └── public/
        └── index.html              <- blog.example.com/
```

Only files inside a `public` folder are published. Files such as this guide are not part of the website.

### Make a normal page

Create a folder inside `website/public`, then put an `index.html` in it.

For example:

```text
website/public/contact/index.html  ->  example.com/contact/
website/public/games/chess/index.html  ->  example.com/games/chess/
```

You can copy `website/public/this-part-here/index.html` as a starting point.

### Add a CDN file

Put any public file in `website/public/cdn`:

```text
website/public/cdn/photo.png       ->  example.com/cdn/photo.png
website/public/cdn/notes.txt       ->  example.com/cdn/notes.txt
website/public/cdn/files/book.pdf  ->  example.com/cdn/files/book.pdf
```

Keep the file extension in the address. Cloudflare automatically serves these files through its CDN, adds the appropriate file type, and permits other websites to load them. You do not need to create a separate CDN service or caching rule. Do not put passwords, private files, or secret keys here: everything in `public` is public.

### Add a subdomain

Copy the entire `subdomains/blog` folder and rename the copy to the subdomain you want. For example, `subdomains/status/public/index.html` is the content you would deploy at `status.example.com`.

A subdomain is a separate Cloudflare Pages project. That is what allows `blog.example.com` to have its own root page while still keeping all the files in this repository.

## Put it online with Cloudflare Pages

First, put this repository on GitHub or GitLab. Then create the main site:

1. In Cloudflare, open **Workers & Pages**, choose **Create application**, then choose **Pages** and import this Git repository.
2. Give the Pages project any unique name.
3. Set **Production branch** to `main`.
4. Set **Root directory** to `website`.
5. Set **Build command** to `exit 0`.
6. Set **Build output directory** to `public`.
7. Deploy it. Open the supplied `your-project.pages.dev` address to test it.
8. In that Pages project's **Custom domains** section, add `example.com` (using your real domain).

For `blog.example.com`, make another Pages project connected to the same repository. Use these settings:

```text
Root directory:         subdomains/blog
Build command:          exit 0
Build output directory: public
Custom domain:          blog.example.com
```

Repeat that process for each subdomain folder. In **Settings > Build > Build watch paths**, you can set an include path such as `website/*` or `subdomains/blog/*` so unrelated edits do not redeploy every project.

Cloudflare Pages currently permits up to five Pages projects connected to one repository by default. If you eventually need many more subdomains, split them into another repository or request a higher limit.

Cloudflare's official references: [static HTML setup](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [how Pages serves and caches files](https://developers.cloudflare.com/pages/configuration/serving-pages/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/), and [multiple projects in one repository](https://developers.cloudflare.com/pages/configuration/monorepos/).

## Test it on your computer

### Publish changes

After editing a page, run this from the repository root:

```fish
fish scripts/deploy.fish "describe your change"
```

The script syncs every `subdomains/*/public` folder, commits the result, and pushes to GitHub. The connected Cloudflare Worker deploys from that push. Add a new subdomain by creating `subdomains/name/public/`; the wildcard Worker route will serve it at `name.izie.top`.

From this repository, run:

```sh
python3 -m http.server 8000 --directory website/public
```

Then open <http://localhost:8000>. Stop the test server by pressing **Control+C** in the terminal.

To preview the example blog instead, use:

```sh
python3 -m http.server 8000 --directory subdomains/blog/public
```
