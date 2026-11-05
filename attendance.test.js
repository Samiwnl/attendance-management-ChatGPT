import test from 'node:test';
import assert from 'node:assert/strict';
import {checkIn, dayKey, monthDays} from './attendance.js';
const start = Date.parse('2026-11-05T00:00:00Z');
test('出勤は日付のみ保存し、同日の重複を防ぐ', () => {
 const records = checkIn([],start);
 assert.deepEqual(records,[{day:'2026-11-05'}]);
 assert.throws(() => checkIn(records,start+3600000));
 assert.equal(checkIn(records,start+86400000).length,2);
});
test('旧形式の未退勤データが翌日の出勤を妨げない', () => {
 const old = [{day:'2026-11-04',start:start-86400000,end:null,breaks:[]}];
 assert.equal(checkIn(old,start).length,2);
 assert.equal(old.length,1);
});
test('日本時間の日付境界', () => {
 assert.equal(dayKey(Date.parse('2026-11-04T14:59:59Z')),'2026-11-04');
 assert.equal(dayKey(Date.parse('2026-11-04T15:00:00Z')),'2026-11-05');
});
test('月全体の日付を返す：28日・29日・30日・31日', () => {
 for (const [month,count] of [['2026-02',28],['2028-02',29],['2026-11',30],['2026-12',31]]) {
  const days=monthDays(month); assert.equal(days.length,count);
  assert.equal(days[0],`${month}-01`); assert.equal(days.at(-1),`${month}-${count}`);
 }
 assert.deepEqual(monthDays(''),[]); assert.deepEqual(monthDays('2026-13'),[]);
});
