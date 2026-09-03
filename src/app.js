// =========================
// 0. إعدادات أولية قبل DOM
// =========================

gsap.set(
  ".row-one h1, .row-two h1, .routat-image, .column-hero, .hero-team, .row-two a",
  { visibility: "visible" }
);
gsap.set(".hidden-on-load", { visibility: "visible" });

// استعادة الثيم المخزن (تم بالفعل في HTML، لكن للتأكيد)
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  document.documentElement.classList.add("dark");
}

// =========================
// MAIN (بعد تحميل DOM)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // ------------------------- 1. دخول النافبار -------------------------
  const navTl = gsap.timeline();
  navTl
    .from(".navbar", { y: -80, opacity: 0, duration: 1, ease: "expo.out" })
    .from(".nav-logo img", { scale: 0.6, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.6")
    .from(".nav-links li", { y: -20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.4")
    .from(".nav-actions > *", { x: -25, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.5");

  // ------------------------- 2. تأثير التمرير على النافبار -------------------------
  ScrollTrigger.create({
    trigger: document.body,
    start: "top -50",
    onUpdate: (self) => {
      if (self.progress > 0) {
        gsap.to(".navbar", {
          height: "70px",
          backgroundColor: "var(--bgColor)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          duration: 0.4,
          overwrite: "auto",
        });
      } else {
        gsap.to(".navbar", {
          height: "90px",
          backgroundColor: "transparent",
          backdropFilter: "blur(0px)",
          boxShadow: "none",
          duration: 0.4,
          overwrite: "auto",
        });
      }
    },
  });

  // ------------------------- 3. Hover على روابط النافبار -------------------------
  gsap.utils.toArray(".nav-links a").forEach((link) => {
    const hoverTl = gsap.timeline({ paused: true });
    hoverTl.to(link, { y: -3, duration: 0.25, ease: "power2.out" });
    link.addEventListener("mouseenter", () => hoverTl.play());
    link.addEventListener("mouseleave", () => hoverTl.reverse());
  });

  // ------------------------- 4. القسم الثابت (قوائم + كروت) -------------------------
  const listItems = gsap.utils.toArray(".list li");
  const cards = gsap.utils.toArray(".card-wrapper");
  const segmentEls = document.querySelectorAll(".indicator-segment");

  segmentEls.forEach((seg) => {
    const inner = document.createElement("div");
    inner.style.cssText = `
      position:absolute; top:0; left:0;
      width:100%; height:100%;
      background:var(--mainColor);
      transform:scaleY(0); transform-origin:top;
      will-change:transform; border-radius:2px;
    `;
    seg.style.position = "relative";
    seg.appendChild(inner);
  });

  const segFills = document.querySelectorAll(".indicator-segment div");

  gsap.set(cards, { autoAlpha: 0, y: 50 });
  gsap.set(listItems, { opacity: 0.15, x: 0, color: "var(--textWhy)" });
  gsap.set(segFills, { scaleY: 0 });

  const STEP = 1,
    IN_DUR = 0.35,
    OUT_DUR = 0.28,
    HOLD = 0.45,
    SEG_DUR = 0.4;

  const scrollTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".pin-section",
      start: "top top",
      end: `+=${listItems.length * 100}%`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  listItems.forEach((item, i) => {
    const t = i * STEP;
    scrollTl.to(segFills[i], { scaleY: 1, duration: SEG_DUR, ease: "power2.inOut" }, t);
    scrollTl.to(item, { opacity: 1, x: 15, color: "var(--mainColor)", duration: IN_DUR, ease: "power2.out" }, t);
    scrollTl.to(cards[i], { autoAlpha: 1, y: 0, duration: IN_DUR, ease: "power3.out" }, t);
    if (i > 0) {
      scrollTl.to(listItems[i - 1], { opacity: 0.15, x: 0, color: "var(--textWhy)", duration: OUT_DUR, ease: "power2.in" }, t);
      scrollTl.to(cards[i - 1], { autoAlpha: 0, y: -45, duration: OUT_DUR, ease: "power2.in" }, t);
    }
    scrollTl.to({}, { duration: HOLD }, t + IN_DUR);
  });
  scrollTl.to({}, { duration: STEP * 0.5 });
});

// =========================
// 5. أنيميشن القسم الرئيسي (Hero)
// =========================
const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.2 } });
tl.from(".hero-section", { opacity: 0, duration: 0.5 })
  .from(".hero-team", { y: 20, opacity: 0 }, "-=0.5")
  .from(".row-one h1", { y: 50, opacity: 0, skewY: 5 }, "-=0.8")
  .from(".routat-image", { x: 100, rotation: -90, opacity: 0 }, "-=1")
  .from(".row-two h1", { scale: 0.8, opacity: 0 }, "-=1")
  .fromTo(
    ".row-two a",
    { scale: 0.8, opacity: 0, visibility: "hidden", y: 20 },
    {
      scale: 1,
      opacity: 1,
      visibility: "visible",
      y: 0,
      duration: 1.5,
      ease: "expo.out",
      clearProps: "transform",
    },
    "-=1"
  )
  .from(".column-one, .column-two, .column-three", { y: 40, opacity: 0, stagger: 0.2 }, "-=0.5")
  .from(
    ".column-one::after, .column-three div:first-child a::after",
    { scaleY: 0, scaleX: 0, duration: 1, stagger: 0.3 },
    "-=0.5"
  );

// =========================
// 6. تبديل الوضع (داكن / فاتح) - متوافق مع HTML
// =========================
window.toggleMode = function () {
  const body = document.body;
  const html = document.documentElement;
  body.classList.toggle("dark");
  html.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // تحديث ScrollTrigger
  ScrollTrigger.refresh();

  // تحديث خلفية Three.js الجزيئية (إن وجدت)
  if (window.updateThreeTheme) window.updateThreeTheme(isDark);

  // تحديث مسار SVG وجميع العناصر الديناميكية
  if (window.recomputeThresholds) window.recomputeThresholds();
  if (window.progressTrigger) window.progressTrigger.refresh();

  // تحديث ألوان دوائر SVG
  document.querySelectorAll(".dash-triple-group circle").forEach((c) => {
    c.setAttribute("fill", "var(--mainColor)");
    c.setAttribute("stroke", "var(--bgColor)");
  });
  const svgRoot = document.querySelector(".journey-svg");
  if (svgRoot) {
    svgRoot.style.opacity = "0.999";
    setTimeout(() => (svgRoot.style.opacity = ""), 30);
  }
};

// =========================
// 7. تأثير WebGL Fluid (مياه) مع تعديلات الأداء
// =========================
(function () {
  const cursorDot = document.getElementById("cursor");
  const cursorRing = document.getElementById("cursor-ring");
  if (!cursorDot || !cursorRing) return;

  let mouseX = -100,
    mouseY = -100;
  let ringX = -100,
    ringY = -100;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor() {
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  const container = document.getElementById("water-container");
  if (!container) return;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);

  const simRes = 0.55;
  let simWidth = Math.round(window.innerWidth * simRes);
  let simHeight = Math.round(window.innerHeight * simRes);
  const isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);
  const rtOptions = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: isIOS ? THREE.HalfFloatType : THREE.FloatType,
    format: THREE.RGBAFormat,
    depthBuffer: false,
  };

  let fboA = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
  let fboB = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
  let fboC = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
  let prev = fboA,
    curr = fboB,
    next = fboC;

  // شادر إسقاط القطرة
  const dropMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tCurrent: { value: null },
      p1: { value: new THREE.Vector2() },
      p2: { value: new THREE.Vector2() },
      radius: { value: 0.052 },
      strength: { value: 0.007 },
      aspect: { value: window.innerWidth / window.innerHeight },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tCurrent;
      uniform vec2 p1, p2;
      uniform float radius, strength, aspect;
      varying vec2 vUv;
      float segDist(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
        return length(pa - ba * h);
      }
      void main() {
        vec4 st = texture2D(tCurrent, vUv);
        vec2 uv = vUv;
        uv.x *= aspect;
        vec2 a = p1;
        a.x *= aspect;
        vec2 b = p2;
        b.x *= aspect;
        float d = segDist(uv, a, b);
        float drop = smoothstep(radius, radius * 0.12, d);
        gl_FragColor = vec4(st.r + drop * strength, 0.0, 0.0, 1.0);
      }
    `,
  });

  // شادر محاكاة الموجة
  const simMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tCurrent: { value: null },
      tPrevious: { value: null },
      texelSize: { value: new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight) },
      damping: { value: 0.992 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tCurrent, tPrevious;
      uniform vec2 texelSize;
      uniform float damping;
      varying vec2 vUv;
      void main() {
        float c = texture2D(tCurrent, vUv).r;
        float p = texture2D(tPrevious, vUv).r;
        float t = texture2D(tCurrent, vUv + vec2(0.0, texelSize.y)).r;
        float b = texture2D(tCurrent, vUv + vec2(0.0, -texelSize.y)).r;
        float l = texture2D(tCurrent, vUv + vec2(-texelSize.x, 0.0)).r;
        float r = texture2D(tCurrent, vUv + vec2(texelSize.x, 0.0)).r;
        float laplacian = (t + b + l + r) - 4.0 * c;
        float nx = (c * 2.0 - p + laplacian * 0.132) * damping;
        gl_FragColor = vec4(nx, 0.0, 0.0, 1.0);
      }
    `,
  });

  // شادر العرض النهائي
  const displayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      tWater: { value: null },
      texelSize: { value: new THREE.Vector2(1.0 / simWidth, 1.0 / simHeight) },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D tWater;
      uniform vec2 texelSize;
      varying vec2 vUv;
      void main() {
        float c = texture2D(tWater, vUv).r;
        float t2 = texture2D(tWater, vUv + vec2(0.0, texelSize.y * 1.5)).r;
        float b2 = texture2D(tWater, vUv + vec2(0.0, -texelSize.y * 1.5)).r;
        float l2 = texture2D(tWater, vUv + vec2(-texelSize.x * 1.5, 0.0)).r;
        float r2 = texture2D(tWater, vUv + vec2(texelSize.x * 1.5, 0.0)).r;
        vec3 dx = vec3(texelSize.x * 48.0, 0.0, r2 - l2);
        vec3 dy = vec3(0.0, texelSize.y * 48.0, t2 - b2);
        vec3 normal = normalize(cross(dx, dy));
        vec3 lightDir = normalize(vec3(0.45, 0.65, 0.55));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        vec3 colorBase = vec3(0.262, 0.196, 0.133);
        vec3 colorMid = vec3(0.345, 0.255, 0.180);
        vec3 colorSpec = vec3(0.545, 0.425, 0.315);
        float wave = abs(c);
        float waveAmp = clamp(wave * 6.5, 0.0, 1.0);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(clamp(dot(normal, halfDir), 0.0, 1.0), 36.0) * 0.35;
        float rim = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 2.8) * 0.45;
        vec3 finalColor = mix(colorBase, colorMid, waveAmp);
        finalColor += spec * wave * 1.6 * colorSpec;
        finalColor += rim * wave * 1.1 * colorMid;
        float alpha = clamp(waveAmp * 0.85 + spec * 0.25, 0.0, 0.38);
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
  });

  const waterMesh = new THREE.Mesh(geometry, displayMaterial);
