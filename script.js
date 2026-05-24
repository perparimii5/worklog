const MONTHS=['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor'];
const DOW=['E Diel','E Hënë','E Martë','E Mërkurë','E Enjte','E Premte','E Shtunë'];
const DOWS=['Die','Hën','Mar','Mër','Enj','Pre','Sht'];
let now=new Date(), Y=now.getFullYear(), M=now.getMonth(), data={}, selectedDay=null, selectedPhotos=[];
const key=()=>`wr-${Y}-${String(M+1).padStart(2,'0')}`;
const load=()=>{try{data=JSON.parse(localStorage.getItem(key())||'{}')}catch{data={}}};
const save=()=>{localStorage.setItem(key(),JSON.stringify(data));localStorage.setItem('wr-backup-last',JSON.stringify(collectBackup()));localStorage.setItem('wr-backup-at',new Date().toISOString())};
const fmtH=v=>{const n=Number(v||0);return Number.isInteger(n)?n:n.toFixed(1).replace('.',',')};
const daysInMonth=()=>new Date(Y,M+1,0).getDate();
const offset=()=>{const d=new Date(Y,M,1).getDay();return(d+6)%7};
function collectBackup(){const months={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^wr-\d{4}-\d{2}$/.test(k)){try{months[k]=JSON.parse(localStorage.getItem(k)||'{}')}catch{}}}return{version:'private-v8-embedded-pdf',exportedAt:new Date().toISOString(),months,settings:{defaultHours:localStorage.getItem('wr-default-hours')||'8',workerName:localStorage.getItem('wr-worker-name')||'',signature:localStorage.getItem('wr-signature')||'',reminderOn:localStorage.getItem('rem-en')||'false',reminderTime:localStorage.getItem('rem-t')||'17:00'}}}
function applyBackup(b){if(!b||!b.months)throw Error('Backup jo valid');Object.keys(localStorage).filter(k=>/^wr-\d{4}-\d{2}$/.test(k)).forEach(k=>localStorage.removeItem(k));Object.entries(b.months).forEach(([k,v])=>localStorage.setItem(k,JSON.stringify(v||{})));if(b.settings){localStorage.setItem('wr-default-hours',b.settings.defaultHours||'8');localStorage.setItem('wr-worker-name',b.settings.workerName||'');if(b.settings.signature)localStorage.setItem('wr-signature',b.settings.signature);localStorage.setItem('rem-en',b.settings.reminderOn||'false');localStorage.setItem('rem-t',b.settings.reminderTime||'17:00')}load();render();}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2200)}
function typeName(t){return{work:'Punë',pushim:'Pushim',semure:'Sëmurë',leje:'Leje'}[t]||'Punë'}
function render(){document.getElementById('monthName').textContent=MONTHS[M];document.getElementById('monthYear').textContent=Y;renderStats();renderTimeline();renderCalendar();renderSettings();}
function renderStats(){let h=0,w=0,p=0,s=0,l=0,photos=0;Object.values(data).forEach(e=>{if(e.type==='work'){w++;h+=Number(e.hrs||0)}else if(e.type==='pushim')p++;else if(e.type==='semure')s++;else if(e.type==='leje')l++;photos+=(Array.isArray(e.photos)?e.photos.length:(e.photo?1:0))});let entries=Object.keys(data).length;document.getElementById('totalHours').textContent=fmtH(h)+'h';document.getElementById('workDays').textContent=w+' ditë pune';document.getElementById('totalEntries').textContent=entries;document.getElementById('photoCount').textContent=photos+' foto';document.getElementById('todayHint').textContent=new Date().toLocaleDateString('sq-CH');document.getElementById('statEntries').textContent=entries+'/'+daysInMonth();document.getElementById('monthProgress').style.width=Math.min(100,entries/daysInMonth()*100)+'%';document.getElementById('summaryRows').innerHTML=`<div class="row"><span>Punë</span><b>${w}</b></div><div class="row"><span>Pushim</span><b>${p}</b></div><div class="row"><span>Sëmurë</span><b>${s}</b></div><div class="row"><span>Leje</span><b>${l}</b></div><div class="row"><span>Foto</span><b>${photos}</b></div>`}
function renderTimeline(){const box=document.getElementById('timeline');box.innerHTML='';const items=Object.entries(data).map(([d,e])=>({d:Number(d),e})).sort((a,b)=>b.d-a.d);if(!items.length){box.innerHTML='<div class="empty">Ende nuk ka regjistrime për këtë muaj.<br>Prek + për të shtuar ditën e parë.</div>';return}items.forEach(({d,e})=>{const dt=new Date(Y,M,d);const photos=normalizePhotos(e.photos||e.photo||[]);const pc=photos.length;const spc=photos.filter(p=>p.selected!==false).length;const div=document.createElement('article');div.className='entry';div.onclick=()=>openDay(d);div.innerHTML=`<div class="datepill"><div><b>${d}</b><span>${DOWS[dt.getDay()]}</span></div></div><div><h3>${typeName(e.type)} ${e.type==='work'&&e.hrs?'· '+fmtH(e.hrs)+'h':''}</h3><p>${[e.job,e.loc,e.notes].filter(Boolean).join(' · ')||'Pa shënime'}</p><div class="meta">${e.job?`<span class="chip"># ${escapeHtml(e.job)}</span>`:''}${e.loc?`<span class="chip">📍 ${escapeHtml(e.loc)}</span>`:''}${e.gps?`<span class="chip">GPS ✓</span>`:''}${pc?`<span class="chip">📷 ${spc}/${pc}</span>`:''}</div></div>`;box.appendChild(div)})}
function renderCalendar(){const g=document.getElementById('calGrid');g.innerHTML='';for(let i=0;i<offset();i++){const e=document.createElement('div');e.className='day emptyday';g.appendChild(e)}for(let d=1;d<=daysInMonth();d++){const e=data[d];const cell=document.createElement('button');cell.className='day '+(e?'has ':'')+(d===now.getDate()&&M===now.getMonth()&&Y===now.getFullYear()?'today':'');cell.onclick=()=>openDay(d);cell.innerHTML=`<b>${d}</b>${e?`<i class="dot ${e.type}"></i>${e.type==='work'?`<span class="hrs">${fmtH(e.hrs)}h</span>`:''}`:''}`;g.appendChild(cell)}}
function moveMonth(n){M+=n;if(M<0){M=11;Y--}if(M>11){M=0;Y++}load();render()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));document.getElementById(b.dataset.view).classList.add('on')});
function openSettings(){document.querySelector('[data-view="settings"]').click()}
function openDay(d){selectedDay=d;const e=data[d]||{};selectedPhotos=normalizePhotos(e.photos||e.photo||[]);selectedGPS=e.gps||null;document.getElementById('sheetTitle').textContent='Dita '+d;document.getElementById('sheetSub').textContent=DOW[new Date(Y,M,d).getDay()]+' · '+MONTHS[M];document.querySelectorAll('.typebtn').forEach(b=>{b.classList.toggle('on',(e.type||'work')===b.dataset.type)});document.getElementById('hoursInput').value=e.hrs??(localStorage.getItem('wr-default-hours')||8);document.getElementById('jobInput').value=e.job||'';document.getElementById('locInput').value=e.loc||'';document.getElementById('notesInput').value=e.notes||'';renderQuickHours();renderPhotos();renderGPS();updateHoursBox();document.getElementById('sheetWrap').classList.add('on')}
function closeSheet(){document.getElementById('sheetWrap').classList.remove('on');selectedDay=null}
document.querySelectorAll('.typebtn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.typebtn').forEach(x=>x.classList.remove('on'));b.classList.add('on');updateHoursBox()});
function currentType(){return document.querySelector('.typebtn.on')?.dataset.type||'work'}
function updateHoursBox(){document.getElementById('hoursBox').style.display=currentType()==='work'?'block':'none'}
function renderQuickHours(){const q=document.getElementById('quickHours');q.innerHTML='';[4,6,7,7.5,8,8.5,9,10].forEach(v=>{const b=document.createElement('button');b.textContent=fmtH(v)+'h';b.onclick=()=>{document.getElementById('hoursInput').value=v;renderQuickHours()};b.classList.toggle('on',Number(document.getElementById('hoursInput').value)===v);q.appendChild(b)})}
document.getElementById('hoursInput').oninput=renderQuickHours;
document.getElementById('photoInput').onchange=async e=>{const files=[...(e.target.files||[])];if(!files.length)return;toast('Po kompresohen fotot...');for(const f of files){try{const src=await compressImage(f,1400,.78);selectedPhotos.push({src,selected:true,addedAt:new Date().toISOString(),name:f.name||'foto'});}catch{const src=await fileToDataURL(f);selectedPhotos.push({src,selected:true,addedAt:new Date().toISOString(),name:f.name||'foto'});}}renderPhotos();toast(files.length+' foto u shtuan');e.target.value=''};
function renderPhotos(){const g=document.getElementById('photosGrid');g.innerHTML='';selectedPhotos.forEach((p,i)=>{const d=document.createElement('div');d.className='photo '+(p.selected===false?'off':'');d.innerHTML=`<img src="${p.src}"><button type="button" class="sel">${p.selected===false?'○':'✓'}</button><button type="button" class="x">×</button>`;d.querySelector('.sel').onclick=()=>{selectedPhotos[i].selected=selectedPhotos[i].selected===false?true:false;renderPhotos()};d.querySelector('.x').onclick=()=>{selectedPhotos.splice(i,1);renderPhotos()};g.appendChild(d)});if(!selectedPhotos.length)g.innerHTML='<div class="tiny" style="grid-column:1/-1">Asnjë foto. Fotot e selektuara me ✓ futen në PDF Employer.</div>'}
function saveDay(){const t=currentType();data[selectedDay]={type:t,hrs:t==='work'?Math.max(0,Math.min(24,Math.round(Number(document.getElementById('hoursInput').value||0)*2)/2)):0,job:document.getElementById('jobInput').value.trim(),loc:document.getElementById('locInput').value.trim(),notes:document.getElementById('notesInput').value.trim(),gps:selectedGPS,photos:selectedPhotos};save();closeSheet();render();toast('U ruajt')}
function deleteDay(){if(selectedDay&&data[selectedDay]){delete data[selectedDay];save();closeSheet();render();toast('U fshi')}}
function exportJSON(){download('WorkLog-Backup-'+Y+'-'+String(M+1).padStart(2,'0')+'.json',JSON.stringify(collectBackup(),null,2),'application/json')}
document.getElementById('importInput').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{applyBackup(JSON.parse(await f.text()));toast('Backup u importua')}catch{toast('Import i pasuksesshëm')}e.target.value=''};
function exportCSV(){let rows=[['Data','Lloji','Ore','Puna','Lokacioni','GPS','Shenime','Foto totale','Foto ne PDF']];for(let d=1;d<=daysInMonth();d++){const e=data[d];if(!e)continue;rows.push([`${Y}-${String(M+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,typeName(e.type),e.type==='work'?e.hrs:0,e.job||'',e.loc||'',e.gps?(e.gps.lat+','+e.gps.lon):'',e.notes||'',normalizePhotos(e.photos||e.photo||[]).length,normalizePhotos(e.photos||e.photo||[]).filter(p=>p.selected!==false).length])}download('WorkLog-'+Y+'-'+String(M+1).padStart(2,'0')+'.csv',rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n'),'text/csv')}

function normalizePhotos(input){if(!input)return[];const arr=Array.isArray(input)?input:[input];return arr.filter(Boolean).map(x=>typeof x==='string'?{src:x,selected:true,addedAt:'',name:'foto'}:{src:x.src||x.data||'',selected:x.selected!==false,addedAt:x.addedAt||'',name:x.name||'foto'}).filter(x=>x.src)}
function fileToDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
function compressImage(file,max=1400,quality=.78){return new Promise((resolve,reject)=>{const img=new Image();const url=URL.createObjectURL(file);img.onload=()=>{let w=img.width,h=img.height;if(Math.max(w,h)>max){if(w>h){h=Math.round(h*max/w);w=max}else{w=Math.round(w*max/h);h=max}}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);resolve(c.toDataURL('image/jpeg',quality))};img.onerror=reject;img.src=url})}
function renderGPS(){const el=document.getElementById('gpsStatus');if(!el)return;if(!selectedGPS){el.textContent='GPS nuk është marrë ende.';return}const acc=selectedGPS.accuracy?` ±${Math.round(selectedGPS.accuracy)}m`:'';el.innerHTML=`<b>GPS aktiv</b>${acc}<br>${escapeHtml(selectedGPS.address||'Adresë jo e gjetur')}<br>${Number(selectedGPS.lat).toFixed(6)}, ${Number(selectedGPS.lon).toFixed(6)} · ${new Date(selectedGPS.capturedAt).toLocaleString('sq-CH')}`}
async function captureGPS(){if(!navigator.geolocation){toast('GPS nuk mbështetet në këtë pajisje');return}toast('Po merret lokacioni...');navigator.geolocation.getCurrentPosition(async pos=>{selectedGPS={lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:pos.coords.accuracy,capturedAt:new Date().toISOString(),address:''};renderGPS();try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${selectedGPS.lat}&lon=${selectedGPS.lon}`);const j=await r.json();selectedGPS.address=j.display_name||'';if(selectedGPS.address&&!document.getElementById('locInput').value.trim())document.getElementById('locInput').value=selectedGPS.address.split(',').slice(0,3).join(', ')}catch{}renderGPS();toast('GPS u ruajt për këtë ditë')},err=>toast('GPS nuk u lejua ose dështoi'),{enableHighAccuracy:true,timeout:15000,maximumAge:0})}

