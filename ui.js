/* Lista de Oradores — interface */
(function () {
'use strict';
const C = Core, D = C.D, norm = C.norm, key = C.key;
const LS = 'lista-oradores-v1';
const TABS = ['inicio', 'prog', 'escalar', 'pend', 'mais'];
const TITLES = { busca:'Busca geral', informes:'Histórico de informes', lixeira:'Exclusões recentes', arranjos: 'Arranjos entre congregações', inicio: 'Lista de Oradores', prog: 'Programação', escalar: 'Quem escalar', pend: 'Pendências', mais: 'Mais opções', livres: 'Datas livres', compartilhar: 'Compartilhar', rodizio: 'Rodízio', relatorios: 'Relatórios', cadastros: 'Cadastros', dados: 'Dados e planilha', config: 'Configurações', ajuda: 'Ajuda', hist: 'Histórico', msgs: 'Confirmações' };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
let st = load();
const ui = { route: 'inicio', esc: { data: '', int: null, cong: '', draft: {}, no: 8, ne: 8 }, prog: { filtro: 'prox', tipo: 'todos', q:'', ordem:'data', mes: '', dia: '', orador: '' }, pend: { dias: null }, livres: { ini: '', fim: '', dow: null }, comp: { ini: '', fim: '', tipo: 'local', orador: '' }, rod: { aba: 'o', n: 30, q: '', tipo:'local', ini:'', fim:'', ordem:'lastD' }, rel: { ano: 'todos', aba: 'o', n: 30, tipo: 'local' }, cad: { aba: 'o', q: '', ordem:'nome' }, busca:{q:'',ordem:'nome'}, logs:{q:''}, form: null, imp: null, hist: { tipo: 'o', id: '', modalidade: 'todos' }, hstack: [], hfrom: 'cadastros', msgs: { dias: 30 } };

function load() { try { const raw = localStorage.getItem(LS); if (raw) return C.restoreState(JSON.parse(raw)); } catch (e) { setTimeout(() => toast('Não foi possível carregar os dados. Restaure um backup válido.'), 0); } return C.emptyState(); }
function save() { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) { toast('Não foi possível salvar no aparelho.'); } }
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = { home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 5"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' };
I.message = '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>';
I.check = '<path d="M20 6L9 17l-5-5"/>';
const svg = n => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>';
let tt; function toast(m, undoId) { const t = $('#toast'); if (undoId) t.innerHTML = esc(m) + ' <button class="btn sm" data-act="undoDelete" data-id="' + esc(undoId) + '">Desfazer</button>'; else t.textContent = m; t.style.display = 'block'; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', undoId ? 10000 : 2600); }
let modalReturn = null, labelCounter = 0;
function applyAppearance() {
  const cfg = st.config, dark = cfg.temaVisual === 'escuro' || (cfg.temaVisual === 'sistema' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  document.documentElement?.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement?.setAttribute('data-text', cfg.tamanhoTexto || 'normal');
  document.documentElement?.setAttribute('data-contrast', cfg.altoContraste ? 'high' : 'normal');
}
function enhanceAccessibility() {
  document.querySelectorAll('.field').forEach(field => {
    const control = field.querySelector('input,select,textarea'), label = field.querySelector('label');
    if (control && label) { if (!control.id) control.id = 'field-' + (++labelCounter); label.htmlFor = control.id; }
    else if (control && !control.hasAttribute('aria-label')) control.setAttribute('aria-label',control.placeholder || 'Busca');
  });
  document.querySelectorAll('div[data-act],div[data-go]').forEach(el => { el.setAttribute('role','button'); el.tabIndex = 0; });
  document.querySelectorAll('#tabs button').forEach(el => el.setAttribute('aria-current',el.classList.contains('on') ? 'page' : 'false'));
  const modal = document.querySelector('.sheet'), title = modal?.querySelector?.('h2');
  if (title) { title.id = 'dialog-title'; modal.setAttribute('aria-labelledby',title.id); }
}
function preferenceSettings() {
  const select = (title,prop,options) => '<div class="field"><label>' + title + '</label><select data-chg="preference" data-prop="' + prop + '">' + options.map(([v,t]) => '<option value="' + v + '" ' + (st.config[prop] === v ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
  return '<div class="card"><h3>Aparência e acessibilidade</h3>' + select('Tema','temaVisual',[['claro','Claro'],['escuro','Modo noturno'],['sistema','Acompanhar o aparelho']]) + select('Tamanho do texto','tamanhoTexto',[['normal','Normal'],['grande','Grande'],['maior','Muito grande']]) + '<div class="field"><label>Contraste reforçado</label><select data-chg="contrast"><option value="nao" ' + (!st.config.altoContraste ? 'selected' : '') + '>Desativado</option><option value="sim" ' + (st.config.altoContraste ? 'selected' : '') + '>Ativado</option></select></div></div>';
}
function sheet(html) { const o = $('#overlay'); if (!o.classList.contains?.('on')) modalReturn = document.activeElement; o.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="Detalhes e edição" tabindex="-1">' + html + '</div>'; o.classList.add('on'); enhanceAccessibility(); o.querySelector?.('.sheet')?.focus(); $('#app').setAttribute?.('inert',''); }
function closeSheet() { const o = $('#overlay'); o.classList.remove('on'); o.innerHTML = ''; $('#app').removeAttribute?.('inert'); if (modalReturn?.isConnected) modalReturn.focus(); modalReturn = null; }
function go(r) { if (r === 'msgs') r = 'pend'; ui.route = r; closeSheet(); render(true); }
function render(reset) {
  const v = $('#view'), sc = v.scrollTop;
  v.innerHTML = (V[ui.route] || V.inicio)();
  $('#top h1').textContent = TITLES[ui.route] || 'Lista de Oradores';
  const cur = ui.route === 'hist' ? ui.hfrom : ui.route; document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.go === (TABS.includes(cur) ? cur : 'mais')));
  $('#back').style.display = TABS.includes(ui.route) ? 'none' : 'block';
  v.scrollTop = reset ? 0 : sc;
  applyAppearance(); enhanceAccessibility();
}
const nextDate = () => { const t = D.today(), used = new Set(st.prog.filter(p => p.tipo !== 'envio').map(p => p.data)); let d = t + ((st.config.diaSemana - D.dow(t) + 7) % 7); for (let i = 0; i < 300; i++, d += 7) if (!used.has(D.iso(d))) return D.iso(d); return D.iso(t); };
const fmtDias = n => n == null ? 'Nunca' : n + (n === 1 ? ' dia' : ' dias');
const lastTxt = o => o.lastD == null ? 'Nunca' : D.brFull(o.lastD) + ' · ' + fmtDias(o.dias);
const sortedOrad = () => st.oradores.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

function modalidadeSelect(value, change, todos = true) {
  const options = [['local', 'Discurso na congregação local'], ['envio', 'Envio para outras congregações']];
  if (todos) options.unshift(['todos', 'Todas as modalidades']);
  return '<div class="field"><label>Modalidade</label><select data-chg="' + change + '">' + options.map(([v,t]) => '<option value="' + v + '" ' + (value === v ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>';
}
const PALETTES = { azul: ['Azul clássico', '#1B5E7B', '#123A4D'], indigo: ['Azul índigo', '#394B85', '#28365E'], petroleo: ['Azul petróleo', '#246775', '#174651'], verde: ['Verde clássico', '#36765c', '#245846'], floresta: ['Verde floresta', '#286044', '#193F2D'], oliva: ['Verde oliva', '#566729', '#39461B'] };
function paletteFor(kind) { const value = st.config[kind + 'Palette']; return Object.hasOwn(PALETTES, value) ? value : kind === 'local' ? 'azul' : 'verde'; }
function paletteSettings() {
  return '<div class="card"><h3>Cores da tela inicial</h3><p class="sub">Escolha as cores dos cards e botões de cada seção.</p>' + [['local','Discursos locais'],['envio','Envios']].map(([kind,label]) => '<div class="field"><label>' + label + '</label><select data-chg="palette" data-kind="' + kind + '">' + Object.entries(PALETTES).map(([id,p]) => '<option value="' + id + '" ' + (paletteFor(kind) === id ? 'selected' : '') + '>' + p[0] + '</option>').join('') + '</select><div class="palette-preview theme-' + paletteFor(kind) + '">Prévia · ' + label + '</div></div>').join('') + '</div>';
}
function speakerHeading(p) {
  const nome = p.orador || 'Orador a definir', congregacao = p.orador ? C.origemDe(st, p) : '';
  return esc(nome) + (congregacao ? ' • ' + esc(congregacao) : '');
}
function nextCard(label, p, empty) {
  return '<div class="hero next-card"><small>' + label + '</small>' + (p ? '<b>' + speakerHeading(p) + '</b><div>' + D.brFull(p.d) + ' · ' + esc(p.destino || st.config.local || 'Congregação local') + '</div><div class="next-topic">' + (p.esboco ? 'Nº ' + p.esboco + ' · ' + esc(C.temaDe(st, p.esboco) || 'Tema a definir') : 'Tema a definir') + '</div>' : '<b>' + empty + '</b><div>Novos agendamentos aparecerão aqui.</div>') + '</div>';
}
function matchesSearch(text, query) { return C.searchKey(query).split(/\s+/).filter(Boolean).every(w => C.searchKey(text).includes(w)); }
function sortSelect(value,action,options) { return '<div class="field"><label>Ordenar por</label><select data-chg="' + action + '">' + options.map(([v,t]) => '<option value="' + v + '" ' + (value === v ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>'; }
function searchSort(query,order,search,sort,options) { return '<div class="row"><div class="field"><label>Buscar</label><input type="search" value="' + esc(query) + '" data-inp="' + search + '" placeholder="Nome, congregação, tema ou data"></div>' + sortSelect(order,sort,options) + '</div>'; }
function searchInput(el, object, prop) { const start = el.selectionStart; object[prop] = el.value; render(); const input = document.querySelector('[data-inp="' + el.dataset.inp + '"]'); input?.focus?.(); if (typeof start === 'number') input?.setSelectionRange?.(start,start); }

function itemProg(r, withCongregation = false) {
  const al = C.alerta(st, r), f = C.faltas(r); let chips = '<span class="chip">' + (r.tipo === 'envio' ? 'Envio' : 'Local') + ' · ' + esc(r.origem || 'origem a definir') + ' → ' + esc(r.destino || 'congregação local') + '</span>';
  if (al.conflito) chips += '<span class="chip bad">Conflito de agenda no mesmo dia</span>';
  if (al.any) chips += '<span class="chip bad">⚠ repetição' + (al.orador ? ' de orador' : '') + (al.esboco ? ' de esboço' : '') + '</span>';
  if (r.tipo !== 'envio') chips += f.includes('confirmação') ? (r.pedido ? '<span class="chip">pedido enviado em ' + D.br(D.parse(r.pedido)) + '</span>' : '<span class="chip warn">sem confirmação</span>') : '<span class="chip ok">confirmado</span>';
  if (f.includes('cântico')) chips += '<span class="chip warn">sem cântico</span>'; else chips += '<span class="chip">cântico ' + esc(r.cantico) + '</span>';
  if (f.includes('imagens')) chips += '<span class="chip warn">imagens?</span>'; else chips += '<span class="chip">imagens ' + esc(r.imagens) + '</span>';
  return '<div class="item" data-act="editProg" data-id="' + r.id + '" aria-label="' + esc(D.brFull(r.d) + ' · ' + (r.orador || 'Orador a definir')) + '"><div class="d"><b>' + D.br(r.d).slice(0, 2) + '</b><small>' + D.dow3(r.d) + '</small></div><div class="m"><b>' + (withCongregation === true ? speakerHeading(r) : esc(r.orador || 'Orador a definir')) + '</b><div>' + (withCongregation === true ? '' : esc(r.cong || '')) + (r.esboco ? (withCongregation === true ? 'Nº ' : ' · Nº ') + r.esboco + ': ' + esc(C.temaDe(st, r.esboco)) : (withCongregation === true ? 'Tema a definir' : ' · tema a definir')) + '</div>' + chips + '</div></div>';
}
const V = {};
V.busca = () => {
  const b = ui.busca, results = b.q.trim() ? C.buscar(st,b.q,b.ordem) : [];
  return searchSort(b.q,b.ordem,'globalSearch','globalSort',[['nome','Ordem alfabética'],['cong','Congregação'],['data','Data']]) + '<p class="sub">Busque por nome, congregação, número, tema ou data. A busca ignora acentos.</p>' + (b.q.trim() ? '<p role="status">' + results.length + ' resultados</p>' : '') + results.slice(0,150).map(x => '<div class="item" data-act="searchResult" data-t="' + x.tipo + '" data-v="' + esc(x.id) + '"><div class="m"><b>' + esc(x.nome) + '</b><div>' + esc(x.cong) + (x.data ? ' · ' + D.brFull(D.parse(x.data)) : '') + ' · ' + ({o:'Orador',c:'Congregação',e:'Esboço',p:'Programação'}[x.tipo]) + '</div></div></div>').join('') + (results.length > 150 ? '<p class="sub">Mostrando 150 resultados. Refine a busca.</p>' : '');
};
V.informes = () => {
  const logs = (st.informes || []).slice().reverse().filter(x => matchesSearch([x.snapshot.orador,x.snapshot.destino,x.snapshot.data,x.texto].join(' '),ui.logs.q));
  return '<div class="field"><label>Buscar informes</label><input type="search" value="' + esc(ui.logs.q) + '" data-inp="logSearch"></div><p class="sub">Preparar, copiar ou abrir uma mensagem não comprova envio ou entrega. Alterações posteriores ficam sinalizadas.</p>' + (logs.length ? logs.map(x => '<div class="item" data-act="viewLog" data-id="' + esc(x.id) + '"><div class="m"><b>' + esc(x.snapshot.orador) + ' → ' + esc(x.snapshot.destino) + '</b><div>' + esc(new Date(x.quando).toLocaleString('pt-BR')) + ' · ' + esc(x.acao) + '</div><span class="chip ' + (C.informeAlterado(st,x) ? 'warn' : '') + '">' + (C.informeAlterado(st,x) ? 'Programação alterada ou excluída' : 'Programação sem alterações') + '</span></div></div>').join('') : '<div class="empty">Nenhum informe registrado.</div>');
};
V.lixeira = () => {
  const items = (st.lixeira || []).filter(x => Date.now()-x.quando <= 7*86400000).slice().reverse();
  return '<p class="sub">Até 50 exclusões individuais ficam disponíveis por 7 dias. Restaurar preserva os outros registros e bloqueia conflitos.</p>' + (items.length ? items.map(x => '<div class="card"><h3>' + esc(x.registro.nome || x.registro.orador || x.registro.tema || x.registro) + '</h3><p class="sub">' + esc(x.colecao) + ' · ' + new Date(x.quando).toLocaleString('pt-BR') + '</p><button class="btn" data-act="undoDelete" data-id="' + esc(x.id) + '">Restaurar</button></div>').join('') : '<div class="empty">Nenhuma exclusão recente.</div>');
};
V.inicio = () => {
  const t = D.today(), k = C.indicadores(st, t); let h = '';
  if (!st.prog.length && !st.oradores.length) h += '<div class="card"><h3>Bem-vindo!</h3><p class="sub">Traga a sua planilha (.xlsx) para começar, ou cadastre os dados direto no aplicativo.</p><button class="btn primary block" data-go="dados">Importar planilha</button><button class="btn block" data-go="cadastros">Cadastrar oradores</button></div>';
  const proximosLocais = C.rows(st).filter(r => r.tipo !== 'envio' && r.d >= t).sort((a,b) => a.d - b.d);
  const p = k.prox, envios = C.rows(st).filter(r => r.tipo === 'envio'), proximosEnvios = envios.filter(r => r.d >= t).sort((a,b) => a.d - b.d);
  const hoje = C.rows(st).filter(r => r.d === t), locaisHoje = hoje.filter(r => r.tipo !== 'envio').length;
  h += '<div class="welcome"><span>Olá! 👋</span><h2>Temos algum agendamento para hoje?</h2><p>' + (hoje.length ? locaisHoje + ' na congregação local · ' + (hoje.length - locaisHoje) + ' envios para outras congregações.' : 'Hoje não há discursos agendados. Vamos organizar os próximos?') + '</p></div>';
  h += '<section class="home-section theme-' + paletteFor('local') + '" aria-label="Discursos locais"><div class="sec">Na congregação local</div>' + nextCard('Próximo discurso local', p, 'Nenhum discurso local agendado');
  if (proximosLocais.length) h += '<div class="sec">Próximos discursos locais</div>' + proximosLocais.slice(0,3).map(r => itemProg(r, true)).join('');
  h += '<div class="kpis"><div class="kpi"><b>' + k.discursosAno + '</b><span>Discursos locais em ' + D.year(t) + '</span></div><div class="kpi"><b>' + k.livres8 + '</b><span>Datas locais livres em 8 semanas</span></div></div><div class="row home-actions"><button class="btn primary" data-act="newProg">Agendar local</button><button class="btn" data-go="escalar">Quem escalar</button><button class="btn" data-act="verLocais">Ver programação local</button><button class="btn" data-go="pend">Pendências</button></div></section>';
  const e = proximosEnvios[0];
  h += '<section class="home-section theme-' + paletteFor('envio') + '" aria-label="Envios"><div class="sec">Oradores locais em outras congregações</div>' + nextCard('Próximo envio', e, 'Nenhum envio agendado');
  if (proximosEnvios.length) h += '<div class="sec">Próximos envios</div>' + proximosEnvios.slice(0,3).map(r => itemProg(r, true)).join('');
  h += '<div class="kpis"><div class="kpi"><b>' + proximosEnvios.length + '</b><span>Envios futuros</span></div><div class="kpi"><b>' + envios.filter(r => D.year(r.d) === D.year(t)).length + '</b><span>Envios em ' + D.year(t) + '</span></div></div><div class="row home-actions"><button class="btn primary" data-act="newEnvio">Agendar envio</button><button class="btn" data-go="arranjos">Ver arranjos</button><button class="btn" data-act="verEnvios">Ver todos os envios</button><button class="btn" data-act="compEnvios">Compartilhar envios</button></div>';
  h += '</section>';
  const cf = C.confirmacoes(st, t, st.config.diasPendencias || 30);
  h += '<div class="card"><h3>Acompanhamento</h3><div class="sub">' + cf.length + ' discursos locais sem confirmação · ' + k.pendencias + ' programações com pendências</div><div class="row home-actions"><button class="btn" data-go="rodizio">Rodízio</button><button class="btn" data-go="livres">Datas livres</button></div></div>';
  return h;
};
function calendarView() {
  const p = ui.prog, today = D.iso(D.today());
  if (!p.mes) { p.mes = today.slice(0,7); p.dia = today; }
  const month = C.calendario(st, p.mes, p.tipo, p.orador);
  if (!month) { p.mes = today.slice(0,7); p.dia = today; return calendarView(); }
  if (!p.dia.startsWith(p.mes)) p.dia = p.mes + '-01';
  const selected = month.cells.find(c => c.data === p.dia);
  const names = [...new Set(C.rows(st).map(r => r.orador).filter(Boolean))].sort((a,b) => a.localeCompare(b,'pt-BR'));
  const label = MESES[new Date(month.first * 86400000).getUTCMonth()] + ' ' + D.year(month.first);
  let h = '<div class="calendar-card card"><div class="calendar-toolbar"><button class="btn" data-act="calendarMonth" data-step="-1" aria-label="Mês anterior">‹</button><h2 aria-live="polite">' + label + '</h2><button class="btn" data-act="calendarMonth" data-step="1" aria-label="Próximo mês">›</button></div><button class="btn sm block" data-act="calendarToday">Hoje</button>' + modalidadeSelect(p.tipo, 'calendarTipo') + '<div class="field"><label>Orador</label><select data-chg="calendarOrador"><option value="">Todos os oradores</option>' + names.map(n => '<option value="' + esc(n) + '" ' + (n === p.orador ? 'selected' : '') + '>' + esc(n) + '</option>').join('') + '</select></div><div class="calendar-grid">' + ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => '<span class="calendar-weekday">' + d + '</span>').join('');
  month.cells.forEach(c => {
    if (!c.noMes) { h += '<span class="calendar-outside" aria-hidden="true"></span>'; return; }
    const description = D.brFull(c.d) + ': ' + c.locais + ' locais, ' + c.envios + ' envios' + (c.livre ? ', data local livre' : '');
    h += '<button class="calendar-day' + (c.data === p.dia ? ' selected' : '') + (c.data === today ? ' today' : '') + '" data-act="calendarDay" data-v="' + c.data + '" aria-label="' + description + '" aria-pressed="' + (c.data === p.dia) + '"' + (c.data === today ? ' aria-current="date"' : '') + '><b>' + Number(c.data.slice(-2)) + '</b><span class="calendar-counts">' + (c.locais ? '<span class="calendar-local" aria-hidden="true">L ' + c.locais + '</span>' : '') + (c.envios ? '<span class="calendar-envio" aria-hidden="true">E ' + c.envios + '</span>' : '') + (c.livre && !c.registros.length ? '<span class="calendar-free" aria-hidden="true">Livre</span>' : '') + '</span></button>';
  });
  h += '</div><p class="sub">L: discurso local · E: envio. Livre: dia de reunião sem orador local, considerando todos os registros.</p></div><div class="calendar-details" aria-live="polite"><h3>' + D.brFull(D.parse(p.dia)) + ' · ' + selected.registros.length + ' agendamentos</h3>' + (selected.registros.length ? selected.registros.map(itemProg).join('') : '<div class="empty">Nenhum agendamento para os filtros selecionados.</div>') + '</div><button class="btn primary block" data-act="calendarNew">+ Agendar nesta data</button>';
  return h;
}
V.prog = () => {
  if (st.config.visualizacao === 'calendario') return calendarView();
  const t = D.today(), R = C.rows(st).sort((a, b) => a.d - b.d), anos = [...new Set(R.map(r => D.year(r.d)))].sort();
  let f = ui.prog.filtro; if (f === 'prox' && !R.some(r => r.d >= t) && R.length) f = ui.prog.filtro = 'tudo';
  let list = f === 'prox' ? R.filter(r => r.d >= t) : f === 'tudo' ? R : R.filter(r => D.year(r.d) === Number(f));
  list = C.ordenar(list.filter(r => (ui.prog.tipo === 'todos' || r.tipo === ui.prog.tipo) && matchesSearch([r.orador,r.origem,r.destino,r.data,D.brFull(r.d),r.esboco,C.temaDe(st,r.esboco)].join(' '),ui.prog.q)),ui.prog.ordem); 
  let h = '<div class="seg"><button data-act="pf" data-v="prox" class="' + (f === 'prox' ? 'on' : '') + '">Próximos</button>' + anos.map(a => '<button data-act="pf" data-v="' + a + '" class="' + (f == a ? 'on' : '') + '">' + a + '</button>').join('') + '<button data-act="pf" data-v="tudo" class="' + (f === 'tudo' ? 'on' : '') + '">Tudo</button></div>';
  h = '<div class="field"><label>Programação</label><select data-chg="progTipo">' + [['todos','Todos os discursos'],['local','Na congregação local'],['envio','Envios para outras congregações']].map(([v,t]) => '<option value="' + v + '" ' + (ui.prog.tipo === v ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>' + h;
  if (!list.length) h += '<div class="empty">Nenhum discurso aqui ainda.<br>Toque em + para lançar o primeiro.</div>';
  h += searchSort(ui.prog.q,ui.prog.ordem,'progSearch','progSort',[['data','Data'],['orador','Ordem alfabética'],['destino','Congregação de destino'],['origem','Congregação de origem']]);
  let mes = '';
  list.forEach(r => { const m = MESES[new Date(r.d * 86400000).getUTCMonth()] + ' ' + D.year(r.d); if (m !== mes && ui.prog.ordem === 'data') { mes = m; h += '<div class="sec">' + m + '</div>'; } h += itemProg(r); });
  return h + '<button class="fab" data-act="newProg" aria-label="Novo discurso">+</button>';
};
V.escalar = () => {
  const e = ui.esc; if (!e.data) e.data = nextDate(); if (e.int == null) e.int = st.config.intervalo;
  const R = C.escalar(st, e.data, e.int, e.cong), dr = e.draft;
  let h = '<div class="card"><div class="row"><div class="field"><label>Data do discurso</label><input type="date" value="' + e.data + '" data-chg="escData"></div><div class="field"><label>Intervalo mínimo (dias)</label><input type="number" min="0" value="' + e.int + '" data-chg="escInt"></div></div><div class="field" style="margin:0"><label>Congregação (opcional)</label><select data-chg="escCong"><option value="">Todas</option>' + C.allCongs(st).map(c => '<option ' + (key(c) === key(e.cong) ? 'selected' : '') + ' value="' + esc(c) + '">' + esc(c) + '</option>').join('') + '</select></div></div>';
  h += '<div class="kpis"><div class="kpi"><b>' + R.disponiveis.length + '</b><span>Oradores disponíveis (de ' + R.total + ')</span></div><div class="kpi"><b>' + R.esbLivres + '</b><span>Esboços disponíveis</span></div></div>';
  h += '<div class="sec">Oradores (há mais tempo sem discursar)</div>';
  if (!R.disponiveis.length) h += '<div class="empty">Nenhum orador disponível nessa data.</div>';
  R.disponiveis.slice(0, e.no).forEach(o => { h += '<div class="item"><div class="m" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><b>' + esc(o.nome) + '</b><div>' + esc(o.cong) + ' · último: ' + lastTxt(o) + (o.lastEsb ? ' (Nº ' + o.lastEsb + ')' : '') + '</div></div><button class="btn sm ' + (key(dr.orador) === key(o.nome) ? 'primary' : '') + '" data-act="pickO" data-v="' + esc(o.nome) + '">' + (key(dr.orador) === key(o.nome) ? 'Escolhido' : 'Escalar') + '</button></div>'; });
  if (R.disponiveis.length > e.no) h += '<button class="btn block" data-act="moreO">Ver mais oradores</button>';
  h += '<div class="sec">Congregações (há mais tempo sem arranjo)</div>';
  R.congs.forEach(c => { h += '<div class="item"><div class="m" data-act="hist" data-t="c" data-v="' + esc(c.nome) + '"><b>' + esc(c.nome) + '</b><div>último arranjo: ' + lastTxt(c) + (c.lastOrador ? ' · ' + esc(c.lastOrador) : '') + (c.next ? '<br>próximo: ' + D.brFull(c.next) + ' · ' + esc(c.nextOrador) : '') + '</div></div><button class="btn sm" data-act="pickC" data-v="' + esc(c.nome) + '">Ver orad.</button></div>'; });
  h += '<div class="sec">Esboços (há mais tempo sem uso)</div>';
  R.esbDisp.slice(0, e.ne).forEach(x => { const on = dr.esboco === x.n; h += '<div class="item"><div class="m" data-act="hist" data-t="e" data-v="' + x.n + '"><b>Nº ' + x.n + '</b><div>' + esc(x.tema) + '<br>último uso: ' + lastTxt(x) + (x.lastOrador ? ' · ' + esc(x.lastOrador) : '') + '</div></div><button class="btn sm ' + (on ? 'primary' : '') + '" data-act="pickE" data-v="' + x.n + '">' + (on ? 'Escolhido' : 'Usar') + '</button></div>'; });
  if (R.esbDisp.length > e.ne) h += '<button class="btn block" data-act="moreE">Ver mais esboços</button>';
  if (dr.orador || dr.esboco) h += '<div class="pick"><div>' + (dr.orador ? esc(dr.orador) : 'orador a definir') + (dr.esboco ? ' · Nº ' + dr.esboco : '') + '<br>' + D.brFull(D.parse(e.data)) + '</div><button class="btn sm" data-act="launch">Lançar</button><button class="btn sm" data-act="clearDraft">×</button></div>';
  return h;
};
V.pend = () => {
  const dias = ui.pend.dias || st.config.diasPendencias || 30, P = C.pendencias(st, D.today(), dias);
  if (ui.pend.somente === 'confirmacao') P.lista = P.lista.filter(r => r.faltas.includes('confirmação'));
  let h = '<div class="pend-filters"><div class="field"><label>Período</label><select data-chg="pendDias">' + [7, 15, 30, 60, 90].map(n => '<option value="' + n + '" ' + (n === dias ? 'selected' : '') + '>Próximos ' + n + ' dias</option>').join('') + '</select></div><div class="field"><label>Mostrar</label><select data-chg="pendFiltro"><option value="todas">Todas as pendências</option><option value="confirmacao" ' + (ui.pend.somente === 'confirmacao' ? 'selected' : '') + '>Confirmações locais</option></select></div></div>';
  h += '<p class="sub pend-summary">' + P.total + ' discursos no período · ' + P.semConfirmacao + ' sem confirmação · ' + P.semCantico + ' sem cântico · ' + P.semImagens + ' com imagens a definir</p>';
  if (!P.lista.length) return h + '<div class="empty">Tudo certo nesse período. 🎉</div>';
  P.lista.forEach(r => {
    const confirma = r.tipo !== 'envio' && r.faltas.includes('confirmação') && r.orador;
    h += '<article class="card pend-card"><div class="pend-heading"><span>' + esc(D.brFull(r.d)) + (r.hora ? ' · ' + esc(r.hora) : '') + '</span><span class="sub">' + (r.faltam === 0 ? 'Hoje' : 'Em ' + fmtDias(r.faltam)) + '</span></div><h3>' + speakerHeading(r) + '</h3><p class="sub">' + (r.tipo === 'envio' ? 'Envio para ' : 'Local · ') + esc(r.destino || 'congregação local') + '</p><div class="pend-status">' + r.faltas.map(x => '<span class="chip warn">' + ({'confirmação':'A confirmar','cântico':'Cântico a definir','imagens':'Imagens a definir'}[x] || esc(x)) + '</span>').join('') + '</div>' + (confirma && r.pedido ? '<p class="sub pend-request">Solicitação registrada em ' + D.brFull(D.parse(r.pedido)) + ' · aguardando resposta</p>' : '') + '<div class="pend-actions">' + (confirma ? '<button class="btn primary" data-act="msg" data-id="' + r.id + '">' + svg('message') + (r.pedido ? 'Solicitar novamente' : 'Solicitar') + '</button><button class="btn" data-act="confirmar" data-id="' + r.id + '">' + svg('check') + 'Confirmar</button>' : '') + '<button class="btn quiet" data-act="editProg" data-id="' + r.id + '">Ver detalhes</button></div></article>';
  });
  return h;
};
V.livres = () => {
  const l = ui.livres; if (!l.ini) { l.ini = D.iso(D.today()); l.fim = D.iso(D.today() + 90); } if (l.dow == null) l.dow = st.config.diaSemana;
  const L = C.datasLivres(st, l.ini, l.fim, l.dow), t = D.today();
  let h = '<div class="card"><div class="row"><div class="field"><label>De</label><input type="date" value="' + l.ini + '" data-chg="livIni"></div><div class="field"><label>Até</label><input type="date" value="' + l.fim + '" data-chg="livFim"></div></div><div class="field" style="margin:0"><label>Dia da semana dos discursos</label><select data-chg="livDow">' + ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((n, i) => '<option value="' + i + '" ' + (i === Number(l.dow) ? 'selected' : '') + '>' + n + '</option>').join('') + '</select></div></div>';
  h += '<div class="kpis"><div class="kpi ' + (L.length ? 'warn' : 'ok') + '"><b>' + L.length + '</b><span>Datas livres no período</span></div><div class="kpi"><b>' + (L.length ? D.br(L[0].d) : '—') + '</b><span>Próxima data livre</span></div></div>';
  if (!L.length) return h + '<div class="empty">Nenhuma data livre nesse período.</div>';
  L.forEach(x => { h += '<div class="item"><div class="d"><b>' + D.br(x.d).slice(0, 2) + '</b><small>' + D.dow3(x.d) + '</small></div><div class="m"><b>' + D.brFull(x.d) + '</b><div>' + x.situacao + (x.d >= t ? ' · faltam ' + fmtDias(x.d - t) : '') + '</div></div><button class="btn sm" data-act="escalarEm" data-v="' + D.iso(x.d) + '">Escalar</button></div>'; });
  return h;
};
V.compartilhar = () => {
  const c = ui.comp, t = D.today(), dt = new Date(t * 86400000);
  if (!c.ini) { c.ini = D.iso(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1) / 86400000); c.fim = D.iso(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0) / 86400000); }
  // Include names from historical envio records even after a speaker changes congregation.
  const names = [...new Set(C.rows(st).filter(r => r.tipo === 'envio').map(r => r.orador).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  const speaker = c.tipo === 'envio' ? c.orador : '';
  const txt = C.compartilhar(st, c.ini, c.fim, c.tipo, speaker);
  return '<div class="card">' + modalidadeSelect(c.tipo, 'cmpTipo', false) + (c.tipo === 'envio' ? '<div class="field"><label>Orador local</label><select data-chg="cmpOrador"><option value="">Todos os oradores</option>' + names.map(n => '<option value="' + esc(n) + '" ' + (key(c.orador) === key(n) ? 'selected' : '') + '>' + esc(n) + '</option>').join('') + '</select></div>' : '') + '<div class="row"><div class="field"><label>De</label><input type="date" value="' + c.ini + '" data-chg="cmpIni"></div><div class="field"><label>Até</label><input type="date" value="' + c.fim + '" data-chg="cmpFim"></div></div></div><div class="field"><label>Mensagem pronta</label><textarea id="cmpTxt" readonly>' + esc(txt) + '</textarea></div><button class="btn primary block" data-act="zap">Enviar pelo WhatsApp</button><div class="row"><button class="btn" data-act="copiar">Copiar texto</button><button class="btn" data-act="partilhar">Outros apps</button></div>';
};
V.rodizio = () => {
  const rodLast = x => x.lastD == null ? 'Sem registro no período' : lastTxt(x);
  const r = ui.rod, R = C.rodizio(st, D.today(),r.tipo,r.ini,r.fim);
  for (const list of [R.oradores,R.congs,R.esbocos]) { const filtered = list.filter(x => matchesSearch([x.nome,x.cong,x.n,x.tema].join(' '),r.q)); list.splice(0,list.length,...(r.ordem === 'lastD' ? filtered : C.ordenar(filtered,r.ordem))); }
  let h = '<div class="seg"><button data-act="rodAba" data-v="o" class="' + (r.aba === 'o' ? 'on' : '') + '">Oradores</button><button data-act="rodAba" data-v="c" class="' + (r.aba === 'c' ? 'on' : '') + '">Congregações</button><button data-act="rodAba" data-v="e" class="' + (r.aba === 'e' ? 'on' : '') + '">Esboços</button></div><div class="sub" style="margin:0 4px 8px">Do que está há mais tempo sem uso para o mais recente.</div>';
  h = modalidadeSelect(r.tipo,'rodTipo') + '<div class="row"><div class="field"><label>Histórico desde</label><input type="date" value="' + r.ini + '" data-chg="rodIni"></div><div class="field"><label>Até</label><input type="date" value="' + r.fim + '" data-chg="rodFim"></div></div><p class="sub">Última participação e próximo compromisso dentro do período e da modalidade selecionados. Sem participação no período aparece primeiro.</p>' + searchSort(r.q,r.ordem,'rodSearch','rodSort',[['lastD','Há mais tempo sem participar'],['nome','Ordem alfabética'],['cong','Congregação']]) + h;
  if (r.ini && r.fim && r.ini > r.fim) return h + '<div class="alertbox">A data final deve ser igual ou posterior à inicial.</div>';
  if (r.aba === 'o') R.oradores.forEach(o => { h += '<div class="item" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><div class="m"><b>' + esc(o.nome) + '</b><div>' + esc(o.cong) + '<br>Último: ' + rodLast(o) + (o.lastEsb ? ' · Nº ' + o.lastEsb : '') + '<br>Próximo: ' + (o.next ? D.brFull(o.next) + (o.nextEsb ? ' · Nº ' + o.nextEsb : '') : '—') + '</div></div></div>'; });
  if (r.aba === 'c') R.congs.forEach(o => { h += '<div class="item" data-act="hist" data-t="c" data-v="' + esc(o.nome) + '"><div class="m"><b>' + esc(o.nome) + '</b><div>Último arranjo: ' + rodLast(o) + (o.lastOrador ? ' · ' + esc(o.lastOrador) : '') + '<br>Próximo: ' + (o.next ? D.brFull(o.next) + ' · ' + esc(o.nextOrador) : '—') + '</div></div></div>'; });
  if (r.aba === 'e') {
    const list = R.esbocos;

    list.slice(0, r.n).forEach(x => { h += '<div class="item" data-act="hist" data-t="e" data-v="' + x.n + '"><div class="m"><b>Nº ' + x.n + '</b><div>' + esc(x.tema) + '<br>Último uso: ' + rodLast(x) + (x.lastOrador ? ' · ' + esc(x.lastOrador) : '') + '<br>Próximo: ' + (x.next ? D.brFull(x.next) + ' · ' + esc(x.nextOrador) : '—') + '</div></div></div>'; });
    if (list.length > r.n) h += '<button class="btn block" data-act="rodMais">Mostrar mais</button>';
  }
  return h;
};
V.relatorios = () => {
  const r = ui.rel, anos = [...new Set(C.rows(st).map(x => D.year(x.d)))].sort();
  const R = r.ano === 'todos' ? C.relatorios(st, null, null, r.tipo) : C.relatorios(st, r.ano + '-01-01', r.ano + '-12-31', r.tipo);
  let h = modalidadeSelect(r.tipo, 'relTipo', false) + '<div class="card"><div class="field" style="margin:0"><label>Período</label><select data-chg="relAno"><option value="todos">Todos os anos</option>' + anos.map(a => '<option value="' + a + '" ' + (String(a) === String(r.ano) ? 'selected' : '') + '>' + a + '</option>').join('') + '</select></div></div>';
  h += '<div class="kpis"><div class="kpi wide"><b>' + R.total + '</b><span>Discursos lançados no período (inclui futuros)</span></div></div><div class="seg"><button data-act="relAba" data-v="o" class="' + (r.aba === 'o' ? 'on' : '') + '">Oradores</button><button data-act="relAba" data-v="c" class="' + (r.aba === 'c' ? 'on' : '') + '">Congregações</button><button data-act="relAba" data-v="e" class="' + (r.aba === 'e' ? 'on' : '') + '">Esboços</button></div>';
  const list = r.aba === 'o' ? R.oradores : r.aba === 'c' ? R.congs : R.esbocos, max = Math.max(1, ...list.map(x => x.count));
  if (r.aba === 'c') h += '<p class="sub">' + (r.tipo === 'envio' ? 'Congregações que receberam nossos oradores.' : 'Congregações de origem dos oradores recebidos.') + ' A congregação local não participa deste ranking.</p>';
  list.slice(0, r.aba === 'e' ? r.n : 999).forEach(x => { h += '<div class="item" data-act="hist" data-t="' + r.aba + '" data-v="' + (r.aba === 'e' ? x.n : esc(x.nome)) + '"><div class="pos">' + x.pos + 'º</div><div class="m"><b>' + (r.aba === 'e' ? 'Nº ' + x.n : esc(x.nome)) + '</b><div>' + (r.aba === 'e' ? esc(x.tema) : r.aba === 'o' ? esc(x.cong) : '') + '</div><div class="bar"><i style="width:' + (x.count / max * 100) + '%"></i></div></div><b>' + x.count + '</b></div>'; });
  if (r.aba === 'e' && list.length > r.n) h += '<button class="btn block" data-act="relMais">Mostrar mais</button>';
  return h;
};
V.cadastros = () => {
  const c = ui.cad, q = C.searchKey(c.q);
  let h = '<div class="seg"><button data-act="cadAba" data-v="o" class="' + (c.aba === 'o' ? 'on' : '') + '">Oradores</button><button data-act="cadAba" data-v="c" class="' + (c.aba === 'c' ? 'on' : '') + '">Congregações</button><button data-act="cadAba" data-v="e" class="' + (c.aba === 'e' ? 'on' : '') + '">Esboços</button></div><div class="field"><input type="search" placeholder="Buscar" value="' + esc(c.q) + '" data-inp="cadQ"></div>';
  h += sortSelect(c.ordem,'cadSort',[['nome','Ordem alfabética'],['cong','Congregação']]);
  if (c.aba === 'o') { h += '<button class="btn primary block" data-act="newOrad">+ Novo orador</button>'; const L = st.oradores.map((o, i) => ({ ...o, i })).filter(o => !q || C.searchKey(o.nome).includes(q) || C.searchKey(o.cong).includes(q)).sort((a,b) => String(a[c.ordem] || a.nome).localeCompare(String(b[c.ordem] || b.nome),'pt-BR') || a.nome.localeCompare(b.nome,'pt-BR')); if (!L.length) h += '<div class="empty">Nenhum orador.</div>'; const R0 = C.rows(st); L.forEach(o => { const n = R0.filter(r => key(r.orador) === key(o.nome)).length; h += '<div class="item" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><div class="m"><b>' + esc(o.nome) + '</b><div>' + esc(o.cong || 'sem congregação') + (key(o.cong) === key(st.config.local) && st.config.local ? ' · local' : '') + ' · ' + n + (n === 1 ? ' discurso' : ' discursos') + (o.fone ? ' · ' + esc(o.fone) : ' · sem telefone') + '</div></div></div>'; }); }
  if (c.aba === 'c') { h += '<button class="btn primary block" data-act="newCong">+ Nova congregação</button>'; const L = C.allCongs(st).filter(x => !q || C.searchKey(x).includes(q)); if (!L.length) h += '<div class="empty">Nenhuma congregação.</div>'; L.forEach(x => { const n = st.oradores.filter(o => key(o.cong) === key(x)).length; h += '<div class="item" data-act="hist" data-t="c" data-v="' + esc(x) + '"><div class="m"><b>' + esc(x) + '</b><div>' + n + (n === 1 ? ' orador' : ' oradores') + (st.horarios[key(x)] ? ' · ' + esc(st.horarios[key(x)]) : '') + '</div></div></div>'; }); }
  if (c.aba === 'e') { h += '<button class="btn primary block" data-act="newEsb">+ Novo esboço</button>'; const L = st.esbocos.filter(e => !q || String(e.n) === q || C.searchKey(e.tema).includes(q)); if (!L.length) h += '<div class="empty">Nenhum esboço.</div>'; L.slice(0, 80).forEach(e => { h += '<div class="item" data-act="hist" data-t="e" data-v="' + e.n + '"><div class="pos">' + e.n + '</div><div class="m"><b>' + esc(norm(e.tema)) + '</b></div></div>'; }); if (L.length > 80) h += '<div class="sub" style="text-align:center">Mostrando 80 de ' + L.length + '. Use a busca.</div>'; }
  return h;
};
V.mais = () => {
  const it = (r, t, d) => '<div class="item" data-go="' + r + '"><div class="m"><b>' + t + '</b><div>' + d + '</div></div></div>';
  return it('arranjos', 'Arranjos', 'Oradores locais, envios e recebimentos') + it('busca','Busca geral','Oradores, congregações, esboços e datas') + it('informes','Histórico de informes','Mensagens preparadas e alterações posteriores') + it('lixeira','Exclusões recentes','Restaurar registros excluídos nos últimos 7 dias') + it('livres', 'Datas livres', 'Datas ainda sem orador') + it('compartilhar', 'Compartilhar', 'Texto da programação para o WhatsApp') + it('rodizio', 'Rodízio', 'Quem está há mais tempo sem') + it('relatorios', 'Relatórios', 'Rankings por período') + it('cadastros', 'Cadastros', 'Oradores, congregações e esboços') + it('dados', 'Dados e planilha', 'Importar, exportar e backup') + it('config', 'Configurações', 'Intervalo mínimo e preferências') + it('ajuda', 'Ajuda', 'Como usar') + (window.__installEv ? '<button class="btn primary block" data-act="instalar" style="margin-top:8px">Instalar aplicativo</button>' : '');
};
V.arranjos = () => {
  if (!norm(st.config.local)) return '<div class="card"><h3>Defina a congregação local</h3><p>Informe o nome em Configurações e vincule os oradores locais a essa congregação no cadastro.</p><button class="btn primary block" data-go="config">Configurar</button></div>';
  const locais = st.oradores.filter(o => key(o.cong) === key(st.config.local));
  return '<div class="hero"><small>Congregação local</small><b>' + esc(st.config.local) + '</b><div>' + locais.length + ' oradores locais cadastrados</div></div><div class="row"><button class="btn primary" data-act="newEnvio">Agendar envio</button><button class="btn" data-act="newProg">Agendar discurso local</button></div><p class="sub">Recebimentos e envios são registros independentes: podem ocorrer em datas diferentes. Os totais incluem programações anteriores e futuras.</p>' + '<div class="sec">Oradores locais</div>' + locais.map(o => '<div class="item"><div class="m" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><b>' + esc(o.nome) + '</b><div>Ver histórico de discursos locais e envios</div></div><button class="btn sm" data-act="enviarOrador" data-v="' + esc(o.nome) + '">Agendar envio</button></div>').join('') + '<div class="sec">Arranjos por congregação</div>' + C.arranjos(st).map(c => '<div class="item" data-act="hist" data-t="c" data-v="' + esc(c.nome) + '"><div class="m"><b>' + esc(c.nome) + '</b><div>Recebemos: ' + c.recebidos + ' · Enviamos: ' + c.enviados + '<br>Programações futuras: ' + c.proximos + '</div></div></div>').join('');
};
V.dados = () => '<div class="card"><h3>Planilha (.xlsx)</h3><p class="sub">Importe a planilha do Excel (abas 2026, 2027, CADASTROS e ESBOÇOS) ou exporte seus dados em .xlsx.</p><input type="file" id="fileX" accept=".xlsx,.xls" data-chg="impFile" style="display:none"><button class="btn primary block" data-act="pickFile">Importar planilha</button><button class="btn block" data-act="expX">Exportar para planilha</button><button class="btn block" data-act="shareX">Enviar planilha para outro celular</button></div><div class="card"><h3>Backup do aplicativo</h3><p class="sub">Arquivo .json com todos os dados, para guardar ou levar para outro aparelho.</p><input type="file" id="fileJ" accept=".json,application/json" data-chg="impJson" style="display:none"><button class="btn block" data-act="expJ">Salvar backup</button><button class="btn block" data-act="pickJson">Restaurar backup</button></div><div class="card"><h3>Apagar tudo</h3><p class="sub">Remove todos os dados deste aparelho.</p><button class="btn danger block" data-act="wipe">Apagar dados</button></div><div class="sub" style="text-align:center">Os dados ficam só neste celular.</div>';
V.config = () => preferenceSettings() + '<div class="card"><h3>Visualização da programação</h3><div class="field"><label>Como deseja visualizar os agendamentos?</label><select data-chg="cfgVisualizacao"><option value="lista" ' + (st.config.visualizacao !== 'calendario' ? 'selected' : '') + '>Lista (padrão)</option><option value="calendario" ' + (st.config.visualizacao === 'calendario' ? 'selected' : '') + '>Calendário mensal</option></select><p class="sub">Você pode alternar a qualquer momento. Os agendamentos são os mesmos nas duas visualizações.</p></div></div>' + paletteSettings() + '<div class="card"><div class="field"><label>Nome da congregação local</label><input value="' + esc(st.config.local) + '" data-chg="cfgLocal"><div class="sub">Identifica os oradores locais pelo cadastro da congregação.</div></div><div class="field"><label>Intervalo mínimo entre discursos locais do mesmo orador ou esboço (dias)</label><input type="number" min="0" value="' + st.config.intervalo + '" data-chg="cfgInt"></div><div class="field"><label>Dia da semana dos discursos</label><select data-chg="cfgDow">' + ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((n, i) => '<option value="' + i + '" ' + (i === Number(st.config.diaSemana) ? 'selected' : '') + '>' + n + '</option>').join('') + '</select></div><div class="field"><label>Dias olhados nas pendências</label><input type="number" min="1" value="' + st.config.diasPendencias + '" data-chg="cfgPend"></div><div class="field" style="margin:0"><label>Horário padrão dos discursos (ex.: 17h)</label><input value="' + esc(st.config.horaPadrao) + '" data-chg="cfgHora"><div class="sub">Cada congregação pode ter o seu horário, em Cadastros.</div></div></div><div class="card"><h3>Mensagem de confirmação</h3><div class="sub">Marcadores: {nome} {tema} {congregacao} {data} {hora}</div><textarea style="font-family:inherit;font-size:14px;min-height:260px;margin-top:8px" data-chg="cfgModelo">' + esc(st.config.modelo || C.MODELO_PADRAO) + '</textarea><button class="btn block" style="margin-top:8px" data-act="modeloPadrao">Restaurar modelo padrão</button></div>';
V.ajuda = () => {
  const s = (t, p) => '<div class="card"><h3>' + t + '</h3><div class="sub">' + p + '</div></div>';
  return s('Arranjos e oradores locais', 'Defina o nome da congregação local em <b>Configurações</b>. Cadastre seus oradores com essa congregação. Em <b>Mais → Arranjos</b>, agende envios ou discursos locais. Um orador local também pode discursar na própria congregação. Recebimentos e envios podem ter datas diferentes. Os históricos mostram origem e destino; envios não ocupam as datas livres locais. Por precaução, o mesmo orador não pode ser agendado duas vezes no mesmo dia.') + s('Telefone da agenda', 'A seleção de contatos está suspensa. Digite ou cole o telefone no cadastro do orador.') + s('Primeiros passos', '1. Em <b>Dados</b>, importe a sua planilha (.xlsx), ou cadastre oradores e esboços em <b>Cadastros</b>.<br>2. Lance os discursos em <b>Programação</b> (botão +).<br>3. Use <b>Quem escalar</b> para escolher orador e esboço para uma data.') + s('Alerta de repetição', 'Os envios não geram alertas de repetição. Dois discursos do mesmo orador no mesmo dia são bloqueados por conflito de agenda. Ao lançar um discurso local, o aplicativo avisa se o orador ou o esboço se repete em menos dias do que o intervalo mínimo (padrão 90, em <b>Configurações</b>).') + s('Telas', '<b>Pendências</b>: o que falta confirmar, cantar ou definir.<br><b>Datas livres</b>: dias sem orador.<br><b>Rodízio</b>: quem está há mais tempo sem.<br><b>Relatórios</b>: rankings por período.<br><b>Compartilhar</b>: texto pronto para o WhatsApp.') + s('Renomear um orador', 'Em <b>Cadastros</b>, edite o nome: ele é atualizado em todos os discursos.') + s('Seus dados', 'Ficam salvos neste celular, sem internet. Faça backup em <b>Dados</b> e use a planilha para levar informações a outros aparelhos (importar pode <b>mesclar</b> com o que já existe).');
};


function histItem(x, tipo) {
  const tema = x.esboco ? 'Nº ' + x.esboco + ' · ' + esc(x.tema) : 'tema a definir';
  const l1 = tipo === 'o' ? tema : esc(x.orador || 'Orador a definir');
  const l2 = (tipo === 'c' ? tema + '<br>' : '') + (x.tipo === 'envio' ? 'Envio: ' : 'Local: ') + esc(x.origem || 'origem a definir') + ' → ' + esc(x.destino || 'congregação local');
  const fut = x.d >= D.today() && x.tipo !== 'envio';
  const chips = fut ? (norm(x.confirmado).toUpperCase() === 'SIM' ? '<span class="chip ok">confirmado</span>' : (x.pedido ? '<span class="chip">pedido enviado em ' + D.br(D.parse(x.pedido)) + '</span>' : '<span class="chip warn">sem confirmação</span>')) : '';
  return '<div class="item" data-act="editProg" data-id="' + x.id + '"><div class="m"><b>' + D.brFull(x.d) + ' (' + D.dow3(x.d) + ')</b><div>' + l1 + '</div><div>' + l2 + '</div>' + chips + '</div></div>';
}
V.hist = () => {
  const hh = ui.hist, t = D.today(), H = C.historico(st, hh.tipo, hh.id, t, hh.modalidade || 'todos');
  let kind = '', title = '', sub = '', extra = '';
  if (hh.tipo === 'o') { const o = st.oradores.find(x => key(x.nome) === key(hh.id)); kind = 'Orador'; title = hh.id; sub = (o && o.cong ? esc(o.cong) : 'sem congregação') + (o && o.fone ? ' · ' + esc(o.fone) : ''); if (o && o.cong) extra = '<button class="btn sm" data-act="hist" data-t="c" data-v="' + esc(o.cong) + '">Ver congregação</button>'; }
  if (hh.tipo === 'c') { kind = 'Congregação'; title = hh.id; const n = st.oradores.filter(o => key(o.cong) === key(hh.id)).length; sub = n + (n === 1 ? ' orador' : ' oradores') + (st.horarios[key(hh.id)] ? ' · discursos às ' + esc(st.horarios[key(hh.id)]) : ''); }
  if (hh.tipo === 'e') { kind = 'Esboço'; title = 'Nº ' + hh.id; sub = esc(C.temaDe(st, hh.id)); }
  const who = hh.tipo === 'e' ? 'Vezes utilizado' : 'Registros anteriores';
  let h = modalidadeSelect(hh.modalidade || 'todos', 'histTipo') + '<div class="hero"><small>' + kind + '</small><b>' + esc(title) + '</b><div>' + sub + '</div></div>';
  h += '<div class="kpis"><div class="kpi"><b>' + H.past.length + '</b><span>' + who + '</span></div><div class="kpi ' + (H.future.length ? 'ok' : '') + '"><b>' + H.future.length + '</b><span>Programados</span></div><div class="kpi"><b>' + (H.last ? D.br(H.last.d) : '—') + '</b><span>Último' + (H.last ? ' · ' + fmtDias(t - H.last.d) : '') + '</span></div><div class="kpi"><b>' + (H.next ? D.br(H.next.d) : '—') + '</b><span>Próximo' + (H.next ? ' · em ' + fmtDias(H.next.d - t) : '') + '</span></div></div>';
  h += '<div class="row" style="margin:0 0 8px"><button class="btn sm" data-act="editFromHist">Editar cadastro</button>' + extra + '</div>';
  if (hh.tipo === 'c') h += congregationSpeakers(hh.id);
  h += '<div class="sec">Próximas programações (' + H.future.length + ')</div>' + (H.future.length ? H.future.map(x => histItem(x, hh.tipo)).join('') : '<div class="empty" style="padding:14px">Nenhuma programação futura.</div>');
  h += '<div class="sec">Programações anteriores (' + H.past.length + ')</div>' + (H.past.length ? H.past.map(x => histItem(x, hh.tipo)).join('') : '<div class="empty" style="padding:14px">Nenhum discurso proferido ainda.</div>');
  return h;
};
V.msgs = () => V.pend();
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const temp = document.createElement('textarea'); temp.value = text; document.body.appendChild(temp); temp.select();
      const ok = document.execCommand('copy'); temp.remove(); if (!ok) throw new Error('copy');
    }
    return true;
  } catch(e) { toast('Não foi possível copiar. Selecione o texto e copie manualmente.'); return false; }
}
function recordMessageAction(message, action) {
  const p = st.prog.find(x => x.id === message.id); if (!p) return;
  C.registrarInforme(st,p,message.text,action);
  if (p.tipo !== 'envio') p.pedido = D.iso(D.today()); save();
}
function reviewShare(method) {
  const c = ui.comp, ini = D.parse(c.ini), fim = D.parse(c.fim);
  if (!Number.isFinite(ini) || !Number.isFinite(fim) || fim < ini) return toast('Escolha um período válido.');
  const records = C.rows(st).filter(r => r.d >= ini && r.d <= fim && r.tipo === c.tipo && (c.tipo !== 'envio' || !c.orador || key(r.orador) === key(c.orador)));
  if (!records.length) return toast('Nenhum discurso para compartilhar nesses filtros.');
  const speaker = c.tipo === 'envio' ? c.orador : '';
  ui.shareReview = {method,fone:speaker ? (st.oradores.find(o => key(o.nome) === key(speaker))?.fone || '') : ''};
  sheet('<h2>Revisar antes de compartilhar</h2><div class="card"><b>' + (c.tipo === 'envio' ? 'Envios para outras congregações' : 'Discursos na congregação local') + '</b><p>' + D.brFull(ini) + ' a ' + D.brFull(fim) + '</p><p>' + records.length + ' discursos · ' + esc(speaker || 'Todos os oradores') + '</p><p class="sub">' + (ui.shareReview.fone ? 'Contato: ' + esc(speaker) + ' · ' + esc(ui.shareReview.fone) : 'Você escolherá o destinatário no aplicativo de compartilhamento.') + '</p></div><div class="field"><label>Confira e ajuste o texto</label><textarea id="shareReviewText">' + esc(C.compartilhar(st,c.ini,c.fim,c.tipo,speaker)) + '</textarea></div><button class="btn primary block" data-act="finishShare">' + ({whatsapp:'Abrir no WhatsApp',copiar:'Copiar texto revisado',outros:'Escolher aplicativo'}[method]) + '</button><button class="btn block" data-act="closeSheet">Voltar sem compartilhar</button>');
}
async function finishShare() {
  const review = ui.shareReview, text = document.querySelector('#shareReviewText')?.value;
  if (!review || !norm(text)) return toast('Escreva a mensagem antes de compartilhar.');
  if (review.method === 'whatsapp') {
    if (!window.open('https://wa.me/' + C.foneWa(review.fone) + '?text=' + encodeURIComponent(text),'_blank')) return toast('A abertura foi bloqueada pelo navegador.');
  } else if (review.method === 'copiar') { if (!await copyText(text)) return; }
  else if (navigator.share) { try { await navigator.share({text}); } catch(e) { if (e.name !== 'AbortError') toast('Não foi possível compartilhar.'); return; } }
  else { if (!await copyText(text)) return; toast('Texto copiado. Cole no aplicativo desejado.'); }
  closeSheet(); ui.shareReview = null;
}
function beginProg(init = {}) {
  if (!norm(st.config.local)) { sheet('<h2>Defina a congregação local</h2><p>Antes de agendar, informe sua congregação nas Configurações.</p><button class="btn primary block" data-go="config">Abrir configurações</button><button class="btn block" data-act="closeSheet">Cancelar</button>'); return; }
  ui.wizard = {step:1,draft:{tipo:'local',data:nextDate(),orador:'',destino:st.config.local,esboco:'',cantico:'',imagens:'',hora:'',...init}};
  wizardRender();
}
function wizardRender() {
  const w = ui.wizard, f = w.draft, field = (label,id,input) => '<div class="field"><label for="' + id + '">' + label + '</label>' + input + '</div>';
  let body = '';
  if (w.step === 1) body = field('Modalidade','w_tipo','<select id="w_tipo"><option value="local" ' + (f.tipo === 'local' ? 'selected' : '') + '>Discurso na congregação local</option><option value="envio" ' + (f.tipo === 'envio' ? 'selected' : '') + '>Envio para outras congregações</option></select>') + field('Data','w_data','<input id="w_data" type="date" value="' + esc(f.data) + '">');
  if (w.step === 2) {
    const options = sortedOrad().filter(o => f.tipo !== 'envio' || key(o.cong) === key(st.config.local));
    body = field('Orador','w_orador','<select id="w_orador"><option value="">' + (f.tipo === 'envio' ? 'Escolha um orador local' : 'Definir depois') + '</option>' + options.map(o => '<option value="' + esc(o.nome) + '" ' + (key(o.nome) === key(f.orador) ? 'selected' : '') + '>' + esc(o.nome) + ' · ' + esc(o.cong) + '</option>').join('') + '</select>') + '<p class="sub">Compromissos do mesmo orador no mesmo dia serão bloqueados.</p>';
  }
  if (w.step === 3) body = f.tipo === 'local' ? '<div class="card"><h3>Congregação de destino</h3><p>' + esc(st.config.local) + '</p></div>' : field('Congregação de destino','w_destino','<select id="w_destino"><option value="">Escolha a congregação</option>' + C.allCongs(st).filter(c => key(c) !== key(st.config.local)).map(c => '<option value="' + esc(c) + '" ' + (key(c) === key(f.destino) ? 'selected' : '') + '>' + esc(c) + '</option>').join('') + '</select>');
  if (w.step === 4) body = field('Esboço','w_esboco','<select id="w_esboco"><option value="">Definir depois</option>' + st.esbocos.map(e => '<option value="' + e.n + '" ' + (Number(f.esboco) === e.n ? 'selected' : '') + '>Nº ' + e.n + ' · ' + esc(e.tema) + '</option>').join('') + '</select>') + field('Cântico (opcional)','w_cantico','<input id="w_cantico" value="' + esc(f.cantico) + '" inputmode="numeric">') + field('Imagens','w_imagens','<select id="w_imagens"><option value="">Definir depois</option><option ' + (f.imagens === 'SIM' ? 'selected' : '') + '>SIM</option><option ' + (f.imagens === 'NÃO' ? 'selected' : '') + '>NÃO</option></select>') + field('Horário (opcional)','w_hora','<input id="w_hora" value="' + esc(f.hora) + '" placeholder="Usar horário da congregação">');
  if (w.step === 5) {
    const alert = C.alerta(st,f);
    body = '<div class="card"><h3>Revise o agendamento</h3><p>' + (f.tipo === 'envio' ? 'Envio' : 'Discurso local') + ' · ' + D.brFull(D.parse(f.data)) + '</p><p><b>' + esc(f.orador || 'Orador a definir') + '</b></p><p>Destino: ' + esc(f.destino) + '</p><p>' + (f.esboco ? 'Nº ' + f.esboco + ' · ' + esc(C.temaDe(st,f.esboco)) : 'Esboço a definir') + '</p><p>Horário: ' + esc(f.hora || C.horaDe(st,f)) + '</p></div>' + (alert.any ? '<div class="alertbox">Atenção: repetição local de orador ou esboço no intervalo configurado. Revise antes de salvar.</div>' : '') + '<p class="sub">' + (f.tipo === 'envio' ? 'Ao salvar, será preparado um informe para o orador.' : 'Após salvar, acompanhe a confirmação em Pendências.') + '</p>';
  }
  sheet('<h2>Novo agendamento</h2><p class="sub" role="status">Etapa ' + w.step + ' de 5 · ' + ['','Modalidade e data','Orador','Congregação','Discurso e detalhes','Revisão'][w.step] + '</p>' + body + '<div class="row">' + (w.step > 1 ? '<button class="btn" data-act="wizardBack">Voltar</button>' : '') + (w.step < 5 ? '<button class="btn primary" data-act="wizardNext">Continuar</button>' : '<button class="btn primary" data-act="wizardSave">Salvar agendamento</button>') + '</div><button class="btn block" style="margin-top:12px" data-act="closeSheet">Cancelar</button>');
}
function wizardMove(delta) {
  const w = ui.wizard, f = w.draft;
  if (w.step === 1) { const old = f.tipo; f.tipo = $('#w_tipo').value; f.data = $('#w_data').value; if (old !== f.tipo) { f.orador = ''; f.destino = ''; } }
  if (w.step === 2) f.orador = $('#w_orador').value;
  if (w.step === 3) f.destino = f.tipo === 'local' ? st.config.local : $('#w_destino').value;
  if (w.step === 4) for (const prop of ['esboco','cantico','imagens','hora']) f[prop] = $('#w_' + prop).value;
  if (delta > 0) {
    if (w.step === 1 && !Number.isFinite(D.parse(f.data))) return toast('Escolha uma data válida.');
    if (w.step === 2 && f.tipo === 'envio' && (!f.orador || key(C.congDe(st,f.orador)) !== key(st.config.local))) return toast('Escolha um orador local.');
    if (w.step === 2 && C.alerta(st,f).conflito) return toast('O orador já tem um discurso nessa data.');
    if (w.step === 3 && f.tipo === 'envio' && (!f.destino || key(f.destino) === key(st.config.local))) return toast('Escolha outra congregação para o envio.');
  }
  w.step += delta; wizardRender();
}
function wizardSave() {
  const f = {...ui.wizard.draft}; openProg(f);
  // The existing validated save routine remains the single path for persisting a discourse.
  for (const [id,prop] of [['f_data','data'],['f_tipo','tipo'],['f_orad','orador'],['f_dest','destino'],['f_esb','esboco'],['f_cant','cantico'],['f_img','imagens'],['f_hora','hora']]) $('#' + id).value = f[prop] || '';
  $('#f_conf').value = ''; saveProg(false);
}
function openMsg(id) {
  const p = st.prog.find(x => x.id === id); if (!p) return;
  const text = C.mensagemConfirmacao(st, p); if (!text) return toast('Defina a data e o orador para montar a mensagem.');
  const o = st.oradores.find(x => key(x.nome) === key(p.orador)); ui.form = { id };
  const envio = p.tipo === 'envio';
  C.registrarInforme(st,p,text,'Preparado'); save();
  sheet('<h2>' + (envio ? 'Informe da programação' : 'Solicitar confirmação') + '</h2><div class="sub" style="margin:0 0 8px">' + esc(p.orador) + ' · ' + D.brFull(D.parse(p.data)) + '</div>' + (p.esboco ? '' : '<div class="alertbox">O esboço ainda não foi definido: a mensagem sairá com “(tema a definir)”.</div>') + (!envio && p.pedido ? '<div class="alertbox okb">Pedido anterior enviado em ' + D.brFull(D.parse(p.pedido)) + '.</div>' : '') + '<div class="field"><label>WhatsApp do orador</label><input id="m_fone" inputmode="tel" placeholder="(98) 99999-0000" value="' + esc(o ? o.fone || '' : '') + '"><div class="sub">Sem telefone, o WhatsApp abre para você escolher o contato.</div></div><div class="field"><label>Mensagem (pode editar antes de enviar)</label><textarea id="m_txt" style="font-family:inherit;font-size:14px;min-height:280px">' + esc(text) + '</textarea></div><button class="btn primary block" data-act="sendMsg">Enviar pelo WhatsApp</button><div class="row"><button class="btn" data-act="copyMsg">Copiar</button>' + (envio || norm(p.confirmado).toUpperCase() === 'SIM' ? '' : '<button class="btn" data-act="confMsg">Já confirmou</button>') + '</div><button class="btn block" data-act="closeSheet" style="margin-top:8px">Cancelar</button>');
}
function msgPrepare() {
  const p = st.prog.find(x => x.id === ui.form.id), o = st.oradores.find(x => key(x.nome) === key(p.orador)), fone = norm($('#m_fone').value);
  if (o && fone !== (o.fone || '')) o.fone = fone; save(); return { id:p.id, envio: p.tipo === 'envio', fone, text: $('#m_txt').value };
}
function openHist(t, v) { if (ui.route === 'hist') ui.hstack.push({ ...ui.hist }); else { ui.hstack = []; ui.hfrom = ui.route; } ui.hist = { tipo: t, id: v, modalidade: ui.route === 'relatorios' ? ui.rel.tipo : ui.route === 'rodizio' ? ui.rod.tipo : 'todos' }; closeSheet(); ui.route = 'hist'; render(true); }

/* ---------- formulário de discurso ---------- */
function openProg(init, id) {
  const p = id ? st.prog.find(x => x.id === id) : null;
  ui.form = Object.assign({ id: null, data: nextDate(), tipo: 'local', origem: '', destino: '', orador: '', esboco: '', cantico: '', imagens: '', confirmado: '' }, p ? { ...p, esboco: p.esboco == null ? '' : p.esboco } : {}, init || {});
  ui.form.id = id || null;
  const f = ui.form;
  const opt = (v, cur, t) => '<option value="' + v + '" ' + (v === cur ? 'selected' : '') + '>' + t + '</option>';
  let ops = '<option value="">— definir depois —</option>' + sortedOrad().map(o => '<option value="' + esc(o.nome) + '" ' + (key(o.nome) === key(f.orador) ? 'selected' : '') + '>' + esc(o.nome) + (o.cong ? ' — ' + esc(o.cong) : '') + '</option>').join('');
  if (f.orador && !st.oradores.some(o => key(o.nome) === key(f.orador))) ops += '<option selected value="' + esc(f.orador) + '">' + esc(f.orador) + ' (não cadastrado)</option>';
  if (!f.origem) f.origem = C.origemDe(st, f);
  if (!f.destino) f.destino = C.destinoDe(st, f);
  const arrangementFields = '<div class="field"><label>Modalidade</label><select id="f_tipo" data-chg="formTipo">' + opt('local', f.tipo || 'local', 'Na congregação local') + opt('envio', f.tipo, 'Envio para outra congregação') + '</select></div><div class="field"><label>Congregação onde será o discurso</label><select id="f_dest" data-chg="formChg">' + congOptions(f.destino) + '</select><div class="sub">Para envios, escolha a congregação que receberá o orador local.</div></div>';
  sheet('<h2>' + (id ? 'Editar discurso' : 'Novo discurso') + '</h2>' + arrangementFields + '<div id="alertbox"></div><div class="field"><label>Data</label><input type="date" id="f_data" value="' + esc(f.data) + '" data-inp="formChg"></div><div class="field"><label>Orador</label><select id="f_orad" data-chg="formChg">' + ops + '</select><div class="sub" id="f_cong"></div></div><div class="field"><label>Nº do esboço</label><input type="number" inputmode="numeric" id="f_esb" value="' + esc(f.esboco) + '" data-inp="formChg"><div class="sub" id="f_tema"></div></div><div class="row"><div class="field"><label>Cântico</label><input type="text" inputmode="numeric" id="f_cant" value="' + esc(f.cantico) + '"></div><div class="field"><label>Imagens</label><select id="f_img">' + opt('', f.imagens, '—') + opt('SIM', f.imagens, 'SIM') + opt('NÃO', f.imagens, 'NÃO') + '</select></div><div class="field" id="confirmationField"><label>Confirmado</label><select id="f_conf">' + opt('', f.confirmado, '—') + opt('SIM', f.confirmado, 'SIM') + opt('NÃO', f.confirmado, 'NÃO') + '</select></div></div><div class="field"><label>Horário (opcional)</label><input id="f_hora" value="' + esc(f.hora || '') + '" placeholder="padrão da congregação"></div><div class="row" style="margin:0 0 8px">' + (f.orador ? '<button class="btn sm" data-act="hist" data-t="o" data-v="' + esc(f.orador) + '">Histórico do orador</button>' : '') + (f.esboco !== '' && f.esboco != null ? '<button class="btn sm" data-act="hist" data-t="e" data-v="' + f.esboco + '">Histórico do esboço</button>' : '') + '</div><button class="btn primary block" id="saveDiscourse" data-act="saveProg">Salvar</button><button class="btn block" id="saveMessage" data-act="saveMsg">Salvar e pedir confirmação</button>' + (id ? '<button class="btn danger block" data-act="delProg">Excluir discurso</button>' : '') + '<button class="btn block" data-act="closeSheet">Cancelar</button>');
  $('#f_dest').disabled = f.tipo !== 'envio';
  formChg();
}
function readForm() {
  const f = ui.form; f.data = $('#f_data').value; const selected = $('#f_orad').value; if (key(f.orador) !== key(selected)) f.origem = C.congDe(st, selected); f.orador = selected; f.tipo = $('#f_tipo').value; f.destino = $('#f_dest').value; const e = C.num($('#f_esb').value); f.esboco = e == null ? '' : e; return f;
}
function formChg() {
  if (!$('#f_data')) return; const f = readForm(), box = $('#alertbox');
  $('#confirmationField').style.display = f.tipo === 'envio' ? 'none' : '';
  $('#saveMessage').textContent = f.tipo === 'envio' ? 'Salvar e gerar informe' : 'Salvar e pedir confirmação';
  $('#saveMessage').style.display = f.tipo === 'envio' ? 'none' : '';
  $('#saveDiscourse').textContent = f.tipo === 'envio' ? 'Salvar e gerar informe' : 'Salvar';
  $('#f_cong').textContent = f.orador ? 'Congregação: ' + (f.origem || '—') : '';
  const tema = f.esboco === '' ? '' : (C.temaDe(st, f.esboco) || 'Esboço não encontrado'); $('#f_tema').textContent = tema;
  if (!f.data) { box.innerHTML = ''; return; }
  const al = C.alerta(st, f), N = st.config.intervalo; let m = [];
  if (al.conflito) m.push('Este orador já tem outro discurso no mesmo dia.');
  if (al.orador) m.push('Orador repetido: já tem discurso em ' + D.brFull(D.parse(al.orador.data)) + ' (menos de ' + N + ' dias).');
  if (al.esboco) m.push('Esboço repetido: usado em ' + D.brFull(D.parse(al.esboco.data)) + ' por ' + (al.esboco.orador || 'orador a definir') + ' (menos de ' + N + ' dias).');
  box.className = m.length ? 'alertbox' : ''; box.innerHTML = m.map(x => '⚠ ' + esc(x)).join('<br>');
}
function saveProg(thenMsg) {
  const f = readForm(); if (!Number.isFinite(D.parse(f.data))) return toast('Escolha uma data válida.');
  if (f.esboco !== '' && (!Number.isInteger(f.esboco) || f.esboco <= 0)) return toast('Informe um número de esboço inteiro e positivo.');
  if (!norm(st.config.local)) return toast('Defina a congregação local em Configurações.');
  if (f.tipo === 'local') f.destino = st.config.local;
  if (f.tipo === 'envio' && (!norm(f.orador) || key(f.id ? f.origem : C.congDe(st, f.orador)) !== key(st.config.local) || !f.destino || key(f.destino) === key(st.config.local))) return toast('Escolha um orador local e uma congregação de destino diferente.');
  if (C.alerta(st, f).conflito) return toast('O orador já tem um discurso nessa data.');
  const cv = norm($('#f_cant').value), old = f.id ? st.prog.find(x => x.id === f.id) : null;
  const entry = { tipo: f.tipo, origem: f.id ? (f.origem || C.congDe(st, f.orador)) : C.congDe(st, f.orador), destino: f.destino, id: f.id || C.newId(), data: f.data, orador: norm(f.orador), esboco: f.esboco === '' ? null : f.esboco, cantico: cv === '' ? '' : (C.num(cv) != null ? C.num(cv) : cv), imagens: $('#f_img').value, confirmado: $('#f_conf').value, hora: norm($('#f_hora').value), pedido: old && key(old.orador) === key(f.orador) && old.data === f.data && key(C.destinoDe(st, old)) === key(f.destino) ? (old.pedido || '') : '' };
  if (entry.tipo === 'envio') { entry.confirmado = ''; entry.pedido = ''; }
  if (old && (key(old.orador) !== key(entry.orador) || old.data !== entry.data || key(C.destinoDe(st, old)) !== key(entry.destino))) entry.confirmado = '';
  const i = st.prog.findIndex(x => x.id === entry.id); if (i >= 0) st.prog[i] = entry; else st.prog.push(entry);
  ui.esc.draft = {}; save();
  if (thenMsg === true || entry.tipo === 'envio') { render(); openMsg(entry.id); } else { closeSheet(); render(); toast('Discurso salvo.'); }
}
/* ---------- cadastros ---------- */
function congOptions(cur) { return '<option value="">— sem congregação —</option>' + C.allCongs(st).map(c => '<option value="' + esc(c) + '" ' + (key(c) === key(cur) ? 'selected' : '') + '>' + esc(c) + '</option>').join(''); }
function contactControl() {
  const nativePicker = window.isSecureContext && navigator.contacts && typeof navigator.contacts.select === 'function';
  return (nativePicker ? '<button class="btn block" style="margin-top:8px" data-act="pickContact">Escolher telefone da agenda</button>' : '<div class="sub">A seleção da agenda não está disponível neste navegador. Digite ou cole o telefone, ou importe um contato exportado da agenda.</div>') + '<input id="fileContact" type="file" accept=".vcf,text/vcard,text/x-vcard" data-chg="contactFile" hidden><button class="btn block" style="margin-top:8px" data-act="pickContactFile">Importar contato (.vcf)</button><div class="sub">Na agenda do celular, exporte o contato para um arquivo .vcf e escolha esse arquivo aqui. O número só é gravado ao salvar.</div><div id="contactNumbers"></div>';
}
function chooseContactPhone(phones) {
  if (!phones.length) return toast('O contato não contém um telefone legível.');
  if (phones.length === 1) { $('#o_fone').value = phones[0].fone; $('#contactNumbers').innerHTML = ''; toast('Telefone preenchido. Salve o cadastro.'); }
  else $('#contactNumbers').innerHTML = '<label>Escolha o número</label><select data-chg="contactNumber"><option value="">— selecionar —</option>' + phones.map(p => '<option value="' + esc(p.fone) + '">' + esc((p.nome ? p.nome + ' · ' : '') + p.fone) + '</option>').join('') + '</select>';
}
async function pickContact() { toast('A seleção de contatos está suspensa. Digite ou cole o telefone.'); }
function openOrad(i, congregation = '') {
  const o = i == null ? { nome: '', cong: congregation } : st.oradores[i]; ui.form = { i };
  sheet('<h2>' + (i == null ? 'Novo orador' : 'Editar orador') + '</h2><div class="field"><label>Nome</label><input id="o_nome" value="' + esc(o.nome) + '"></div><div class="field"><label>Congregação</label><select id="o_cong">' + congOptions(o.cong) + '</select></div><div class="field"><label>Ou digite uma nova congregação</label><input id="o_nova" placeholder="Opcional"></div><div class="field"><label>Telefone / WhatsApp</label><input id="o_fone" inputmode="tel" placeholder="(98) 99999-0000" value="' + esc(o.fone || '') + '">' + '<div class="sub">Digite ou cole o telefone do orador.</div>' + '</div><button class="btn primary block" data-act="saveOrad">Salvar</button>' + (i == null ? '' : '<button class="btn danger block" data-act="delOrad">Excluir orador</button>') + '<button class="btn block" data-act="closeSheet">Cancelar</button>');
}
function congregationSpeakers(name) {
  if (!name) return '<p class="sub">Salve a congregação para cadastrar os oradores vinculados.</p>';
  const speakers = st.oradores.map((o,i) => ({...o,i})).filter(o => key(o.cong) === key(name)).sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return '<div class="cong-speakers"><h3>Oradores vinculados (' + speakers.length + ')</h3>' + (speakers.length ? speakers.map(o => '<button class="speaker-link" data-act="editOrad" data-i="' + o.i + '"><span>' + esc(o.nome) + '</span><small>' + esc(o.fone || 'Sem telefone') + '</small></button>').join('') : '<p class="sub">Nenhum orador vinculado a esta congregação.</p>') + '<button class="btn block" data-act="newOradCong" data-v="' + esc(name) + '">+ Cadastrar orador nesta congregação</button></div>';
}
function openCong(name) {
  ui.form = { name }; sheet('<h2>' + (name == null ? 'Nova congregação' : 'Editar congregação') + '</h2><div class="field"><label>Nome</label><input id="c_nome" value="' + esc(name || '') + '"></div><div class="field"><label>Horário dos discursos (ex.: 17h)</label><input id="c_hora" value="' + esc(name == null ? '' : (st.horarios[key(name)] || '')) + '" placeholder="usa o horário padrão"></div><button class="btn primary block" data-act="saveCong">Salvar</button>' + (name == null ? '' : '<button class="btn danger block" data-act="delCong">Excluir congregação</button>') + congregationSpeakers(name) + '<button class="btn block" data-act="closeSheet">Cancelar</button>');
}
function openEsb(n) {
  const e = n == null ? { n: Math.max(0, ...st.esbocos.map(x => x.n)) + 1, tema: '' } : st.esbocos.find(x => x.n === n); ui.form = { n };
  sheet('<h2>' + (n == null ? 'Novo esboço' : 'Editar esboço') + '</h2><div class="field"><label>Número</label><input type="number" id="e_n" value="' + e.n + '"></div><div class="field"><label>Tema</label><input id="e_tema" value="' + esc(norm(e.tema)) + '"></div><button class="btn primary block" data-act="saveEsb">Salvar</button>' + (n == null ? '' : '<button class="btn danger block" data-act="delEsb">Excluir esboço</button>') + '<button class="btn block" data-act="closeSheet">Cancelar</button>');
}
/* ---------- importar / exportar ---------- */
let xp = null;
function ensureXLSX() {
  if (window.XLSX) return Promise.resolve();
  if (xp) return xp;
  xp = new Promise((res, rej) => { const t = s => { const e = document.createElement('script'); e.src = s[0]; e.onload = res; e.onerror = () => s.length > 1 ? t(s.slice(1)) : rej(new Error('biblioteca de planilhas indisponível')); document.head.appendChild(e); }; t(['xlsx.full.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js']); });
  return xp.catch(e => { xp = null; throw e; });
}
function download(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
const XMIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
function applyImport(res, mode) {
  if (res.config?.local && st.config.local && key(res.config.local) !== key(st.config.local)) return toast('A planilha pertence a outra congregação local. Use um backup separado.');
  if (res.config?.local && !st.config.local) st.config.local = res.config.local;
  if (mode === 'replace') {
    if (res.oradores.length) { st.oradores = res.oradores; st.congregacoes = res.congregacoes; st.horarios = Object.assign({}, res.horarios); }
    if (res.esbocos.length) st.esbocos = res.esbocos;
    if (res.prog.length || res.abas.some(a => /^\d{4}:/.test(a))) st.prog = res.prog;
  } else {
    res.oradores.forEach(o => { const x = st.oradores.find(y => key(y.nome) === key(o.nome)); if (!x) st.oradores.push(o); else { if (!x.cong) x.cong = o.cong; if (!x.fone && o.fone) x.fone = o.fone; } });
    Object.keys(res.horarios).forEach(k => { if (!st.horarios[k]) st.horarios[k] = res.horarios[k]; });
    res.congregacoes.forEach(c => { if (!st.congregacoes.some(x => key(x) === key(c))) st.congregacoes.push(c); });
    res.esbocos.forEach(e => { const x = st.esbocos.find(y => y.n === e.n); if (x) x.tema = e.tema; else st.esbocos.push(e); });
    st.esbocos.sort((a, b) => a.n - b.n);
    res.prog.forEach(p => { if (!st.prog.some(x => x.data === p.data && key(x.orador) === key(p.orador) && Number(x.esboco) === Number(p.esboco) && (x.tipo || 'local') === (p.tipo || 'local') && key(C.destinoDe(st, x)) === key(C.destinoDe(st, p)))) st.prog.push(p); });
  }
  save(); closeSheet(); go('inicio'); toast('Dados importados.');
}
/* ---------- ações ---------- */
const A = {
  calendarMonth: el => {
    const d = new Date(D.parse(ui.prog.mes + '-01') * 86400000); d.setUTCMonth(d.getUTCMonth() + Number(el.dataset.step));
    const iso = D.iso(d.getTime() / 86400000); if (!/^\d{4}-/.test(iso)) return;
    ui.prog.mes = iso.slice(0,7); ui.prog.dia = iso; render();
  },
  calendarToday: () => { ui.prog.dia = D.iso(D.today()); ui.prog.mes = ui.prog.dia.slice(0,7); render(); },
  calendarDay: el => { ui.prog.dia = el.dataset.v; render(); },
  calendarNew: () => beginProg({data:ui.prog.dia, tipo:ui.prog.tipo === 'envio' ? 'envio' : 'local', orador:ui.prog.orador}),
  verEnvios: () => { ui.prog.tipo = 'envio'; go('prog'); },
  verLocais: () => { ui.prog.tipo = 'local'; go('prog'); },
  compEnvios: () => { ui.comp.tipo = 'envio'; ui.comp.orador = ''; go('compartilhar'); },
  pickContactFile: () => $('#fileContact').click(), pickContact, enviarOrador: el => beginProg({tipo:'envio', orador:el.dataset.v, destino:''}), newEnvio: () => beginProg({tipo:'envio', destino:''}), closeSheet, newProg: () => beginProg(), editProg: el => openProg({}, el.dataset.id), saveProg: () => saveProg(false), saveMsg: () => saveProg(true),
  hist: el => openHist(el.dataset.t, el.dataset.v),
  editFromHist: () => { const h = ui.hist; if (h.tipo === 'o') { const i = st.oradores.findIndex(o => key(o.nome) === key(h.id)); if (i >= 0) openOrad(i); } else if (h.tipo === 'c') openCong(h.id); else openEsb(Number(h.id)); },
  msg: el => openMsg(el.dataset.id),
  sendMsg: () => {
    const m = msgPrepare(), win = window.open('https://wa.me/' + C.foneWa(m.fone) + '?text=' + encodeURIComponent(m.text),'_blank');
    if (!win) return toast('O navegador bloqueou a abertura. Tente novamente ou copie o texto.');
    recordMessageAction(m,'Aberto no WhatsApp'); closeSheet(); render(); toast('Mensagem aberta no WhatsApp. Confira e envie no aplicativo.');
  },
  copyMsg: async () => { const m = msgPrepare(); if (await copyText(m.text)) { recordMessageAction(m,'Copiado'); toast('Mensagem copiada.'); } },
  confMsg: () => { const p = st.prog.find(x => x.id === ui.form.id); if (p && p.tipo !== 'envio') { p.confirmado = 'SIM'; save(); closeSheet(); render(); toast('Confirmado.'); } },
  modeloPadrao: () => { st.config.modelo = ''; save(); render(); toast('Modelo restaurado.'); },
  delProg: () => { if (confirm('Excluir este discurso?')) { C.excluirRecente(st,'prog',st.prog.findIndex(p => p.id === ui.form.id)); save(); closeSheet(); render(); toast('Discurso excluído.',st.lixeira.at(-1)?.id); } },
  pf: el => { ui.prog.filtro = el.dataset.v; render(true); },
  confirmar: el => { const p = st.prog.find(x => x.id === el.dataset.id); if (p && p.tipo !== 'envio') { p.confirmado = 'SIM'; save(); render(); toast('Confirmado.'); } },
  pickO: el => { const d = ui.esc.draft; d.orador = key(d.orador) === key(el.dataset.v) ? '' : el.dataset.v; render(); },
  pickE: el => { const d = ui.esc.draft, n = Number(el.dataset.v); d.esboco = d.esboco === n ? null : n; render(); },
  pickC: el => { ui.esc.cong = el.dataset.v; render(true); },
  moreO: () => { ui.esc.no += 10; render(); }, moreE: () => { ui.esc.ne += 10; render(); },
  clearDraft: () => { ui.esc.draft = {}; render(); },
  launch: () => { const d = ui.esc.draft; beginProg({ data: ui.esc.data, orador: d.orador || '', esboco: d.esboco == null ? '' : d.esboco }); },
  escalarEm: el => { ui.esc.data = el.dataset.v; ui.esc.draft = {}; go('escalar'); },
  zap: () => reviewShare('whatsapp'),
  copiar: () => reviewShare('copiar'),
  partilhar: () => reviewShare('outros'),
  finishShare: () => finishShare(),
  viewLog: el => { const x = st.informes.find(x => x.id === el.dataset.id); if (x) sheet('<h2>Informe registrado</h2><p>' + esc(x.acao) + ' · ' + esc(new Date(x.quando).toLocaleString('pt-BR')) + '</p><textarea readonly aria-label="Texto do informe registrado">' + esc(x.texto) + '</textarea><button class="btn block" data-act="closeSheet">Fechar</button>'); },
  undoDelete: el => { try { C.restaurarExclusao(st,el.dataset.id); save(); render(); toast('Registro restaurado.'); } catch(e) { toast(e.message); } },
  searchResult: el => el.dataset.t === 'p' ? openProg({},el.dataset.v) : openHist(el.dataset.t,el.dataset.v),
  wizardNext: () => wizardMove(1), wizardBack: () => wizardMove(-1), wizardSave: () => wizardSave(),
  rodAba: el => { ui.rod.aba = el.dataset.v; ui.rod.n = 30; render(true); }, rodMais: () => { ui.rod.n += 40; render(); },
  relAba: el => { ui.rel.aba = el.dataset.v; ui.rel.n = 30; render(true); }, relMais: () => { ui.rel.n += 40; render(); },
  cadAba: el => { ui.cad.aba = el.dataset.v; ui.cad.q = ''; render(true); },
  newOradCong: el => openOrad(null, el.dataset.v),
  newOrad: () => openOrad(null), editOrad: el => openOrad(Number(el.dataset.i)),
  saveOrad: () => {
    const nome = norm($('#o_nome').value); if (!nome) return toast('Digite o nome.');
    const cong = norm($('#o_nova').value) || $('#o_cong').value, fone = norm($('#o_fone').value), i = ui.form.i;
    if (st.oradores.some((o, k) => k !== i && key(o.nome) === key(nome))) return toast('Já existe um orador com esse nome.');
    if (i == null) st.oradores.push({ nome, cong, fone }); else { const old = st.oradores[i].nome; st.prog.forEach(p => { if (key(p.orador) === key(old) && !norm(p.origem)) p.origem = st.oradores[i].cong; }); st.oradores[i] = { nome, cong, fone }; if (key(old) !== key(nome) || old !== nome) st.prog.forEach(p => { if (key(p.orador) === key(old)) p.orador = nome; }); }
    save(); closeSheet(); render(); toast('Orador salvo.');
  },
  delOrad: () => { const o = st.oradores[ui.form.i], n = st.prog.filter(p => key(p.orador) === key(o.nome)).length; if (confirm('Excluir ' + o.nome + '?' + (n ? '\nOs ' + n + ' discursos dele continuam na programação.' : ''))) { st.prog.forEach(p => { if (key(p.orador) === key(o.nome) && !norm(p.origem)) p.origem = o.cong; }); C.excluirRecente(st,'oradores',ui.form.i); save(); closeSheet(); render(); toast('Orador excluído.',st.lixeira.at(-1)?.id); } },
  newCong: () => openCong(null), editCong: el => openCong(el.dataset.v),
  saveCong: () => {
    const nome = norm($('#c_nome').value), hora = norm($('#c_hora').value), old = ui.form.name; if (!nome) return toast('Digite o nome.');
    if (C.allCongs(st).some(c => key(c) === key(nome) && key(c) !== key(old))) return toast('Essa congregação já existe.');
    if (old == null) { if (C.allCongs(st).some(c => key(c) === key(nome))) return toast('Essa congregação já existe.'); st.congregacoes.push(nome); }
    else { if (key(st.config.local) === key(old)) st.config.local = nome; st.prog.forEach(p => { if (key(p.origem) === key(old)) p.origem = nome; if (key(p.destino) === key(old)) p.destino = nome; }); st.oradores.forEach(o => { if (key(o.cong) === key(old)) o.cong = nome; }); st.congregacoes = st.congregacoes.map(c => key(c) === key(old) ? nome : c); delete st.horarios[key(old)]; }
    if (hora) st.horarios[key(nome)] = hora; else delete st.horarios[key(nome)];
    save(); closeSheet(); render(); toast('Congregação salva.');
  },
  delCong: () => { const old = ui.form.name; if (key(st.config.local) === key(old) || C.rows(st).some(r => C.participa(r, old))) return toast('Esta congregação está vinculada à configuração ou ao histórico.'); if (st.oradores.some(o => key(o.cong) === key(old))) return toast('Há oradores nessa congregação. Mude-os antes.'); if (confirm('Excluir ' + old + '?')) { C.excluirRecente(st,'congregacoes',st.congregacoes.findIndex(c => key(c) === key(old))); delete st.horarios[key(old)]; save(); closeSheet(); render(); toast('Congregação excluída.',st.lixeira.at(-1)?.id); } },
  newEsb: () => openEsb(null), editEsb: el => openEsb(Number(el.dataset.v)),
  saveEsb: () => {
    const n = C.num($('#e_n').value), tema = norm($('#e_tema').value), old = ui.form.n; if (!Number.isInteger(n) || n <= 0 || !tema) return toast('Informe o número e o tema.');
    if (st.esbocos.some(e => e.n === n && e.n !== old)) return toast('Esse número já existe.');
    if (old == null) st.esbocos.push({ n, tema }); else { const e = st.esbocos.find(x => x.n === old); if (n !== old) st.prog.forEach(p => { if (Number(p.esboco) === old) p.esboco = n; }); e.n = n; e.tema = tema; }
    st.esbocos.sort((a, b) => a.n - b.n); save(); closeSheet(); render(); toast('Esboço salvo.');
  },
  delEsb: () => { const n = ui.form.n; if (confirm('Excluir o esboço ' + n + '?')) { C.excluirRecente(st,'esbocos',st.esbocos.findIndex(e => e.n === n)); save(); closeSheet(); render(); toast('Esboço excluído.',st.lixeira.at(-1)?.id); } },
  pickFile: () => $('#fileX').click(), pickJson: () => $('#fileJ').click(),
  expX: () => ensureXLSX().then(() => { download(new Blob([C.exportWorkbook(XLSX, st)], { type: XMIME }), 'Lista_de_Oradores_' + D.iso(D.today()) + '.xlsx'); toast('Planilha exportada.'); }).catch(e => toast(e.message)),
  shareX: () => ensureXLSX().then(() => { const name = 'Lista_de_Oradores_' + D.iso(D.today()) + '.xlsx', f = new File([C.exportWorkbook(XLSX, st)], name, { type: XMIME }); if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: 'Lista de Oradores' }); download(f, name); toast('Planilha salva no aparelho.'); }).catch(e => { if (e.name !== 'AbortError') toast(e.message); }),
  expJ: () => { download(new Blob([JSON.stringify(st)], { type: 'application/json' }), 'Lista_de_Oradores_backup_' + D.iso(D.today()) + '.json'); toast('Backup salvo.'); },
  wipe: () => { if (confirm('Apagar TODOS os dados deste aparelho? Isso não pode ser desfeito.')) { st = C.emptyState(); save(); render(); toast('Dados apagados.'); } },
  mesclar: () => applyImport(ui.imp, 'merge'), substituir: () => applyImport(ui.imp, 'replace'),
  instalar: () => { const e = window.__installEv; if (e) { e.prompt(); window.__installEv = null; } }
};
const CH = {
  preference: el => { const choices = {temaVisual:['claro','escuro','sistema'],tamanhoTexto:['normal','grande','maior']}; if (!choices[el.dataset.prop]?.includes(el.value)) return; st.config[el.dataset.prop] = el.value; save(); render(); },
  contrast: el => { st.config.altoContraste = el.value === 'sim'; save(); render(); },
  pendFiltro: el => { ui.pend.somente = el.value; render(); },
  globalSort: el => { ui.busca.ordem = el.value; render(); },
  progSort: el => { ui.prog.ordem = el.value; render(); },
  cadSort: el => { ui.cad.ordem = el.value; render(); },
  rodTipo: el => { ui.rod.tipo = el.value; render(); },
  rodIni: el => { ui.rod.ini = el.value; render(); }, rodFim: el => { ui.rod.fim = el.value; render(); },
  rodSort: el => { ui.rod.ordem = el.value; render(); },
  cfgVisualizacao: el => { if (!['lista','calendario'].includes(el.value)) return; st.config.visualizacao = el.value; save(); render(); toast('Visualização salva.'); },
  calendarTipo: el => { ui.prog.tipo = el.value; render(); },
  calendarOrador: el => { ui.prog.orador = el.value; render(); },
  palette: el => { if (!['local','envio'].includes(el.dataset.kind) || !Object.hasOwn(PALETTES, el.value)) return; st.config[el.dataset.kind + 'Palette'] = el.value; save(); render(); toast('Cores salvas.'); },
  contactFile: async el => {
    const file = el.files[0], form = ui.form; if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('Escolha um arquivo de contato de até 2 MB.');
      const text = await file.text();
      if (ui.form !== form || !document.querySelector('#o_fone')) return;
      chooseContactPhone(C.vcardPhones(text));
    } catch (e) { toast('Não foi possível importar o contato: ' + e.message); }
    finally { el.value = ''; }
  },
  cmpTipo: el => { ui.comp.tipo = el.value; ui.comp.orador = ''; render(); },
  cmpOrador: el => { ui.comp.orador = el.value; render(); },
  relTipo: el => { ui.rel.tipo = el.value; ui.rel.n = 30; render(); },
  histTipo: el => { ui.hist.modalidade = el.value; render(); },
  progTipo: el => { ui.prog.tipo = el.value; render(); },
  contactNumber: el => { if (el.value) $('#o_fone').value = el.value; },
  formTipo: el => { ui.form.tipo = el.value; $('#f_dest').disabled = el.value !== 'envio'; $('#f_dest').value = el.value === 'local' ? st.config.local : ''; formChg(); },
  cfgLocal: el => { const name = norm(el.value); if (st.config.local && key(name) !== key(st.config.local) && st.prog.length) { toast('Para preservar os arranjos, renomeie a congregação no cadastro.'); el.value = st.config.local; return; } st.config.local = name; if (name) st.prog.forEach(p => { if (!p.tipo || p.tipo === 'local') { p.tipo = 'local'; if (!p.destino) p.destino = name; if (!p.origem) p.origem = C.congDe(st, p.orador); } }); save(); toast('Congregação local salva.'); },
  escData: el => { ui.esc.data = el.value; render(); }, escInt: el => { ui.esc.int = Math.max(0, Number(el.value) || 0); render(); }, escCong: el => { ui.esc.cong = el.value; ui.esc.no = 8; render(); },
  pendDias: el => { ui.pend.dias = Number(el.value); render(); }, msgDias: el => { ui.msgs.dias = Number(el.value); render(); },
  cfgHora: el => { st.config.horaPadrao = norm(el.value); save(); toast('Salvo.'); }, cfgModelo: el => { st.config.modelo = el.value.trim() === C.MODELO_PADRAO ? '' : el.value; save(); toast('Salvo.'); },
  livIni: el => { ui.livres.ini = el.value; render(); }, livFim: el => { ui.livres.fim = el.value; render(); }, livDow: el => { ui.livres.dow = Number(el.value); render(); },
  cmpIni: el => { ui.comp.ini = el.value; render(); }, cmpFim: el => { ui.comp.fim = el.value; render(); },
  relAno: el => { ui.rel.ano = el.value; render(); },
  formChg,
  cfgInt: el => { st.config.intervalo = Math.max(0, Number(el.value) || 0); save(); ui.esc.int = null; toast('Salvo.'); }, cfgDow: el => { st.config.diaSemana = Number(el.value); save(); toast('Salvo.'); }, cfgPend: el => { st.config.diasPendencias = Math.max(1, Number(el.value) || 30); save(); toast('Salvo.'); },
  impFile: async el => { const f = el.files[0]; if (!f) return; try { await ensureXLSX(); const res = C.importWorkbook(XLSX, await f.arrayBuffer()); ui.imp = res; const nada = !res.prog.length && !res.oradores.length && !res.esbocos.length; sheet('<h2>Importar planilha</h2><div class="card"><div class="sub">Encontrei:</div><b>' + res.prog.length + '</b> discursos · <b>' + res.oradores.length + '</b> oradores · <b>' + res.esbocos.length + '</b> esboços<br><span class="sub">' + res.abas.map(esc).join('<br>') + '</span>' + (res.avisos.length ? '<div class="alertbox" style="margin-top:8px">' + res.avisos.map(esc).join('<br>') + '</div>' : '') + '</div>' + (nada ? '' : '<button class="btn primary block" data-act="mesclar">Mesclar com meus dados</button><button class="btn block" data-act="substituir">Substituir meus dados</button>') + '<button class="btn block" data-act="closeSheet">Cancelar</button>'); } catch (e) { toast('Não consegui ler o arquivo: ' + e.message); } el.value = ''; },
  impJson: async el => { const f = el.files[0]; if (!f) return; try { const restored = C.restoreState(JSON.parse(await f.text())); if (confirm('Restaurar o backup e substituir os dados atuais?')) { st = restored; save(); go('inicio'); toast('Backup restaurado.'); } } catch (e) { toast('Backup inválido: ' + e.message); } el.value = ''; }
};
const INP = { globalSearch: el => searchInput(el,ui.busca,'q'), progSearch: el => searchInput(el,ui.prog,'q'), rodSearch: el => searchInput(el,ui.rod,'q'), logSearch: el => searchInput(el,ui.logs,'q'), formChg, rodQ: el => { ui.rod.q = el.value; ui.rod.n = 30; render(); const i = $('input[data-inp="rodQ"]'); if (i) { i.focus(); i.setSelectionRange(99, 99); } }, cadQ: el => { ui.cad.q = el.value; render(); const i = $('input[data-inp="cadQ"]'); if (i) { i.focus(); i.setSelectionRange(99, 99); } } };
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',applyAppearance);
document.addEventListener('keydown', e => {
  const modal = document.querySelector('.sheet');
  if (e.key === 'Escape' && modal) { e.preventDefault(); closeSheet(); return; }
  if (e.key === 'Tab' && modal) {
    const focusable = [...modal.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
    if (!focusable.length) { e.preventDefault(); modal.focus(); return; }
    const first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || document.activeElement === modal)) { e.preventDefault(); first.focus(); }
  }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('div[data-act],div[data-go]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('click', e => {
  if (e.target.id === 'overlay') { closeSheet(); return; }
  const el = e.target.closest('[data-act],[data-go]'); if (!el) return;
  if (el.dataset.act && A[el.dataset.act]) A[el.dataset.act](el, e); else if (el.dataset.go) go(el.dataset.go);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el && CH[el.dataset.chg]) CH[el.dataset.chg](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-inp]'); if (el && INP[el.dataset.inp]) INP[el.dataset.inp](el, e); });
$('#back').addEventListener('click', () => { if (ui.route === 'hist') { if (ui.hstack.length) { ui.hist = ui.hstack.pop(); render(true); } else go(ui.hfrom || 'cadastros'); } else go('mais'); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__installEv = e; if (ui.route === 'mais') render(); });
render(true);
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
window.__app = { get st() { return st; }, ui, go, render, openProg };
})();
