const username = 'rodrigoangeloni';
const apiUrl = `https://api.github.com/users/${username}`;

// ========== PARTICLE BACKGROUND ==========
class ParticleBackground {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.particleCount = 80;
        
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
                
                if (distance < 100) {
                    this.ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 * (1 - distance / 100)})`;
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
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = this.mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * particle.density;
            const directionY = forceDirectionY * force * particle.density;
            
            if (distance < this.mouse.radius) {
                particle.x -= directionX;
                particle.y -= directionY;
            } else {
                // Return to base position
                if (particle.x !== particle.baseX) {
                    const dx = particle.x - particle.baseX;
                    particle.x -= dx / 10;
                }
                if (particle.y !== particle.baseY) {
                    const dy = particle.y - particle.baseY;
                    particle.y -= dy / 10;
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
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle background
const particleBackground = new ParticleBackground();

// ========== LOADING SCREEN ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1000);
});

// ========== SCROLL TO TOP BUTTON ==========
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

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
    navLinks.classList.toggle('active');
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
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        // Update hero section
        document.getElementById('name').textContent = data.name || data.login;
        document.getElementById('avatar').src = data.avatar_url;
        document.getElementById('bio').textContent = data.bio || '🎓 Estudiante de Ciencias de la Computación | 🐧 Admin de servidores Linux | 🏎️ Comunidad gaming 800+ miembros';
        
        // Update stats
        const statsContainer = document.getElementById('stats');
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${data.public_repos}</span>
                <span class="stat-label">Proyectos</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${data.followers}</span>
                <span class="stat-label">Seguidores</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${data.following}</span>
                <span class="stat-label">Siguiendo</span>
            </div>
        `;
        
        // Update contact section with email and location
        if (data.email) {
            const emailCard = document.getElementById('contact-email');
            emailCard.innerHTML = `
                <i class="fa-solid fa-envelope"></i>
                <h3>Email</h3>
                <a href="mailto:${data.email}">${data.email}</a>
            `;
        }
        
        if (data.location) {
            const locationCard = document.getElementById('contact-location');
            locationCard.querySelector('p').textContent = data.location;
        }
        
        if (data.blog) {
            const githubLink = document.getElementById('github-link');
            githubLink.parentElement.innerHTML += `
                <div style="margin-top: 10px;">
                    <a href="${data.blog}" target="_blank" style="color: #888; font-size: 14px;">
                        <i class="fa-solid fa-link"></i> Website
                    </a>
                </div>
            `;
        }
        
        // Fetch repositories
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
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
            card.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'Sin descripción disponible'}</p>
                <div class="repo-meta">
                    ${repo.language ? `<span><i class="fa-solid fa-code"></i> ${repo.language}</span>` : ''}
                    <span><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>
                    <span><i class="fa-solid fa-code-branch"></i> ${repo.forks_count}</span>
                </div>
                <a href="${repo.html_url}" target="_blank" class="repo-link">
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