function exportPDF(){const {jsPDF}=window.jspdf;const doc=new jsPDF();let h=0,w=0,photos=0;Object.values(data).forEach(e=>{if(e.type==='work'){w++;h+=Number(e.hrs||0)}photos+=Array.isArray(e.photos)?e.photos.length:0});doc.setFillColor(7,9,15);doc.rect(0,0,210,38,'F');doc.setTextColor(255,255,255);doc.setFontSize(20);doc.text('WorkLog Private',16,18);doc.setFontSize(11);doc.text(`${MONTHS[M]} ${Y}`,16,28);doc.setTextColor(20,20,20);doc.setFontSize(13);doc.text(`Ore totale: ${fmtH(h)}h   Dite pune: ${w}   Foto: ${photos}`,16,50);let y=64;doc.setFontSize(9);doc.setTextColor(90,90,90);doc.text('Data',16,y);doc.text('Lloji',42,y);doc.text('Ore',72,y);doc.text('Puna / Lokacioni / Shenime',92,y);y+=6;doc.setDrawColor(220);doc.line(16,y,194,y);y+=7;for(let d=1;d<=daysInMonth();d++){const e=data[d];if(!e)continue;if(y>280){doc.addPage();y=20}doc.setTextColor(30,30,30);doc.text(`${String(d).padStart(2,'0')}.${String(M+1).padStart(2,'0')}.${Y}`,16,y);doc.text(typeName(e.type),42,y);doc.text(e.type==='work'?fmtH(e.hrs)+'h':'-',72,y);doc.text(((e.job?e.job+' / ':'')+(e.loc?e.loc+' / ':'')+(e.notes||'')).substring(0,70),92,y);y+=8}doc.save('WorkLog-'+Y+'-'+String(M+1).padStart(2,'0')+'.pdf')}

