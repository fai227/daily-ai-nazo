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
 const viewport = root.querySelector('.carousel-viewport');
 const pause = root.querySelector('[data-carousel-pause]');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 let position = 1, busy = false, timer, paused = reduced.matches, hovering = false, focused = false, gesture = null, suppressClick = false;
 const first = slides[0].cloneNode(true), last = slides.at(-1).cloneNode(true);
 for (const clone of [first,last]) { clone.inert = true; clone.setAttribute('aria-hidden','true'); clone.querySelectorAll('img').forEach(img => img.loading='eager'); }
 track.prepend(last); track.append(first); root.classList.add('enhanced');
 function draw(animate = false, offset = 0) {
  track.style.transition = animate && !reduced.matches ? 'transform 450ms ease' : 'none';
  track.style.transform = `translateX(calc(${-position * 100}% + ${offset}px))`;
  const active = (position - 1 + slides.length) % slides.length;
  slides.forEach((slide,i) => { slide.inert=i!==active; slide.setAttribute('aria-hidden',String(i!==active)); });
 }
 function finish() {
  clearTimeout(timer);
  if (position === 0) position = slides.length;
  if (position === slides.length + 1) position = 1;
  draw(); busy = false;
 }
 function move(delta) {
  if (busy) return;
  busy = true; position += delta; draw(true);
  if (reduced.matches) finish(); else timer=setTimeout(finish,500);
 }
 track.addEventListener('transitionend', e => { if(e.target===track && e.propertyName==='transform') finish(); });
 root.querySelector('[data-carousel-prev]').addEventListener('click', () => move(-1));
 root.querySelector('[data-carousel-next]').addEventListener('click', () => move(1));
 function updatePause() { pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'自動送りを再開':'自動送りを停止'); }
 pause.addEventListener('click', () => { paused=!paused;updatePause(); });
 root.addEventListener('mouseenter', () => hovering=true);
 root.addEventListener('mouseleave', () => hovering=false);
 root.addEventListener('focusin', () => focused=true);
 root.addEventListener('focusout', e => focused=root.contains(e.relatedTarget));
 track.addEventListener('keydown', e => { if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);} });
 viewport.addEventListener('pointerdown', e => { if(busy || e.target.closest('button') || e.button!==0)return;gesture={x:e.clientX,y:e.clientY,dx:0,horizontal:false};suppressClick=false; });
 viewport.addEventListener('pointermove', e => {
  if(!gesture)return;
  const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;
  if(!gesture.horizontal && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>10){gesture=null;return;}
  if(Math.abs(dx)>10){gesture.horizontal=true;gesture.dx=dx;suppressClick=true;viewport.setPointerCapture(e.pointerId);draw(false,dx);}
 });
 function endGesture(){if(!gesture)return;const {dx,horizontal}=gesture;gesture=null;if(horizontal && Math.abs(dx)>40)move(dx<0?1:-1);else draw(true);}
 viewport.addEventListener('pointerup',endGesture);
 viewport.addEventListener('pointercancel',()=>{gesture=null;draw(true);});
 viewport.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();suppressClick=false;}},true);
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 reduced.addEventListener('change',()=>{paused=reduced.matches;finish();updatePause();});
 setInterval(()=>{if(!paused&&!hovering&&!focused&&!gesture&&!document.hidden)move(1);},7000);
 draw();updatePause();
}
