const isEnglish = document.documentElement.lang === "en";
const L = isEnglish ? "en" : "fa";
const $ = id => document.getElementById(id);
const val = obj => typeof obj === "object" && obj !== null && obj[L] !== undefined ? obj[L] : obj;
const external = url => url && /^https?:\/\//i.test(url);

// Content is pre-rendered into the HTML by build.js (for SEO). This fallback only runs
// if build.js was not executed after editing data.js.
function renderContent() {
  $("facts").innerHTML = resumeData.facts[L].map(x => `<span class="fact">${x}</span>`).join("");

  $("experienceList").innerHTML = resumeData.experience.map((x,i) => `
    <article class="timeline-item"><div class="timeline-meta"><span>${String(i+1).padStart(2,"0")}</span><span>${val(x.period)}</span></div>
    <h3>${val(x.role)}</h3><h4>${val(x.company)}</h4><p>${val(x.description)}</p></article>`).join("");

  $("educationList").innerHTML = resumeData.education.map((x,i) => `
    <article class="timeline-item"><div class="timeline-meta"><span>${String(i+1).padStart(2,"0")}</span><span>${val(x.period)}</span></div>
    <h3>${val(x.degree)}</h3><h4>${val(x.institution)}</h4><p>${val(x.description)}</p></article>`).join("");

  $("skillsList").innerHTML = resumeData.skills.map((x,i) =>
    `<li class="skill"><span>${String(i+1).padStart(2,"0")}</span><strong>${val(x)}</strong></li>`).join("");

  $("languagesList").innerHTML = resumeData.languages[L].map(x => `<span class="language-pill">${x}</span>`).join("");

  $("projectsList").innerHTML = resumeData.projects.map((x,i) => `
    <article class="project-card"><div class="project-image"><img src="${isEnglish ? "../" : ""}${x.image}" alt="${val(x.title)}" loading="lazy" decoding="async"><span>0${i+1}</span></div>
    <div class="project-body"><small>PROJECT</small><h3>${val(x.title)}</h3><p>${val(x.description)}</p>
    ${external(x.url) ? `<a href="${x.url}" target="_blank" rel="noopener">View project ↗</a>` : ""}</div></article>`).join("");

  $("socialLinks").innerHTML = resumeData.social.filter(x => x.enabled && external(x.url)).map(x =>
    `<a class="social-link" href="${x.url}" target="_blank" rel="me noopener">${x.name} ↗</a>`).join("");

  const contacts = [
    {name: isEnglish ? "Email" : "ایمیل", value: resumeData.email, href: `mailto:${resumeData.email}`},
    {name: isEnglish ? "Phone" : "موبایل", value: resumeData.phone, href: `tel:${resumeData.phone}`}
  ];
  $("contactLinks").innerHTML = contacts.map(x => `<a class="contact-link" href="${x.href}"><small>${x.name}</small>${x.value}</a>`).join("")
    + resumeData.social.filter(x => x.enabled && external(x.url)).map(x => `<a class="contact-link" href="${x.url}" target="_blank" rel="me noopener"><small>${x.name}</small>Profile ↗</a>`).join("");
}

if (document.body.dataset.pr !== "1") renderContent();
$("year").textContent = new Date().getFullYear();

$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
  const light = document.body.classList.contains("light");
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
  $("themeToggle").setAttribute("aria-pressed", String(light));
});
try {
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    $("themeToggle").setAttribute("aria-pressed", "true");
  }
} catch (e) {}

// Mobile nav toggle
const menuToggle = $("menuToggle");
const mainNav = $("mainNav");
if (menuToggle && mainNav) {
  const close = () => { mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); };
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
}

// Keep the current section when switching language
const langSwitch = $("langSwitch");
if (langSwitch) {
  const base = langSwitch.getAttribute("href").split("#")[0];
  const sync = () => { langSwitch.href = base + location.hash; };
  sync(); window.addEventListener("hashchange", sync);
}
