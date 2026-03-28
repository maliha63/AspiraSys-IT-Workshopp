/* ═══════════════════════════════════════════════════════════
   AspiraSys Workshop — GSAP Animation Layer
   Drop-in addon: does NOT modify existing script.js logic
   Requires: GSAP 3 + ScrollTrigger + CustomEase + SplitText
═══════════════════════════════════════════════════════════ */

(function () {
  /* ── Wait for GSAP to be ready ── */
  function initGSAP() {
    if (typeof gsap === "undefined") {
      setTimeout(initGSAP, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger, CustomEase);

    CustomEase.create("silk", "M0,0 C0.25,0 0.1,1 1,1");
    CustomEase.create("snap", "M0,0 C0.68,-0.55 0.27,1.55 1,1");

    /* ────────────────────────────────────────────
       1. CUSTOM MAGNETIC CURSOR
    ──────────────────────────────────────────── */
    const cursorOuter = document.createElement("div");
    const cursorDot = document.createElement("div");
    cursorOuter.id = "gsap-cursor-outer";
    cursorDot.id = "gsap-cursor-dot";
    document.body.appendChild(cursorOuter);
    document.body.appendChild(cursorDot);

    const cursorStyle = document.createElement("style");
    cursorStyle.textContent = `
      body { cursor: none; }
      a, button, [onclick], .task-head, .faq-btn, .check-item, .tool-chip { cursor: none; }

      #gsap-cursor-outer {
        position: fixed;
        width: 36px; height: 36px;
        border: 1.5px solid var(--orange);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        top: 0; left: 0;
        transform: translate(-50%, -50%);
        mix-blend-mode: normal;
        transition: width 0.25s, height 0.25s, background 0.25s, border-color 0.25s, opacity 0.3s;
        opacity: 0;
      }
      #gsap-cursor-dot {
        position: fixed;
        width: 5px; height: 5px;
        background: var(--orange);
        border-radius: 50%;
        pointer-events: none;
        z-index: 100000;
        top: 0; left: 0;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      #gsap-cursor-outer.cursor-hover {
        width: 56px; height: 56px;
        background: rgba(249,115,22,0.08);
        border-color: var(--orange);
      }
      #gsap-cursor-outer.cursor-click {
        width: 28px; height: 28px;
        background: rgba(249,115,22,0.2);
      }
    `;
    document.head.appendChild(cursorStyle);

    let mouseX = 0, mouseY = 0;
    let outerX = 0, outerY = 0;
    let visible = false;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        visible = true;
        cursorOuter.style.opacity = "1";
        cursorDot.style.opacity = "1";
      }
      gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0.08, ease: "none" });
    });

    document.addEventListener("mouseleave", () => {
      cursorOuter.style.opacity = "0";
      cursorDot.style.opacity = "0";
      visible = false;
    });

    // Smooth outer ring following
    gsap.ticker.add(() => {
      outerX += (mouseX - outerX) * 0.12;
      outerY += (mouseY - outerY) * 0.12;
      gsap.set(cursorOuter, { x: outerX, y: outerY });
    });

    // Hover states
    const hoverEls = document.querySelectorAll(
      "a, button, [onclick], .task-head, .faq-btn, .check-item, .tool-chip, .feature-card, .resource-card"
    );
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", () => cursorOuter.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => cursorOuter.classList.remove("cursor-hover"));
    });

    document.addEventListener("mousedown", () => cursorOuter.classList.add("cursor-click"));
    document.addEventListener("mouseup", () => cursorOuter.classList.remove("cursor-click"));

    /* ────────────────────────────────────────────
       2. HERO TITLE — CHARACTER SPLIT ANIMATION
    ──────────────────────────────────────────── */
    const heroTitle = document.querySelector(".hero-title");
    if (heroTitle) {
      // Split manually since SplitText is Club GSAP
      const spans = heroTitle.querySelectorAll("span");
      gsap.fromTo(
        spans,
        { y: 60, opacity: 0, rotateX: -45, transformOrigin: "0% 50%" },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.1,
          ease: "silk",
          stagger: 0.12,
          delay: 0.2,
        }
      );
    }

    const heroBadge = document.querySelector(".pill-badge");
    if (heroBadge) {
      gsap.fromTo(
        heroBadge,
        { scaleX: 0.5, opacity: 0, y: -10 },
        { scaleX: 1, opacity: 1, y: 0, duration: 0.7, ease: "snap", delay: 0.1 }
      );
    }

    const heroSub = document.querySelector(".hero-sub");
    const heroDesc = document.querySelector(".hero-desc");
    const heroBtns = document.querySelector(".hero-btns");
    const heroStats = document.querySelector(".hero-stats");

    gsap.fromTo(
      [heroSub, heroDesc, heroBtns, heroStats].filter(Boolean),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "silk", stagger: 0.1, delay: 0.5 }
    );

    /* ────────────────────────────────────────────
       3. HERO GLOW — FLOATING PARALLAX
    ──────────────────────────────────────────── */
    const glow1 = document.querySelector(".hero-glow");
    const glow2 = document.querySelector(".hero-glow2");
    if (glow1) {
      gsap.to(glow1, {
        y: -40,
        scale: 1.1,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
    if (glow2) {
      gsap.to(glow2, {
        y: 30,
        scale: 1.05,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });
    }

    /* ────────────────────────────────────────────
       4. HERO STATS — COUNT-UP ON SCROLL
    ──────────────────────────────────────────── */
    const statNums = document.querySelectorAll(".stat-num");
    const statValues = ["5", "6", "1", "∞"];
    statNums.forEach((el, i) => {
      const val = statValues[i];
      if (val === "∞") return;
      const num = parseInt(val);
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: num,
            duration: 1.5,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            },
          });
        },
      });
    });

    /* ────────────────────────────────────────────
       5. FEATURE CARDS — 3D TILT ON HOVER
    ──────────────────────────────────────────── */
    document.querySelectorAll(".feature-card, .resource-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        gsap.to(card, {
          rotateY: dx * 10,
          rotateX: -dy * 10,
          transformPerspective: 800,
          duration: 0.4,
          ease: "power2.out",
          boxShadow: `${-dx * 12}px ${dy * 12}px 40px rgba(249,115,22,0.15)`,
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
          boxShadow: "none",
        });
      });
    });

    /* ────────────────────────────────────────────
       6. SECTION LABELS — TYPEWRITER EFFECT
    ──────────────────────────────────────────── */
    document.querySelectorAll(".section-label").forEach((label) => {
      const originalText = label.textContent;
      ScrollTrigger.create({
        trigger: label,
        start: "top 88%",
        once: true,
        onEnter: () => {
          label.textContent = "";
          gsap.to(
            {},
            {
              duration: originalText.length * 0.045,
              ease: "none",
              onUpdate: function () {
                const progress = this.progress();
                const chars = Math.floor(progress * originalText.length);
                label.textContent = originalText.slice(0, chars);
              },
            }
          );
        },
      });
    });

    /* ────────────────────────────────────────────
       7. SCROLL-TRIGGERED REVEAL (replaces IntersectionObserver for extra juice)
    ──────────────────────────────────────────── */
    document.querySelectorAll(".reveal").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "silk",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    /* ────────────────────────────────────────────
       8. TASK CARDS — STAGGER + SLIDE FROM LEFT
    ──────────────────────────────────────────── */
    const taskCards = document.querySelectorAll(".task-card");
    taskCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { x: i % 2 === 0 ? -40 : 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.85,
          ease: "silk",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          delay: i * 0.05,
        }
      );
    });

    /* ────────────────────────────────────────────
       9. PROGRESS BAR — ANIMATED FILL ON SCROLL
    ──────────────────────────────────────────── */
    const progressBox = document.querySelector(".progress-box");
    if (progressBox) {
      ScrollTrigger.create({
        trigger: progressBox,
        start: "top 80%",
        once: true,
        onEnter: () => {
          const indicators = document.querySelectorAll(".task-ind");
          gsap.fromTo(
            indicators,
            { scale: 0.7, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(2)",
              stagger: 0.1,
            }
          );
        },
      });
    }

    /* ────────────────────────────────────────────
       10. HEADER — LOGO ENTRANCE
    ──────────────────────────────────────────── */
    const logoWrap = document.querySelector(".logo-wrap");
    const navLinks = document.querySelectorAll("nav a, nav span");
    if (logoWrap) {
      gsap.fromTo(
        logoWrap,
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "silk", delay: 0.1 }
      );
    }
    if (navLinks.length) {
      gsap.fromTo(
        navLinks,
        { y: -16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "silk",
          stagger: 0.07,
          delay: 0.3,
        }
      );
    }

    /* ────────────────────────────────────────────
       11. MAGNETIC BUTTONS — PULL EFFECT
    ──────────────────────────────────────────── */
    document.querySelectorAll(".btn, .modal-btn-submit, .form-submit").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        gsap.to(btn, {
          x: dx * 0.25,
          y: dy * 0.25,
          duration: 0.35,
          ease: "power2.out",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      });
    });

    /* ────────────────────────────────────────────
       12. TASK TOGGLE — ENHANCED OPEN ANIMATION
    ──────────────────────────────────────────── */
    document.querySelectorAll(".task-head").forEach((head) => {
      head._origToggle = head.getAttribute("onclick");
      head.addEventListener("click", () => {
        const body = head.nextElementSibling;
        if (body && body.classList.contains("open")) {
          // Animate steps list items on open
          const items = body.querySelectorAll(".steps-list li, .goal-row, .tip-row");
          gsap.fromTo(
            items,
            { x: -20, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.4,
              ease: "power3.out",
              stagger: 0.04,
            }
          );
        }
      });
    });

    /* ────────────────────────────────────────────
       13. FEEDBACK BAND — SHIMMER EFFECT
    ──────────────────────────────────────────── */
    const feedbackBand = document.querySelector(".feedback-band");
    if (feedbackBand) {
      const shimmer = document.createElement("div");
      shimmer.style.cssText = `
        position:absolute; inset:0; border-radius:20px; overflow:hidden;
        pointer-events:none; z-index:1;
      `;
      const shimmerInner = document.createElement("div");
      shimmerInner.style.cssText = `
        position:absolute; top:0; left:-100%; width:60%; height:100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        transform: skewX(-15deg);
      `;
      shimmer.appendChild(shimmerInner);
      feedbackBand.style.position = "relative";
      feedbackBand.appendChild(shimmer);

      ScrollTrigger.create({
        trigger: feedbackBand,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            shimmerInner,
            { left: "-100%" },
            { left: "160%", duration: 1.2, ease: "power2.inOut", delay: 0.3 }
          );
        },
      });
    }

    /* ────────────────────────────────────────────
       14. SCROLL PROGRESS — ORANGE GLOW PULSE
    ──────────────────────────────────────────── */
    const scrollBar = document.getElementById("scroll-progress");
    if (scrollBar) {
      gsap.to(scrollBar, {
        boxShadow: "0 0 12px rgba(249,115,22,0.8), 0 0 4px rgba(251,191,36,0.6)",
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }

    /* ────────────────────────────────────────────
       15. DOT GRID — SUBTLE PARALLAX
    ──────────────────────────────────────────── */
    const dotGrid = document.querySelector(".hero .dot-grid");
    if (dotGrid) {
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(dotGrid, { y: self.progress * 120 });
        },
      });
    }

    /* ────────────────────────────────────────────
       16. FOOTER SOCIAL ICONS — BOUNCE IN
    ──────────────────────────────────────────── */
    const socialLinks = document.querySelectorAll(".social-link");
    if (socialLinks.length) {
      gsap.fromTo(
        socialLinks,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2.5)",
          stagger: 0.1,
          scrollTrigger: {
            trigger: socialLinks[0],
            start: "top 90%",
          },
        }
      );

      socialLinks.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsap.to(link, { scale: 1.3, y: -4, duration: 0.3, ease: "back.out(2)" });
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(link, { scale: 1, y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });
        });
      });
    }

    /* ────────────────────────────────────────────
       17. NAV LINKS — UNDERLINE SLIDE HOVER
    ──────────────────────────────────────────── */
    const navAnchors = document.querySelectorAll("nav a:not(.nav-cta)");
    navAnchors.forEach((a) => {
      const underline = document.createElement("span");
      underline.style.cssText = `
        position:absolute; bottom:2px; left:14px; right:14px; height:1.5px;
        background: var(--orange); transform: scaleX(0); transform-origin: left;
        border-radius: 2px;
      `;
      a.style.position = "relative";
      a.appendChild(underline);

      a.addEventListener("mouseenter", () =>
        gsap.to(underline, { scaleX: 1, duration: 0.25, ease: "power2.out" })
      );
      a.addEventListener("mouseleave", () =>
        gsap.to(underline, { scaleX: 0, transformOrigin: "right", duration: 0.2, ease: "power2.in" })
      );
    });

    /* ────────────────────────────────────────────
       18. MODAL — SLIDE-UP ENTRANCE
    ──────────────────────────────────────────── */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === "attributes" && m.attributeName === "class") {
          const el = m.target;
          if (el.classList.contains("modal-overlay")) {
            const box = el.querySelector(".modal-box");
            if (el.classList.contains("open") && box) {
              gsap.fromTo(
                box,
                { y: 60, scale: 0.92, opacity: 0 },
                { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "silk" }
              );
              // Stagger modal fields
              const fields = box.querySelectorAll(".modal-field, .modal-header, .submit-modal-header, .submit-instruction, .modal-btns");
              gsap.fromTo(
                fields,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.06, delay: 0.15 }
              );
            }
          }
        }
      });
    });

    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      observer.observe(overlay, { attributes: true });
    });

    /* ────────────────────────────────────────────
       19. TASK FOOT — TOOL CHIPS FLOAT IN
    ──────────────────────────────────────────── */
    document.querySelectorAll(".tool-chip").forEach((chip, i) => {
      chip.addEventListener("mouseenter", () => {
        gsap.to(chip, { y: -3, scale: 1.08, duration: 0.25, ease: "power2.out" });
      });
      chip.addEventListener("mouseleave", () => {
        gsap.to(chip, { y: 0, scale: 1, duration: 0.35, ease: "elastic.out(1, 0.5)" });
      });
    });

    /* ────────────────────────────────────────────
       20. PILL BADGE — INFINITE FLOATING
    ──────────────────────────────────────────── */
    if (heroBadge) {
      gsap.to(heroBadge, {
        y: -5,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    }

    /* ────────────────────────────────────────────
       21. ACHIEVEMENT BOX — SPARKLE BURST ON ENTER
    ──────────────────────────────────────────── */
    const achieveBox = document.querySelector(".achievement-box");
    if (achieveBox) {
      ScrollTrigger.create({
        trigger: achieveBox,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            achieveBox,
            { scale: 0.92, opacity: 0, rotateX: 8 },
            {
              scale: 1,
              opacity: 1,
              rotateX: 0,
              transformPerspective: 600,
              duration: 0.8,
              ease: "back.out(1.5)",
            }
          );
        },
      });
    }

    /* ────────────────────────────────────────────
       22. JOIN CARD — GRADIENT BORDER ANIMATION
    ──────────────────────────────────────────── */
    const joinCard = document.querySelector(".join-card");
    if (joinCard) {
      ScrollTrigger.create({
        trigger: joinCard,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            joinCard,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "silk" }
          );
        },
      });
    }

    /* ────────────────────────────────────────────
       23. CHECKLIST — TICK APPEAR ONE BY ONE
    ──────────────────────────────────────────── */
    const checkItems = document.querySelectorAll(".check-item");
    if (checkItems.length) {
      gsap.fromTo(
        checkItems,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: checkItems[0],
            start: "top 88%",
          },
        }
      );
    }

    /* ────────────────────────────────────────────
       24. HERO → OVERVIEW SECTION TRANSITION
    ──────────────────────────────────────────── */
    const overviewHeader = document.querySelector(".overview-header");
    if (overviewHeader) {
      const title = overviewHeader.querySelector(".section-title");
      const desc = overviewHeader.querySelector(".section-desc");
      if (title) {
        gsap.fromTo(
          title,
          { clipPath: "inset(0 100% 0 0)", x: -20 },
          {
            clipPath: "inset(0 0% 0 0)",
            x: 0,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: title, start: "top 85%" },
          }
        );
      }
      if (desc) {
        gsap.fromTo(
          desc,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "silk",
            delay: 0.3,
            scrollTrigger: { trigger: desc, start: "top 88%" },
          }
        );
      }
    }

    /* ────────────────────────────────────────────
       25. FAQ ITEMS — STAGGER IN
    ──────────────────────────────────────────── */
    const faqItems = document.querySelectorAll(".faq-item");
    if (faqItems.length) {
      gsap.fromTo(
        faqItems,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: faqItems[0],
            start: "top 88%",
          },
        }
      );
    }

    console.log("✦ GSAP Animation Layer loaded — AspiraSys Workshop");
  }

  // Start init
  initGSAP();
})();

