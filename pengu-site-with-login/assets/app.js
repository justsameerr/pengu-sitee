(function () {
  'use strict';
  var SITE = Object.assign({ name: 'Pengu Bot 2.0', prefix: 'pengu', clientId: '', support: '', permissions: 117824, dataUrl: '' }, window.SITE || {});
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  // Builds elements without innerHTML, so player names can never inject markup.
  function el(tag, props) {
    var e = document.createElement(tag), kids = Array.prototype.slice.call(arguments, 2);
    Object.keys(props || {}).forEach(function (k) { var v = props[k]; if (v === false || v == null) return; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v); });
    (function add(list) { list.forEach(function (c) { if (c == null || c === false) return; if (Array.isArray(c)) return add(c); e.append(c.nodeType ? c : document.createTextNode(String(c))); }); })(kids);
    return e;
  }
  var fmt = function (n) { return Number(n).toLocaleString('en-US'); };
  // Counts a number up from zero (used by the home page stats).
  function countUp(node, v) {
    if (v == null) { node.textContent = '-'; return; }
    var end = Number(v); if (!isFinite(end) || matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = fmt(v); return; }
    var t0 = null; function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 900), e = 1 - Math.pow(1 - k, 3); node.textContent = fmt(Math.round(end * e)); if (k < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  // Scroll reveal: cards and rows fade up as they come into view. Also catches rows added later (tab switches, search).
  function setupReveal() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    var SEL = '.step,.feat,.band,.box,.phead,.cmd,.tile,.tbl tbody tr,.rar,.chat,.notice,.cat';
    function mark(scope) {
      var list = [];
      if (scope.matches && scope.matches(SEL)) list.push(scope);
      if (scope.querySelectorAll) list = list.concat(Array.prototype.slice.call(scope.querySelectorAll(SEL)));
      list.forEach(function (n, i) { if (!n.classList.contains('reveal')) { n.classList.add('reveal'); n.style.transitionDelay = (i % 6) * 70 + 'ms'; io.observe(n); } });
    }
    mark(document.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) mark(n); }); }); }).observe(document.body, { childList: true, subtree: true });
  }
  // Color wallpapers players can pick with `wallpaper set <name>` (same colors as the bot's cards).
  var WP = { ocean: ['#08233f', '#0f4c75'], sunset: ['#3a1230', '#b4472f'], forest: ['#0b2a14', '#2c6b3c'], sakura: ['#3a1636', '#b85a8a'], midnight: ['#070914', '#1a2262'], lava: ['#220806', '#a8330f'], mint: ['#07312b', '#1f9d7a'] };
  function wpStyle(name) { var c = WP[name]; return c ? 'background:linear-gradient(120deg,' + c[0] + ',' + c[1] + ')' : false; }
  function ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 90) return 'just now'; if (s < 5400) return Math.round(s / 60) + ' minutes ago'; if (s < 129600) return Math.round(s / 3600) + ' hours ago'; return Math.round(s / 86400) + ' days ago';
  }
  function put(parent) { Array.prototype.slice.call(arguments, 1).forEach(function (n) { if (n) parent.append(n); }); } // skips empty slots instead of printing "null"
  var notice = function (t) { return el('div', { class: 'notice', text: t }); };
  var params = new URLSearchParams(location.search);
  function avatar(p, cls) {
    var initial = el('div', { class: 'ava' + (cls ? ' ' + cls : ''), text: ((p && p.name) || '?').charAt(0).toUpperCase() });
    if (!p || !p.avatar) return initial;
    var img = el('img', { src: p.avatar, alt: '', loading: 'lazy', width: 88, height: 88, referrerpolicy: 'no-referrer' }), box = el('div', { class: 'ava' + (cls ? ' ' + cls : '') }, img);
    img.addEventListener('error', function () { box.replaceWith(initial); }); return box;
  }
  // Reads the stats the bot publishes to GitHub. The address is in config.js (dataUrl).
  // A 1-minute cache-buster makes browsers ask GitHub for the newest file at most once a minute.
  function loadStats() {
    if (!SITE.dataUrl) return Promise.resolve(null);
    return fetch(SITE.dataUrl + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return null; });
  }
  function inviteUrl(stats) {
    var b = (stats && stats.bot) || {}, id = b.clientId || SITE.clientId;
    return id ? 'https://discord.com/oauth2/authorize?client_id=' + encodeURIComponent(id) + '&permissions=' + (b.permissions || SITE.permissions) + '&scope=bot' : '';
  }
  function wire(stats) {
    var url = inviteUrl(stats);
    $$('[data-invite]').forEach(function (a) { if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else { a.classList.add('off'); a.removeAttribute('href'); a.title = 'The invite link is not set up yet'; } });
    var st = $('#status'); if (st) { if (stats && stats.updatedAt) { var fresh = Date.now() - new Date(stats.updatedAt).getTime() < 90 * 60e3; st.className = 'status' + (fresh ? ' live' : ''); st.textContent = 'Data updated ' + ago(stats.updatedAt); } else st.textContent = 'Live data not available yet'; }
    $$('[data-support]').forEach(function (a) { if (SITE.support) { a.href = SITE.support; a.target = '_blank'; a.rel = 'noopener'; } else a.replaceWith(document.createTextNode('the support server')); });
  }
  var prefix = function (stats) { return (stats && stats.bot && stats.bot.prefix) || SITE.prefix; };
  var pages = {
    home: function (stats) {
      var t = stats && stats.totals; var vals = { players: t && t.players, animals: t && t.animals, servers: stats && stats.bot && stats.bot.servers, commands: t && t.commands };
      $$('[data-stat]').forEach(function (n) { countUp(n, vals[n.getAttribute('data-stat')]); });
      var box = $('#teaser'); if (!box) return; box.textContent = '';
      if (!stats || !stats.animals) { box.append(notice('See the full list on the animal page.')); return; }
      stats.rarities.forEach(function (r) { var list = stats.animals.filter(function (a) { return a.rarity === r.id; }); if (!list.length) return;
        box.append(el('div', { class: 'rar' }, el('b', {}, el('i', { class: 'dot', style: 'background:' + r.color }), r.id), list.slice(0, 9).map(function (a) { return el('span', { title: a.name, text: a.emoji }); }), list.length > 9 ? el('small', { class: 'sm', text: '+' + (list.length - 9) + ' more' }) : null)); });
    },
    commands: function (stats) {
      var root = $('#cmds'), q = $('#q'), chips = $('#chips'), count = $('#count');
      if (!stats) { root.append(notice('The command list could not be loaded. Try again in a minute.')); return; }
      var P = prefix(stats), cats = stats.categories.filter(function (c) { return stats.commands.some(function (x) { return x.cat === c.id; }); }), cat = params.get('cat') || 'all', term = '';
      function pill(id, label) { var b = el('button', { class: 'pill' + (cat === id ? ' on' : ''), type: 'button', 'data-cat': id, text: label }); b.addEventListener('click', function () { cat = id; draw(); }); return b; }
      function card(c) { return el('div', { class: 'cmd', id: 'cmd-' + c.name }, el('h3', {}, el('span', { text: P + ' ' + c.name }), el('em', { text: c.cd + 's cooldown' })), el('p', { text: c.desc || 'No description.' }), el('code', { class: 'use', text: P + ' ' + c.usage }), c.aliases.length ? el('div', { class: 'alias', text: 'Also: ' + c.aliases.join(', ') }) : null); }
      function draw() {
        chips.textContent = ''; [pill('all', 'All')].concat(cats.map(function (c) { return pill(c.id, c.emoji + ' ' + c.title); })).forEach(function (b) { chips.append(b); });
        root.textContent = ''; var t = term.trim().toLowerCase(), shown = 0;
        cats.forEach(function (c) { if (cat !== 'all' && cat !== c.id) return;
          var list = stats.commands.filter(function (x) { return x.cat === c.id && (!t || [x.name, x.desc, x.usage].concat(x.aliases).join(' ').toLowerCase().indexOf(t) >= 0); }); if (!list.length) return; shown += list.length;
          root.append(el('h2', { class: 'cat', id: c.id }, c.emoji + ' ' + c.title, el('small', { text: c.blurb })), el('div', { class: 'cmds' }, list.map(card))); });
        count.textContent = shown + ' command' + (shown === 1 ? '' : 's'); if (!shown) root.append(notice('No commands match that search.'));
      }
      q.addEventListener('input', function () { term = q.value; draw(); }); draw();
      if (location.hash.indexOf('#cmd-') === 0) { var target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView(); }
    },
    leaderboard: function (stats) {
      var tabs = $('#tabs'), body = $('#rows'), q = $('#q'), meta = $('#count');
      if (!stats || !stats.boards) { body.textContent = ''; body.append(notice('The leaderboard could not be loaded yet. It updates automatically once the bot has published its data. Try again in a few minutes.')); return; }
      var keys = Object.keys(stats.boards), board = keys.indexOf(params.get('board')) >= 0 ? params.get('board') : keys[0], term = '';
      function draw() {
        tabs.textContent = ''; keys.forEach(function (k) { var b = el('button', { class: 'pill' + (k === board ? ' on' : ''), type: 'button', text: stats.boards[k].label }); b.addEventListener('click', function () { board = k; history.replaceState(null, '', '?board=' + k); draw(); }); tabs.append(b); });
        body.textContent = ''; var t = term.trim().toLowerCase(), rows = stats.boards[board].rows.map(function (r, i) { return { r: r, i: i, p: stats.players[r.id] }; }).filter(function (x) { return x.p && (!t || x.p.name.toLowerCase().indexOf(t) >= 0); });
        meta.textContent = 'Top ' + stats.boards[board].rows.length + '  ·  updated ' + (stats.updatedAt ? ago(stats.updatedAt) : 'never');
        if (!rows.length) { body.append(notice(t ? 'Nobody on this board matches that name.' : 'Nobody is on the board yet. Be the first with ' + prefix(stats) + ' hunt!')); return; }
        body.append(el('table', { class: 'tbl' }, el('tbody', {}, rows.map(function (x) {
          return el('tr', { class: 'r' + (x.i + 1) }, el('td', { class: 'rk', text: '#' + (x.i + 1) }), el('td', {}, el('a', { class: 'pl' + (WP[x.p.wallpaper] ? ' wp' : ''), href: 'player.html?id=' + encodeURIComponent(x.r.id), style: wpStyle(x.p.wallpaper) }, avatar(x.p), el('div', {}, el('div', { class: 'nm' }, x.p.name, ' ', el('span', { class: 'bd', text: x.p.badges.slice(-4).map(function (b) { return b.icon; }).join('') })), x.p.title ? el('div', { class: 'sm', text: x.p.title }) : el('div', { class: 'sm', text: 'Level ' + x.p.level })))), el('td', { class: 'val', text: fmt(x.r.v) }));
        })))); }
      q.addEventListener('input', function () { term = q.value; draw(); }); draw();
    },
    player: function (stats) {
      var root = $('#player'), id = params.get('id'), p = stats && stats.players && stats.players[id];
      if (!p) { root.append(notice(stats ? 'That player is not on the leaderboard. Only top players are listed, and anyone can hide their page.' : 'Player data could not be loaded.'), el('p', {}, el('a', { href: 'leaderboard.html', text: 'Back to the leaderboard' }))); return; }
      document.title = p.name + ' - ' + SITE.name; var cur = (stats.bot && stats.bot.currency) || 'cowoncy', pct = Math.round(Math.min(1, p.xp / p.need) * 100);
      var kv = function (l, v) { return el('div', {}, el('b', { text: v }), el('span', { text: l })); };
      put(root, el('div', { class: 'phead' }, avatar(p), el('div', { style: 'flex:1' }, el('h1', { text: p.name }), p.title ? el('div', { class: 'sm', text: p.title }) : null, el('div', { class: 'sm', text: 'Level ' + p.level + '  ·  ' + fmt(p.xp) + ' / ' + fmt(p.need) + ' XP' }), el('div', { class: 'bar2' }, el('i', { style: 'width:' + pct + '%' })))),
        el('div', { class: 'box' }, el('div', { class: 'kv' }, kv(cur, fmt(p.cash)), kv('Hunts', fmt(p.hunts)), kv('Battles', p.wins + 'W / ' + p.losses + 'L'), kv('Species found', p.species + ' / ' + stats.animals.length), kv('Animals owned', fmt(p.animals)), kv('Daily streak', fmt(p.streak)))),
        el('div', { class: 'box' }, el('h2', { text: 'Badges' }), el('div', { class: 'badges' }, p.badges.map(function (b) { return el('span', { title: b.req, text: b.icon + ' ' + b.name }); }))),
        p.team.length ? el('div', { class: 'box' }, el('h2', { text: 'Battle team' }), el('div', { class: 'pets' }, p.team.map(function (t) { return el('div', { class: 'pet' }, el('em', { text: t.emoji }), el('b', { text: t.name }), el('div', { class: 'sm', text: 'Level ' + t.lvl + '  ·  ' + t.rarity })); }))) : null,
        p.rare.length ? el('div', { class: 'box' }, el('h2', { text: 'Rarest animals' }), el('div', { style: 'font-size:34px;letter-spacing:6px', text: p.rare.join('') })) : null);
    },
    animals: function (stats) {
      var root = $('#animals'), q = $('#q'), chips = $('#chips'), count = $('#count');
      if (!stats || !stats.animals) { root.append(notice('The animal list could not be loaded. Try again in a minute.')); return; }
      var rar = params.get('rarity') || 'all', term = '';
      function draw() {
        chips.textContent = ''; [['all', 'All']].concat(stats.rarities.map(function (r) { return [r.id, r.id]; })).forEach(function (x) { var b = el('button', { class: 'pill' + (rar === x[0] ? ' on' : ''), type: 'button', text: x[1].charAt(0).toUpperCase() + x[1].slice(1) }); b.addEventListener('click', function () { rar = x[0]; draw(); }); chips.append(b); });
        root.textContent = ''; var t = term.trim().toLowerCase(), shown = 0;
        stats.rarities.forEach(function (r) { if (rar !== 'all' && rar !== r.id) return; var list = stats.animals.filter(function (a) { return a.rarity === r.id && (!t || a.name.indexOf(t) >= 0); }); if (!list.length) return; shown += list.length;
          root.append(el('h2', { class: 'cat' }, el('i', { class: 'dot', style: 'background:' + r.color }), r.id.charAt(0).toUpperCase() + r.id.slice(1), el('small', { text: list.length + ' species  ·  sells for ' + fmt(r.value) + ' ' + ((stats.bot && stats.bot.currency) || 'cowoncy') })),
            el('div', { class: 'tiles' }, list.map(function (a) { return el('div', { class: 'tile' }, el('em', { text: a.emoji }), el('b', { text: a.name })); }))); });
        count.textContent = shown + ' animal' + (shown === 1 ? '' : 's'); if (!shown) root.append(notice('No animals match that search.'));
      }
      q.addEventListener('input', function () { term = q.value; draw(); }); draw();
    },
  };
  // ----- light / dark mode, header buttons and the nudging "Add to Discord" button -----
  function currentTheme() { var t = document.documentElement.getAttribute('data-theme'); if (t) return t; return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function setupTheme() {
    var saved = null; try { saved = localStorage.getItem('pengu-theme'); } catch (e) { /* private mode */ }
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);
  }
  function setupHeader() {
    var bar = document.querySelector('.top .bar'), inv = bar && bar.querySelector('[data-invite]'); if (!bar || !inv) return;
    var tg = el('button', { type: 'button', class: 'theme-toggle', 'aria-label': 'Switch light and dark mode' });
    function label() { var dark = currentTheme() === 'dark'; tg.textContent = dark ? '\u2600' : '\u263E'; tg.title = dark ? 'Switch to light mode' : 'Switch to dark mode'; }
    tg.addEventListener('click', function () { var next = currentTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', next); try { localStorage.setItem('pengu-theme', next); } catch (e) { /* ignore */ } label(); });
    label(); bar.insertBefore(tg, inv);
    if (SITE.support) {
      bar.insertBefore(el('a', { class: 'btn ghost hdr-join', href: SITE.support, target: '_blank', rel: 'noopener', text: 'Join server' }), inv);
      var cta = document.querySelector('.cta');
      if (cta) cta.appendChild(el('a', { class: 'btn ghost big join-btn', href: SITE.support, target: '_blank', rel: 'noopener', text: 'Join server' }));
    }
  }
  // Header login: asks the login function who is signed in. If the functions are not deployed, nothing is shown.
  function setupAccount() {
    var bar = document.querySelector('.top .bar'), inv = bar && bar.querySelector('[data-invite]'); if (!bar || !inv) return;
    fetch('/.netlify/functions/me', { cache: 'no-store' }).then(function (r) { if (r.status === 404) return null; return r.json(); }).then(function (d) {
      if (d === null) return;
      if (d.user) {
        bar.insertBefore(el('a', { class: 'btn ghost acct', href: 'player.html?id=' + encodeURIComponent(d.user.id), title: 'Your profile', text: d.user.name }), inv);
        bar.insertBefore(el('a', { class: 'btn ghost acct-out', href: '/.netlify/functions/logout', text: 'Log out' }), inv);
      } else {
        bar.insertBefore(el('a', { class: 'btn ghost acct', href: '/.netlify/functions/discord-login', text: 'Log in with Discord' }), inv);
      }
    }).catch(function () { /* offline or not deployed: show nothing */ });
  }
  // Every 6 seconds the Add to Discord buttons give a little wiggle to catch the eye (skipped if reduce motion is on).
  function startNudge() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setInterval(function () { $$('a[data-invite]').forEach(function (a) { a.classList.add('nudge'); setTimeout(function () { a.classList.remove('nudge'); }, 850); }); }, 6000);
  }
  document.addEventListener('DOMContentLoaded', function () {
    setupTheme();
    setupHeader();
    setupAccount();
    setupReveal();
    startNudge();
    loadStats().then(function (stats) { wire(stats); var f = pages[document.body.getAttribute('data-page')]; if (f) f(stats); });
  });
})();
