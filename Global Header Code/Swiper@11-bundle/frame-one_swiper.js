!(function () {
  "use strict";
  if ("undefined" == typeof Swiper) return;
  function e() {
    const e = document.querySelectorAll('[data-slider="slider"]');
    0 !== e.length &&
      e.forEach((e, t) => {
        n(e, t);
      });
  }
  let t;
  function n(e, t) {
    try {
      !(function (e) {
        [".w-dyn-list", ".w-dyn-items", ".w-dyn-item"].forEach((t) => {
          e.querySelectorAll(t).forEach((e) => {
            (Array.from(e.childNodes).forEach((t) => {
              e.parentNode.insertBefore(t, e);
            }),
              e.remove());
          });
        });
      })(e);
      const t = (function (e) {
          const t = getComputedStyle(e),
            n = parseFloat(t.getPropertyValue("--xs").trim()) || 1,
            r = parseFloat(t.getPropertyValue("--sm").trim()) || 1,
            i = parseFloat(t.getPropertyValue("--md").trim()) || 2,
            o = parseFloat(t.getPropertyValue("--lg").trim()) || 3,
            a = parseInt(t.getPropertyValue("--gap").trim()) || 24,
            s = {
              breakpoints: {
                0: { slidesPerView: n, spaceBetween: a },
                480: { slidesPerView: r, spaceBetween: a },
                768: { slidesPerView: i, spaceBetween: a },
                992: { slidesPerView: o, spaceBetween: a },
              },
              watchSlidesProgress: !0,
              simulateTouch: !0,
              allowTouchMove: !0,
              keyboard: { enabled: !0, onlyInViewport: !0 },
              a11y: { enabled: !0 },
              watchOverflow: !0,
              normalizeSlideIndex: !1,
              roundLengths: !1,
            },
            l = e.dataset.grabCursor;
          s.grabCursor = "false" !== l;
          const d = e.closest('[data-slider="component"]'),
            c = d.querySelector('[data-slider="next"]'),
            u = d.querySelector('[data-slider="previous"]');
          c && u && (s.navigation = { nextEl: c, prevEl: u });
          const p = d.querySelector('[data-slider="pagination"]');
          p &&
            (s.pagination = {
              el: p,
              clickable: !0,
              bulletElement: "button",
              bulletClass: "slider-pagination_button",
              bulletActiveClass: "cc-active",
            });
          if ("true" === e.dataset.loop) {
            ((s.loop = !0), (s.loopFillGroupWithBlank = !0));
            const t = e.dataset.loopAdditionalSlides;
            t && !isNaN(t) && (s.loopAdditionalSlides = parseInt(t));
          }
          const f = e.dataset.autoplay;
          f &&
            "false" !== f &&
            !isNaN(f) &&
            (s.autoplay = {
              delay: parseInt(f),
              disableOnInteraction: !1,
              pauseOnMouseEnter: !0,
            });
          // Zoom implies centered: a single toggle centers the active slide
          // and lets the CSS scale it. The .is-zoom class hooks the styles.
          if ("true" === e.dataset.zoom) {
            e.dataset.centered = "true";
            e.classList.add("is-zoom");
          }
          if ("true" === e.dataset.centered) {
            s.centeredSlides = !0;
            // centeredSlidesBounds breaks loop mode, so only clamp when not looping
            s.centeredSlidesBounds = "true" !== e.dataset.loop;
          }
          "fade" === e.dataset.effect &&
            ((s.effect = "fade"), (s.fadeEffect = { crossFade: !0 }));
          const w = e.dataset.speed;
          w && !isNaN(w) && (s.speed = parseInt(w));
          return s;
        })(e),
        n = new Swiper(e, t);
      ((e.swiperInstance = n),
        (function (e, t) {
          function n() {
            const t = e.querySelectorAll(".swiper-slide");
            if (0 === t.length) return;
            let n = 0;
            (t.forEach((e) => {
              e.style.height = "auto";
              const t = e.offsetHeight;
              t > n && (n = t);
            }),
              n > 0 && (e.style.height = n + "px"));
          }
          (n(),
            t.on("slideChange", n),
            t.on("slideChangeTransitionEnd", n),
            t.on("touchEnd", n),
            t.on("resize", n));
        })(e, n));
    } catch (e) {
      "undefined" != typeof console &&
        console.error &&
        console.error("Swiper initialization failed:", e);
    }
  }
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", e)
    : e(),
    window.addEventListener("resize", function () {
      (clearTimeout(t),
        (t = setTimeout(() => {
          window.AttributesSwiper &&
            window.AttributesSwiper.reinitialize &&
            window.AttributesSwiper.reinitialize();
        }, 250)));
    }),
    (window.AttributesSwiper = {
      reinitialize: function () {
        if ("undefined" == typeof Swiper) return;
        const e = document.querySelectorAll('[data-slider="slider"]');
        (e.forEach((e) => {
          e.swiperInstance && e.swiperInstance.destroy(!0, !0);
        }),
          setTimeout(() => {
            e.forEach((e, t) => {
              n(e);
            });
          }, 50));
      },
      getInstance: function (e) {
        const t = document.querySelectorAll('[data-slider="slider"]');
        return t[e] && t[e].swiperInstance ? t[e].swiperInstance : null;
      },
    }));
})();

