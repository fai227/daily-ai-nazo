'use strict';
function normalize(value) {
  return value.normalize('NFKC').trim().toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}
function readSaved(key) { try { return localStorage.getItem(key) === '1'; } catch { return false; } }
const keyFor = value => 'daily-nazo:' + value;
document.querySelectorAll('[data-solved]').forEach(el => { if (readSaved(keyFor(el.dataset.solved))) el.textContent = '正解済み'; });
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
      result.textContent = '正解です！ 答えと解説を開きました。';
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
