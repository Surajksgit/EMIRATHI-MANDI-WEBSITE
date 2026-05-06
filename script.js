// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// 1. Initialize Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential ease out
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Sync ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0); // Prevents GSAP from skipping frames for smooth scroll

// 2. Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const magneticElements = document.querySelectorAll('.magnetic, a, button');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Track mouse
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Animate cursor with GSAP ticker for fluidity
gsap.ticker.add(() => {
    const ease = 0.15; // Lower is smoother but slower delay
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;
    
    gsap.set(cursor, {
        x: cursorX,
        y: cursorY
    });
});

// 3. Magnetic Hover Physics & Cursor States
magneticElements.forEach((el) => {
    // Enter hover state
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
    });
    
    // Leave hover state & reset magnetic position
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.4)" // Bouncy satisfying snap back
        });
    });
    
    // Magnetic pull math
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const strength = el.dataset.strength || 30; // Customize pull strength via HTML data attr
        
        // Calculate distance from center
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(el, {
            x: (x * strength) / 100,
            y: (y * strength) / 100,
            duration: 0.4,
            ease: "power2.out"
        });
    });
});


// 4. GSAP Scroll Animations

// A. Hero Entry Animation Set
const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });

// Reveal text lines staggering upwards
heroTimeline.to('.hero-title .word', {
    y: '0%',
    duration: 1.6,
    stagger: 0.12,
    delay: 0.2
});

