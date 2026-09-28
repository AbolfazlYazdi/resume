# چک‌لیست سئوی بیرونی (کارهایی که فقط خودت می‌توانی انجام بدهی)

کد سایت آماده است؛ رتبه بیشتر از اینجا می‌آید.

## ۱. ثبت در موتورهای جست‌وجو
- [ ] Google Search Console → sitemap: `https://abolfazlyazdi.github.io/resume/sitemap.xml` (تگ verification از قبل هست)
- [ ] در Search Console برای هر دو صفحه (`/resume/` و `/resume/en/`) «Request indexing» بزن
- [ ] Bing Webmaster Tools: با «Import from Google Search Console» سایت را اضافه کن (Bing، DuckDuckGo و Ecosia را پوشش می‌دهد)

## ۲. بک‌لینک (مهم‌ترین عامل)
- [ ] در GitHub → صفحه‌ی ریپو → About: فیلد Website را `https://abolfazlyazdi.github.io/resume/` بگذار و توضیح + topics اضافه کن (`resume`, `portfolio`, `computer-engineering`, `persian`)
- [ ] ریپوی مخصوص پروفایل (`AbolfazlYazdi/AbolfazlYazdi` با README) بساز و لینک سایت را در آن بگذار
- [ ] لینک سایت را در بیو لینکدین، اینستاگرام، تلگرام و X بگذار
- [ ] همان لینک‌ها را در `assets/js/data.js` → `social` وارد کن (`enabled: true`) و `node build.js` بزن. این‌ها به‌صورت `sameAs` و `rel="me"` به گوگل می‌گویند این حساب‌ها مال یک نفرند.
- [ ] اگر «کامپیوتر جام‌جم» سایت یا پروفایل گوگل‌مپ دارد، از آن‌ها به سایتت لینک بگیر

## ۳. آدرس
- [ ] ریپو را به `abolfazlyazdi.github.io` تغییر نام بده، یا دامنه‌ی اختصاصی (مثلاً `abolfazlyazdi.ir` یا `.dev`) وصل کن. با این کار `robots.txt` هم معتبر می‌شود.
- [ ] بعدش `siteUrl` را در `data.js` عوض کن، `node build.js` بزن، و در Search Console «Change of address» یا دامنه‌ی جدید را ثبت کن

## ۴. محتوا
- [ ] یک پروژه‌ی واقعی (حتی کوچک) با توضیح و لینک اضافه کن و بخش پروژه‌ها را پر کن
- [ ] هر چه متن واقعی‌تر و منحصربه‌فردتر (پروژه، مقاله‌ی کوتاه، تجربه‌ی تعمیرات)، شانس بیشتر
- [ ] هر بار `data.js` را عوض کردی: `node build.js` → commit → push
