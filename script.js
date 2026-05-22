function initializeApp() {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in classes
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-right');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // ==========================================
    // Interactive Persona Switcher Engine
    // ==========================================
    const personaBtns = document.querySelectorAll('.persona-btn');
    const filterableItems = document.querySelectorAll('.persona-filterable');

    function filterPersona(targetPersona) {
        // Update active button state
        personaBtns.forEach(btn => {
            if (btn.getAttribute('data-persona') === targetPersona) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Filter and transition items
        filterableItems.forEach(item => {
            const itemPersonasAttr = item.getAttribute('data-persona') || '';
            const itemPersonas = itemPersonasAttr.split(' ');
            const shouldShow = targetPersona === 'all' || itemPersonas.includes(targetPersona);

            if (shouldShow) {
                // To show: set state, remove hidden display first, then fade in
                item.dataset.targetState = 'show';
                item.classList.remove('persona-hidden');
                
                // Let the browser register the display removal, then trigger transition
                setTimeout(() => {
                    if (item.dataset.targetState === 'show') {
                        item.classList.remove('persona-fade-out');
                    }
                }, 20);
            } else {
                // To hide: set state, trigger fade-out, then hide from layout after transition completes
                item.dataset.targetState = 'hide';
                item.classList.add('persona-fade-out');
                
                setTimeout(() => {
                    if (item.dataset.targetState === 'hide') {
                        item.classList.add('persona-hidden');
                    }
                }, 400); // Matches the 0.4s CSS transition time
            }
        });

        // Trigger intersection observer for newly shown elements that are in view
        setTimeout(() => {
            window.dispatchEvent(new Event('scroll'));
        }, 100);
    }

    // Bind click events to persona buttons
    personaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPersona = btn.getAttribute('data-persona');
            filterPersona(targetPersona);
        });
    });

    // Smooth scrolling for anchor links with integrated persona switching
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            // Intercept dropdown portfolio navigation clicks to sync with switcher personas
            const linkText = this.textContent.trim().toLowerCase();
            let delayScroll = false;

            if (targetId === '#experience' && linkText.includes('corporate')) {
                filterPersona('corporate');
            } else if ((targetId === '#projects' || targetId === '#experience') && linkText.includes('entrepreneurial')) {
                filterPersona('kitchen');
            } else if (targetId === '#offerings') {
                filterPersona('all');
            } else if (targetId === '#education') {
                const activeBtn = document.querySelector('.persona-btn.active');
                const activePersona = activeBtn ? activeBtn.getAttribute('data-persona') : 'all';
                // Switch to corporate if it's currently hidden in coaching or kitchen
                if (activePersona === 'coaching' || activePersona === 'kitchen') {
                    filterPersona('corporate');
                    delayScroll = true;
                }
            }

            // Map virtual `#projects` links to the unified `#experience` timeline
            const scrollTargetId = targetId === '#projects' ? '#experience' : targetId;
            
            const performScroll = () => {
                const targetElement = document.querySelector(scrollTargetId);
                if (targetElement) {
                    // Adjust for sticky header and persona switcher
                    const headerOffset = 140; // Combined heights of navbar + persona switcher
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            };

            if (delayScroll) {
                setTimeout(performScroll, 350); // Wait for transition display none removal
            } else {
                performScroll();
            }
        });
    });

    // Trigger initial appearance for elements already in view
    setTimeout(() => {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('appear');
            }
        });
    }, 100);

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Dropdown toggle on mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                // Only prevent default if clicking the main dropdown link
                if (e.target.classList.contains('dropbtn') || e.target.parentElement.classList.contains('dropbtn')) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            }
        });
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a:not(.dropbtn)').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove('active');
            }
        });
    });
}

// Bulletproof execution for local 'file:///' loading speeds and cached frames
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
