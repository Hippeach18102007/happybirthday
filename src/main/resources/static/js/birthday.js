// ===== BACKGROUND PARTICLES =====
(function initBgParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#D4A853', '#C0586A', '#B8A4D8', '#E8B84B', '#8B6ED4', '#FFD4E8'];

    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 2;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * -20}s;
            opacity: ${Math.random() * 0.5 + 0.2};
        `;
        container.appendChild(p);
    }
})();

// ===== ENVELOPE OPEN =====
function openEnvelope() {
    const wrapper = document.getElementById('envelopeWrapper');
    const envelope = document.getElementById('envelope');
    const flap = document.getElementById('envelopeFlap');
    const seal = document.getElementById('seal');
    const letterPeek = document.getElementById('letterPeek');
    const audio = document.getElementById('birthdaySong');

    // Disable further clicks
    wrapper.onclick = null;
    wrapper.style.cursor = 'default';
    if (!audio.src || audio.src === "") {
        // Thêm tham số ngẫu nhiên để tránh Cache hoàn toàn
        audio.src = "/audio/birthday-bgm.mp3?t=" + new Date().getTime();
        audio.load();
    }
    audio.play().catch(error => {
        console.log("Phát nhạc thất bại:", error);
    });

    // Step 1: Shake envelope
    envelope.classList.add('opening');

    setTimeout(() => {
        envelope.classList.remove('opening');

        // Step 2: Break seal
        seal.classList.add('breaking');

        setTimeout(() => {
            // Step 3: Open flap
            flap.classList.add('open');

            setTimeout(() => {
                // Step 4: Letter rises
                letterPeek.classList.add('rising');

                setTimeout(() => {
                    // Step 5: Transition to letter scene
                    showLetterScene();
                }, 600);
            }, 400);
        }, 400);
    }, 500);
}

function showLetterScene() {
    const envelopeScene = document.getElementById('envelopeScene');
    const letterScene = document.getElementById('letterScene');

    envelopeScene.classList.add('fade-out');

    setTimeout(() => {
        envelopeScene.style.display = 'none';
        letterScene.classList.remove('hidden');
        letterScene.classList.add('fade-in');

        // Start fireworks
        initFireworks();
        initFloatingStars();
    }, 700);
}

// ===== FLOATING STARS =====
function initFloatingStars() {
    const container = document.getElementById('floatingStars');
    const emojis = ['⭐', '✨', '💫', '🌟', '🎉', '🎊', '🎈', '🌸', '💕', '🦋'];

    function spawnStar() {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        star.style.cssText = `
            left: ${Math.random() * 100}%;
            bottom: -50px;
            font-size: ${Math.random() * 1.5 + 0.8}rem;
            animation-duration: ${Math.random() * 8 + 6}s;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(star);
        setTimeout(() => star.remove(), 12000);
    }

    // Initial burst
    for (let i = 0; i < 12; i++) {
        setTimeout(() => spawnStar(), i * 200);
    }

    // Continuous stream
    setInterval(spawnStar, 600);
}

// ===== FIREWORKS ENGINE =====
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let fireworksActive = false;
let animId = null;
const particles = [];
const rockets = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.alpha = 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.15;
        this.decay = Math.random() * 0.012 + 0.008;
        this.size = Math.random() * 3 + 1.5;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 5) this.trail.shift();

        this.vy += this.gravity;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const trailAlpha = (i / this.trail.length) * this.alpha * 0.4;
            ctx.globalAlpha = trailAlpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Core particle
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.globalAlpha = this.alpha * 0.3;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    isDead() { return this.alpha <= 0; }
}

class Rocket {
    constructor() {
        this.x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
        this.y = canvas.height + 10;
        const targetY = Math.random() * canvas.height * 0.5 + canvas.height * 0.05;
        this.targetY = targetY;
        this.vy = -Math.random() * 8 - 10;
        this.trail = [];
        this.exploded = false;
        this.colors = getFireworkPalette();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 12) this.trail.shift();

        this.vy += 0.3;
        this.y += this.vy;

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.explode();
            return true; // signal removal
        }
        return false;
    }

    draw() {
        for (let i = 0; i < this.trail.length; i++) {
            const t = this.trail[i];
            const alpha = (i / this.trail.length) * 0.8;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.colors[0];
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2.5 - (i / this.trail.length) * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        // Bright head
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    explode() {
        this.exploded = true;
        const count = Math.floor(Math.random() * 60 + 80);

        // Add ring of particles
        for (let i = 0; i < count; i++) {
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            particles.push(new Particle(this.x, this.y, color));
        }

        // Add sparkle center
        for (let i = 0; i < 20; i++) {
            const p = new Particle(this.x, this.y, '#FFFFFF');
            p.vx *= 0.3;
            p.vy *= 0.3;
            p.decay *= 2;
            p.size = 2;
            particles.push(p);
        }
    }
}

function getFireworkPalette() {
    const palettes = [
        ['#FF6B9D', '#FFB6C1', '#FF8C69', '#FFD700'],
        ['#B8A4D8', '#DDA0DD', '#9370DB', '#E8B4E8'],
        ['#D4A853', '#FFD700', '#FFA500', '#FFFACD'],
        ['#87CEEB', '#4FC3F7', '#29B6F6', '#B3E5FC'],
        ['#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5'],
        ['#FF9A9E', '#FECFEF', '#FEE2C0', '#C4B5FD'],
        ['#84FAB0', '#8FD3F4', '#A9C9FF', '#FFBBEC'],
    ];
    return palettes[Math.floor(Math.random() * palettes.length)];
}

let rocketTimer = 0;

function fireworksLoop() {
    if (!fireworksActive) return;

    ctx.fillStyle = 'rgba(26, 10, 30, 0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Launch rockets
    rocketTimer++;
    if (rocketTimer % 28 === 0) {
        const burst = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < burst; i++) {
            setTimeout(() => rockets.push(new Rocket()), i * 200);
        }
    }

    // Update & draw rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].draw();
        if (rockets[i].update()) {
            rockets.splice(i, 1);
        }
    }

    // Update & draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].isDead()) particles.splice(i, 1);
    }

    animId = requestAnimationFrame(fireworksLoop);
}

function initFireworks() {
    fireworksActive = true;
    rocketTimer = 0;

    // Immediate burst of 5 rockets
    for (let i = 0; i < 5; i++) {
        setTimeout(() => rockets.push(new Rocket()), i * 350);
    }

    fireworksLoop();

    // Auto-reduce after 15s, but keep going gently
    setTimeout(() => {
        rocketTimer = 0; // slow down naturally via interval
    }, 15000);
}

function replayFireworks() {
    particles.length = 0;
    rockets.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (animId) cancelAnimationFrame(animId);
    fireworksActive = false;

    setTimeout(() => {
        initFireworks();
    }, 100);
}
