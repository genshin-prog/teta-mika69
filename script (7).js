// ============ MUSIC ============
const MUSIC_URL = 'https://www.soundjay.com/misc/sounds/happy-birthday-01.mp3';

// Создаём аудио контекст с весёлой мелодией через Web Audio API
let audioCtx = null;
let musicPlaying = false;

function initMusic() {
  if (musicPlaying) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playBirthdayTune();
    musicPlaying = true;
  } catch(e) {
    console.log('Аудио недоступно');
  }
}

function playBirthdayTune() {
  if (!audioCtx) return;

  // Ноты "Happy Birthday" в Hz с длительностью в секундах
  const notes = [
    [261.63, 0.25], [261.63, 0.25], [293.66, 0.5], [261.63, 0.5],
    [349.23, 0.5], [329.63, 1.0],
    [261.63, 0.25], [261.63, 0.25], [293.66, 0.5], [261.63, 0.5],
    [392.00, 0.5], [349.23, 1.0],
    [261.63, 0.25], [261.63, 0.25], [523.25, 0.5], [440.00, 0.5],
    [349.23, 0.5], [329.63, 0.5], [293.66, 1.0],
    [466.16, 0.25], [466.16, 0.25], [440.00, 0.5], [349.23, 0.5],
    [392.00, 0.5], [349.23, 1.5]
  ];

  let time = audioCtx.currentTime + 0.1;

  function scheduleNote(freq, dur) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);
    osc.start(time);
    osc.stop(time + dur);
    time += dur + 0.05;
  }

  notes.forEach(([freq, dur]) => scheduleNote(freq, dur));

  // Повтор через ~10 сек
  setTimeout(() => {
    if (musicPlaying) playBirthdayTune();
  }, 10500);
}

// ============ CONFETTI ============
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiPieces = [];
let confettiActive = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createConfetti(count = 80) {
  const colors = ['#ff2d78','#ffe600','#39ff14','#00cfff','#ff8c00','#ff6fa8','#ffffff','#f0c060'];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height,
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.15,
      vy: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 3,
      opacity: 1
    });
  }
}

function animateConfetti() {
  if (!confettiActive && confettiPieces.length === 0) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces = confettiPieces.filter(p => p.y < canvas.height + 30 && p.opacity > 0.05);

  confettiPieces.forEach(p => {
    p.y += p.vy;
    p.x += p.vx;
    p.angle += p.angularSpeed;
    if (p.y > canvas.height * 0.7) p.opacity -= 0.015;

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  requestAnimationFrame(animateConfetti);
}

function startConfetti() {
  confettiActive = true;
  createConfetti(150);
  animateConfetti();
  // Добавляем порции
  const interval = setInterval(() => {
    if (!confettiActive) { clearInterval(interval); return; }
    createConfetti(40);
  }, 1500);
  setTimeout(() => {
    confettiActive = false;
    clearInterval(interval);
  }, 8000);
}

// ============ SECTION NAVIGATION ============
function openSection(name) {
  initMusic();
  document.getElementById('main-screen').classList.add('hidden');
  document.getElementById('section-' + name).classList.remove('hidden');
  window.scrollTo(0, 0);

  if (name === 'teto') {
    startConfetti();
  } else if (name === 'mell') {
    document.getElementById('mell-step1').classList.remove('hidden');
    document.getElementById('mell-step2').classList.add('hidden');
  } else if (name === 'genshin') {
    startPrimoCount();
  }
}

function closeSection(name) {
  document.getElementById('section-' + name).classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// ============ MELL STEP 2 ============
function mellStep2() {
  const step1 = document.getElementById('mell-step1');
  const step2 = document.getElementById('mell-step2');

  // Вспышка белого экрана
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed; inset: 0; background: white;
    z-index: 9000; opacity: 1;
    transition: opacity 0.8s ease;
  `;
  document.body.appendChild(flash);

  startConfetti();

  setTimeout(() => {
    flash.style.opacity = '0';
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    setTimeout(() => flash.remove(), 1000);
  }, 300);
}

// ============ PRIMO COUNT ANIMATION ============
function startPrimoCount() {
  const el = document.getElementById('primo-count');
  const target = 67000000;
  const duration = 2500;
  const start = Date.now();

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('ru-RU');
    if (progress < 1) requestAnimationFrame(update);
  }
  update();
}

// ============ PRANK BUTTON ============
function prankClick() {
  const toast = document.getElementById('prank-toast');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  // Запускаем конфетти сразу на главном экране
  confettiActive = true;
  createConfetti(100);
  animateConfetti();
  setTimeout(() => { confettiActive = false; }, 5000);

  // Инициализация аудио по первому клику (браузерная политика)
  document.body.addEventListener('click', initMusic, { once: true });

  // Анимация заголовка: случайное мерцание букв
  const title = document.querySelector('.line1');
  if (title) {
    setInterval(() => {
      const chars = '★☆🎉🎊🎂💀🔥⚡✨';
      // просто мигание
      title.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
    }, 2000);
  }
});
