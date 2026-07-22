
(() => {
'use strict';
const KEY='dayof-manager-v03',OLD_KEY='dayof-manager-v02',$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const uid=(p='id')=>`${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,clone=x=>JSON.parse(JSON.stringify(x));
const defaults={events:[],activeEventId:null,screen:'events',liveMode:false,timelineFilter:'all'};
let state=load();

function load(){
  try{
    const current=localStorage.getItem(KEY), old=localStorage.getItem(OLD_KEY);
    return {...defaults,...JSON.parse(current||old||'{}')};
  }catch{return clone(defaults)}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function e(){return state.events.find(x=>x.id===state.activeEventId)||null}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function code(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function fmtDate(d){return d?new Date(`${d}T12:00:00`).toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'}):'No date'}
function day(d){return d?new Date(`${d}T12:00:00`).getDate():'--'}
function mon(d){return d?new Date(`${d}T12:00:00`).toLocaleDateString([],{month:'short'}).toUpperCase():'---'}
function fmtTime(t){if(!t)return'—';let[h,m]=t.split(':').map(Number),a=h>=12?'PM':'AM';h=h%12||12;return`${h}:${String(m).padStart(2,'0')} ${a}`}
function toM(t){if(!t)return 0;const[h,m]=t.split(':').map(Number);return h*60+m}
function fmtM(n){n=(n+1440)%1440;let h=Math.floor(n/60),m=n%60,a=h>=12?'PM':'AM';h=h%12||12;return`${h}:${String(m).padStart(2,'0')} ${a}`}
function nowM(){const d=new Date();return d.getHours()*60+d.getMinutes()}
function initials(n='?'){return n.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()}
function toast(t){document.querySelector('.toast')?.remove();const x=document.createElement('div');x.className='toast';x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),2200)}
function accent(name){const m={pink:['#ff3e98','#914cff'],blue:['#4aa8ff','#6754ff'],green:['#42dc9a','#2fb7c8'],orange:['#ff8a3d','#ff3f76'],purple:['#a35cff','#ef4da8']},c=m[name]||m.pink;document.documentElement.style.setProperty('--accent',c[0]);document.documentElement.style.setProperty('--accent2',c[1])}
function newEvent(d={}){return{id:uid('evt'),name:d.name||'Untitled Event',venue:d.venue||'',date:d.date||new Date().toISOString().slice(0,10),start:d.start||'09:00',end:d.end||'18:00',manager:d.manager||'',accent:d.accent||'pink',code:code(),schedule:d.schedule||[],people:d.people||[],team:d.team||[],issues:d.issues||[],resolvedIssues:d.resolvedIssues||[],completed:d.completed||[],ready:d.ready||[],delay:d.delay||0,handoff:d.handoff||''}}
function demo(){
 const people=[{id:'p1',name:'Jordan Lee',role:'Stage Manager',arrival:'08:00',phone:'',email:'',notes:'Main stage lead',checked:true,ready:true},{id:'p2',name:'The Sunset Duo',role:'Performer',arrival:'11:15',phone:'',email:'',notes:'Acoustic set',checked:false,ready:false},{id:'p3',name:'Maya Cruz',role:'Host',arrival:'10:30',phone:'',email:'',notes:'Opening and transitions',checked:true,ready:true},{id:'p4',name:'Nova Dance Co.',role:'Performer',arrival:'12:30',phone:'',email:'',notes:'8 dancers',checked:false,ready:false}];
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
function sorted(ev){return ev.schedule.slice().sort((a,b)=>a.start.localeCompare(b.start))}
function shifted(b,ev){return{start:toM(b.start)+(ev.delay||0),end:toM(b.end)+(ev.delay||0)}}
function currentIndex(ev){const s=sorted(ev),n=nowM();let i=s.findIndex(b=>{const t=shifted(b,ev);return n>=t.start&&n<t.end&&!ev.completed.includes(b.id)});if(i<0)i=s.findIndex(b=>!ev.completed.includes(b.id));return i<0?Math.max(0,s.length-1):i}
function show(name){
 state.screen=name;save();$$('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===name));$$('#eventNav button').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));
 $('#eventNav').classList.toggle('hidden',name==='events'||!e());$('#backToEvents').classList.toggle('hidden',name==='events');$('#liveModeButton').classList.toggle('hidden',name==='events'||!e());$('#fab').classList.toggle('hidden',name==='events'||name==='event'||state.liveMode);
 $('#headerTitle').textContent=name==='events'?'Events':name[0].toUpperCase()+name.slice(1)
}
function setLiveMode(on){
 state.liveMode=on;save();$('#appShell').classList.toggle('live-mode',on);$('#liveModeButton').textContent=on?'Exit Live':'Go Live';$('#eventLiveMode').querySelector('b').textContent=on?'Exit Live Mode':'Live Mode';$('#eventStatusPill').textContent=on?'LIVE':'PLANNING';$('#eventStatusPill').classList.toggle('live',on);$('#liveIsland').classList.toggle('hidden',!on);
 if(on)show('live');render()
}
function render(){
 const ev=e();accent(ev?.accent||'pink');renderEvents();if(ev){renderLive(ev);renderTimeline(ev);renderPeople(ev);renderIssues(ev);renderEvent(ev)}$('#appShell').classList.toggle('live-mode',state.liveMode);show(ev&&state.screen!=='events'?state.screen:'events')
}
function renderEvents(){
 $('#eventList').innerHTML=state.events.length?state.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`<article class="event-card"><div class="date-tile"><b>${day(x.date)}</b><span>${mon(x.date)}</span></div><div class="event-copy"><b>${esc(x.name)}</b><small>${esc(x.venue||'Venue not entered')} · ${fmtDate(x.date)}<br>${x.schedule.length} blocks · ${x.people.length} people</small></div><button data-open-event="${x.id}">Open</button></article>`).join(''):'<div class="empty-state">No events yet.<br>Create one or load the demo event.</div>'
}
function fillNext(b,ev){if(!b){$('#nextTitle').textContent='End of day';$('#nextMeta').textContent='—';return}const t=shifted(b,ev);$('#nextTitle').textContent=b.title;$('#nextMeta').textContent=`${fmtM(t.start)} · ${b.subtitle||b.type}`}
function renderLive(ev){
 $('#liveVenue').textContent=(ev.venue||'VENUE').toUpperCase();$('#liveEventName').textContent=ev.name;$('#liveDate').textContent=fmtDate(ev.date);$('#eventStatusPill').textContent=state.liveMode?'LIVE':'PLANNING';$('#eventStatusPill').classList.toggle('live',state.liveMode);
 const s=sorted(ev),i=currentIndex(ev),b=s[i];
 if(b){const t=shifted(b,ev),left=t.end-nowM(),mins=Math.max(0,left);$('#nowType').textContent=b.type.toUpperCase();$('#nowTitle').textContent=b.title;$('#nowSubtitle').textContent=[b.subtitle,b.notes].filter(Boolean).join(' · ')||'No additional notes';$('#minutesRemaining').textContent=mins;$('#nowRange').textContent=`${fmtM(t.start)} – ${fmtM(t.end)}`;$('#delayBadge').textContent=ev.delay?`${ev.delay>0?'+':''}${ev.delay} MIN`:'';$('#nowProgress').style.width=`${Math.max(0,Math.min(100,((nowM()-t.start)/(t.end-t.start))*100))}%`;$('#readyCurrent').classList.toggle('is-on',ev.ready.includes(b.id));$('#islandTitle').textContent=b.title;$('#islandTime').textContent=`${mins} min`}else{$('#nowTitle').textContent='No schedule blocks';$('#nowSubtitle').textContent='Build the timeline first.';$('#minutesRemaining').textContent='—'}
 fillNext(s[i+1],ev);const pct=ev.schedule.length?Math.round(ev.completed.length/ev.schedule.length*100):0;$('#progressPercent').textContent=`${pct}%`;$('#peopleMetric').textContent=`${ev.people.filter(p=>p.checked).length}/${ev.people.length}`;$('#issueMetric').textContent=ev.issues.length
}
function renderTimeline(ev){
 const s=sorted(ev),ci=currentIndex(ev),f=state.timelineFilter||'all';$$('.timeline-filter button').forEach(x=>x.classList.toggle('active',x.dataset.filter===f));
 const list=s.filter(b=>f==='all'||(f==='complete'?ev.completed.includes(b.id):!ev.completed.includes(b.id)));
 $('#timelineList').innerHTML=list.length?list.map(b=>{const i=s.findIndex(x=>x.id===b.id),t=shifted(b,ev),done=ev.completed.includes(b.id),ready=ev.ready.includes(b.id);return`<article class="timeline-item ${i===ci?'current':''} ${done?'complete':''}"><span class="timeline-dot"></span><div class="timeline-card"><div class="timeline-top"><div class="timeline-time">${fmtM(t.start)}</div><div><h3>${esc(b.title)}</h3><p>${fmtM(t.start)}–${fmtM(t.end)} · ${esc(b.subtitle||b.type)}</p></div><button class="small-button" data-edit-block="${b.id}">Edit</button></div><div class="timeline-actions"><button data-complete="${b.id}">${done?'Undo':'Complete'}</button><button data-ready="${b.id}" class="${ready?'is-on':''}">${ready?'Ready ✓':'Ready'}</button><button data-delay-one="${b.id}">Delay +5</button></div></div></article>`}).join(''):'<div class="empty-state">No timeline blocks in this view.</div>'
}
function personCard(p){return`<article class="person-card"><div class="person-head"><div class="avatar">${initials(p.name)}</div><div class="card-copy"><b>${esc(p.name)}</b><small>${esc(p.role||'Role')} · ${p.arrival?fmtTime(p.arrival):'Arrival not entered'}</small></div><button class="small-button" data-edit-person="${p.id}">Edit</button></div><div class="person-actions"><button data-check-person="${p.id}" class="${p.checked?'is-on':''}">${p.checked?'In ✓':'Check In'}</button><button data-ready-person="${p.id}" class="${p.ready?'is-on':''}">${p.ready?'Ready ✓':'Ready'}</button><a class="${p.phone?'':'disabled'}" href="${p.phone?`tel:${p.phone}`:'#'}">Call</a><a class="${p.email?'':'disabled'}" href="${p.email?`mailto:${p.email}`:'#'}">Email</a></div></article>`}
function renderPeople(ev){
 const q=($('#peopleSearch')?.value||'').toLowerCase(),people=ev.people.filter(p=>`${p.name} ${p.role}`.toLowerCase().includes(q)),checked=people.filter(p=>p.checked),waiting=people.filter(p=>!p.checked);
 $('#checkedCount').textContent=checked.length;$('#waitingCount').textContent=waiting.length;$('#checkedPeople').innerHTML=checked.length?checked.map(personCard).join(''):'<div class="empty-state">Nobody checked in yet.</div>';$('#waitingPeople').innerHTML=waiting.length?waiting.map(personCard).join(''):'<div class="empty-state">Everyone is checked in.</div>';$('#handoffNotes').value=ev.handoff||''
}
function issueCard(x,resolved=false){return`<article class="issue-card ${x.priority==='Critical'?'critical':''} ${resolved?'resolved':''}"><i></i><div class="card-copy"><b>${esc(x.title)}</b><small>${esc(x.priority||'Normal')} · ${esc(x.owner||'Unassigned')}<br>${esc(x.details||'No details')}</small></div><button data-${resolved?'reopen':'resolve'}-issue="${x.id}">${resolved?'Reopen':'Done'}</button></article>`}
function renderIssues(ev){
 ev.resolvedIssues=ev.resolvedIssues||[];const critical=ev.issues.filter(x=>x.priority==='Critical'),open=ev.issues.filter(x=>x.priority!=='Critical');$('#openIssueCount').textContent=ev.issues.length;$('#criticalIssueCount').textContent=critical.length;$('#resolvedIssueCount').textContent=ev.resolvedIssues.length;$('#criticalIssues').innerHTML=critical.length?critical.map(x=>issueCard(x)).join(''):'<div class="empty-state">No critical issues.</div>';$('#openIssues').innerHTML=open.length?open.map(x=>issueCard(x)).join(''):'<div class="empty-state">No waiting issues.</div>';$('#resolvedIssues').innerHTML=ev.resolvedIssues.length?ev.resolvedIssues.map(x=>issueCard(x,true)).join(''):'<div class="empty-state">No resolved issues yet.</div>'
}
function renderEvent(ev){
 $('#eventDay').textContent=day(ev.date);$('#eventMonth').textContent=mon(ev.date);$('#eventName').textContent=ev.name;$('#eventMeta').textContent=`${ev.venue||'Venue not entered'} · ${fmtDate(ev.date)}`;$('#eventCode').textContent=ev.code;$('#eventLiveMode').querySelector('b').textContent=state.liveMode?'Exit Live Mode':'Live Mode';$('#teamList').innerHTML=ev.team.length?ev.team.map(t=>`<article class="team-card"><div class="card-copy"><b>${esc(t.name)}</b><small>${esc(t.role)}</small></div><button data-remove-team="${t.id}">Remove</button></article>`).join(''):'<div class="empty-state">No team members yet.</div>'
}
function openEvent(id=''){const x=id?state.events.find(y=>y.id===id):null,f=$('#eventForm');$('#eventDialogTitle').textContent=x?'Edit Event':'Create Event';for(const k of ['id','name','venue','date','start','end','manager','accent'])f.elements[k].value=x?.[k]||({date:new Date().toISOString().slice(0,10),start:'09:00',end:'18:00',accent:'pink'}[k]||'');$('#eventDialog').showModal()}
function openBlock(id=''){const ev=e(),b=id?ev.schedule.find(x=>x.id===id):null,f=$('#blockForm');$('#blockDialogTitle').textContent=b?'Edit Timeline Block':'Add Timeline Block';$('#blockPersonSelect').innerHTML='<option value="">None</option>'+ev.people.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');for(const k of ['id','title','start','end','type','subtitle','personId','notes'])f.elements[k].value=b?.[k]||({start:ev.start,end:ev.start,type:'program'}[k]||'');$('#deleteBlock').classList.toggle('hidden',!b);$('#blockDialog').showModal()}
function openPerson(id=''){const ev=e(),p=id?ev.people.find(x=>x.id===id):null,f=$('#personForm');$('#personDialogTitle').textContent=p?'Edit Person':'Add Person';for(const k of ['id','name','role','arrival','phone','email','notes'])f.elements[k].value=p?.[k]||'';$('#deletePerson').classList.toggle('hidden',!p);$('#personDialog').showModal()}
function addIssue(title,details='',owner='',priority='Normal'){e().issues.unshift({id:uid('issue'),title,details,owner,priority});save();render()}
function download(text,name,type){const b=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();URL.revokeObjectURL(a.href)}

document.addEventListener('click',ev=>{
 const tab=ev.target.closest('[data-tab]');if(tab)return show(tab.dataset.tab);
 const filter=ev.target.closest('[data-filter]');if(filter){state.timelineFilter=filter.dataset.filter;save();renderTimeline(e());return}
 if(ev.target.id==='createEvent'||ev.target.id==='createFirstEvent')openEvent();
 if(ev.target.id==='moreButton')$('#moreDialog').showModal();
 if(ev.target.id==='backToEvents'||ev.target.id==='openEvents'){state.screen='events';state.liveMode=false;save();render()}
 const open=ev.target.dataset.openEvent;if(open){state.activeEventId=open;state.screen='live';save();render()}
 if(ev.target.id==='loadDemo'){const d=demo();state.events.push(d);state.activeEventId=d.id;state.screen='live';save();render();toast('Demo event loaded')}
 if(ev.target.id==='liveModeButton'||ev.target.id==='eventLiveMode')setLiveMode(!state.liveMode);
 if(ev.target.id==='fab'){ $('#fabMenu').classList.toggle('hidden'); }
 const fab=ev.target.closest('[data-fab]');if(fab){$('#fabMenu').classList.add('hidden'); if(fab.dataset.fab==='issue')$('#issueDialog').showModal();if(fab.dataset.fab==='delay')$('#delayDialog').showModal();if(fab.dataset.fab==='person')openPerson();if(fab.dataset.fab==='block')openBlock()}
 if(ev.target.id==='addScheduleBlock')openBlock();if(ev.target.dataset.editBlock)openBlock(ev.target.dataset.editBlock);
 if(ev.target.id==='addPerson')openPerson();if(ev.target.dataset.editPerson)openPerson(ev.target.dataset.editPerson);
 if(ev.target.id==='addIssue'||ev.target.id==='issueCurrent')$('#issueDialog').showModal();
 if(ev.target.id==='delayCurrent')$('#delayDialog').showModal();
 if(ev.target.id==='editEventDetails')openEvent(state.activeEventId);
 if(ev.target.id==='addTeamMember')$('#teamDialog').showModal();
 if(ev.target.id==='completeCurrent'){const evn=e(),s=sorted(evn),b=s[currentIndex(evn)];if(b&&!evn.completed.includes(b.id))evn.completed.push(b.id);save();render()}
 if(ev.target.id==='readyCurrent'){const evn=e(),s=sorted(evn),b=s[currentIndex(evn)];if(b)evn.ready=evn.ready.includes(b.id)?evn.ready.filter(x=>x!==b.id):[...evn.ready,b.id];save();render()}
 if(ev.target.dataset.delay){e().delay+=Number(ev.target.dataset.delay);save();$('#delayDialog').close();render()}
 if(ev.target.dataset.complete){const evn=e(),id=ev.target.dataset.complete;evn.completed=evn.completed.includes(id)?evn.completed.filter(x=>x!==id):[...evn.completed,id];save();render()}
 if(ev.target.dataset.ready){const evn=e(),id=ev.target.dataset.ready;evn.ready=evn.ready.includes(id)?evn.ready.filter(x=>x!==id):[...evn.ready,id];save();render()}
 if(ev.target.dataset.delayOne){e().delay+=5;save();render();toast('Timeline delayed 5 minutes')}
 if(ev.target.dataset.checkPerson){const p=e().people.find(x=>x.id===ev.target.dataset.checkPerson);p.checked=!p.checked;save();render()}
 if(ev.target.dataset.readyPerson){const p=e().people.find(x=>x.id===ev.target.dataset.readyPerson);p.ready=!p.ready;save();render()}
 if(ev.target.dataset.resolveIssue){const evn=e(),i=evn.issues.findIndex(x=>x.id===ev.target.dataset.resolveIssue);if(i>=0){evn.resolvedIssues=evn.resolvedIssues||[];evn.resolvedIssues.unshift(evn.issues.splice(i,1)[0]);save();render()}}
 if(ev.target.dataset.reopenIssue){const evn=e(),i=evn.resolvedIssues.findIndex(x=>x.id===ev.target.dataset.reopenIssue);if(i>=0){evn.issues.unshift(evn.resolvedIssues.splice(i,1)[0]);save();render()}}
 if(ev.target.id==='saveHandoff'){e().handoff=$('#handoffNotes').value;save();toast('Handoff saved')}
 if(ev.target.id==='copyHandoff'){navigator.clipboard?.writeText($('#handoffNotes').value);toast('Handoff copied')}
 if(ev.target.id==='copyInvite'){navigator.clipboard?.writeText(`Join ${e().name} in DayOf Manager. Event code: ${e().code}`);toast('Invite copied')}
 if(ev.target.id==='regenerateCode'){e().code=code();save();render();toast('New code created')}
 if(ev.target.dataset.removeTeam){e().team=e().team.filter(x=>x.id!==ev.target.dataset.removeTeam);save();render()}
 if(ev.target.id==='duplicateEvent'){const x=clone(e());x.id=uid('evt');x.name+=' Copy';x.code=code();x.completed=[];x.ready=[];x.issues=[];x.resolvedIssues=[];state.events.push(x);state.activeEventId=x.id;save();render();toast('Event duplicated')}
 if(ev.target.id==='exportEvent')download(JSON.stringify(e(),null,2),`${e().name.replace(/\W+/g,'-').toLowerCase()}-dayof.json`,'application/json');
 if(ev.target.id==='downloadCsvTemplate')download('title,start,end,type,subtitle,person,notes\nOpening Ceremony,12:00,12:30,program,Main Stage,,Welcome guests\n','dayof-schedule-template.csv','text/csv');
 if(ev.target.id==='deleteEvent'&&confirm('Delete this event?')){state.events=state.events.filter(x=>x.id!==state.activeEventId);state.activeEventId=null;state.screen='events';state.liveMode=false;save();render()}
 if(ev.target.id==='resetApp'&&confirm('Reset the entire local app?')){localStorage.removeItem(KEY);state=clone(defaults);render()}
 if(ev.target.id==='deleteBlock'){const id=$('#blockForm').elements.id.value;if(id&&confirm('Delete this block?')){e().schedule=e().schedule.filter(x=>x.id!==id);save();$('#blockDialog').close();render()}}
 if(ev.target.id==='deletePerson'){const id=$('#personForm').elements.id.value;if(id&&confirm('Delete this person?')){e().people=e().people.filter(x=>x.id!==id);save();$('#personDialog').close();render()}}
});
$('#peopleSearch').addEventListener('input',()=>renderPeople(e()));
$('#eventForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries());if(f.id)Object.assign(state.events.find(x=>x.id===f.id),f);else{const x=newEvent(f);state.events.push(x);state.activeEventId=x.id;state.screen='live'}save();render()});
$('#blockForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries()),x=e();if(f.id)Object.assign(x.schedule.find(y=>y.id===f.id),f);else x.schedule.push({...f,id:uid('block')});save();render()});
$('#personForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries()),x=e();if(f.id)Object.assign(x.people.find(y=>y.id===f.id),f);else x.people.push({...f,id:uid('person'),checked:false,ready:false});save();render()});
$('#issueForm').addEventListener('submit',ev=>{const f=Object.fromEntries(new FormData(ev.target).entries());addIssue(f.title,f.details,f.owner,f.priority);ev.target.reset()});
$('#teamForm').addEventListener('submit',ev=>{e().team.push({...Object.fromEntries(new FormData(ev.target).entries()),id:uid('team')});save();render();ev.target.reset()});
$('#jsonInput').addEventListener('change',async ev=>{try{const d=JSON.parse(await ev.target.files[0].text());d.id=uid('evt');d.code=code();state.events.push(d);state.activeEventId=d.id;state.screen='live';save();render();toast('Backup imported')}catch{alert('Could not import that JSON file.')}ev.target.value=''});
$('#csvInput').addEventListener('change',async ev=>{const file=ev.target.files[0];if(!file)return;const lines=(await file.text()).trim().split(/\r?\n/),h=split(lines.shift()),x=e();for(const line of lines){const v=split(line),r={};h.forEach((k,i)=>r[k.trim()]=v[i]?.trim()||'');if(r.title&&r.start&&r.end)x.schedule.push({id:uid('block'),title:r.title,start:r.start,end:r.end,type:r.type||'program',subtitle:r.subtitle||'',personId:'',notes:r.notes||''})}save();render();toast('CSV imported');ev.target.value=''});
function split(line){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"')q=!q;else if(c===','&&!q){out.push(cur);cur=''}else cur+=c}out.push(cur);return out}
setInterval(()=>{if(e())renderLive(e())},30000);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});render();
})();
