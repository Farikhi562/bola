(() => {
  'use strict';

  const VERSION = '4.1.0';
  const STORAGE_PREFIX = 'ffu-save-';
  const ACTIVE_SLOT_KEY = 'ffu-active-slot';
  const PHOTO_CACHE_KEY = 'ffu-photo-cache-v1';
  const SAVE_SLOTS = 5;
  const navItems = [
    ['dashboard','⌂','Beranda'],['squad','♟','Skuad'],['tactics','▦','Taktik'],['match','▶','Pertandingan'],
    ['transfers','⇄','Transfer'],['scouting','⌕','Scouting'],['training','⚡','Latihan'],['academy','★','Akademi'],
    ['locker','♣','Ruang Ganti'],['media','◉','Media'],['competition','🏆','Kompetisi'],['analytics','▥','Analytics'],
    ['finance','Rp','Keuangan'],['club','⌂','Klub & Staf'],['manager','♛','Karier'],['admin','⚙','Admin'],['settings','☷','Pengaturan']
  ];
  const bottomItems = ['dashboard','squad','match','transfers','more'];
  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const clone = obj => typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
  const fmtMoney = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0,notation:Math.abs(n)>=1_000_000_000?'compact':'standard'}).format(n || 0);
  const fmtFullMoney = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n || 0);
  const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const hash = s => { let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)} return h>>>0 };
  const randFrom = (seed,min,max) => min + (hash(seed) % (max-min+1));
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  const ui = {
    activeView:'dashboard', squadPage:1, squadQuery:'', squadPos:'ALL', transferPage:1, transferQuery:'',
    transferPos:'ALL', scoutPage:1, scoutQuery:'', adminPage:1, adminQuery:'', adminTab:'players',
    selectedTacticPlayer:null, currentMatch:null, cleanup:null, saving:false
  };

  function createInitialState(){
    const data = clone(window.FFU_DATA);
    const fundsByClub = Object.fromEntries(data.clubs.map(c=>[c.id,c.budget]));
    const persija = data.clubs.find(c=>c.name==='Persija Jakarta') || data.clubs[0];
    const state = {
      version:VERSION, hasOnboarded:false, managerName:'Muhamad Fauzan Al Farikhi', selectedClubId:persija.id,
      week:1, date:'2025-08-04', sound:true, reducedMotion:false, activeSlot:1, fundsByClub,
      clubs:data.clubs, players:data.players, standings:data.standings, shortlist:[], lineups:{},
      transactions:[
        {id:cryptoId(),date:'2025-08-04',type:'Sponsor utama',amount:12_500_000_000},
        {id:cryptoId(),date:'2025-08-04',type:'Gaji staf dan pemain',amount:-4_850_000_000}
      ],
      news:[
        {title:'Musim 2025/26 resmi dimulai',meta:'Pusat berita • Hari ini'},
        {title:'Pemandu bakat mulai memantau wonderkid muda',meta:'Scouting • 1 jam lalu'},
        {title:'Bursa transfer dibuka sampai pekan keempat',meta:'Transfer • 2 jam lalu'}
      ],
      settings:{autosave:true,matchFps:30,matchView:'3d',matchQuality:'low',matchCamera:'broadcast'}, matchHistory:[]
    };
    ensureLineup(state, persija.id);
    window.FFU4?.seedState?.(state);
    return state;
  }

  function cryptoId(){ return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)+Date.now().toString(36)); }

  let activeSlot = Number(localStorage.getItem(ACTIVE_SLOT_KEY) || 1);
  let state = loadSlot(activeSlot) || createInitialState();
  migrateState();

  function migrateState(){
    if(!state.fundsByClub) state.fundsByClub = Object.fromEntries(state.clubs.map(c=>[c.id,c.budget||0]));
    if(!state.settings) state.settings={autosave:true,matchFps:30,matchView:'3d',matchQuality:'low',matchCamera:'broadcast'};
    state.settings.matchView=state.settings.matchView||'3d';
    state.settings.matchQuality=state.settings.matchQuality||'low';
    state.settings.matchCamera=state.settings.matchCamera||'broadcast';
    if(!state.lineups) state.lineups={};
    if(!state.news) state.news=[];
    if(!state.transactions) state.transactions=[];
    if(!state.shortlist) state.shortlist=[];
    if(!state.matchHistory) state.matchHistory=[];
    window.FFU4?.migrate?.(state);
    state.version=VERSION;
    activeSlot=state.activeSlot||activeSlot;
    ensureLineup(state,state.selectedClubId);
  }

  function loadSlot(slot){
    try{ const raw=localStorage.getItem(STORAGE_PREFIX+slot); return raw?JSON.parse(raw):null; }
    catch(err){ console.warn('Save rusak',err); return null; }
  }
  function saveNow(show=false){
    try{
      state.activeSlot=activeSlot;
      localStorage.setItem(STORAGE_PREFIX+activeSlot,JSON.stringify(state));
      localStorage.setItem(ACTIVE_SLOT_KEY,String(activeSlot));
      $('#saveStatus').textContent=`Tersimpan slot ${activeSlot} • ${new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}`;
      if(show) toast(`Save slot ${activeSlot} aman. Tidak hilang ditelan dimensi lain.`);
    }catch(err){ toast('Save gagal. Penyimpanan browser penuh.',true); console.error(err); }
  }
  let saveTimer;
  function scheduleSave(){
    if(!state.settings.autosave) return;
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      const run=()=>saveNow(false);
      if('requestIdleCallback' in window) requestIdleCallback(run,{timeout:1200}); else run();
    },650);
  }

  function clubById(id){ return state.clubs.find(c=>c.id===id); }
  function playerById(id){ return state.players.find(p=>p.id===id); }
  function currentClub(){ return clubById(state.selectedClubId) || state.clubs[0]; }
  function currentPlayers(){ return state.players.filter(p=>p.clubId===state.selectedClubId); }
  function clubPlayers(clubId){ return state.players.filter(p=>p.clubId===clubId); }
  function clubFunds(id=state.selectedClubId){ return state.fundsByClub[id] ?? clubById(id)?.budget ?? 0; }
  function updateFunds(amount,id=state.selectedClubId){ state.fundsByClub[id]=(state.fundsByClub[id]||0)+amount; updateShell(); scheduleSave(); }
  function initials(name){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
  function potentialLabel(p){
    if(p>=94) return 'Potensi sangat tinggi • calon superstar';
    if(p>=88) return 'Berpotensi menjadi pemain bintang';
    if(p>=81) return 'Potensi tinggi';
    if(p>=73) return 'Potensi biasa';
    if(p>=65) return 'Potensi rendah';
    return 'Tidak punya potensi';
  }
  function visiblePotential(p){ return p.scouted ? `${p.potential} • ${potentialLabel(p.potential)}` : 'Belum di-scout'; }
  function ageCurve(p){
    if(p.age<=20) return 'Perkembangan cepat'; if(p.age<=24) return 'Berkembang'; if(p.age<=27) return 'Masa puncak';
    if(p.age<=30) return 'Stabil'; if(p.age<=33) return 'Mulai menurun'; return 'Penurunan tajam';
  }
  function clubStrength(id){
    const ps=clubPlayers(id).sort((a,b)=>b.overall-a.overall).slice(0,11);
    return ps.length?Math.round(ps.reduce((s,p)=>s+p.overall,0)/ps.length):(clubById(id)?.strength||70);
  }
  function nextOpponent(){
    const c=currentClub();
    const pool=state.clubs.filter(x=>x.league===c.league && x.id!==c.id);
    return pool[(state.week*3 + hash(c.id)) % Math.max(1,pool.length)] || state.clubs.find(x=>x.id!==c.id);
  }
  function formattedDate(){ return new Date(state.date+'T12:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }

  function ensureLineup(targetState,clubId){
    if(targetState.lineups[clubId]?.length===11) return;
    const players=targetState.players.filter(p=>p.clubId===clubId).sort((a,b)=>b.overall-a.overall).slice(0,11);
    targetState.lineups[clubId]=players.map(p=>p.id);
  }

  function updateShell(){
    const c=currentClub();
    $('#clubName').textContent=c.name;
    $('#clubBadge').textContent=c.code;
    $('#clubBadge').style.background=`linear-gradient(135deg,${c.colors?.[0]||'#16a34a'},${c.colors?.[1]||'#07120d'})`;
    $('#managerMeta').textContent=`${state.managerName} • Pekan ${state.week}`;
    $('#moneyPill').textContent=fmtMoney(clubFunds());
    $('#soundBtn').textContent=state.sound?'🔊':'🔇';
    $$('.nav-btn,.bottom-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===ui.activeView));
  }

  function renderNav(){
    $('#mainNav').innerHTML=navItems.map(([id,ic,label])=>`<button class="nav-btn ${ui.activeView===id?'active':''}" data-view="${id}"><span>${ic}</span>${label}</button>`).join('');
    $('#bottomNav').innerHTML=bottomItems.map(id=>{
      if(id==='more') return `<button class="bottom-btn" data-open-menu><b>☰</b><span>Semua Menu</span></button>`;
      const item=navItems.find(x=>x[0]===id);
      return `<button class="bottom-btn ${ui.activeView===id?'active':''}" data-view="${id}"><b>${item[1]}</b><span>${item[2]}</span></button>`;
    }).join('');
  }

  function navigate(view){
    if(ui.cleanup){ try{ui.cleanup()}catch{} ui.cleanup=null; }
    ui.activeView=view;
    renderNav(); updateShell(); renderView();
    $('#sidebar').classList.remove('open');
    document.body.classList.remove('menu-open');
    window.scrollTo({top:0,behavior:state.reducedMotion?'auto':'smooth'});
  }

  function renderView(){
    const view=$('#view');
    const renderers={dashboard:renderDashboard,squad:renderSquad,tactics:renderTactics,match:renderMatch,transfers:renderTransfers,scouting:renderScouting,competition:renderCompetition,finance:renderFinance,admin:renderAdmin,settings:renderSettings,...(window.FFU4?.renderers||{})};
    view.innerHTML='';
    (renderers[ui.activeView]||renderDashboard)(view);
  }

  function pageHead(title,sub,actions=''){ return `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div>${actions}</div></div>`; }
  function badge(c,size='mini-badge'){ return `<div class="${size}" style="background:linear-gradient(135deg,${c.colors?.[0]||'#183424'},${c.colors?.[1]||'#07120d'})">${escapeHtml(c.code)}</div>`; }
  function playerAvatar(p){ return `<div class="avatar">${escapeHtml(initials(p.name))}</div>`; }

  function renderDashboard(view){
    const c=currentClub(), opp=nextOpponent(), squad=currentPlayers();
    const avg=squad.length?Math.round(squad.reduce((s,p)=>s+p.overall,0)/squad.length):0;
    const injured=squad.filter(p=>p.fitness<68).length;
    const leagueTable=state.standings[c.league]||[];
    const rank=Math.max(1,leagueTable.findIndex(x=>x.clubId===c.id)+1 || 1);
    view.innerHTML=pageHead(`Pekan ${state.week}`,formattedDate(),`<button class="ghost-btn" data-view="settings">Kelola Save</button>`)+`
      <div class="grid kpi">
        ${kpi('Posisi Liga',`#${rank}`,c.league)}
        ${kpi('Kekuatan Skuad',avg,'Rata-rata overall')}
        ${kpi('Saldo Klub',fmtMoney(clubFunds()),'Semua transaksi memakai IDR')}
        ${kpi('Kondisi',`${injured} rawan cedera`,injured?'Rotasi disarankan':'Skuad cukup bugar')}
      </div>
      <div class="grid two" style="margin-top:15px">
        <div class="card">
          <h2>Pertandingan Berikutnya</h2><p class="card-sub">${escapeHtml(c.league)} • Pekan ${state.week}</p>
          <div class="fixture-card" style="margin-top:15px">
            <div class="fixture-team">${badge(c)}<strong>${escapeHtml(c.name)}</strong></div>
            <div class="fixture-vs">VS<br><small>Sabtu 19.30</small></div>
            <div class="fixture-team">${badge(opp)}<strong>${escapeHtml(opp.name)}</strong></div>
          </div>
          <div class="toolbar" style="margin-top:14px"><button class="primary-btn" data-view="match">Masuk Match Centre</button><button class="ghost-btn" data-view="tactics">Atur Taktik</button></div>
        </div>
        <div class="card"><h2>Agenda Pekan Ini</h2><div class="activity-list">
          ${activity('Senin','Pemulihan dan evaluasi video')}${activity('Rabu','Latihan taktik utama')}${activity('Jumat','Konferensi pers dan finalisasi skuad')}${activity('Sabtu','Pertandingan liga')}
        </div></div>
      </div>
      <div class="grid two" style="margin-top:15px">
        <div class="card"><h2>Berita Klub & Dunia</h2><div class="news-list">${state.news.slice(0,6).map(n=>`<div class="news-item"><strong>${escapeHtml(n.title)}</strong><span>${escapeHtml(n.meta)}</span></div>`).join('')}</div></div>
        <div class="card"><h2>Pemain Kunci</h2><div class="activity-list">${squad.sort((a,b)=>b.form-a.form).slice(0,5).map(p=>`<div class="activity-item click-row" data-player-id="${p.id}"><strong>${escapeHtml(p.name)} <span class="pos">${p.position}</span></strong><span>OVR ${p.overall} • Form ${p.form} • Fitness ${p.fitness}</span></div>`).join('')||'<div class="empty">Skuad kosong. Admin lu kebangetan.</div>'}</div></div>
      </div>`;
  }
  function kpi(label,value,delta){return `<div class="card kpi-card"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-delta">${delta}</div></div>`}
  function activity(a,b){return `<div class="activity-item"><strong>${a}</strong><span>${b}</span></div>`}

  function renderSquad(view){
    const all=currentPlayers().filter(p=>(ui.squadPos==='ALL'||p.position===ui.squadPos)&&p.name.toLowerCase().includes(ui.squadQuery.toLowerCase())).sort((a,b)=>b.overall-a.overall);
    const pageSize=25,pages=Math.max(1,Math.ceil(all.length/pageSize)); ui.squadPage=Math.min(ui.squadPage,pages);
    const rows=all.slice((ui.squadPage-1)*pageSize,ui.squadPage*pageSize);
    const positions=['ALL',...new Set(currentPlayers().map(p=>p.position))];
    view.innerHTML=pageHead('Skuad Utama',`${currentPlayers().length} pemain • tabel dipaginasi biar HP lu nggak minta ampun`)+`
      <div class="card"><div class="toolbar"><input class="input" id="squadSearch" value="${escapeHtml(ui.squadQuery)}" placeholder="Cari pemain..."><select class="select" id="squadPos">${positions.map(x=>`<option ${x===ui.squadPos?'selected':''}>${x}</option>`).join('')}</select><button class="ghost-btn" data-view="tactics">Susun XI</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Pemain</th><th>Pos</th><th>Usia</th><th>OVR</th><th>Potensi</th><th>Fitness</th><th>Form</th><th>Gaji</th></tr></thead><tbody>
      ${rows.map(p=>`<tr class="click-row" data-player-id="${p.id}"><td><div class="player-cell">${playerAvatar(p)}<div><strong>${escapeHtml(p.name)}</strong><div class="muted">${escapeHtml(p.nationality)} • #${p.number}</div></div></div></td><td><span class="pos">${p.position}</span></td><td>${p.age}</td><td class="rating">${p.overall}</td><td>${p.scouted?`<span class="tag">${p.potential}</span>`:'<span class="tag warn">?</span>'}</td><td>${bar(p.fitness)}</td><td>${p.form}</td><td>${fmtMoney(p.wage)}/bln</td></tr>`).join('')||'<tr><td colspan="8" class="empty">Pemain nggak ketemu.</td></tr>'}
      </tbody></table></div>${pagination('squad',ui.squadPage,pages)}</div>`;
    $('#squadSearch').addEventListener('input',debounce(e=>{ui.squadQuery=e.target.value;ui.squadPage=1;renderView()},180));
    $('#squadPos').addEventListener('change',e=>{ui.squadPos=e.target.value;ui.squadPage=1;renderView()});
  }
  function bar(v){ return `<div class="progress" title="${v}"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></div>`; }
  function pagination(type,page,pages){ return `<div class="pagination"><button class="ghost-btn" data-page-type="${type}" data-page="${page-1}" ${page<=1?'disabled':''}>‹</button><span>${page} / ${pages}</span><button class="ghost-btn" data-page-type="${type}" data-page="${page+1}" ${page>=pages?'disabled':''}>›</button></div>`; }
  function debounce(fn,ms){let t;return (...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}

  function showPlayer(p){
    const attrs=p.attributes;
    const body=`<div class="player-hero"><img id="playerPhoto" class="player-photo" src="${avatarFallback(p.name)}" alt="Foto ${escapeHtml(p.name)}"><div class="player-meta"><h2>${escapeHtml(p.name)}</h2><p>${escapeHtml(p.club)} • ${p.position}${p.secondaryPositions?.length?' / '+p.secondaryPositions.join(', '):''}</p><p>${escapeHtml(p.nationality)} • ${p.age} tahun • ${p.height} cm / ${p.weight} kg • Kaki ${p.foot==='Right'?'kanan':'kiri'}</p><div class="toolbar"><span class="tag">OVR ${p.overall}</span><span class="tag ${p.scouted?'':'warn'}">POT ${p.scouted?p.potential:'?'}</span><span class="tag">${ageCurve(p)}</span></div></div></div>
      <div class="divider"></div><div class="grid two"><div><h3>Atribut Utama</h3><div class="stat-grid">${Object.entries(attrs).map(([k,v])=>`<div class="stat-box"><span>${attrName(k)}</span><strong>${v}</strong>${bar(v)}</div>`).join('')}</div></div><div><h3>Laporan</h3><div class="finance-list"><div class="finance-row"><span>Potensi</span><strong>${visiblePotential(p)}</strong></div><div class="finance-row"><span>Nilai pasar</span><strong>${fmtFullMoney(p.value)}</strong></div><div class="finance-row"><span>Gaji</span><strong>${fmtFullMoney(p.wage)}/bulan</strong></div><div class="finance-row"><span>Kontrak</span><strong>${p.contractYears} tahun</strong></div><div class="finance-row"><span>Statistik</span><strong>${p.stats.apps} laga • ${p.stats.goals} gol</strong></div></div><div class="toolbar" style="margin-top:14px">${p.clubId!==state.selectedClubId?`<button class="primary-btn" data-negotiate="${p.id}">Negosiasi</button>`:''}${!p.scouted?`<button class="ghost-btn" data-scout="${p.id}">Scout Pemain</button>`:''}<button class="ghost-btn" data-admin-edit="${p.id}">Edit Admin</button></div></div></div>`;
    openModal(body);
    resolvePlayerPhoto(p).then(url=>{const img=$('#playerPhoto'); if(img&&url) img.src=url;});
  }
  function attrName(k){return ({pace:'Pace',shooting:'Shoot',passing:'Passing',dribbling:'Dribble',defending:'Defending',physical:'Physical',stamina:'Stamina',goalkeeping:'Goalkeeping',finishing:'Finishing',vision:'Vision',tackling:'Tackling',composure:'Composure'})[k]||k}

  const FORMATIONS={
    '4-2-3-1':[[50,91],[18,76],[39,80],[61,80],[82,76],[38,62],[62,62],[20,43],[50,45],[80,43],[50,23]],
    '4-3-3':[[50,91],[18,76],[39,80],[61,80],[82,76],[25,58],[50,62],[75,58],[18,31],[50,24],[82,31]],
    '3-4-3':[[50,91],[27,77],[50,79],[73,77],[13,56],[38,60],[62,60],[87,56],[20,31],[50,24],[80,31]],
    '4-4-2':[[50,91],[18,76],[39,80],[61,80],[82,76],[18,52],[40,58],[60,58],[82,52],[38,27],[62,27]]
  };
  function renderTactics(view){
    ensureLineup(state,state.selectedClubId);
    const lineup=state.lineups[state.selectedClubId], squad=currentPlayers().sort((a,b)=>b.overall-a.overall);
    const formation=state.formation||'4-2-3-1', coords=FORMATIONS[formation];
    const bench=squad.filter(p=>!lineup.includes(p.id));
    view.innerHTML=pageHead('Papan Taktik','Drag & drop di desktop, tap pemain lalu tap slot di HP. Manusia ternyata butuh dua metode buat mindahin satu lingkaran.',`<select class="select" id="formationSelect">${Object.keys(FORMATIONS).map(x=>`<option ${x===formation?'selected':''}>${x}</option>`).join('')}</select>`)+`
      <div class="pitch-layout"><div class="pitch" id="tacticPitch">${lineup.map((id,i)=>{const p=playerById(id);return `<div class="slot" data-slot="${i}" style="left:${coords[i][0]}%;top:${coords[i][1]}%"><div class="slot-player" draggable="true" data-drag-player="${id}">${p?initials(p.name):'+'}</div><span>${p?escapeHtml(p.name):'Kosong'}<br>${p?`${p.position} • ${p.overall}`:''}</span></div>`}).join('')}</div>
      <div class="card"><h3>Cadangan</h3><p class="card-sub">Klik pemain untuk dipilih.</p><div class="bench-list">${bench.map(p=>`<div class="bench-player" draggable="true" data-drag-player="${p.id}" data-select-tactic="${p.id}">${playerAvatar(p)}<div><strong>${escapeHtml(p.name)}</strong><div class="muted">${p.position} • OVR ${p.overall}</div></div></div>`).join('')||'<div class="empty">Tidak ada cadangan.</div>'}</div></div></div>`;
    $('#formationSelect').addEventListener('change',e=>{state.formation=e.target.value;scheduleSave();renderView()});
    let dragged=null;
    $$('[data-drag-player]').forEach(el=>el.addEventListener('dragstart',()=>dragged=el.dataset.dragPlayer));
    $$('.slot').forEach(slot=>{
      slot.addEventListener('dragover',e=>e.preventDefault());
      slot.addEventListener('drop',e=>{e.preventDefault();if(dragged)assignToSlot(dragged,Number(slot.dataset.slot))});
      slot.addEventListener('click',()=>{if(ui.selectedTacticPlayer)assignToSlot(ui.selectedTacticPlayer,Number(slot.dataset.slot))});
    });
    $$('[data-select-tactic]').forEach(el=>el.addEventListener('click',()=>{ui.selectedTacticPlayer=el.dataset.selectTactic;toast(`${playerById(ui.selectedTacticPlayer)?.name} dipilih. Tap posisi tujuan.`)}));
  }
  function assignToSlot(playerId,slot){
    const arr=state.lineups[state.selectedClubId]; const oldIndex=arr.indexOf(playerId); const replaced=arr[slot];
    if(oldIndex>=0) arr[oldIndex]=replaced; arr[slot]=playerId; ui.selectedTacticPlayer=null; scheduleSave();renderView();
  }

  function renderMatch(view){
    const home=currentClub(), away=nextOpponent();
    const mode=state.settings.matchView||'3d';
    const quality=state.settings.matchQuality||'low';
    const camera=state.settings.matchCamera||'broadcast';
    const webglReady=Boolean(window.FFU3D?.isSupported?.());
    const actualMode=mode==='3d'&&webglReady?'3d':'2d';
    view.innerHTML=pageHead('Match Centre',actualMode==='3d'?'Mode 3D low-poly WebGL aktif. Kamera, kualitas, dan FPS bisa diturunin kalau chipset mulai halu.':'Mode 2D ringan aktif sebagai fallback untuk perangkat yang WebGL-nya sudah menyerah.')+`
      <div class="match-wrap"><div class="match-stage"><div class="scoreboard"><div>${badge(home)}<strong>${escapeHtml(home.name)}</strong></div><div class="score-main"><b id="homeScore">0</b> - <b id="awayScore">0</b><span id="matchMinute">Belum dimulai</span></div><div>${badge(away)}<strong>${escapeHtml(away.name)}</strong></div></div>
      <div class="match-canvas-shell"><canvas id="matchCanvas" width="960" height="540"></canvas><div class="match-event-banner" id="matchEventBanner"></div><div class="match-render-badge">${actualMode==='3d'?'3D WEBGL':'2D CANVAS'}</div></div>
      <div class="match-controls"><button class="primary-btn" id="startMatchBtn">Mulai</button><button class="ghost-btn" id="pauseMatchBtn">Pause</button><select class="select" id="speedSelect" aria-label="Kecepatan"><option value="1">1x</option><option value="2">2x</option><option value="4">4x</option><option value="8">8x</option></select><select class="select" id="mentalitySelect" aria-label="Mentalitas"><option ${state.tacticalPlan?.mentality==='Seimbang'?'selected':''}>Seimbang</option><option ${['Menyerang','Positif'].includes(state.tacticalPlan?.mentality)?'selected':''}>Menyerang</option><option ${['Bertahan','Sangat Bertahan'].includes(state.tacticalPlan?.mentality)?'selected':''}>Bertahan</option><option ${['Tinggi','Gegenpress'].includes(state.tacticalPlan?.pressing)?'selected':''}>Pressing Tinggi</option></select><select class="select" id="matchViewSelect" aria-label="Mode visual"><option value="3d" ${mode==='3d'?'selected':''}>3D Low-poly</option><option value="2d" ${mode==='2d'?'selected':''}>2D Ringan</option></select><select class="select" id="qualitySelect" aria-label="Kualitas 3D"><option value="low" ${quality==='low'?'selected':''}>Kualitas Low</option><option value="medium" ${quality==='medium'?'selected':''}>Kualitas Medium</option><option value="high" ${quality==='high'?'selected':''}>Kualitas High</option></select><select class="select" id="cameraSelect" aria-label="Kamera"><option value="broadcast" ${camera==='broadcast'?'selected':''}>Kamera Broadcast</option><option value="sideline" ${camera==='sideline'?'selected':''}>Kamera Pinggir</option><option value="follow" ${camera==='follow'?'selected':''}>Ikuti Bola</option></select></div></div>
      <div class="card"><h2>Komentar Langsung</h2><div class="commentary" id="commentary"><div class="comment-line">Tekan Mulai. Wasit masih cari peluit.</div></div><div class="divider"></div><div class="stat-grid match-stats"><div class="stat-box"><span>Possession</span><strong id="posStat">50-50</strong></div><div class="stat-box"><span>Shots</span><strong id="shotStat">0-0</strong></div><div class="stat-box"><span>On Target</span><strong id="targetStat">0-0</strong></div><div class="stat-box"><span>xG</span><strong id="xgStat">0.00-0.00</strong></div><div class="stat-box"><span>Pass Sukses</span><strong id="passStat">0-0</strong></div><div class="stat-box"><span>Tackles</span><strong id="tackleStat">0-0</strong></div><div class="stat-box"><span>Corners</span><strong id="cornerStat">0-0</strong></div><div class="stat-box"><span>Cards</span><strong id="cardStat">0-0</strong></div></div></div></div>`;
    const engine=new MatchEngine($('#matchCanvas'),home,away); ui.currentMatch=engine; ui.cleanup=()=>engine.destroy();
    $('#startMatchBtn').addEventListener('click',()=>engine.start());
    $('#pauseMatchBtn').addEventListener('click',()=>engine.togglePause());
    $('#speedSelect').addEventListener('change',e=>engine.speed=Number(e.target.value));
    $('#mentalitySelect').addEventListener('change',e=>engine.mentality=e.target.value);
    $('#qualitySelect').addEventListener('change',e=>{state.settings.matchQuality=e.target.value;engine.setQuality(e.target.value);scheduleSave();toast(`Kualitas 3D: ${e.target.value}. Kalau Low masih ngelag, HP lu minta pensiun.`)});
    $('#cameraSelect').addEventListener('change',e=>{state.settings.matchCamera=e.target.value;engine.setCamera(e.target.value);scheduleSave()});
    $('#matchViewSelect').addEventListener('change',e=>{
      state.settings.matchView=e.target.value;scheduleSave();
      engine.destroy();ui.cleanup=null;renderView();
      toast(e.target.value==='3d'?'Mode 3D dinyalakan. Chipset, lakukan tugas negaramu.':'Balik ke 2D ringan. Tidak semua perang harus dimenangkan dengan polygon.');
    });
    if(mode==='3d'&&!webglReady)toast('WebGL tidak tersedia. Otomatis turun ke mode 2D.',true);
  }

  class MatchEngine{
    constructor(canvas,home,away){
      this.canvas=canvas;this.ctx=null;this.renderer3d=null;this.mode=state.settings.matchView||'3d';this.home=home;this.away=away;
      this.running=false;this.paused=false;this.finished=false;this.minute=0;this.speed=1;this.mentality=state.tacticalPlan?.mentality||'Seimbang';
      this.homeScore=0;this.awayScore=0;this.shots=[0,0];this.onTarget=[0,0];this.xg=[0,0];this.cards=[0,0];this.reds=[0,0];
      this.pos=50;this.passes=[0,0];this.completed=[0,0];this.tackles=[0,0];this.corners=[0,0];this.fouls=[0,0];this.saves=[0,0];this.offsides=[0,0];
      this.goalEvents=[];this.lastFrame=0;this.tickTimer=null;this.raf=0;this.bannerTimer=null;this.halfTimeShown=false;this.subsDone=[false,false];this.ball={x:.5,y:.5,tx:.5,ty:.5};
      this.homeXI=this.getXI(home.id);this.awayXI=this.getXI(away.id);this.initRenderer();this.players=this.makePlayers();this.resize();
      this.resizeHandler=()=>this.resize();window.addEventListener('resize',this.resizeHandler,{passive:true});
      this.visibilityHandler=()=>{if(document.hidden){this.paused=true;const b=$('#pauseMatchBtn');if(b)b.textContent='Lanjut'}};document.addEventListener('visibilitychange',this.visibilityHandler);
      this.loop=ts=>this.frame(ts);this.raf=requestAnimationFrame(this.loop);
    }
    getXI(clubId){ensureLineup(state,clubId);const ids=state.lineups[clubId]||[];const selected=ids.map(playerById).filter(Boolean);if(selected.length>=11)return selected.slice(0,11);return clubPlayers(clubId).filter(p=>!p.injury&&!(p.suspension>0)).sort((a,b)=>this.selectionScore(b)-this.selectionScore(a)).slice(0,11)}
    selectionScore(p){return p.overall*.7+p.fitness*.14+p.form*.1+p.morale*.06-(p.injury?80:0)}
    initRenderer(){
      if(this.mode==='3d'&&window.FFU3D?.isSupported?.()){
        try{this.renderer3d=new window.FFU3D.MatchScene(this.canvas,{homeColor:this.home.colors?.[0],awayColor:this.away.colors?.[0],quality:state.settings.matchQuality||'low',camera:state.settings.matchCamera||'broadcast',reducedMotion:state.reducedMotion});return}
        catch(err){console.warn('Renderer 3D gagal, turun ke 2D',err);const replacement=this.canvas.cloneNode(false);this.canvas.replaceWith(replacement);this.canvas=replacement;this.mode='2d'}
      }
      this.mode='2d';this.ctx=this.canvas.getContext('2d',{alpha:false});
    }
    setQuality(value){this.renderer3d?.setQuality(value)} setCamera(value){this.renderer3d?.setCamera(value)}
    makePlayers(){const list=[];const shape=[[.06,.5],[.2,.18],[.2,.38],[.2,.62],[.2,.82],[.36,.28],[.36,.5],[.36,.72],[.52,.22],[.52,.5],[.52,.78]];for(let team=0;team<2;team++){for(let i=0;i<11;i++){const base=shape[i],x=team===0?base[0]:1-base[0];list.push({team,index:i,x,y:base[1],tx:x,ty:base[1],vx:0,vy:0})}}return list}
    resize(){if(this.renderer3d){this.renderer3d.resize();return}const r=this.canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,1.35);const w=Math.max(600,Math.round(r.width*dpr)),h=Math.round(w*9/16);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}}
    start(){if(this.finished){toast('Pertandingan sudah selesai. Lanjut pekan untuk laga baru.');return}if(!this.running){this.running=true;this.paused=false;this.addComment(0,'Kick-off! Kedua tim mulai menjalankan rencana taktik.');this.showBanner('KICK OFF','neutral',900);playSound('whistle');this.scheduleTick()}else{this.paused=false;const b=$('#pauseMatchBtn');if(b)b.textContent='Pause'}}
    togglePause(){if(!this.running)return;this.paused=!this.paused;$('#pauseMatchBtn').textContent=this.paused?'Lanjut':'Pause';this.addComment(this.minute,this.paused?'Pertandingan dijeda. Instruksi taktik bisa diubah.':'Pertandingan dilanjutkan.');this.showBanner(this.paused?'PAUSED':'LANJUT','neutral',650)}
    scheduleTick(){clearTimeout(this.tickTimer);if(this.finished)return;this.tickTimer=setTimeout(()=>{if(!this.paused)this.eventTick();this.scheduleTick()},Math.max(260,980/this.speed))}
    eventTick(){
      const step=randFrom(`${this.minute}-${performance.now().toFixed(0)}`,1,3);this.minute=Math.min(90,this.minute+step);
      if(this.minute>=45&&!this.halfTimeShown){this.halfTimeShown=true;this.addComment(45,`Babak pertama selesai sementara: ${this.homeScore}-${this.awayScore}.`);this.showBanner('HALF TIME','neutral',1100);playSound('whistle')}
      this.updateTargets();this.generateEvent();if(this.minute>=60)this.autoSubstitute(0);if(this.minute>=65)this.autoSubstitute(1);this.updateUI();if(this.minute>=90)this.finish();
    }
    lineup(team){return team===0?this.homeXI:this.awayXI}
    metrics(team){
      const ps=this.lineup(team);const avg=k=>ps.reduce((s,p)=>s+(p.attributes?.[k]||p.overall),0)/Math.max(1,ps.length);const morale=ps.reduce((s,p)=>s+(p.morale||70),0)/Math.max(1,ps.length);const fit=ps.reduce((s,p)=>s+(p.fitness||80),0)/Math.max(1,ps.length);
      return {attack:avg('shooting')*.28+avg('passing')*.2+avg('dribbling')*.18+avg('pace')*.12+avg('composure')*.12+morale*.05+fit*.05,defense:avg('defending')*.32+avg('tackling')*.23+avg('physical')*.17+avg('stamina')*.1+morale*.08+fit*.1,passing:avg('passing')*.48+avg('vision')*.28+avg('composure')*.12+morale*.06+fit*.06,keeper:(ps.find(p=>p.position==='GK')?.attributes?.goalkeeping||65),fitness:fit,morale};
    }
    tacticalMods(){return window.FFU4?.matchModifiers?.(this.home,this.away,this.mentality)||{homeAttack:0,homeDefense:0,homeStamina:0,risk:12}}
    updateTargets(){
      const homePoss=this.pos/100;const direction=Math.random()<homePoss?1:-1;const progress=.18+Math.random()*.68;this.ball.tx=direction===1?progress:1-progress;this.ball.ty=.08+Math.random()*.84;
      for(const p of this.players){const dir=p.team===0?1:-1,idx=p.index;const line=idx===0?.07:idx<=4?.22:idx<=7?.42:.62;const baseX=p.team===0?line:1-line;const lanes=[.5,.16,.36,.64,.84,.2,.5,.8,.18,.5,.82];const chase=Math.max(0,.22-Math.abs((lanes[idx]||.5)-this.ball.y));p.tx=clamp(baseX+dir*(this.ball.x-.5)*.28+(Math.random()-.5)*.055+chase*dir,.04,.96);p.ty=clamp((lanes[idx]||.5)+(this.ball.y-.5)*.18+(Math.random()-.5)*.065,.05,.95)}
    }
    chooseTeam(){const hm=this.metrics(0),am=this.metrics(1),mods=this.tacticalMods();const homeControl=hm.passing+hm.attack*.35+mods.homeAttack*.8+((state.lockerRoom?.cohesion||70)-70)*.12;const awayControl=am.passing+am.attack*.35;const chance=clamp(50+(homeControl-awayControl)*.42,28,72);this.pos=Math.round(this.pos*.72+chance*.28+(Math.random()-.5)*3);return Math.random()*100<this.pos?0:1}
    generateEvent(){
      const team=this.chooseTeam(),opp=1-team,atk=this.metrics(team),def=this.metrics(opp),mods=this.tacticalMods();const attackMod=team===0?mods.homeAttack:0,defMod=opp===0?mods.homeDefense:0;
      const passVolume=Math.round(4+(atk.passing/20)+Math.random()*5);this.passes[team]+=passVolume;const passRate=clamp(65+(atk.passing-def.defense)*.22+(team===0?(state.lockerRoom?.cohesion-70)*.12:0),58,94);this.completed[team]+=Math.round(passVolume*passRate/100);
      const roll=Math.random();
      if(roll<.145){this.createShot(team,atk,def,attackMod,defMod)}
      else if(roll<.205){this.corners[team]++;this.addComment(this.minute,`${team===0?this.home.name:this.away.name} mendapat sepak pojok setelah serangan dari sisi lapangan.`);this.playVisualEvent('corner',team,'SEPAK POJOK')}
      else if(roll<.275){this.fouls[team]++;const severe=Math.random()<.2+(mods.risk||12)/120;if(severe){this.cards[team]++;const red=Math.random()<.055;if(red)this.reds[team]++;this.addComment(this.minute,`${red?'KARTU MERAH!':'Kartu kuning'} setelah tekel terlambat.`, 'cardline');this.playVisualEvent('card',team,red?'KARTU MERAH':'KARTU KUNING');playSound('card')}else this.addComment(this.minute,'Pelanggaran di tengah lapangan. Wasit hanya memberi peringatan.')}
      else if(roll<.325){this.offsides[team]++;this.addComment(this.minute,`${this.pickAttacker(team)?.name||'Penyerang'} terjebak offside saat mencoba menusuk garis tinggi.`)}
      else if(roll<.405){this.tackles[opp]++;const tackler=this.pickDefender(opp);this.addComment(this.minute,`${tackler?.name||'Bek'} membaca serangan dan melakukan tekel bersih.`);this.playVisualEvent('tackle',opp,'TEKEL BERSIH')}
      else if(roll<.485){const p=this.pickAttacker(team);this.addComment(this.minute,`${p?.name||'Pemain'} memimpin transisi cepat, tetapi umpan terakhir dipotong.`);this.playVisualEvent('counter',team,'SERANGAN BALIK')}
      else if(roll<.56){const p=this.pickCreator(team);this.addComment(this.minute,`${p?.name||'Gelandang'} mengontrol tempo dengan kombinasi umpan pendek.`)}
      else if(roll<.585&&this.minute>15){this.possibleInjury(team)}
      else if(roll<.64){this.addComment(this.minute,`Kiper ${team===0?this.away.name:this.home.name} keluar menangkap umpan silang dengan aman.`)}
    }
    createShot(team,atk,def,attackMod,defMod){
      const shooter=this.pickAttacker(team),shooting=(shooter?.attributes?.finishing||shooter?.attributes?.shooting||70);const pressure=def.defense+defMod;const quality=clamp(.035+(shooting-pressure*.45+attackMod)*.0045+Math.random()*.23,.025,.48);this.shots[team]++;this.xg[team]+=quality;shooter.advancedStats ||= {shots:0,keyPasses:0,tackles:0,passes:0,passPct:0,xG:0,xA:0};shooter.advancedStats.shots++;shooter.advancedStats.xG+=quality;
      const blocked=Math.random()<clamp((pressure-shooting)*.006+.16,.08,.31);if(blocked){this.tackles[1-team]++;this.addComment(this.minute,`Tembakan ${shooter?.name||'penyerang'} diblok bek di area berbahaya.`);this.playVisualEvent('tackle',1-team,'BLOCK!');return}
      this.onTarget[team]++;const keeper=def.keeper;const goalChance=clamp(quality*(1.25+(shooting-keeper)*.012),.025,.68);
      if(Math.random()<goalChance){team===0?this.homeScore++:this.awayScore++;const creator=this.pickCreator(team,shooter?.id);this.goalEvents.push({team,scorerId:shooter?.id,assistId:creator?.id,minute:this.minute});this.addComment(this.minute,`GOOOL! ${shooter?.name||'Penyerang'} menuntaskan peluang${creator?` dari umpan ${creator.name}`:''}.`,'goal');this.playVisualEvent('goal',team,`GOOOL • ${shooter?.name||'PENYERANG'}`);playSound('goal')}
      else {this.saves[1-team]++;this.addComment(this.minute,`Penyelamatan! Kiper menahan tembakan ${shooter?.name||'penyerang'}.`);this.playVisualEvent('save',1-team,'PENYELAMATAN!');playSound('whistle')}
    }
    possibleInjury(team){const ps=this.lineup(team).filter(p=>!p.injury);if(!ps.length)return;const p=ps[randFrom(`${team}-${this.minute}-inj`,0,ps.length-1)],risk=clamp((100-p.fitness)*.35+(state.training?.intensity==='Ekstrem'?9:0),2,28);if(Math.random()*100>risk)return;const weeks=randFrom(p.id+this.minute,1,5);p.injury={type:['Cedera hamstring','Benturan lutut','Masalah pergelangan kaki','Cedera otot'][randFrom(p.id+'it'+this.minute,0,3)],weeks};p.fitness=clamp(p.fitness-20,20,100);state.injuries ||= [];state.injuries.push({playerId:p.id,type:p.injury.type,weeks});this.addComment(this.minute,`${p.name} tidak bisa melanjutkan pertandingan karena ${p.injury.type.toLowerCase()}.`,'cardline');this.showBanner('CEDERA','card',900)}
    autoSubstitute(team){if(this.subsDone[team])return;this.subsDone[team]=true;const xi=this.lineup(team),clubId=team===0?this.home.id:this.away.id,bench=clubPlayers(clubId).filter(p=>!xi.some(x=>x.id===p.id)&&!p.injury).sort((a,b)=>this.selectionScore(b)-this.selectionScore(a));if(!bench.length)return;const out=xi.slice().sort((a,b)=>a.fitness-b.fitness)[0],incoming=bench[0],idx=xi.indexOf(out);xi[idx]=incoming;this.addComment(this.minute,`${incoming.name} masuk menggantikan ${out.name}. Pergantian untuk menjaga intensitas.`);this.showBanner('PERGANTIAN','neutral',700)}
    playVisualEvent(type,team,label){this.renderer3d?.playEvent(type,team);this.showBanner(label,type,type==='goal'?1800:900)}
    showBanner(text,type='neutral',duration=900){const el=$('#matchEventBanner');if(!el)return;clearTimeout(this.bannerTimer);el.textContent=text;el.className=`match-event-banner show ${type}`;this.bannerTimer=setTimeout(()=>{if(el)el.className='match-event-banner'},duration)}
    pickAttacker(team){const ps=this.lineup(team).filter(p=>['ST','CF','LW','RW','AM'].includes(p.position)).sort((a,b)=>(b.attributes?.finishing||b.overall)-(a.attributes?.finishing||a.overall));return ps[randFrom(`${this.minute}${team}atk`,0,Math.max(0,ps.length-1))]||this.lineup(team)[8]}
    pickCreator(team,exclude){const ps=this.lineup(team).filter(p=>p.id!==exclude).sort((a,b)=>(b.attributes?.vision||b.overall)-(a.attributes?.vision||a.overall));return ps[randFrom(`${this.minute}${team}create`,0,Math.min(4,Math.max(0,ps.length-1)))]}
    pickDefender(team){const ps=this.lineup(team).filter(p=>['CB','RB','LB','DM','RWB','LWB'].includes(p.position)).sort((a,b)=>(b.attributes?.tackling||b.overall)-(a.attributes?.tackling||a.overall));return ps[0]||this.lineup(team)[1]}
    addComment(min,text,cls=''){const box=$('#commentary');if(!box)return;const d=document.createElement('div');d.className=`comment-line ${cls}`;d.innerHTML=`<span class="minute">${min}'</span>${escapeHtml(text)}`;box.prepend(d);while(box.children.length>70)box.removeChild(box.lastChild)}
    updateUI(){if(!$('#matchMinute'))return;$('#homeScore').textContent=this.homeScore;$('#awayScore').textContent=this.awayScore;$('#matchMinute').textContent=`Menit ${this.minute}`;$('#posStat').textContent=`${this.pos}-${100-this.pos}`;$('#shotStat').textContent=`${this.shots[0]}-${this.shots[1]}`;$('#targetStat').textContent=`${this.onTarget[0]}-${this.onTarget[1]}`;$('#xgStat').textContent=`${this.xg[0].toFixed(2)}-${this.xg[1].toFixed(2)}`;$('#passStat').textContent=`${this.completed[0]}-${this.completed[1]}`;$('#tackleStat').textContent=`${this.tackles[0]}-${this.tackles[1]}`;$('#cornerStat').textContent=`${this.corners[0]}-${this.corners[1]}`;$('#cardStat').textContent=`${this.cards[0]}-${this.cards[1]}`}
    finish(){
      if(this.finished)return;this.finished=true;this.running=false;clearTimeout(this.tickTimer);this.addComment(90,`Full time: ${this.home.name} ${this.homeScore}-${this.awayScore} ${this.away.name}.`,'goal');this.showBanner('FULL TIME','neutral',1800);playSound('whistle');
      const result={date:state.date,home:this.home.name,away:this.away.name,homeScore:this.homeScore,awayScore:this.awayScore,score:`${this.homeScore}-${this.awayScore}`,stats:{pos:[this.pos,100-this.pos],shots:this.shots,onTarget:this.onTarget,xg:this.xg,passes:this.passes,tackles:this.tackles,corners:this.corners,cards:this.cards}};
      state.matchHistory.unshift(result);updateStandingResult(this.home.id,this.away.id,this.homeScore,this.awayScore);this.updatePlayerRecords();state.news.unshift({title:`${this.home.name} ${this.homeScore}-${this.awayScore} ${this.away.name}`,meta:'Hasil pertandingan • Baru saja'});window.FFU4?.onMatchFinished?.(result);scheduleSave();toast('Pertandingan selesai. Statistik, morale, direksi, dan analytics sudah diperbarui.')
    }
    updatePlayerRecords(){
      const mods=this.tacticalMods();for(let team=0;team<2;team++){const xi=this.lineup(team),won=team===0?this.homeScore>this.awayScore:this.awayScore>this.homeScore,draw=this.homeScore===this.awayScore;for(const p of xi){p.stats ||= {apps:0,goals:0,assists:0,rating:0};p.advancedStats ||= {shots:0,keyPasses:0,tackles:0,passes:0,passPct:0,xG:0,xA:0};p.stats.apps++;const base=6.25+(won?.45:draw?.05:-.25)+(p.form-70)*.012+(Math.random()-.5)*.7;const goals=this.goalEvents.filter(e=>e.scorerId===p.id).length,assists=this.goalEvents.filter(e=>e.assistId===p.id).length;p.stats.goals+=goals;p.stats.assists+=assists;const rating=clamp(base+goals*.85+assists*.45,4.5,10);p.stats.rating=Number(((p.stats.rating*(p.stats.apps-1)+rating)/p.stats.apps).toFixed(2));p.advancedStats.passes+=Math.round(this.passes[team]/Math.max(1,xi.length));p.advancedStats.passPct=Math.round(this.completed[team]/Math.max(1,this.passes[team])*100);p.advancedStats.tackles+=Math.round(this.tackles[team]/Math.max(1,xi.length));p.advancedStats.xA+=assists*.22;p.fitness=clamp(p.fitness-(team===0?8-Math.min(3,mods.homeStamina||0):7)-randFrom(p.id+this.minute,0,4),35,100);p.form=clamp(p.form+(won?3:draw?0:-2)+goals*2+assists,45,99)}}
    }
    frame(ts){const targetFps=state.reducedMotion?20:(state.settings.matchFps||30);if(ts-this.lastFrame>=1000/targetFps){this.lastFrame=ts;const dt=.052*Math.min(2.2,this.speed);if(this.running&&!this.paused){this.ball.x+=(this.ball.tx-this.ball.x)*dt*1.85;this.ball.y+=(this.ball.ty-this.ball.y)*dt*1.85;for(const p of this.players){p.x+=(p.tx-p.x)*dt;p.y+=(p.ty-p.y)*dt}}this.draw(ts)}this.raf=requestAnimationFrame(this.loop)}
    draw(ts=performance.now()){
      if(this.renderer3d){this.renderer3d.render(this.players,this.ball,ts);return}const c=this.ctx,w=this.canvas.width,h=this.canvas.height;if(!c)return;c.fillStyle='#176534';c.fillRect(0,0,w,h);c.fillStyle='rgba(255,255,255,.025)';for(let i=0;i<8;i+=2)c.fillRect(i*w/8,0,w/8,h);c.strokeStyle='rgba(255,255,255,.68)';c.lineWidth=Math.max(2,w/420);c.strokeRect(w*.025,h*.04,w*.95,h*.92);c.beginPath();c.moveTo(w/2,h*.04);c.lineTo(w/2,h*.96);c.stroke();c.beginPath();c.arc(w/2,h/2,h*.14,0,Math.PI*2);c.stroke();c.strokeRect(w*.025,h*.28,w*.13,h*.44);c.strokeRect(w*.845,h*.28,w*.13,h*.44);const colors=[this.home.colors?.[0]||'#ef4444',this.away.colors?.[0]||'#38bdf8'];for(const p of this.players){const x=p.x*w,y=p.y*h,s=Math.max(8,w/90),dir=Math.sign(p.tx-p.x)||1;c.save();c.translate(x,y);c.scale(dir,1);c.globalAlpha=.22;c.fillStyle='#000';c.beginPath();c.ellipse(0,s*.95,s*.78,s*.28,0,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle='#f8fafc';c.lineWidth=Math.max(1,w/720);const run=Math.sin(ts*.012+p.index)*s*.24;c.beginPath();c.moveTo(-s*.22,s*.38);c.lineTo(-s*.42+run,s*1.02);c.moveTo(s*.22,s*.38);c.lineTo(s*.42-run,s*1.02);c.stroke();c.fillStyle=colors[p.team];c.beginPath();c.roundRect(-s*.62,-s*.34,s*1.24,s,Math.max(2,s*.25));c.fill();c.stroke();c.fillStyle=['#c98d63','#8b5e3b','#e0aa7a'][p.index%3];c.beginPath();c.arc(0,-s*.72,s*.36,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font=`bold ${Math.max(7,w/120)}px sans-serif`;c.textAlign='center';c.fillText(String(p.index+1),0,s*.25);c.restore()}const bx=this.ball.x*w,by=this.ball.y*h;c.fillStyle='#fff';c.strokeStyle='#111';c.beginPath();c.arc(bx,by,Math.max(4,w/190),0,Math.PI*2);c.fill();c.stroke()}
    destroy(){clearTimeout(this.tickTimer);clearTimeout(this.bannerTimer);cancelAnimationFrame(this.raf);this.renderer3d?.destroy();window.removeEventListener('resize',this.resizeHandler);document.removeEventListener('visibilitychange',this.visibilityHandler)}
  }


  function updateStandingResult(homeId,awayId,hg,ag){
    const league=clubById(homeId)?.league;const table=state.standings[league];if(!table)return;const h=table.find(x=>x.clubId===homeId),a=table.find(x=>x.clubId===awayId);if(!h||!a)return;
    for(const row of [h,a])row.p++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;h.gd=h.gf-h.ga;a.gd=a.gf-a.ga;
    if(hg>ag){h.w++;a.l++;h.pts+=3}else if(hg<ag){a.w++;h.l++;a.pts+=3}else{h.d++;a.d++;h.pts++;a.pts++}
    table.sort((x,y)=>y.pts-x.pts||y.gd-x.gd||y.gf-x.gf);
  }

  function renderTransfers(view){
    const players=state.players.filter(p=>p.clubId!==state.selectedClubId && (ui.transferPos==='ALL'||p.position===ui.transferPos)&&p.name.toLowerCase().includes(ui.transferQuery.toLowerCase())).sort((a,b)=>b.overall-a.overall);
    const pageSize=25,pages=Math.max(1,Math.ceil(players.length/pageSize));ui.transferPage=Math.min(ui.transferPage,pages);const rows=players.slice((ui.transferPage-1)*pageSize,ui.transferPage*pageSize);
    const positions=['ALL',...new Set(state.players.map(p=>p.position))];
    view.innerHTML=pageHead('Bursa Transfer',`${players.length} target tersedia • foto baru dimuat saat negosiasi supaya nggak ngehang`)+`<div class="card"><div class="toolbar"><input class="input" id="transferSearch" value="${escapeHtml(ui.transferQuery)}" placeholder="Cari nama pemain..."><select class="select" id="transferPos">${positions.map(x=>`<option ${x===ui.transferPos?'selected':''}>${x}</option>`).join('')}</select></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Pemain</th><th>Klub</th><th>Pos</th><th>OVR</th><th>Usia</th><th>Nilai</th><th>Aksi</th></tr></thead><tbody>${rows.map(p=>`<tr><td class="click-row" data-player-id="${p.id}"><div class="player-cell">${playerAvatar(p)}<div><strong>${escapeHtml(p.name)}</strong><div class="muted">${escapeHtml(p.nationality)}</div></div></div></td><td>${escapeHtml(p.club)}</td><td><span class="pos">${p.position}</span></td><td class="rating">${p.overall}</td><td>${p.age}</td><td>${fmtMoney(p.value)}</td><td><button class="primary-btn" data-negotiate="${p.id}">Nego</button></td></tr>`).join('')}</tbody></table></div>${pagination('transfer',ui.transferPage,pages)}</div>`;
    $('#transferSearch').addEventListener('input',debounce(e=>{ui.transferQuery=e.target.value;ui.transferPage=1;renderView()},180));
    $('#transferPos').addEventListener('change',e=>{ui.transferPos=e.target.value;ui.transferPage=1;renderView()});
  }

  function openNegotiation(p){
    const agentSeed=encodeURIComponent(p.agentName||p.name+' agent');
    const body=`<h2>Negosiasi Kontrak</h2><p class="card-sub">Klub, agen, gaji, bonus, durasi, dan role. Iya, manusia dewasa memang butuh lima kolom untuk bilang “mau duit berapa”.</p><div class="negotiation-hero" style="margin:18px 0"><div class="negotiation-person"><img id="negoPlayerPhoto" src="${avatarFallback(p.name)}" alt="${escapeHtml(p.name)}"><strong>${escapeHtml(p.name)}</strong><span>${p.position} • OVR ${p.overall}</span></div><div class="negotiation-vs">🤝</div><div class="negotiation-person"><img src="${avatarFallback(p.agentName||p.name+' agent','agent')}" alt="Agen"><strong>${escapeHtml(p.agentName)}</strong><span>Agen pemain</span></div></div>
      <div id="agentQuote" class="quote">“Klien saya tertarik, tetapi proposal harus mencerminkan kualitas dan ambisinya.”</div>
      <div class="form-grid"><label class="label">Biaya transfer<input class="input" id="offerFee" type="number" value="${Math.round(p.value*1.05)}"></label><label class="label">Cicilan<select class="select" id="offerInstallments"><option value="1">Lunas</option><option value="2">2 kali</option><option value="3" selected>3 kali</option><option value="4">4 kali</option></select></label><label class="label">Gaji per bulan<input class="input" id="offerWage" type="number" value="${Math.round(p.wage*1.2)}"></label><label class="label">Bonus tanda tangan<input class="input" id="offerBonus" type="number" value="${Math.round(p.wage*3)}"></label><label class="label">Biaya agen<input class="input" id="offerAgentFee" type="number" value="${Math.round(p.wage*2.5)}"></label><label class="label">Klausul rilis<input class="input" id="offerRelease" type="number" value="${Math.round(p.value*2.2)}"></label><label class="label">Sell-on clause<select class="select" id="offerSellOn"><option value="0">0%</option><option value="5">5%</option><option value="10" selected>10%</option><option value="15">15%</option><option value="20">20%</option></select></label><label class="label">Durasi kontrak<select class="select" id="offerYears"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option></select></label><label class="label wide">Peran skuad<select class="select" id="offerRole"><option>Rotasi</option><option>Pemain Reguler</option><option selected>Pemain Inti</option><option>Bintang Tim</option></select></label><label class="label wide">Janji kontrak<select class="select" id="offerPromise"><option>Tidak ada</option><option>Starter jika fit</option><option>Tim dibangun mengelilinginya</option><option>Diizinkan pergi jika gagal lolos kompetisi benua</option></select></label></div>
      <div class="divider"></div><div class="offer-meter"><i id="offerMeter"></i></div><p class="card-sub" id="offerHint">Peluang kesepakatan dihitung dari nilai, gaji, reputasi klub, role, dan usia.</p><div class="toolbar" style="justify-content:flex-end;margin-top:14px"><button class="ghost-btn" data-close-modal>Batal</button><button class="primary-btn" id="submitOffer">Ajukan Penawaran</button></div>`;
    openModal(body);
    resolvePlayerPhoto(p).then(url=>{const img=$('#negoPlayerPhoto');if(img&&url)img.src=url});
    const inputs=['offerFee','offerInstallments','offerWage','offerBonus','offerAgentFee','offerRelease','offerSellOn','offerYears','offerRole','offerPromise'].map(id=>$('#'+id));
    const calc=()=>{const s=offerScore(p);$('#offerMeter').style.width=`${s}%`;$('#offerHint').textContent=s>=78?'Agen sangat tertarik.':s>=58?'Proposal cukup masuk akal.':s>=40?'Agen minta peningkatan.':'Proposal rawan dilempar balik ke muka lu.'};
    inputs.forEach(x=>x.addEventListener('input',calc));calc();
    $('#submitOffer').addEventListener('click',()=>submitOffer(p));
  }
  function offerScore(p){
    const fee=Number($('#offerFee')?.value||0),installments=Number($('#offerInstallments')?.value||1),wage=Number($('#offerWage')?.value||0),bonus=Number($('#offerBonus')?.value||0),agentFee=Number($('#offerAgentFee')?.value||0),release=Number($('#offerRelease')?.value||0),sellOn=Number($('#offerSellOn')?.value||0),years=Number($('#offerYears')?.value||1),role=$('#offerRole')?.value||'Rotasi',promise=$('#offerPromise')?.value||'Tidak ada';
    const roleScore={'Rotasi':-12,'Pemain Reguler':0,'Pemain Inti':8,'Bintang Tim':14}[role]||0;
    const promiseScore={'Tidak ada':0,'Starter jika fit':4,'Tim dibangun mengelilinginya':8,'Diizinkan pergi jika gagal lolos kompetisi benua':3}[promise]||0;
    const repDiff=(currentClub().reputation-(clubById(p.clubId)?.reputation||70))*.7;
    const clubTerms=(fee/Math.max(1,p.value))*18-sellOn*.25-(installments-1)*1.7;
    const playerTerms=(wage/Math.max(1,p.wage))*21+(bonus/Math.max(1,p.wage))*1.8+(agentFee/Math.max(1,p.wage))*1.4+Math.min(6,release/Math.max(1,p.value)*1.5);
    return Math.round(Math.max(5,Math.min(98,25+clubTerms+playerTerms+years*2+roleScore+promiseScore+repDiff-(p.overall-75)*.3)));
  }
  async function submitOffer(p){
    const score=offerScore(p),btn=$('#submitOffer');btn.disabled=true;btn.textContent='Agen mempertimbangkan...';playSound('click');await sleep(650);
    const roll=randFrom(p.id+Date.now(),1,100);const fee=Number($('#offerFee').value),installments=Number($('#offerInstallments').value),wage=Number($('#offerWage').value),bonus=Number($('#offerBonus').value),agentFee=Number($('#offerAgentFee').value),release=Number($('#offerRelease').value),sellOn=Number($('#offerSellOn').value),years=Number($('#offerYears').value),role=$('#offerRole').value,promise=$('#offerPromise').value;
    if(score>=74 || roll<score){
      const upfront=Math.ceil(fee/installments)+bonus+agentFee;if(clubFunds()<upfront){$('#agentQuote').textContent='“Kesepakatan cocok, tetapi dana pembayaran awal klub Anda tidak cukup.”';btn.disabled=false;btn.textContent='Ajukan Penawaran';toast('Saldo buat pembayaran awal kurang. Dompet kena kartu merah.',true);return}
      const oldClub=p.club;updateFunds(-upfront);p.clubId=state.selectedClubId;p.club=currentClub().name;p.league=currentClub().league;p.country=currentClub().country;p.wage=wage;p.contractYears=years;p.releaseClause=release;p.sellOnClause=sellOn;p.squadRole=role;p.promises ||= [];if(promise!=='Tidak ada')p.promises.push({text:promise,week:state.week,status:'Aktif'});p.morale=Math.min(100,p.morale+8);p.happiness=Math.min(100,(p.happiness||p.morale)+8);state.transferObligations ||= [];if(installments>1)state.transferObligations.push({id:cryptoId(),playerId:p.id,total:fee-upfront+bonus+agentFee,remaining:installments-1,payment:Math.floor(fee/installments),nextWeek:state.week+4});state.transactions.unshift({id:cryptoId(),date:state.date,type:`Transfer ${p.name} • pembayaran awal`,amount:-upfront},{id:cryptoId(),date:state.date,type:`Biaya agen ${p.name}`,amount:-agentFee});state.news.unshift({title:`${p.name} resmi bergabung dengan ${currentClub().name}`,meta:`Transfer • ${installments} pembayaran • Baru saja`});ensureLineup(state,state.selectedClubId);scheduleSave();playSound('goal');closeModal();toast(`${p.name} resmi datang dari ${oldClub}. Kontrak ${years} tahun.`);renderView();
    }else if(score>=42){$('#agentQuote').textContent='“Kami belum menerima, tapi bisa lanjut jika gaji atau bonus dinaikkan.”';$('#offerWage').value=Math.round(wage*1.1);$('#offerBonus').value=Math.round(bonus*1.15);btn.disabled=false;btn.textContent='Ajukan Penawaran Ulang';$('#offerMeter').style.width=`${offerScore(p)}%`;playSound('card')}
    else{$('#agentQuote').textContent='“Proposal ini tidak serius. Klien saya memilih menghentikan pembicaraan.”';btn.disabled=false;btn.textContent='Coba Lagi';playSound('card')}
  }

  function renderScouting(view){
    const players=state.players.filter(p=>p.clubId!==state.selectedClubId && p.name.toLowerCase().includes(ui.scoutQuery.toLowerCase())).sort((a,b)=>(a.scouted-b.scouted)||b.potential-a.potential);
    const pageSize=24,pages=Math.max(1,Math.ceil(players.length/pageSize));ui.scoutPage=Math.min(ui.scoutPage,pages);const rows=players.slice((ui.scoutPage-1)*pageSize,ui.scoutPage*pageSize);
    view.innerHTML=pageHead('Pusat Scouting','Potensi asli disembunyikan sampai laporan selesai. Jadi scout akhirnya punya pekerjaan, bukan pajangan berjas.')+`<div class="card"><div class="toolbar"><input class="input" id="scoutSearch" value="${escapeHtml(ui.scoutQuery)}" placeholder="Cari target scouting..."></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Pemain</th><th>Usia</th><th>Pos</th><th>OVR</th><th>Potensi</th><th>Biaya Scout</th><th></th></tr></thead><tbody>${rows.map(p=>`<tr class="click-row"><td data-player-id="${p.id}"><div class="player-cell">${playerAvatar(p)}<div><strong>${escapeHtml(p.name)}</strong><div class="muted">${escapeHtml(p.club)} • ${escapeHtml(p.nationality)}</div></div></div></td><td>${p.age}</td><td><span class="pos">${p.position}</span></td><td>${p.overall}</td><td>${p.scouted?`<span class="tag">${p.potential} • ${potentialLabel(p.potential)}</span>`:'<span class="tag warn">Belum diketahui</span>'}</td><td>${fmtMoney(25_000_000+p.overall*1_500_000)}</td><td>${p.scouted?'<button class="ghost-btn" data-player-id="'+p.id+'">Lihat</button>':'<button class="primary-btn" data-scout="'+p.id+'">Scout</button>'}</td></tr>`).join('')}</tbody></table></div>${pagination('scout',ui.scoutPage,pages)}</div>`;
    $('#scoutSearch').addEventListener('input',debounce(e=>{ui.scoutQuery=e.target.value;ui.scoutPage=1;renderView()},180));
  }
  function scoutPlayer(p){const cost=25_000_000+p.overall*1_500_000;if(clubFunds()<cost)return toast('Saldo scouting kurang.',true);updateFunds(-cost);p.scouted=true;state.transactions.unshift({id:cryptoId(),date:state.date,type:`Laporan scout: ${p.name}`,amount:-cost});scheduleSave();playSound('click');toast(`Laporan ${p.name}: ${potentialLabel(p.potential)}.`);closeModal();renderView()}

  function renderCompetition(view){
    const leagues=['BRI Super League','Premier League','La Liga'];const current=state.competitionTab||currentClub().league;const table=state.standings[current]||[];
    view.innerHTML=pageHead('Kompetisi','Liga Indonesia disimulasikan penuh; Inggris dan Spanyol berjalan sebagai dunia pendukung.')+`<div class="toolbar">${leagues.map(l=>`<button class="${l===current?'primary-btn':'ghost-btn'}" data-league-tab="${l}">${l}</button>`).join('')}</div><div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Klub</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr></thead><tbody>${table.map((r,i)=>`<tr ${r.clubId===state.selectedClubId?'style="background:#173123"':''}><td>${i+1}</td><td><strong>${escapeHtml(r.club)}</strong></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd}</td><td class="rating">${r.pts}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  function renderFinance(view){
    const income=state.transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0),expense=Math.abs(state.transactions.filter(t=>t.amount<0).reduce((s,t)=>s+t.amount,0));
    view.innerHTML=pageHead('Keuangan Klub','Gaji, sponsor, tiket, merchandise, hak siar, transfer. Semuanya rupiah, karena konversi mata uang adalah penderitaan tambahan.')+`<div class="grid kpi">${kpi('Saldo',fmtMoney(clubFunds()),'Kas tersedia')}${kpi('Total Pemasukan',fmtMoney(income),'Musim berjalan')}${kpi('Total Pengeluaran',fmtMoney(expense),'Musim berjalan')}${kpi('Proyeksi Bulanan',fmtMoney((income-expense)/Math.max(1,state.week)),'Rata-rata per pekan')}</div><div class="grid two" style="margin-top:15px"><div class="card"><h2>Transaksi Terakhir</h2><div class="finance-list">${state.transactions.slice(0,20).map(t=>`<div class="finance-row"><div><strong>${escapeHtml(t.type)}</strong><div class="muted">${escapeHtml(t.date)}</div></div><strong class="${t.amount>=0?'positive':'negative'}">${t.amount>=0?'+':''}${fmtFullMoney(t.amount)}</strong></div>`).join('')}</div></div><div class="card"><h2>Sumber Pendapatan</h2>${financeMeter('Sponsor',72)}${financeMeter('Hak siar',60)}${financeMeter('Tiket',48)}${financeMeter('Merchandise',35)}<div class="divider"></div><h3>Pengeluaran</h3>${financeMeter('Gaji pemain dan staf',78)}${financeMeter('Transfer dan agen',56)}${financeMeter('Operasional stadion',34)}</div></div>`;
  }
  function financeMeter(name,val){return `<div style="margin:12px 0"><div class="finance-row" style="padding:0 0 6px"><span>${name}</span><strong>${val}%</strong></div>${bar(val)}</div>`}

  function renderAdmin(view){
    const tabs=[['players','Pemain'],['clubs','Klub'],['database','Database & Save']];
    view.innerHTML=pageHead('Admin Database','Akses lokal tanpa login, karena yang main cuma lu. Tetap ada reset supaya eksperimen goblok bisa dibatalkan.')+`<div class="toolbar">${tabs.map(([id,l])=>`<button class="${ui.adminTab===id?'primary-btn':'ghost-btn'}" data-admin-tab="${id}">${l}</button>`).join('')}</div><div id="adminContent"></div>`;
    renderAdminContent();
  }
  function renderAdminContent(){
    const root=$('#adminContent');if(!root)return;
    if(ui.adminTab==='players'){
      const all=state.players.filter(p=>p.name.toLowerCase().includes(ui.adminQuery.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name));const ps=30,pages=Math.max(1,Math.ceil(all.length/ps));ui.adminPage=Math.min(ui.adminPage,pages);const rows=all.slice((ui.adminPage-1)*ps,ui.adminPage*ps);
      root.innerHTML=`<div class="card"><div class="toolbar"><input class="input" id="adminSearch" value="${escapeHtml(ui.adminQuery)}" placeholder="Cari pemain untuk diedit..."><button class="primary-btn" id="addPlayerBtn">+ Tambah Pemain</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Nama</th><th>Negara</th><th>Klub</th><th>Pos</th><th>OVR/POT</th><th>Aksi</th></tr></thead><tbody>${rows.map(p=>`<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.nationality)}</td><td>${escapeHtml(p.club)}</td><td>${p.position}</td><td>${p.overall}/${p.potential}</td><td><button class="ghost-btn" data-admin-edit="${p.id}">Edit</button> <button class="danger-btn" data-delete-player="${p.id}">Hapus</button></td></tr>`).join('')}</tbody></table></div>${pagination('admin',ui.adminPage,pages)}</div>`;
      $('#adminSearch').addEventListener('input',debounce(e=>{ui.adminQuery=e.target.value;ui.adminPage=1;renderAdminContent()},180));$('#addPlayerBtn').addEventListener('click',()=>openPlayerEditor());
    }else if(ui.adminTab==='clubs'){
      root.innerHTML=`<div class="card"><div class="toolbar"><button class="primary-btn" id="addClubBtn">+ Tambah Klub</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Klub</th><th>Negara</th><th>Liga</th><th>Kekuatan</th><th>Dana</th><th>Aksi</th></tr></thead><tbody>${state.clubs.map(c=>`<tr><td><strong>${escapeHtml(c.name)}</strong></td><td>${escapeHtml(c.country)}</td><td>${escapeHtml(c.league)}</td><td>${c.strength}</td><td>${fmtMoney(clubFunds(c.id))}</td><td><button class="ghost-btn" data-edit-club="${c.id}">Edit</button> <button class="danger-btn" data-delete-club="${c.id}" ${c.id===state.selectedClubId?'disabled':''}>Hapus</button></td></tr>`).join('')}</tbody></table></div></div>`;$('#addClubBtn').addEventListener('click',()=>openClubEditor());
    }else{
      root.innerHTML=`<div class="grid two"><div class="card"><h2>Save Slots</h2>${Array.from({length:SAVE_SLOTS},(_,i)=>i+1).map(slot=>{const s=loadSlot(slot);return `<div class="finance-row"><div><strong>Slot ${slot}${slot===activeSlot?' • Aktif':''}</strong><div class="muted">${s?`${escapeHtml(s.managerName)} • Pekan ${s.week} • ${escapeHtml(clubByIdFrom(s,s.selectedClubId)?.name||'Klub')}`:'Kosong'}</div></div><div>${s?`<button class="ghost-btn" data-load-slot="${slot}">Muat</button> <button class="danger-btn" data-delete-slot="${slot}">Hapus</button>`:`<button class="primary-btn" data-save-slot="${slot}">Simpan</button>`}</div></div>`}).join('')}</div><div class="card"><h2>Ekspor / Impor</h2><p class="card-sub">File JSON menyimpan seluruh database, hasil, transfer, dan setting.</p><div class="toolbar"><button class="primary-btn" id="exportBtn">Ekspor JSON</button><label class="ghost-btn">Impor JSON<input type="file" id="importFile" accept="application/json" hidden></label><button class="danger-btn" id="resetBtn">Reset Database Awal</button></div><div class="divider"></div><h3>Ringkasan</h3><div class="finance-list"><div class="finance-row"><span>Pemain</span><strong>${state.players.length}</strong></div><div class="finance-row"><span>Klub</span><strong>${state.clubs.length}</strong></div><div class="finance-row"><span>Versi</span><strong>${VERSION}</strong></div></div></div></div>`;
      $('#exportBtn').addEventListener('click',exportSave);$('#importFile').addEventListener('change',importSave);$('#resetBtn').addEventListener('click',confirmReset);
    }
  }
  function clubByIdFrom(s,id){return s.clubs?.find(c=>c.id===id)}

  function openPlayerEditor(p=null){
    const isEdit=!!p;const base=p||{name:'',nationality:'Indonesia',clubId:state.selectedClubId,position:'CM',overall:70,potential:80,age:20,foot:'Right',height:175,weight:68,number:1,wage:50_000_000,value:5_000_000_000,contractYears:3,morale:75,fitness:100,form:70,stats:{apps:0,goals:0,assists:0,rating:0},traits:[],secondaryPositions:[],attributes:{pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70,stamina:70,goalkeeping:35,finishing:70,vision:70,tackling:70,composure:70}};
    openModal(`<h2>${isEdit?'Edit':'Tambah'} Pemain</h2><div class="form-grid"><label class="label wide">Nama<input class="input" id="epName" value="${escapeHtml(base.name)}"></label><label class="label wide">URL Foto (opsional)<input class="input" id="epPhoto" value="${escapeHtml(base.photoUrl||'')}" placeholder="https://..."></label><label class="label wide">Nama Agen<input class="input" id="epAgent" value="${escapeHtml(base.agentName||'Independent Sports Management')}"></label><label class="label">Negara<input class="input" id="epNation" value="${escapeHtml(base.nationality)}"></label><label class="label">Klub<select class="select" id="epClub">${state.clubs.map(c=>`<option value="${c.id}" ${c.id===base.clubId?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></label><label class="label">Posisi<input class="input" id="epPos" value="${base.position}"></label><label class="label">Posisi tambahan<input class="input" id="epSecondary" value="${escapeHtml((base.secondaryPositions||[]).join(', '))}" placeholder="LW, RW, ST"></label><label class="label wide">Traits<input class="input" id="epTraits" value="${escapeHtml((base.traits||[]).join(', '))}" placeholder="Clinical Finisher, Flair"></label><label class="label">Nomor<input class="input" id="epNumber" type="number" value="${base.number}"></label><label class="label">Usia<input class="input" id="epAge" type="number" value="${base.age}"></label><label class="label">Kaki<select class="select" id="epFoot"><option value="Right" ${base.foot==='Right'?'selected':''}>Kanan</option><option value="Left" ${base.foot==='Left'?'selected':''}>Kiri</option></select></label><label class="label">OVR<input class="input" id="epOvr" type="number" min="1" max="100" value="${base.overall}"></label><label class="label">Potential<input class="input" id="epPot" type="number" min="1" max="100" value="${base.potential}"></label><label class="label">Tinggi cm<input class="input" id="epHeight" type="number" value="${base.height}"></label><label class="label">Berat kg<input class="input" id="epWeight" type="number" value="${base.weight}"></label><label class="label">Nilai pasar<input class="input" id="epValue" type="number" value="${base.value}"></label><label class="label">Gaji/bulan<input class="input" id="epWage" type="number" value="${base.wage}"></label><label class="label">Sisa kontrak (tahun)<input class="input" id="epContract" type="number" min="0" max="10" value="${base.contractYears??3}"></label><label class="label">Morale<input class="input" id="epMorale" type="number" min="1" max="100" value="${base.morale??75}"></label><label class="label">Fitness<input class="input" id="epFitness" type="number" min="1" max="100" value="${base.fitness??100}"></label><label class="label">Form<input class="input" id="epForm" type="number" min="1" max="100" value="${base.form??70}"></label><label class="label">Penampilan<input class="input" id="epApps" type="number" min="0" value="${base.stats?.apps??0}"></label><label class="label">Gol<input class="input" id="epGoals" type="number" min="0" value="${base.stats?.goals??0}"></label><label class="label">Assist<input class="input" id="epAssists" type="number" min="0" value="${base.stats?.assists??0}"></label><label class="label">Rating<input class="input" id="epRating" type="number" min="0" max="10" step="0.1" value="${base.stats?.rating??0}"></label>${Object.keys(base.attributes).map(k=>`<label class="label">${attrName(k)}<input class="input epAttr" data-attr="${k}" type="number" min="1" max="100" value="${base.attributes[k]}"></label>`).join('')}</div><div class="toolbar" style="justify-content:flex-end;margin-top:16px"><button class="ghost-btn" data-close-modal>Batal</button><button class="primary-btn" id="savePlayerEdit">Simpan</button></div>`);
    $('#savePlayerEdit').addEventListener('click',()=>{
      const oldClubId=p?.clubId;const club=clubById($('#epClub').value);const attrs={};$$('.epAttr').forEach(x=>attrs[x.dataset.attr]=clamp(Number(x.value),1,100));const obj=isEdit?p:{id:'p-'+cryptoId().slice(0,10),stats:{apps:0,goals:0,assists:0,rating:0},morale:75,fitness:100,form:70,contractYears:3,scouted:true,photoUrl:'',agentName:'Independent Sports Management',traits:[],secondaryPositions:[]};
      Object.assign(obj,{name:$('#epName').value.trim()||'Pemain Tanpa Nama',nationality:$('#epNation').value.trim()||'Indonesia',clubId:club.id,club:club.name,league:club.league,country:club.country,position:$('#epPos').value.trim().toUpperCase()||'CM',number:Number($('#epNumber').value),age:Number($('#epAge').value),foot:$('#epFoot').value,overall:clamp(Number($('#epOvr').value),1,100),potential:clamp(Number($('#epPot').value),1,100),height:Number($('#epHeight').value),weight:Number($('#epWeight').value),value:Number($('#epValue').value),wage:Number($('#epWage').value),contractYears:clamp(Number($('#epContract').value),0,10),morale:clamp(Number($('#epMorale').value),1,100),fitness:clamp(Number($('#epFitness').value),1,100),form:clamp(Number($('#epForm').value),1,100),stats:{apps:Math.max(0,Number($('#epApps').value)||0),goals:Math.max(0,Number($('#epGoals').value)||0),assists:Math.max(0,Number($('#epAssists').value)||0),rating:Math.max(0,Math.min(10,Number($('#epRating').value)||0))},photoUrl:$('#epPhoto').value.trim(),agentName:$('#epAgent').value.trim()||'Independent Sports Management',secondaryPositions:$('#epSecondary').value.split(',').map(x=>x.trim().toUpperCase()).filter(Boolean),traits:$('#epTraits').value.split(',').map(x=>x.trim()).filter(Boolean),attributes:attrs});
      if(!isEdit)state.players.push(obj);for(const id of Object.keys(state.lineups))state.lineups[id]=state.lineups[id].filter(x=>x!==obj.id);if(oldClubId)ensureLineup(state,oldClubId);ensureLineup(state,club.id);scheduleSave();closeModal();toast('Data pemain disimpan. Statistik, status, dan atribut ikut diperbarui.');renderView();
    });
  }
  function clamp(n,a,b){return Math.max(a,Math.min(b,n||a))}

  function openClubEditor(c=null){
    const base=c||{name:'',country:'Indonesia',league:'BRI Super League',code:'NEW',strength:70,reputation:70,stadium:'Stadion Baru',budget:50_000_000_000,colors:['#16a34a','#07120d']};
    openModal(`<h2>${c?'Edit':'Tambah'} Klub</h2><div class="form-grid"><label class="label wide">Nama<input class="input" id="ecName" value="${escapeHtml(base.name)}"></label><label class="label">Kode<input class="input" id="ecCode" value="${escapeHtml(base.code)}"></label><label class="label">Negara<input class="input" id="ecCountry" value="${escapeHtml(base.country)}"></label><label class="label">Liga<input class="input" id="ecLeague" value="${escapeHtml(base.league)}"></label><label class="label">Stadion<input class="input" id="ecStadium" value="${escapeHtml(base.stadium)}"></label><label class="label">Kekuatan<input class="input" id="ecStrength" type="number" value="${base.strength}"></label><label class="label">Reputasi<input class="input" id="ecRep" type="number" value="${base.reputation}"></label><label class="label">Dana<input class="input" id="ecBudget" type="number" value="${clubFunds(base.id)||base.budget}"></label></div><div class="toolbar" style="justify-content:flex-end;margin-top:16px"><button class="ghost-btn" data-close-modal>Batal</button><button class="primary-btn" id="saveClubEdit">Simpan</button></div>`);
    $('#saveClubEdit').addEventListener('click',()=>{const oldLeague=c?.league;const obj=c||{id:'club-'+cryptoId().slice(0,8),colors:['#16a34a','#07120d']};Object.assign(obj,{name:$('#ecName').value.trim()||'Klub Baru',code:$('#ecCode').value.trim().toUpperCase().slice(0,4)||'NEW',country:$('#ecCountry').value.trim(),league:$('#ecLeague').value.trim(),stadium:$('#ecStadium').value.trim(),strength:clamp(Number($('#ecStrength').value),1,100),reputation:clamp(Number($('#ecRep').value),1,100)});if(!c)state.clubs.push(obj);state.fundsByClub[obj.id]=Number($('#ecBudget').value);state.players.filter(p=>p.clubId===obj.id).forEach(p=>{p.club=obj.name;p.league=obj.league;p.country=obj.country});if(oldLeague&&oldLeague!==obj.league&&state.standings[oldLeague])state.standings[oldLeague]=state.standings[oldLeague].filter(r=>r.clubId!==obj.id);state.standings[obj.league] ||= [];let row=state.standings[obj.league].find(r=>r.clubId===obj.id);if(row)row.club=obj.name;else state.standings[obj.league].push({clubId:obj.id,club:obj.name,p:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0});scheduleSave();closeModal();toast('Data klub, pemain, dan kompetisinya ikut diperbarui.');renderView()});
  }

  function renderSettings(view){
    view.innerHTML=pageHead('Pengaturan','Mode performa dibuat waras: 30 FPS, gambar lazy-load, autosave idle, tabel paginasi.')+`<div class="grid two"><div class="card"><h2>Profil Manajer</h2><div class="form-grid"><label class="label wide">Nama Manajer<input class="input" id="managerNameInput" value="${escapeHtml(state.managerName)}"></label><label class="label wide">Klub yang Dikelola<select class="select" id="clubSelect">${state.clubs.filter(c=>['Indonesia','England','Spain'].includes(c.country)).map(c=>`<option value="${c.id}" ${c.id===state.selectedClubId?'selected':''}>${escapeHtml(c.name)} • ${escapeHtml(c.league)}</option>`).join('')}</select></label></div><button class="primary-btn" id="saveProfileBtn" style="margin-top:12px">Simpan Profil</button></div><div class="card"><h2>Performa & Suara</h2><div class="finance-list"><div class="finance-row"><span>Efek suara pertandingan</span><input type="checkbox" id="soundToggle" ${state.sound?'checked':''}></div><div class="finance-row"><span>Kurangi animasi</span><input type="checkbox" id="motionToggle" ${state.reducedMotion?'checked':''}></div><div class="finance-row"><span>Autosave</span><input type="checkbox" id="autosaveToggle" ${state.settings.autosave?'checked':''}></div><div class="finance-row"><span>FPS pertandingan</span><select class="select" id="fpsSelect"><option ${state.settings.matchFps===20?'selected':''}>20</option><option ${state.settings.matchFps===30?'selected':''}>30</option><option ${state.settings.matchFps===45?'selected':''}>45</option></select></div></div><p class="card-sub">Untuk HP kelas menengah ke bawah, 30 FPS paling stabil. 45 FPS tersedia kalau perangkat lu merasa dirinya console.</p></div></div>`;
    $('#saveProfileBtn').addEventListener('click',()=>{state.managerName=$('#managerNameInput').value.trim()||state.managerName;state.selectedClubId=$('#clubSelect').value;ensureLineup(state,state.selectedClubId);scheduleSave();updateShell();toast('Profil manajer disimpan.');renderView()});
    $('#soundToggle').addEventListener('change',e=>{state.sound=e.target.checked;updateShell();scheduleSave()});$('#motionToggle').addEventListener('change',e=>{state.reducedMotion=e.target.checked;scheduleSave()});$('#autosaveToggle').addEventListener('change',e=>{state.settings.autosave=e.target.checked;scheduleSave()});$('#fpsSelect').addEventListener('change',e=>{state.settings.matchFps=Number(e.target.value);scheduleSave()});
  }

  function advanceWeek(){
    state.week++;const d=new Date(state.date+'T12:00:00');d.setDate(d.getDate()+7);state.date=d.toISOString().slice(0,10);
    const userPlayers=currentPlayers();for(const p of state.players){p.fitness=Math.min(100,p.fitness+randFrom(p.id+state.week,2,9));p.form=clamp(p.form+randFrom(p.id+'f'+state.week,-3,3),45,99);if(p.age<=27&&p.overall<p.potential&&randFrom(p.id+'grow'+state.week,1,100)<=Math.max(4,(p.potential-p.overall)*.8)){p.overall++;for(const k of Object.keys(p.attributes))if(randFrom(p.id+k+state.week,1,100)<18)p.attributes[k]=clamp(p.attributes[k]+1,1,99)}else if(p.age>=31&&randFrom(p.id+'decline'+state.week,1,100)<(p.age-29)*4){p.overall=Math.max(45,p.overall-1);const keys=Object.keys(p.attributes);const k=keys[randFrom(p.id+'dk'+state.week,0,keys.length-1)];p.attributes[k]=Math.max(35,p.attributes[k]-1)}}
    window.FFU4?.onAdvanceWeek?.(state);
    const commercialBoost=1+((state.facilities?.commercial?.level||1)-1)*.05;
    const stadiumBoost=1+((state.facilities?.stadium?.level||1)-1)*.035;
    const income=Math.round((1_200_000_000+currentClub().reputation*18_000_000)*commercialBoost*stadiumBoost);const wages=userPlayers.reduce((s,p)=>s+p.wage,0);updateFunds(income-wages);state.transactions.unshift({id:cryptoId(),date:state.date,type:'Sponsor, tiket, merchandise & hak siar',amount:income},{id:cryptoId(),date:state.date,type:'Gaji mingguan pemain dan staf',amount:-wages});simulateOtherLeagues();state.news.unshift({title:`Pekan ${state.week}: laporan latihan dan finansial tersedia`,meta:'Klub • Baru saja'});saveNow(false);playSound('click');toast(`Masuk pekan ${state.week}. Kalender dan perkembangan pemain diperbarui.`);renderView();
  }
  function simulateOtherLeagues(){for(const [league,table] of Object.entries(state.standings)){const shuffled=[...table].sort(()=>Math.random()-.5);for(let i=0;i<shuffled.length-1;i+=2){const a=shuffled[i],b=shuffled[i+1];if(a.clubId===state.selectedClubId||b.clubId===state.selectedClubId)continue;const sa=clubStrength(a.clubId),sb=clubStrength(b.clubId);const ag=Math.max(0,Math.round((sa-65)/18+Math.random()*2-0.5)),bg=Math.max(0,Math.round((sb-65)/18+Math.random()*2-0.5));updateStandingResult(a.clubId,b.clubId,ag,bg)}}}

  function openModal(html){
    const tpl=$('#modalTemplate').content.cloneNode(true);tpl.querySelector('.modal-content').innerHTML=html;$('#modalHost').replaceChildren(tpl);document.body.style.overflow='hidden';
  }
  function closeModal(){ $('#modalHost').replaceChildren();document.body.style.overflow=''; }
  function toast(msg,error=false){const d=document.createElement('div');d.className=`toast ${error?'error':''}`;d.textContent=msg;$('#toastHost').appendChild(d);setTimeout(()=>d.remove(),3300)}

  function avatarFallback(name,role='player'){
    const seed=hash(String(name));const skins=['#f1c7a5','#d9a678','#b87952','#8f5e3f','#f5d1b5'];const hairs=['#17120f','#3a261b','#6f4a2e','#111827','#7c2d12'];const bgs=['#123b28','#15375b','#4a224f','#4b3517','#26334a'];const skin=skins[seed%skins.length],hair=hairs[(seed>>>3)%hairs.length],bg=bgs[(seed>>>6)%bgs.length];const shirt=role==='agent'?'#111827':['#16a34a','#2563eb','#dc2626','#7c3aed'][(seed>>>9)%4];const tie=role==='agent'?`<path d="M60 91l7 10-7 17-7-17z" fill="#dc2626"/>`:'';const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="24" fill="${bg}"/><circle cx="60" cy="50" r="27" fill="${skin}"/><path d="M34 48c1-25 14-35 28-35 17 0 27 12 26 34-8-9-17-14-28-14-10 0-18 5-26 15z" fill="${hair}"/><ellipse cx="50" cy="52" rx="2.7" ry="3.2" fill="#151515"/><ellipse cx="70" cy="52" rx="2.7" ry="3.2" fill="#151515"/><path d="M55 65q5 5 10 0" fill="none" stroke="#7c3f31" stroke-width="2.4" stroke-linecap="round"/><path d="M58 55l-2 7h5" fill="none" stroke="#9b684f" stroke-width="1.7" stroke-linecap="round"/><path d="M20 120c3-28 17-41 40-41s37 13 40 41z" fill="${shirt}"/>${role==='agent'?'<path d="M44 81l16 14 16-14 7 39H37z" fill="#f8fafc"/><path d="M42 83l18 15 18-15 13 37H29z" fill="#111827"/>'+tie:'<path d="M44 83q16 10 32 0" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="3"/>'}</svg>`;return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }
  function getPhotoCache(){try{return JSON.parse(localStorage.getItem(PHOTO_CACHE_KEY)||'{}')}catch{return {}}}
  async function resolvePlayerPhoto(p){
    if(p.photoUrl)return p.photoUrl;const cache=getPhotoCache();if(cache[p.name])return cache[p.name];
    try{
      const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),4500);const q=encodeURIComponent(`${p.name} footballer`);const url=`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=420&format=json&origin=*`;
      const res=await fetch(url,{signal:controller.signal});clearTimeout(timeout);if(!res.ok)throw new Error('photo');const data=await res.json();const pages=Object.values(data.query?.pages||{});const found=pages.find(x=>x.thumbnail?.source);if(found){cache[p.name]=found.thumbnail.source;localStorage.setItem(PHOTO_CACHE_KEY,JSON.stringify(cache));return found.thumbnail.source}
    }catch(e){console.debug('Foto fallback',p.name)}
    return avatarFallback(p.name);
  }

  let audioCtx;
  function playSound(type){
    if(!state.sound)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);const now=audioCtx.currentTime;const cfg={goal:[520,.32,.10],whistle:[1100,.16,.08],card:[240,.12,.05],click:[420,.07,.035]}[type]||[400,.08,.03];o.frequency.setValueAtTime(cfg[0],now);if(type==='goal')o.frequency.exponentialRampToValueAtTime(780,now+cfg[1]);g.gain.setValueAtTime(cfg[2],now);g.gain.exponentialRampToValueAtTime(.001,now+cfg[1]);o.start(now);o.stop(now+cfg[1])}catch{}
  }

  function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`FFU-save-slot-${activeSlot}-week-${state.week}.json`;a.click();URL.revokeObjectURL(a.href);toast('Save diekspor ke JSON.')}
  function importSave(e){const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const imported=JSON.parse(r.result);if(!imported.players||!imported.clubs)throw new Error();state=imported;migrateState();saveNow();closeModal();navigate('dashboard');toast('Save berhasil diimpor.')}catch{toast('File JSON tidak valid.',true)}};r.readAsText(file)}
  function confirmReset(){openModal(`<h2>Reset database?</h2><p>Semua transfer, edit pemain, dan hasil pertandingan pada slot aktif akan hilang. Akhirnya tombol yang benar-benar punya konsekuensi.</p><div class="toolbar" style="justify-content:flex-end"><button class="ghost-btn" data-close-modal>Batal</button><button class="danger-btn" id="confirmResetBtn">Reset Sekarang</button></div>`);$('#confirmResetBtn').addEventListener('click',()=>{state=createInitialState();state.hasOnboarded=true;saveNow();closeModal();navigate('dashboard');toast('Database dikembalikan ke awal.')})}

  function showOnboarding(){
    openModal(`<h2>Mulai Karier Manajer</h2><p class="card-sub">Pilih klub. Fauzan wonderkid umur 16 sudah ada di Real Madrid dengan OVR 70 dan POT 99.</p><div class="form-grid"><label class="label wide">Nama Manajer<input class="input" id="onboardName" value="${escapeHtml(state.managerName)}"></label><label class="label wide">Klub<select class="select" id="onboardClub">${state.clubs.filter(c=>['Indonesia','England','Spain'].includes(c.country)).map(c=>`<option value="${c.id}" ${c.id===state.selectedClubId?'selected':''}>${escapeHtml(c.name)} • ${escapeHtml(c.league)}</option>`).join('')}</select></label></div><button class="primary-btn full" id="startCareerBtn" style="margin-top:16px">Mulai Karier</button>`);
    $('#startCareerBtn').addEventListener('click',()=>{state.managerName=$('#onboardName').value.trim()||state.managerName;state.selectedClubId=$('#onboardClub').value;state.hasOnboarded=true;ensureLineup(state,state.selectedClubId);saveNow();closeModal();updateShell();renderView();toast('Karier dimulai. Jangan langsung jual semua pemain, barbar.')});
  }

  function deletePlayer(id){const p=playerById(id);if(!p)return;if(!confirm(`Hapus ${p.name}?`))return;const oldClubId=p.clubId;state.players=state.players.filter(x=>x.id!==id);for(const k of Object.keys(state.lineups))state.lineups[k]=state.lineups[k].filter(x=>x!==id);ensureLineup(state,oldClubId);scheduleSave();renderView();toast('Pemain dihapus dari database dan susunan tim dirapikan.')}
  function deleteClub(id){const c=clubById(id);if(!c||id===state.selectedClubId)return;if(!confirm(`Hapus ${c.name} dan seluruh pemainnya?`))return;state.clubs=state.clubs.filter(x=>x.id!==id);state.players=state.players.filter(p=>p.clubId!==id);delete state.fundsByClub[id];delete state.lineups[id];for(const league of Object.keys(state.standings))state.standings[league]=state.standings[league].filter(r=>r.clubId!==id);scheduleSave();renderView();toast('Klub dan pemainnya dihapus.')}

  document.addEventListener('click',e=>{
    const close=e.target.closest('[data-close-modal]');if(close&&(!e.target.closest('.modal-card')||e.target.matches('[data-close-modal]')))closeModal();
    const menu=e.target.closest('[data-open-menu]');if(menu){$('#sidebar').classList.add('open');document.body.classList.add('menu-open');}
    const v=e.target.closest('[data-view]');if(v)navigate(v.dataset.view);
    const pRow=e.target.closest('[data-player-id]');if(pRow&&!e.target.closest('[data-negotiate],[data-scout],[data-admin-edit]')){const p=playerById(pRow.dataset.playerId);if(p)showPlayer(p)}
    const neg=e.target.closest('[data-negotiate]');if(neg){const p=playerById(neg.dataset.negotiate);if(p)openNegotiation(p)}
    const scout=e.target.closest('[data-scout]');if(scout){const p=playerById(scout.dataset.scout);if(p)scoutPlayer(p)}
    const edit=e.target.closest('[data-admin-edit]');if(edit){const p=playerById(edit.dataset.adminEdit);if(p){closeModal();openPlayerEditor(p)}}
    const del=e.target.closest('[data-delete-player]');if(del)deletePlayer(del.dataset.deletePlayer);
    const editClub=e.target.closest('[data-edit-club]');if(editClub)openClubEditor(clubById(editClub.dataset.editClub));
    const delClub=e.target.closest('[data-delete-club]');if(delClub)deleteClub(delClub.dataset.deleteClub);
    const page=e.target.closest('[data-page-type]');if(page&&!page.disabled){const num=Number(page.dataset.page),type=page.dataset.pageType;if(type==='squad')ui.squadPage=num;if(type==='transfer')ui.transferPage=num;if(type==='scout')ui.scoutPage=num;if(type==='admin')ui.adminPage=num;renderView()}
    const tab=e.target.closest('[data-admin-tab]');if(tab){ui.adminTab=tab.dataset.adminTab;renderView()}
    const league=e.target.closest('[data-league-tab]');if(league){state.competitionTab=league.dataset.leagueTab;renderView()}
    const saveSlot=e.target.closest('[data-save-slot]');if(saveSlot){activeSlot=Number(saveSlot.dataset.saveSlot);saveNow(true);renderView()}
    const load=e.target.closest('[data-load-slot]');if(load){const s=loadSlot(Number(load.dataset.loadSlot));if(s){state=s;activeSlot=Number(load.dataset.loadSlot);migrateState();saveNow();navigate('dashboard');toast(`Slot ${activeSlot} dimuat.`)}}
    const delSlot=e.target.closest('[data-delete-slot]');if(delSlot){const slot=Number(delSlot.dataset.deleteSlot);if(confirm(`Hapus save slot ${slot}?`)){localStorage.removeItem(STORAGE_PREFIX+slot);if(slot===activeSlot){state=createInitialState();state.hasOnboarded=true;saveNow()}renderView();toast(`Slot ${slot} dihapus.`)}}
  });

  $('#menuBtn').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');document.body.classList.toggle('menu-open',open)});
  $('#saveNowBtn').addEventListener('click',()=>saveNow(true));
  $('#advanceWeekBtn').addEventListener('click',advanceWeek);
  $('#soundBtn').addEventListener('click',()=>{state.sound=!state.sound;updateShell();scheduleSave();playSound('click')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

  window.FFU_APP={
    get state(){return state},get ui(){return ui},$, $$, clone, fmtMoney,fmtFullMoney,escapeHtml,hash,randFrom,sleep,cryptoId,
    clubById,playerById,currentClub,currentPlayers,clubPlayers,clubFunds,clubStrength,updateFunds,ensureLineup,updateShell,
    renderView,navigate,pageHead,badge,playerAvatar,kpi,activity,bar,potentialLabel,formattedDate,initials,clamp,nextOpponent,
    scheduleSave,saveNow,toast,playSound,openModal,closeModal,showPlayer
  };
  window.FFU4?.init?.(window.FFU_APP);

  let deferredInstallPrompt=null;
  function updateInstallButton(){
    const btn=$('#installPwaBtn'); if(!btn)return;
    const standalone=window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone===true;
    btn.hidden=standalone;
  }
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault(); deferredInstallPrompt=event; updateInstallButton();
  });
  window.addEventListener('appinstalled',()=>{
    deferredInstallPrompt=null; updateInstallButton(); toast('FFU berhasil dipasang sebagai aplikasi.');
  });
  $('#installPwaBtn')?.addEventListener('click',async()=>{
    if(!deferredInstallPrompt){
      openModal(`<h2>Pasang FFU</h2><p>Di Chrome Android, buka menu <strong>⋮</strong> lalu pilih <strong>Install app</strong> atau <strong>Tambahkan ke layar utama</strong>. Di iPhone, tekan Share lalu Add to Home Screen.</p>`);
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(()=>null);
    deferredInstallPrompt=null; updateInstallButton();
  });

  async function setupPWA(){
    if(!('serviceWorker' in navigator) || !location.protocol.startsWith('http'))return;
    try{
      const params=new URLSearchParams(location.search);
      if(params.get('fresh')==='1'){
        const keys=await caches.keys(); await Promise.all(keys.filter(k=>k.startsWith('ffu-')).map(k=>caches.delete(k)));
        const regs=await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r=>r.unregister()));
        params.delete('fresh'); const clean=location.pathname+(params.toString()?'?'+params.toString():'')+location.hash; location.replace(clean); return;
      }
      const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'});
      reg.update().catch(()=>{});
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing; if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            const banner=$('#updateBanner');
            if(banner){banner.hidden=false;banner.querySelector('button')?.addEventListener('click',()=>{worker.postMessage({type:'SKIP_WAITING'});});}
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(sessionStorage.getItem('ffu-reloaded-4.1.0'))return;
        sessionStorage.setItem('ffu-reloaded-4.1.0','1'); location.reload();
      });
    }catch(err){console.warn('[FFU PWA] Service worker gagal',err)}
  }

  const moduleOk=Boolean(window.FFU4?.renderers?.training && window.FFU4?.renderers?.academy && window.FFU4?.renderers?.manager);
  if(!moduleOk){
    console.error('[FFU boot] Modul Career Universe gagal dimuat');
    const banner=$('#bootError'); if(banner){banner.hidden=false;banner.textContent='Modul karier gagal dimuat. Refresh paksa atau hapus cache situs.';}
  }
  setupPWA(); updateInstallButton();
  renderNav();updateShell();renderView();if(!state.hasOnboarded)setTimeout(showOnboarding,150);
})();
