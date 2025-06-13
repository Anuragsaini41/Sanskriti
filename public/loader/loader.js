var c = document.getElementById('wave');
var $ = c.getContext('2d');
var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;

var t = 0;
let amplitude = 1;

var flagflow = function(a, b, t) {
  $.lineWidth = 0.5;
  // Changed to warmer tone that matches the gradient
  $.fillStyle = 'rgba(243, 226, 199, 0.7)';
  $.fillRect(0, 0, w, h);

  // Saffron wave
  for (let i = -60; i < 60; i++) {
    $.strokeStyle = 'rgba(255,153,51,0.9)';
    $.beginPath();
    $.moveTo(0, h / 2);
    for (let j = 0; j < w; j += 10) {
      $.lineTo(
        10 * Math.sin(i / 10) + j + 0.008 * j * j,
        Math.floor(
          h / 2 +
          amplitude * j * Math.sin(j / 50 - t / 50 - i / 118) +
          (i * 0.9) * Math.cos(j / 25 - (i + t) / 65)
        )
      );
    }
    $.stroke();
  }

  // White wave - slightly darker for better visibility
  for (let i = -60; i < 60; i++) {
    $.strokeStyle = 'rgba(235,235,235,0.9)';
    $.beginPath();
    $.moveTo(0, h / 2);
    for (let j = 0; j < w; j += 10) {
      $.lineTo(
        10 * Math.cos(i / 10) + j + 0.008 * j * j,
        Math.floor(
          h / 2 +
          amplitude * j * Math.sin(j / 50 - t / 50 - i / 118) +
          (i * 0.9) * Math.sin(j / 25 - (i + t) / 65)
        )
      );
    }
    $.stroke();
  }

  // Green wave
  for (let i = -60; i < 60; i++) {
    $.strokeStyle = 'rgba(19,136,8,0.9)';
    $.beginPath();
    $.moveTo(0, h / 2);
    for (let j = 0; j < w; j += 10) {
      $.lineTo(
        10 * Math.sin(i / 10) + j + 0.008 * j * j,
        Math.floor(
          h / 2 +
          amplitude * j * Math.cos(j / 50 - t / 50 - i / 118) +
          (i * 0.9) * Math.sin(j / 25 - (i + t) / 65)
        )
      );
    }
    $.stroke();
  }
  
  drawAshokaChakra(w / 2, h / 2, 160, t);
};

function drawAshokaChakra(x, y, radius, t) {
  $.save();
  $.translate(x, y);
  $.rotate(t / 100);

  $.shadowColor = 'rgba(0, 0, 0, 0.4)';
  $.shadowBlur = 10;

  $.strokeStyle = '#000080'; // Changed to darker navy blue for better contrast
  $.lineWidth = 8;
  
  // Outer Circle
  $.beginPath();
  $.arc(0, 0, radius, 0, 2 * Math.PI);
  $.stroke();
  
  // 24 spokes
  for (let i = 0; i < 24; i++) {
    let angle = (i * 2 * Math.PI) / 24;
    let innerX = radius * 0.05 * Math.cos(angle);
    let innerY = radius * 0.05 * Math.sin(angle);
    let outerX = radius * Math.cos(angle);
    let outerY = radius * Math.sin(angle);
    $.beginPath();
    $.moveTo(innerX, innerY);
    $.lineTo(outerX, outerY);
    $.stroke();
  }
  
  $.restore();
}

window.addEventListener('resize', function () {
  c.width = w = window.innerWidth;
  c.height = h = window.innerHeight;
}, false);

var run = function () {
  window.requestAnimationFrame(run);
  t += 1;
  flagflow(33, 52 * Math.sin(t / 2400), t);
};

run();