// Reveal image container
heroTimeline.fromTo('.hero-img-container', 
    { clipPath: 'inset(100% 0% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8 },
    "-=1.2"
);

// B. Hero Image Scale Down on Scroll
// As we scroll down, the hero image container shrinks
gsap.to('.hero-img-container', {
    scale: 0.85,
    borderRadius: '20px',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// Inner image parallax
gsap.to('.hero-img', {
    yPercent: 15, // Creates a subtle upward shifting visual inside mask
    ease: 'none',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// C. About Section Reveal Scale (0.9 to 1.0)
gsap.fromTo('.reveal-img', 
    {
        scale: 0.9,
    },
    {
        scale: 1,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.about-img-reveal',
            start: 'top 85%', // Triggers slightly before element enters view
            end: 'center center',
            scrub: 1 // smooth scrubbing catch-up
        }
    }
);

// Text reveal in about section
gsap.from('.section-title, .body-text, .btn-secondary', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about-text',
        start: 'top 80%'
    }
});

// D. Menu Section Parallax Background (Sticky Pinning)
// The background stays pinned (via CSS sticky) while the content panels slide over
// We add a slow scale effect to the background while scrolling through the menu section
gsap.fromTo('.menu-bg img', 
    { scale: 1 },
    {
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
            trigger: '.menu-showcase',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    }
);

// Menu panel slide-in staggered effect
gsap.from('.menu-items li', {
    x: 50,
    opacity: 0,
    stagger: 0.1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.menu-panel',
        start: 'top 75%'
    }
});





// Testimonials Slider Logic
const sliderTrack = document.querySelector('.slider-track');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
const testimonialCards = document.querySelectorAll('.testimonial-card');

if (sliderTrack && nextBtn && prevBtn && testimonialCards.length > 0) {
    let currentIndex = 0;

    function updateSlider() {
        const cardWidth = testimonialCards[0].offsetWidth;
        const gap = parseFloat(getComputedStyle(sliderTrack).gap) || 0;
        const moveDistance = currentIndex * (cardWidth + gap);
        
        sliderTrack.style.transform = `translateX(-${moveDistance}px)`;
        
        // Optional: Disable buttons at ends
        prevBtn.style.opacity = currentIndex === 0 ? "0.3" : "1";
        prevBtn.style.pointerEvents = currentIndex === 0 ? "none" : "auto";
        
        const visibleCards = window.innerWidth > 1200 ? 3 : (window.innerWidth > 768 ? 2 : 1);
        const maxIndex = testimonialCards.length - visibleCards;
        
        nextBtn.style.opacity = currentIndex >= maxIndex ? "0.3" : "1";
        nextBtn.style.pointerEvents = currentIndex >= maxIndex ? "none" : "auto";
    }

    nextBtn.addEventListener('click', () => {
        const visibleCards = window.innerWidth > 1200 ? 3 : (window.innerWidth > 768 ? 2 : 1);
        const maxIndex = testimonialCards.length - visibleCards;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });

    // Update slider on resize to keep alignment
    window.addEventListener('resize', () => {
        currentIndex = 0; // Reset to start on resize for simplicity
        updateSlider();
    });

    // Initial call
    updateSlider();
}

// Testimonials Scroll Animation
gsap.from(".testimonial-card", {
    scrollTrigger: {
        trigger: ".testimonial-slider-container",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    y: 100,
    opacity: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: "power4.out"
});

// E. Order Online Phone Reveal Animation
gsap.to(".phone-reveal", {
    scrollTrigger: {
        trigger: ".order-online",
        start: "top 60%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
    },
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    duration: 1.5,
    ease: "back.out(1.7)" // Adds a nice "pop" overshoot
});

// Floating Decorative Images for Order Online
gsap.to(".float-img-left", {
    scrollTrigger: {
        trigger: ".order-online",
        start: "top 70%",
        toggleActions: "play none none reverse"
    },
    opacity: 0.8,
    x: 0,
    rotate: 0,
    duration: 1.5,
    ease: "power3.out"
});

gsap.to(".float-img-right", {
    scrollTrigger: {
        trigger: ".order-online",
        start: "top 70%",
        toggleActions: "play none none reverse"
    },
    opacity: 0.8,
    x: 0,
    rotate: 0,
    duration: 1.5,
    ease: "power3.out"
});

// More Info Reveal Animation
gsap.to(".reveal-info", {
    scrollTrigger: {
        trigger: ".more-info",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out"
});

// Magnetic effect re-run for all magnetic items
const magneticItems = document.querySelectorAll('.magnetic');
magneticItems.forEach((el) => {
    el.addEventListener('mousemove', function(e) {
        const strength = this.getAttribute('data-strength') || 20;
        const boundingRect = this.getBoundingClientRect();
        const relX = e.pageX - boundingRect.left - window.scrollX;
        const relY = e.pageY - boundingRect.top - window.scrollY;

        gsap.to(this, {
            x: (relX - boundingRect.width / 2) / boundingRect.width * strength,
            y: (relY - boundingRect.height / 2) / boundingRect.height * strength,
            duration: 0.6,
            ease: "power2.out"
        });
    });
    el.addEventListener('mouseleave', function() {
        gsap.to(this, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// 5. Back to Top & WhatsApp CTA Logic
const backToTopBtn = document.getElementById('backToTop');
const whatsappBtn = document.querySelector('.whatsapp-cta');

if (backToTopBtn || whatsappBtn) {
    // Show/hide buttons on scroll
    lenis.on('scroll', ({ scroll }) => {
        // Back to Top logic
        if (backToTopBtn) {
            if (scroll > 500) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
        }

        // WhatsApp CTA logic
        if (whatsappBtn) {
            if (scroll > 300) {
                whatsappBtn.classList.add('active');
            } else {
                whatsappBtn.classList.remove('active');
            }
        }
    });

    // Scroll to top on click
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            lenis.scrollTo(0, {
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        });
    }
}

// 6. FAQ Accordion Logic
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    }
});

// 7. Live Opening Status Logic
function updateOpeningStatus() {
    const statusDots = document.querySelectorAll('.status-dot');
    const statusTexts = document.querySelectorAll('.status-text');
    
    if (statusDots.length === 0) return;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;
    
    // Open from 12:00 PM (12.0) to 12:00 AM (24.0)
    const isOpen = currentTime >= 12 && currentTime < 24;

    statusDots.forEach(dot => {
        if (isOpen) {
            dot.classList.add('open');
        } else {
            dot.classList.remove('open');
        }
    });

    statusTexts.forEach(text => {
        if (isOpen) {
            text.textContent = "Open Now";
            text.style.color = "#00d26a";
        } else {
            text.textContent = "Closed Now";
            text.style.color = "#ff4b4b";
        }
    });
}

// Initial call and update every minute
updateOpeningStatus();
setInterval(updateOpeningStatus, 60000);
