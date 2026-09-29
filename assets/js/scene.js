/* scene.js — 3D hardware scene: GPU + laptop (scrolling code) + PC tower + live network.
   Loads Three.js (r128) from cdnjs by itself. Just add one <script> tag. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 700;
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  s.onload = init;
  document.head.appendChild(s);

  function init() {
    const T = THREE;
    const css = document.createElement("style");
    css.textContent = "#scene3d{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}main,.footer{position:relative;z-index:1}";
    document.head.appendChild(css);
    const canvas = document.createElement("canvas");
    canvas.id = "scene3d";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);

    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    scene.add(new T.AmbientLight(0xffffff, 0.55));
    const pl1 = new T.PointLight(0x7c5cff, 2.2, 40); pl1.position.set(-5, 4, 6);
    const pl2 = new T.PointLight(0x25d0c7, 2.2, 40); pl2.position.set(6, -3, 5);
    scene.add(pl1, pl2);

    const rig = new T.Group();
    scene.add(rig);

    /* ---------- GPU ---------- */
    const gpu = new T.Group();
    const dark = new T.MeshStandardMaterial({ color: 0x14182a, metalness: 0.8, roughness: 0.35 });
    gpu.add(new T.Mesh(new T.BoxGeometry(4.2, 1.3, 0.5), dark));
    const pcb = new T.Mesh(new T.BoxGeometry(4.2, 1.0, 0.06), new T.MeshStandardMaterial({ color: 0x0b3d2e, roughness: 0.6 }));
    pcb.position.set(0, -0.1, -0.3); gpu.add(pcb);
    const gold = new T.Mesh(new T.BoxGeometry(1.8, 0.14, 0.06), new T.MeshStandardMaterial({ color: 0xd4af37, metalness: 1, roughness: 0.3 }));
    gold.position.set(-0.6, -0.72, -0.3); gpu.add(gold);
    const fans = [];
    [-1.1, 1.1].forEach(x => {
      const fan = new T.Group(); fan.position.set(x, 0, 0.27);
      fan.add(new T.Mesh(new T.TorusGeometry(0.52, 0.04, 8, 32), new T.MeshStandardMaterial({ color: 0x25d0c7, emissive: 0x25d0c7, emissiveIntensity: 0.6 })));
      const hub = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.06, 16), dark); hub.rotation.x = Math.PI / 2; fan.add(hub);
      const spin = new T.Group();
      for (let i = 0; i < 7; i++) {
        const p = new T.Group(); p.rotation.z = (i * Math.PI * 2) / 7;
        const b = new T.Mesh(new T.BoxGeometry(0.4, 0.15, 0.02), new T.MeshStandardMaterial({ color: 0x2a3050, metalness: 0.6, roughness: 0.4 }));
        b.position.x = 0.3; b.rotation.x = 0.45; p.add(b); spin.add(p);
      }
      fan.add(spin); fans.push(spin); gpu.add(fan);
    });
    const rgb = new T.Mesh(new T.BoxGeometry(4.2, 0.05, 0.05), new T.MeshBasicMaterial({ color: 0x7c5cff }));
    rgb.position.set(0, 0.67, 0.2); gpu.add(rgb);
    gpu.position.set(0.6, 1.4, 0); gpu.rotation.set(0.15, -0.5, 0.05);
    rig.add(gpu);

    /* ---------- Laptop with scrolling code ---------- */
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 340;
    const cx = cv.getContext("2d");
    const tex = new T.CanvasTexture(cv);
    const code = [
      "#include <iostream>", "int main() {", "  std::vector<int> v = {1,2,3};", "  for (auto x : v) std::cout << x;", "  return 0;", "}",
      "def train(model, data):", "    for epoch in range(100):", "        loss = model.fit(data)", "        print(f'loss={loss:.4f}')",
      "import socket", "s = socket.socket()", "s.connect(('8.8.8.8', 53))", "ping -c 4 google.com", "GPU: RTX | 24GB VRAM",
      "while True: render()", "git commit -m 'ship it'", "npm run build", "sudo apt install nvidia-driver"
    ];
    let scroll = 0, lastDraw = 0;
    function drawCode(t) {
      if (t - lastDraw < 50) return; lastDraw = t;
      cx.fillStyle = "#0a0d1a"; cx.fillRect(0, 0, 512, 340);
      cx.font = "15px monospace"; scroll = (scroll + 0.7) % (code.length * 22);
      for (let i = -1; i < 17; i++) {
        const idx = (Math.floor(scroll / 22) + i + code.length * 2) % code.length;
        const y = i * 22 - (scroll % 22) + 24, line = code[idx];
        cx.fillStyle = /^(def|import|int|for|while|return|#include|sudo|npm|git)/.test(line.trim()) ? "#8e7cff" : "#25d0c7";
        cx.globalAlpha = 0.35 + 0.65 * (y / 340);
        cx.fillText(line, 16, y);
      }
      cx.globalAlpha = 1; tex.needsUpdate = true;
    }
    drawCode(1000);
    const laptop = new T.Group();
    const alu = new T.MeshStandardMaterial({ color: 0x9aa3b8, metalness: 0.9, roughness: 0.3 });
    laptop.add(new T.Mesh(new T.BoxGeometry(3.4, 0.12, 2.2), alu));
    const kb = new T.Mesh(new T.PlaneGeometry(2.8, 1.1), new T.MeshStandardMaterial({ color: 0x0d1020, roughness: 0.8 }));
    kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.065, -0.2); laptop.add(kb);
    const pad = new T.Mesh(new T.PlaneGeometry(0.9, 0.5), new T.MeshBasicMaterial({ color: 0x1a2040 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.066, 0.65); laptop.add(pad);
    const hinge = new T.Group(); hinge.position.set(0, 0.06, -1.1); hinge.rotation.x = -0.25;
    const lid = new T.Mesh(new T.BoxGeometry(3.4, 2.2, 0.08), alu); lid.position.y = 1.1; hinge.add(lid);
    const screen = new T.Mesh(new T.PlaneGeometry(3.15, 2.0), new T.MeshBasicMaterial({ map: tex }));
    screen.position.set(0, 1.1, 0.045); hinge.add(screen);
    laptop.add(hinge);
    laptop.position.set(-0.4, -1.9, 1); laptop.rotation.y = 0.5; laptop.scale.setScalar(0.9);
    rig.add(laptop);

    /* ---------- PC tower ---------- */
    const tower = new T.Group();
    tower.add(new T.Mesh(new T.BoxGeometry(1.5, 3.1, 1.7), dark));
    const glass = new T.Mesh(new T.PlaneGeometry(1.5, 2.9), new T.MeshStandardMaterial({ color: 0x25d0c7, transparent: true, opacity: 0.12, metalness: 1, roughness: 0.1 }));
    glass.rotation.y = -Math.PI / 2; glass.position.set(-0.76, 0, 0); tower.add(glass);
    const towerFans = [];
    [0.9, 0, -0.9].forEach((y, i) => {
      const r = new T.Mesh(new T.TorusGeometry(0.36, 0.05, 8, 24), new T.MeshBasicMaterial({ color: [0x7c5cff, 0x25d0c7, 0xff4fa3][i] }));
      r.position.set(0, y, 0.86); tower.add(r); towerFans.push(r);
    });
    tower.position.set(3.6, -0.3, -2); tower.rotation.y = -0.6;
    rig.add(tower);

    /* ---------- Network ---------- */
    const net = new T.Group(); scene.add(net);
    const N = mobile ? 38 : 80, pos = [];
    for (let i = 0; i < N; i++) pos.push(new T.Vector3((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, -3 - Math.random() * 6));
    const edges = [], lp = [];
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (pos[i].distanceTo(pos[j]) < 4.2) { edges.push([i, j]); lp.push(pos[i].x, pos[i].y, pos[i].z, pos[j].x, pos[j].y, pos[j].z); }
    const lg = new T.BufferGeometry(); lg.setAttribute("position", new T.Float32BufferAttribute(lp, 3));
    net.add(new T.LineSegments(lg, new T.LineBasicMaterial({ color: 0x7c5cff, transparent: true, opacity: 0.28 })));
    const ng = new T.BufferGeometry(); ng.setAttribute("position", new T.Float32BufferAttribute(pos.flatMap(v => [v.x, v.y, v.z]), 3));
    net.add(new T.Points(ng, new T.PointsMaterial({ color: 0x25d0c7, size: 0.14, transparent: true, opacity: 0.9 })));
    const P = mobile ? 14 : 34, pk = [];
    for (let i = 0; i < P; i++) pk.push({ e: Math.floor(Math.random() * edges.length), t: Math.random(), v: 0.004 + Math.random() * 0.008 });
    const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(P * 3), 3));
    net.add(new T.Points(pg, new T.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.95 })));
    function movePackets() {
      const a = pg.attributes.position;
      pk.forEach((p, i) => {
        p.t += p.v;
        if (p.t > 1 || !edges.length) { p.t = 0; p.e = Math.floor(Math.random() * edges.length); }
        const [u, w] = edges[p.e] || [0, 0];
        a.setXYZ(i, pos[u].x + (pos[w].x - pos[u].x) * p.t, pos[u].y + (pos[w].y - pos[u].y) * p.t, pos[u].z + (pos[w].z - pos[u].z) * p.t);
      });
      a.needsUpdate = true;
    }

    /* ---------- Layout / interaction ---------- */
    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      const wide = camera.aspect > 1.1;
      rig.position.x = wide ? -3 : 0;
      rig.scale.setScalar(wide ? 1 : Math.max(0.42, camera.aspect * 0.75));
      camera.updateProjectionMatrix();
      if (reduce) renderer.render(scene, camera);
    }
    addEventListener("resize", resize); resize();

    let mx = 0, my = 0;
    addEventListener("pointermove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

    function frame(now) {
      const t = now / 1000;
      const p = Math.min(scrollY / innerHeight, 1.5);
      canvas.style.opacity = String(Math.max(0.2, 1 - p * 0.7));
      rig.rotation.y += ((mx * 0.5 + p * 0.9) - rig.rotation.y) * 0.05;
      rig.rotation.x += ((my * 0.25) - rig.rotation.x) * 0.05;
      rig.position.y = p * 1.6;
      gpu.position.y = 1.4 + Math.sin(t) * 0.12;
      laptop.position.y = -1.9 + Math.sin(t * 0.8 + 1) * 0.1;
      tower.position.y = -0.3 + Math.sin(t * 0.7 + 2) * 0.1;
      fans.forEach(f => (f.rotation.z -= 0.12));
      towerFans.forEach(f => (f.rotation.z += 0.05));
      rgb.material.color.setHSL((t * 0.1) % 1, 0.9, 0.6);
      net.rotation.y = Math.sin(t * 0.1) * 0.15;
      movePackets(); drawCode(now);
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    if (reduce) renderer.render(scene, camera); else requestAnimationFrame(frame);
  }
})();
