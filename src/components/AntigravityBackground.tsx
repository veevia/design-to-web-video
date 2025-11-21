import { useEffect, useRef } from "react";

export const AntigravityBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const trails: Trail[] = [];
    const particleCount = 150;
    const maxTrails = 30;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let mouseVelocity = 0;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;

    class Trail {
      x: number;
      y: number;
      life: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.color = color;
      }

      update() {
        this.life -= 0.02;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace(')', `, ${this.life})`).replace('rgb', 'rgba');
        ctx.fill();
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseColor: string;
      currentColor: string;
      prevX: number;
      prevY: number;
      hue: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1.5;
        
        // Google colors in HSL
        const colorHues = [217, 4, 45, 145]; // Blue, Red, Yellow, Green
        this.hue = colorHues[Math.floor(Math.random() * colorHues.length)];
        this.baseColor = `hsl(${this.hue}, 89%, 61%)`;
        this.currentColor = this.baseColor;
      }

      update() {
        // Store previous position for trail
        this.prevX = this.x;
        this.prevY = this.y;

        // Anti-gravity effect - repel from mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Stronger repulsion force when closer
        const repelRadius = 150;
        if (distance < repelRadius) {
          const force = (1 - distance / repelRadius) * 8;
          this.vx += (dx / distance) * force * 0.1;
          this.vy += (dy / distance) * force * 0.1;
        }

        // Color shift based on cursor velocity
        const velocityFactor = Math.min(mouseVelocity / 50, 1);
        const hueShift = velocityFactor * 60;
        const saturation = 89 + velocityFactor * 10;
        const lightness = 61 + velocityFactor * 20;
        this.currentColor = `hsl(${this.hue + hueShift}, ${saturation}%, ${lightness}%)`;

        // Apply stronger friction for smoother movement
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Create trail if moving fast enough
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.5 && trails.length < maxTrails) {
          trails.push(new Trail(this.prevX, this.prevY, this.currentColor));
        }

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        
        // Particle with subtle glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, this.currentColor);
        gradient.addColorStop(0.5, this.currentColor.replace(')', ', 0.5)').replace('hsl', 'hsla'));
        gradient.addColorStop(1, this.currentColor.replace(')', ', 0)').replace('hsl', 'hsla'));
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e: MouseEvent) => {
      const newMouseX = e.clientX;
      const newMouseY = e.clientY;
      
      // Calculate mouse velocity for color shifting
      const dx = newMouseX - prevMouseX;
      const dy = newMouseY - prevMouseY;
      mouseVelocity = Math.sqrt(dx * dx + dy * dy);
      
      prevMouseX = newMouseX;
      prevMouseY = newMouseY;
      mouseX = newMouseX;
      mouseY = newMouseY;
    };

    const animate = () => {
      // Clear with very subtle fade for trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Gradually reduce mouse velocity
      mouseVelocity *= 0.9;

      // Update and draw trails
      trails.forEach((trail, index) => {
        trail.update();
        if (trail.life <= 0) {
          trails.splice(index, 1);
        } else {
          trail.draw();
        }
      });

      particles.forEach((particle) => {
        particle.update();
        particle.draw();

        // Draw subtle connections between nearby particles
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (1 - distance / 80) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-90"
      style={{ pointerEvents: "none", mixBlendMode: "screen" }}
    />
  );
};
