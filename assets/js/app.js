const isEnglish = document.documentElement.lang === "en";
const L = isEnglish ? "en" : "fa";
const $ = id => document.getElementById(id);
const val = obj => typeof obj === "object" && obj !== null && obj[L] !== undefined ? obj[L] : obj;

function external(url) { return url && /^https?:\/\//i.test(url); }

function render() {
  $("facts").innerHTML = resumeData.facts[L].map(x => `<span class="fact">${x}</span>`).join("");

  $("experienceList").innerHTML = resumeData.experience.map((x,i) => `
    <article class="timeline-item"><div class="timeline-meta"><span>${String(i+1).padStart(2,"0")}</span><span>${val(x.period)}</span></div>
    <h3>${val(x.role)}</h3><h4>${val(x.company)}</h4><p>${val(x.description)}</p></article>`).join("");

  $("educationList").innerHTML = resumeData.education.map((x,i) => `
    <article class="timeline-item"><div class="timeline-meta"><span>${String(i+1).padStart(2,"0")}</span><span>${val(x.period)}</span></div>
    <h3>${val(x.degree)}</h3><h4>${val(x.institution)}</h4><p>${val(x.description)}</p></article>`).join("");

  $("skillsList").innerHTML = resumeData.skills.map((x,i) =>
    `<div class="skill"><span>${String(i+1).padStart(2,"0")}</span><strong>${val(x)}</strong></div>`).join("");

  $("languagesList").innerHTML = resumeData.languages[L].map(x => `<span class="language-pill">${x}</span>`).join("");

  $("projectsList").innerHTML = resumeData.projects.map((x,i) => `
    <article class="project-card"><div class="project-image"><img src="${isEnglish ? "../" : ""}${x.image}" alt="${val(x.title)}" loading="lazy"><span>0${i+1}</span></div>
    <div class="project-body"><small>PROJECT</small><h3>${val(x.title)}</h3><p>${val(x.description)}</p>
    ${external(x.url) ? `<a href="${x.url}" target="_blank" rel="noopener">View project ↗</a>` : ""}</div></article>`).join("");

  $("socialLinks").innerHTML = resumeData.social.filter(x => x.enabled).map(x =>
    external(x.url) ? `<a class="social-link" href="${x.url}" target="_blank" rel="noopener">${x.name} ↗</a>` : `<span class="social-link muted-link">${x.name}</span>`).join("");

  const contacts = [
    {name: isEnglish ? "Email" : "ایمیل", value: resumeData.email, href: `mailto:${resumeData.email}`},
    {name: isEnglish ? "Phone" : "موبایل", value: resumeData.phone, href: `tel:${resumeData.phone}`}
  ];
  $("contactLinks").innerHTML = contacts.map(x => `<a class="contact-link" href="${x.href}"><small>${x.name}</small>${x.value}</a>`).join("")
    + resumeData.social.filter(x=>x.enabled && external(x.url)).map(x => `<a class="contact-link" href="${x.url}" target="_blank" rel="noopener"><small>${x.name}</small>Profile ↗</a>`).join("");

  $("year").textContent = new Date().getFullYear();

  const person = {
    "@context":"https://schema.org","@type":"Person","name":resumeData.name.en,"alternateName":resumeData.name.fa,
    "url": resumeData.siteUrl + (isEnglish ? "/en/" : "/"),
    "image": resumeData.siteUrl + "/assets/images/profile.jpg",
    "jobTitle": val(resumeData.title),"description":val(resumeData.about),
    "email":"mailto:"+resumeData.email,"telephone":resumeData.phone,
    "address":{"@type":"PostalAddress","addressRegion":"Golestan","addressCountry":"IR"},
    "knowsLanguage":["Persian"],"sameAs":resumeData.social.filter(x=>external(x.url)).map(x=>x.url),
    "alumniOf": resumeData.education.map(e => ({"@type":"CollegeOrUniversity","name":val(e.institution)})),
    "worksFor": resumeData.experience.map(e => ({"@type":"Organization","name":val(e.company)})),
    "knowsAbout": resumeData.skills.map(s => val(s))
  };
  $("personSchema").textContent = JSON.stringify(person);
  $("websiteSchema").textContent = JSON.stringify({
    "@context":"https://schema.org","@type":"WebSite","name":"Abolfazl Yazdi","alternateName":"ابوالفضل یزدی",
    "url":resumeData.siteUrl,"inLanguage":isEnglish?"en":"fa"
  });
}

$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  localStorage.setItem("theme", light ? "light" : "dark");
  $("themeToggle").setAttribute("aria-pressed", String(light));
});
if (localStorage.getItem("theme")==="light") {
  document.body.classList.add("light");
  $("themeToggle").setAttribute("aria-pressed","true");
}

// Mobile nav toggle
const menuToggle = $("menuToggle");
const mainNav = $("mainNav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

// Preserve current section hash when switching language
const langSwitch = $("langSwitch");
if (langSwitch && location.hash) {
  langSwitch.href = langSwitch.getAttribute("href") + location.hash;
}

render();
