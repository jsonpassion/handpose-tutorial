/* 손끝 튜토리얼 · 인터랙션 */
(function () {
  "use strict";

  /* ── 테마 토글 ── */
  var toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.dataset.theme;
      var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effective = current || (systemDark ? "dark" : "light");
      var next = effective === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ── 스크롤 스파이 (목차 하이라이트) ── */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll("#toc a"));
  var sections = tocLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── 리빌 애니메이션 ── */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ── 로티 로더 (실패 시 슬롯의 정적 SVG 유지) ── */
  function initLottie() {
    if (!window.lottie) return;
    document.querySelectorAll(".lottie-slot[data-lottie]").forEach(function (slot) {
      fetch(slot.dataset.lottie)
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (data) {
          slot.innerHTML = "";
          window.lottie.loadAnimation({
            container: slot,
            renderer: "svg",
            loop: true,
            autoplay: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
            animationData: data
          });
        })
        .catch(function () { /* 정적 SVG 폴백 유지 */ });
    });
  }
  if (window.lottie) initLottie();
  else window.addEventListener("load", initLottie);

  /* ── X-ray 데모 (사람의 눈 / 픽셀 / 관절) ── */
  var xrayScene = document.getElementById("xrayScene");
  var xrayTabs = document.getElementById("xrayTabs");
  var xrayCaption = document.getElementById("xrayCaption");
  var xrayCopy = {
    photo: "<b>사람의 눈.</b> 하나의 “손”으로 인식한다. 컴퓨터가 받는 입력은 다르다.",
    pixel: "<b>픽셀.</b> 300×200 이미지는 숫자 60,000개. 이미지 분류는 배경과 조명까지 포함한 전체에서 패턴을 찾는다.",
    joint: "<b>관절.</b> Vision이 좌표 42개(21관절 × x·y)만 남긴다. 포즈 분류는 이 숫자만 학습한다."
  };
  if (xrayScene && xrayTabs) {
    xrayTabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-mode]");
      if (!btn) return;
      xrayTabs.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b === btn); });
      xrayScene.setAttribute("class", "mode-" + btn.dataset.mode);
      if (xrayCaption) xrayCaption.innerHTML = xrayCopy[btn.dataset.mode] || "";
    });
  }

  /* ── 배경 토글 + 신뢰도 미터 ── */
  var bgTabs = document.getElementById("bgTabs");
  var bgScene = document.getElementById("bgScene");
  var bgData = {
    studio: { pixel: 98, joint: 97,
      pixelSub: "학습 데이터와 같은 배경 — 확신도가 높다.",
      jointSub: "관절 좌표는 배경과 무관하다." },
    cafe: { pixel: 61, joint: 96,
      pixelSub: "학습 때 본 적 없는 배경 — 확신도가 떨어진다.",
      jointSub: "배경이 바뀌어도 관절 좌표는 그대로다." },
    stage: { pixel: 34, joint: 95,
      pixelSub: "본 적 없는 조명 — 사실상 추측에 가깝다.",
      jointSub: "관절이 검출되는 한 결과가 유지된다." }
  };
  if (bgTabs && bgScene) {
    bgTabs.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-bg]");
      if (!btn) return;
      var key = btn.dataset.bg;
      var d = bgData[key];
      if (!d) return;
      bgTabs.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b === btn); });
      bgScene.setAttribute("class", "bg-scene bg-" + key);
      document.getElementById("meterPixelVal").textContent = d.pixel + "%";
      document.getElementById("meterPixelFill").style.width = d.pixel + "%";
      document.getElementById("meterPixelSub").textContent = d.pixelSub;
      document.getElementById("meterJointVal").textContent = d.joint + "%";
      document.getElementById("meterJointFill").style.width = d.joint + "%";
      document.getElementById("meterJointSub").textContent = d.jointSub;
    });
  }

  /* ── 퀴즈 ── */
  document.querySelectorAll(".quiz").forEach(function (quiz) {
    var feedback = quiz.querySelector(".feedback");
    quiz.querySelectorAll(".choices button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var correct = btn.dataset.correct === "true";
        quiz.querySelectorAll(".choices button").forEach(function (b) {
          b.classList.remove("right", "wrong");
          if (b.dataset.correct === "true") b.classList.add("right");
        });
        if (!correct) btn.classList.add("wrong");
        if (feedback) {
          feedback.textContent = correct ? feedback.dataset.right : feedback.dataset.wrong;
          feedback.classList.add("on");
        }
      });
    });
  });

  /* ── 웹캠 21관절 데모 (MediaPipe Hand Landmarker) ── */
  var HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
  ];
  var camStart = document.getElementById("camStart");
  var camStop = document.getElementById("camStop");
  var camVideo = document.getElementById("camVideo");
  var camCanvas = document.getElementById("camCanvas");
  var camStatus = document.getElementById("camStatus");
  var camPlaceholder = document.getElementById("camPlaceholder");
  var camState = { running: false, landmarker: null, stream: null, raf: 0 };

  function setStatus(msg) { if (camStatus) camStatus.textContent = msg || ""; }

  function stopCam() {
    camState.running = false;
    if (camState.raf) cancelAnimationFrame(camState.raf);
    if (camState.stream) {
      camState.stream.getTracks().forEach(function (t) { t.stop(); });
      camState.stream = null;
    }
    if (camVideo) camVideo.srcObject = null;
    if (camCanvas) {
      var ctx = camCanvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, camCanvas.width, camCanvas.height);
    }
    if (camPlaceholder) camPlaceholder.hidden = false;
    if (camStart) camStart.hidden = false;
    if (camStop) camStop.hidden = true;
    setStatus("");
  }

  function drawHands(result) {
    var ctx = camCanvas.getContext("2d");
    camCanvas.width = camVideo.videoWidth || 640;
    camCanvas.height = camVideo.videoHeight || 480;
    ctx.clearRect(0, 0, camCanvas.width, camCanvas.height);
    if (!result || !result.landmarks) return;
    result.landmarks.forEach(function (hand) {
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      HAND_CONNECTIONS.forEach(function (pair) {
        var a = hand[pair[0]], b = hand[pair[1]];
        ctx.beginPath();
        ctx.moveTo(a.x * camCanvas.width, a.y * camCanvas.height);
        ctx.lineTo(b.x * camCanvas.width, b.y * camCanvas.height);
        ctx.stroke();
      });
      hand.forEach(function (pt, i) {
        ctx.beginPath();
        ctx.arc(pt.x * camCanvas.width, pt.y * camCanvas.height, i === 0 ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = "#f05138";
        ctx.fill();
      });
    });
    setStatus(result.landmarks.length
      ? "관절 " + result.landmarks.length * 21 + "개 추적 중 — 이 좌표가 모델의 입력이다"
      : "손을 카메라에 비추면 추적이 시작된다");
  }

  function loop() {
    if (!camState.running) return;
    if (camVideo.readyState >= 2) {
      try {
        var result = camState.landmarker.detectForVideo(camVideo, performance.now());
        drawHands(result);
      } catch (e) { /* 프레임 단위 오류는 무시 */ }
    }
    camState.raf = requestAnimationFrame(loop);
  }

  async function startCam() {
    if (camState.running) return;
    camStart.disabled = true;
    try {
      if (location.protocol === "file:") {
        setStatus("웹캠 데모는 file://에서 동작하지 않는다. 로컬 서버(README 참고)로 열 것.");
        camStart.disabled = false;
        return;
      }
      setStatus("손 인식 모델 다운로드 중 (최초 1회, 수 초)");
      var vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");
      var fileset = await vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      camState.landmarker = await vision.HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      setStatus("카메라 권한 허용 대기 중…");
      camState.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 } }, audio: false
      });
      camVideo.srcObject = camState.stream;
      await camVideo.play();
      camPlaceholder.hidden = true;
      camStart.hidden = true;
      camStop.hidden = false;
      camState.running = true;
      setStatus("손을 카메라에 비추면 추적이 시작된다");
      loop();
    } catch (err) {
      if (err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        setStatus("카메라 권한이 거부되었다. 데모 없이도 튜토리얼은 계속 읽을 수 있다.");
      } else {
        setStatus("데모 시작 실패 (네트워크 또는 브라우저 제한). 튜토리얼은 계속 진행 가능하다.");
      }
      stopCam();
    } finally {
      camStart.disabled = false;
    }
  }

  if (camStart && camVideo && camCanvas) {
    camStart.addEventListener("click", startCam);
    camStop.addEventListener("click", stopCam);
    window.addEventListener("pagehide", stopCam);
  }
})();