scene.add(waterMesh);

// إلغاء wavePoints نهائياً
let autoTimers = [];
let idleTimer = null;
let isAutoModeActive = false;

// متغيرات المصدر المتجول مع استيفاء سلس
let movingUv = { x: 0.5, y: 0.5 };
let targetUv = { x: 0.5, y: 0.5 };
let lastTimestamp = 0;

function applyCircularDrop(uvX, uvY, strengthVal, radiusVal) {
  if (!curr || !next) return;
  dropMaterial.uniforms.tCurrent.value = curr.texture;
  dropMaterial.uniforms.p1.value.set(uvX, uvY);
  dropMaterial.uniforms.p2.value.set(uvX, uvY);
  dropMaterial.uniforms.radius.value = radiusVal;
  dropMaterial.uniforms.strength.value = strengthVal;
  dropMaterial.uniforms.aspect.value = window.innerWidth / window.innerHeight;
  renderer.setRenderTarget(next);
  waterMesh.material = dropMaterial;
  renderer.render(scene, camera);
  let tmp = curr;
  curr = next;
  next = tmp;
}

// تحديث الهدف على مسار لسه جوس ناعم
function updateTargetPosition() {
  let t = performance.now() / 2500; // حركة بطيئة وناعمة
  let x = 0.5 + Math.sin(t * 0.7) * 0.44;
  let y = 0.5 + Math.cos(t * 0.85) * 0.44;
  targetUv.x = Math.min(0.96, Math.max(0.04, x));
  targetUv.y = Math.min(0.96, Math.max(0.04, y));
}

