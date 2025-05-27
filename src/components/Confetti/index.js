import React, {  useEffect,  useRef } from "react";
import PropTypes from "prop-types";

const Confetti = ({ onAnimationEnd }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.parentElement.clientWidth;
    let height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;

    let particles = [];
    const particleCount = 200;
    const colors = [
      "#91a5a1",
      "#81abbc",
      "#e6b451",
      "#5e6e54",
      "#FFFFFF",
      "#DBEAFE",
    ];
    
    function Particle() {
      this.x = Math.random() * width;
      this.y = Math.random() * height - height;
      this.size = Math.random() * 10 + 5;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = Math.random() * 6 - 3; // -3 to 3
      this.speedY = Math.random() * 5 + 2; // 2 to 7
      this.opacity = 1;
      this.rotation = Math.random() * 360;
      this.spin = Math.random() < 0.5 ? -1 : 1 * (Math.random() * 0.2); // Slower spin
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.spin;
      if (this.y > height) {
        this.y = -this.size; // Reset above screen
        this.x = Math.random() * width; // Re-randomize x
        this.opacity = 1;
      }
      if (this.opacity > 0.05) {
        this.opacity -= 0.005; // Slower fade
      } else {
        this.opacity = 0;
      }
    };

    Particle.prototype.draw = function () {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6); // Rectangular confetti
      ctx.restore();
    };

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId.current = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = entry.contentRect.width;
        height = entry.contentRect.height;
        canvas.width = width;
        canvas.height = height;
        // Optional: re-initialize particles on resize for better distribution
        // initParticles();
      }
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const timer = setTimeout(() => {
      if (onAnimationEnd) onAnimationEnd();
    }, 4000); // Confetti duration

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [onAnimationEnd]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
};

Confetti.propTypes = {
  onAnimationEnd: PropTypes.func.isRequired, // Define onAnimationEnd as a function and make it required
};

export default Confetti