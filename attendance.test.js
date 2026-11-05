import test from 'node:test';
import assert from 'node:assert/strict';
import {punch,workMs,dayKey} from './attendance.js';
const start=Date.parse('2026-11-05T00:00:00Z');
test('出勤→休憩→復帰→退勤、休憩を除いた実働時間',()=>{let r=punch([],'in',start);r=punch(r,'break',start+3600000);r=punch(r,'resume',start+7200000);r=punch(r,'out',start+10800000);assert.equal(workMs(r[0]),7200000);assert.equal(r[0].end,start+10800000);});
test('重複出勤・未出勤の退勤を防ぐ',()=>{assert.throws(()=>punch([],'out',start));const r=punch([],'in',start);assert.throws(()=>punch(r,'in',start));assert.throws(()=>punch(r,'resume',start));assert.equal(r[0].end,null);});
test('休憩中の退勤で休憩を閉じる',()=>{let r=punch([],'in',start);r=punch(r,'break',start+3600000);r=punch(r,'out',start+7200000);assert.equal(workMs(r[0]),3600000);assert.equal(r[0].breaks[0].end,r[0].end);assert.throws(()=>punch(r,'in',start+8000000));});
test('日付は日本時間、日を跨いだ勤務も退勤可能',()=>{assert.equal(dayKey(Date.parse('2026-11-04T16:00:00Z')),'2026-11-05');let r=punch([],'in',start);r=punch(r,'out',start+86400000);assert.equal(workMs(r[0]),86400000);});
