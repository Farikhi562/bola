(() => {
  'use strict';
  const VERSION='5.0.0';
  const leagues=['BRI Super League','Premier League','La Liga'];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const hash=s=>{let h=2166136261;for(let i=0;i<String(s).length;i++){h^=String(s).charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const rnd=(seed,a,b)=>a+(hash(seed)%(b-a+1));
  const iso=d=>d.toISOString().slice(0,10);
  function roundRobin(ids,league,startDate){
    const teams=[...ids]; if(teams.length%2)teams.push(null); const n=teams.length, rounds=[];
    for(let r=0;r<n-1;r++){
      const games=[];
      for(let i=0;i<n/2;i++){const a=teams[i],b=teams[n-1-i];if(a&&b){const flip=(r+i)%2;games.push({homeId:flip?b:a,awayId:flip?a:b});}}
      rounds.push(games); teams.splice(1,0,teams.pop());
    }
    const all=[...rounds,...rounds.map(g=>g.map(x=>({homeId:x.awayId,awayId:x.homeId})))];
    return all.flatMap((games,r)=>games.map((g,i)=>{
      const d=new Date(startDate+'T12:00:00');d.setDate(d.getDate()+r*7);
      const weather=['Cerah','Berawan','Hujan ringan','Hujan deras'][rnd(`${league}-${r}-${i}`,0,3)];
      return {id:`fx-${hash(`${league}-${r}-${i}-${g.homeId}-${g.awayId}`)}`,league,round:r+1,date:iso(d),kickoff:['15:30','18:30','19:30','20:00'][rnd(g.homeId+g.awayId+r,0,3)],referee:`Wasit ${rnd(league+r+i,1,24)}`,weather,temperature:rnd(g.homeId+r,18,33),pitch:weather==='Hujan deras'?'Basah':weather==='Hujan ringan'?'Lembap':'Baik',played:false,hg:null,ag:null,...g};
    }));
  }
  function ensureFixtures(s){
    s.fixtures ||= [];
    if(s.fixtures.length) return;
    for(const league of leagues){const ids=s.clubs.filter(c=>c.league===league).map(c=>c.id);if(ids.length>1)s.fixtures.push(...roundRobin(ids,league,s.date||'2025-08-04'));}
  }
  function ensurePlayers(s){
    for(const p of s.players){
      p.contractWeeks ??= Math.max(0,Math.round((p.contractYears||0)*52));
      p.matchSharpness ??= rnd(p.id+'sharp',62,92); p.fatigueLoad ??= rnd(p.id+'fatigue',5,28); p.injuryProneness ??= rnd(p.id+'prone',4,18);
      p.agent ||= {name:p.agentName||'Independent Sports Management',personality:['Kooperatif','Keras','Pragmatis','Loyal'][rnd(p.id+'agent',0,3)],relationship:50,feePct:rnd(p.id+'fee',3,10)};
      p.contract ||= {weeklyWage:Math.round((p.wage||0)*12/52),appearanceBonus:Math.round((p.wage||0)*.08),goalBonus:Math.round((p.wage||0)*.12),cleanSheetBonus:Math.round((p.wage||0)*.1),optionYear:false,releaseClause:p.releaseClause||0};
      p.injuryHistory ||= [];
    }
  }
  function seedState(s){migrate(s)}
  function migrate(s){
    s.version=VERSION; ensureFixtures(s); ensurePlayers(s);
    s.worldTransfers ||= []; s.transferRumours ||= []; s.seasonRecords ||= {goals:0,conceded:0,cleanSheets:0,highestAttendance:0,biggestWin:null,biggestLoss:null};
    s.economyV5 ||= {lastProcessedWeek:0,broadcastMonthly:0,sponsorMonthly:0,merchandiseMonthly:0};
    s.medicalV5 ||= {treatmentByPlayer:{}};
  }
  function strength(s,id){const ps=s.players.filter(p=>p.clubId===id).sort((a,b)=>b.overall-a.overall).slice(0,11);return ps.length?ps.reduce((a,p)=>a+p.overall*.75+p.form*.1+p.fitness*.1+p.morale*.05,0)/ps.length:65}
  function simulateFixture(s,f){
    const hs=strength(s,f.homeId)+2.8,as=strength(s,f.awayId); const wet=f.pitch!=='Baik';
    const baseH=clamp(1.25+(hs-as)/22+(wet?-.08:0),.15,3.8),baseA=clamp(.95+(as-hs)/24+(wet?-.1:0),.1,3.4);
    const goals=x=>Math.max(0,Math.round(x+(rnd(f.id+'g'+x+s.week,-75,75)/100)));
    f.hg=goals(baseH);f.ag=goals(baseA);f.played=true;f.attendance=Math.max(1800,Math.round((s.clubs.find(c=>c.id===f.homeId)?.reputation||60)*650*(.78+rnd(f.id+'att',0,42)/100)));f.gateReceipt=f.attendance*rnd(f.id+'ticket',65000,220000);
    f.stats={xg:[+(baseH*.86).toFixed(2),+(baseA*.86).toFixed(2)],shots:[rnd(f.id+'sh',7,19),rnd(f.id+'sa',5,17)],cards:[rnd(f.id+'ch',0,5),rnd(f.id+'ca',0,5)],corners:[rnd(f.id+'coh',1,9),rnd(f.id+'coa',1,8)]};
  }
  function weeklyMedical(s){
    for(const p of s.players){p.contractWeeks=Math.max(0,(p.contractWeeks||0)-1);p.matchSharpness=clamp(p.matchSharpness+rnd(p.id+s.week+'sharp',-2,4),35,100);p.fatigueLoad=clamp(p.fatigueLoad+rnd(p.id+s.week+'load',-5,8),0,100);if(p.injury)continue;const risk=(p.injuryProneness*.18)+(p.fatigueLoad*.08)+Math.max(0,75-p.fitness)*.12+(s.training?.intensity==='Ekstrem'?4:0);if(rnd(p.id+s.week+'medical',1,1000)<=risk){const weeks=rnd(p.id+s.week+'iw',1,6),type=['Hamstring','Pergelangan kaki','Benturan lutut','Otot paha'][rnd(p.id+s.week+'it',0,3)];p.injury={type,weeks};p.injuryHistory.unshift({week:s.week,date:s.date,type,weeks});}}
  }
  function onAdvanceWeek(s){
    migrate(s);weeklyMedical(s);
    const due=s.fixtures.filter(f=>!f.played&&f.date<=s.date);
    for(const f of due){if(f.homeId===s.selectedClubId||f.awayId===s.selectedClubId)continue;simulateFixture(s,f)}
    const homeGames=due.filter(f=>f.played&&f.homeId===s.selectedClubId);for(const f of homeGames){s.fundsByClub[s.selectedClubId]=(s.fundsByClub[s.selectedClubId]||0)+f.gateReceipt;s.transactions?.unshift({id:`gate-${f.id}`,date:s.date,type:`Gate receipt • ${f.attendance.toLocaleString('id-ID')} penonton`,amount:f.gateReceipt});}
  }
  function onMatchFinished(s,result){
    const home=s.clubs.find(c=>c.name===result.home),away=s.clubs.find(c=>c.name===result.away);if(!home||!away)return;
    const f=s.fixtures.find(x=>!x.played&&x.homeId===home.id&&x.awayId===away.id);
    if(f){f.played=true;f.hg=result.homeScore;f.ag=result.awayScore;f.stats=result.stats;f.attendance=Math.max(2000,Math.round((home.reputation||60)*700));f.gateReceipt=f.attendance*rnd(f.id+'ticket',65000,220000);}
  }
  window.FFU5={version:VERSION,seedState,migrate,onAdvanceWeek,onMatchFinished};
})();
