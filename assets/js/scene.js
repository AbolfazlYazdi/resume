/* scene.js v3
   1) shows a toggle button; the 3D scene (Three.js) loads only after it is pressed
   2) optional real models: assets/models/gpu.glb, laptop.glb, pc.glb */
(() => {
  const en = document.documentElement.lang === "en";
  const FX = "ay_fx";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 700;
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- 2) Toggle button ---------- */
  const st = document.createElement("style");
  st.textContent = "#scene3d{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}" +
    "body.fx main,body.fx .footer{position:relative;z-index:1}" +
    "#fxToggle{position:fixed;bottom:20px;inset-inline-start:20px;z-index:50;padding:11px 16px;border-radius:14px;border:1px solid var(--line,rgba(255,255,255,.18));background:var(--surface,rgba(17,23,40,.85));color:var(--text,#fff);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;backdrop-filter:blur(14px);box-shadow:0 10px 30px rgba(0,0,0,.3);transition:.2s}" +
    "#fxToggle:hover{transform:translateY(-2px);border-color:var(--accent,#7c5cff)}" +
    "#fxToggle.on{background:linear-gradient(135deg,#7c5cff,#25d0c7);color:#fff;border-color:transparent}" +
    "@media print{#fxToggle,#scene3d{display:none!important}}" +
    ".grid-bg{display:none!important}";
  document.head.appendChild(st);
  const btn = document.createElement("button");
  btn.id = "fxToggle"; btn.type = "button";
  const setBtn = on => {
    btn.classList.toggle("on", on); btn.setAttribute("aria-pressed", on);
    btn.textContent = "✦ " + (en ? (on ? "Disable 3D animation" : "Enable 3D animation") : (on ? "غیرفعال کردن انیمیشن سه‌بعدی" : "فعال‌سازی انیمیشن سه‌بعدی"));
  };
  setBtn(false); document.body.appendChild(btn);

  const load = src => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  let api = null, loading = false;
  async function turnOn() {
    if (loading) return; loading = true;
    btn.textContent = en ? "Loading…" : "در حال بارگذاری…";
    try {
      if (!api) {
        if (!window.THREE) await load("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
        if (!THREE.GLTFLoader) { try { await load("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"); } catch (e) {} }
        api = makeScene(THREE);
      }
      api.start(); document.body.classList.add("fx"); ss.set(FX, "1"); setBtn(true);
    } catch (e) {
      console.error(e); setBtn(false); btn.textContent = en ? "3D is not supported here" : "مرورگر از سه‌بعدی پشتیبانی نمی‌کند";
    }
    loading = false;
  }
  function turnOff() { if (api) api.stop(); document.body.classList.remove("fx"); ss.set(FX, "0"); setBtn(false); }
  btn.addEventListener("click", () => (btn.classList.contains("on") ? turnOff() : turnOn()));
  if (ss.get(FX) === "1") turnOn();

  /* ---------- 3) The scene ---------- */
  function makeScene(T) {
    const rnd = Math.random;
    const canvas = document.createElement("canvas");
    canvas.id = "scene3d"; canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 11);
    scene.add(new T.AmbientLight(0xffffff, 0.5), new T.HemisphereLight(0xffffff, 0x222233, 0.6));
    const l1 = new T.PointLight(0x7c5cff, 2.4, 40); l1.position.set(-5, 4, 6);
    const l2 = new T.PointLight(0x25d0c7, 2.4, 40); l2.position.set(6, -3, 5);
    scene.add(l1, l2);
    const rig = new T.Group(); scene.add(rig);

    /* soft glow */
    const gc = document.createElement("canvas"); gc.width = gc.height = 128;
    const gx = gc.getContext("2d"), gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
    const glow = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(gc), color: 0x6a5cff, transparent: true, opacity: 0.28, blending: T.AdditiveBlending, depthWrite: false }));
    glow.scale.set(11, 11, 1); glow.position.set(0, 0, -2); rig.add(glow);

    /* ----- Globe network (internet) ----- */
    const globe = new T.Group(); globe.position.set(0, 0, -1.5); rig.add(globe);
    const R = 3.8;
    const wireM = new T.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.07 });
    globe.add(new T.Mesh(new T.IcosahedronGeometry(R, 3), wireM));
    const NN = mobile ? 70 : 130, nodes = [], np = [];
    for (let i = 0; i < NN; i++) {
      const y = 1 - (2 * (i + 0.5)) / NN, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      const v = new T.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R); nodes.push(v); np.push(v.x, v.y, v.z);
    }
    const ng = new T.BufferGeometry(); ng.setAttribute("position", new T.Float32BufferAttribute(np, 3));
    const nodeM = new T.PointsMaterial({ color: 0x25d0c7, size: 0.06, transparent: true, opacity: 0.85 });
    globe.add(new T.Points(ng, nodeM));
    const arcs = [], AC = mobile ? 8 : 15;
    for (let i = 0; i < AC; i++) {
      const a = nodes[Math.floor(rnd() * NN)], b = nodes[Math.floor(rnd() * NN)];
      const m = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.2 + rnd() * 0.3));
      const cu = new T.QuadraticBezierCurve3(a, m, b);
      globe.add(new T.Line(new T.BufferGeometry().setFromPoints(cu.getPoints(36)), new T.LineBasicMaterial({ color: i % 2 ? 0x25d0c7 : 0x7c5cff, transparent: true, opacity: 0.35 })));
      arcs.push({ cu, t: rnd(), v: 0.003 + rnd() * 0.004 });
    }
    const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(AC * 3), 3));
    const pktM = new T.PointsMaterial({ color: 0xffffff, size: 0.16, transparent: true });
    globe.add(new T.Points(pg, pktM));

    /* ----- Code ring orbiting the GPU ----- */
    const code = ["#include <iostream>", "int main() {", "std::vector<int> v{1,2,3};", "for (auto x : v) std::cout << x;", "return 0; }",
      "def train(model, data):", "for epoch in range(100):", "loss = model.fit(data)", "import socket", "s.connect(('8.8.8.8', 53))",
      "ping -c 4 google.com", "nvidia-smi", "while True: render()", "git commit -m 'ship it'", "npm run build"];
    const row = code.join("   ·   ");
    const rc = document.createElement("canvas"); rc.width = 2048; rc.height = 170;
    const rx = rc.getContext("2d"), ringTex = new T.CanvasTexture(rc);
    const drawRing = light => {
      rx.clearRect(0, 0, 2048, 170); rx.font = "26px monospace";
      for (let r = 0; r < 4; r++) {
        rx.fillStyle = light ? (r % 2 ? "rgb(76,48,214)" : "rgb(6,112,106)") : (r % 2 ? "rgba(165,148,255,.95)" : "rgba(37,208,199,.95)");
        rx.fillText(row.slice(r * 40, r * 40 + 130), 0, 34 + r * 42);
      }
    };
    drawRing(false);
    const ringTilt = new T.Group(); ringTilt.position.set(0, 0.2, 0.4); ringTilt.rotation.set(0.38, 0, -0.1); rig.add(ringTilt);
    const ring = new T.Mesh(new T.CylinderGeometry(3.3, 3.3, 0.9, 96, 1, true), new T.MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false }));
    ringTilt.add(ring);

    /* ----- GPU (hero object) ----- */
    const gpu = new T.Group();
    const dark = new T.MeshStandardMaterial({ color: 0x151a2e, metalness: 0.85, roughness: 0.3 });
    gpu.add(new T.Mesh(new T.BoxGeometry(4.4, 1.25, 0.5), dark));
    const pcb = new T.Mesh(new T.BoxGeometry(4.4, 1, 0.06), new T.MeshStandardMaterial({ color: 0x0b3d2e, roughness: 0.6 })); pcb.position.set(0, -0.1, -0.3); gpu.add(pcb);
    const gold = new T.Mesh(new T.BoxGeometry(2, 0.13, 0.06), new T.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.3 })); gold.position.set(-0.6, -0.7, -0.3); gpu.add(gold);
    const fans = [];
    [-1.45, 0, 1.45].forEach(x => {
      const f = new T.Group(); f.position.set(x, 0, 0.26);
      f.add(new T.Mesh(new T.TorusGeometry(0.48, 0.035, 8, 32), new T.MeshStandardMaterial({ color: 0x25d0c7, emissive: 0x25d0c7, emissiveIntensity: 0.7 })));
      const hub = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.06, 16), dark); hub.rotation.x = Math.PI / 2; f.add(hub);
      const sp = new T.Group();
      for (let i = 0; i < 9; i++) {
        const pv = new T.Group(); pv.rotation.z = (i * Math.PI * 2) / 9;
        const b = new T.Mesh(new T.BoxGeometry(0.38, 0.13, 0.02), new T.MeshStandardMaterial({ color: 0x2a3050, metalness: 0.6, roughness: 0.4 }));
        b.position.x = 0.28; b.rotation.x = 0.5; pv.add(b); sp.add(pv);
      }
      f.add(sp); fans.push(sp); gpu.add(f);
    });
    const rgb = new T.Mesh(new T.BoxGeometry(4.4, 0.05, 0.05), new T.MeshBasicMaterial({ color: 0x7c5cff })); rgb.position.set(0, 0.63, 0.22); gpu.add(rgb);
    gpu.position.set(0, 0.25, 1); rig.add(gpu);

    /* ----- Laptop (code on screen) ----- */
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 325;
    const cg = cv.getContext("2d"), ctex = new T.CanvasTexture(cv);
    let sc = 0, lastDraw = 0;
    const drawCode = now => {
      if (now - lastDraw < 90) return; lastDraw = now;
      cg.fillStyle = "#0a0d1a"; cg.fillRect(0, 0, 512, 325);
      cg.fillStyle = "#151b33"; cg.fillRect(0, 0, 512, 30);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { cg.fillStyle = c; cg.beginPath(); cg.arc(16 + i * 18, 15, 5, 0, 7); cg.fill(); });
      cg.font = "16px monospace"; sc = (sc + 0.7) % (code.length * 24);
      for (let i = 0; i < 14; i++) {
        const idx = (Math.floor(sc / 24) + i) % code.length, y = 30 + i * 24 - (sc % 24) + 20;
        if (y < 40) continue;
        cg.fillStyle = "#3a4166"; cg.fillText(String(idx + 1).padStart(2, " "), 8, y);
        cg.fillStyle = /^(def|import|int|for|while|return|#include|npm|git)/.test(code[idx]) ? "#a594ff" : "#25d0c7"; cg.fillText(code[idx], 44, y);
      }
      ctex.needsUpdate = true;
    };
    drawCode(1000);
    const lap = new T.Group();
    const alu = new T.MeshStandardMaterial({ color: 0x9aa3b8, metalness: 0.9, roughness: 0.3 });
    lap.add(new T.Mesh(new T.BoxGeometry(3.4, 0.12, 2.2), alu));
    const kb = new T.Mesh(new T.PlaneGeometry(2.8, 1.1), new T.MeshStandardMaterial({ color: 0x0d1020, roughness: 0.8 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.065, -0.2); lap.add(kb);
    const hinge = new T.Group(); hinge.position.set(0, 0.06, -1.1); hinge.rotation.x = -0.25;
    const lid = new T.Mesh(new T.BoxGeometry(3.4, 2.2, 0.08), alu); lid.position.y = 1.1; hinge.add(lid);
    const scr = new T.Mesh(new T.PlaneGeometry(3.15, 2), new T.MeshBasicMaterial({ map: ctex })); scr.position.set(0, 1.1, 0.045); hinge.add(scr);
    lap.add(hinge); lap.position.set(-4.3, -1.9, 0.6); lap.rotation.y = 0.55; lap.scale.setScalar(0.62); rig.add(lap);

    /* ----- PC tower ----- */
    const tw = new T.Group();
    tw.add(new T.Mesh(new T.BoxGeometry(1.5, 3.1, 1.7), dark));
    const glass = new T.Mesh(new T.PlaneGeometry(1.7, 2.9), new T.MeshStandardMaterial({ color: 0x25d0c7, transparent: true, opacity: 0.14, metalness: 1, roughness: 0.1 })); glass.rotation.y = -Math.PI / 2; glass.position.x = -0.76; tw.add(glass);
    const rings = [0x7c5cff, 0x25d0c7, 0xff4fa3].map((c, i) => { const r = new T.Mesh(new T.TorusGeometry(0.36, 0.05, 8, 24), new T.MeshBasicMaterial({ color: c })); r.position.set(0, 0.9 - i * 0.9, 0.86); tw.add(r); return r; });
    tw.position.set(4.4, -1.4, 0.2); tw.rotation.y = -0.55; tw.scale.setScalar(0.62); rig.add(tw);

    /* ----- Optional real models ----- */
    if (T.GLTFLoader) {
      const dir = (en ? "../" : "") + "assets/models/", loader = new T.GLTFLoader();
      [["gpu", gpu, 4.4], ["laptop", lap, 3.4], ["pc", tw, 3.1]].forEach(([name, grp, size]) => {
        loader.load(dir + name + ".glb", g => {
          const m = g.scene, box = new T.Box3().setFromObject(m), sz = box.getSize(new T.Vector3());
          m.scale.setScalar(size / Math.max(sz.x, sz.y, sz.z));
          box.setFromObject(m); m.position.sub(box.getCenter(new T.Vector3()));
          const h = new T.Group(); h.add(m);
          while (grp.children.length) grp.remove(grp.children[0]);
          grp.add(h);
        }, undefined, () => {});
      });
    }

    /* ----- Dust ----- */
    const dp = []; for (let i = 0; i < (mobile ? 70 : 150); i++) dp.push((rnd() - 0.5) * 22, (rnd() - 0.5) * 12, -7 + rnd() * 10);
    const dg = new T.BufferGeometry(); dg.setAttribute("position", new T.Float32BufferAttribute(dp, 3));
    const dustM = new T.PointsMaterial({ color: 0x8e7cff, size: 0.035, transparent: true, opacity: 0.5 });
    scene.add(new T.Points(dg, dustM));

    /* ----- Layout / interaction ----- */
    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      rig.scale.setScalar(Math.min(1, Math.max(0.5, camera.aspect * 0.62)));
      camera.updateProjectionMatrix();
    }
    addEventListener("resize", resize); resize();
    let mx = 0, my = 0, running = false, raf = 0;
    addEventListener("pointermove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

    let curLight = null;
    function applyTheme(light) {
      curLight = light;
      wireM.color.setHex(light ? 0x4a35d6 : 0x7c5cff); wireM.opacity = light ? 0.18 : 0.07;
      nodeM.color.setHex(light ? 0x0b7f79 : 0x25d0c7); nodeM.size = light ? 0.085 : 0.06; nodeM.opacity = light ? 1 : 0.85;
      pktM.color.setHex(light ? 0x151a3a : 0xffffff);
      dustM.color.setHex(light ? 0x4a35d6 : 0x8e7cff); dustM.opacity = light ? 0.7 : 0.5;
      globe.children.filter(o => o.isLine).forEach((o, i) => {
        o.material.color.setHex(i % 2 ? (light ? 0x0b7f79 : 0x25d0c7) : (light ? 0x4a35d6 : 0x7c5cff));
        o.material.opacity = light ? 0.7 : 0.35;
      });
      glow.material.blending = light ? T.NormalBlending : T.AdditiveBlending;
      glow.material.color.setHex(light ? 0xa99cff : 0x6a5cff); glow.material.opacity = light ? 0.3 : 0.28; glow.material.needsUpdate = true;
      drawRing(light); ringTex.needsUpdate = true;
    }
    function frame(now) {
      if (!running) return;
      const t = now / 1000, p = Math.min(scrollY / innerHeight, 1.5);
      const light = document.body.classList.contains("light"); if (light !== curLight) applyTheme(light);
      canvas.style.opacity = String(Math.max(0.15, (light ? 0.85 : 0.75) - p * 0.6));
      camera.position.x += (mx * 1.0 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.6 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      rig.rotation.y += (p * 0.6 - rig.rotation.y) * 0.05;
      rig.position.y = p * 1.2;
      globe.rotation.y = t * 0.07; globe.rotation.x = 0.2;
      ring.rotation.y = -t * 0.18;
      arcs.forEach((a, i) => { a.t = (a.t + a.v) % 1; const q = a.cu.getPoint(a.t); pg.attributes.position.setXYZ(i, q.x, q.y, q.z); });
      pg.attributes.position.needsUpdate = true;
      gpu.position.set(1.6 * Math.sin(t * 0.35), 0.25 + 0.3 * Math.sin(t * 0.5 + 1), 1 + 0.6 * Math.sin(t * 0.27));
      gpu.rotation.set(0.1 + Math.sin(t * 0.5) * 0.08, Math.sin(t * 0.4) * 0.6 + gpu.position.x * 0.1, Math.sin(t * 0.3) * 0.08);
      const la = t * 0.22, ta = t * 0.17 + Math.PI;
      lap.position.set(4.8 * Math.cos(la), -2.2 + 0.4 * Math.sin(t * 0.6), -0.5 + 2.5 * Math.sin(la));
      lap.rotation.y = -lap.position.x * 0.12 + Math.sin(t * 0.5) * 0.3;
      tw.position.set(5.2 * Math.cos(ta), -1.7 + 0.4 * Math.sin(t * 0.5 + 2), -0.5 + 2.5 * Math.sin(ta));
      tw.rotation.y = -tw.position.x * 0.12 - 0.4 + Math.sin(t * 0.4) * 0.3;
      
      fans.forEach(f => (f.rotation.z -= 0.13)); rings.forEach(r => (r.rotation.z += 0.05));
      rgb.material.color.setHSL((t * 0.1) % 1, 0.9, 0.6);
      drawCode(now);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    return {
      start() {
        running = true; canvas.style.display = "block"; resize(); applyTheme(document.body.classList.contains("light"));
        if (reduce) { canvas.style.opacity = "0.7"; renderer.render(scene, camera); } else raf = requestAnimationFrame(frame);
      },
      stop() { running = false; cancelAnimationFrame(raf); canvas.style.display = "none"; }
    };
  }
})();
