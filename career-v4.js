(() => {
  'use strict';

  let A = null;
  const VERSION = '4.0.0';
  const FORMATIONS = {
    '4-2-3-1':[[50,91],[18,76],[39,80],[61,80],[82,76],[38,62],[62,62],[20,43],[50,45],[80,43],[50,23]],
    '4-3-3':[[50,91],[18,76],[39,80],[61,80],[82,76],[25,58],[50,62],[75,58],[18,31],[50,24],[82,31]],
    '3-4-3':[[50,91],[27,77],[50,79],[73,77],[13,56],[38,60],[62,60],[87,56],[20,31],[50,24],[80,31]],
    '4-4-2':[[50,91],[18,76],[39,80],[61,80],[82,76],[18,52],[40,58],[60,58],[82,52],[38,27],[62,27]],
    '3-5-2':[[50,91],[25,78],[50,81],[75,78],[12,55],[35,61],[50,52],[65,61],[88,55],[38,25],[62,25]],
    '4-1-2-1-2':[[50,91],[18,76],[39,80],[61,80],[82,76],[50,65],[31,52],[69,52],[50,39],[38,24],[62,24]]
  };

  const youthFirst = ['Rizky','Fajar','Dimas','Raka','Adit','Bagas','Ilham','Rafi','Ardi','Naufal','Bayu','Gilang','Kevin','Reza','Daffa','Rendy','Farhan','Agung','Fikri','Akbar'];
  const youthLast = ['Pratama','Saputra','Ramadhan','Firmansyah','Nugraha','Hidayat','Kusuma','Maulana','Setiawan','Wijaya','Putra','Permana','Hakim','Santoso','Wicaksono','Aditya'];
  const positions = ['GK','CB','CB','RB','LB','DM','CM','CM','AM','RW','LW','ST','CF'];
  const staffRoles = ['Asisten Manajer','Pelatih Kebugaran','Pelatih Kiper','Kepala Akademi','Kepala Scout','Dokter Klub','Analis Performa'];

  function n(v, min, max){ return Math.max(min, Math.min(max, Number(v) || min)); }
  function h(seed){ let x=2166136261; for(const c of String(seed)){x^=c.charCodeAt(0);x=Math.imul(x,16777619)} return x>>>0; }
  function rnd(seed,min,max){ return min + h(seed)%(max-min+1); }
  function money(x){ return A ? A.fmtMoney(x) : `Rp${Math.round(x)}`; }
  function esc(x){ return A ? A.escapeHtml(x) : String(x); }
  function id(){ return A?.cryptoId?.() || Math.random().toString(36).slice(2); }
  function state(){ return A.state; }
  function club(){ return A.currentClub(); }
  function squad(){ return A.currentPlayers(); }

  function defaultTacticalPlan(){
    return {formation:'4-2-3-1',mentality:'Seimbang',tempo:'Normal',passing:'Campuran',pressing:'Sedang',defensiveLine:'Normal',width:'Normal',marking:'Zonal',buildUp:'Seimbang',counterPress:true,counterAttack:true,timeWasting:false,setPiece:'Campuran'};
  }
  function defaultTraining(){ return {focus:'Seimbang',intensity:'Normal',recovery:'Normal',individual:'Otomatis',lastAppliedWeek:0}; }
  function defaultFacilities(){
    return {
      stadium:{level:2,name:'Stadion',cost:7_500_000_000},training:{level:2,name:'Pusat Latihan',cost:5_500_000_000},
      academy:{level:2,name:'Akademi',cost:4_500_000_000},medical:{level:2,name:'Pusat Medis',cost:4_000_000_000},
      scouting:{level:2,name:'Jaringan Scouting',cost:4_800_000_000},commercial:{level:2,name:'Komersial',cost:5_000_000_000}
    };
  }
  function makeStaff(seed='club'){
    const names=['Bima Prakoso','Rangga Mahendra','Dedi Kurniawan','Arman Hakim','Rio Wibowo','Galih Pratama','Yoga Firmansyah'];
    return staffRoles.map((role,i)=>({id:`staff-${i}-${h(seed+role)}`,name:names[i],role,ability:rnd(seed+role,67,83),potential:rnd(seed+role+'p',75,91),wage:rnd(seed+role+'w',35,120)*1_000_000,contract:2+rnd(seed+role+'c',0,2)}));
  }
  function makeYouth(seed, index, academyLevel=2){
    const pos=positions[rnd(seed+'pos'+index,0,positions.length-1)];
    const age=rnd(seed+'age'+index,15,18);
    const floor=48+academyLevel*2;
    const overall=rnd(seed+'ovr'+index,floor,Math.min(72,floor+12));
    const potential=n(overall+rnd(seed+'pot'+index,8,24)+academyLevel,60,96);
    const first=youthFirst[rnd(seed+'first'+index,0,youthFirst.length-1)];
    const last=youthLast[rnd(seed+'last'+index,0,youthLast.length-1)];
    const attrs={pace:rnd(seed+'a1'+index,overall-8,overall+8),shooting:rnd(seed+'a2'+index,overall-10,overall+8),passing:rnd(seed+'a3'+index,overall-9,overall+9),dribbling:rnd(seed+'a4'+index,overall-9,overall+10),defending:rnd(seed+'a5'+index,overall-12,overall+9),physical:rnd(seed+'a6'+index,overall-8,overall+9),stamina:rnd(seed+'a7'+index,overall-5,overall+12),goalkeeping:pos==='GK'?rnd(seed+'gk'+index,overall-2,overall+10):rnd(seed+'gk'+index,8,35),finishing:rnd(seed+'fin'+index,overall-10,overall+10),vision:rnd(seed+'vis'+index,overall-8,overall+10),tackling:rnd(seed+'tac'+index,overall-10,overall+10),composure:rnd(seed+'com'+index,overall-8,overall+8)};
    Object.keys(attrs).forEach(k=>attrs[k]=n(attrs[k],1,99));
    return {id:`academy-${id()}`,name:`${first} ${last}`,nationality:'Indonesia',clubId:'academy',club:'Akademi Klub',league:'Youth',country:'Indonesia',position:pos,secondaryPositions:[],number:index+40,age,foot:rnd(seed+'foot'+index,0,4)===0?'Left':'Right',overall,potential,height:rnd(seed+'height'+index,pos==='GK'?178:162,pos==='GK'?195:188),weight:rnd(seed+'weight'+index,55,83),wage:0,value:Math.max(150_000_000,(overall-45)*120_000_000),contractYears:0,morale:75,fitness:100,form:68,scouted:true,photoUrl:'',agentName:'Akademi Lokal',traits:potential>88?['Wonderkid']:[],stats:{apps:0,goals:0,assists:0,rating:0},advancedStats:{shots:0,keyPasses:0,tackles:0,passes:0,passPct:0,xG:0,xA:0},attributes:attrs,academy:true};
  }
  function makeYouthBatch(s, count=10){
    const lv=s.facilities?.academy?.level||2;
    return Array.from({length:count},(_,i)=>makeYouth(`${s.selectedClubId}-${s.week}-${s.seasonYear||2025}`,i,lv));
  }

  function seedState(s){
    s.tacticalPlan ||= defaultTacticalPlan();
    s.training ||= defaultTraining();
    s.facilities ||= defaultFacilities();
    s.staff ||= makeStaff(s.selectedClubId);
    s.academy ||= makeYouthBatch(s,10);
    s.injuries ||= [];
    s.promises ||= [];
    s.transferObligations ||= [];
    s.jobOffers ||= [];
    s.managerCareer ||= {reputation:35,badge:'Lisensi C',xp:0,boardConfidence:76,fanConfidence:72,salary:75_000_000,trophies:[],history:[],pressStyle:'Seimbang'};
    s.lockerRoom ||= {cohesion:72,atmosphere:75,leadership:68,lastMeetingWeek:0};
    s.media ||= {answeredWeek:0,lastAnswer:'',questions:[]};
    s.cup ||= {name:'Piala Indonesia',round:'Babak 32 Besar',fixtures:[],history:[]};
    s.seasonYear ||= 2025;
    ensureCup(s);
    return s;
  }

  function migrate(s){
    seedState(s);
    s.version=VERSION;
    s.tacticalPlan={...defaultTacticalPlan(),...(s.tacticalPlan||{})};
    s.training={...defaultTraining(),...(s.training||{})};
    s.facilities={...defaultFacilities(),...(s.facilities||{})};
    s.managerCareer={reputation:35,badge:'Lisensi C',xp:0,boardConfidence:76,fanConfidence:72,salary:75_000_000,trophies:[],history:[],pressStyle:'Seimbang',...(s.managerCareer||{})};
    s.lockerRoom={cohesion:72,atmosphere:75,leadership:68,lastMeetingWeek:0,...(s.lockerRoom||{})};
    for(const p of s.players){
      p.personality ||= ['Profesional','Ambisius','Tenang','Temperamental','Loyal'][rnd(p.id+'personality',0,4)];
      p.squadRole ||= p.overall>=85?'Bintang Tim':p.overall>=78?'Pemain Inti':p.overall>=70?'Pemain Reguler':'Rotasi';
      p.happiness ??= p.morale ?? 75;
      p.promises ||= [];
      p.advancedStats ||= {shots:0,keyPasses:0,tackles:0,passes:0,passPct:0,xG:0,xA:0};
      p.injury ||= null;
      p.suspension ||= 0;
      p.trainingRating ||= rnd(p.id+'training',62,88);
    }
    if(!Array.isArray(s.academy)||!s.academy.length)s.academy=makeYouthBatch(s,10);
    if(!Array.isArray(s.staff)||!s.staff.length)s.staff=makeStaff(s.selectedClubId);
    ensureCup(s);
  }

  function ensureCup(s){
    if(s.cup?.fixtures?.length)return;
    const indo=s.clubs.filter(c=>c.country==='Indonesia').slice(0,16);
    s.cup={name:'Piala Indonesia',round:'Babak 16 Besar',fixtures:[],history:s.cup?.history||[]};
    for(let i=0;i<indo.length-1;i+=2)s.cup.fixtures.push({id:id(),homeId:indo[i].id,awayId:indo[i+1].id,played:false,hg:null,ag:null});
  }

  function nextOpponentV4(){const s=state(),c=club(),pool=s.clubs.filter(x=>x.league===c.league&&x.id!==c.id);return pool[(s.week*3+h(c.id))%Math.max(1,pool.length)]||s.clubs.find(x=>x.id!==c.id)}
  function renderDashboard(view){
    const s=state(),c=club(),opp=nextOpponentV4(),team=squad(),table=s.standings[c.league]||[],rank=Math.max(1,table.findIndex(x=>x.clubId===c.id)+1||1),injured=team.filter(p=>p.injury).length,unhappy=team.filter(p=>(p.happiness??p.morale)<60).length;
    const tasks=[s.media.answeredWeek!==s.week?['Konferensi pers belum dijawab','media']:null,s.training.lastAppliedWeek<s.week?['Program latihan pekan ini belum dievaluasi','training']:null,unhappy? [`${unhappy} pemain tidak bahagia`,'locker']:null,s.managerCareer.boardConfidence<45?['Direksi mulai mempertanyakan posisi manajer','manager']:null].filter(Boolean);
    view.innerHTML=A.pageHead(`Command Centre • Pekan ${s.week}`,A.formattedDate(),`<button class="ghost-btn" data-view="settings">Save & Performa</button>`)+`
      <div class="grid kpi">${A.kpi('Posisi Liga','#'+rank,c.league)}${A.kpi('Direksi',s.managerCareer.boardConfidence+'%',s.managerCareer.boardConfidence<45?'Kursi panas':'Masih dipercaya')}${A.kpi('Atmosfer',s.lockerRoom.atmosphere+'%',`${unhappy} pemain tidak bahagia`)}${A.kpi('Medis',injured+' cedera',injured?'Rotasi dibutuhkan':'Skuad sehat')}</div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Pertandingan Berikutnya</h2><p class="card-sub">${esc(c.league)} • Pekan ${s.week}</p><div class="fixture-card"><div class="fixture-team">${A.badge(c)}<strong>${esc(c.name)}</strong></div><div class="fixture-vs">VS<br><small>Sabtu 19.30</small></div><div class="fixture-team">${A.badge(opp)}<strong>${esc(opp.name)}</strong></div></div><div class="toolbar" style="margin-top:14px"><button class="primary-btn" data-view="match">Mainkan</button><button class="ghost-btn" data-view="tactics">Taktik</button><button class="ghost-btn" data-view="analytics">Analisis</button></div></div>
      <div class="card"><h2>Perlu Perhatian</h2><div class="activity-list">${tasks.map(([label,target])=>`<div class="activity-item click-row" data-view="${target}"><strong>${esc(label)}</strong><span>Buka modul terkait</span></div>`).join('')||'<div class="activity-item"><strong>Semua terkendali</strong><span>Aneh, tapi nikmati dulu sebelum drama berikutnya muncul.</span></div>'}</div></div></div>
      <div class="card feature-hub" style="margin-top:15px"><div class="feature-hub-head"><div><h2>Semua Modul Career Universe</h2><p class="card-sub">Bukan cuma match 3D. Semua sistem ada di sini dan juga di menu samping.</p></div><span class="version-chip">v4.1.0</span></div><div class="command-grid">${[['squad','♟','Skuad'],['tactics','▦','Taktik'],['training','⚡','Latihan'],['academy','★','Akademi'],['locker','♣','Ruang Ganti'],['media','◉','Media'],['transfers','⇄','Transfer'],['scouting','⌕','Scouting'],['competition','🏆','Kompetisi'],['analytics','▥','Analytics'],['finance','Rp','Keuangan'],['club','⌂','Fasilitas & Staf'],['manager','♛','Karier'],['admin','⚙','Admin'],['settings','☷','PWA & Save']].map(([v,ic,l])=>`<button class="command-card" data-view="${v}"><b>${ic}</b><span>${l}</span></button>`).join('')}</div></div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Berita Terbaru</h2><div class="news-list">${s.news.slice(0,8).map(x=>`<div class="news-item"><strong>${esc(x.title)}</strong><span>${esc(x.meta)}</span></div>`).join('')}</div></div><div class="card"><h2>Top Performer</h2><div class="activity-list">${team.slice().sort((a,b)=>(b.stats.rating||b.form/10)-(a.stats.rating||a.form/10)).slice(0,7).map(p=>`<div class="activity-item click-row" data-player-id="${p.id}"><strong>${esc(p.name)} <span class="pos">${p.position}</span></strong><span>Rating ${Number(p.stats.rating||0).toFixed(1)} • Form ${p.form} • Fitness ${p.fitness}${p.injury?' • CEDERA':''}</span></div>`).join('')}</div></div></div>`;
  }

  function renderTactics(view){
    const s=state(), plan=s.tacticalPlan, formation=plan.formation||'4-2-3-1';
    A.ensureLineup(s,s.selectedClubId);
    const lineup=s.lineups[s.selectedClubId], coords=FORMATIONS[formation]||FORMATIONS['4-2-3-1'];
    const team=squad().slice().sort((a,b)=>b.overall-a.overall), bench=team.filter(p=>!lineup.includes(p.id));
    view.innerHTML=A.pageHead('Taktik & Instruksi','Formasi cuma kerangka. Cara build-up, pressing, garis pertahanan, dan role pemain yang bikin tim lu nggak main kayak sebelas orang baru kenalan.')+`
      <div class="grid two tactical-layout"><div>
        <div class="toolbar"><select class="select" id="v4Formation">${Object.keys(FORMATIONS).map(x=>`<option ${x===formation?'selected':''}>${x}</option>`).join('')}</select><button class="ghost-btn" id="autoBestXI">Pilih XI Terbaik</button><button class="primary-btn" id="saveTactic">Simpan Taktik</button></div>
        <div class="pitch" id="tacticPitch">${lineup.map((pid,i)=>{const p=A.playerById(pid);return `<div class="slot" data-v4-slot="${i}" style="left:${coords[i][0]}%;top:${coords[i][1]}%"><div class="slot-player" draggable="true" data-v4-drag="${pid}">${p?A.initials(p.name):'+'}</div><span>${p?esc(p.name):'Kosong'}<br>${p?`${p.position} • ${p.overall}`:''}</span></div>`}).join('')}</div>
      </div><div class="stack">
        <div class="card"><h3>Instruksi Tim</h3><div class="form-grid">
          ${selectField('Mentalitas','tpMentality',['Sangat Bertahan','Bertahan','Seimbang','Positif','Menyerang'],plan.mentality)}
          ${selectField('Tempo','tpTempo',['Lambat','Normal','Cepat','Sangat Cepat'],plan.tempo)}
          ${selectField('Passing','tpPassing',['Pendek','Campuran','Langsung'],plan.passing)}
          ${selectField('Pressing','tpPressing',['Rendah','Sedang','Tinggi','Gegenpress'],plan.pressing)}
          ${selectField('Garis Pertahanan','tpLine',['Rendah','Normal','Tinggi'],plan.defensiveLine)}
          ${selectField('Lebar','tpWidth',['Sempit','Normal','Lebar'],plan.width)}
          ${selectField('Marking','tpMarking',['Zonal','Man Marking','Campuran'],plan.marking)}
          ${selectField('Build-up','tpBuild',['Dari Belakang','Seimbang','Cepat ke Depan'],plan.buildUp)}
          ${selectField('Set Piece','tpSetPiece',['Pendek','Campuran','Target Man'],plan.setPiece)}
          <label class="toggle-card"><span>Counter Press</span><input type="checkbox" id="tpCounterPress" ${plan.counterPress?'checked':''}></label>
          <label class="toggle-card"><span>Counter Attack</span><input type="checkbox" id="tpCounter" ${plan.counterAttack?'checked':''}></label>
          <label class="toggle-card"><span>Buang Waktu</span><input type="checkbox" id="tpWaste" ${plan.timeWasting?'checked':''}></label>
        </div><div class="tactic-impact" id="tacticImpact"></div></div>
        <div class="card"><h3>Cadangan</h3><div class="bench-list">${bench.map(p=>`<div class="bench-player" draggable="true" data-v4-drag="${p.id}" data-v4-pick="${p.id}">${A.playerAvatar(p)}<div><strong>${esc(p.name)}</strong><div class="muted">${p.position} • OVR ${p.overall} • Fit ${p.fitness}</div></div></div>`).join('')||'<div class="empty">Cadangan kosong.</div>'}</div></div>
      </div></div>`;
    let dragged=null, selected=null;
    A.$$('[data-v4-drag]').forEach(el=>el.addEventListener('dragstart',()=>dragged=el.dataset.v4Drag));
    A.$$('[data-v4-pick]').forEach(el=>el.addEventListener('click',()=>{selected=el.dataset.v4Pick;A.toast(`${A.playerById(selected)?.name} dipilih. Tap posisi tujuan.`)}));
    A.$$('[data-v4-slot]').forEach(el=>{el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();swapLineup(dragged,Number(el.dataset.v4Slot))});el.addEventListener('click',()=>{if(selected)swapLineup(selected,Number(el.dataset.v4Slot))})});
    A.$('#v4Formation').addEventListener('change',e=>{plan.formation=e.target.value;s.formation=e.target.value;A.scheduleSave();A.renderView()});
    A.$('#autoBestXI').addEventListener('click',()=>{s.lineups[s.selectedClubId]=bestXI(team,formation).map(p=>p.id);A.scheduleSave();A.renderView();A.toast('XI terbaik dipilih berdasarkan posisi, overall, fitness, dan form.')});
    const calc=()=>{const tmp=readTacticalForm(plan);const impact=tacticalImpact(tmp);A.$('#tacticImpact').innerHTML=`<div><span>Serangan</span><strong>${impact.attack>0?'+':''}${impact.attack}</strong></div><div><span>Pertahanan</span><strong>${impact.defense>0?'+':''}${impact.defense}</strong></div><div><span>Stamina</span><strong>${impact.stamina>0?'+':''}${impact.stamina}</strong></div><div><span>Risiko</span><strong>${impact.risk}%</strong></div>`};
    ['tpMentality','tpTempo','tpPassing','tpPressing','tpLine','tpWidth','tpMarking','tpBuild','tpSetPiece','tpCounterPress','tpCounter','tpWaste'].forEach(x=>A.$('#'+x)?.addEventListener('change',calc));
    A.$('#saveTactic').addEventListener('click',()=>{Object.assign(plan,readTacticalForm(plan));s.formation=plan.formation;A.scheduleSave();A.playSound('click');A.toast('Taktik disimpan. Sekarang tinggal pemainnya jangan mendadak lupa cara passing.');calc()});
    calc();
  }

  function selectField(label,idName,options,value){ return `<label class="label">${label}<select class="select" id="${idName}">${options.map(x=>`<option ${x===value?'selected':''}>${x}</option>`).join('')}</select></label>`; }
  function readTacticalForm(plan){
    return {...plan,formation:A.$('#v4Formation')?.value||plan.formation,mentality:A.$('#tpMentality')?.value||plan.mentality,tempo:A.$('#tpTempo')?.value||plan.tempo,passing:A.$('#tpPassing')?.value||plan.passing,pressing:A.$('#tpPressing')?.value||plan.pressing,defensiveLine:A.$('#tpLine')?.value||plan.defensiveLine,width:A.$('#tpWidth')?.value||plan.width,marking:A.$('#tpMarking')?.value||plan.marking,buildUp:A.$('#tpBuild')?.value||plan.buildUp,setPiece:A.$('#tpSetPiece')?.value||plan.setPiece,counterPress:Boolean(A.$('#tpCounterPress')?.checked),counterAttack:Boolean(A.$('#tpCounter')?.checked),timeWasting:Boolean(A.$('#tpWaste')?.checked)};
  }
  function tacticalImpact(p){
    let attack=0,defense=0,stamina=0,risk=12;
    ({'Sangat Bertahan':[-9,10],'Bertahan':[-5,6],'Seimbang':[0,0],'Positif':[5,-2],'Menyerang':[9,-6]}[p.mentality]||[0,0]).forEach((v,i)=>i?defense+=v:attack+=v);
    if(p.tempo==='Cepat'){attack+=3;stamina-=4;risk+=4} if(p.tempo==='Sangat Cepat'){attack+=5;stamina-=8;risk+=8} if(p.tempo==='Lambat'){defense+=2;stamina+=3;risk-=2}
    if(p.pressing==='Tinggi'){defense+=4;stamina-=6;risk+=4} if(p.pressing==='Gegenpress'){attack+=3;defense+=5;stamina-=10;risk+=8} if(p.pressing==='Rendah'){defense-=2;stamina+=5;risk-=2}
    if(p.defensiveLine==='Tinggi'){attack+=2;defense+=1;risk+=8} if(p.defensiveLine==='Rendah'){attack-=3;defense+=4;risk-=4}
    if(p.counterPress){defense+=2;stamina-=3;risk+=2} if(p.counterAttack){attack+=3;risk+=2} if(p.timeWasting){attack-=4;defense+=2;stamina+=2}
    return {attack,defense,stamina,risk:n(risk,2,45)};
  }
  function swapLineup(pid,slot){if(!pid)return;const s=state(),arr=s.lineups[s.selectedClubId];const old=arr.indexOf(pid),replaced=arr[slot];if(old>=0)arr[old]=replaced;arr[slot]=pid;A.scheduleSave();A.renderView()}
  function bestXI(team,formation){
    const coords=FORMATIONS[formation]||FORMATIONS['4-2-3-1'];
    const desired=coords.map((_,i)=>i===0?['GK']:i<=4?['RB','LB','CB','RWB','LWB']:i<=7?['DM','CM','AM']:['ST','CF','LW','RW','AM']);
    const unused=[...team];return desired.map(list=>{let best=unused.filter(p=>list.includes(p.position)||p.secondaryPositions?.some(x=>list.includes(x))).sort((a,b)=>scoreXI(b)-scoreXI(a))[0]||unused.sort((a,b)=>scoreXI(b)-scoreXI(a))[0];unused.splice(unused.indexOf(best),1);return best});
  }
  function scoreXI(p){return p.overall*.68+p.fitness*.16+p.form*.1+p.morale*.06-(p.injury?50:0)}

  function renderTraining(view){
    const s=state(),t=s.training, team=squad();
    const avgFit=Math.round(team.reduce((x,p)=>x+p.fitness,0)/Math.max(1,team.length));
    const avgRate=Math.round(team.reduce((x,p)=>x+(p.trainingRating||70),0)/Math.max(1,team.length));
    const risk=trainingRisk(t,team);
    view.innerHTML=A.pageHead('Pusat Latihan','Atur fokus, intensitas, dan pemulihan. Intensitas ekstrem memang cepat, sama kayak cara cepat masuk ruang medis.')+`
      <div class="grid kpi">${A.kpi('Rata-rata Fitness',avgFit,'Kondisi skuad')}${A.kpi('Rating Latihan',avgRate,'Pekan terakhir')}${A.kpi('Risiko Cedera',risk+'%',risk>28?'Terlalu barbar':'Masih masuk akal')}${A.kpi('Pusat Latihan','Level '+s.facilities.training.level,'Pengaruh perkembangan')}</div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Program Pekanan</h2><div class="form-grid">
        ${selectField('Fokus','trFocus',['Seimbang','Menyerang','Bertahan','Teknik','Fisik','Set Piece','Pemulihan'],t.focus)}
        ${selectField('Intensitas','trIntensity',['Ringan','Normal','Tinggi','Ekstrem'],t.intensity)}
        ${selectField('Pemulihan','trRecovery',['Minimal','Normal','Prioritas'],t.recovery)}
        ${selectField('Latihan Individu','trIndividual',['Otomatis','Posisi','Kelemahan','Kekuatan'],t.individual)}
      </div><div class="training-preview" id="trainingPreview"></div><button class="primary-btn" id="saveTraining">Terapkan Program</button></div>
      <div class="card"><h2>Performa Latihan</h2><div class="activity-list">${team.slice().sort((a,b)=>(b.trainingRating||0)-(a.trainingRating||0)).slice(0,10).map(p=>`<div class="activity-item click-row" data-player-id="${p.id}"><strong>${esc(p.name)} <span class="pos">${p.position}</span></strong><span>Rating ${p.trainingRating||70} • Fitness ${p.fitness} • ${p.injury?'Cedera: '+esc(p.injury.type):'Siap latihan'}</span></div>`).join('')}</div></div></div>`;
    const preview=()=>{const tmp={focus:A.$('#trFocus').value,intensity:A.$('#trIntensity').value,recovery:A.$('#trRecovery').value,individual:A.$('#trIndividual').value};const r=trainingRisk(tmp,team);const gain={'Ringan':1,'Normal':2,'Tinggi':4,'Ekstrem':6}[tmp.intensity];A.$('#trainingPreview').innerHTML=`<div><span>Perkembangan</span><strong>+${gain}</strong></div><div><span>Fitness</span><strong>${tmp.recovery==='Prioritas'?'+ tinggi':tmp.intensity==='Ekstrem'?'- tinggi':'normal'}</strong></div><div><span>Risiko Cedera</span><strong>${r}%</strong></div>`};
    ['trFocus','trIntensity','trRecovery','trIndividual'].forEach(x=>A.$('#'+x).addEventListener('change',preview));preview();
    A.$('#saveTraining').addEventListener('click',()=>{Object.assign(t,{focus:A.$('#trFocus').value,intensity:A.$('#trIntensity').value,recovery:A.$('#trRecovery').value,individual:A.$('#trIndividual').value});A.scheduleSave();A.playSound('click');A.toast('Program latihan disimpan untuk pekan berikutnya.');A.renderView()});
  }
  function trainingRisk(t,team){const intensity={Ringan:5,Normal:10,Tinggi:19,Ekstrem:34}[t.intensity]||10;const recovery={Minimal:6,Normal:0,Prioritas:-7}[t.recovery]||0;const lowFit=team.filter(p=>p.fitness<72).length/Math.max(1,team.length)*18;return Math.round(n(intensity+recovery+lowFit-(state().facilities.medical.level-1)*2,2,55))}

  function renderAcademy(view){
    const s=state(), ys=s.academy.slice().sort((a,b)=>b.potential-a.potential);
    view.innerHTML=A.pageHead('Akademi & Youth Intake',`${ys.length} pemain muda • kualitas intake dipengaruhi fasilitas akademi dan kepala akademi`,`<button class="primary-btn" id="newYouthIntake">Generate Intake Baru</button>`)+`
      <div class="grid kpi">${A.kpi('Level Akademi',s.facilities.academy.level,'Maksimal 10')}${A.kpi('Calon Bintang',ys.filter(p=>p.potential>=88).length,'POT 88+')}${A.kpi('Rata-rata POT',Math.round(ys.reduce((x,p)=>x+p.potential,0)/Math.max(1,ys.length)),'Skuad muda')}${A.kpi('Kepala Akademi',s.staff.find(x=>x.role==='Kepala Akademi')?.ability||70,'Kemampuan staf')}</div>
      <div class="academy-grid" style="margin-top:15px">${ys.map(p=>`<article class="academy-card"><div class="academy-top">${A.playerAvatar(p)}<div><strong>${esc(p.name)}</strong><span>${p.position} • ${p.age} tahun • ${p.foot==='Left'?'Kiri':'Kanan'}</span></div><b>${p.overall}</b></div><div class="potential-band"><span>Potential</span><strong>${p.potential} • ${A.potentialLabel(p.potential)}</strong></div><div class="mini-attrs"><span>PAC ${p.attributes.pace}</span><span>TEC ${Math.round((p.attributes.dribbling+p.attributes.passing)/2)}</span><span>PHY ${p.attributes.physical}</span></div><div class="toolbar"><button class="primary-btn" data-promote-youth="${p.id}">Promosikan</button><button class="danger-btn" data-release-youth="${p.id}">Lepas</button></div></article>`).join('')}</div>`;
    A.$('#newYouthIntake').addEventListener('click',()=>{const cost=350_000_000;if(A.clubFunds()<cost)return A.toast('Dana akademi kurang.',true);A.updateFunds(-cost);s.academy=makeYouthBatch(s,10);s.transactions.unshift({id:id(),date:s.date,type:'Program youth intake tambahan',amount:-cost});A.scheduleSave();A.renderView();A.toast('Youth intake baru datang. Semoga bukan sebelas gelandang semua.')});
    A.$$('[data-promote-youth]').forEach(btn=>btn.addEventListener('click',()=>promoteYouth(btn.dataset.promoteYouth)));
    A.$$('[data-release-youth]').forEach(btn=>btn.addEventListener('click',()=>{s.academy=s.academy.filter(p=>p.id!==btn.dataset.releaseYouth);A.scheduleSave();A.renderView()}));
  }
  function promoteYouth(pid){const s=state(),p=s.academy.find(x=>x.id===pid);if(!p)return;const c=club();Object.assign(p,{academy:false,clubId:c.id,club:c.name,league:c.league,country:c.country,wage:Math.max(8_000_000,(p.overall-45)*1_500_000),contractYears:3,squadRole:'Prospek'});s.players.push(p);s.academy=s.academy.filter(x=>x.id!==pid);s.news.unshift({title:`${p.name} dipromosikan dari akademi`,meta:'Akademi • Baru saja'});A.ensureLineup(s,c.id);A.scheduleSave();A.playSound('goal');A.renderView();A.toast(`${p.name} naik ke tim utama.`)}

  function renderLocker(view){
    const s=state(), team=squad().slice().sort((a,b)=>b.morale-a.morale);const unhappy=team.filter(p=>(p.happiness??p.morale)<60);
    const leaders=team.slice().sort((a,b)=>(b.overall+b.age*.45+b.morale*.2)-(a.overall+a.age*.45+a.morale*.2)).slice(0,4);
    view.innerHTML=A.pageHead('Ruang Ganti','Morale, hierarki, janji, dan ego pemain. Intinya simulasi mengasuh dua puluh manusia dewasa yang mudah tersinggung.')+`
      <div class="grid kpi">${A.kpi('Atmosfer',s.lockerRoom.atmosphere+'%',s.lockerRoom.atmosphere>=75?'Positif':'Butuh perhatian')}${A.kpi('Kekompakan',s.lockerRoom.cohesion+'%','Pengaruh performa')}${A.kpi('Tidak Bahagia',unhappy.length,'Pemain')}${A.kpi('Kepercayaan Direksi',s.managerCareer.boardConfidence+'%',s.managerCareer.boardConfidence<45?'Kursi mulai panas':'Posisi aman')}</div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Hierarki Tim</h2>${leaders.map((p,i)=>`<div class="hierarchy-row click-row" data-player-id="${p.id}"><span class="hierarchy-rank">${i+1}</span>${A.playerAvatar(p)}<div><strong>${esc(p.name)}</strong><div class="muted">${i===0?'Kapten ruang ganti':i<3?'Pemain berpengaruh':'Senior'} • Morale ${p.morale}</div></div></div>`).join('')}<div class="divider"></div><h3>Team Meeting</h3><div class="toolbar"><button class="ghost-btn" data-team-talk="praise">Puji Tim</button><button class="ghost-btn" data-team-talk="demand">Tuntut Lebih</button><button class="ghost-btn" data-team-talk="calm">Tenangkan</button></div><p class="card-sub">Meeting hanya efektif sekali tiap dua pekan. Kalau tiap hari pidato, pemain juga muak.</p></div>
      <div class="card"><h2>Kondisi Pemain</h2><div class="activity-list">${team.map(p=>`<div class="activity-item click-row" data-player-id="${p.id}"><strong>${esc(p.name)} <span class="pos">${p.squadRole}</span></strong><span>Morale ${p.morale} • Happiness ${p.happiness??p.morale} • ${p.personality}${p.promises?.length?' • Janji: '+esc(p.promises[0].text):''}</span></div>`).join('')}</div></div></div>`;
    A.$$('[data-team-talk]').forEach(b=>b.addEventListener('click',()=>teamTalk(b.dataset.teamTalk)));
  }
  function teamTalk(type){const s=state();if(s.week-s.lockerRoom.lastMeetingWeek<2)return A.toast('Meeting baru dilakukan. Pemain belum lupa pidato lu.',true);const form=recentForm();let delta=0;if(type==='praise')delta=form>=0?5:-2;if(type==='demand')delta=form<1?5:-4;if(type==='calm')delta=3;for(const p of squad()){p.morale=n(p.morale+delta+rnd(p.id+s.week,-2,2),35,100);p.happiness=n((p.happiness??p.morale)+delta,30,100)}s.lockerRoom.atmosphere=n(s.lockerRoom.atmosphere+delta,25,100);s.lockerRoom.cohesion=n(s.lockerRoom.cohesion+Math.max(1,delta),25,100);s.lockerRoom.lastMeetingWeek=s.week;A.scheduleSave();A.playSound('click');A.renderView();A.toast(delta>0?'Ruang ganti merespons positif.':'Beberapa pemain merasa omongan lu tidak nyambung dengan performa.')}
  function recentForm(){const hist=state().matchHistory.slice(0,5);return hist.reduce((sum,m)=>{const [a,b]=String(m.score).split('-').map(Number);return sum+(a>b?1:a<b?-1:0)},0)}

  function mediaQuestions(){return [
    {q:'Tim Anda dianggap terlalu bergantung pada pemain bintang. Tanggapan?',answers:[['Lindungi pemain','protect'],['Tantang skuad','challenge'],['Netral','neutral']]},
    {q:'Suporter menuntut sepak bola menyerang. Apakah Anda sepakat?',answers:[['Janji menyerang','attack'],['Hasil yang utama','result'],['Tidak terpancing','neutral']]},
    {q:'Rumor transfer mulai mengganggu ruang ganti. Apa sikap Anda?',answers:[['Bantah tegas','deny'],['Buka kemungkinan','open'],['Fokus laga','neutral']]}
  ]}
  function renderMedia(view){
    const s=state();if(!s.media.questions?.length||s.media.generatedWeek!==s.week){s.media.questions=mediaQuestions();s.media.generatedWeek=s.week}
    const answered=s.media.answeredWeek===s.week;
    view.innerHTML=A.pageHead('Media & Konferensi Pers','Jawaban lu memengaruhi morale, reputasi, suporter, dan kadang menciptakan masalah yang sebelumnya bahkan belum ada.')+`
      <div class="grid kpi">${A.kpi('Reputasi Manajer',s.managerCareer.reputation,'Skala 1-100')}${A.kpi('Kepercayaan Fan',s.managerCareer.fanConfidence+'%','Sentimen publik')}${A.kpi('Gaya Media',s.managerCareer.pressStyle,'Karakter publik')}${A.kpi('Status Pekan Ini',answered?'Selesai':'Belum dijawab','Konferensi pers')}</div>
      <div class="press-room" style="margin-top:15px"><div class="press-stage"><div class="press-logo">FFU</div><div><h2>${esc(club().name)}</h2><p>${esc(A.formattedDate())} • Konferensi pers pekan ${s.week}</p></div></div>${answered?`<div class="card"><h2>Konferensi pers selesai</h2><p>${esc(s.media.lastAnswer)}</p></div>`:s.media.questions.map((x,i)=>`<div class="card press-question"><span>PERTANYAAN ${i+1}</span><h3>${esc(x.q)}</h3><div class="toolbar">${x.answers.map(([label,value])=>`<button class="ghost-btn" data-press-answer="${value}" data-q="${i}">${label}</button>`).join('')}</div></div>`).join('')}</div>`;
    A.$$('[data-press-answer]').forEach(b=>b.addEventListener('click',()=>answerPress(b.dataset.pressAnswer,Number(b.dataset.q))));
  }
  function answerPress(type,qIndex){const s=state();if(s.media.answeredWeek===s.week)return;const effects={protect:[2,3,1],challenge:[1,-1,3],neutral:[0,0,0],attack:[2,4,-1],result:[0,-2,2],deny:[1,1,1],open:[1,-1,-2]}[type]||[0,0,0];s.managerCareer.reputation=n(s.managerCareer.reputation+effects[0],1,100);s.managerCareer.fanConfidence=n(s.managerCareer.fanConfidence+effects[1],1,100);for(const p of squad())p.morale=n(p.morale+effects[2]+rnd(p.id+type,-1,1),30,100);s.media.answeredWeek=s.week;s.media.lastAnswer=`Jawaban dipilih: ${type}. Dampak reputasi ${effects[0]>=0?'+':''}${effects[0]}, fan ${effects[1]>=0?'+':''}${effects[1]}, morale ${effects[2]>=0?'+':''}${effects[2]}.`;s.news.unshift({title:'Konferensi pers manajer menjadi sorotan',meta:'Media • Baru saja'});A.scheduleSave();A.playSound('click');A.renderView()}

  function renderAnalytics(view){
    const team=squad(), top=team.slice().sort((a,b)=>(b.stats.rating||0)-(a.stats.rating||0));const goals=team.reduce((x,p)=>x+(p.stats.goals||0),0),assists=team.reduce((x,p)=>x+(p.stats.assists||0),0),apps=team.reduce((x,p)=>x+(p.stats.apps||0),0);
    view.innerHTML=A.pageHead('Analytics & Statistik','Data pertandingan, performa pemain, dan tren. Akhirnya sepak bola dikembalikan ke tabel, habitat alami manusia modern.')+`
      <div class="grid kpi">${A.kpi('Gol Skuad',goals,'Semua kompetisi')}${A.kpi('Assist',assists,'Semua kompetisi')}${A.kpi('Penampilan',apps,'Total pemain')}${A.kpi('Rata-rata Rating',(team.reduce((x,p)=>x+(p.stats.rating||0),0)/Math.max(1,team.filter(p=>p.stats.apps).length)||0).toFixed(2),'Pemain aktif')}</div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Tren Lima Laga</h2><canvas id="formChart" class="analytics-chart" width="800" height="300"></canvas></div><div class="card"><h2>Profil Taktik</h2><div class="radar-lite">${Object.entries(tacticalImpact(state().tacticalPlan)).map(([k,v])=>`<div><span>${k}</span>${A.bar(k==='risk'?v*2:n(50+v*4,5,100))}</div>`).join('')}</div></div></div>
      <div class="card" style="margin-top:15px"><h2>Peringkat Performa</h2><div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Pemain</th><th>Apps</th><th>Gol</th><th>Assist</th><th>Rating</th><th>xG</th><th>xA</th><th>Pass%</th><th>Tackle</th></tr></thead><tbody>${top.map((p,i)=>`<tr class="click-row" data-player-id="${p.id}"><td>${i+1}</td><td><strong>${esc(p.name)}</strong><div class="muted">${p.position}</div></td><td>${p.stats.apps||0}</td><td>${p.stats.goals||0}</td><td>${p.stats.assists||0}</td><td class="rating">${Number(p.stats.rating||0).toFixed(1)}</td><td>${Number(p.advancedStats.xG||0).toFixed(1)}</td><td>${Number(p.advancedStats.xA||0).toFixed(1)}</td><td>${Math.round(p.advancedStats.passPct||0)}%</td><td>${p.advancedStats.tackles||0}</td></tr>`).join('')}</tbody></table></div></div>`;
    requestAnimationFrame(drawFormChart);
  }
  function drawFormChart(){const c=A.$('#formChart');if(!c)return;const ctx=c.getContext('2d'),hist=state().matchHistory.slice(0,8).reverse();const dpr=Math.min(devicePixelRatio||1,1.5),w=c.clientWidth||800,hgt=280;c.width=w*dpr;c.height=hgt*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,hgt);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;for(let i=0;i<5;i++){const y=25+i*52;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(w-20,y);ctx.stroke()}const vals=hist.map(m=>{const [a,b]=m.score.split('-').map(Number);return a>b?3:a===b?1:0});if(!vals.length){ctx.fillStyle='#94a99b';ctx.font='14px system-ui';ctx.fillText('Belum ada pertandingan.',40,60);return}ctx.strokeStyle='#4ade80';ctx.lineWidth=4;ctx.beginPath();vals.forEach((v,i)=>{const x=50+i*(w-90)/Math.max(1,vals.length-1),y=230-v*60;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();vals.forEach((v,i)=>{const x=50+i*(w-90)/Math.max(1,vals.length-1),y=230-v*60;ctx.fillStyle='#22c55e';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eefcf3';ctx.font='12px system-ui';ctx.fillText(v===3?'W':v===1?'D':'L',x-4,260)})}

  function renderClub(view){
    const s=state();
    view.innerHTML=A.pageHead('Klub, Fasilitas & Staf','Upgrade yang mahal tapi nyata pengaruhnya. Tidak seperti beli kursi gaming lalu berharap skill coding naik.')+`
      <div class="facility-grid">${Object.entries(s.facilities).map(([key,f])=>`<article class="facility-card"><div><span>${esc(f.name)}</span><strong>Level ${f.level}/10</strong></div><div class="facility-level">${Array.from({length:10},(_,i)=>`<i class="${i<f.level?'on':''}"></i>`).join('')}</div><p>${facilityDescription(key,f.level)}</p><button class="${f.level>=10?'ghost-btn':'primary-btn'} full" data-upgrade-facility="${key}" ${f.level>=10?'disabled':''}>${f.level>=10?'Maksimal':`Upgrade • ${money(f.cost*Math.pow(1.48,f.level-1))}`}</button></article>`).join('')}</div>
      <div class="card" style="margin-top:15px"><h2>Staf Klub</h2><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama</th><th>Peran</th><th>Ability</th><th>Potential</th><th>Kontrak</th><th>Gaji</th><th>Aksi</th></tr></thead><tbody>${s.staff.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${esc(x.role)}</td><td class="rating">${x.ability}</td><td>${x.potential}</td><td>${x.contract} tahun</td><td>${money(x.wage)}/bln</td><td><button class="ghost-btn" data-train-staff="${x.id}">Kursus</button></td></tr>`).join('')}</tbody></table></div></div>`;
    A.$$('[data-upgrade-facility]').forEach(btn=>btn.addEventListener('click',()=>upgradeFacility(btn.dataset.upgradeFacility)));
    A.$$('[data-train-staff]').forEach(btn=>btn.addEventListener('click',()=>trainStaff(btn.dataset.trainStaff)));
  }
  function facilityDescription(key,lv){return {stadium:`Kapasitas dan pemasukan tiket +${lv*5}%`,training:`Peluang perkembangan atribut +${lv*2}%`,academy:`Kualitas youth intake +${lv*2}%`,medical:`Pemulihan cedera +${lv*4}%`,scouting:`Akurasi dan biaya scouting membaik`,commercial:`Sponsor dan merchandise +${lv*5}%`}[key]}
  function upgradeFacility(key){const s=state(),f=s.facilities[key];if(!f||f.level>=10)return;const cost=Math.round(f.cost*Math.pow(1.48,f.level-1));if(A.clubFunds()<cost)return A.toast('Saldo klub kurang buat upgrade ini.',true);A.updateFunds(-cost);f.level++;s.transactions.unshift({id:id(),date:s.date,type:`Upgrade ${f.name} level ${f.level}`,amount:-cost});A.scheduleSave();A.playSound('goal');A.renderView();A.toast(`${f.name} naik ke level ${f.level}.`)}
  function trainStaff(staffId){const s=state(),x=s.staff.find(a=>a.id===staffId),cost=250_000_000;if(!x)return;if(A.clubFunds()<cost)return A.toast('Dana kursus staf kurang.',true);A.updateFunds(-cost);x.ability=n(x.ability+rnd(x.id+s.week,1,3),1,x.potential);s.transactions.unshift({id:id(),date:s.date,type:`Kursus ${x.role}`,amount:-cost});A.scheduleSave();A.renderView();A.toast(`${x.name} selesai kursus. Ability sekarang ${x.ability}.`)}

  function renderManager(view){
    const s=state(),m=s.managerCareer;ensureJobOffers(s);
    view.innerHTML=A.pageHead('Karier Manajer','Reputasi, lisensi, pekerjaan, dan kepercayaan direksi. Sekarang lu bisa dipecat secara digital juga, hidup makin lengkap.')+`
      <div class="manager-hero"><div class="manager-avatar">MF</div><div><h1>${esc(s.managerName)}</h1><p>${esc(club().name)} • ${m.badge} • Gaji ${money(m.salary)}/bulan</p><div class="toolbar"><span class="tag">REP ${m.reputation}</span><span class="tag">XP ${m.xp}</span><span class="tag ${m.boardConfidence<45?'red':''}">BOARD ${m.boardConfidence}%</span></div></div></div>
      <div class="grid kpi" style="margin-top:15px">${A.kpi('Reputasi',m.reputation,'Dunia sepak bola')}${A.kpi('Lisensi',m.badge,'Kualifikasi')}${A.kpi('Kepercayaan Direksi',m.boardConfidence+'%',m.boardConfidence<35?'RISIKO DIPECAT':'Status pekerjaan')}${A.kpi('Trofi',m.trophies.length,'Sepanjang karier')}</div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Pengembangan Manajer</h2><p class="card-sub">XP dibutuhkan untuk kursus lisensi berikutnya.</p><div class="finance-row"><span>Progress</span><strong>${m.xp}/1000 XP</strong></div>${A.bar(n(m.xp/10,0,100))}<button class="primary-btn" id="managerCourse" style="margin-top:14px">Ambil Kursus Lisensi</button><div class="divider"></div><h3>Riwayat</h3><div class="activity-list">${m.history.slice(0,12).map(x=>`<div class="activity-item"><strong>${esc(x.title)}</strong><span>${esc(x.meta)}</span></div>`).join('')||'<div class="empty">Karier baru dimulai.</div>'}</div></div>
      <div class="card"><h2>Pasar Kerja</h2><div class="activity-list">${s.jobOffers.map(o=>`<div class="job-offer"><div><strong>${esc(A.clubById(o.clubId)?.name||o.clubName)}</strong><span>${esc(o.league)} • Target ${esc(o.target)} • Gaji ${money(o.salary)}</span></div><button class="ghost-btn" data-apply-job="${o.id}">Lamar</button></div>`).join('')||'<div class="empty">Belum ada klub yang nyari lu. Mereka mungkin masih lihat rekaman taktik kemarin.</div>'}</div></div></div>`;
    A.$('#managerCourse').addEventListener('click',managerCourse);A.$$('[data-apply-job]').forEach(b=>b.addEventListener('click',()=>applyJob(b.dataset.applyJob)));
  }
  function ensureJobOffers(s){if(s.jobOffers.length||s.week<4)return;const candidates=s.clubs.filter(c=>c.id!==s.selectedClubId&&Math.abs(c.reputation-s.managerCareer.reputation)<35).slice().sort(()=>Math.random()-.5).slice(0,3);s.jobOffers=candidates.map(c=>({id:id(),clubId:c.id,clubName:c.name,league:c.league,target:c.reputation>78?'Lolos kompetisi benua':'Papan tengah',salary:(45+c.reputation)*1_500_000}))}
  function managerCourse(){const s=state(),m=s.managerCareer;if(m.xp<1000)return A.toast('XP belum cukup buat kursus lisensi.',true);const levels=['Lisensi C','Lisensi B','Lisensi A','Lisensi Pro'],i=levels.indexOf(m.badge);if(i>=levels.length-1)return A.toast('Lisensi lu sudah maksimal. UEFA pun capek nguji lu.');m.xp-=1000;m.badge=levels[i+1];m.reputation=n(m.reputation+6,1,100);m.history.unshift({title:`Meraih ${m.badge}`,meta:`Pekan ${s.week}`});A.scheduleSave();A.playSound('goal');A.renderView()}
  function applyJob(offerId){const s=state(),o=s.jobOffers.find(x=>x.id===offerId);if(!o)return;const target=A.clubById(o.clubId),chance=n(35+(s.managerCareer.reputation-target.reputation)*1.4+s.managerCareer.boardConfidence*.25,8,92);if(rnd(offerId+s.week,1,100)>chance){s.jobOffers=s.jobOffers.filter(x=>x.id!==offerId);A.toast('Lamaran ditolak. Klub memilih kandidat yang presentasinya nggak pakai Comic Sans.',true);A.scheduleSave();A.renderView();return}s.managerCareer.history.unshift({title:`Bergabung dengan ${target.name}`,meta:`Pekan ${s.week}`});s.selectedClubId=target.id;s.managerCareer.salary=o.salary;s.managerCareer.boardConfidence=75;s.jobOffers=[];A.ensureLineup(s,target.id);A.scheduleSave();A.updateShell();A.navigate('dashboard');A.toast(`Resmi jadi manajer ${target.name}.`)}

  function renderCompetition(view){
    const s=state(), leagues=['BRI Super League','Premier League','La Liga','Piala Indonesia'], current=s.competitionTab||club().league;
    let content='';
    if(current==='Piala Indonesia')content=`<div class="cup-bracket">${s.cup.fixtures.map(f=>{const hc=A.clubById(f.homeId),ac=A.clubById(f.awayId);return `<div class="cup-fixture"><div>${esc(hc?.name||'TBD')} <strong>${f.played?f.hg:'-'}</strong></div><span>${s.cup.round}</span><div>${esc(ac?.name||'TBD')} <strong>${f.played?f.ag:'-'}</strong></div></div>`}).join('')||'<div class="empty">Kompetisi selesai.</div>'}</div>`;
    else {const table=s.standings[current]||[];content=`<div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Klub</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr></thead><tbody>${table.map((r,i)=>`<tr ${r.clubId===s.selectedClubId?'class="selected-row"':''}><td>${i+1}</td><td><strong>${esc(r.club)}</strong></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd}</td><td class="rating">${r.pts}</td></tr>`).join('')}</tbody></table></div></div>`}
    view.innerHTML=A.pageHead('Kompetisi','Tiga liga aktif, plus Piala Indonesia sistem gugur.')+`<div class="toolbar">${leagues.map(l=>`<button class="${l===current?'primary-btn':'ghost-btn'}" data-v4-league="${l}">${l}</button>`).join('')}</div>${content}`;
    A.$$('[data-v4-league]').forEach(b=>b.addEventListener('click',()=>{s.competitionTab=b.dataset.v4League;A.renderView()}));
  }

  function renderFinance(view){
    const s=state(),income=s.transactions.filter(t=>t.amount>0).reduce((x,t)=>x+t.amount,0),expense=Math.abs(s.transactions.filter(t=>t.amount<0).reduce((x,t)=>x+t.amount,0));const wages=squad().reduce((x,p)=>x+p.wage,0)+s.staff.reduce((x,p)=>x+p.wage,0);const commercial=1+(s.facilities.commercial.level-1)*.05;
    view.innerHTML=A.pageHead('Keuangan Klub','Pemasukan, pengeluaran, proyeksi, dan fasilitas. Karena sepak bola modern tetap tunduk kepada spreadsheet yang kejam.')+`
      <div class="grid kpi">${A.kpi('Saldo',money(A.clubFunds()),'Kas tersedia')}${A.kpi('Pemasukan',money(income),'Musim berjalan')}${A.kpi('Pengeluaran',money(expense),'Musim berjalan')}${A.kpi('Payroll Bulanan',money(wages),'Pemain + staf')}</div>
      <div class="grid two" style="margin-top:15px"><div class="card"><h2>Transaksi Terakhir</h2><div class="finance-list">${s.transactions.slice(0,24).map(t=>`<div class="finance-row"><div><strong>${esc(t.type)}</strong><div class="muted">${esc(t.date)}</div></div><strong class="${t.amount>=0?'positive':'negative'}">${t.amount>=0?'+':''}${A.fmtFullMoney(t.amount)}</strong></div>`).join('')}</div></div><div class="card"><h2>Proyeksi Komersial</h2>${meter('Sponsor',Math.round(62*commercial))}${meter('Hak siar',58)}${meter('Tiket',45+s.facilities.stadium.level*4)}${meter('Merchandise',30+s.facilities.commercial.level*5)}<div class="divider"></div><div class="finance-row"><span>Financial Health</span><strong class="${A.clubFunds()>wages*4?'positive':'negative'}">${A.clubFunds()>wages*4?'SEHAT':'WASPADA'}</strong></div><button class="ghost-btn full" data-view="club">Kelola Fasilitas</button></div></div>`;
  }
  function meter(name,val){return `<div style="margin:12px 0"><div class="finance-row" style="padding:0 0 6px"><span>${name}</span><strong>${val}%</strong></div>${A.bar(n(val,0,100))}</div>`}

  function onAdvanceWeek(s){
    migrate(s);
    processTransferObligations(s);
    applyTrainingWeek(s);
    recoverInjuries(s);
    updateDynamics(s);
    simulateCup(s);
    s.managerCareer.xp+=35;
    s.lockerRoom.cohesion=n(s.lockerRoom.cohesion+rnd('coh'+s.week,-2,3),20,100);
    s.lockerRoom.atmosphere=n(s.lockerRoom.atmosphere+rnd('atm'+s.week,-3,3),20,100);
    if(s.week%8===0&&s.academy.length<12)s.academy.push(...makeYouthBatch(s,3));
    if(s.managerCareer.boardConfidence<20){s.news.unshift({title:'Direksi mengadakan rapat darurat mengenai posisi manajer',meta:'Klub • Baru saja'})}
    s.media.questions=[];
  }
  function processTransferObligations(s){for(const o of s.transferObligations||[]){if(o.remaining<=0||s.week<o.nextWeek)continue;const payment=Math.min(o.payment,o.total);A.updateFunds(-payment);o.total-=payment;o.remaining--;o.nextWeek=s.week+4;s.transactions.unshift({id:id(),date:s.date,type:`Cicilan transfer ${A.playerById(o.playerId)?.name||'pemain'}`,amount:-payment})}s.transferObligations=(s.transferObligations||[]).filter(o=>o.remaining>0&&o.total>0)}
  function applyTrainingWeek(s){const t=s.training;if(t.lastAppliedWeek===s.week)return;const gain={Ringan:1,Normal:2,Tinggi:4,Ekstrem:6}[t.intensity]||2, risk=trainingRisk(t,s.players.filter(p=>p.clubId===s.selectedClubId));const focusMap={Menyerang:['shooting','finishing','dribbling'],Bertahan:['defending','tackling','physical'],Teknik:['passing','vision','dribbling'],Fisik:['pace','physical','stamina'],'Set Piece':['shooting','passing','composure'],Seimbang:['pace','shooting','passing','dribbling','defending','physical'],Pemulihan:['stamina']};for(const p of s.players.filter(x=>x.clubId===s.selectedClubId)){const r=rnd(p.id+'training'+s.week,1,100),staffBonus=(s.facilities.training.level-1)*2;p.trainingRating=n(55+rnd(p.id+s.week,0,35)+staffBonus-(t.intensity==='Ekstrem'?8:0),40,99);const keys=focusMap[t.focus]||focusMap.Seimbang;if(r<gain*2+staffBonus&&p.overall<p.potential){const key=keys[rnd(p.id+'focus'+s.week,0,keys.length-1)];p.attributes[key]=n(p.attributes[key]+1,1,99);if(r<gain+staffBonus/2)p.overall=n(p.overall+1,1,p.potential)}const fatigue={Ringan:-1,Normal:-3,Tinggi:-7,Ekstrem:-12}[t.intensity]+({Minimal:0,Normal:3,Prioritas:7}[t.recovery]||0);p.fitness=n(p.fitness+fatigue,35,100);if(!p.injury&&rnd(p.id+'injury'+s.week,1,100)<=risk/5){const weeks=rnd(p.id+'weeks'+s.week,1,5);p.injury={type:['Cedera hamstring','Pergelangan kaki terkilir','Benturan lutut','Masalah otot'][rnd(p.id+'type'+s.week,0,3)],weeks};p.fitness=n(p.fitness-rnd(p.id+'fitinj'+s.week,12,28),20,100);s.injuries.push({playerId:p.id,type:p.injury.type,weeks})}}t.lastAppliedWeek=s.week}
  function recoverInjuries(s){for(const p of s.players){if(!p.injury)continue;const bonus=Math.floor((s.facilities.medical.level-1)/3);p.injury.weeks=Math.max(0,p.injury.weeks-1-(bonus&&rnd(p.id+s.week,0,3)===0?1:0));if(p.injury.weeks<=0){s.news.unshift({title:`${p.name} pulih dari cedera`,meta:'Medis • Baru saja'});p.injury=null;p.fitness=Math.max(p.fitness,68)}}s.injuries=s.injuries.filter(x=>{const p=s.players.find(a=>a.id===x.playerId);return p?.injury})}
  function updateDynamics(s){const user=s.players.filter(p=>p.clubId===s.selectedClubId);for(const p of user){const roleExpectation={'Bintang Tim':80,'Pemain Inti':72,'Pemain Reguler':62,'Rotasi':52,'Prospek':45}[p.squadRole]||60;const played=p.stats.apps>Math.max(1,s.week*.45);const delta=played?2:roleExpectation>70?-3:-1;p.happiness=n((p.happiness??p.morale)+delta+rnd(p.id+'happy'+s.week,-2,2),25,100);p.morale=n(p.morale+(p.happiness<55?-2:1)+rnd(p.id+'morale'+s.week,-2,2),30,100)}s.lockerRoom.atmosphere=n(user.reduce((x,p)=>x+p.morale,0)/Math.max(1,user.length),20,100)}
  function simulateCup(s){if(s.week%4!==0||!s.cup.fixtures.length)return;for(const f of s.cup.fixtures){if(f.played)continue;const hs=A.clubStrength(f.homeId),as=A.clubStrength(f.awayId);f.hg=Math.max(0,Math.round((hs-60)/20+Math.random()*2));f.ag=Math.max(0,Math.round((as-60)/20+Math.random()*2));if(f.hg===f.ag)f[rnd(f.id,0,1)?'hg':'ag']++;f.played=true;s.cup.history.unshift({...f,round:s.cup.round})}const winners=s.cup.fixtures.map(f=>f.hg>f.ag?f.homeId:f.awayId);if(winners.length===1){s.cup.round='Juara';const champ=A.clubById(winners[0]);s.news.unshift({title:`${champ?.name} menjuarai Piala Indonesia`,meta:'Kompetisi • Baru saja'});if(winners[0]===s.selectedClubId){s.managerCareer.trophies.push({name:'Piala Indonesia',year:s.seasonYear});s.managerCareer.reputation=n(s.managerCareer.reputation+8,1,100);s.managerCareer.boardConfidence=n(s.managerCareer.boardConfidence+12,1,100)}s.cup.fixtures=[];return}s.cup.round=winners.length===8?'Perempat Final':winners.length===4?'Semifinal':winners.length===2?'Final':'Babak Berikutnya';s.cup.fixtures=[];for(let i=0;i<winners.length-1;i+=2)s.cup.fixtures.push({id:id(),homeId:winners[i],awayId:winners[i+1],played:false,hg:null,ag:null})}

  function matchModifiers(home,away,mentality){
    if(!A)return {homeAttack:0,homeDefense:0,homeStamina:0,risk:12};
    const s=state();if(home.id!==s.selectedClubId)return {homeAttack:0,homeDefense:0,homeStamina:0,risk:12};const plan={...s.tacticalPlan,mentality:mentality==='Pressing Tinggi'?'Positif':mentality};return tacticalImpact(plan);
  }
  function onMatchFinished(result){
    if(!A)return;const s=state(),won=result.homeScore>result.awayScore,draw=result.homeScore===result.awayScore;const delta=won?5:draw?0:-5;s.managerCareer.boardConfidence=n(s.managerCareer.boardConfidence+delta,5,100);s.managerCareer.fanConfidence=n(s.managerCareer.fanConfidence+(won?4:draw?0:-4),5,100);s.managerCareer.reputation=n(s.managerCareer.reputation+(won?1:0),1,100);s.managerCareer.xp+=won?80:draw?50:35;s.lockerRoom.atmosphere=n(s.lockerRoom.atmosphere+(won?4:draw?0:-4),20,100);for(const p of squad())p.morale=n(p.morale+(won?3:draw?0:-3),30,100);s.managerCareer.history.unshift({title:`${result.home} ${result.homeScore}-${result.awayScore} ${result.away}`,meta:`Pekan ${s.week}`});A.scheduleSave();
  }

  function init(app){A=app; migrate(A.state);}

  window.FFU4 = {
    version:VERSION,init,seedState,migrate,onAdvanceWeek,matchModifiers,onMatchFinished,
    renderers:{dashboard:renderDashboard,tactics:renderTactics,training:renderTraining,academy:renderAcademy,locker:renderLocker,media:renderMedia,analytics:renderAnalytics,club:renderClub,manager:renderManager,competition:renderCompetition,finance:renderFinance}
  };
})();