/* ==========================================================================
   LIGHTBOX + ZOOM SLIDER + MOBILE-ONLY CONTROL
   Self-contained block. Runs after Swiper (defined above) is available.
   ========================================================================== */
(function () {
  "use strict";

  const MOBILE_BREAKPOINT = 767;

  // ─── Lightbox state ────────────────────────────────────────────────────────
  let lightboxEl = null;
  let lightboxMountEl = null;
  let lightboxNavEl = null; // cloned nav lives here
  let lightboxSwiper = null; // the single-view swiper built inside the lightbox
  let clonedNavEl = null; // the actual cloned .slider-nav node

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  // ─── Lightbox DOM (injected once) ─────────────────────────────────────────
  function ensureLightbox() {
    if (lightboxEl) return;

    lightboxEl = document.createElement('div');
    lightboxEl.setAttribute('data-swiper-lightbox', '');
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Slide gallery');
    lightboxEl.innerHTML = `
      <div data-swiper-lightbox-backdrop></div>
      <div data-swiper-lightbox-dialog>
        <button data-swiper-lightbox-close aria-label="Close gallery" type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div data-swiper-lightbox-mount></div>
        <div data-swiper-lightbox-nav></div>
      </div>
    `;

    Object.assign(lightboxEl.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      display: 'none', // controlled explicitly, not via [hidden]
      alignItems: 'center',
      justifyContent: 'center',
    });

    const backdrop = lightboxEl.querySelector('[data-swiper-lightbox-backdrop]');
    Object.assign(backdrop.style, {
      position: 'absolute',
      inset: '0',
      background: 'rgba(0,0,0,0.85)',
    });

    const dialog = lightboxEl.querySelector('[data-swiper-lightbox-dialog]');
    Object.assign(dialog.style, {
      position: 'relative',
      zIndex: '1',
      width: 'min(100vw - 2rem, 1200px)',
      maxHeight: '80vh',
      overflow: 'hidden',
    });

    const closeBtn = lightboxEl.querySelector('[data-swiper-lightbox-close]');
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '0.75rem',
      right: '0.75rem',
      zIndex: '10',
      background: 'rgba(0,0,0,0.55)',
      border: 'none',
      borderRadius: '50%',
      width: '2.5rem',
      height: '2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
    });

    lightboxMountEl = lightboxEl.querySelector('[data-swiper-lightbox-mount]');
    Object.assign(lightboxMountEl.style, { width: '100%' });

    lightboxNavEl = lightboxEl.querySelector('[data-swiper-lightbox-nav]');
    Object.assign(lightboxNavEl.style, { width: '100%' });

    backdrop.addEventListener('click', closeLightbox);
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxEl.style.display !== 'none') closeLightbox();
    });

    document.body.appendChild(lightboxEl);
  }

  // ─── Wire cloned nav buttons to the moved Swiper instance ─────────────────
  function wireClonedNav(clonedNav, swiperInstance) {
    const prevBtn = clonedNav.querySelector('[data-slider="previous"]');
    const nextBtn = clonedNav.querySelector('[data-slider="next"]');
    const pagBtns = clonedNav.querySelectorAll('[data-slider="pagination"] button, .slider-pagination_button');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        swiperInstance.slidePrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        swiperInstance.slideNext();
      });
    }

    pagBtns.forEach((btn, i) => {
      btn.addEventListener('click', () => swiperInstance.slideTo(i));
    });
  }

  // ─── Open ──────────────────────────────────────────────────────────────────
  function openLightbox(component) {
    ensureLightbox();

    const sliderEl = component.querySelector('[data-slider="slider"]');
    if (!sliderEl) {
      console.warn('[Lightbox] No [data-slider="slider"] found inside component', component);
      return;
    }

    const originalSwiper = sliderEl.swiper || null;
    const startIndex = originalSwiper ? originalSwiper.realIndex || 0 : 0;

    const originalSlides = sliderEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
    if (!originalSlides.length) {
      console.warn('[Lightbox] No slides found to display', sliderEl);
      return;
    }

    lightboxMountEl.innerHTML = `
      <style>
      /* Neutralize the Webflow image component wrapper inside the lightbox */
      [data-swiper-lightbox] .lightbox-swiper .swiper-slide .img-component,
      [data-swiper-lightbox] .lightbox-swiper .swiper-slide [data-wf--image--aspect-ratio],
      [data-swiper-lightbox] .lightbox-swiper .swiper-slide .u-h-100 {
          aspect-ratio: auto !important;
          height: auto !important;
          width: auto !important;
          max-width: 100%;
          display: block;
      }
      [data-swiper-lightbox] .lightbox-swiper .swiper-slide img {
          position: static !important;
          object-fit: contain !important;
          width: auto !important;
          height: auto !important;
          max-width: 100%;
          max-height: 85vh;
          display: block;
          margin: 0 auto;
      }
      [data-swiper-lightbox] .lightbox-swiper {
          width: 100%;
      }
      [data-swiper-lightbox] .lightbox-swiper .swiper-slide {
          width: 100% !important;
          margin-right: 0 !important;
      }
      /* Cloned nav: only the buttons are clickable */
      [data-swiper-lightbox] [data-swiper-lightbox-nav] {
          pointer-events: none;
      }
      [data-swiper-lightbox] [data-swiper-lightbox-nav] .button,
      [data-swiper-lightbox] [data-swiper-lightbox-nav] [data-slider] {
          pointer-events: auto;
      }
      </style>

      <div class="swiper lightbox-swiper">
        <div class="swiper-wrapper"></div>
      </div>
    `;

    const lbSwiperEl = lightboxMountEl.querySelector('.lightbox-swiper');
    const lbWrapper = lbSwiperEl.querySelector('.swiper-wrapper');

    originalSlides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.removeAttribute('style');
      clone.classList.remove('swiper-slide-active', 'swiper-slide-next', 'swiper-slide-prev', 'swiper-slide-visible', 'swiper-slide-duplicate');
      lbWrapper.appendChild(clone);
    });

    lightboxEl.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    lightboxSwiper = new window.Swiper(lbSwiperEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: originalSlides.length > 1,
      initialSlide: startIndex,
      observer: true,
      observeParents: true,
    });

    const originalNav = component.querySelector('.slider-nav');
    if (originalNav) {
      clonedNavEl = originalNav.cloneNode(true);
      clonedNavEl.style.display = '';
      lightboxNavEl.appendChild(clonedNavEl);
      wireClonedNav(clonedNavEl, lightboxSwiper);
    }

    requestAnimationFrame(() => {
      if (lightboxSwiper) lightboxSwiper.update();
    });
  }

  // ─── Close ─────────────────────────────────────────────────────────────────
  function closeLightbox() {
    if (lightboxSwiper) {
      try {
        lightboxSwiper.destroy(true, true);
      } catch (_) {}
      lightboxSwiper = null;
    }
    if (clonedNavEl) {
      clonedNavEl.remove();
      clonedNavEl = null;
    }
    if (lightboxMountEl) lightboxMountEl.innerHTML = '';
    if (lightboxEl) lightboxEl.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ─── Bind [data-swiper-lightbox-trigger] buttons ──────────────────────────
  function bindLightboxTriggers() {
    const triggers = document.querySelectorAll('[data-swiper-lightbox-trigger]');
    if (!triggers.length) return;

    triggers.forEach((btn) => {
      if (btn._lightboxBound) return;
      btn._lightboxBound = true;

      btn.addEventListener('click', () => {
        const targetSelector = btn.dataset.swiperLightboxTarget;
        let component = null;

        if (targetSelector) {
          component = document.querySelector(targetSelector);
        } else {
          component = btn.closest('[data-slider="component"]');

          if (!component) {
            let sibling = btn.nextElementSibling;
            while (sibling) {
              component = sibling.matches('[data-slider="component"]') ? sibling : sibling.querySelector('[data-slider="component"]');
              if (component) break;
              sibling = sibling.nextElementSibling;
            }
          }

          if (!component) {
            let parentSibling = btn.parentElement?.nextElementSibling;
            while (parentSibling) {
              component = parentSibling.matches('[data-slider="component"]') ? parentSibling : parentSibling.querySelector('[data-slider="component"]');
              if (component) break;
              parentSibling = parentSibling.nextElementSibling;
            }
          }

          if (!component) {
            component = document.querySelector('[data-slider="component"]');
          }
        }

        if (!component) {
          console.warn('[Lightbox] Could not find [data-slider="component"] for trigger', btn);
          return;
        }

        openLightbox(component);
      });
    });
  }

  // ─── Zoom Slider Init ──────────────────────────────────────────────────────
  function initZoomSliders() {
    const zoomEls = document.querySelectorAll('[data-slider="zoom-slider"]');
    if (!zoomEls.length) return;
    if (typeof window.Swiper === 'undefined') return;

    zoomEls.forEach((swiperEl) => {
      if (swiperEl.swiper) return;

      new window.Swiper(swiperEl, {
        slidesPerView: 'auto',
        spaceBetween: 12,
        loop: false,
        freeMode: true,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        zoom: true,
        touchStartPreventDefault: false,
        mousewheel: {
          enabled: false,
        },
      });
    });
  }

  // ─── Destroy Swiper on an element ─────────────────────────────────────────
  function destroySwiperOnEl(sliderEl) {
    if (!sliderEl.swiper) return;

    try {
      sliderEl.swiper.off();
    } catch (_) {}

    sliderEl.swiper.destroy(true, true);

    const parent = sliderEl.parentNode;
    if (parent) {
      const clone = sliderEl.cloneNode(true);
      clone.removeAttribute('style');
      clone.querySelectorAll('.swiper-wrapper').forEach((el) => el.removeAttribute('style'));
      clone.querySelectorAll('.swiper-slide').forEach((el) => el.removeAttribute('style'));
      clone.querySelectorAll('.swiper-slide-duplicate').forEach((el) => el.remove());
      parent.replaceChild(clone, sliderEl);
    }

    const component = (parent ? parent.closest('[data-slider="component"]') : null) || sliderEl.closest('[data-slider="component"]');
    if (component) {
      const nav = component.querySelector('.slider-nav');
      if (nav) nav.style.display = 'none';
    }
  }

  // ─── Init Swiper on an element ────────────────────────────────────────────
  function initSwiperOnEl(sliderEl) {
    if (sliderEl.swiper) return;

    const component = sliderEl.closest('[data-slider="component"]');
    if (!component) return;

    const style = getComputedStyle(component);
    const lgCols = parseInt(component.style.getPropertyValue('--lg') || style.getPropertyValue('--lg')) || 3;
    const mdCols = parseInt(component.style.getPropertyValue('--md') || style.getPropertyValue('--md')) || 3;
    const smCols = parseInt(component.style.getPropertyValue('--sm') || style.getPropertyValue('--sm')) || 2;
    const xsCols = parseInt(component.style.getPropertyValue('--xs') || style.getPropertyValue('--xs')) || 1;

    if (typeof window.Swiper === 'undefined') return;

    new window.Swiper(sliderEl, {
      slidesPerView: xsCols,
      spaceBetween: 16,
      loop: false,
      observer: true,
      observeParents: true,
      breakpoints: {
        480: { slidesPerView: smCols, spaceBetween: 16 },
        768: { slidesPerView: mdCols, spaceBetween: 24 },
        992: { slidesPerView: lgCols, spaceBetween: 24 },
      },
      navigation: {
        nextEl: component.querySelector('.swiper-button-next'),
        prevEl: component.querySelector('.swiper-button-prev'),
      },
      pagination: {
        el: component.querySelector('.swiper-pagination'),
        clickable: true,
      },
    });

    const nav = component.querySelector('.slider-nav');
    if (nav) nav.style.display = '';
  }

  // ─── Responsive controller (mobile-only sliders) ──────────────────────────
  function setupMobileOnlyResponsiveControl() {
    const mobileOnlyComponents = document.querySelectorAll('[data-slider="component"][data-mobile-only="true"]');
    if (!mobileOnlyComponents.length) return;

    function handleBreakpoint() {
      mobileOnlyComponents.forEach((component) => {
        const sliderEl = component.querySelector('[data-slider="slider"]');
        if (!sliderEl) return;

        if (isMobile()) {
          if (sliderEl.swiper) {
            const nav = component.querySelector('.slider-nav');
            if (nav) nav.style.display = '';
          } else {
            initSwiperOnEl(sliderEl);
          }
        } else {
          if (sliderEl.swiper) {
            destroySwiperOnEl(sliderEl);
          } else {
            const nav = component.querySelector('.slider-nav');
            if (nav) nav.style.display = 'none';
          }
        }
      });
    }

    handleBreakpoint();

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleBreakpoint, 150);
    });
  }

  // ─── Init everything once the DOM is ready ────────────────────────────────
  function initAll() {
    initZoomSliders();
    setTimeout(setupMobileOnlyResponsiveControl, 200);
    bindLightboxTriggers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();