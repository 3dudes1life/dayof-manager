
(() => {
'use strict';
const KEY='dayof-manager-v01', $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=(p='id')=>`${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const defaults={events:[],activeEventId:null,screen:'events',builderTab:'schedule',dayMode:false,dayScreen:'live'};
let state=load();

function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return clone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function event(){return state.events.find(e=>e.id===state.activeEventId)||null}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function makeCode(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function fmtDate(d){return d?new Date(`${d}T12:00:00`).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'}):'No date'}
function day(d){return d?new Date(`${d}T12:00:00`).getDate():'--'}
function mon(d){return d?new Date(`${d}T12:00:00`).toLocaleDateString([],{month:'short'}).toUpperCase():'---'}
function fmtTime(t){if(!t)return'—';let[h,m]=t.split(':').map(Number),a=h>=12?'PM':'AM';h=h%12||12;return`${h}:${String(m).padStart(2,'0')} ${a}`}
function toM(t){if(!t)return 0;const[h,m]=t.split(':').map(Number);return h*60+m}
function fmtM(n){n=(n+1440)%1440;let h=Math.floor(n/60),m=n%60,a=h>=12?'PM':'AM';h=h%12||12;return`${h}:${String(m).padStart(2,'0')} ${a}`}
function initials(n='?'){return n.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function toast(t){document.querySelector('.toast')?.remove();const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}
function accent(name){const m={pink:['#ff3e98','#914cff'],blue:['#4aa8ff','#6754ff'],green:['#42dc9a','#2fb7c8'],orange:['#ff8a3d','#ff3f76'],purple:['#a35cff','#ef4da8']},c=m[name]||m.pink;document.documentElement.style.setProperty('--accent',c[0]);document.documentElement.style.setProperty('--accent2',c[1])}
function newEvent(d={}){return{id:uid('evt'),name:d.name||'Untitled Event',venue:d.venue||'',date:d.date||new Date().toISOString().slice(0,10),start:d.start||'09:00',end:d.end||'18:00',manager:d.manager||'',accent:d.accent||'pink',code:makeCode(),schedule:d.schedule||[],people:d.people||[],team:d.team||[],issues:[],completed:[],ready:[],delay:0,handoff:''}}
function demo(){
 const people=[{id:'p1',name:'Jordan Lee',role:'Stage Manager',arrival:'08:00',phone:'',email:'',notes:'Main stage lead'},{id:'p2',name:'The Sunset Duo',role:'Performer',arrival:'11:15',phone:'',email:'',notes:'Acoustic set'},{id:'p3',name:'Maya Cruz',role:'Host',arrival:'10:30',phone:'',email:'',notes:'Opening and transitions'},{id:'p4',name:'Nova Dance Co.',role:'Performer',arrival:'12:30',phone:'',email:'',notes:'8 dancers'}];
 return newEvent({name:'Summer Stage Showcase',venue:'Festival Main Stage',date:new Date().toISOString().slice(0,10),start:'08:00',end:'17:00',manager:'Event Manager',accent:'purple',people,team:[{id:uid('t'),name:'Event Manager',role:'Event Manager'},{id:uid('t'),name:'Jordan Lee',role:'Stage Manager'}],schedule:[
 {id:'b1',title:'Load-In & Setup',start:'08:00',end:'10:30',type:'setup',subtitle:'Production',personId:'p1',notes:'Stage, sound, signage'},
 {id:'b2',title:'Team Briefing',start:'10:30',end:'11:00',type:'program',subtitle:'All staff',personId:'p1',notes:'Safety and communications'},
 {id:'b3',title:'Doors Open',start:'11:00',end:'11:30',type:'program',subtitle:'Guest arrival',personId:'',notes:''},
 {id:'b4',title:'Opening Welcome',start:'11:30',end:'11:40',type:'program',subtitle:'Maya Cruz',personId:'p3',notes:''},
 {id:'b5',title:'The Sunset Duo',start:'11:45',end:'12:25',type:'performance',subtitle:'Live performance',personId:'p2',notes:''},
 {id:'b6',title:'Stage Reset',start:'12:25',end:'12:40',type:'transition',subtitle:'15-minute changeover',personId:'p1',notes:''},
 {id:'b7',title:'Nova Dance Co.',start:'12:40',end:'13:15',type:'performance',subtitle:'Dance performance',personId:'p4',notes:''},
 {id:'b8',title:'Closing & Load-Out',start:'16:30',end:'17:00',type:'closing',subtitle:'End of day',personId:'p1',notes:''}
 ]})
}
function showScreen(n){state.screen=n;save();$$('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===n));$$('#mainNav button').forEach(x=>x.classList.toggle('active',x.dataset.mainTab===n));$('#headerTitle').textContent=n==='events'?'Events':n==='builder'?'Event Builder':n[0].toUpperCase()+n.slice(1)}
function showDay(n){state.dayScreen=n;state.screen=n;save();$$('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===n));$$('#dayNav button').forEach(x=>x.classList.toggle('active',x.dataset.dayTab===n));$('#headerTitle').textContent=n[0].toUpperCase()+n.slice(1)}
function dayMode(on){state.dayMode=on;save();$('#mainNav').classList.toggle('hidden',on);$('#dayNav').classList.toggle('hidden',!on);on?showDay(state.dayScreen||'live'):showScreen('builder')}
function render(){
 const e=event();accent(e?.accent||'pink');renderEvents();renderBuilder();renderDay();
 if(state.dayMode)showDay(state.dayScreen||'live');else showScreen(state.screen==='builder'?'builder':'events')
}
function renderEvents(){
 $('#eventList').innerHTML=state.events.length?state.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<article class="event-card"><div class="date-tile"><b>${day(e.date)}</b><span>${mon(e.date)}</span></div><div class="event-copy"><b>${esc(e.name)}</b><small>${esc(e.venue||'Venue not entered')} · ${fmtDate(e.date)}<br>${e.schedule.length} blocks · ${e.people.length} people</small></div><button data-open-event="${e.id}">Open</button></article>`).join(''):'<div class="empty-state">No events yet.<br>Create one or load the demo event.</div>'
}
function renderBuilder(){
 const e=event();$('#builderEmpty').classList.toggle('hidden',!!e);$('#builderContent').classList.toggle('hidden',!e);if(!e)return;
 $('#builderDay').textContent=day(e.date);$('#builderMonth').textContent=mon(e.date);$('#builderName').textContent=e.name;$('#builderMeta').textContent=`${e.venue||'Venue not entered'} · ${fmtDate(e.date)}`;$('#eventCode').textContent=e.code;
 $$('.builder-tabs button').forEach(x=>x.classList.toggle('active',x.dataset.builderTab===state.builderTab));$$('.builder-panel').forEach(x=>x.classList.toggle('active',x.dataset.builderPanel===state.builderTab));
 $('#builderScheduleList').innerHTML=e.schedule.length?e.schedule.slice().sort((a,b)=>a.start.localeCompare(b.start)).map(b=>`<article class="schedule-editor-card"><div class="schedule-time">${fmtTime(b.start)}</div><div class="card-copy"><b>${esc(b.title)}</b><small>${fmtTime(b.start)}–${fmtTime(b.end)} · ${esc(b.subtitle||b.type)}</small></div><button class="card-menu" data-edit-block="${b.id}">Edit</button></article>`).join(''):'<div class="empty-state">No schedule blocks yet.</div>';
 $('#builderPeopleList').innerHTML=e.people.length?e.people.map(p=>`<article class="person-editor-card"><div class="person-head"><div class="avatar">${initials(p.name)}</div><div class="card-copy"><b>${esc(p.name)}</b><small>${esc(p.role||'Role not entered')} · ${p.arrival?fmtTime(p.arrival):'Arrival not entered'}</small></div><button class="card-menu" data-edit-person="${p.id}">Edit</button></div><div class="person-actions"><a class="${p.phone?'':'disabled'}" href="${p.phone?`tel:${p.phone}`:'#'}">Call</a><a class="${p.phone?'':'disabled'}" href="${p.phone?`sms:${p.phone}`:'#'}">Text</a><a class="${p.email?'':'disabled'}" href="${p.email?`mailto:${p.email}`:'#'}">Email</a></div></article>`).join(''):'<div class="empty-state">No people yet.</div>';
 $('#teamList').innerHTML=e.team.length?e.team.map(t=>`<article class="team-card"><div class="card-copy"><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div><button data-remove-team="${t.id}">Remove</button></article>`).join(''):'<div class="empty-state">No team members yet.</div>'
}
function shifted(b,e){return{start:toM(b.start)+(e.delay||0),end:toM(b.end)+(e.delay||0)}}
function nowM(){const d=new Date();return d.getHours()*60+d.getMinutes()}
function currentIndex(e){const s=e.schedule.slice().sort((a,b)=>a.start.localeCompare(b.start)),n=nowM();let i=s.findIndex(b=>{const t=shifted(b,e);return n>=t.start&&n<t.end&&!e.completed.includes(b.id)});if(i<0)i=s.findIndex(b=>!e.completed.includes(b.id));return i<0?Math.max(0,s.length-1):i}
function next(prefix,b,e){if(!b){$(`#${prefix}Title`).textContent='End of day';$(`#${prefix}Meta`).textContent='—';return}const t=shifted(b,e);$(`#${prefix}Title`).textContent=b.title;$(`#${prefix}Meta`).textContent=`${fmtM(t.start)} · ${b.subtitle||b.type}`}
function renderDay(){
 const e=event();if(!e)return;$('#liveVenue').textContent=(e.venue||'VENUE').toUpperCase();$('#liveEventName').textContent=e.name;$('#liveDate').textContent=fmtDate(e.date);
 const s=e.schedule.slice().sort((a,b)=>a.start.localeCompare(b.start)),i=currentIndex(e),b=s[i];
 if(b){const t=shifted(b,e),left=t.end-nowM();$('#liveType').textContent=b.type.toUpperCase();$('#liveTitle').textContent=b.title;$('#liveSubtitle').textContent=[b.subtitle,b.notes].filter(Boolean).join(' · ')||'No additional notes';$('#liveRange').textContent=`${fmtM(t.start)} – ${fmtM(t.end)}`;$('#remaining').textContent=left>0?`${left} min left`:`${Math.abs(left)} min over`;$('#liveDelayBadge').textContent=e.delay?`${e.delay>0?'+':''}${e.delay} MIN`:'';$('#liveProgress').style.width=`${Math.max(0,Math.min(100,((nowM()-t.start)/(t.end-t.start))*100))}%`;$('#readyCurrent').classList.toggle('is-on',e.ready.includes(b.id))}else{$('#liveTitle').textContent='No schedule blocks';$('#liveSubtitle').textContent='Build the run of show first.'}
 next('next',s[i+1],e);next('after',s[i+2],e);$('#peopleMetric').textContent=`${e.people.filter(p=>p.checked).length}/${e.people.length}`;$('#issueMetric').textContent=e.issues.length;$('#completeMetric').textContent=`${e.completed.length}/${e.schedule.length}`;
 $('#dayScheduleList').innerHTML=s.length?s.map((b,x)=>{const t=shifted(b,e),done=e.completed.includes(b.id),ready=e.ready.includes(b.id);return`<article class="day-schedule-card ${x===i?'current':''} ${done?'complete':''}"><div class="day-schedule-top"><div class="schedule-time">${fmtM(t.start)}</div><div class="card-copy"><b>${esc(b.title)}</b><small>${fmtM(t.start)}–${fmtM(t.end)} · ${esc(b.subtitle||b.type)}</small></div><span>${done?'✓':''}</span></div><div class="day-card-actions"><button data-day-ready="${b.id}" class="${ready?'is-on':''}">${ready?'Ready ✓':'Stage Ready'}</button><button data-day-complete="${b.id}">${done?'Undo':'Complete'}</button></div></article>`}).join(''):'<div class="empty-state">No schedule blocks.</div>';
 const c=e.issues.length;$('#issueSummary').textContent=`${c} Open ${c===1?'Issue':'Issues'}`;$('#issueSummaryText').textContent=c?'Production attention needed.':'Production is clear.';$('#issueStatePill').textContent=c?'ACTION':'CLEAR';$('#issueStatePill').className=c?'alert':'clear';
 $('#issueList').innerHTML=c?e.issues.map(x=>`<article class="issue-card"><i></i><div class="card-copy"><b>${esc(x.title)}</b><small>${esc(x.details||'No details')} · ${esc(x.owner||'Unassigned')}</small></div><button data-resolve-issue="${x.id}">Done</button></article>`).join(''):'<div class="empty-state">No open production issues.</div>';
 $('#dayPeopleList').innerHTML=e.people.length?e.people.map(p=>`<article class="person-editor-card"><div class="person-head"><div class="avatar">${initials(p.name)}</div><div class="card-copy"><b>${esc(p.name)}</b><small>${esc(p.role||'Role')} · ${p.arrival?fmtTime(p.arrival):'Arrival not entered'}</small></div><button data-check-person="${p.id}" class="${p.checked?'is-on':''}">${p.checked?'In ✓':'Check In'}</button></div><div class="person-actions"><a class="${p.phone?'':'disabled'}" href="${p.phone?`tel:${p.phone}`:'#'}">Call</a><a class="${p.phone?'':'disabled'}" href="${p.phone?`sms:${p.phone}`:'#'}">Text</a><a class="${p.email?'':'disabled'}" href="${p.email?`mailto:${p.email}`:'#'}">Email</a></div></article>`).join(''):'<div class="empty-state">No people added.</div>';$('#handoffNotes').value=e.handoff||''
}
function openEvent(id=''){const e=id?state.events.find(x=>x.id===id):null,f=$('#eventForm');$('#eventDialogTitle').textContent=e?'Edit Event':'Create Event';for(const k of ['id','name','venue','date','start','end','manager','accent'])f.elements[k].value=e?.[k]||({date:new Date().toISOString().slice(0,10),start:'09:00',end:'18:00',accent:'pink'}[k]||'');$('#eventDialog').showModal()}
function openBlock(id=''){const e=event(),b=id?e.schedule.find(x=>x.id===id):null,f=$('#blockForm');$('#blockPersonSelect').innerHTML='<option value="">None</option>'+e.people.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');for(const k of ['id','title','start','end','type','subtitle','personId','notes'])f.elements[k].value=b?.[k]||({start:e.start,end:e.start,type:'program'}[k]||'');$('#blockDialog').showModal()}
function openPerson(id=''){const e=event(),p=id?e.people.find(x=>x.id===id):null,f=$('#personForm');for(const k of ['id','name','role','arrival','phone','email','notes'])f.elements[k].value=p?.[k]||'';$('#personDialog').showModal()}
function addIssue(title,details='',owner=''){event().issues.unshift({id:uid('issue'),title,details,owner});save();render()}
function download(text,name,type){const b=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();URL.revokeObjectURL(a.href)}
document.addEventListener('click',ev=>{
 const mt=ev.target.closest('[data-main-tab]');if(mt)return showScreen(mt.dataset.mainTab);
 const dt=ev.target.closest('[data-day-tab]');if(dt)return showDay(dt.dataset.dayTab);
 const dn=ev.target.closest('[data-day-nav]');if(dn)return showDay(dn.dataset.dayNav);
 if(ev.target.id==='createEvent'||ev.target.id==='createFirstEvent')openEvent();
 if(ev.target.id==='moreButton')$('#moreDialog').showModal();
 const oe=ev.target.dataset.openEvent;if(oe){state.activeEventId=oe;state.builderTab='schedule';save();showScreen('builder');render()}
 if(ev.target.id==='editEventDetails')openEvent(state.activeEventId);
 const bt=ev.target.closest('[data-builder-tab]');if(bt){state.builderTab=bt.dataset.builderTab;save();renderBuilder()}
 if(ev.target.id==='addScheduleBlock')openBlock();if(ev.target.dataset.editBlock)openBlock(ev.target.dataset.editBlock);
 if(ev.target.id==='addPerson')openPerson();if(ev.target.dataset.editPerson)openPerson(ev.target.dataset.editPerson);
 if(ev.target.id==='addTeamMember')$('#teamDialog').showModal();
 if(ev.target.dataset.removeTeam){event().team=event().team.filter(x=>x.id!==ev.target.dataset.removeTeam);save();render()}
 if(ev.target.id==='regenerateCode'){event().code=makeCode();save();render();toast('New code created')}
 if(ev.target.id==='copyInvite'){navigator.clipboard?.writeText(`Join ${event().name} in DayOf Manager. Event code: ${event().code}`);toast('Invite copied')}
 if(ev.target.id==='launchEvent'){dayMode(true);render()}if(ev.target.id==='exitDayMode'){dayMode(false);render()}
 if(ev.target.id==='loadDemo'){const d=demo();state.events.push(d);state.activeEventId=d.id;state.screen='builder';save();render();toast('Demo event loaded')}
 if(ev.target.id==='duplicateEvent'){const e=clone(event());e.id=uid('evt');e.name+=' Copy';e.code=makeCode();e.completed=[];e.ready=[];e.issues=[];state.events.push(e);state.activeEventId=e.id;save();render();toast('Event duplicated')}
 if(ev.target.id==='deleteEvent'&&confirm('Delete this event?')){state.events=state.events.filter(x=>x.id!==state.activeEventId);state.activeEventId=state.events[0]?.id||null;state.screen='events';save();render()}
 if(ev.target.id==='exportEvent')download(JSON.stringify(event(),null,2),`${event().name.replace(/\W+/g,'-').toLowerCase()}-dayof.json`,'application/json');
 if(ev.target.id==='downloadCsvTemplate')download('title,start,end,type,subtitle,person,notes\nOpening Ceremony,12:00,12:30,program,Main Stage,,Welcome guests\n','dayof-schedule-template.csv','text/csv');
 if(ev.target.id==='resetApp'&&confirm('Reset the entire local app?')){localStorage.removeItem(KEY);state=clone(defaults);render()}
 if(ev.target.id==='completeCurrent'){const e=event(),s=e.schedule.slice().sort((a,b)=>a.start.localeCompare(b.start)),b=s[currentIndex(e)];if(b&&!e.completed.includes(b.id))e.completed.push(b.id);save();render()}
 if(ev.target.id==='readyCurrent'){const e=event(),s=e.schedule.slice().sort((a,b)=>a.start.localeCompare(b.start)),b=s[currentIndex(e)];if(b)e.ready=e.ready.includes(b.id)?e.ready.filter(x=>x!==b.id):[...e.ready,b.id];save();render()}
 if(ev.target.id==='delayCurrent')$('#delayDialog').showModal();if(ev.target.dataset.delay){event().delay+=Number(ev.target.dataset.delay);save();$('#delayDialog').close();render()}
 if(ev.target.id==='logIssueFromLive'||ev.target.id==='addIssue')$('#issueDialog').showModal();
 const qi=ev.target.closest('[data-quick-issue]');if(qi){addIssue(qi.dataset.quickIssue);showDay('issues')}
 if(ev.target.dataset.dayReady){const e=event(),id=ev.target.dataset.dayReady;e.ready=e.ready.includes(id)?e.ready.filter(x=>x!==id):[...e.ready,id];save();render()}
 if(ev.target.dataset.dayComplete){const e=event(),id=ev.target.dataset.dayComplete;e.completed=e.completed.includes(id)?e.completed.filter(x=>x!==id):[...e.completed,id];save();render()}
 if(ev.target.dataset.resolveIssue){event().issues=event().issues.filter(x=>x.id!==ev.target.dataset.resolveIssue);save();render()}
 if(ev.target.dataset.checkPerson){const p=event().people.find(x=>x.id===ev.target.dataset.checkPerson);p.checked=!p.checked;save();render()}
 if(ev.target.id==='saveHandoff'){event().handoff=$('#handoffNotes').value;save();toast('Handoff saved')}if(ev.target.id==='copyHandoff'){navigator.clipboard?.writeText($('#handoffNotes').value);toast('Handoff copied')}
});
$('#eventForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries());if(f.id)Object.assign(state.events.find(x=>x.id===f.id),f);else{const e=newEvent(f);state.events.push(e);state.activeEventId=e.id;state.screen='builder'}save();render()});
$('#blockForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries()),e=event();if(f.id)Object.assign(e.schedule.find(x=>x.id===f.id),f);else e.schedule.push({...f,id:uid('block')});save();render()});
$('#personForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries()),e=event();if(f.id)Object.assign(e.people.find(x=>x.id===f.id),f);else e.people.push({...f,id:uid('person'),checked:false});save();render()});
$('#teamForm').addEventListener('submit',ev=>{event().team.push({...Object.fromEntries(new FormData(ev.target).entries()),id:uid('team')});save();render();ev.target.reset()});
$('#issueForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries());addIssue(f.title,f.details,f.owner);ev.target.reset()});
$('#jsonInput').addEventListener('change',async ev=>{try{const d=JSON.parse(await ev.target.files[0].text());d.id=uid('evt');d.code=makeCode();state.events.push(d);state.activeEventId=d.id;save();render();toast('Backup imported')}catch{alert('Could not import that JSON file.')}ev.target.value=''});
$('#csvInput').addEventListener('change',async ev=>{const file=ev.target.files[0];if(!file)return;const lines=(await file.text()).trim().split(/\r?\n/),h=split(lines.shift()),e=event();for(const line of lines){const v=split(line),r={};h.forEach((x,i)=>r[x.trim()]=v[i]?.trim()||'');if(r.title&&r.start&&r.end)e.schedule.push({id:uid('block'),title:r.title,start:r.start,end:r.end,type:r.type||'program',subtitle:r.subtitle||'',personId:'',notes:r.notes||''})}save();render();toast('CSV imported');ev.target.value=''});
function split(line){const o=[];let c='',q=false;for(let i=0;i<line.length;i++){const x=line[i];if(x==='"')q=!q;else if(x===','&&!q){o.push(c);c=''}else c+=x}o.push(c);return o}
setInterval(()=>{if(state.dayMode)renderDay()},30000);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});render();
})();
