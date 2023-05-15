let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
console.log(ctx);

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.radius = Math.random() * 2 + 3;
    this.x =
      this.radius + Math.random() * (this.effect.width - this.radius * 2);
    this.y =
      this.radius + Math.random() * (this.effect.height - this.radius * 2);
    this.vx = Math.random() * 4 - 2;
    this.vy = Math.random() * 4 - 2;
  }
  draw(context) {
    context.fillStyle = "hsl(" + this.x * 0.5 + ", 100%, 50%)";
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.lineWidth = 2;
    context.strokeStyle = "hsl(" + this.x + ", 100%, 50%)";
    context.stroke();
    context.fill();
  }
  update() {
    this.x += this.vx;
    if (this.x > this.effect.width - this.radius || this.x < this.radius)
      this.vx *= -1;
    this.y += this.vy;
    if (this.y > this.effect.height - this.radius || this.y < this.radius)
      this.vy *= -1;
  }
}

class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 300;
    this.createParticles();
  }
  createParticles() {
    for (let i = 0; i < this.numberOfParticles; i++) {
      const newParticle = new Particle(this);
      let overlapping = false;
      for (let j = i; j < this.particles.length; j++) {
        const otherParticle = this.particles[j];
        const distance = Math.hypot(
          newParticle.x - otherParticle.x,
          newParticle.y - otherParticle.y
        );
        if (distance <= newParticle.radius + otherParticle.radius) {
          overlapping = true;
          break;
        }
      }
      if (!overlapping) {
        this.particles.push(newParticle);
      }
    }
  }

  handleParticles(context) {
    this.connectParticles(context);
    this.particles.forEach(particle => {
      particle.draw(context);
      particle.update();
    });
  }

  connectParticles(context) {
    const maxDistance = 60;
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const dx = this.particles[a].x - this.particles[b].x;
        const dy = this.particles[a].y - this.particles[b].y;
        // const distance = Math.sqrt(dx * dx + dy * dy);
        const distance = Math.hypot(dx, dy);
        if (distance <= maxDistance) {
          context.save();
          

          const opacity = 1 - distance / maxDistance;
          context.globalAlpha = opacity;
          const hue = 360 * (1 - opacity);
          const brightness = 100 * (1 - opacity);

          context.strokeStyle = "hsl(" + hue + ", 100%,"+ brightness +"%)";
          context.beginPath();
          context.moveTo(this.particles[a].x, this.particles[a].y);
          context.lineTo(this.particles[b].x, this.particles[b].y);
          context.lineWidth = 3;
          context.stroke();
          context.restore();
        }

        if (distance < this.particles[a].radius + this.particles[b].radius) {
          const angle = Math.atan2(dy, dx);
          const targetX =
            this.particles[a].x +
            Math.cos(angle) *
              (this.particles[a].radius + this.particles[b].radius);
          const targetY =
            this.particles[a].y +
            Math.sin(angle) *
              (this.particles[a].radius + this.particles[b].radius);
          const ax = (targetX - this.particles[b].x) * 0.05;
          const ay = (targetY - this.particles[b].y) * 0.05;
          this.particles[b].vx -= ax;
          this.particles[b].vy -= ay;
          this.particles[a].vx += ax;
          this.particles[a].vy += ay;
        }
      }
    }
  }
}

const effect = new Effect(canvas);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
}
animate();

addEventListener("resize", function() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  effect.width = canvas.width;
  effect.height = canvas.height;
  effect.particles = [];
  effect.createParticles();
});


