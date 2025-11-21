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
    const particleCount = 100;
    const maxTrails = 50;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

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
      color: string;
      prevX: number;
      prevY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.prevX = this.x;
        this.prevY = this.y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 3 + 1;
        const colors = ["rgb(66, 133, 244)", "rgb(234, 67, 53)", "rgb(251, 188, 4)", "rgb(52, 163, 83)"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Store previous position for trail
        this.prevX = this.x;
        this.prevY = this.y;

        // Anti-gravity effect - repel from mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.min(200 / distance, 5);

        this.vx += (dx / distance) * force * 0.02;
        this.vy += (dy / distance) * force * 0.02;

        // Apply friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Create trail if moving fast enough
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.5 && trails.length < maxTrails) {
          trails.push(new Trail(this.prevX, this.prevY, this.color));
        }

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        // Draw connections
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(66, 133, 244, ${(1 - distance / 100) * 0.3})`;
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
      className="absolute inset-0 w-full h-full opacity-80"
      style={{ pointerEvents: "none", mixBlendMode: "screen" }}
    />
  );
};
