/**
 * TarjePAFI Landing Page - behavior.
 * Vanilla JavaScript, no dependencies.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const DEFAULT_LANG = "en";
  const HTML_LANG = { en: "en", es: "es-419" };
  const STORAGE_KEY = "tarjepafi-lang";
  let currentLang = DEFAULT_LANG;

  const t = (key) =>
    (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ||
    TRANSLATIONS[DEFAULT_LANG][key] ||
    key;

  /* ---------- Storage helpers (may be blocked in private mode) ---------- */
  function readStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storeLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  /* =========================================================
     i18n (TS-CON03)
     ========================================================= */
  function applyLanguage(lang) {
    if (!TRANSLATIONS[lang]) lang = DEFAULT_LANG;
    currentLang = lang;

    document.documentElement.lang = HTML_LANG[lang];
    document.title = t("meta.title");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      el.setAttribute("alt", t(el.dataset.i18nAlt));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });

    // Keep dynamic labels in sync
    updateMenuLabel();
    document.querySelectorAll(".contact-form").forEach(refreshErrors);
  }

  function initLanguage() {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    const initial = fromUrl || readStoredLang() || DEFAULT_LANG;
    applyLanguage(initial);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyLanguage(btn.dataset.lang);
        storeLang(btn.dataset.lang);
      });
    });
  }

  /* =========================================================
     Header: scrolled state + mobile menu (US05)
     ========================================================= */
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("main-nav");
  const menuToggle = document.querySelector(".menu-toggle");

  function updateMenuLabel() {
    if (!menuToggle) return;
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-label", t(open ? "a11y.closeMenu" : "a11y.openMenu"));
  }

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    updateMenuLabel();
  }

  function initHeader() {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    // Close menu after choosing a link
    nav.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    // Reset when resizing back to desktop
    window.matchMedia("(min-width: 901px)").addEventListener("change", (mq) => {
      if (mq.matches) setMenu(false);
    });
  }

  /* =========================================================
     Active nav link while scrolling
     ========================================================= */
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* =========================================================
     FAQ accordion (US09)
     ========================================================= */
  function initFaq() {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        const answer = document.getElementById(btn.getAttribute("aria-controls"));
        btn.setAttribute("aria-expanded", String(!expanded));
        answer.hidden = expanded;
        btn.closest(".faq-item").classList.toggle("is-open", !expanded);
      });
    });
  }

  /* =========================================================
     Modals: contact (US27) and privacy
     ========================================================= */
  let lastFocused = null;

  function openModal(dialog) {
    if (!dialog) return;
    lastFocused = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.body.classList.add("modal-open");
    const firstField = dialog.querySelector("input, textarea");
    if (firstField) firstField.focus();
  }

  function closeModal(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function initModals() {
    const contactModal = document.getElementById("contact-modal");
    const privacyModal = document.getElementById("privacy-modal");

    document.querySelectorAll("[data-open-contact]").forEach((el) => {
      el.addEventListener("click", () => openModal(contactModal));
    });
    document.querySelectorAll("[data-open-privacy]").forEach((el) => {
      el.addEventListener("click", () => openModal(privacyModal));
    });

    document.querySelectorAll(".modal").forEach((dialog) => {
      dialog.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => closeModal(dialog));
      });
      // Click on the backdrop closes the dialog
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) closeModal(dialog);
      });
      dialog.addEventListener("close", () => {
        document.body.classList.remove("modal-open");
        if (lastFocused) lastFocused.focus();
      });
    });
  }

  /* =========================================================
     Contact form validation + simulated submit (US27)
     ========================================================= */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateField(input) {
    const value = input.value.trim();
    if (!value) return "form.errRequired";
    if (input.type === "email" && !EMAIL_RE.test(value)) return "form.errEmail";
    if (input.name === "message" && value.length < 10) return "form.errMessage";
    return null;
  }

  function showError(input, key) {
    const field = input.closest(".field");
    const error = field.querySelector(".field-error");
    if (!error.id) error.id = input.id + "-error";

    field.classList.toggle("has-error", Boolean(key));
    input.setAttribute("aria-invalid", String(Boolean(key)));
    if (key) {
      error.dataset.errorKey = key;
      error.textContent = t(key);
      error.hidden = false;
      input.setAttribute("aria-describedby", error.id);
    } else {
      delete error.dataset.errorKey;
      error.textContent = "";
      error.hidden = true;
      input.removeAttribute("aria-describedby");
    }
  }

  // Re-translate visible errors and status after a language change
  function refreshErrors(form) {
    form.querySelectorAll(".field-error[data-error-key]").forEach((el) => {
      el.textContent = t(el.dataset.errorKey);
    });
    const status = form.querySelector(".form-status");
    if (status && status.dataset.statusKey) status.textContent = t(status.dataset.statusKey);
  }

  function initForms() {
    document.querySelectorAll(".contact-form").forEach((form) => {
      const inputs = form.querySelectorAll(".field-input");
      const submit = form.querySelector('[type="submit"]');
      const status = form.querySelector(".form-status");

      inputs.forEach((input) => {
        input.addEventListener("blur", () => {
          if (input.value.trim()) showError(input, validateField(input));
        });
        input.addEventListener("input", () => {
          if (input.closest(".field").classList.contains("has-error")) {
            showError(input, validateField(input));
          }
        });
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        status.textContent = "";
        delete status.dataset.statusKey;

        let firstInvalid = null;
        inputs.forEach((input) => {
          const err = validateField(input);
          showError(input, err);
          if (err && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) {
          firstInvalid.focus();
          return;
        }

        // No backend for the landing page yet: simulate the request.
        submit.disabled = true;
        submit.textContent = t("form.sending");
        window.setTimeout(() => {
          submit.disabled = false;
          submit.textContent = t("form.submit");
          form.reset();
          status.dataset.statusKey = "form.success";
          status.textContent = t("form.success");
        }, 800);
      });
    });
  }

  /* =========================================================
     Floating contact button (mobile) + reveal on scroll
     ========================================================= */
  function initFab() {
    const fab = document.querySelector(".fab");
    const hero = document.querySelector(".hero");
    const contact = document.getElementById("contact");
    if (!fab || !hero || !("IntersectionObserver" in window)) {
      if (fab) fab.classList.add("is-visible");
      return;
    }

    let heroVisible = true;
    let contactVisible = false;
    const update = () => fab.classList.toggle("is-visible", !heroVisible && !contactVisible);

    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([entry]) => { contactVisible = entry.isIntersecting; update(); }).observe(contact);
  }

  function initReveal() {
    const items = document.querySelectorAll(
      ".section-header, .feature-card, .step, .segment-card, .faq-item, .split-text, .media-card, .form-panel"
    );
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => {
      if (el.closest(".hero")) return; // above the fold: show immediately
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* ---------- Init ---------- */
  document.getElementById("year").textContent = String(new Date().getFullYear());
  initLanguage();
  initHeader();
  initScrollSpy();
  initFaq();
  initModals();
  initForms();
  initFab();
  initReveal();
})();
