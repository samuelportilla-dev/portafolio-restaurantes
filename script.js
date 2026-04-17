/**
 * Samuel Portilla — Portafolio de Soluciones Digitales para Restaurantes
 * Script principal: Navegación, animaciones scroll-reveal, y micro-interacciones
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // NAVEGACIÓN
    // ============================================
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll — agregar clase "scrolled" al navbar
    const handleScroll = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // estado inicial

    // Hamburger menu toggle
    const toggleMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
        
        // Overlay
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', toggleMenu);
        }
        overlay.classList.toggle('active');
    };

    hamburger.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer click en un link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // ============================================
    // SMOOTH SCROLL PARA LINKS INTERNOS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    const revealElements = () => {
        // Seleccionar los elementos a animar
        const elements = [
            ...document.querySelectorAll('.section-header'),
            ...document.querySelectorAll('.comparison-card'),
            ...document.querySelectorAll('.portfolio-card'),
            ...document.querySelectorAll('.step-card'),
            ...document.querySelectorAll('.impact-stats'),
            ...document.querySelectorAll('.cta-card'),
        ];

        elements.forEach((el, index) => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
                el.style.transitionDelay = `${index % 3 * 0.1}s`;
            }
        });
    };

    const checkReveal = () => {
        const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        const windowHeight = window.innerHeight;
        const revealPoint = 120;

        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('revealed');
            }
        });
    };

    revealElements();
    window.addEventListener('scroll', checkReveal, { passive: true });
    // Check on load
    setTimeout(checkReveal, 100);

    // ============================================
    // ACTIVE NAV LINK HIGHLIGHT
    // ============================================
    const sections = document.querySelectorAll('section[id]');

    const highlightNav = () => {
        const scrollPosition = window.scrollY + navbar.offsetHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    // ============================================
    // COUNTER ANIMATION para estadísticas
    // ============================================
    const animateCounters = () => {
        const counters = document.querySelectorAll('.impact-number[data-target]');
        
        counters.forEach(counter => {
            if (counter.dataset.animated) return;
            
            const rect = counter.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                counter.dataset.animated = 'true';
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const start = performance.now();
                
                const animate = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    counter.textContent = Math.round(target * eased);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                
                requestAnimationFrame(animate);
            }
        });
    };

    window.addEventListener('scroll', animateCounters, { passive: true });

    // ============================================
    // HERO ENTRADA ANIMADA
    // ============================================
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');

    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }

    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateY(40px)';
        
        setTimeout(() => {
            heroVisual.style.transition = 'opacity 1s ease, transform 1s ease';
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateY(0)';
        }, 500);
    }

    // ============================================
    // TILT EFECTO EN PORTFOLIO CARDS (solo desktop)
    // ============================================
    if (window.innerWidth > 768) {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        
        portfolioCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 30;
                const rotateY = (centerX - x) / 30;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ============================================
    // WHATSAPP FLOAT - Mostrar tooltip tras 3 segundos
    // ============================================
    const whatsappFloat = document.getElementById('whatsapp-float');
    if (whatsappFloat) {
        setTimeout(() => {
            const tooltip = whatsappFloat.querySelector('.whatsapp-tooltip');
            if (tooltip && window.innerWidth > 768) {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(0)';
                
                setTimeout(() => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(10px)';
                }, 4000);
            }
        }, 3000);
    }

    // ============================================
    // PARALLAX SUTIL en hero shapes
    // ============================================
    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.hero-shape');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 15;
                const translateX = (x - 0.5) * speed;
                const translateY = (y - 0.5) * speed;
                shape.style.transform = `translate(${translateX}px, ${translateY}px)`;
            });
        });
    }
});
