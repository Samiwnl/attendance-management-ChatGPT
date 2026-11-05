export function dayKey(time = Date.now()) {
  return new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Tokyo'}).format(new Date(time));
}
export function workMs(record, now = Date.now()) {
  if (!record) return 0;
  const end = record.end ?? now;
  const pauses = record.breaks.reduce((sum,b) => sum + ((b.end ?? end) - b.start),0);
  return Math.max(0,end - record.start - pauses);
}
export function punch(records, action, now = Date.now()) {
  const next = structuredClone(records);
  const active = next.find(r => !r.end);
  if(action === 'in') {
    if(active || next.some(r => r.day === dayKey(now))) throw new Error('本日はすでに出勤を記録しています。');
    next.push({day:dayKey(now),start:now,end:null,breaks:[]});
  } else {
    if(!active) throw new Error('先に出勤を打刻してください。');
    const pause = active.breaks.find(b => !b.end);
    if(action === 'break') {
      if(pause) throw new Error('すでに休憩中です。');
      active.breaks.push({start:now,end:null});
    } else if(action === 'resume') {
      if(!pause) throw new Error('休憩中ではありません。');
      pause.end = now;
    } else if(action === 'out') {
      if(pause) pause.end = now;
      active.end = now;
    } else throw new Error('不明な操作です。');
  }
  return next;
}
export function duration(ms) {const m = Math.floor(ms/60000);return `${Math.floor(m/60)}時間${String(m%60).padStart(2,'0')}分`;}
