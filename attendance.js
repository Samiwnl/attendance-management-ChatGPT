export function dayKey(time = Date.now()) {
  return new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Tokyo'}).format(new Date(time));
}
export function checkIn(records, now = Date.now()) {
  const day = dayKey(now);
  if (records.some(record => record.day === day)) throw new Error('本日はすでに出勤を記録しています。');
  return [...records, {day}];
}
export function monthDays(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return [];
  const [year, number] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({length:count}, (_, i) => `${month}-${String(i+1).padStart(2,'0')}`);
}
export function setAttendance(records, day, attended, now = Date.now()) {
  const month = typeof day === 'string' ? day.slice(0,7) : '';
  if (!monthDays(month).includes(day) || day > dayKey(now)) throw new Error('今日以前の有効な日付を選択してください。');
  const next = records.filter(record => record.day !== day);
  return attended ? [...next, {day}] : next;
}