// انزياح سلس للموقع الحالي باتجاه الهدف
function smoothMove() {
  movingUv.x += (targetUv.x - movingUv.x) * 0.08;
  movingUv.y += (targetUv.y - movingUv.y) * 0.08;
}

function generateSmoothWave() {
  if (!isAutoModeActive) return;
  updateTargetPosition();
  smoothMove();
  // قوة وشعاع يتغيرون بتدرج ناعم جداً
  let strengthVal = 0.0068 + Math.sin(performance.now() / 1200) * 0.001;
  let radiusVal = 0.052 + Math.cos(performance.now() / 1400) * 0.007;
  applyCircularDrop(movingUv.x, movingUv.y, strengthVal, radiusVal);
}

function startAutoWaves() {
  if (autoTimers.length) stopAutoWaves();
  isAutoModeActive = true;
  
  // إعادة ضبط المواضع
  movingUv = { x: 0.5, y: 0.5 };
  targetUv = { x: 0.5, y: 0.5 };
  
  // نبدأ بموجة أولى بعد 20ms
  setTimeout(() => {
    if (isAutoModeActive) generateSmoothWave();
  }, 20);
  
  // فاصل زمني صغير جداً (35ms) لسلاسة عالية
  let timer = setInterval(() => {
    if (isAutoModeActive) generateSmoothWave();
  }, 35);
  
  autoTimers.push(timer);
}

