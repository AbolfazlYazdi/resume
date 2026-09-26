# Abolfazl Yazdi — Professional Personal Website

## مهم: قبل از انتشار

در این پروژه عبارت `SITE_URL` را با آدرس واقعی GitHub Pages خودت جایگزین کن.

مثلاً:

```text
https://USERNAME.github.io
```

اگر سایتت Project Site است:

```text
https://USERNAME.github.io/REPOSITORY-NAME
```

این مقدار در `index.html`، `en/index.html`، `assets/js/data.js`، `robots.txt` و `sitemap.xml` استفاده شده است.

## ویرایش رزومه

فقط این فایل را ویرایش کن:

```text
assets/js/data.js
```

در آن:
- اطلاعات شخصی
- تجربه
- تحصیلات
- مهارت‌ها
- پروژه‌ها
- شبکه‌های اجتماعی

قرار دارد.

## عکس پروفایل

عکس فعلی یک placeholder است:

```text
assets/images/profile-placeholder.svg
```

عکس خودت را می‌توانی با مثلاً:

```text
assets/images/profile.jpg
```

جایگزین کنی و مسیر `profile` در HTML را تغییر بده.

## عکس پروژه‌ها

برای هر پروژه مسیر `image` را در `data.js` تغییر بده.

## SEO

این نسخه شامل:
- title و meta description فارسی و انگلیسی
- canonical
- hreflang برای فارسی/انگلیسی
- robots.txt
- sitemap.xml
- Open Graph
- Twitter Card
- JSON-LD از نوع Person و WebSite
- `sameAs` برای لینک‌های واقعی شبکه‌های اجتماعی
- semantic HTML
- alt text
- صفحه 404
- mobile responsive
- print CSS

است.

این موارد به موتورهای جست‌وجو کمک می‌کنند، اما رتبه اول گوگل تضمینی نیست.

## Google Search Console

بعد از انتشار، سایت را در Google Search Console ثبت کن و sitemap زیر را معرفی کن:

```text
SITE_URL/sitemap.xml
```

اگر دامنه شخصی خریدی، بهتر است سایت را روی آن هم منتشر کنی؛ GitHub Pages از custom domain و HTTPS پشتیبانی می‌کند.

## GitHub Pages

Repository را روی GitHub قرار بده و در:

Settings → Pages

Branch را روی `main` و Folder را روی `/ (root)` قرار بده.

## PDF

دکمه Download Resume PDF از print stylesheet استفاده می‌کند. در پنجره Print مرورگر گزینه `Save as PDF` را بزن.

برای نسخه‌های بعدی می‌توانیم PDF رزومه مستقل و کاملاً صفحه‌آرایی‌شده هم اضافه کنیم.
