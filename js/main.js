/* Instant Ugen — shared site behaviour. No backend: everything here is client-side. */
(function(){
  "use strict";

  /* ---------- event dates (local time) ---------- */
  var EVENT_START = new Date(2026, 9, 12, 0, 0, 0);   // 12. oktober 2026
  var EVENT_END   = new Date(2026, 9, 18, 23, 59, 0); // 18. oktober 2026
  var WINNERS_AT  = new Date(2026, 10, 15, 12, 0, 0); // 15. november 2026

  function daysUntil(d){
    var ms = d - new Date();
    return Math.max(0, Math.ceil(ms / 86400000));
  }

  function eventPhase(){
    var now = new Date();
    if (now < EVENT_START) return "countdown";
    if (now <= EVENT_END) return "live";
    if (now < WINNERS_AT) return "judging";
    return "winners";
  }

  /* ---------- header: scroll shadow + mobile nav ---------- */
  function initHeader(){
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function(){ header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    var scrim = document.querySelector(".nav-scrim");
    if (!toggle || !nav) return;
    function closeNav(){
      nav.classList.remove("is-open");
      scrim && scrim.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function openNav(){
      nav.classList.add("is-open");
      scrim && scrim.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
    toggle.addEventListener("click", function(){
      nav.classList.contains("is-open") ? closeNav() : openNav();
    });
    scrim && scrim.addEventListener("click", closeNav);
    nav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeNav); });
    window.addEventListener("keydown", function(e){ if (e.key === "Escape") closeNav(); });
  }

  /* ---------- hero: flexible, time-aware CTA ---------- */
  function initHero(){
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var statusEl = hero.querySelector("[data-hero-status]");
    var headEl = hero.querySelector("[data-hero-head]");
    var ledeEl = hero.querySelector("[data-hero-lede]");
    var ctaEl = hero.querySelector("[data-hero-cta]");
    var ctaSecEl = hero.querySelector("[data-hero-cta-secondary]");

    var phase = eventPhase();
    var content = {
      countdown: {
        dot: "",
        status: "Om " + daysUntil(EVENT_START) + " dage · uge 42, 12.–18. oktober 2026",
        head: ["INSTANT", "UGEN"],
        lede: '12.–18. oktober <span class="yr">2026</span>',
        cta: { text: "Gem datoen", action: "save-date" },
        secondary: { text: "Se hvordan du deltager", href: "#sadan" }
      },
      live: {
        dot: "is-live",
        status: "I gang nu · uge 42, 12.–18. oktober 2026",
        head: ["INSTANT", "UGEN ER I GANG"],
        lede: '12.–18. oktober <span class="yr">2026</span>',
        cta: { text: "Del dit instant", href: "del-dine-instants.html" },
        secondary: { text: "Se inspiration", href: "#inspiration" }
      },
      judging: {
        dot: "",
        status: "Indsendelse lukket · dommerne kigger på jeres instants",
        head: ["TAK FOR", "INSTANTS"],
        lede: 'Vinder kåres 15. november <span class="yr">2026</span>',
        cta: { text: "Læs om dommerprocessen", href: "info.html#dommerne" },
        secondary: { text: "Se galleriet", href: "#inspiration" }
      },
      winners: {
        dot: "",
        status: "Vinderen er fundet",
        head: ["VINDEREN", "ER FUNDET"],
        lede: '15. november <span class="yr">2026</span>',
        cta: { text: "Se vinderen", href: "vindere-og-nominerede.html" },
        secondary: { text: "Se galleriet", href: "#inspiration" }
      }
    }[phase];

    hero.setAttribute("data-state", phase);
    if (statusEl){
      statusEl.innerHTML = '<span class="dot ' + content.dot + '"></span><span>' + content.status + "</span>";
    }
    if (headEl) headEl.innerHTML = content.head[0] + "<br><em>" + content.head[1] + "</em>";
    if (ledeEl) ledeEl.innerHTML = content.lede;
    if (ctaEl){
      ctaEl.textContent = content.cta.text;
      if (content.cta.action === "save-date"){
        ctaEl.setAttribute("href", "#");
        ctaEl.addEventListener("click", function(e){ e.preventDefault(); downloadIcs(); });
      } else {
        ctaEl.setAttribute("href", content.cta.href);
      }
    }
    if (ctaSecEl){
      ctaSecEl.textContent = content.secondary.text;
      ctaSecEl.setAttribute("href", content.secondary.href);
    }
  }

  /* ---------- micro-conversion: gem datoen (.ics download) ---------- */
  function pad(n){ return String(n).padStart(2, "0"); }
  function icsDate(d){
    return d.getUTCFullYear() + pad(d.getUTCMonth()+1) + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
  }
  function downloadIcs(){
    var start = new Date(Date.UTC(2026, 9, 12, 7, 0, 0));
    var end = new Date(Date.UTC(2026, 9, 18, 20, 0, 0));
    var ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Instant Ugen//DA","CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:instant-ugen-2026@instantugen.dk",
      "DTSTAMP:" + icsDate(new Date()),
      "DTSTART:" + icsDate(start),
      "DTEND:" + icsDate(end),
      "SUMMARY:Instant Ugen 2026",
      "DESCRIPTION:Find dit instant-kamera frem og del dine fotos på instantugen.dk",
      "URL:https://instantugen.dk",
      "END:VEVENT","END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "instant-ugen-2026.ics";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Datoen er gemt — tjek dine downloads");
  }

  /* ---------- micro-conversion: del med en ven ---------- */
  function initShareButtons(){
    document.querySelectorAll("[data-share]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var shareData = {
          title: "Instant Ugen",
          text: "Instant Ugen er tilbage i uge 42 — find dit instant-kamera frem og vær med!",
          url: "https://instantugen.dk"
        };
        if (navigator.share){
          navigator.share(shareData).catch(function(){});
        } else if (navigator.clipboard){
          navigator.clipboard.writeText(shareData.url).then(function(){
            showToast("Link kopieret — send det til en ven");
          });
        } else {
          showToast("Del os på instantugen.dk");
        }
      });
    });
    document.querySelectorAll("[data-save-date]").forEach(function(btn){
      btn.addEventListener("click", function(e){ e.preventDefault(); downloadIcs(); });
    });
  }

  var toastTimer;
  function showToast(msg){
    var toast = document.querySelector(".toast");
    if (!toast){
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(function(){ toast.classList.add("is-shown"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove("is-shown"); }, 3200);
  }
  window.InstantUgen = window.InstantUgen || {};
  window.InstantUgen.showToast = showToast;

  /* ---------- reveal on scroll ---------- */
  function initReveal(){
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)){
      items.forEach(function(i){ i.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .16, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function(i){ io.observe(i); });
  }

  /* ---------- gallery lightbox ---------- */
  function initLightbox(){
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-item]"));
    if (!items.length) return;
    var lb = document.querySelector(".lightbox");
    if (!lb) return;
    var img = lb.querySelector("img");
    var whoEl = lb.querySelector(".who");
    var descEl = lb.querySelector(".desc");
    var idx = 0;

    function open(i){
      idx = (i + items.length) % items.length;
      var it = items[idx];
      img.src = it.getAttribute("data-full") || it.querySelector("img").src;
      img.alt = it.querySelector("img").alt || "";
      whoEl.textContent = it.getAttribute("data-title") || "";
      descEl.textContent = it.getAttribute("data-desc") || "";
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
    }
    function close(){
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
    }
    items.forEach(function(it, i){
      it.addEventListener("click", function(){ open(i); });
    });
    lb.querySelector(".lightbox-close").addEventListener("click", close);
    lb.addEventListener("click", function(e){ if (e.target === lb) close(); });
    var prev = lb.querySelector(".lightbox-prev");
    var next = lb.querySelector(".lightbox-next");
    prev && prev.addEventListener("click", function(){ open(idx - 1); });
    next && next.addEventListener("click", function(){ open(idx + 1); });
    window.addEventListener("keydown", function(e){
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") open(idx - 1);
      if (e.key === "ArrowRight") open(idx + 1);
    });
  }

  /* ---------- footer year ---------- */
  function initYear(){
    document.querySelectorAll("[data-year]").forEach(function(el){ el.textContent = new Date().getFullYear(); });
  }

  /* ---------- smooth momentum scroll (Lenis) ---------- */
  function initSmoothScroll(){
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof window.Lenis !== "function") return;

    var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // let Lenis drive in-page anchor jumps too, instead of native jump-scroll
    document.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var url = new URL(a.href, window.location.href);
        if (url.pathname !== window.location.pathname || !url.hash) return;
        var target = document.querySelector(url.hash);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -78 });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    initHeader();
    initHero();
    initShareButtons();
    initReveal();
    initLightbox();
    initYear();
    initSmoothScroll();
  });
})();