function stopAutoWaves() {
  autoTimers.forEach((timer) => clearInterval(timer));
  autoTimers = [];
  isAutoModeActive = false;
}

function resetIdleTimer() {
  if (isAutoModeActive) stopAutoWaves();
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!isAutoModeActive) startAutoWaves();
  }, 2000);
}
  let rawMouse = new THREE.Vector2(-10, -10);
  let slowMouse = new THREE.Vector2(-10, -10);
  let lastSlowMouse = new THREE.Vector2(-10, -10);
  let isMoving = false;
  let moveTimeout;

  window.addEventListener("mousemove", (e) => {
    rawMouse.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
    isMoving = true;
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      isMoving = false;
    }, 100);
    resetIdleTimer();
  });

  function applyMouseDrops() {
    if (!isMoving) return;
    slowMouse.x += (rawMouse.x - slowMouse.x) * 0.038;
    slowMouse.y += (rawMouse.y - slowMouse.y) * 0.038;
    if (lastSlowMouse.distanceTo(slowMouse) > 0.0007) {
      dropMaterial.uniforms.tCurrent.value = curr.texture;
      dropMaterial.uniforms.p1.value.copy(lastSlowMouse);
      dropMaterial.uniforms.p2.value.copy(slowMouse);
      dropMaterial.uniforms.radius.value = 0.046;
      dropMaterial.uniforms.strength.value = 0.0072;
      dropMaterial.uniforms.aspect.value = window.innerWidth / window.innerHeight;
      renderer.setRenderTarget(next);
      waterMesh.material = dropMaterial;
      renderer.render(scene, camera);
      let tmp = curr;
      curr = next;
      next = tmp;
      lastSlowMouse.copy(slowMouse);
    }
  }

  function stepWaveSimulation() {
    simMaterial.uniforms.tCurrent.value = curr.texture;
    simMaterial.uniforms.tPrevious.value = prev.texture;
    renderer.setRenderTarget(next);
    waterMesh.material = simMaterial;
    renderer.render(scene, camera);
    let tmp = prev;
    prev = curr;
    curr = next;
    next = tmp;
  }

  function renderToScreen() {
    displayMaterial.uniforms.tWater.value = curr.texture;
    renderer.setRenderTarget(null);
    waterMesh.material = displayMaterial;
    renderer.render(scene, camera);
  }

  function mainAnimationLoop() {
    requestAnimationFrame(mainAnimationLoop);
    applyMouseDrops();
    stepWaveSimulation();
    renderToScreen();
  }
  mainAnimationLoop();

  resetIdleTimer();
  setTimeout(() => {
    if (!isMoving && !isAutoModeActive) {
      wavePoints.forEach((point) => {
        applyCircularDrop(point.uv.x, point.uv.y, point.strength * 0.8, point.radius * 0.85);
      });
    }
  }, 500);

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    dropMaterial.uniforms.aspect.value = window.innerWidth / window.innerHeight;

    const newSimWidth = Math.round(window.innerWidth * simRes);
    const newSimHeight = Math.round(window.innerHeight * simRes);
    if (newSimWidth !== simWidth || newSimHeight !== simHeight) {
      simWidth = newSimWidth;
      simHeight = newSimHeight;

      // منع تسرب الذاكرة
      [fboA, fboB, fboC].forEach((target) => {
        if (target) {
          target.texture?.dispose();
          target.dispose();
        }
      });

      fboA = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
      fboB = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
      fboC = new THREE.WebGLRenderTarget(simWidth, simHeight, rtOptions);
      prev = fboA;
      curr = fboB;
      next = fboC;

      simMaterial.uniforms.texelSize.value.set(1.0 / simWidth, 1.0 / simHeight);
      displayMaterial.uniforms.texelSize.value.set(1.0 / simWidth, 1.0 / simHeight);

      const clearColor = new THREE.Color(0x000000);
      renderer.setRenderTarget(fboA);
      renderer.setClearColor(clearColor, 0);
      renderer.clear();
      renderer.setRenderTarget(fboB);
      renderer.clear();
      renderer.setRenderTarget(fboC);
      renderer.clear();
      renderer.setRenderTarget(null);
    }
  });
})();

