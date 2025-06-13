// Add this new file for particles background
document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const particleCount = 30;
  const particleSize = 6;
  const particleMinSpeed = 0.3;
  const particleMaxSpeed = 0.8;
  const particleColors = ["#ae8861", "#7d5f41", "#d9c7b8"];
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'particles';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.opacity = '0.4';
  canvas.style.zIndex = '2';
  document.body.appendChild(canvas);
  
  // Setup canvas
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Create particles
  let particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * particleSize + 1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      speedX: (Math.random() - 0.5) * (particleMaxSpeed - particleMinSpeed) + particleMinSpeed,
      speedY: (Math.random() - 0.5) * (particleMaxSpeed - particleMinSpeed) + particleMinSpeed,
      opacity: Math.random() * 0.5 + 0.2
    });
  }
  
  // Draw particles
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      
      // Move particle
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Bounce off edges
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
    
    requestAnimationFrame(draw);
  }
  
  draw();
  
  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});