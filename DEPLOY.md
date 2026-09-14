# Deploy notes (website)

1. Build: `npm run build` → copy `dist/` to the server root (e.g. `/var/www/mittilok-FE/dist`).
2. Install / merge [`nginx.conf`](./nginx.conf) so deep links work:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Without this, `/nursery`, `/login`, etc. return **404** from nginx while in-app clicks still work.

3. Reload nginx: `nginx -t && systemctl reload nginx`