// =========================
// 8. خلفية Three.js الجزيئية + مسار SVG التفاعلي
// =========================
(function () {
  // الخلفية الجزيئية (تظهر فقط إذا وجد عنصر three-canvas)
  const canvas = document.getElementById("three-canvas");
  let particlesMesh, starsMesh, particlesMat, starMat;

  if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 90;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 80;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 45 - 20;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particlesMat = new THREE.PointsMaterial({
      color: 0x433222,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 220;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 90 - 40;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starMat = new THREE.PointsMaterial({ color: 0xe4caae, size: 0.08, transparent: true, opacity: 0.4 });
    starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(starsMesh);

    function animateThree() {
      requestAnimationFrame(animateThree);
      if (particlesMesh) particlesMesh.rotation.y += 0.0006;
      if (particlesMesh) particlesMesh.rotation.x += 0.0003;
      if (starsMesh) starsMesh.rotation.y -= 0.0004;
      renderer.render(scene, camera);
    }
    animateThree();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.updateThreeTheme = function (isDark) {
      if (particlesMat) particlesMat.color.setHex(isDark ? 0xeee7d4 : 0x433222);
      if (starMat) starMat.color.setHex(isDark ? 0xe4caae : 0x907263);
    };
  } else {
    // إذا لم يوجد canvas، نعطي دالة فارغة لتجنب الأخطاء
    window.updateThreeTheme = function () {};
  }

  // ------------------------- مسار SVG والكروت التفاعلية -------------------------
  const container = document.getElementById("triple-groups-container");
  const tripleGroups = [];
  const stationCoords = [
    { cx: 420, cy: 150 }, { cx: 108, cy: 440 }, { cx: 732, cy: 730 },
    { cx: 108, cy: 1020 }, { cx: 732, cy: 1310 }, { cx: 108, cy: 1600 },
    { cx: 732, cy: 1870 }, { cx: 108, cy: 2140 }, { cx: 420, cy: 2450 }
  ];

  // lightweight performance detection for mobile/low-end devices
  const ua = navigator.userAgent || '';
  const isMobileLike = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua) || matchMedia('(pointer:coarse)').matches;
  const lowMemory = ('deviceMemory' in navigator) && navigator.deviceMemory && navigator.deviceMemory < 2;
  const lowPerf = isMobileLike || lowMemory || matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (container) {
    stationCoords.forEach((coord, idx) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "dash-triple-group");
      group.setAttribute("data-station", idx);
      [0, 120, 240].map((d) => d * (Math.PI / 180)).forEach((ang) => {
        const dx = Math.cos(ang) * 58,
          dy = Math.sin(ang) * 58 * 0.7;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", coord.cx + dx);
        circle.setAttribute("cy", coord.cy + dy);
        circle.setAttribute("r", "12");
        circle.setAttribute("fill", "var(--mainColor)");
        circle.setAttribute("stroke", "var(--bgColor)");
        circle.setAttribute("stroke-width", "2");
        // avoid expensive drop-shadow on low perf devices
        if (!lowPerf) circle.style.filter = "drop-shadow(0 0 6px var(--mainColor))";
        group.appendChild(circle);
      });
      container.appendChild(group);
      tripleGroups.push(group);
    });
  }

  const pathLine = document.getElementById("mainPath");
  const journeyWrap = document.getElementById("pathWrap");
  let totalLength = 0;

  const stops = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"].map((id) => ({
    id,
    el: document.getElementById(id),
  }));
  const cards = [...document.querySelectorAll(".card")];
  const SVG_VIEWBOX_H = 2650;
  const stationCy = [150, 440, 730, 1020, 1310, 1600, 1870, 2140, 2450];

  function refreshPath() {
    if (!pathLine) return;
    try {
      totalLength = pathLine.getTotalLength();
      if (totalLength > 0 && isFinite(totalLength)) {
        pathLine.style.strokeDasharray = `${totalLength} ${totalLength}`;
        pathLine.style.strokeDashoffset = totalLength;
      }
    } catch (e) {}
  }

  let dynamicThresholds = new Array(9).fill(0);
  window.recomputeThresholds = function () {
    if (!journeyWrap) return;
    const H = journeyWrap.offsetHeight;
    const vh = window.innerHeight;
    const scrollRange = Math.max(H - vh, 1);
    dynamicThresholds = stationCy.map((cy) => {
      const renderedY = (cy / SVG_VIEWBOX_H) * H;
      const scrollNeeded = renderedY - vh * 0.55;
      return Math.max(0, Math.min(0.98, scrollNeeded / scrollRange));
    });
  };

  let progressTrigger = null;
  // throttle stroke updates via rAF to limit to ~30fps on low perf
  let pendingOffset = null;
  let lastAppliedTs = 0;
  function applyPendingOffset(ts) {
    if (pendingOffset === null) return;
    const now = ts || performance.now();
    // apply at most every 33ms (~30fps) on lowPerf devices, otherwise every frame
    const minDelta = lowPerf ? 33 : 0;
    if (now - lastAppliedTs >= minDelta) {
      if (pathLine && totalLength > 0) pathLine.style.strokeDashoffset = Math.max(0, pendingOffset);
      pendingOffset = null;
      lastAppliedTs = now;
    }
    requestAnimationFrame(applyPendingOffset);
  }

  function initScrollProgress() {
    if (!journeyWrap) return;
    if (progressTrigger) progressTrigger.kill();
    window.recomputeThresholds();
    progressTrigger = ScrollTrigger.create({
      trigger: journeyWrap,
      start: "top top",
      end: "bottom bottom",
      scrub: lowPerf ? 0.9 : 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const prog = Math.min(1, Math.max(0, self.progress));
        if (pathLine && totalLength > 0) {
          // set pending and let rAF apply (throttled on low perf)
          pendingOffset = Math.max(0, totalLength * (1 - prog));
          // kick off rAF loop if not already
          requestAnimationFrame(applyPendingOffset);
        }
        stops.forEach((stop, i) => {
          if (!stop.el) return;
          const thr = dynamicThresholds[i];
          if (prog >= thr && !stop.el.classList.contains("lit")) {
            stop.el.classList.add("lit");
            const tg = tripleGroups[i];
            if (tg && !tg.classList.contains("active")) {
              tg.classList.add("active");
              // on low perf, avoid staggered JS animations; use CSS class only
              if (!lowPerf) {
                gsap.fromTo(tg.children, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, stagger: 0.07, ease: "back.out(1.2)" });
              } else {
                // ensure children are visible via CSS class (lightweight)
                Array.from(tg.children).forEach((c) => c.setAttribute('data-visible','1'));
              }
            }
          }
        });
        cards.forEach((card, i) => {
          const thr = dynamicThresholds[i] + 0.012;
          if (prog >= thr && !card.classList.contains("lit")) {
            card.classList.add("lit");
          }
        });
        if (prog >= 0.94) {
          const last = document.getElementById("s9");
          if (last && !last.classList.contains("final-glow")) {
            last.classList.add("final-glow");
            const innerCircle = last.querySelectorAll("circle")[2];
            if (innerCircle) {
              gsap.to(innerCircle, { scale: 1.08, duration: 0.8, repeat: 2, yoyo: true, ease: "power1.inOut", transformOrigin: "center" });
            }
          }
        }
      },
      onRefresh: () => {
        refreshPath();
        window.recomputeThresholds();
      },
    });
    window.progressTrigger = progressTrigger;
  }

  window.addEventListener("load", () => {
    refreshPath();
    initScrollProgress();
    setTimeout(() => {
      refreshPath();
      window.recomputeThresholds();
      if (progressTrigger) progressTrigger.refresh();
    }, 300);
  });

  window.addEventListener("resize", () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(() => {
      refreshPath();
      window.recomputeThresholds();
      if (progressTrigger) progressTrigger.refresh();
    }, 200);
  });

  // تطبيق الثيم على الخلفية الجزيئية إن وجدت
  const isDarkStored = localStorage.getItem("theme") === "dark";
  if (window.updateThreeTheme) window.updateThreeTheme(isDarkStored);
})();










