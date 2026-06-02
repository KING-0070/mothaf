/* Museum of the Land of Frankincense — site scripts */

let currentLanguage = 'ar';

const LANG_CONFIG = {
    ar: { dir: 'rtl', label: 'العربية' },
    en: { dir: 'ltr', label: 'English' },
    de: { dir: 'ltr', label: 'Deutsch' },
    fr: { dir: 'ltr', label: 'Français' },
    it: { dir: 'ltr', label: 'Italiano' }
};

function t(key, lang = currentLanguage) {
    return I18N[lang]?.[key] ?? I18N.ar?.[key] ?? '';
}

function changeLanguage(lang, triggerEl) {
    if (!LANG_CONFIG[lang]) return;
    currentLanguage = lang;

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle('active', isActive);
        if (isActive) btn.setAttribute('aria-current', 'true');
        else btn.removeAttribute('aria-current');
    });

    const { dir } = LANG_CONFIG[lang];
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-rtl', dir === 'rtl');
    document.body.classList.toggle('lang-ltr', dir === 'ltr');

    updatePageText(lang);

    if (triggerEl) {
        try {
            localStorage.setItem('museum-lang', lang);
        } catch (_) { /* ignore */ }
    }
}

function updatePageText(lang) {
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;
        const text = t(key, lang);
        if (!text) return;

        if (element.dataset.html === 'true') {
            element.innerHTML = text;
        } else {
            element.textContent = text;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        const placeholder = t(key, lang);
        if (placeholder) element.placeholder = placeholder;
    });

    document.querySelectorAll('[data-i18n-option]').forEach((element) => {
        const key = element.dataset.i18nOption;
        const label = t(key, lang);
        if (label) element.textContent = label;
    });

    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.setAttribute('aria-label', t('nav.open', lang));
    }

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.setAttribute('aria-label', t('gallery.tag', lang));
    }
}

function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]')?.value || '';
    const email = form.querySelector('[name="email"]')?.value || '';
    const subject = form.querySelector('[name="subject"]')?.value || '';
    const message = form.querySelector('[name="message"]')?.value || '';
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailSubject = encodeURIComponent(subject || 'Museum inquiry');
    window.location.href = `mailto:info@oman.om?subject=${mailSubject}&body=${body}`;

    const status = form.querySelector('.form-status');
    if (status) {
        status.textContent = t('form.thanks');
        status.hidden = false;
    }
    form.reset();
}

function submitTicketForm(event) {
    event.preventDefault();
    const form = event.target;
    const date = form.querySelector('[name="date"]')?.value || '';
    const time = form.querySelector('[name="time"]')?.value || '';
    const adults = form.querySelector('[name="adults"]')?.value || '1';
    const children = form.querySelector('[name="children"]')?.value || '0';
    const name = form.querySelector('[name="name"]')?.value || '';
    const email = form.querySelector('[name="email"]')?.value || '';
    const phone = form.querySelector('[name="phone"]')?.value || '';
    const notes = form.querySelector('[name="notes"]')?.value || '';

    const body = encodeURIComponent(
        `Ticket booking request\n\nDate: ${date}\nTime: ${time}\nAdults: ${adults}\nChildren: ${children}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nNotes:\n${notes}`
    );
    const mailSubject = encodeURIComponent(`Museum tickets — ${date}`);
    window.location.href = `mailto:info@oman.om?subject=${mailSubject}&body=${body}`;

    const status = form.querySelector('.form-status');
    if (status) {
        status.textContent = t('tickets.thanks');
        status.hidden = false;
    }
}

function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    if (!toggle || !nav) return;

    const closeNav = () => {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        if (overlay) overlay.classList.remove('is-visible');
    };

    const openNav = () => {
        nav.classList.add('is-open');
        toggle.classList.add('is-active');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');
        if (overlay) overlay.classList.add('is-visible');
    };

    toggle.addEventListener('click', () => {
        if (nav.classList.contains('is-open')) closeNav();
        else openNav();
    });

    overlay?.addEventListener('click', closeNav);

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeNav();
    });
}

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const onScroll = () => {
        navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

function initScrollReveal() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document
        .querySelectorAll(
            '.reveal, .visit-card, .gallery-item, .exhibit-detailed-card, .unesco-card, .home-card'
        )
        .forEach((el) => observer.observe(el));
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (!lightbox || !lightboxImg) return;

    const open = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        if (lightboxCaption) lightboxCaption.textContent = alt || '';
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
    };

    const close = () => {
        lightbox.hidden = true;
        lightboxImg.src = '';
        document.body.classList.remove('lightbox-open');
    };

    document.querySelectorAll('[data-lightbox]').forEach((img) => {
        img.addEventListener('click', () => open(img.dataset.full || img.src, img.alt));
        img.style.cursor = 'pointer';
    });

    lightbox.querySelector('.lightbox-close')?.addEventListener('click', close);
    lightbox.querySelector('.lightbox-backdrop')?.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.hidden) close();
    });
}

function initActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    const targetFile = page === 'index' ? 'index.html' : `${page}.html`;
    document.querySelectorAll('.nav-links a').forEach((link) => {
        const href = link.getAttribute('href') || '';
        const file = href.split('/').pop() || href;
        link.classList.toggle('active', file === targetFile);
    });
}

function initLazyMap() {
    const map = document.querySelector('.map-lazy');
    if (!map || map.dataset.loaded === 'true') return;

    const load = () => {
        if (map.dataset.loaded === 'true') return;
        const iframe = document.createElement('iframe');
        iframe.src = map.dataset.src;
        iframe.title = map.dataset.title || 'Map';
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        iframe.setAttribute('allowfullscreen', '');
        map.appendChild(iframe);
        map.dataset.loaded = 'true';
    };

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    load();
                    obs.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        obs.observe(map);
    } else {
        load();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof I18N === 'undefined') {
        console.error('Museum site: i18n.js must load before script.js');
        return;
    }

    let savedLang = 'ar';
    try {
        savedLang = localStorage.getItem('museum-lang') || 'ar';
    } catch (_) { /* ignore */ }

    if (!LANG_CONFIG[savedLang]) {
        const browser = navigator.language.slice(0, 2);
        savedLang = LANG_CONFIG[browser] ? browser : 'ar';
    }

    const activeBtn = document.querySelector(`.lang-btn[data-lang="${savedLang}"]`);
    changeLanguage(savedLang, activeBtn);

    document.querySelectorAll('.lang-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            changeLanguage(btn.dataset.lang, btn);
        });
    });

    initNavigation();
    initNavbarScroll();
    initScrollReveal();
    initLightbox();
    initActiveNav();
    initLazyMap();
    initTicketDateMin();

    document.getElementById('year')?.append(new Date().getFullYear().toString());
});

function initTicketDateMin() {
    const dateInput = document.querySelector('.tickets-form [name="date"]');
    if (!dateInput) return;
    const today = new Date().toISOString().slice(0, 10);
    dateInput.min = today;
}
