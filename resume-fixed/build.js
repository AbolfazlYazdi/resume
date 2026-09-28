// Pre-renders resume content + JSON-LD into the HTML so crawlers/link previews see it without JS.
// Usage:  node build.js     (run after every edit to assets/js/data.js)
const fs = require("fs"), vm = require("vm"), path = require("path");
const data = vm.runInNewContext(fs.readFileSync(path.join(__dirname, "assets/js/data.js"), "utf8") + ";resumeData");
const ext = u => u && /^https?:\/\//i.test(u);
const pad = i => String(i + 1).padStart(2, "0");

function render(L) {
  const en = L === "en";
  const val = o => (typeof o === "object" && o !== null && o[L] !== undefined ? o[L] : o);
  const img = p => (en ? "../" : "") + p;
  const contacts = [
    { name: en ? "Email" : "ایمیل", value: data.email, href: `mailto:${data.email}` },
    { name: en ? "Phone" : "موبایل", value: data.phone, href: `tel:${data.phone}` }
  ];
  const parts = {
    facts: data.facts[L].map(x => `<span class="fact">${x}</span>`).join(""),
    experienceList: data.experience.map((x, i) => `
    <article class="timeline-item"><div class="timeline-meta"><span>${pad(i)}</span><span>${val(x.period)}</span></div>
    <h3>${val(x.role)}</h3><h4>${val(x.company)}</h4><p>${val(x.description)}</p></article>`).join(""),
    educationList: data.education.map((x, i) => `
    <article class="timeline-item"><div class="timeline-meta"><span>${pad(i)}</span><span>${val(x.period)}</span></div>
    <h3>${val(x.degree)}</h3><h4>${val(x.institution)}</h4><p>${val(x.description)}</p></article>`).join(""),
    skillsList: data.skills.map((x, i) => `<li class="skill"><span>${pad(i)}</span><strong>${val(x)}</strong></li>`).join(""),
    languagesList: data.languages[L].map(x => `<span class="language-pill">${x}</span>`).join(""),
    projectsList: data.projects.map((x, i) => `
    <article class="project-card"><div class="project-image"><img src="${img(x.image)}" alt="${val(x.title)}" loading="lazy" decoding="async"><span>0${i + 1}</span></div>
    <div class="project-body"><small>PROJECT</small><h3>${val(x.title)}</h3><p>${val(x.description)}</p>
    ${ext(x.url) ? `<a href="${x.url}" target="_blank" rel="noopener">View project ↗</a>` : ""}</div></article>`).join(""),
    socialLinks: data.social.filter(x => x.enabled && ext(x.url)).map(x =>
      `<a class="social-link" href="${x.url}" target="_blank" rel="me noopener">${x.name} ↗</a>`).join(""),
    contactLinks: contacts.map(x => `<a class="contact-link" href="${x.href}"><small>${x.name}</small>${x.value}</a>`).join("")
      + data.social.filter(x => x.enabled && ext(x.url)).map(x => `<a class="contact-link" href="${x.url}" target="_blank" rel="me noopener"><small>${x.name}</small>Profile ↗</a>`).join("")
  };
  const site = data.siteUrl, page = site + (en ? "/en/" : "/");
  const ids = { person: site + "/#person", website: site + "/#website", profile: page + "#profilepage", image: page + "#primaryimage" };
  const today = new Date().toISOString().slice(0, 10);
  const graph = [
    { "@type": "ProfilePage", "@id": ids.profile, url: page, name: en ? "Abolfazl Yazdi | Computer Engineering Student, Gorgan" : "ابوالفضل یزدی | دانشجوی مهندسی کامپیوتر، گرگان",
      inLanguage: L, dateModified: today, isPartOf: { "@id": ids.website }, about: { "@id": ids.person },
      mainEntity: { "@id": ids.person }, primaryImageOfPage: { "@id": ids.image } },
    { "@type": "ImageObject", "@id": ids.image, url: site + "/assets/images/profile.jpg", contentUrl: site + "/assets/images/profile.jpg",
      width: 1000, height: 1000, caption: en ? "Abolfazl Yazdi, Computer Engineering student" : "ابوالفضل یزدی، دانشجوی مهندسی کامپیوتر" },
    { "@type": "Person", "@id": ids.person, name: data.name.en, alternateName: [data.name.fa],
      url: page, image: { "@id": ids.image }, mainEntityOfPage: { "@id": ids.profile },
      jobTitle: val(data.title), description: val(data.about),
      email: "mailto:" + data.email, telephone: data.phone.replace(/^0/, "+98"),
      address: { "@type": "PostalAddress", addressRegion: "Golestan", addressCountry: "IR" },
      knowsLanguage: ["fa"], sameAs: data.social.filter(x => ext(x.url)).map(x => x.url),
      alumniOf: data.education.map(e => ({ "@type": "CollegeOrUniversity", name: val(e.institution) })),
      worksFor: data.experience.map(e => ({ "@type": "Organization", name: val(e.company) })),
      knowsAbout: data.skills.map(s => val(s)) },
    { "@type": "WebSite", "@id": ids.website, url: site + "/", name: "Abolfazl Yazdi", alternateName: "ابوالفضل یزدی",
      inLanguage: ["fa", "en"], publisher: { "@id": ids.person } }
  ];
  const person = { "@context": "https://schema.org", "@graph": graph };
  const website = null;
  return { parts, person, website };
}

for (const [file, L] of [["index.html", "fa"], ["en/index.html", "en"]]) {
  const p = path.join(__dirname, file);
  let html = fs.readFileSync(p, "utf8");
  const { parts, person, website } = render(L);
  for (const [id, content] of Object.entries(parts)) {
    const re = new RegExp(`<!--pr:${id}-->[\\s\\S]*?<!--/pr:${id}-->`);
    if (!re.test(html)) throw new Error(`marker missing: ${id} in ${file}`);
    html = html.replace(re, () => `<!--pr:${id}-->${content}<!--/pr:${id}-->`);
  }
  html = html.replace(/(<script type="application\/ld\+json" id="personSchema">)[\s\S]*?(<\/script>)/, (_, a, b) => a + JSON.stringify(person) + b);
  html = html.replace(/<body(?![^>]*data-pr)([^>]*)>/, '<body data-pr="1"$1>');
  fs.writeFileSync(p, html);
  console.log("built", file);
}

// sitemap.xml (with hreflang alternates and the profile image)
const site = data.siteUrl, today = new Date().toISOString().slice(0, 10);
const alt = `    <xhtml:link rel="alternate" hreflang="fa" href="${site}/"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${site}/en/"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/"/>`;
const urlEntry = (loc, cap) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${alt}\n    <image:image>\n      <image:loc>${site}/assets/images/profile.jpg</image:loc>\n      <image:caption>${cap}</image:caption>\n    </image:image>\n  </url>`;
fs.writeFileSync(path.join(__dirname, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntry(site + "/", "ابوالفضل یزدی، دانشجوی مهندسی کامپیوتر")}
${urlEntry(site + "/en/", "Abolfazl Yazdi, Computer Engineering student")}
</urlset>
`);
console.log("built sitemap.xml");
