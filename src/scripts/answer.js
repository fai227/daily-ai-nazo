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
  if (readSaved(key)) result.textContent = 'この端末で正解済みです。';
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

const latestHeading = document.getElementById('latest-heading');
if (latestHeading) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const value = type => parts.find(p => p.type === type).value;
  const today = `${value('year')}-${value('month')}-${value('day')}`;
  latestHeading.textContent = latestHeading.dataset.date === today ? '今日の謎' : '最新の謎';
}

const track=document.querySelector('.carousel-track');
if(track){
 const prev=document.querySelector('[data-carousel-prev]'),next=document.querySelector('[data-carousel-next]'),count=document.querySelector('[data-carousel-count]');
 const slides=[...track.children]; let index=0;
 const update=()=>{index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/track.clientWidth)));count.textContent=`${index+1} / ${slides.length}`;prev.disabled=index===0;next.disabled=index===slides.length-1;};
 const move=delta=>{const target=Math.max(0,Math.min(slides.length-1,index+delta));track.scrollTo({left:target*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',update,{passive:true});track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});window.addEventListener('resize',()=>{track.scrollLeft=index*track.clientWidth;update();});update();
}