async function exportEmployerPDF(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF('p','mm','a4');
  const worker=localStorage.getItem('wr-worker-name')||'WorkLog Private';
  const selectedItems=[];
  let total=0,days=0,allPhotos=0;
  Object.entries(data).forEach(([day,e])=>{
    if(e.type==='work'){days++;total+=Number(e.hrs||0)}
    const ph=normalizePhotos(e.photos||e.photo||[]);
    allPhotos+=ph.length;
    ph.filter(p=>p.selected!==false).forEach((p,i)=>selectedItems.push({day:Number(day),entry:e,photo:p,index:i+1}));
  });
  function safeText(v){return String(v||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"')}
  function addHeader(title,sub){
    doc.setFillColor(8,11,18);doc.rect(0,0,210,36,'F');
    doc.setTextColor(255,255,255);doc.setFontSize(17);doc.text(title,14,16);
    doc.setFontSize(9);doc.setTextColor(210,216,230);doc.text(sub,14,26);
  }
  function imgFormat(src){return String(src||'').startsWith('data:image/png')?'PNG':'JPEG'}
  function addImageSafe(src,x,y,w,h){
    try{doc.addImage(src,imgFormat(src),x,y,w,h,undefined,'FAST');return true}
    catch(e){try{doc.addImage(src,'JPEG',x,y,w,h,undefined,'FAST');return true}catch(e2){try{doc.addImage(src,'PNG',x,y,w,h,undefined,'FAST');return true}catch(e3){return false}}}
  }
  addHeader('Employer Work Report',`${worker} · ${MONTHS[M]} ${Y}`);
  doc.setTextColor(25,30,40);doc.setFontSize(12);
  doc.text(`Total: ${fmtH(total)}h`,14,50);
  doc.text(`Dite pune: ${days}`,65,50);
  doc.text(`Foto te zgjedhura: ${selectedItems.length}/${allPhotos}`,116,50);
  doc.setTextColor(90);doc.setFontSize(8);
  doc.text('Fotot ne kete PDF jane te futura brenda dokumentit, jo link lokal nga telefoni.',14,58);
  let y=72;
  doc.setFontSize(9);doc.setTextColor(110);doc.text('Data',14,y);doc.text('Lloji',40,y);doc.text('Ore',66,y);doc.text('Puna / Lokacioni / Shenime / GPS',86,y);
  y+=5;doc.setDrawColor(220);doc.line(14,y,196,y);y+=8;
  for(let d=1;d<=daysInMonth();d++){
    const e=data[d];if(!e)continue;
    if(y>272){doc.addPage();addHeader('Employer Work Report',`${worker} · ${MONTHS[M]} ${Y}`);y=48}
    const ph=normalizePhotos(e.photos||e.photo||[]).filter(p=>p.selected!==false);
    doc.setTextColor(25,30,40);doc.setFontSize(9);
    doc.text(`${String(d).padStart(2,'0')}.${String(M+1).padStart(2,'0')}.${Y}`,14,y);
    doc.text(typeName(e.type),40,y);
    doc.text(e.type==='work'?fmtH(e.hrs)+'h':'-',66,y);
    let detail=[e.job,e.loc,e.notes].filter(Boolean).join(' · ')||'Pa shenime';
    if(e.gps){detail+=` · GPS: ${e.gps.address||''} (${Number(e.gps.lat).toFixed(5)}, ${Number(e.gps.lon).toFixed(5)}, ±${Math.round(e.gps.accuracy||0)}m)`}
    if(ph.length)detail+=` · Foto ne raport: ${ph.length}`;
    doc.text(doc.splitTextToSize(safeText(detail),108),86,y);
    y+=Math.max(8,doc.splitTextToSize(safeText(detail),108).length*4+3);
  }
  doc.addPage();addHeader('Shtojca e fotove',`${MONTHS[M]} ${Y} · ${selectedItems.length} foto te zgjedhura`);
  y=48;
  if(!selectedItems.length){doc.setTextColor(90);doc.setFontSize(11);doc.text('Nuk ka foto te zgjedhura per raport.',14,y)}
  selectedItems.forEach((item,idx)=>{
    const e=item.entry;
    if(y>228){doc.addPage();addHeader('Shtojca e fotove',`${MONTHS[M]} ${Y} · vazhdim`);y=48}
    const title=`Foto ${idx+1} · ${String(item.day).padStart(2,'0')}.${String(M+1).padStart(2,'0')}.${Y} · ${typeName(e.type)}${e.type==='work'?' · '+fmtH(e.hrs)+'h':''}`;
    doc.setTextColor(20,24,32);doc.setFontSize(11);doc.text(safeText(title),14,y);
    y+=6;
    const meta=[];
    if(item.photo.addedAt)meta.push('Shtuar: '+new Date(item.photo.addedAt).toLocaleString('sq-CH'));
    if(e.gps)meta.push(`GPS: ${e.gps.address||''} (${Number(e.gps.lat).toFixed(5)}, ${Number(e.gps.lon).toFixed(5)}, ±${Math.round(e.gps.accuracy||0)}m)`);
    if(e.job||e.loc||e.notes)meta.push([e.job,e.loc,e.notes].filter(Boolean).join(' · '));
    doc.setTextColor(86,94,108);doc.setFontSize(8);
    const metaLines=doc.splitTextToSize(safeText(meta.join(' | ')),182);
    doc.text(metaLines,14,y);y+=Math.max(6,metaLines.length*4+2);
    const ok=addImageSafe(item.photo.src,14,y,182,102);
    if(!ok){doc.setTextColor(180,40,40);doc.text('Foto nuk mundi te futej ne PDF. Provo ta shtosh perseri si JPG/PNG.',14,y+10)}
    y+=112;
  });
  if(y>232){doc.addPage();addHeader('Nenshkrimi',`${worker} · ${MONTHS[M]} ${Y}`);y=50}else{y+=4}
  doc.setDrawColor(210);doc.line(14,y,196,y);
  doc.setTextColor(70);doc.setFontSize(10);doc.text('Nenshkrimi',14,y+14);
  const sig=localStorage.getItem('wr-signature');
  if(sig){addImageSafe(sig,14,y+18,60,24)}
  doc.text(`Gjeneruar: ${new Date().toLocaleString('sq-CH')}`,112,y+14);
  doc.setFontSize(8);doc.setTextColor(120);doc.text('Kontrollo PDF-in para dergimit: fotot duhet te duken ne faqet e shtojces.',112,y+22);
  doc.save(`Employer-Report-${Y}-${String(M+1).padStart(2,'0')}-embedded.pdf`);
}

function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function renderSettings(){document.getElementById('defaultHours').value=localStorage.getItem('wr-default-hours')||'8';const wn=document.getElementById('workerName');if(wn)wn.value=localStorage.getItem('wr-worker-name')||'';loadSignatureCanvas();document.getElementById('reminderOn').checked=localStorage.getItem('rem-en')==='true';document.getElementById('reminderTime').value=localStorage.getItem('rem-t')||'17:00'}
document.getElementById('defaultHours').onchange=e=>{localStorage.setItem('wr-default-hours',e.target.value||'8');toast('U ruajt')};document.getElementById('workerName').onchange=e=>{localStorage.setItem('wr-worker-name',e.target.value.trim());toast('U ruajt')};document.getElementById('reminderOn').onchange=e=>{localStorage.setItem('rem-en',e.target.checked);scheduleReminder();toast('Reminder u ruajt')};document.getElementById('reminderTime').onchange=e=>{localStorage.setItem('rem-t',e.target.value||'17:00');scheduleReminder();toast('Reminder u ruajt')};
function scheduleReminder(){if(!('serviceWorker'in navigator)||!('Notification'in window))return;if(Notification.permission==='default')Notification.requestPermission();navigator.serviceWorker.ready.then(reg=>{if(Notification.permission!=='granted'||localStorage.getItem('rem-en')!=='true')return;const [hh,mm]=(localStorage.getItem('rem-t')||'17:00').split(':').map(Number);const target=new Date();target.setHours(hh,mm,0,0);const delay=target-new Date();if(delay>0)reg.active?.postMessage({type:'SCHEDULE_REMINDER',delay})})}

let sigReady=false;
function loadSignatureCanvas(){const c=document.getElementById('signaturePad');if(!c||sigReady)return;sigReady=true;const resize=()=>{const old=localStorage.getItem('wr-signature');c.width=c.clientWidth*2;c.height=c.clientHeight*2;const ctx=c.getContext('2d');ctx.scale(2,2);ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#f7f8fb';if(old){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,c.clientWidth,c.clientHeight);img.src=old}};resize();let drawing=false,last=null;const pos=e=>{const r=c.getBoundingClientRect();const t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top}};const start=e=>{drawing=true;last=pos(e);e.preventDefault()};const move=e=>{if(!drawing)return;const p=pos(e),ctx=c.getContext('2d');ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;e.preventDefault()};const end=()=>drawing=false;c.addEventListener('mousedown',start);c.addEventListener('mousemove',move);window.addEventListener('mouseup',end);c.addEventListener('touchstart',start,{passive:false});c.addEventListener('touchmove',move,{passive:false});c.addEventListener('touchend',end)}
function saveSignature(){const c=document.getElementById('signaturePad');if(c){localStorage.setItem('wr-signature',c.toDataURL('image/png'));toast('Firma u ruajt')}}
function clearSignature(){const c=document.getElementById('signaturePad');if(c){c.getContext('2d').clearRect(0,0,c.width,c.height);localStorage.removeItem('wr-signature');toast('Firma u pastrua')}}

if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js').then(scheduleReminder).catch(()=>{})}
load();render();