// faq section
document.querySelectorAll(".accordion-item").forEach((item) => {
  item.querySelector(".accordion-header").addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    // إغلاق أي عنصر آخر مفتوح
    document.querySelectorAll(".accordion-item").forEach((otherItem) => {
      otherItem.classList.remove("active");
    });

    // فتح العنصر الحالي إذا لم يكن مفتوحاً
    if (!isActive) {
      item.classList.add("active");
    }
  });
});

// slider
const content = [
  {
    h: "إرثٌ من الرحمة.. لا يمحوه النسيان",
    p: "ألزهايمر ليس مجرد نسيان، بل هو سارق صامت يمحو هوية الإنسان وتاريخه تدريجياً.",
  },
  {
    h: "رعاية فائقة بالمجان وبكرامة",
    p: "أول صرح خيري متخصص في مصر لرعاية مرضى ألزهايمر بالمجان وبكرامة تامة.",
  },
  {
    h: "نحن هنا لنكون ذاكرتهم",
    p: "نهدف لتخفيف العبء عن الأسر المصرية وتقديم الرعاية الطبية والنفسية المتخصصة.",
  },
];

const container = document.getElementById("slidesContainer");
const pagination = document.getElementById("pagination");
let currentIndex = 1;
let isTransitioning = false;

function initSlider() {
  const firstClone = content[0];
  const lastClone = content[content.length - 1];
  const fullContent = [lastClone, ...content, firstClone];

  fullContent.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "slide";
    div.innerHTML = `<h2>${item.h}</h2><div class="divider"></div><p>${item.p}</p>`;
    container.appendChild(div);

    if (index > 0 && index <= content.length) {
      const dot = document.createElement("div");
      dot.className = `dot ${index === 1 ? "active" : ""}`;
      dot.onclick = () => goToSlide(index);
      pagination.appendChild(dot);
    }
  });
  updatePosition(false);
}

