/* scene.js v2 — Hardware + Code + Internet 3D scene (Three.js r128, loaded from cdnjs). */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 700;
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  s.onload = () => {
    const g = document.createElement("script");
    g.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
    g.onload = init; g.onerror = init;
    document.head.appendChild(g);
  };
  document.head.appendChild(s);

  function init() {
    const T = THREE, rnd = Math.random;
    const st = document.createElement("style");
    st.textContent = "#scene3d{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}main,.footer{position:relative;z-index:1}";
    document.head.appendChild(st);
    const canvas = document.createElement("canvas");
    canvas.id = "scene3d"; canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    scene.add(new T.AmbientLight(0xffffff, 0.5));
    const l1 = new T.PointLight(0x7c5cff, 2.4, 40); l1.position.set(-5, 4, 6);
    const l2 = new T.PointLight(0x25d0c7, 2.4, 40); l2.position.set(6, -3, 5);
    scene.add(l1, l2);
    const rig = new T.Group(); scene.add(rig);

    /* glow sprite helper */
    const gc = document.createElement("canvas"); gc.width = gc.height = 128;
    const gx = gc.getContext("2d"), gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
    const gTex = new T.CanvasTexture(gc);
    const glow = (col, size, x, y, z, o) => {
      const sp = new T.Sprite(new T.SpriteMaterial({ map: gTex, color: col, transparent: true, opacity: o, blending: T.AdditiveBlending, depthWrite: false }));
      sp.scale.set(size, size, 1); sp.position.set(x, y, z); rig.add(sp);
    };

    /* code window textures */
    const code = ["#include <iostream>", "int main() {", "  std::vector<int> v{1,2,3};", "  for (auto x : v) std::cout << x;", "  return 0;", "}",
      "def train(model, data):", "    for epoch in range(100):", "        loss = model.fit(data)", "        print(f'loss={loss:.4f}')",
      "import socket", "s = socket.socket()", "s.connect(('8.8.8.8', 53))", "ping -c 4 google.com", "nvidia-smi  # 24GB VRAM",
      "while True: render()", "git commit -m 'ship it'", "npm run build", "sudo apt install nvidia-driver"];
    const kw = /^(def|import|int|for|while|return|#include|sudo|npm|git)/;
    const wins = [];
    function codeTex(w, h, off) {
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d"), tex = new T.CanvasTexture(c), lh = Math.round(h / 13);
      let sc = off * 40;
      const draw = () => {
        g.fillStyle = "#0a0d1a"; g.fillRect(0, 0, w, h);
        g.fillStyle = "#151b33"; g.fillRect(0, 0, w, lh * 1.3);
        ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(lh * 0.7 + i * lh * 0.8, lh * 0.65, lh * 0.22, 0, 7); g.fill(); });
        g.font = Math.round(lh * 0.68) + "px monospace";
        sc = (sc + 0.6) % (code.length * lh);
        for (let i = 0; i < 14; i++) {
          const idx = (Math.floor(sc / lh) + i) % code.length, y = lh * 1.3 + i * lh - (sc % lh) + lh * 0.8;
          if (y < lh * 1.5) continue;
          g.fillStyle = "#3a4166"; g.fillText(String(idx + 1).padStart(2, " "), 6, y);
          g.fillStyle = kw.test(code[idx].trim()) ? "#a594ff" : "#25d0c7"; g.fillText(code[idx], lh * 2.2, y);
        }
        tex.needsUpdate = true;
      };
      draw(); const o = { tex, draw, last: 0 }; wins.push(o); return o;
    }

    /* ---------- Globe: the internet ---------- */
    const globe = new T.Group(); globe.position.set(1.4, 0.2, -3); rig.add(globe);
    const R = 3;
    globe.add(new T.Mesh(new T.IcosahedronGeometry(R, 3), new T.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: 0.1 })));
    const NN = mobile ? 80 : 170, nodes = [], np = [];
    for (let i = 0; i < NN; i++) {
      const y = 1 - (2 * (i + 0.5)) / NN, r = Math.sqrt(1 - y * y), th = i * 2.399963;
      const v = new T.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(R); nodes.push(v); np.push(v.x, v.y, v.z);
    }
    const ngeo = new T.BufferGeometry(); ngeo.setAttribute("position", new T.Float32BufferAttribute(np, 3));
    globe.add(new T.Points(ngeo, new T.PointsMaterial({ color: 0x25d0c7, size: 0.07, transparent: true, opacity: 0.95 })));
    const arcs = [], AC = mobile ? 10 : 24;
    for (let i = 0; i < AC; i++) {
      const a = nodes[Math.floor(rnd() * NN)], b = nodes[Math.floor(rnd() * NN)];
      const m = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.25 + rnd() * 0.5));
      const cu = new T.QuadraticBezierCurve3(a, m, b);
      globe.add(new T.Line(new T.BufferGeometry().setFromPoints(cu.getPoints(36)), new T.LineBasicMaterial({ color: i % 2 ? 0x25d0c7 : 0x7c5cff, transparent: true, opacity: 0.5 })));
      arcs.push({ cu, t: rnd(), v: 0.003 + rnd() * 0.006 });
    }
    const pgeo = new T.BufferGeometry(); pgeo.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(AC * 3), 3));
    globe.add(new T.Points(pgeo, new T.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 1 })));
    glow(0x7c5cff, 11, 1.4, 0.2, -3.5, 0.35);

    /* ---------- GPU ---------- */
    const gpu = new T.Group();
    const dark = new T.MeshStandardMaterial({ color: 0x151a2e, metalness: 0.85, roughness: 0.3 });
    gpu.add(new T.Mesh(new T.BoxGeometry(5, 1.4, 0.55), dark));
    const pcb = new T.Mesh(new T.BoxGeometry(5, 1.1, 0.06), new T.MeshStandardMaterial({ color: 0x0b3d2e, roughness: 0.6 })); pcb.position.set(0, -0.1, -0.32); gpu.add(pcb);
    const gold = new T.Mesh(new T.BoxGeometry(2.2, 0.14, 0.06), new T.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.3 })); gold.position.set(-0.7, -0.78, -0.32); gpu.add(gold);
    const fans = [];
    [-1.65, 0, 1.65].forEach(x => {
      const f = new T.Group(); f.position.set(x, 0, 0.29);
      f.add(new T.Mesh(new T.TorusGeometry(0.55, 0.04, 8, 32), new T.MeshStandardMaterial({ color: 0x25d0c7, emissive: 0x25d0c7, emissiveIntensity: 0.7 })));
      const hub = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.06, 16), dark); hub.rotation.x = Math.PI / 2; f.add(hub);
      const sp = new T.Group();
      for (let i = 0; i < 9; i++) {
        const pv = new T.Group(); pv.rotation.z = (i * Math.PI * 2) / 9;
        const b = new T.Mesh(new T.BoxGeometry(0.42, 0.14, 0.02), new T.MeshStandardMaterial({ color: 0x2a3050, metalness: 0.6, roughness: 0.4 }));
        b.position.x = 0.32; b.rotation.x = 0.5; pv.add(b); sp.add(pv);
      }
      f.add(sp); fans.push(sp); gpu.add(f);
    });
    const rgb = new T.Mesh(new T.BoxGeometry(5, 0.05, 0.05), new T.MeshBasicMaterial({ color: 0x7c5cff })); rgb.position.set(0, 0.71, 0.24); gpu.add(rgb);
    const lc = document.createElement("canvas"); lc.width = 256; lc.height = 48;
    const lx = lc.getContext("2d"); lx.fillStyle = "#151a2e"; lx.fillRect(0, 0, 256, 48); lx.fillStyle = "#25d0c7"; lx.font = "bold 26px monospace"; lx.fillText("ULTRA · 24GB", 14, 33);
    const label = new T.Mesh(new T.PlaneGeometry(1.5, 0.28), new T.MeshBasicMaterial({ map: new T.CanvasTexture(lc) })); label.position.set(1.7, -0.5, 0.29); gpu.add(label);
    gpu.position.set(-1.6, 1.5, 1.2); gpu.rotation.set(0.15, -0.45, 0.05);
    rig.add(gpu); glow(0x25d0c7, 7, -1.6, 1.5, 0.6, 0.3);

    /* ---------- Laptop ---------- */
    const lap = new T.Group();
    const alu = new T.MeshStandardMaterial({ color: 0x9aa3b8, metalness: 0.9, roughness: 0.3 });
    lap.add(new T.Mesh(new T.BoxGeometry(3.4, 0.12, 2.2), alu));
    const kb = new T.Mesh(new T.PlaneGeometry(2.8, 1.1), new T.MeshStandardMaterial({ color: 0x0d1020, roughness: 0.8 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.065, -0.2); lap.add(kb);
    const hinge = new T.Group(); hinge.position.set(0, 0.06, -1.1); hinge.rotation.x = -0.25;
    const lid = new T.Mesh(new T.BoxGeometry(3.4, 2.2, 0.08), alu); lid.position.y = 1.1; hinge.add(lid);
    const ls = new T.Mesh(new T.PlaneGeometry(3.15, 2), new T.MeshBasicMaterial({ map: codeTex(512, 325, 3).tex })); ls.position.set(0, 1.1, 0.045); hinge.add(ls);
    lap.add(hinge); lap.position.set(-0.6, -2.1, 1.4); lap.rotation.y = 0.5; lap.scale.setScalar(0.85); rig.add(lap);

    /* ---------- PC tower ---------- */
    const tw = new T.Group();
    tw.add(new T.Mesh(new T.BoxGeometry(1.5, 3.1, 1.7), dark));
    const glass = new T.Mesh(new T.PlaneGeometry(1.7, 2.9), new T.MeshStandardMaterial({ color: 0x25d0c7, transparent: true, opacity: 0.14, metalness: 1, roughness: 0.1 })); glass.rotation.y = -Math.PI / 2; glass.position.x = -0.76; tw.add(glass);
    const rings = [0x7c5cff, 0x25d0c7, 0xff4fa3].map((c, i) => { const r = new T.Mesh(new T.TorusGeometry(0.36, 0.05, 8, 24), new T.MeshBasicMaterial({ color: c })); r.position.set(0, 0.9 - i * 0.9, 0.86); tw.add(r); return r; });
    tw.position.set(4.6, -0.9, 0); tw.rotation.y = -0.6; rig.add(tw);

    /* ---------- Floating code windows ---------- */
    const panels = [[-4.2, 2.6, -1, 0.35], [4.2, 3, -2, -0.4], [-4.6, -1.2, -0.5, 0.4], [5.6, 1.2, -2.5, -0.3]].map(([x, y, z, ry], i) => {
      const geo = new T.PlaneGeometry(2.6, 1.6), ct = codeTex(384, 240, i + 1);
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ map: ct.tex, transparent: true, opacity: 0.85, side: T.DoubleSide }));
      m.add(new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0x7c5cff })));
      m.position.set(x, y, z); m.rotation.y = ry; rig.add(m); return { m, y, ry };
    });

    /* ---------- Dust ---------- */
    const dp = []; for (let i = 0; i < (mobile ? 120 : 320); i++) dp.push((rnd() - 0.5) * 24, (rnd() - 0.5) * 14, -8 + rnd() * 12);
    const dg = new T.BufferGeometry(); dg.setAttribute("position", new T.Float32BufferAttribute(dp, 3));
    const dust = new T.Points(dg, new T.PointsMaterial({ color: 0x8e7cff, size: 0.04, transparent: true, opacity: 0.6 })); scene.add(dust);

    /* ---------- Real models (optional): assets/models/gpu.glb, laptop.glb, pc.glb ---------- */
    if (T.GLTFLoader) {
      scene.add(new T.HemisphereLight(0xffffff, 0x223, 0.8));
      const dir = (document.documentElement.lang === "en" ? "../" : "") + "assets/models/";
      const loader = new T.GLTFLoader();
      [["gpu", gpu, 5.2], ["laptop", lap, 3.6], ["pc", tw, 3.2]].forEach(([name, grp, size]) => {
        loader.load(dir + name + ".glb", gltf => {
          const m = gltf.scene, box = new T.Box3().setFromObject(m), sz = box.getSize(new T.Vector3());
          m.scale.setScalar(size / Math.max(sz.x, sz.y, sz.z));
          box.setFromObject(m); m.position.sub(box.getCenter(new T.Vector3()));
          const holder = new T.Group(); holder.add(m);
          while (grp.children.length) grp.remove(grp.children[0]);
          grp.add(holder);
        }, undefined, () => {});
      });
    }

    /* ---------- Layout / interaction ---------- */
    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      const wide = camera.aspect > 1.1;
      rig.position.x = wide ? -2.6 : 0;
      rig.scale.setScalar(wide ? 1 : Math.max(0.4, camera.aspect * 0.7));
      camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
    }
    addEventListener("resize", resize); resize();
    let mx = 0, my = 0;
    addEventListener("pointermove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

    function frame(now) {
      const t = now / 1000, p = Math.min(scrollY / innerHeight, 1.5);
      canvas.style.opacity = String(Math.max(0.18, 1 - p * 0.75));
      camera.position.x += (mx * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (-my * 0.9 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      rig.rotation.y += ((mx * 0.25 + p * 0.8) - rig.rotation.y) * 0.05;
      rig.position.y = p * 1.6;
      globe.rotation.y = t * 0.08; globe.rotation.x = 0.25;
      arcs.forEach((a, i) => { a.t = (a.t + a.v) % 1; const q = a.cu.getPoint(a.t); pgeo.attributes.position.setXYZ(i, q.x, q.y, q.z); });
      pgeo.attributes.position.needsUpdate = true;
      gpu.position.y = 1.5 + Math.sin(t) * 0.12; lap.position.y = -2.1 + Math.sin(t * 0.8 + 1) * 0.1; tw.position.y = -0.9 + Math.sin(t * 0.7 + 2) * 0.1;
      fans.forEach(f => (f.rotation.z -= 0.13)); rings.forEach(r => (r.rotation.z += 0.05));
      rgb.material.color.setHSL((t * 0.1) % 1, 0.9, 0.6);
      panels.forEach((q, i) => { q.m.position.y = q.y + Math.sin(t * 0.7 + i * 1.7) * 0.15; q.m.rotation.y = q.ry + Math.sin(t * 0.3 + i) * 0.08; });
      wins.forEach(w => { if (now - w.last > 90) { w.last = now; w.draw(); } });
      dust.rotation.y = t * 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    if (reduce) renderer.render(scene, camera); else requestAnimationFrame(frame);
  }
})();
