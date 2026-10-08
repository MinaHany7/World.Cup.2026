(() => {
  'use strict';
  const D = window.WC_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nf = new Intl.NumberFormat('en-US');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => nf.format(Number(v || 0));
  if (!D) { document.body.insertAdjacentHTML('beforeend', '<p style="padding:24px;color:#f2f3e8">Report data could not be loaded. Keep the assets folder beside index.html.</p>'); return; }
  const flagFor = team => D.flags?.[team] || D.standings?.find(t => t.Team_EN === team)?.Flag || '';
  const imageFor = p => (p?.Photo && D.playerImages?.[p.Photo]) || p?.Photo_URL || p?.Flag || flagFor(p?.Team) || '';
  const stages = ['Group Stage','Round of 32','Round of 16','Quarter-final','Semi-final','Third Place','Final'];
  const stageLabel = stage => ({'Group Stage':'GROUP STAGE','Round of 32':'ROUND OF 32','Round of 16':'ROUND OF 16','Quarter-final':'QUARTER-FINAL','Semi-final':'SEMI-FINAL','Third Place':'THIRD PLACE','Final':'FINAL'}[stage] || String(stage || 'GROUP STAGE').toUpperCase());
  const stageFor = team => { const rows=(D.teamMatches||[]).filter(r=>r.Team===team); const i=Math.max(0,...rows.map(r=>stages.indexOf(r.Stage))); return stages[i]||'Group Stage'; };
  const teamRecord = team => { const rows=(D.teamMatches||[]).filter(r=>r.Team===team); return {team,matches:rows.length,gf:rows.reduce((a,r)=>a+Number(r.Goals_For||0),0),ga:rows.reduce((a,r)=>a+Number(r.Goals_Against||0),0)}; };
  const profileNotes = {
    'Lamine Yamal':'Two player-of-the-match awards at 18; Spain went on to win the tournament. Review role and minutes before drawing a recruitment conclusion.',
    'Jude Bellingham':'Seven goals, one assist and four player-of-the-match awards at 22. Exceptional tournament output; validate role, minutes and chance context.',
    'Andreas Schjelderup':'Three assists plus one goal at 22. An assist-led profile from Norway’s quarter-final run; review the underlying chance creation.',
    'Florian Wirtz':'Three assists at 23 despite Germany’s Round-of-32 exit. A creation signal worth video review, not a complete performance measure.',
    'Arda Güler':'One goal and one player-of-the-match award at 21 while Türkiye exited in the group stage. A useful signal beyond team progression.',
    'Hannibal Mejbri':'Two assists at 23 despite Tunisia’s group-stage exit. Check minutes, role and chance quality before comparing.'
  };
  const profiles=[{name:'Lamine Yamal',signal:'AGE + RECOGNITION'},{name:'Jude Bellingham',signal:'HIGH-END OUTPUT'},{name:'Andreas Schjelderup',signal:'ASSIST-LED OUTPUT'},{name:'Florian Wirtz',signal:'CREATION SIGNAL'},{name:'Arda Güler',signal:'IMPACT IN A GROUP EXIT'},{name:'Hannibal Mejbri',signal:'ASSISTS IN A GROUP EXIT'}];
  const spotlightPortraits={'Lamine Yamal':'assets/players/spotlight/lamine-yamal.webp','Jude Bellingham':'assets/players/spotlight/jude-bellingham.webp','Andreas Schjelderup':'assets/players/spotlight/andreas-schjelderup.webp','Florian Wirtz':'assets/players/spotlight/florian-wirtz.webp','Arda Güler':'assets/players/spotlight/arda-g-ler.webp','Hannibal Mejbri':'assets/players/spotlight/hannibal-mejbri.webp'};

  function fillHero(){
    const final=D.matches.find(m=>m.Stage==='Final'),champion=D.summary.final.winner,flag=$('#championFlag');
    if(flag){flag.src=flagFor(champion);flag.alt=`${champion} flag`;}
    const champ=$('#championName');if(champ)champ.textContent=champion.toUpperCase();
    if(!final)return;
    const goals=final.Team1===champion?[final.Goals1,final.Goals2]:[final.Goals2,final.Goals1];
    const opponent=final.Team1===champion?final.Team2:final.Team1;
    const short={Spain:'ESP',Argentina:'ARG',England:'ENG',France:'FRA',Turkey:'TUR','Türkiye':'TUR'};
    const score=$('.hero-final-score b');
    if(score)score.innerHTML=`<span>${esc(short[champion]||champion.slice(0,3).toUpperCase())}</span> ${num(goals[0])} <i>—</i> ${num(goals[1])} <span>${esc(short[opponent]||opponent.slice(0,3).toUpperCase())}</span>`;
  }
  function renderStats(){
    const s=D.summary,ko=(D.matches||[]).filter(m=>m.Stage!=='Group Stage'),extra=ko.filter(m=>m.Went_Extra_Time).length;
    const stats=[{label:'MATCHES',value:num(s.matches),foot:`${num(s.teams)} NATIONS · ${num(s.groups)} GROUPS`},{label:'GOALS SCORED',value:num(s.goals),foot:`${Number(s.goalsPerMatch).toFixed(2)} PER MATCH`},{label:'AVG. ATTENDANCE',value:num(s.averageAttendance),foot:'SPECTATORS / MATCH'},{label:'KNOCKOUT EXTRA TIME',value:`${num(extra)} / ${num(ko.length)}`,foot:'FIXTURES THAT WENT BEYOND 90′'}];
    $('#statGrid').innerHTML=stats.map((x,i)=>`<article class="stat-card" style="--i:${i}"><i class="stat-accent"></i><span class="stat-label">${esc(x.label)}</span><strong class="stat-value">${esc(x.value)}</strong><small class="stat-foot">${esc(x.foot)}</small></article>`).join('');
    const late=Number(s.goalTimeBuckets?.['76-90']||0),pct=s.goals?(100*late/Number(s.goals)).toFixed(1):'0.0';
    $('#lateGoalStat').textContent=`${num(late)} goals · ${pct}%`;
    const proofs=$$('.outlook-proof');if(proofs[0])proofs[0].textContent=`${pct}%`;if(proofs[1])proofs[1].textContent=`${extra} / ${ko.length}`;
    const buckets=['01-15','16-30','31-45','46-60','61-75','76-90','91-105','106-120'],values=buckets.map(k=>Number(s.goalTimeBuckets?.[k]||0)),max=Math.max(...values,1);
    $('#goalChart').innerHTML=buckets.map((k,i)=>`<div class="goal-column ${k==='76-90'?'is-peak':''}" title="${k} minutes: ${values[i]} goals"><b>${num(values[i])}</b><span class="goal-bar-track"><i class="goal-bar" style="height:${Math.max(3,values[i]/max*100)}%"></i></span><small>${esc(k).replace('-','–')}</small></div>`).join('');
    $('#goalChart').setAttribute('aria-label',`Goals by minute: ${buckets.map((k,i)=>`${k}, ${values[i]}`).join('; ')}`);
  }
  function renderCompetition(){
    const final=D.matches.find(m=>m.Stage==='Final'),bronze=D.matches.find(m=>m.Stage==='Third Place');if(!final||!bronze)return;
    const loser=m=>m.Team1===m.Winner?m.Team2:m.Team1,topFour=[final.Winner,loser(final),bronze.Winner,loser(bronze)].map(teamRecord),maxGoals=Math.max(1,...topFour.map(x=>x.gf));
    $('#teamChart').innerHTML=topFour.map(x=>`<div class="team-row"><span class="team-name"><img src="${esc(flagFor(x.team))}" alt="" loading="lazy">${esc(x.team)}</span><span class="team-bars"><span class="team-bar-line for"><i style="width:${Math.max(2,x.gf/maxGoals*100)}%"></i></span><span class="team-bar-line against"><i style="width:${Math.max(2,x.ga/maxGoals*100)}%"></i></span></span><span class="team-values"><b>${num(x.gf)}</b><small>${num(x.ga)}</small></span></div>`).join('');
    const boot=D.awards.find(a=>/golden boot/i.test(a.Award)),bootGoals=Number((boot?.Detail||'').match(/\d+/)?.[0]||D.scorers.find(p=>p.Player===boot?.Winner)?.Goals||0);
    const mostGoals=[...(D.matches||[])].sort((a,b)=>Number(b.Total_Goals)-Number(a.Total_Goals))[0];
    const venues=Object.values(D.stadiums||{}).map(v=>({venue:v,games:D.matches.filter(m=>m.Stadium===v.Stadium)})).map(x=>({...x,attendance:x.games.reduce((n,m)=>n+Number(m.Attendance||0),0)})).sort((a,b)=>b.attendance-a.attendance),topVenue=venues[0];
    const records=[{mark:num(bootGoals),title:'GOLDEN BOOT',note:`${boot?.Winner||'Top scorer'} · ${boot?.Team||''}`},{mark:num(mostGoals?.Total_Goals||0),title:'MOST GOALS IN ONE FIXTURE',note:`${mostGoals?.Team1} ${mostGoals?.Goals1}–${mostGoals?.Goals2} ${mostGoals?.Team2}`},{mark:`${((topVenue?.attendance||0)/1000).toFixed(0)}K`,title:'MOST ATTENDED VENUE',note:`${topVenue?.venue?.Stadium||''} · ${topVenue?.games.length||0} matches`}];
    $('#recordStrip').innerHTML=records.map(x=>`<article class="record-tile"><strong class="record-mark">${esc(x.mark)}</strong><div><b>${esc(x.title)}</b><small>${esc(x.note)}</small></div></article>`).join('');
  }
  function renderScouting(){
    const entries=profiles.map(x=>({...x,player:D.scorers.find(p=>p.Player===x.name)})).filter(x=>x.player);
    $('#scoutGrid').innerHTML=entries.map(({name,signal,player:p})=>{const image=spotlightPortraits[name]||imageFor(p)||flagFor(p.Team),flag=p.Flag||flagFor(p.Team),age=Math.round(Number(p.Age||0));return `<button class="scout-card" type="button" data-player="${esc(p.Team+'|'+p.Player)}" aria-label="Open ${esc(p.Player)} scouting profile"><span class="scout-photo"><img class="player-photo" src="${esc(image)}" alt="${esc(p.Player)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(flag)}'"><img class="scout-flag" src="${esc(flag)}" alt="${esc(p.Team)} flag" loading="lazy"><span class="scout-signal">${esc(signal)}</span></span><span class="scout-card-copy"><span class="scout-team">${esc(p.Team)} · ${esc(p.Position||'—')}</span><b class="scout-name">${esc(p.Player)}</b><span class="scout-meta">AGE ${num(age)} · ${esc(stageLabel(stageFor(p.Team)))}</span><span class="scout-stats"><b>${num(p.Goals)}</b> G <span>·</span><b>${num(p.Assists)}</b> A <span>·</span><b>${num(p.MOTM)}</b> POTM</span></span></button>`;}).join('');
    $('#scoutGrid').addEventListener('click',e=>{const card=e.target.closest('[data-player]');if(card)openPlayer(card.dataset.player);});
  }
  function openPlayer(key){
    const [team,name]=key.split('|'),p=D.scorers.find(x=>x.Team===team&&x.Player===name);if(!p)return;
    const img=spotlightPortraits[name]||imageFor(p)||flagFor(team),flag=p.Flag||flagFor(team);
    $('#dialogContent').innerHTML=`<div class="dialog-player"><img src="${esc(img)}" alt="${esc(name)}" onerror="this.onerror=null;this.src='${esc(flag)}'"><div class="dialog-player-copy"><p class="eyebrow"><span>${esc(team)}</span> · ${esc(stageLabel(stageFor(team)))}</p><h2 id="dialogName">${esc(name)}</h2><p class="dialog-team">${esc(p.Position||'Player')} · Age ${num(Math.round(Number(p.Age||0)))}</p><div class="dialog-stats"><span class="dialog-stat"><b>${num(p.Goals)}</b><small>GOALS</small></span><span class="dialog-stat"><b>${num(p.Assists)}</b><small>ASSISTS</small></span><span class="dialog-stat"><b>${num(p.MOTM)}</b><small>POTM</small></span></div><p class="dialog-read">${esc(profileNotes[name]||'A tournament-output snapshot only. Validate minutes, role, underlying performance and availability before a recruitment decision.')}</p></div></div>`;
    const dialog=$('#playerDialog');if(!dialog.open)dialog.showModal();
  }
  function bindIntro(){
    const screen=$('#entryScreen'),report=$('#report');let started=false;
    const reveal=skip=>{if(started)return;started=true;if(!skip&&!matchMedia('(prefers-reduced-motion: reduce)').matches){screen.classList.add('is-entering');window.setTimeout(showReport,1500);}else{screen.classList.add('is-leaving');showReport();}};
    function showReport(){report.hidden=false;document.body.classList.add('report-open');window.scrollTo(0,0);window.setTimeout(()=>screen.classList.add('is-leaving'),80);window.setTimeout(()=>screen.remove(),850);}
    $('#enterButton').addEventListener('click',()=>reveal(false));$('#skipIntro').addEventListener('click',()=>reveal(true));
    document.addEventListener('keydown',e=>{if(!started&&(e.key==='Enter'||e.key===' ')){e.preventDefault();reveal(false);}});
  }
  function bindDialog(){const dialog=$('#playerDialog');$('#dialogClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog.open)dialog.close();});}
  fillHero();renderStats();renderCompetition();renderScouting();bindDialog();bindIntro();
})();