function updatePosition(animate = true) {
  container.style.transition = animate
    ? "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
    : "none";
  container.style.transform = `translateX(${currentIndex * 100}%)`;

  const realIndex =
    currentIndex === 0
      ? content.length - 1
      : currentIndex === content.length + 1
        ? 0
        : currentIndex - 1;

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === realIndex);
  });
}

function handleNext() {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex++;
  updatePosition();
}

function handlePrev() {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex--;
  updatePosition();
}

container.addEventListener("transitionend", () => {
  isTransitioning = false;
  if (currentIndex === content.length + 1) {
    currentIndex = 1;
    updatePosition(false);
  }
  if (currentIndex === 0) {
    currentIndex = content.length;
    updatePosition(false);
  }
});

function goToSlide(index) {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex = index;
  updatePosition();
}

initSlider();
setInterval(handleNext, 5000);


// دالة للتحقق من حالة تسجيل الدخول (مثال)
function isUserLoggedIn() {
    // الطريقة الأكثر أماناً: التحقق عبر خلفية السيرفر (API)
    // لكن كمثال oggedIn() {
  // الطريقة الأكثر أماناً: التحقق عبر خلفية السيرفر (API)
  // لكن كمثال بسيط في الواجهة:

  // الخيار 1: فحص وجود token في localStorage
  const userToken = localStorage.getItem("userToken");

  // الخيار 2: فحص وجود كائن مستخدم في sessionStorage
  const userData = sessionStorage.getItem("userData");

  // الخيار 3: فحص وجود كوكي معين (مثل session cookie)
  // document.cookie.includes('sessionId=')

  return !!(userToken || userData); // ترجع true إذا كان مسجل الدخول
}

// معالجة الضغط على رابط "إرثك"
document.getElementById("heritageLink").addEventListener("click", function (e) {
  e.preventDefault(); // منع السلوك الافتراضي للرابط

  if (isUserLoggedIn()) {
    // إذا كان مسجل الدخول → يذهب للداشبورد
    window.location.href = "./dashboard.html"; // غيري الرابط حسب مسار الداشبورد عندك
  } else {
    // إذا لم يكن مسجل الدخول → يفتح نافذة التسجيل
    openAuthModal(); // استدعاء الدالة الموجودة عندك
  }
});
