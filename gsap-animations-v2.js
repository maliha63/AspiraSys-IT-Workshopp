/* ═══════════════════════════════════════════════════════════════════════
   AspiraSys Workshop — GSAP Advanced Animation Layer v2.0
   ─────────────────────────────────────────────────────────────────────
   DROP-IN ADDON — Does NOT modify HTML, CSS, themes, or existing logic.
   Requires: GSAP 3 + ScrollTrigger + CustomEase (already loaded via CDN)
   Link BEFORE closing </body>:
     <script src="gsap-animations.js"></script>
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Safety: wait for GSAP + DOM ── */
  function boot() {
    if (typeof gsap === "undefined" || !document.body) {
      setTimeout(boot, 60);
      return;
    }
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    CustomEase.create("expo", "M0,0 C0.16,1 0.3,1 1,1");
    CustomEase.create("bounce-soft", "M0,0 C0.34,1.56 0.64,1 1,1");
    init();
  }

  /* ══════════════════════════════════════════════════════════════════
     UTILITY HELPERS
  ══════════════════════════════════════════════════════════════════ */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const isMobile = () => window.innerWidth <= 768;

  /* Inject a <style> block (keep all GSAP inline CSS in JS) */
  function injectCSS(id, css) {
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════════
     MAIN INIT — called after GSAP is ready
  ══════════════════════════════════════════════════════════════════ */
  function init() {

    /* ─────────────────────────────────────────────────────────────
       1. STAGGERED HERO WORD SCRAMBLE
       Targets: .hero-title .plain, .hero-title .orange
       Each word in the title cycles random chars before resolving.
    ───────────────────────────────────────────────────────────── */
    (function heroScramble() {
      const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
      $$(".hero-title span").forEach((span, spanIdx) => {
        const original = span.textContent.trim();
        if (!original) return;
        let frame = 0;
        const totalFrames = 18 + spanIdx * 6;
        const delay = 0.4 + spanIdx * 0.25;

        gsap.delayedCall(delay, function () {
          const interval = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const resolvedCount = Math.floor(progress * original.length);
            span.textContent =
              original.slice(0, resolvedCount) +
              Array.from({ length: original.length - resolvedCount })
                .map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
                .join("");
            if (frame >= totalFrames) {
              clearInterval(interval);
              span.textContent = original;
            }
          }, 40);
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       2. HERO STATS — RADIAL BURST ENTRANCE
       Targets: .hero-stats .stat
       Each stat pops out from center with a radial burst.
    ───────────────────────────────────────────────────────────── */
    (function statsBurst() {
      const stats = $$(".hero-stats .stat");
      if (!stats.length) return;
      const origins = ["right bottom", "left bottom", "right top", "left top"];
      gsap.fromTo(
        stats,
        { scale: 0, opacity: 0, transformOrigin: (i) => origins[i] || "center" },
        {
          scale: 1, opacity: 1, duration: 0.65,
          ease: "bounce-soft",
          stagger: { each: 0.1, from: "center" },
          scrollTrigger: { trigger: ".hero-stats", start: "top 90%", once: true },
        }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       3. OVERVIEW FEATURE CARDS — CASCADE WAVE
       Targets: .features-grid .feature-card
       Cards arrive in a left-to-right + top-to-bottom cascade.
    ───────────────────────────────────────────────────────────── */
    (function featureWave() {
      const cards = $$(".features-grid .feature-card");
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { y: 70, opacity: 0, rotateZ: (i) => (i % 2 === 0 ? -3 : 3) },
        {
          y: 0, opacity: 1, rotateZ: 0,
          duration: 0.7, ease: "expo",
          stagger: { each: 0.08, from: "start" },
          scrollTrigger: { trigger: ".features-grid", start: "top 82%", once: true },
        }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       4. FEATURE CARD ICON — SPIN-IN ON SCROLL
       Targets: .fc-icon svg
       Icon rotates 360° as card enters view.
    ───────────────────────────────────────────────────────────── */
    (function iconSpin() {
      $$(".fc-icon").forEach((icon) => {
        gsap.fromTo(
          icon,
          { rotate: -180, scale: 0.3, opacity: 0 },
          {
            rotate: 0, scale: 1, opacity: 1,
            duration: 0.8, ease: "back.out(2)",
            scrollTrigger: { trigger: icon, start: "top 88%", once: true },
          }
        );
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       5. PROGRESS SECTION — FILL ANIMATION TIE-IN
       Targets: .prog-fill, .prog-pct
       When progress section enters view, animate fill 0→current
       in a satisfying spring motion.
    ───────────────────────────────────────────────────────────── */
    (function progressSpring() {
      ScrollTrigger.create({
        trigger: ".progress-box",
        start: "top 78%",
        once: true,
        onEnter() {
          const fill = $("#prog-fill");
          if (!fill) return;
          const targetW = parseFloat(fill.style.width) || 0;
          fill.style.width = "0%";
          gsap.to(fill, { width: targetW + "%", duration: 1.4, ease: "expo", delay: 0.2 });
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       6. TASK INDICATORS — FLIP CARD REVEAL
       Targets: .task-indicators .task-ind
       Each indicator flips in on Y-axis like a card being turned.
    ───────────────────────────────────────────────────────────── */
    (function taskIndFlip() {
      const inds = $$(".task-indicators .task-ind");
      if (!inds.length) return;
      gsap.set(inds, { rotateY: -90, opacity: 0, transformPerspective: 600 });
      ScrollTrigger.create({
        trigger: ".task-indicators",
        start: "top 85%",
        once: true,
        onEnter() {
          gsap.to(inds, {
            rotateY: 0, opacity: 1,
            duration: 0.65, ease: "back.out(1.8)",
            stagger: 0.1,
          });
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       7. TASK CARDS — MAGNETIC FOCUS DEPTH
       Targets: .task-card
       Hovering a task card subtly pushes siblings away (depth effect).
    ───────────────────────────────────────────────────────────── */
    (function taskDepth() {
      const cards = $$(".task-card");
      cards.forEach((card, i) => {
        card.addEventListener("mouseenter", () => {
          cards.forEach((other, j) => {
            if (j !== i) {
              gsap.to(other, { scale: 0.975, opacity: 0.7, duration: 0.4, ease: "power2.out" });
            }
          });
          gsap.to(card, { scale: 1.008, duration: 0.4, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          cards.forEach((other) => {
            gsap.to(other, { scale: 1, opacity: 1, duration: 0.5, ease: "power2.inOut" });
          });
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       8. TASK BODY OPEN — STEP LIST TYPEWRITER REVEAL
       Targets: .task-body.open .steps-list li
       When a task is toggled open, step items write in one-by-one.
    ───────────────────────────────────────────────────────────── */
    (function taskBodyStagger() {
      /* Patch toggleTask to fire GSAP after DOM open */
      const origToggle = window.toggleTask;
      window.toggleTask = function (head) {
        origToggle && origToggle(head);
        requestAnimationFrame(() => {
          const body = head.nextElementSibling;
          if (!body || !body.classList.contains("open")) return;
          const items = $$(".steps-list li, .goal-row, .tip-row, .subtask-label, code.code-block", body);
          gsap.fromTo(
            items,
            { x: -28, opacity: 0, filter: "blur(4px)" },
            {
              x: 0, opacity: 1, filter: "blur(0px)",
              duration: 0.45, ease: "expo",
              stagger: 0.045, clearProps: "filter",
            }
          );
        });
      };
    })();

    /* ─────────────────────────────────────────────────────────────
       9. TASK NUM BADGE — GLITCH FLICKER
       Targets: .task-num-badge
       Each task badge does a brief colour-glitch flicker on scroll entry.
    ───────────────────────────────────────────────────────────── */
    (function badgeGlitch() {
      $$(".task-num-badge").forEach((badge) => {
        ScrollTrigger.create({
          trigger: badge, start: "top 90%", once: true,
          onEnter() {
            const tl = gsap.timeline();
            tl.to(badge, { skewX: 20, duration: 0.06, ease: "none" })
              .to(badge, { skewX: -12, duration: 0.06 })
              .to(badge, { skewX: 8, duration: 0.05 })
              .to(badge, { skewX: 0, duration: 0.08, ease: "power3.out" });
          },
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       10. FEEDBACK BAND — TEXT WIPE REVEAL
       Targets: .feedback-band h3, .feedback-band p, .btn-white
       Text elements clip-wipe in from left.
    ───────────────────────────────────────────────────────────── */
    (function feedbackWipe() {
      const band = $(".feedback-band");
      if (!band) return;
      const els = [
        $(".feedback-band h3"),
        $(".feedback-band p"),
        $(".feedback-band .btn-white"),
      ].filter(Boolean);

      gsap.set(els, { clipPath: "inset(0 100% 0 0)" });
      ScrollTrigger.create({
        trigger: band, start: "top 80%", once: true,
        onEnter() {
          gsap.to(els, {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.85, ease: "expo",
            stagger: 0.15,
            clearProps: "clipPath",
          });
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       11. CHECKLIST ITEMS — DRAW-IN + CHECK BOUNCE
       Targets: .check-item
       Patch toggleCheck to add a springy bounce when checking items.
    ───────────────────────────────────────────────────────────── */
    (function checkBounce() {
      const origCheck = window.toggleCheck;
      window.toggleCheck = function (el) {
        origCheck && origCheck(el);
        const box = $(".check-box", el);
        if (!box) return;
        if (el.classList.contains("checked")) {
          gsap.fromTo(box, { scale: 0.4, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.55, ease: "back.out(3)" });
        } else {
          gsap.fromTo(box, { scale: 1.15 }, { scale: 1, duration: 0.35, ease: "power3.out" });
        }
      };
    })();

    /* ─────────────────────────────────────────────────────────────
       12. RESOURCE CARDS — SEQUENTIAL RISE WITH BLUR
       Targets: .resources-grid .resource-card
       Cards rise while un-blurring in a staggered sequence.
    ───────────────────────────────────────────────────────────── */
    (function resourceRise() {
      const cards = $$(".resources-grid .resource-card");
      if (!cards.length) return;
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0, filter: "blur(10px)" },
        {
          y: 0, opacity: 1, filter: "blur(0px)",
          duration: 0.8, ease: "expo",
          stagger: { each: 0.1, from: "start" },
          scrollTrigger: { trigger: ".resources-grid", start: "top 82%", once: true },
          clearProps: "filter",
        }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       13. RESOURCE CARD LINKS — ARROW SLIDE HOVER
       Targets: .resource-card a svg
       Arrow icon slides right and bounces on hover.
    ───────────────────────────────────────────────────────────── */
    (function resourceArrowHover() {
      $$(".resource-card a").forEach((a) => {
        const svg = $("svg", a);
        if (!svg) return;
        a.addEventListener("mouseenter", () =>
          gsap.to(svg, { x: 5, duration: 0.3, ease: "power2.out" })
        );
        a.addEventListener("mouseleave", () =>
          gsap.to(svg, { x: 0, duration: 0.45, ease: "elastic.out(1, 0.5)" })
        );
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       14. JOIN CARD — GRADIENT BORDER PULSE RING
       Targets: .join-card
       Subtle pulsing ring effect on the card border.
    ───────────────────────────────────────────────────────────── */
    (function joinRingPulse() {
      injectCSS("join-ring-css", `
        .join-card {
          position: relative;
          overflow: visible !important;
        }
        .join-ring-pulse {
          position: absolute;
          inset: -3px;
          border-radius: 22px;
          border: 1.5px solid var(--orange);
          opacity: 0;
          pointer-events: none;
          z-index: 0;
        }
      `);
      const card = $(".join-card");
      if (!card) return;
      const ring = document.createElement("div");
      ring.className = "join-ring-pulse";
      card.prepend(ring);
      ScrollTrigger.create({
        trigger: card, start: "top 82%", once: true,
        onEnter() {
          gsap.to(ring, {
            opacity: 0.6, scale: 1.015,
            duration: 1.2, ease: "sine.inOut",
            yoyo: true, repeat: -1,
          });
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       15. JOIN BENEFITS LIST — TYPEWRITER STAGGER
       Targets: .benefits-list li
       Each benefit line types in, then the icon colour pops.
    ───────────────────────────────────────────────────────────── */
    (function benefitsType() {
      const items = $$(".benefits-list li");
      if (!items.length) return;
      gsap.fromTo(
        items,
        { x: -40, opacity: 0 },
        {
          x: 0, opacity: 1,
          duration: 0.55, ease: "expo",
          stagger: 0.08,
          scrollTrigger: { trigger: ".benefits-list", start: "top 85%", once: true },
        }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       16. CONTACT SECTION — SPLIT ENTRANCE
       Targets: .faq-card, .contact-card
       FAQ slides from left, contact form from right.
    ───────────────────────────────────────────────────────────── */
    (function contactSplit() {
      const faq = $(".faq-card");
      const form = $(".contact-card");
      if (faq) {
        gsap.fromTo(faq,
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: "expo",
            scrollTrigger: { trigger: faq, start: "top 82%", once: true } }
        );
      }
      if (form) {
        gsap.fromTo(form,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1, ease: "expo",
            scrollTrigger: { trigger: form, start: "top 82%", once: true } }
        );
      }
    })();

    /* ─────────────────────────────────────────────────────────────
       17. FAQ ITEMS — ACCORDION HEIGHT EASE
       Targets: .faq-answer
       Smooth max-height animation when FAQ opens/closes.
    ───────────────────────────────────────────────────────────── */
    (function faqSmooth() {
      const origFaq = window.toggleFaq;
      window.toggleFaq = function (btn) {
        const item = btn.closest(".faq-item");
        const answer = $(".faq-answer", item);
        const isOpen = item.classList.contains("open");

        if (!isOpen) {
          // Opening: run original toggle first, then animate
          origFaq && origFaq(btn);
          gsap.fromTo(answer,
            { opacity: 0, y: -8 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
          );
        } else {
          gsap.to(answer, {
            opacity: 0, y: -6, duration: 0.2, ease: "power2.in",
            onComplete: () => origFaq && origFaq(btn),
          });
        }
      };
    })();

    /* ─────────────────────────────────────────────────────────────
       18. FOOTER COLUMNS — STAGGERED WIPE REVEAL
       Targets: .footer-top-grid .footer-col
       Each footer column wipes up from below.
    ───────────────────────────────────────────────────────────── */
    (function footerColReveal() {
      const cols = $$(".footer-top-grid .footer-col");
      if (!cols.length) return;
      gsap.fromTo(
        cols,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.75, ease: "expo",
          stagger: 0.12,
          scrollTrigger: { trigger: ".footer-top-grid", start: "top 88%", once: true },
        }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       19. FOOTER BOTTOM — SLIDE-UP FROM VERY BOTTOM
       Targets: .footer-bottom
    ───────────────────────────────────────────────────────────── */
    (function footerBottomSlide() {
      const fb = $(".footer-bottom");
      if (!fb) return;
      gsap.fromTo(fb,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo",
          scrollTrigger: { trigger: fb, start: "top 98%", once: true } }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       20. SECTION DIVIDER LINES — DRAW ACROSS
       Targets: .divider (inside task bodies)
       The horizontal divider draws from left to right on open.
    ───────────────────────────────────────────────────────────── */
    (function dividerDraw() {
      $$(".divider").forEach((d) => {
        const parent = d.closest(".task-body");
        if (!parent) return;
        // Observed via mutation when body opens
        const observer = new MutationObserver(() => {
          if (parent.classList.contains("open")) {
            gsap.fromTo(d, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 0.6, ease: "expo" });
          }
        });
        observer.observe(parent, { attributes: true, attributeFilter: ["class"] });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       21. MODAL CLOSE BUTTON — SPIN ON HOVER
       Targets: .modal-close
    ───────────────────────────────────────────────────────────── */
    (function modalCloseHover() {
      $$(".modal-close").forEach((btn) => {
        btn.addEventListener("mouseenter", () =>
          gsap.to(btn, { rotate: 90, scale: 1.15, duration: 0.3, ease: "power2.out" })
        );
        btn.addEventListener("mouseleave", () =>
          gsap.to(btn, { rotate: 0, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" })
        );
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       22. SUBMIT TASK BUTTON — SUCCESS RIPPLE
       Targets: .btn-submit-task
       After click, a ripple radiates from click point.
    ───────────────────────────────────────────────────────────── */
    (function submitRipple() {
      injectCSS("ripple-css", `
        .btn-submit-task, .btn, .modal-btn-submit, .form-submit { overflow: hidden; }
        .gsap-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          pointer-events: none;
          transform: scale(0);
        }
      `);

      function attachRipple(btn) {
        btn.style.position = "relative";
        btn.addEventListener("click", (e) => {
          const rect = btn.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 2;
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          const ripple = document.createElement("div");
          ripple.className = "gsap-ripple";
          ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
          btn.appendChild(ripple);
          gsap.fromTo(ripple,
            { scale: 0, opacity: 1 },
            { scale: 1, opacity: 0, duration: 0.65, ease: "power2.out",
              onComplete: () => ripple.remove() }
          );
        });
      }

      $$(".btn-submit-task, .btn, .modal-btn-submit, .form-submit").forEach(attachRipple);
    })();

    /* ─────────────────────────────────────────────────────────────
       23. PILL BADGE DOT — SONAR PULSE RINGS
       Targets: .pill-badge .dot
       Adds two expanding sonar rings around the live-dot indicator.
    ───────────────────────────────────────────────────────────── */
    (function sonarPulse() {
      injectCSS("sonar-css", `
        .pill-badge { position: relative; }
        .sonar-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid var(--orange);
          pointer-events: none;
          top: 50%; left: 10px;
          transform: translate(-50%, -50%);
          width: 6px; height: 6px;
          opacity: 0;
        }
      `);
      const badge = $(".pill-badge");
      if (!badge) return;
      [0, 0.5].forEach((delay) => {
        const ring = document.createElement("div");
        ring.className = "sonar-ring";
        badge.appendChild(ring);
        gsap.to(ring, {
          width: 26, height: 26, opacity: 0,
          duration: 1.6, ease: "power2.out",
          repeat: -1, delay,
          onRepeat() { gsap.set(ring, { width: 6, height: 6, opacity: 0.8 }); },
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       24. TASK TOGGLE BUTTON — COLOUR MORPH ON STATE
       Targets: .task-toggle
       Background transitions to orange-tint when open.
    ───────────────────────────────────────────────────────────── */
    (function taskToggleColorMorph() {
      $$(".task-head").forEach((head) => {
        const toggle = $(".task-toggle", head);
        if (!toggle) return;
        const obs = new MutationObserver(() => {
          if (toggle.classList.contains("open")) {
            gsap.to(toggle, { backgroundColor: "rgba(249,115,22,0.15)", duration: 0.3 });
          } else {
            gsap.to(toggle, { backgroundColor: "", duration: 0.3 });
          }
        });
        obs.observe(toggle, { attributes: true, attributeFilter: ["class"] });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       25. SCROLL PROGRESS BAR — GRADIENT SHIFT
       Targets: #scroll-progress
       The colour shifts across the spectrum as user scrolls deeper.
    ───────────────────────────────────────────────────────────── */
    (function scrollGradientShift() {
      const bar = $("#scroll-progress");
      if (!bar) return;
      const colors = [
        ["#c2410c", "#f97316", "#fbbf24"],
        ["#f97316", "#fbbf24", "#facc15"],
        ["#ea580c", "#f97316", "#fb923c"],
      ];
      let idx = 0;
      ScrollTrigger.create({
        start: "top top", end: "bottom bottom",
        onUpdate(self) {
          const segment = Math.floor(self.progress * colors.length);
          const c = colors[Math.min(segment, colors.length - 1)];
          bar.style.background = `linear-gradient(90deg, ${c[0]}, ${c[1]}, ${c[2]})`;
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       26. SECTION TITLE — GRADIENT SWEEP SHIMMER
       Targets: .section-title
       A shimmering light sweeps across section titles on scroll entry.
    ───────────────────────────────────────────────────────────── */
    (function titleShimmer() {
      injectCSS("title-shimmer-css", `
        .section-title { position: relative; display: inline-block; }
        .section-title .shimmer-mask {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(100deg,
            transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%);
          background-size: 200% 100%;
          background-position: -200% 0;
          mix-blend-mode: overlay;
          border-radius: inherit;
        }
      `);
      $$(".section-title").forEach((title) => {
        const mask = document.createElement("span");
        mask.className = "shimmer-mask";
        title.style.position = "relative";
        title.appendChild(mask);
        ScrollTrigger.create({
          trigger: title, start: "top 85%", once: true,
          onEnter() {
            gsap.fromTo(mask,
              { backgroundPosition: "-200% 0" },
              { backgroundPosition: "200% 0", duration: 1.1, ease: "power2.inOut" }
            );
          },
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       27. PARALLAX MULTI-LAYER HERO DEPTH
       Targets: .hero-content, .dot-grid, .hero-glow, .hero-glow2
       Elements move at different speeds on scroll for a depth effect.
    ───────────────────────────────────────────────────────────── */
    (function heroParallaxLayers() {
      if (isMobile()) return;
      const layers = [
        { el: $(".hero-content"), speed: 0.18 },
        { el: $(".hero .dot-grid"), speed: 0.32 },
        { el: $(".hero-glow"), speed: 0.45 },
        { el: $(".hero-glow2"), speed: 0.28 },
      ];
      layers.forEach(({ el, speed }) => {
        if (!el) return;
        gsap.to(el, {
          y: () => window.innerHeight * speed * -1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero", start: "top top",
            end: "bottom top", scrub: true,
          },
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       28. TOOL CHIPS — BOUNCY ARRIVE ON SCROLL
       Targets: .task-foot .tool-chips .tool-chip
    ───────────────────────────────────────────────────────────── */
    (function toolChipArrive() {
      $$(".task-foot").forEach((foot) => {
        const chips = $$(".tool-chip", foot);
        gsap.fromTo(
          chips,
          { scale: 0, opacity: 0 },
          {
            scale: 1, opacity: 1,
            duration: 0.55, ease: "back.out(2.5)",
            stagger: 0.08,
            scrollTrigger: { trigger: foot, start: "top 92%", once: true },
          }
        );
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       29. CODE BLOCKS — TERMINAL CURSOR BLINK
       Targets: code.code-block
       Appends a blinking terminal cursor to each code block.
    ───────────────────────────────────────────────────────────── */
    (function codeCursor() {
      injectCSS("code-cursor-css", `
        .code-cursor {
          display: inline-block;
          width: 7px; height: 1.1em;
          background: var(--orange);
          margin-left: 3px;
          vertical-align: text-bottom;
          border-radius: 1px;
        }
      `);
      $$("code.code-block").forEach((block) => {
        const cursor = document.createElement("span");
        cursor.className = "code-cursor";
        block.appendChild(cursor);
        gsap.to(cursor, { opacity: 0, duration: 0.5, ease: "steps(1)", repeat: -1, yoyo: true });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       30. REGISTERED BADGE — SCALE POP REVEAL
       Targets: #nav-registered-badge
       When it appears, it pops in with a spring bounce.
    ───────────────────────────────────────────────────────────── */
    (function badgePopReveal() {
      const badge = $("#nav-registered-badge");
      if (!badge) return;
      const obs = new MutationObserver(() => {
        if (badge.style.display !== "none" && badge.style.display !== "") {
          gsap.fromTo(badge,
            { scale: 0.4, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2.5)" }
          );
        }
      });
      obs.observe(badge, { attributes: true, attributeFilter: ["style"] });
    })();

    /* ─────────────────────────────────────────────────────────────
       31. TASKS SECTION HEADER — WORD-BY-WORD ENTRANCE
       Targets: .tasks-section .section-title
    ───────────────────────────────────────────────────────────── */
    (function tasksTitleWords() {
      const title = $(".tasks-section .section-title");
      if (!title) return;
      const words = title.textContent.trim().split(" ");
      title.innerHTML = words
        .map((w) => `<span class="tw" style="display:inline-block;overflow:hidden;"><span class="tw-inner" style="display:inline-block;">${w}</span></span>`)
        .join(" ");

      ScrollTrigger.create({
        trigger: title, start: "top 85%", once: true,
        onEnter() {
          gsap.fromTo(
            $$(".tw-inner", title),
            { y: "110%", rotateZ: 4 },
            { y: "0%", rotateZ: 0, duration: 0.7, ease: "expo", stagger: 0.08 }
          );
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       32. STEP NUMBERS — SEQUENTIAL COUNT-UP FLASH
       Targets: .sn (step number badges)
       Step badges flash their numbers in sequence when parent opens.
    ───────────────────────────────────────────────────────────── */
    (function stepNumFlash() {
      $$(".task-head").forEach((head) => {
        const observer = new MutationObserver(() => {
          const body = head.nextElementSibling;
          if (!body || !body.classList.contains("open")) return;
          const snEls = $$(".sn", body);
          snEls.forEach((sn, i) => {
            const orig = sn.textContent;
            gsap.delayedCall(i * 0.06, () => {
              gsap.fromTo(sn,
                { scale: 1.6, color: "#fbbf24", backgroundColor: "rgba(251,191,36,0.2)" },
                { scale: 1, color: "", backgroundColor: "", duration: 0.4, ease: "back.out(2)" }
              );
            });
          });
        });
        const body = head.nextElementSibling;
        if (body) observer.observe(body, { attributes: true, attributeFilter: ["class"] });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       33. OVERVIEW SECTION — STICKY LABEL PARALLAX
       Targets: .overview .section-label
       The "overview" label scrolls slightly slower than content.
    ───────────────────────────────────────────────────────────── */
    (function overviewLabelParallax() {
      if (isMobile()) return;
      const label = $(".overview .section-label");
      if (!label) return;
      gsap.to(label, {
        y: -30, ease: "none",
        scrollTrigger: { trigger: ".overview", start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       34. FEEDBACK BAND BUTTON — PERPETUAL SHIMMER LOOP
       Targets: .feedback-band .btn-white
    ───────────────────────────────────────────────────────────── */
    (function feedbackBtnShimmer() {
      injectCSS("fb-btn-shimmer-css", `
        .feedback-band .btn-white { overflow: hidden; }
        .fb-shimmer {
          position: absolute; top: 0; left: -80%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          pointer-events: none;
        }
      `);
      const btn = $(".feedback-band .btn-white");
      if (!btn) return;
      btn.style.position = "relative";
      const shimmer = document.createElement("div");
      shimmer.className = "fb-shimmer";
      btn.appendChild(shimmer);
      gsap.to(shimmer, {
        left: "160%", duration: 1.8, ease: "power1.inOut",
        repeat: -1, repeatDelay: 2.2,
        onRepeat() { gsap.set(shimmer, { left: "-80%" }); },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       35. CONTACT FORM INPUTS — HIGHLIGHT BORDER BEAM
       Targets: .form-input, .form-textarea, .modal-input
       An animated border-beam effect on focus.
    ───────────────────────────────────────────────────────────── */
    (function inputFocusBeam() {
      injectCSS("input-beam-css", `
        .form-input, .form-textarea, .modal-input { position: relative; }
        .input-beam {
          position: absolute; bottom: 0; left: 0;
          height: 2px; width: 0%;
          background: linear-gradient(90deg, var(--orange2), var(--orange), var(--amber));
          border-radius: 0 0 9px 9px;
          pointer-events: none;
          z-index: 5;
        }
      `);
      $$(".form-input, .form-textarea, .modal-input").forEach((inp) => {
        inp.style.position = "relative";
        const beam = document.createElement("div");
        beam.className = "input-beam";
        inp.parentElement.style.position = "relative";
        inp.parentElement.appendChild(beam);

        inp.addEventListener("focus", () =>
          gsap.to(beam, { width: "100%", duration: 0.4, ease: "expo" })
        );
        inp.addEventListener("blur", () =>
          gsap.to(beam, { width: "0%", duration: 0.3, ease: "power2.in" })
        );
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       36. OPTIONAL TASK CARD — DASHED BORDER DANCE
       Targets: .task-card.optional
       The dashed border slowly animates (CSS stroke-dashoffset trick via SVG overlay).
    ───────────────────────────────────────────────────────────── */
    (function optionalCardDash() {
      const card = $(".task-card.optional");
      if (!card) return;
      // Use CSS animation since border-style dashed can't be animated;
      // Add a pulsing glow instead.
      gsap.to(card, {
        boxShadow: "0 0 20px rgba(249,115,22,0.12), 0 0 40px rgba(249,115,22,0.06)",
        duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: -1,
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       37. SCROLL-SNAP SECTION INDICATORS
       Adds floating mini-dots on the right edge tracking scroll depth.
    ───────────────────────────────────────────────────────────── */
    (function sectionDotNav() {
      if (isMobile()) return;
      injectCSS("dotnav-css", `
        #gsap-dotnav {
          position: fixed; right: 20px; top: 50%;
          transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 10px;
          z-index: 500; pointer-events: none;
        }
        .gsap-dotnav-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--muted);
          transition: background 0.3s, transform 0.3s;
          opacity: 0.6;
        }
        .gsap-dotnav-dot.active {
          background: var(--orange);
          transform: scale(1.6);
          opacity: 1;
        }
      `);
      const sections = ["#overview", "#progress", "#tasks", "#resources", ".join-section", "#contact"];
      const nav = document.createElement("div");
      nav.id = "gsap-dotnav";
      sections.forEach(() => {
        const dot = document.createElement("div");
        dot.className = "gsap-dotnav-dot";
        nav.appendChild(dot);
      });
      document.body.appendChild(nav);
      const dots = $$(".gsap-dotnav-dot");

      sections.forEach((sel, i) => {
        const el = $(sel);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el, start: "top 55%", end: "bottom 55%",
          onEnter: () => { dots.forEach((d) => d.classList.remove("active")); dots[i]?.classList.add("active"); },
          onEnterBack: () => { dots.forEach((d) => d.classList.remove("active")); dots[i]?.classList.add("active"); },
        });
      });

      // Entrance animation
      gsap.fromTo(dots,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 0.6, duration: 0.6, ease: "expo", stagger: 0.05, delay: 1.5 }
      );
    })();

    /* ─────────────────────────────────────────────────────────────
       38. HEADER SCROLL-AWAY + RETURN
       Targets: #main-header
       Header slides up when scrolling down fast, returns on up-scroll.
    ───────────────────────────────────────────────────────────── */
    (function headerHideReveal() {
      let lastY = 0;
      let headerHidden = false;
      const header = $("#main-header");
      if (!header) return;

      ScrollTrigger.create({
        start: "top top", end: "max",
        onUpdate(self) {
          const curr = self.scroll();
          const delta = curr - lastY;

          if (delta > 4 && curr > 120 && !headerHidden) {
            gsap.to(header, { y: -68, duration: 0.35, ease: "power3.in" });
            headerHidden = true;
          } else if (delta < -4 && headerHidden) {
            gsap.to(header, { y: 0, duration: 0.45, ease: "power3.out" });
            headerHidden = false;
          }
          lastY = curr;
        },
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       39. STAT NUMBERS — HOVER MICRO BOUNCE
       Targets: .stat
    ───────────────────────────────────────────────────────────── */
    (function statHoverBounce() {
      $$(".stat").forEach((stat) => {
        const num = $(".stat-num", stat);
        stat.addEventListener("mouseenter", () => {
          gsap.to(num, { scale: 1.25, color: "#fbbf24", duration: 0.25, ease: "back.out(3)" });
        });
        stat.addEventListener("mouseleave", () => {
          gsap.to(num, { scale: 1, color: "", duration: 0.4, ease: "elastic.out(1, 0.4)" });
        });
      });
    })();

    /* ─────────────────────────────────────────────────────────────
       40. REGISTRATION SUCCESS — CONFETTI BURST
       Targets: none (fires after registration completes)
       Spawns small coloured particles from the nav badge position.
    ───────────────────────────────────────────────────────────── */
    (function confettiBurst() {
      injectCSS("confetti-css", `
        .gsap-confetti {
          position: fixed; pointer-events: none;
          width: 8px; height: 8px;
          border-radius: 2px;
          z-index: 9999;
        }
      `);

      const COLORS = ["#f97316", "#fbbf24", "#fb923c", "#ea580c", "#facc15", "#fff"];

      function burst(x, y) {
        for (let i = 0; i < 28; i++) {
          const p = document.createElement("div");
          p.className = "gsap-confetti";
          p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
          p.style.left = x + "px";
          p.style.top = y + "px";
          document.body.appendChild(p);

          const angle = (Math.PI * 2 * i) / 28 + Math.random() * 0.4;
          const dist = 60 + Math.random() * 120;
          gsap.to(p, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 40,
            rotate: Math.random() * 720 - 360,
            opacity: 0,
            scale: 0.3,
            duration: 0.9 + Math.random() * 0.5,
            ease: "power2.out",
            onComplete: () => p.remove(),
          });
        }
      }

      /* Patch completeRegistration to trigger confetti */
      const origComplete = window.completeRegistration;
      window.completeRegistration = async function () {
        await origComplete?.();
        const badge = $("#nav-registered-badge");
        if (badge) {
          const rect = badge.getBoundingClientRect();
          burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      };
    })();

    console.log("✦ GSAP Advanced Animation Layer v2.0 — 40 animations loaded");
  }

  boot();
})();