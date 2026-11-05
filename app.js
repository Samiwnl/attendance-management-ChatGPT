import {dayKey,checkIn,monthDays} from './attendance.js';
const $ = id => document.getElementById(id);
// Keep the original storage key: existing attendance dates remain available.
const key = 'hibi-attendance-v1';
let records = [];
let storageOk = true;
let toastTimer;
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4000);
}
try {
  const raw = JSON.parse(localStorage.getItem(key) ?? '[]');
  if (!Array.isArray(raw) || raw.some(r => !r || !/^\d{4}-\d{2}-\d{2}$/.test(r.day))) throw Error();
  records = [...new Set(raw.map(r => r.day))].map(day => ({day}));
} catch {
  storageOk = false;
  notify('保存データを読み込めません。ブラウザの保存設定を確認してください。');
}
$('month').value = dayKey().slice(0,7);
let previousDay;
function renderToday() {
  const now = Date.now();
  const day = dayKey(now);
  const attended = records.some(r => r.day === day);
  $('date').textContent = new Intl.DateTimeFormat('ja-JP', {timeZone:'Asia/Tokyo', year:'numeric', month:'long', day:'numeric', weekday:'long'}).format(now);
  const clock = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Tokyo', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false}).format(now);
  $('clock').innerHTML = `${clock.slice(0,5)}<span>${clock.slice(5)}</span>`;
  $('status').textContent = attended ? '出勤済み' : '未記録';
  $('status').classList.toggle('active', attended);
  $('in').disabled = !storageOk || attended;
  $('in').textContent = attended ? '✓ 本日の出勤を記録済み' : '↗ 出勤を記録する';
  $('month-days').innerHTML = `${records.filter(r => r.day.startsWith(day.slice(0,7))).length}<span>日</span>`;
  $('month-label').textContent = `${day.slice(0,7).replace('-','年')}月の記録`;
  if (previousDay !== day) { previousDay = day; renderCalendar(); }
}
function renderCalendar() {
  const month = $('month').value;
  const days = monthDays(month);
  $('calendar').replaceChildren();
  $('calendar-title').textContent = days.length ? `${month.replace('-','年')}月` : '表示月を選択してください';
  if (!days.length) return;
  const dates = new Set(records.map(r => r.day));
  const offset = new Date(`${days[0]}T00:00:00Z`).getUTCDay();
  for (let i=0; i<offset; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-blank';
    blank.setAttribute('aria-hidden','true');
    $('calendar').append(blank);
  }
  for (const day of days) {
    const attended = dates.has(day);
    const cell = document.createElement('div');
    cell.className = `calendar-day${attended ? ' attended' : ''}${day === dayKey() ? ' is-today' : ''}`;
    cell.setAttribute('role','listitem');
    cell.setAttribute('aria-label', `${day} ${attended ? '出勤済み' : '記録なし'}`);
    if (day === dayKey()) cell.setAttribute('aria-current','date');
    const number = document.createElement('span');
    number.className = 'day-number';
    number.textContent = Number(day.slice(-2));
    const status = document.createElement('span');
    status.className = 'day-status';
    status.textContent = attended ? '● 出勤' : '—';
    cell.append(number,status);
    $('calendar').append(cell);
  }
  for (let i=0; i<(7-(offset+days.length)%7)%7; i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-blank';
    blank.setAttribute('aria-hidden','true');
    $('calendar').append(blank);
  }
}
$('in').onclick = () => {
  try {
    const next = checkIn(records);
    localStorage.setItem(key, JSON.stringify(next));
    records = next;
    renderToday();
    renderCalendar();
    notify('本日の出勤を記録しました。');
  } catch(e) { notify(e.message || '保存できませんでした。'); }
};
$('month').onchange = renderCalendar;
$('export').onclick = () => {
  const days = monthDays($('month').value);
  if (!days.length) { notify('表示月を選択してください。'); return; }
  const dates = new Set(records.map(r => r.day));
  const csv = [['日付','出勤状況'], ...days.map(day => [day, dates.has(day) ? '出勤' : '記録なし'])]
    .map(row => row.map(value => `"${value}"`).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance-${$('month').value}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
window.addEventListener('storage', event => { if (event.key === key) location.reload(); });
renderToday();
setInterval(renderToday,1000);
