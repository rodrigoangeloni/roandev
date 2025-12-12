const username = 'rodrigoangeloni';
const apiUrl = `https://api.github.com/users/${username}`;

// ========== CONFIGURACIÓN ==========
const CONFIG = {
    PARTICLE_COUNT: 80,
    MOUSE_INTERACTION_RADIUS: 150,
    CONNECTION_DISTANCE: 100,
    LOADING_DELAY_MS: 1000,
    SCROLL_THRESHOLD: 300,
    THROTTLE_DELAY_MS: 100
};

// ========== UTILIDADES DE SEGURIDAD ==========
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ========== UTILIDADES DE RENDIMIENTO ==========
function throttle(fn, wait) {
    let lastTime = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

// ========== PARTICLE BACKGROUND ==========
class ParticleBackground {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: CONFIG.MOUSE_INTERACTION_RADIUS };
        this.particleCount = CONFIG.PARTICLE_COUNT;
        this.animationId = null;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseX: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                density: (Math.random() * 30) + 1
            });
        }
    }

    drawParticles() {
        this.particles.forEach((particle, index) => {
            // Draw particle
            this.ctx.fillStyle = `rgba(0, 229, 255, ${0.3 + Math.random() * 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw connections
            for (let j = index + 1; j < this.particles.length; j++) {
                const dx = this.particles[j].x - particle.x;
                const dy = this.particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONFIG.CONNECTION_DISTANCE) {
                    this.ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 * (1 - distance / CONFIG.CONNECTION_DISTANCE)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction - evitar división por cero
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0 && distance < this.mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const directionX = forceDirectionX * force * particle.density;
                    const directionY = forceDirectionY * force * particle.density;

                    particle.x -= directionX;
                    particle.y -= directionY;
                } else if (distance >= this.mouse.radius) {
                    // Return to base position
                    if (particle.x !== particle.baseX) {
                        const baseDx = particle.x - particle.baseX;
                        particle.x -= baseDx / 10;
                    }
                    if (particle.y !== particle.baseY) {
                        const baseDy = particle.y - particle.baseY;
                        particle.y -= baseDy / 10;
                    }
                }
            } else {
                // Sin mouse, volver a posición base
                if (particle.x !== particle.baseX) {
                    const baseDx = particle.x - particle.baseX;
                    particle.x -= baseDx / 10;
                }
                if (particle.y !== particle.baseY) {
                    const baseDy = particle.y - particle.baseY;
                    particle.y -= baseDy / 10;
                }
            }

            // Add slight drift
            particle.baseX += particle.vx;
            particle.baseY += particle.vy;

            // Bounce off edges
            if (particle.baseX < 0 || particle.baseX > this.canvas.width) {
                particle.vx *= -1;
                particle.baseX = Math.max(0, Math.min(this.canvas.width, particle.baseX));
            }
            if (particle.baseY < 0 || particle.baseY > this.canvas.height) {
                particle.vy *= -1;
                particle.baseY = Math.max(0, Math.min(this.canvas.height, particle.baseY));
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawParticles();
        this.updateParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize particle background
const particleBackground = new ParticleBackground();

// ========== LOADING SCREEN ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, CONFIG.LOADING_DELAY_MS);
});

// ========== SCROLL TO TOP BUTTON ==========
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', throttle(() => {
    if (window.pageYOffset > CONFIG.SCROLL_THRESHOLD) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}, CONFIG.THROTTLE_DELAY_MS));

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========== MOBILE MENU TOGGLE ==========
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive);
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== FETCH GITHUB DATA ==========
async function fetchData() {
    try {
        // Fetch user data
        const res = await fetch(apiUrl);

        // Manejo de rate limiting
        if (res.status === 403) {
            const resetTime = res.headers.get('X-RateLimit-Reset');
            console.warn('Rate limit exceeded. Reset at:', resetTime ? new Date(resetTime * 1000) : 'unknown');
            document.getElementById('name').textContent = 'Rate limit alcanzado';
            document.getElementById('bio').textContent = 'Por favor, espera unos minutos e intenta nuevamente.';
            return;
        }

        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        // Update hero section (textContent es seguro contra XSS)
        document.getElementById('name').textContent = data.name || data.login;
        document.getElementById('avatar').src = data.avatar_url;
        document.getElementById('bio').textContent = data.bio || '🎓 Estudiante de Ciencias de la Computación | 🐧 Admin de servidores Linux | 🏎️ Comunidad gaming 800+ miembros';

        // Update stats (valores numéricos son seguros)
        const statsContainer = document.getElementById('stats');
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${Number(data.public_repos) || 0}</span>
                <span class="stat-label">Proyectos</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${Number(data.followers) || 0}</span>
                <span class="stat-label">Seguidores</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${Number(data.following) || 0}</span>
                <span class="stat-label">Siguiendo</span>
            </div>
        `;

        // Update contact section with email and location (sanitizado)
        if (data.email) {
            const emailCard = document.getElementById('contact-email');
            const safeEmail = escapeHtml(data.email);
            emailCard.innerHTML = `
                <i class="fa-solid fa-envelope"></i>
                <h3>Email</h3>
                <a href="mailto:${safeEmail}">${safeEmail}</a>
            `;
        }

        if (data.location) {
            const locationCard = document.getElementById('contact-location');
            locationCard.querySelector('p').textContent = data.location;
        }

        if (data.blog) {
            const githubLink = document.getElementById('github-link');
            const safeBlog = escapeHtml(data.blog);
            githubLink.parentElement.innerHTML += `
                <div style="margin-top: 10px;">
                    <a href="${safeBlog}" target="_blank" rel="noopener noreferrer" style="color: #888; font-size: 14px;">
                        <i class="fa-solid fa-link"></i> Website
                    </a>
                </div>
            `;
        }

        // Fetch repositories
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);

        // Manejo de rate limiting para repos
        if (reposRes.status === 403) {
            console.warn('Rate limit exceeded for repos');
            return;
        }

        if (!reposRes.ok) throw new Error('Error fetching repositories');
        const repos = await reposRes.json();

        // Update portfolio grid
        const grid = document.getElementById('repo-grid');
        grid.innerHTML = '';

        // Filter and limit to top 6 repos
        const topRepos = repos
            .filter(repo => !repo.fork) // Exclude forked repos
            .slice(0, 6);

        topRepos.forEach((repo, index) => {
            const card = document.createElement('div');
            card.className = 'repo-card';
            card.style.animationDelay = `${index * 0.1}s`;

            // Sanitizar datos del repo para prevenir XSS
            const safeName = escapeHtml(repo.name);
            const safeDescription = escapeHtml(repo.description || 'Sin descripción disponible');
            const safeLanguage = escapeHtml(repo.language || '');
            const safeUrl = escapeHtml(repo.html_url);

            card.innerHTML = `
                <h3>${safeName}</h3>
                <p>${safeDescription}</p>
                <div class="repo-meta">
                    ${safeLanguage ? `<span><i class="fa-solid fa-code"></i> ${safeLanguage}</span>` : ''}
                    <span><i class="fa-solid fa-star"></i> ${Number(repo.stargazers_count) || 0}</span>
                    <span><i class="fa-solid fa-code-branch"></i> ${Number(repo.forks_count) || 0}</span>
                </div>
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="repo-link">
                    Ver Repositorio <i class="fa-solid fa-arrow-right"></i>
                </a>
            `;
            grid.appendChild(card);
        });

        // Add intersection observer for animations
        observeElements();

    } catch (err) {
        console.error('Error fetching data:', err);
        document.getElementById('name').textContent = 'Error al cargar datos';
        document.getElementById('bio').textContent = 'No se pudo conectar con GitHub API';
    }
}

// ========== INTERSECTION OBSERVER FOR ANIMATIONS ==========
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.repo-card, .skill-item, .contact-card').forEach(el => {
        observer.observe(el);
    });

    // Also observe tech cards
    document.querySelectorAll('.tech-card').forEach(el => {
        observer.observe(el);
    });
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', fetchData);