/**
 * Symax — Portafolio de Soluciones Digitales para Restaurantes
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
            ...document.querySelectorAll('.testimonial-card'),
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

    // ============================================
    // LOGO CAROUSEL INTERACTIVO & TESTIMONIOS HIGHLIGHT
    // ============================================
    const carouselItems = document.querySelectorAll('.logo-carousel-item');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');

    if (carouselItems.length > 0) {
        let currentIndex = 0;

        const updateCarousel = (newIndex) => {
            currentIndex = (newIndex + carouselItems.length) % carouselItems.length;

            carouselItems.forEach((item, index) => {
                item.className = 'logo-carousel-item'; // Reset classes
                
                if (index === currentIndex) {
                    item.classList.add('active');
                } else if (index === (currentIndex - 1 + carouselItems.length) % carouselItems.length) {
                    item.classList.add('prev');
                } else if (index === (currentIndex + 1) % carouselItems.length) {
                    item.classList.add('next');
                }
            });
            
            // Highlight the corresponding testimonial card below dynamically!
            const testimonialCards = document.querySelectorAll('.testimonial-card');
            if (testimonialCards.length > 0) {
                testimonialCards.forEach((card, idx) => {
                    if (idx === currentIndex) {
                        card.classList.add('featured-highlight');
                        card.style.borderColor = 'var(--color-primary)';
                        card.style.transform = 'translateY(-6px)';
                        card.style.boxShadow = '0 15px 35px rgba(232, 93, 42, 0.15)';
                    } else {
                        card.classList.remove('featured-highlight');
                        card.style.borderColor = 'var(--color-border)';
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = 'none';
                    }
                });
            }
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateCarousel(currentIndex - 1);
                resetInterval();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateCarousel(currentIndex + 1);
                resetInterval();
            });
        }
        
        // Allow clicking directly on prev/next items or active item to navigate
        carouselItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                updateCarousel(index);
                resetInterval();
            });
        });

        // Auto rotate
        let autoRotate = setInterval(() => {
            updateCarousel(currentIndex + 1);
        }, 4000);

        const resetInterval = () => {
            clearInterval(autoRotate);
            autoRotate = setInterval(() => {
                updateCarousel(currentIndex + 1);
            }, 4000);
        };
        
        // Initial state load
        setTimeout(() => {
            updateCarousel(0);
        }, 300);
    }

    // ============================================
    // MODAL CALCULADORA (ROI)
    // ============================================
    const calculatorModal = document.getElementById('calculatorModal');
    const openCalcBtn = document.getElementById('openCalcBtn');
    const closeCalcBtn = document.getElementById('closeCalcBtn');
    const rangeOrders = document.getElementById('rangeOrders');
    const rangeTime = document.getElementById('rangeTime');
    const valOrders = document.getElementById('valOrders');
    const valTime = document.getElementById('valTime');
    const resTime = document.getElementById('resTime');
    const resMoney = document.getElementById('resMoney');

    if (calculatorModal && openCalcBtn) {
        // Abrir modal
        openCalcBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calculatorModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            calculateROI();
        });

        // Cerrar modal con botón X
        closeCalcBtn.addEventListener('click', (e) => {
            e.preventDefault();
            calculatorModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Cerrar modal al hacer click fuera de la tarjeta
        calculatorModal.addEventListener('click', (e) => {
            if (e.target === calculatorModal) {
                calculatorModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Cerrar modal con ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && calculatorModal.classList.contains('active')) {
                calculatorModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Eventos de cambios en inputs de rango
        rangeOrders.addEventListener('input', () => {
            valOrders.textContent = `${rangeOrders.value} pedidos`;
            calculateROI();
        });

        rangeTime.addEventListener('input', () => {
            valTime.textContent = `${rangeTime.value} min`;
            calculateROI();
        });

        // Función de cálculo matemático
        function calculateROI() {
            const orders = parseInt(rangeOrders.value);
            const minsPerOrder = parseInt(rangeTime.value);

            // Horas ganadas al mes (Symax automatiza el 85% de esos minutos)
            const hoursSaved = Math.round((orders * minsPerOrder * 0.85) / 60);
            resTime.textContent = `${hoursSaved} hrs`;

            // Dinero ahorrado (COP): $7.500 COP/hora de tiempo + 4% de tasa de errores prevenidos a $10.000 COP promedio c/u
            const rawMoneySaved = (hoursSaved * 7500) + (orders * 0.04 * 10000);
            
            // Formatear pesos colombianos (Ej: $350.000 COP)
            const formattedMoney = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(rawMoneySaved);

            resMoney.textContent = `${formattedMoney} COP`;
        }
    }

    // ============================================
    // FAQ ACCORDION LOGIC
    // ============================================
    const faqAccordions = document.querySelectorAll('.faq-accordion');
    faqAccordions.forEach(acc => {
        const header = acc.querySelector('.faq-header');
        header.addEventListener('click', () => {
            const isActive = acc.classList.contains('active');
            
            // Cerrar todos los demás
            faqAccordions.forEach(item => item.classList.remove('active'));

            if (!isActive) {
                acc.classList.add('active');
            }
        });
    });

    // ============================================
    // MODAL DE CAPTACIÓN DE LEADS (Desktop)
    // ============================================
    const leadModal = document.getElementById('leadModal');
    const closeLeadBtn = document.getElementById('closeLeadBtn');
    const leadForm = document.getElementById('leadForm');
    const leadFormView = document.getElementById('leadFormView');
    const leadSuccessView = document.getElementById('leadSuccessView');
    const btnSuccessClose = document.getElementById('btnSuccessClose');

    // Detección de dispositivo Desktop (pantallas de 1024px o más)
    const isDesktop = () => window.innerWidth >= 1024;

    // Interceptar clics en enlaces de WhatsApp si es Desktop
    document.addEventListener('click', (e) => {
        if (!isDesktop()) return;

        // Buscar si el click fue en un enlace de WhatsApp
        const anchor = e.target.closest('a');
        if (anchor && anchor.href && (anchor.href.includes('wa.me') || anchor.href.includes('api.whatsapp.com'))) {
            e.preventDefault();
            
            // Si el modal de la calculadora está activo, cerrarlo
            if (calculatorModal && calculatorModal.classList.contains('active')) {
                calculatorModal.classList.remove('active');
            }

            // Mostrar modal de captación de leads
            leadFormView.style.display = 'block';
            leadSuccessView.style.display = 'none';
            leadForm.reset();
            leadModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    if (leadModal) {
        // Cerrar modal con botón X
        closeLeadBtn.addEventListener('click', () => {
            leadModal.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Cerrar modal al hacer click fuera
        leadModal.addEventListener('click', (e) => {
            if (e.target === leadModal) {
                leadModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Cerrar modal con ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && leadModal.classList.contains('active')) {
                leadModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Botón de cerrar en pantalla de éxito
        if (btnSuccessClose) {
            btnSuccessClose.addEventListener('click', () => {
                leadModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Envío de formulario mediante API a Cloudflare Pages Function
        if (leadForm) {
            leadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = leadForm.querySelector('.btn-lead-submit');
                const btnText = submitBtn.querySelector('.btn-text');
                const btnSpinner = submitBtn.querySelector('.btn-spinner');

                // Mostrar estado de carga
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                btnSpinner.style.display = 'inline-block';

                const formData = {
                    name: document.getElementById('leadName').value,
                    restaurant: document.getElementById('leadRestaurant').value,
                    phone: document.getElementById('leadPhone').value,
                    email: document.getElementById('leadEmail').value,
                    message: document.getElementById('leadMessage').value
                };

                // Si se abre el archivo directamente desde el disco (file://) sin servidor local, simulamos el éxito.
                if (window.location.protocol === 'file:') {
                    console.warn('Ejecutando desde file://. Se simula el envío del lead:', formData);
                    setTimeout(() => {
                        leadFormView.style.display = 'none';
                        leadSuccessView.style.display = 'block';
                        submitBtn.disabled = false;
                        btnText.style.display = 'inline-block';
                        btnSpinner.style.display = 'none';
                    }, 850);
                    return;
                }

                try {
                    const response = await fetch('/api/submit-lead', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        // Ocultar formulario y mostrar pantalla de éxito
                        leadFormView.style.display = 'none';
                        leadSuccessView.style.display = 'block';
                    } else {
                        alert(result.error || 'Ocurrió un error al enviar la información. Por favor intenta de nuevo.');
                    }
                } catch (error) {
                    console.error('Error submitting lead:', error);
                    alert('Error de conexión. Por favor verifica tu red e intenta de nuevo.');
                } finally {
                    // Restaurar botón
                    submitBtn.disabled = false;
                    btnText.style.display = 'inline-block';
                    btnSpinner.style.display = 'none';
                }
            });
        }
    }
});
