/* =========================================================
   INITIAL SETUP & HELPERS
   ========================================================= */

// Initialize AOS scroll animations
document.addEventListener("DOMContentLoaded", () => {
    if (typeof AOS !== "undefined") {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: true,
            offset: 80
        });
    }

    initThemeToggle();
    initNavScrollBehavior();
    initMobileNav();
    initTypingEffect();
    initRippleEffects();
    initHeroParticles();
    initProjectModal();
});

/* Utility: safe query */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/* =========================================================
   THEME TOGGLE (LIGHT / DARK)
   ========================================================= */

function initThemeToggle() {
    const body = document.body;
    const toggleBtn = $("#themeToggle");
    const icon = toggleBtn ? toggleBtn.querySelector(".toggle-icon") : null;

    if (!toggleBtn || !icon) return;

    // Restore saved theme if exists
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    }

    toggleBtn.addEventListener("click", () => {
        const isDark = body.classList.toggle("dark-theme");
        body.classList.toggle("light-theme", !isDark);

        icon.classList.toggle("fa-moon", !isDark);
        icon.classList.toggle("fa-sun", isDark);

        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

/* =========================================================
   NAVBAR SCROLL & ACTIVE LINK
   ========================================================= */

function initNavScrollBehavior() {
    const navLinks = $$(".nav-link");
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    // Highlight active section link
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute("id");
                const link = navLinks.find(l => l.getAttribute("href") === `#${id}`);
                if (entry.isIntersecting && link) {
                    navLinks.forEach(l => l.classList.remove("active-link"));
                    link.classList.add("active-link");
                }
            });
        },
        { threshold: 0.4 }
    );

    sections.forEach(section => observer.observe(section));
}

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNav() {
    const navToggle = $("#navToggle");
    const navCenter = $(".nav-center");
    const navLinks = $$(".nav-link");

    if (!navToggle || !navCenter) return;

    navToggle.addEventListener("click", () => {
        const isOpen = navCenter.classList.toggle("open");
        navToggle.classList.toggle("open", isOpen);
    });

    // Close nav when clicking any link (mobile)
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navCenter.classList.remove("open");
            navToggle.classList.remove("open");
        });
    });
}

/* =========================================================
   TYPING EFFECT (HERO ROLES)
   ========================================================= */

function initTypingEffect() {
    const typingEl = $("#typingText");
    if (!typingEl) return;

    const roles = [
        "Full Stack PHP Developer",
        "Backend Developer",
        "Laravel Developer"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typingSpeed = 90;
    const deletingSpeed = 60;
    const pauseBetween = 1200;

    function type() {
        const currentRole = roles[roleIndex];
        const currentText = currentRole.substring(0, charIndex);

        typingEl.textContent = currentText;

        if (!isDeleting && charIndex < currentRole.length) {
            charIndex++;
            setTimeout(type, typingSpeed);
        } else if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            setTimeout(type, pauseBetween);
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
            setTimeout(type, deletingSpeed);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(type, typingSpeed);
        }
    }

    type();
}

/* =========================================================
   BUTTON RIPPLE EFFECT
   ========================================================= */

function initRippleEffects() {
    const rippleButtons = $$("[data-ripple]");

    rippleButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement("span");
            ripple.className = "ripple-effect";
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            btn.appendChild(ripple);

            ripple.addEventListener("animationend", () => {
                ripple.remove();
            });
        });
    });
}

/* =========================================================
   HERO BACKGROUND PARTICLES
   ========================================================= */

function initHeroParticles() {
    const container = $("#heroParticles");
    if (!container) return;

    const particleCount = 26;

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement("span");
        p.className = "particle";

        const size = 5 + Math.random() * 7;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;

        const left = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = 16 + Math.random() * 12;

        p.style.left = `${left}%`;
        p.style.bottom = `${-80 - Math.random() * 120}px`;
        p.style.animationDelay = `-${delay}s`;
        p.style.animationDuration = `${duration}s`;

        container.appendChild(p);
    }
}

/* =========================================================
   PROJECT MODAL WITH AUTO-SLIDER
   ========================================================= */

function initProjectModal() {
    const overlay = $("#projectModalOverlay");
    const modal = $("#projectModal");
    const closeBtn = $("#modalClose");
    const slider = $("#modalSlider");
    const indicators = $("#modalIndicators");
    const titleEl = $("#modalTitle");
    const descriptionEl = $("#modalDescription");
    const githubEl = $("#modalGithub");
    const projectCards = $$(".project-card");

    if (!overlay || !modal || !slider || !indicators || !titleEl || !descriptionEl || !githubEl) return;

    let currentSlide = 0;
    let slideInterval = null;

    // Open modal with project data
    projectCards.forEach(card => {
        card.addEventListener("click", e => {
            // Ignore clicks directly on GitHub link (let it open normally)
            if (e.target.closest(".project-link")) return;

            const dataStr = card.getAttribute("data-project") || "{}";
            let data = {};
            try {
                data = JSON.parse(dataStr);
            } catch {
                data = {};
            }

            const { title = "Project", description = "", github = "#", images = [] } = data;

            // Set text content
            titleEl.textContent = title;
            descriptionEl.textContent = description;
            githubEl.href = github || "#";

            // Reset slider
            slider.innerHTML = "";
            indicators.innerHTML = "";
            currentSlide = 0;
            clearInterval(slideInterval);

            const imageList = images && images.length ? images : ["", "", ""];

            imageList.forEach((src, index) => {
                const slide = document.createElement("div");
                slide.className = "modal-slide";

                // PLACE MULTIPLE PROJECT IMAGES HERE
                const img = document.createElement("img");
                img.src = src || "";
                img.alt = `${title} preview ${index + 1}`;
                slide.appendChild(img);

                slider.appendChild(slide);

                const dot = document.createElement("button");
                dot.className = "modal-dot";
                if (index === 0) dot.classList.add("active");
                dot.type = "button";
                dot.addEventListener("click", () => goToSlide(index));
                indicators.appendChild(dot);
            });

            overlay.classList.add("open");
            overlay.setAttribute("aria-hidden", "false");

            if (imageList.length > 1) {
                slideInterval = setInterval(() => {
                    goToSlide((currentSlide + 1) % imageList.length);
                }, 1100);
            }
        });
    });

    // Slide change logic
    function goToSlide(index) {
        const slides = $$(".modal-slide", slider);
        if (!slides.length) return;

        currentSlide = index;
        const offset = -index * 100;
        slider.style.transform = `translateX(${offset}%)`;

        const dots = $$(".modal-dot", indicators);
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === index);
        });
    }

    // Close modal
    function closeModal() {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
        clearInterval(slideInterval);
        slideInterval = null;
    }

    closeBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", e => {
        if (e.target === overlay) {
            closeModal();
        }
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && overlay.classList.contains("open")) {
            closeModal();
        }
    });
}