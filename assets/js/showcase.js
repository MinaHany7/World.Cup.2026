(() => {
  'use strict';
  const D = window.WC_DATA;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fifaRecords = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/records-broken-set';
  const fifaReview = 'https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/overall-tournament-review-spain-argentina';
  const guinness = 'https://www.guinnessworldrecords.com/news/2026/7/fifa-world-cup-2026-biggest-and-best-records-broken-as-spain-defeat-argentina';
  const addedPlayers = [
    {name:'Kylian Mbappé', signal:'22 WORLD CUP GOALS · ALL-TIME', note:'Ten goals won the Golden Boot; FIFA and Guinness list him as the World Cup finals all-time leader with 22.'},
    {name:'Lionel Messi', signal:'NINE STRAIGHT SCORING GAMES', note:'Eight goals and four assists in the supplied tournament dataset, alongside a nine-appearance World Cup scoring streak.'},
    {name:'Michael Olise', signal:'SINGLE-EDITION ASSIST RECORD', note:'Seven assists set a new one-edition World Cup record; five were for Kylian Mbappé.'},
    {name:'Cristiano Ronaldo', signal:'SCORED IN SIX EDITIONS', note:'Three goals in the supplied tournament file; FIFA records him as the first player to score in six World Cups.'},
    {name:'Harry Kane', signal:'SIX-GOAL TEAMMATE PAIR', note:'Six goals and two assists. He and Jude Bellingham became the first England teammates to reach six goals each in one edition.'},
    {name:'Ousmane Dembélé', signal:'SIX-GOAL TEAMMATE PAIR', note:'Six goals and two assists. He and Kylian Mbappé repeated the historic six-goal teammate milestone for France.'},
    {name:'Erling Haaland', signal:'SEVEN GOALS · NORWAY', note:'Seven tournament goals put Norway’s forward among the leading scorers in the supplied dataset.'},
    {name:'Rodri', signal:'790-PASS WORLD CUP RECORD', note:'FIFA reports 790 completed passes, surpassing his own previous single-edition mark of 638.'},
    {name:'Eloy Room', signal:'16-SAVE MATCH RECORD', note:'He equalled the World Cup single-match saves record with 16 stops, in 30 fewer minutes than the previous co-holder.'}
  ];
  const records = [
    {value:'308', unit:'GOALS', tag:'NEW TOURNAMENT RECORD', title:'The most goals in one World Cup', detail:'FIFA confirmed 308 goals—a new tournament high.', art:'assets/img/trophy-and-ball.webp', source:fifaReview, sourceLabel:'FIFA · FINAL REVIEW'},
    {value:'6.81M', unit:'FANS', tag:'ALL-TIME ATTENDANCE HIGH', title:'A record crowd across three nations', detail:'6,810,966 fans attended. The previous record was 3,587,538 at USA 1994.', art:'assets/img/stadium-walkout.webp', source:fifaReview, sourceLabel:'FIFA · FINAL REVIEW'},
    {value:'104', unit:'MATCHES', tag:'LARGEST EDITION', title:'The biggest World Cup yet', detail:'The first 48-team edition brought more matches than any previous tournament.', art:'assets/img/stadium-walkout.webp', source:fifaReview, sourceLabel:'FIFA · TOURNAMENT REVIEW'},
    {value:'22', unit:'WORLD CUP GOALS', tag:'ALL-TIME PLAYER RECORD', title:'Mbappé moves into first place', detail:'Kylian Mbappé finished one goal ahead of Lionel Messi in the all-time finals chart.', player:'Kylian Mbappé', source:fifaRecords, sourceLabel:'FIFA · RECORDS', secondary:guinness, secondaryLabel:'GUINNESS'},
    {value:'9', unit:'APPEARANCES', tag:'CONSECUTIVE SCORING RECORD', title:'Messi scores in nine World Cup games in a row', detail:'A new mark for goals in successive World Cup appearances.', player:'Lionel Messi', source:fifaRecords, sourceLabel:'FIFA · RECORDS', secondary:guinness, secondaryLabel:'GUINNESS'},
    {value:'7', unit:'ASSISTS', tag:'SINGLE-EDITION RECORD', title:'Olise goes one beyond Pelé', detail:'Michael Olise set a new World Cup assist record, topping Pelé’s six in 1970.', player:'Michael Olise', source:fifaRecords, sourceLabel:'FIFA · RECORDS', secondary:guinness, secondaryLabel:'GUINNESS'},
    {value:'790', unit:'COMPLETED PASSES', tag:'SINGLE-EDITION RECORD', title:'Rodri raises the passing benchmark', detail:'He surpassed his own 2022 record of 638 completed passes.', player:'Rodri', source:fifaRecords, sourceLabel:'FIFA · RECORDS'},
    {value:'6', unit:'EDITIONS WITH A GOAL', tag:'FIRST IN WORLD CUP HISTORY', title:'Ronaldo scores across six World Cups', detail:'Cristiano Ronaldo became the first player to score at six separate editions.', player:'Cristiano Ronaldo', source:fifaRecords, sourceLabel:'FIFA · RECORDS', secondary:guinness, secondaryLabel:'GUINNESS'},
    {value:'7', unit:'CLEAN SHEETS', tag:'SINGLE-EDITION GOALKEEPER RECORD', title:'Unai Simón sets a new shutout high', detail:'Seven clean sheets in eight games; the previous best in one edition was five.', player:'Unai Simón', team:'Spain', source:fifaRecords, sourceLabel:'FIFA · RECORDS'},
    {value:'16', unit:'SAVES · ONE MATCH', tag:'RECORD EQUALLED', title:'Eloy Room matches a World Cup best', detail:'He equalled Tim Howard’s 16-save mark—in 30 fewer minutes.', player:'Eloy Room', source:fifaRecords, sourceLabel:'FIFA · RECORDS'},
    {value:'6 + 6', unit:'GOALS EACH', tag:'FIRST-EVER TEAMMATE PAIRS', title:'Two duos reach the six-goal line', detail:'Bellingham–Kane and Dembélé–Mbappé became the first teammate pairs with six goals apiece in one edition.', players:['Jude Bellingham','Harry Kane'], source:fifaRecords, sourceLabel:'FIFA · RECORDS'},
    {value:'1st', unit:'MEN’S + WOMEN’S TITLES', tag:'NATIONAL TEAM MILESTONE', title:'Spain holds both world crowns at once', detail:'Spain became the first nation to hold the men’s and women’s World Cup titles simultaneously.', team:'Spain', source:fifaReview, sourceLabel:'FIFA · FINAL REVIEW'}
  ];
  const flagFor = team => D.flags?.[team] || D.standings?.find(t => t.Team_EN === team)?.Flag || '';
  const playerFor = name => D.scorers?.find(p => p.Player === name);
  const portraitFor = (name, team) => {
    const p = name && playerFor(name);
    return (p?.Photo && D.playerImages?.[p.Photo]) || p?.Photo_URL || (team && flagFor(team)) || '';
  };
  const noteMap = Object.fromEntries(addedPlayers.map(p => [p.name, p.note]));

  function addPlayerCards() {
    const grid = $('#scoutGrid');
    if (!grid) return;
    const already = new Set([...grid.querySelectorAll('[data-player]')].map(el => el.dataset.player.split('|')[1]));
    const cards = [];
    for (const [i, item] of addedPlayers.entries()) {
      if (already.has(item.name)) continue;
      const p = playerFor(item.name);
      if (!p) continue;
      const image = portraitFor(item.name, p.Team) || flagFor(p.Team);
      const flag = p.Flag || flagFor(p.Team);
      const age = Math.round(Number(p.Age || 0));
      const stage = ({'Group Stage':'GROUP STAGE','Round of 32':'ROUND OF 32','Round of 16':'ROUND OF 16','Quarter-final':'QUARTER-FINAL','Semi-final':'SEMI-FINAL','Third Place':'THIRD PLACE','Final':'FINAL'}[(() => { const stages=['Group Stage','Round of 32','Round of 16','Quarter-final','Semi-final','Third Place','Final']; const rows=(D.teamMatches||[]).filter(r=>r.Team===p.Team); return stages[Math.max(0,...rows.map(r=>stages.indexOf(r.Stage)))]||'Group Stage'; })()]);
      cards.push(`<button class="scout-card added-scout-card" style="--i:${i}" type="button" data-player="${esc(p.Team+'|'+p.Player)}" aria-label="Open ${esc(p.Player)} profile"><span class="scout-photo"><img class="player-photo" src="${esc(image)}" alt="${esc(p.Player)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(flag)}'"><img class="scout-flag" src="${esc(flag)}" alt="${esc(p.Team)} flag" loading="lazy"><span class="scout-signal">${esc(item.signal)}</span></span><span class="scout-card-copy"><span class="scout-team">${esc(p.Team)} · ${esc(p.Position||'—')}</span><b class="scout-name">${esc(p.Player)}</b><span class="scout-meta">AGE ${age} · ${esc(stage)}</span><span class="scout-stats"><b>${Number(p.Goals||0)}</b> G <span>·</span><b>${Number(p.Assists||0)}</b> A <span>·</span><b>${Number(p.MOTM||0)}</b> POTM</span></span></button>`);
    }
    grid.insertAdjacentHTML('beforeend', cards.join(''));
    grid.addEventListener('click', e => {
      const card = e.target.closest('[data-player]');
      if (!card) return;
      const name = card.dataset.player.split('|')[1];
      if (noteMap[name]) setTimeout(() => { const read = $('#dialogContent .dialog-read'); if (read) read.textContent = noteMap[name]; }, 0);
    });
  }

  function renderRecords() {
    const grid = $('#recordGrid');
    if (!grid) return;
    grid.innerHTML = records.map((r, i) => {
      const faces = r.players
        ? `<span class="record-pair">${r.players.map(name => { const p=playerFor(name); const img=portraitFor(name,p?.Team); return `<img src="${esc(img)}" alt="${esc(name)}" loading="lazy">`; }).join('')}</span>`
        : r.player
          ? `<img class="record-portrait" src="${esc(portraitFor(r.player,r.team||playerFor(r.player)?.Team))}" alt="${esc(r.player)}" loading="lazy" onerror="this.onerror=null;this.src='${esc(flagFor(r.team||playerFor(r.player)?.Team))}'">`
          : r.team
            ? `<img class="record-flag-art" src="${esc(flagFor(r.team))}" alt="${esc(r.team)} flag" loading="lazy">`
            : `<img class="record-portrait" src="${esc(r.art)}" alt="" loading="lazy">`;
      const subject = r.players ? r.players.join(' · ') : (r.player || r.team || 'FIFA WORLD CUP 2026');
      const links = `<a href="${esc(r.source)}" target="_blank" rel="noreferrer">${esc(r.sourceLabel)} ↗</a>${r.secondary ? `<a href="${esc(r.secondary)}" target="_blank" rel="noreferrer">${esc(r.secondaryLabel)} ↗</a>` : ''}`;
      return `<article class="record-card" style="--i:${i}"><div class="record-art ${r.team&&!r.player?'record-art-flag':''}">${faces}<span class="record-art-label">${esc(r.tag)}</span></div><div class="record-copy"><div class="record-stat"><strong>${esc(r.value)}</strong><span>${esc(r.unit)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.detail)}</p><div class="record-foot"><span>${esc(subject)}</span><div>${links}</div></div></div></article>`;
    }).join('');
  }

  function bindStadiumTransitions() {
    const overlay = $('#stadiumTransition');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let locked = false;
    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const hash = link.getAttribute('href');
      const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      if (reduced.matches) return;
      e.preventDefault();
      if (locked) return;
      locked = true;
      overlay?.classList.remove('is-playing');
      if (overlay) { void overlay.offsetWidth; overlay.classList.add('is-playing'); }
      window.setTimeout(() => {
        history.pushState(null, '', hash);
        target.scrollIntoView({behavior:'smooth', block:'start'});
        target.classList.remove('section-arrival');
        void target.offsetWidth;
        target.classList.add('section-arrival');
        window.setTimeout(() => target.classList.remove('section-arrival'), 1050);
      }, 130);
      window.setTimeout(() => { overlay?.classList.remove('is-playing'); locked = false; }, 720);
    });
  }

  addPlayerCards();
  renderRecords();
  bindStadiumTransitions();
})();
