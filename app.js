import {dayKey,workMs,punch,duration} from './attendance.js';
const $ = id => document.getElementById(id);
const key = 'hibi-attendance-v1';
let records=[];let storageOk=true;let toastTimer;
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4000);}
try{const raw=JSON.parse(localStorage.getItem(key)??'[]');if(!Array.isArray(raw)||raw.some(r=>!r||typeof r.day!=='string'||!Number.isFinite(r.start)||!(r.end===null||Number.isFinite(r.end))||!Array.isArray(r.breaks)||r.breaks.some(b=>!b||!Number.isFinite(b.start)||!(b.end===null||Number.isFinite(b.end)))))throw Error();records=raw;}catch{storageOk=false;notify('保存データを読み込めません。ブラウザの保存設定を確認してください。');}
const time=t=>t==null?'—':new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hour12:false}).format(t);
$('month').value=dayKey().slice(0,7);
function render(){
 const now=Date.now();const today=records.find(r=>r.day===dayKey());const active=records.find(r=>!r.end);const resting=active?.breaks.some(b=>!b.end);
 $('date').textContent=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(now);
 const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
 $('clock').innerHTML=`${clock.slice(0,5)}<span>${clock.slice(5)}</span>`;
 $('status').textContent=active?(resting?'休憩中':'勤務中'):today?'退勤済み':'未出勤';$('status').classList.toggle('active',!!active);
 $('in').disabled=!storageOk||!!active||!!today;$('out').disabled=!storageOk||!active;$('pause').disabled=!storageOk||!active;
 $('pause').textContent=resting?'↩ 休憩を終了':'☕ 休憩を開始';
 const shown=active??today;$('start-time').textContent=time(shown?.start);$('end-time').textContent=time(shown?.end);$('today-total').textContent=shown?duration(workMs(shown,now)):'—';
 const monthRecords=records.filter(r=>r.day.startsWith(dayKey().slice(0,7)));
 $('month-hours').innerHTML=`${(monthRecords.reduce((sum,r)=>sum+workMs(r,now),0)/3600000).toFixed(1)}<span>時間</span>`;
 $('month-days').innerHTML=`${monthRecords.length}<span>日</span>`;$('month-label').textContent=`${dayKey().slice(0,7).replace('-','年')}月の記録`;
 const filtered=records.filter(r=>r.day.startsWith($('month').value)).sort((a,b)=>b.start-a.start);
 $('records').replaceChildren();for(const r of filtered){const tr=document.createElement('tr');const pause=r.breaks.reduce((sum,b)=>sum+(b.end??now)-b.start,0);for(const value of [new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',month:'2-digit',day:'2-digit',weekday:'short'}).format(r.start),time(r.start),time(r.end),duration(pause),duration(workMs(r,now)),r.end?'退勤済み':r.breaks.some(b=>!b.end)?'休憩中':'勤務中']){const td=document.createElement('td');td.textContent=value;tr.append(td);}$('records').append(tr);}
 $('empty').hidden=filtered.length>0;
}
function act(action){try{const next=punch(records,action);localStorage.setItem(key,JSON.stringify(next));records=next;render();notify({in:'出勤を記録しました。今日もよい一日を。',out:'退勤を記録しました。お疲れさまでした。',break:'休憩を開始しました。',resume:'休憩を終了しました。'}[action]);}catch(e){notify(e.message||'保存できませんでした。');}}
$('in').onclick=()=>act('in');$('out').onclick=()=>act('out');$('pause').onclick=()=>act(records.find(r=>!r.end)?.breaks.some(b=>!b.end)?'resume':'break');$('month').onchange=render;
$('export').onclick=()=>{const rows=records.filter(r=>r.day.startsWith($('month').value)).sort((a,b)=>a.start-b.start);if(!rows.length){notify('選択した月に出力できる記録がありません。');return;}const now=Date.now();const csv=[['日付','出勤','退勤','休憩（分）','実働（分）'],...rows.map(r=>[r.day,time(r.start),time(r.end),Math.floor(r.breaks.reduce((s,b)=>s+(b.end??now)-b.start,0)/60000),Math.floor(workMs(r,now)/60000)])].map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`attendance-${$('month').value}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.addEventListener('storage',event=>{if(event.key===key)location.reload();});render();setInterval(render,1000);
