'use strict';
function normalize(value) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}
function readSaved(key) { try { return localStorage.getItem(key) === '1'; } catch { return false; } }
const keyFor = value => 'daily-nazo:' + value;
function updateCalendar() {
 document.querySelectorAll('[data-solved]').forEach(el => {
  const solved=readSaved(keyFor(el.dataset.solved)); el.hidden=solved;
  const link=el.closest('[data-calendar-date]'); if(link) link.setAttribute('aria-label',`${link.dataset.calendarDate}の謎・${solved?'正解済み':'未クリア'}`);
 });
}
updateCalendar(); window.addEventListener('pageshow',updateCalendar); window.addEventListener('storage',updateCalendar);
const dataElement = document.getElementById('puzzle-data');
if (dataElement) {
  const puzzle = JSON.parse(dataElement.textContent);
  const key = keyFor(`${puzzle.id}:${puzzle.revision}`);
  const result = document.getElementById('result');
  const solution = document.getElementById('solution');
  document.getElementById('answer-form').addEventListener('submit', event => {
    event.preventDefault();
    const answer = normalize(document.getElementById('answer').value);
    if (!answer) { result.textContent = '答えを入力してください。'; return; }
    if (puzzle.answers.some(expected => normalize(expected) === answer)) {
      result.replaceChildren(); const heading=document.createElement('strong'); heading.textContent='正解'; const caption=document.createElement('span'); caption.textContent='答えを開きました'; result.append(heading,caption);
      result.className = 'correct';
      solution.open = true;
      try { localStorage.setItem(key, '1'); } catch { /* Storage is optional. */ }
    } else { result.textContent = 'まだ違うようです。もう一度、見方を変えてみましょう。'; result.className = ''; }
  });
}

const track = document.querySelector('.carousel-track');
if (track) {
 const slides = [...track.children], root = track.closest('.carousel');
 const count = root.querySelector('[data-carousel-count]');
 const pause = root.querySelector('[data-carousel-pause]');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let index = 0, paused = reduced.matches, hovering = false, focused = false;
 track.classList.add('drum');
 function render() {
  slides.forEach((slide, i) => {
   const active = i === index;
   slide.classList.toggle('active', active);
   slide.inert = !active;
   slide.setAttribute('aria-hidden', String(!active));
  });
  count.textContent = `${index + 1} / ${slides.length}`;
  pause.textContent = paused ? '▶' : 'Ⅱ';
  pause.setAttribute('aria-label', paused ? '自動送りを再開' : '自動送りを停止');
 }
 function move(delta) { index = (index + delta + slides.length) % slides.length; render(); }
 root.querySelector('[data-carousel-prev]').addEventListener('click', () => move(-1));
 root.querySelector('[data-carousel-next]').addEventListener('click', () => move(1));
 pause.addEventListener('click', () => { paused = !paused; render(); });
 root.addEventListener('mouseenter', () => hovering = true);
 root.addEventListener('mouseleave', () => hovering = false);
 root.addEventListener('focusin', () => focused = true);
 root.addEventListener('focusout', e => focused = root.contains(e.relatedTarget));
 track.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
   e.preventDefault(); move(['ArrowUp','ArrowLeft'].includes(e.key) ? -1 : 1);
  }
 });
 let startY = null;
 track.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, {passive:true});
 track.addEventListener('touchend', e => {
  if (startY !== null && Math.abs(e.changedTouches[0].clientY-startY)>50) move(e.changedTouches[0].clientY<startY ? 1 : -1);
  startY = null;
 }, {passive:true});
 reduced.addEventListener('change', () => { paused = reduced.matches; render(); });
 setInterval(() => { if (!paused && !hovering && !focused && !document.hidden) move(1); }, 7000);
 render();
}
