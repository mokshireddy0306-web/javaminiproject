/**
 * ============================================================================
 * PROJECTHUB AI - 3D INTERACTION & WEBGL CANVAS ENGINE
 * Pure Vanilla JavaScript & Canvas 3D Perspective Projection Engine (Zero Dependencies)
 * 
 * Features:
 * 1. Interactive 3D Spherical Collaboration Constellation (Orbiting Skill Nodes & Beams)
 * 2. Mouse/Touch Inertial 3D Rotation with Smooth Momentum Damping
 * 3. Apple/Stripe-grade 3D Card Tilt with Specular Glare & Parallax Depth Lift
 * 4. Micro 3D Gyroscopic Floating Physics
 * ============================================================================
 */

const ThreeDEngine = {
  // 3D Canvas State
  canvas: null,
  ctx: null,
  nodes: [],
  skillTags: [
    { text: '⚡ AI / ML', color: '#60A5FA' },
    { text: '⚛️ React.js', color: '#38BDF8' },
    { text: '🐍 Python', color: '#34D399' },
    { text: '🐳 Docker', color: '#818CF8' },
    { text: '☁️ Cloud AWS', color: '#FBBF24' },
    { text: '🎨 UI/UX', color: '#F472B6' },
    { text: '🛡️ Security', color: '#A78BFA' },
    { text: '🚀 Distributed', color: '#2DD4BF' }
  ],
  rotationX: 0.2,
  rotationY: 0.3,
  targetRotX: 0.2,
  targetRotY: 0.3,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  animId: null,

  init() {
    this.initHero3DCanvas();
    this.initCard3DTilt();
  },

  // --------------------------------------------------------------------------
  // 1. INTERACTIVE 3D COLLABORATION SPHERICAL CONSTELLATION
  // --------------------------------------------------------------------------
  initHero3DCanvas() {
    this.canvas = document.getElementById('hero3DCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Generate 3D Spherical Nodes using Fibonacci Sphere distribution
    const numNodes = 42;
    this.nodes = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numNodes; i++) {
      const y = 1 - (i / (numNodes - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Assign skill tag to first 8 nodes
      const tag = i < this.skillTags.length ? this.skillTags[i] : null;

      this.nodes.push({
        origX: x * 135,
        origY: y * 135,
        origZ: z * 135,
        x: 0, y: 0, z: 0,
        projX: 0, projY: 0,
        scale: 1,
        tag: tag,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Interactive mouse rotation drag & touch handling
    this.bindCanvasInteraction();

    // Start 60fps render loop
    this.render3DLoop();
  },

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.min(rect.width, 760);
    const height = Math.min(320, width * 0.52);

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
  },

  bindCanvasInteraction() {
    const el = this.canvas;
    if (!el) return;

    const onPointerDown = (clientX, clientY) => {
      this.isDragging = true;
      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
    };

    const onPointerMove = (clientX, clientY) => {
      if (!this.isDragging) {
        // Subtle magnetic pull towards cursor when hovering
        const rect = el.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width - 0.5) * 0.4;
        const normY = ((clientY - rect.top) / rect.height - 0.5) * 0.4;
        this.targetRotY += normX * 0.04;
        this.targetRotX += normY * 0.04;
        return;
      }

      const dx = clientX - this.lastMouseX;
      const dy = clientY - this.lastMouseY;
      this.targetRotY += dx * 0.007;
      this.targetRotX += dy * 0.007;
      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    el.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', onPointerUp);
  },

  render3DLoop() {
    const render = () => {
      if (!this.canvas || !this.ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = this.canvas.width / dpr;
      const height = this.canvas.height / dpr;
      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 320; // 3D Field of view focal length

      // Smooth inertia damping
      this.rotationX += (this.targetRotX - this.rotationX) * 0.08;
      this.rotationY += (this.targetRotY - this.rotationY) * 0.08;

      // Passive cosmic rotation
      if (!this.isDragging) {
        this.targetRotY += 0.004;
        this.targetRotX += 0.001;
      }

      // Clear canvas
      this.ctx.clearRect(0, 0, width, height);

      const cosX = Math.cos(this.rotationX);
      const sinX = Math.sin(this.rotationX);
      const cosY = Math.cos(this.rotationY);
      const sinY = Math.sin(this.rotationY);
      const now = performance.now() * 0.002;

      // 1. Transform 3D Coordinates
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];

        // Rotate around Y
        let x1 = n.origX * cosY - n.origZ * sinY;
        let z1 = n.origZ * cosY + n.origX * sinY;

        // Rotate around X
        let y1 = n.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + n.origY * sinX;

        n.x = x1;
        n.y = y1;
        n.z = z2;

        // Perspective Projection
        const distance = fov / (fov + z2);
        n.scale = Math.max(0.1, distance);
        n.projX = centerX + x1 * distance;
        n.projY = centerY + y1 * distance;
      }

      // Sort by Z (painter's algorithm)
      this.nodes.sort((a, b) => a.z - b.z);

      // 2. Draw 3D Energy Connection Beams between proximate nodes
      this.ctx.lineWidth = 1;
      for (let i = 0; i < this.nodes.length; i++) {
        const n1 = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const n2 = this.nodes[j];

          // Compute 3D distance
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dz = n1.z - n2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 75) {
            const avgZ = (n1.z + n2.z) / 2;
            const depthAlpha = Math.max(0.04, Math.min(0.35, (avgZ + 135) / 270));
            const lineAlpha = (1 - dist / 75) * depthAlpha;

            this.ctx.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(n1.projX, n1.projY);
            this.ctx.lineTo(n2.projX, n2.projY);
            this.ctx.stroke();
          }
        }
      }

      // 3. Draw Glowing Core Halo in 3D center
      const coreGrad = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 70);
      coreGrad.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
      coreGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
      coreGrad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = coreGrad;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      this.ctx.fill();

      // 4. Draw 3D Nodes & Floating Skill Badges
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        const depthRatio = (n.z + 135) / 270; // 0 (far) to 1 (near)
        const nodeAlpha = Math.max(0.25, Math.min(1, depthRatio));
        const nodeRadius = Math.max(2, (2.8 + Math.sin(now + n.pulseOffset) * 0.8) * n.scale);

        // Outer glow
        const glowRadius = nodeRadius * 2.8;
        const glowGrad = this.ctx.createRadialGradient(n.projX, n.projY, 0, n.projX, n.projY, glowRadius);
        glowGrad.addColorStop(0, n.tag ? 'rgba(56, 189, 248, 0.6)' : 'rgba(99, 102, 241, 0.45)');
        glowGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = glowGrad;
        this.ctx.beginPath();
        this.ctx.arc(n.projX, n.projY, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Node center
        this.ctx.fillStyle = n.tag 
          ? `rgba(255, 255, 255, ${nodeAlpha})` 
          : `rgba(147, 197, 253, ${nodeAlpha * 0.85})`;
        this.ctx.beginPath();
        this.ctx.arc(n.projX, n.projY, nodeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Orbiting 3D Skill Tag Pill if present
        if (n.tag && n.z > -40) {
          const tagAlpha = Math.max(0.3, Math.min(1, (n.z + 40) / 160));
          const fontSize = Math.max(9, Math.round(11 * n.scale));
          this.ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;

          const textWidth = this.ctx.measureText(n.tag.text).width;
          const padX = 8 * n.scale;
          const padY = 4 * n.scale;
          const pillW = textWidth + padX * 2;
          const pillH = fontSize + padY * 2;
          const pillX = n.projX + 8;
          const pillY = n.projY - pillH / 2;

          // Glass pill background
          this.ctx.fillStyle = `rgba(15, 23, 42, ${0.75 * tagAlpha})`;
          this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 * tagAlpha})`;
          this.ctx.lineWidth = 1;

          this.ctx.beginPath();
          this.ctx.roundRect(pillX, pillY, pillW, pillH, 999);
          this.ctx.fill();
          this.ctx.stroke();

          // Pill text
          this.ctx.fillStyle = n.tag.color;
          this.ctx.globalAlpha = tagAlpha;
          this.ctx.fillText(n.tag.text, pillX + padX, pillY + padY + fontSize * 0.82);
          this.ctx.globalAlpha = 1;
        }
      }

      this.animId = requestAnimationFrame(render);
    };

    render();
  },

  // --------------------------------------------------------------------------
  // 2. APPLE & STRIPE-GRADE 3D CARD TILT WITH SPECULAR GLARE
  // --------------------------------------------------------------------------
  initCard3DTilt() {
    const tiltCards = document.querySelectorAll('.tilt-3d, .glass-card, .stat-card');
    
    tiltCards.forEach(card => {
      // Don't rebind
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = 'true';

      // Create 3D Specular Glare Overlay
      let glare = card.querySelector('.glare-3d');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'glare-3d';
        card.appendChild(glare);
      }

      let isHovered = false;
      let rafId = null;

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if (!clientX || !clientY) return;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Normalized: -1 to 1
        const normX = (x / rect.width) * 2 - 1;
        const normY = (y / rect.height) * 2 - 1;

        // Max tilt angles: 10 degrees
        const maxTilt = 9.5;
        const rotX = -normY * maxTilt;
        const rotY = normX * maxTilt;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(1100px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px) scale3d(1.015, 1.015, 1.015)`;
          
          // Position 3D Glare
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.16) 0%, transparent 65%)`;
          glare.style.opacity = '1';
        });
      };

      const handleLeave = () => {
        isHovered = false;
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = `perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)`;
        glare.style.opacity = '0';
      };

      card.addEventListener('mouseenter', () => { isHovered = true; });
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });
  },

  /**
   * Re-bind dynamic cards (called when switching modules or rendering new projects/students)
   */
  refreshCardTilt() {
    setTimeout(() => {
      this.initCard3DTilt();
    }, 120);
  }
};

window.ThreeDEngine = ThreeDEngine;

document.addEventListener('DOMContentLoaded', () => {
  window.ThreeDEngine.init();
});
