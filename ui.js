/* Lista de Oradores — interface */
(function () {
'use strict';
const C = Core, D = C.D, norm = C.norm, key = C.key;
const LS = 'lista-oradores-v1';
const TABS = ['inicio', 'prog', 'escalar', 'pend', 'mais'];
const TITLES = { arranjos: 'Arranjos entre congregações', inicio: 'Lista de Oradores', prog: 'Programação', escalar: 'Quem escalar', pend: 'Pendências', mais: 'Mais opções', livres: 'Datas livres', compartilhar: 'Compartilhar', rodizio: 'Rodízio', relatorios: 'Relatórios', cadastros: 'Cadastros', dados: 'Dados e planilha', config: 'Configurações', ajuda: 'Ajuda', hist: 'Histórico', msgs: 'Confirmações' };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
let st = load();
const ui = { route: 'inicio', esc: { data: '', int: null, cong: '', draft: {}, no: 8, ne: 8 }, prog: { filtro: 'prox', tipo: 'todos' }, pend: { dias: null }, livres: { ini: '', fim: '', dow: null }, comp: { ini: '', fim: '', tipo: 'local', orador: '' }, rod: { aba: 'o', n: 30, q: '' }, rel: { ano: 'todos', aba: 'o', n: 30, tipo: 'local' }, cad: { aba: 'o', q: '' }, form: null, imp: null, hist: { tipo: 'o', id: '', modalidade: 'todos' }, hstack: [], hfrom: 'cadastros', msgs: { dias: 30 } };

function load() { try { const raw = localStorage.getItem(LS); if (raw) return C.restoreState(JSON.parse(raw)); } catch (e) { setTimeout(() => toast('Não foi possível carregar os dados. Restaure um backup válido.'), 0); } return C.emptyState(); }
function save() { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (e) { toast('Não foi possível salvar no aparelho.'); } }
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = { home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.6 3.5 5"/>', alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>', grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' };
const svg = n => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>';
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.style.display = 'block'; clearTimeout(tt); tt = setTimeout(() => t.style.display = 'none', 2600); }
function sheet(html) { const o = $('#overlay'); o.innerHTML = '<div class="sheet">' + html + '</div>'; o.classList.add('on'); }
function closeSheet() { const o = $('#overlay'); o.classList.remove('on'); o.innerHTML = ''; }
function go(r) { ui.route = r; closeSheet(); render(true); }
function render(reset) {
  const v = $('#view'), sc = v.scrollTop;
  v.innerHTML = (V[ui.route] || V.inicio)();
  $('#top h1').textContent = TITLES[ui.route] || 'Lista de Oradores';
  const cur = ui.route === 'hist' ? ui.hfrom : ui.route; document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.go === (TABS.includes(cur) ? cur : 'mais')));
  $('#back').style.display = TABS.includes(ui.route) ? 'none' : 'block';
  v.scrollTop = reset ? 0 : sc;
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
function nextCard(label, p, empty) {
  return '<div class="hero next-card"><small>' + label + '</small>' + (p ? '<b>' + esc(p.orador || 'Orador a definir') + '</b><div>' + D.brFull(p.d) + ' · ' + esc(p.destino || st.config.local || 'Congregação local') + '</div><div class="next-topic">' + (p.esboco ? 'Nº ' + p.esboco + ' · ' + esc(C.temaDe(st, p.esboco) || 'Tema a definir') : 'Tema a definir') + '</div>' : '<b>' + empty + '</b><div>Novos agendamentos aparecerão aqui.</div>') + '</div>';
}
function itemProg(r) {
  const al = C.alerta(st, r), f = C.faltas(r); let chips = '<span class="chip">' + (r.tipo === 'envio' ? 'Envio' : 'Local') + ' · ' + esc(r.origem || 'origem a definir') + ' → ' + esc(r.destino || 'congregação local') + '</span>';
  if (al.conflito) chips += '<span class="chip bad">Conflito de agenda no mesmo dia</span>';
  if (al.any) chips += '<span class="chip bad">⚠ repetição' + (al.orador ? ' de orador' : '') + (al.esboco ? ' de esboço' : '') + '</span>';
  if (r.tipo !== 'envio') chips += f.includes('confirmação') ? (r.pedido ? '<span class="chip">pedido enviado em ' + D.br(D.parse(r.pedido)) + '</span>' : '<span class="chip warn">sem confirmação</span>') : '<span class="chip ok">confirmado</span>';
  if (f.includes('cântico')) chips += '<span class="chip warn">sem cântico</span>'; else chips += '<span class="chip">cântico ' + esc(r.cantico) + '</span>';
  if (f.includes('imagens')) chips += '<span class="chip warn">imagens?</span>'; else chips += '<span class="chip">imagens ' + esc(r.imagens) + '</span>';
  return '<div class="item" data-act="editProg" data-id="' + r.id + '"><div class="d"><b>' + D.br(r.d).slice(0, 2) + '</b><small>' + D.dow3(r.d) + '</small></div><div class="m"><b>' + esc(r.orador || 'Orador a definir') + '</b><div>' + esc(r.cong || '') + (r.esboco ? ' · Nº ' + r.esboco + ': ' + esc(C.temaDe(st, r.esboco)) : ' · tema a definir') + '</div>' + chips + '</div></div>';
}
const V = {};
V.inicio = () => {
  const t = D.today(), k = C.indicadores(st, t); let h = '';
  if (!st.prog.length && !st.oradores.length) h += '<div class="card"><h3>Bem-vindo!</h3><p class="sub">Traga a sua planilha (.xlsx) para começar, ou cadastre os dados direto no aplicativo.</p><button class="btn primary block" data-go="dados">Importar planilha</button><button class="btn block" data-go="cadastros">Cadastrar oradores</button></div>';
  const p = k.prox, envios = C.rows(st).filter(r => r.tipo === 'envio'), proximosEnvios = envios.filter(r => r.d >= t).sort((a,b) => a.d - b.d);
  const hoje = C.rows(st).filter(r => r.d === t), locaisHoje = hoje.filter(r => r.tipo !== 'envio').length;
  h += '<div class="welcome"><span>Olá! 👋</span><h2>Temos algum agendamento para hoje?</h2><p>' + (hoje.length ? locaisHoje + ' na congregação local · ' + (hoje.length - locaisHoje) + ' envios para outras congregações.' : 'Hoje não há discursos agendados. Vamos organizar os próximos?') + '</p></div>';
  h += '<section class="home-section theme-' + paletteFor('local') + '" aria-label="Discursos locais"><div class="sec">Na congregação local</div>' + nextCard('Próximo discurso local', p, 'Nenhum discurso local agendado');
  h += '<div class="kpis"><div class="kpi"><b>' + k.discursosAno + '</b><span>Discursos locais em ' + D.year(t) + '</span></div><div class="kpi"><b>' + k.livres8 + '</b><span>Datas locais livres em 8 semanas</span></div></div><div class="row home-actions"><button class="btn primary" data-act="newProg">Agendar local</button><button class="btn" data-go="escalar">Quem escalar</button><button class="btn" data-act="verLocais">Ver programação local</button><button class="btn" data-go="msgs">Confirmações locais</button></div></section>';
  const e = proximosEnvios[0];
  h += '<section class="home-section theme-' + paletteFor('envio') + '" aria-label="Envios"><div class="sec">Oradores locais em outras congregações</div>' + nextCard('Próximo envio', e, 'Nenhum envio agendado');
  h += '<div class="kpis"><div class="kpi"><b>' + proximosEnvios.length + '</b><span>Envios futuros</span></div><div class="kpi"><b>' + envios.filter(r => D.year(r.d) === D.year(t)).length + '</b><span>Envios em ' + D.year(t) + '</span></div></div><div class="row home-actions"><button class="btn primary" data-act="newEnvio">Agendar envio</button><button class="btn" data-go="arranjos">Ver arranjos</button><button class="btn" data-act="verEnvios">Ver todos os envios</button><button class="btn" data-act="compEnvios">Compartilhar envios</button></div>';
  if (proximosEnvios.length) h += '<div class="sec">Próximos envios</div>' + proximosEnvios.slice(0,3).map(itemProg).join('');
  h += '</section>';
  const cf = C.confirmacoes(st, t, st.config.diasPendencias || 30);
  h += '<div class="card"><h3>Acompanhamento</h3><div class="sub">' + cf.length + ' discursos locais sem confirmação · ' + k.pendencias + ' programações com pendências</div><div class="row home-actions"><button class="btn" data-go="pend">Pendências</button><button class="btn" data-go="relatorios">Rankings por modalidade</button></div></div>';
  return h;
};
V.prog = () => {
  const t = D.today(), R = C.rows(st).sort((a, b) => a.d - b.d), anos = [...new Set(R.map(r => D.year(r.d)))].sort();
  let f = ui.prog.filtro; if (f === 'prox' && !R.some(r => r.d >= t) && R.length) f = ui.prog.filtro = 'tudo';
  let list = f === 'prox' ? R.filter(r => r.d >= t) : f === 'tudo' ? R : R.filter(r => D.year(r.d) === Number(f));
  list = list.filter(r => ui.prog.tipo === 'todos' || r.tipo === ui.prog.tipo);
  let h = '<div class="seg"><button data-act="pf" data-v="prox" class="' + (f === 'prox' ? 'on' : '') + '">Próximos</button>' + anos.map(a => '<button data-act="pf" data-v="' + a + '" class="' + (f == a ? 'on' : '') + '">' + a + '</button>').join('') + '<button data-act="pf" data-v="tudo" class="' + (f === 'tudo' ? 'on' : '') + '">Tudo</button></div>';
  h = '<div class="field"><label>Programação</label><select data-chg="progTipo">' + [['todos','Todos os discursos'],['local','Na congregação local'],['envio','Envios para outras congregações']].map(([v,t]) => '<option value="' + v + '" ' + (ui.prog.tipo === v ? 'selected' : '') + '>' + t + '</option>').join('') + '</select></div>' + h;
  if (!list.length) h += '<div class="empty">Nenhum discurso aqui ainda.<br>Toque em + para lançar o primeiro.</div>';
  let mes = '';
  list.forEach(r => { const m = MESES[new Date(r.d * 86400000).getUTCMonth()] + ' ' + D.year(r.d); if (m !== mes) { mes = m; h += '<div class="sec">' + m + '</div>'; } h += itemProg(r); });
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
  let h = '<div class="card"><div class="field" style="margin:0"><label>Olhar os próximos</label><select data-chg="pendDias">' + [7, 15, 30, 60, 90].map(n => '<option value="' + n + '" ' + (n === dias ? 'selected' : '') + '>' + n + ' dias</option>').join('') + '</select></div></div>';
  h += '<div class="kpis"><div class="kpi"><b>' + P.total + '</b><span>Discursos no período</span></div><div class="kpi ' + (P.semConfirmacao ? 'warn' : 'ok') + '"><b>' + P.semConfirmacao + '</b><span>Sem confirmação</span></div><div class="kpi ' + (P.semCantico ? 'warn' : 'ok') + '"><b>' + P.semCantico + '</b><span>Sem cântico</span></div><div class="kpi ' + (P.semImagens ? 'warn' : 'ok') + '"><b>' + P.semImagens + '</b><span>Imagens não definidas</span></div></div>';
  if (!P.lista.length) return h + '<div class="empty">Tudo certo nesse período. 🎉</div>';
  P.lista.forEach(r => { h += '<div class="item" data-act="editProg" data-id="' + r.id + '"><div class="d"><b>' + D.br(r.d).slice(0, 2) + '</b><small>' + D.dow3(r.d) + '</small></div><div class="m"><b>' + esc(r.orador || 'Orador a definir') + '</b><div>' + (r.faltam === 0 ? 'hoje' : 'faltam ' + fmtDias(r.faltam)) + ' · ' + (r.tipo === 'envio' ? 'Envio para ' : 'Local: ') + esc(r.destino || 'congregação local') + '</div>' + r.faltas.map(x => '<span class="chip warn">' + x + '</span>').join('') + '</div>' + (r.faltas.includes('confirmação') && r.orador ? '<div style="display:flex;flex-direction:column;gap:6px"><button class="btn sm primary" data-act="msg" data-id="' + r.id + '">Pedir</button><button class="btn sm" data-act="confirmar" data-id="' + r.id + '">Confirmar</button></div>' : '') + '</div>'; });
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
  const r = ui.rod, R = C.rodizio(st, D.today());
  let h = '<div class="seg"><button data-act="rodAba" data-v="o" class="' + (r.aba === 'o' ? 'on' : '') + '">Oradores</button><button data-act="rodAba" data-v="c" class="' + (r.aba === 'c' ? 'on' : '') + '">Congregações</button><button data-act="rodAba" data-v="e" class="' + (r.aba === 'e' ? 'on' : '') + '">Esboços</button></div><div class="sub" style="margin:0 4px 8px">Do que está há mais tempo sem uso para o mais recente.</div>';
  if (r.aba === 'o') R.oradores.forEach(o => { h += '<div class="item" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><div class="m"><b>' + esc(o.nome) + '</b><div>' + esc(o.cong) + '<br>Último: ' + lastTxt(o) + (o.lastEsb ? ' · Nº ' + o.lastEsb : '') + '<br>Próximo: ' + (o.next ? D.brFull(o.next) + (o.nextEsb ? ' · Nº ' + o.nextEsb : '') : '—') + '</div></div></div>'; });
  if (r.aba === 'c') R.congs.forEach(o => { h += '<div class="item" data-act="hist" data-t="c" data-v="' + esc(o.nome) + '"><div class="m"><b>' + esc(o.nome) + '</b><div>Último arranjo: ' + lastTxt(o) + (o.lastOrador ? ' · ' + esc(o.lastOrador) : '') + '<br>Próximo: ' + (o.next ? D.brFull(o.next) + ' · ' + esc(o.nextOrador) : '—') + '</div></div></div>'; });
  if (r.aba === 'e') {
    const q = key(r.q), list = R.esbocos.filter(x => !q || String(x.n) === q || key(x.tema).includes(q));
    h += '<div class="field"><input type="search" placeholder="Buscar por número ou tema" value="' + esc(r.q) + '" data-inp="rodQ"></div>';
    list.slice(0, r.n).forEach(x => { h += '<div class="item" data-act="hist" data-t="e" data-v="' + x.n + '"><div class="m"><b>Nº ' + x.n + '</b><div>' + esc(x.tema) + '<br>Último uso: ' + lastTxt(x) + (x.lastOrador ? ' · ' + esc(x.lastOrador) : '') + '<br>Próximo: ' + (x.next ? D.brFull(x.next) + ' · ' + esc(x.nextOrador) : '—') + '</div></div></div>'; });
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
  list.slice(0, r.aba === 'e' ? r.n : 999).forEach(x => { h += '<div class="item" data-act="hist" data-t="' + r.aba + '" data-v="' + (r.aba === 'e' ? x.n : esc(x.nome)) + '"><div class="pos">' + x.pos + 'º</div><div class="m"><b>' + (r.aba === 'e' ? 'Nº ' + x.n : esc(x.nome)) + '</b><div>' + (r.aba === 'e' ? esc(x.tema) : r.aba === 'o' ? esc(x.cong) : '') + '</div><div class="bar"><i style="width:' + (x.count / max * 100) + '%"></i></div></div><b>' + x.count + '</b></div>'; });
  if (r.aba === 'e' && list.length > r.n) h += '<button class="btn block" data-act="relMais">Mostrar mais</button>';
  return h;
};
V.cadastros = () => {
  const c = ui.cad, q = key(c.q);
  let h = '<div class="seg"><button data-act="cadAba" data-v="o" class="' + (c.aba === 'o' ? 'on' : '') + '">Oradores</button><button data-act="cadAba" data-v="c" class="' + (c.aba === 'c' ? 'on' : '') + '">Congregações</button><button data-act="cadAba" data-v="e" class="' + (c.aba === 'e' ? 'on' : '') + '">Esboços</button></div><div class="field"><input type="search" placeholder="Buscar" value="' + esc(c.q) + '" data-inp="cadQ"></div>';
  if (c.aba === 'o') { h += '<button class="btn primary block" data-act="newOrad">+ Novo orador</button>'; const L = st.oradores.map((o, i) => ({ ...o, i })).filter(o => !q || key(o.nome).includes(q) || key(o.cong).includes(q)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')); if (!L.length) h += '<div class="empty">Nenhum orador.</div>'; const R0 = C.rows(st); L.forEach(o => { const n = R0.filter(r => key(r.orador) === key(o.nome)).length; h += '<div class="item" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><div class="m"><b>' + esc(o.nome) + '</b><div>' + esc(o.cong || 'sem congregação') + (key(o.cong) === key(st.config.local) && st.config.local ? ' · local' : '') + ' · ' + n + (n === 1 ? ' discurso' : ' discursos') + (o.fone ? ' · ' + esc(o.fone) : ' · sem telefone') + '</div></div></div>'; }); }
  if (c.aba === 'c') { h += '<button class="btn primary block" data-act="newCong">+ Nova congregação</button>'; const L = C.allCongs(st).filter(x => !q || key(x).includes(q)); if (!L.length) h += '<div class="empty">Nenhuma congregação.</div>'; L.forEach(x => { const n = st.oradores.filter(o => key(o.cong) === key(x)).length; h += '<div class="item" data-act="hist" data-t="c" data-v="' + esc(x) + '"><div class="m"><b>' + esc(x) + '</b><div>' + n + (n === 1 ? ' orador' : ' oradores') + (st.horarios[key(x)] ? ' · ' + esc(st.horarios[key(x)]) : '') + '</div></div></div>'; }); }
  if (c.aba === 'e') { h += '<button class="btn primary block" data-act="newEsb">+ Novo esboço</button>'; const L = st.esbocos.filter(e => !q || String(e.n) === q || key(e.tema).includes(q)); if (!L.length) h += '<div class="empty">Nenhum esboço.</div>'; L.slice(0, 80).forEach(e => { h += '<div class="item" data-act="hist" data-t="e" data-v="' + e.n + '"><div class="pos">' + e.n + '</div><div class="m"><b>' + esc(norm(e.tema)) + '</b></div></div>'; }); if (L.length > 80) h += '<div class="sub" style="text-align:center">Mostrando 80 de ' + L.length + '. Use a busca.</div>'; }
  return h;
};
V.mais = () => {
  const it = (r, t, d) => '<div class="item" data-go="' + r + '"><div class="m"><b>' + t + '</b><div>' + d + '</div></div></div>';
  return it('arranjos', 'Arranjos', 'Oradores locais, envios e recebimentos') + it('msgs', 'Confirmações', 'Pedir a confirmação dos oradores') + it('livres', 'Datas livres', 'Datas ainda sem orador') + it('compartilhar', 'Compartilhar', 'Texto da programação para o WhatsApp') + it('rodizio', 'Rodízio', 'Quem está há mais tempo sem') + it('relatorios', 'Relatórios', 'Rankings por período') + it('cadastros', 'Cadastros', 'Oradores, congregações e esboços') + it('dados', 'Dados e planilha', 'Importar, exportar e backup') + it('config', 'Configurações', 'Intervalo mínimo e preferências') + it('ajuda', 'Ajuda', 'Como usar') + (window.__installEv ? '<button class="btn primary block" data-act="instalar" style="margin-top:8px">Instalar aplicativo</button>' : '');
};
V.arranjos = () => {
  if (!norm(st.config.local)) return '<div class="card"><h3>Defina a congregação local</h3><p>Informe o nome em Configurações e vincule os oradores locais a essa congregação no cadastro.</p><button class="btn primary block" data-go="config">Configurar</button></div>';
  const locais = st.oradores.filter(o => key(o.cong) === key(st.config.local));
  return '<div class="hero"><small>Congregação local</small><b>' + esc(st.config.local) + '</b><div>' + locais.length + ' oradores locais cadastrados</div></div><div class="row"><button class="btn primary" data-act="newEnvio">Agendar envio</button><button class="btn" data-act="newProg">Agendar discurso local</button></div><p class="sub">Recebimentos e envios são registros independentes: podem ocorrer em datas diferentes. Os totais incluem programações anteriores e futuras.</p>' + '<div class="sec">Oradores locais</div>' + locais.map(o => '<div class="item"><div class="m" data-act="hist" data-t="o" data-v="' + esc(o.nome) + '"><b>' + esc(o.nome) + '</b><div>Ver histórico de discursos locais e envios</div></div><button class="btn sm" data-act="enviarOrador" data-v="' + esc(o.nome) + '">Agendar envio</button></div>').join('') + '<div class="sec">Arranjos por congregação</div>' + C.arranjos(st).map(c => '<div class="item" data-act="hist" data-t="c" data-v="' + esc(c.nome) + '"><div class="m"><b>' + esc(c.nome) + '</b><div>Recebemos: ' + c.recebidos + ' · Enviamos: ' + c.enviados + '<br>Programações futuras: ' + c.proximos + '</div></div></div>').join('');
};
V.dados = () => '<div class="card"><h3>Planilha (.xlsx)</h3><p class="sub">Importe a planilha do Excel (abas 2026, 2027, CADASTROS e ESBOÇOS) ou exporte seus dados em .xlsx.</p><input type="file" id="fileX" accept=".xlsx,.xls" data-chg="impFile" style="display:none"><button class="btn primary block" data-act="pickFile">Importar planilha</button><button class="btn block" data-act="expX">Exportar para planilha</button><button class="btn block" data-act="shareX">Enviar planilha para outro celular</button></div><div class="card"><h3>Backup do aplicativo</h3><p class="sub">Arquivo .json com todos os dados, para guardar ou levar para outro aparelho.</p><input type="file" id="fileJ" accept=".json,application/json" data-chg="impJson" style="display:none"><button class="btn block" data-act="expJ">Salvar backup</button><button class="btn block" data-act="pickJson">Restaurar backup</button></div><div class="card"><h3>Apagar tudo</h3><p class="sub">Remove todos os dados deste aparelho.</p><button class="btn danger block" data-act="wipe">Apagar dados</button></div><div class="sub" style="text-align:center">Os dados ficam só neste celular.</div>';
V.config = () => paletteSettings() + '<div class="card"><div class="field"><label>Nome da congregação local</label><input value="' + esc(st.config.local) + '" data-chg="cfgLocal"><div class="sub">Identifica os oradores locais pelo cadastro da congregação.</div></div><div class="field"><label>Intervalo mínimo entre discursos locais do mesmo orador ou esboço (dias)</label><input type="number" min="0" value="' + st.config.intervalo + '" data-chg="cfgInt"></div><div class="field"><label>Dia da semana dos discursos</label><select data-chg="cfgDow">' + ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map((n, i) => '<option value="' + i + '" ' + (i === Number(st.config.diaSemana) ? 'selected' : '') + '>' + n + '</option>').join('') + '</select></div><div class="field"><label>Dias olhados nas pendências</label><input type="number" min="1" value="' + st.config.diasPendencias + '" data-chg="cfgPend"></div><div class="field" style="margin:0"><label>Horário padrão dos discursos (ex.: 17h)</label><input value="' + esc(st.config.horaPadrao) + '" data-chg="cfgHora"><div class="sub">Cada congregação pode ter o seu horário, em Cadastros.</div></div></div><div class="card"><h3>Mensagem de confirmação</h3><div class="sub">Marcadores: {nome} {tema} {congregacao} {data} {hora}</div><textarea style="font-family:inherit;font-size:14px;min-height:260px;margin-top:8px" data-chg="cfgModelo">' + esc(st.config.modelo || C.MODELO_PADRAO) + '</textarea><button class="btn block" style="margin-top:8px" data-act="modeloPadrao">Restaurar modelo padrão</button></div>';
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
V.msgs = () => {
  const dias = ui.msgs.dias, L = C.confirmacoes(st, D.today(), dias), novos = L.filter(x => x.status === 'novo').length;
  let h = '<div class="card"><div class="field" style="margin:0"><label>Olhar os próximos</label><select data-chg="msgDias">' + [7, 15, 30, 60, 90].map(n => '<option value="' + n + '" ' + (n === dias ? 'selected' : '') + '>' + n + ' dias</option>').join('') + '</select></div></div>';
  h += '<div class="kpis"><div class="kpi ' + (novos ? 'warn' : 'ok') + '"><b>' + novos + '</b><span>Confirmações a pedir</span></div><div class="kpi"><b>' + (L.length - novos) + '</b><span>Aguardando resposta</span></div></div>';
  if (!L.length) return h + '<div class="empty">Todos os oradores do período já confirmaram. 🎉</div>';
  const t = D.today();
  L.forEach(r => { h += '<div class="item"><div class="m" data-act="editProg" data-id="' + r.id + '"><b>' + esc(r.orador) + '</b><div>' + D.brFull(r.d) + ' (' + D.dow3(r.d) + ') · ' + (r.d === t ? 'hoje' : 'faltam ' + fmtDias(r.d - t)) + '<br>' + (r.tipo === 'envio' ? 'Envio: ' : 'Local: ') + esc(r.origem || '') + ' → ' + esc(r.destino || 'congregação local') + (r.esboco ? ' · Nº ' + r.esboco : '') + '</div>' + (r.status === 'novo' ? '<span class="chip warn">ainda não pedido</span>' : '<span class="chip">pedido ' + (r.diasPedido === 0 ? 'hoje' : 'há ' + fmtDias(r.diasPedido)) + '</span>') + (r.fone ? '' : '<span class="chip">sem telefone</span>') + '</div><div style="display:flex;flex-direction:column;gap:6px"><button class="btn sm primary" data-act="msg" data-id="' + r.id + '">' + (r.status === 'novo' ? 'Pedir' : 'Reenviar') + '</button><button class="btn sm" data-act="confirmar" data-id="' + r.id + '">Confirmou</button></div></div>'; });
  return h;
};
function openMsg(id) {
  const p = st.prog.find(x => x.id === id); if (!p) return;
  const text = C.mensagemConfirmacao(st, p); if (!text) return toast('Defina a data e o orador para montar a mensagem.');
  const o = st.oradores.find(x => key(x.nome) === key(p.orador)); ui.form = { id };
  const envio = p.tipo === 'envio';
  sheet('<h2>' + (envio ? 'Informe da programação' : 'Pedir confirmação') + '</h2><div class="sub" style="margin:0 0 8px">' + esc(p.orador) + ' · ' + D.brFull(D.parse(p.data)) + '</div>' + (p.esboco ? '' : '<div class="alertbox">O esboço ainda não foi definido: a mensagem sairá com “(tema a definir)”.</div>') + (!envio && p.pedido ? '<div class="alertbox okb">Pedido anterior enviado em ' + D.brFull(D.parse(p.pedido)) + '.</div>' : '') + '<div class="field"><label>WhatsApp do orador</label><input id="m_fone" inputmode="tel" placeholder="(98) 99999-0000" value="' + esc(o ? o.fone || '' : '') + '"><div class="sub">Sem telefone, o WhatsApp abre para você escolher o contato.</div></div><div class="field"><label>Mensagem (pode editar antes de enviar)</label><textarea id="m_txt" style="font-family:inherit;font-size:14px;min-height:280px">' + esc(text) + '</textarea></div><button class="btn primary block" data-act="sendMsg">Enviar pelo WhatsApp</button><div class="row"><button class="btn" data-act="copyMsg">Copiar</button>' + (envio || norm(p.confirmado).toUpperCase() === 'SIM' ? '' : '<button class="btn" data-act="confMsg">Já confirmou</button>') + '</div><button class="btn block" data-act="closeSheet" style="margin-top:8px">Cancelar</button>');
}
function msgPrepare() {
  const p = st.prog.find(x => x.id === ui.form.id), o = st.oradores.find(x => key(x.nome) === key(p.orador)), fone = norm($('#m_fone').value);
  if (o && fone !== (o.fone || '')) o.fone = fone; if (p.tipo !== 'envio') p.pedido = D.iso(D.today()); save(); return { envio: p.tipo === 'envio', fone, text: $('#m_txt').value };
}
function openHist(t, v) { if (ui.route === 'hist') ui.hstack.push({ ...ui.hist }); else { ui.hstack = []; ui.hfrom = ui.route; } ui.hist = { tipo: t, id: v, modalidade: ui.route === 'relatorios' ? ui.rel.tipo : 'todos' }; closeSheet(); ui.route = 'hist'; render(true); }

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
  verEnvios: () => { ui.prog.tipo = 'envio'; go('prog'); },
  verLocais: () => { ui.prog.tipo = 'local'; go('prog'); },
  compEnvios: () => { ui.comp.tipo = 'envio'; ui.comp.orador = ''; go('compartilhar'); },
  pickContactFile: () => $('#fileContact').click(), pickContact, enviarOrador: el => openProg({tipo:'envio', orador:el.dataset.v, destino:''}), newEnvio: () => openProg({tipo:'envio', destino:''}), closeSheet, newProg: () => openProg(), editProg: el => openProg({}, el.dataset.id), saveProg: () => saveProg(false), saveMsg: () => saveProg(true),
  hist: el => openHist(el.dataset.t, el.dataset.v),
  editFromHist: () => { const h = ui.hist; if (h.tipo === 'o') { const i = st.oradores.findIndex(o => key(o.nome) === key(h.id)); if (i >= 0) openOrad(i); } else if (h.tipo === 'c') openCong(h.id); else openEsb(Number(h.id)); },
  msg: el => openMsg(el.dataset.id),
  sendMsg: () => { const m = msgPrepare(); window.open('https://wa.me/' + C.foneWa(m.fone) + '?text=' + encodeURIComponent(m.text), '_blank'); closeSheet(); render(); toast(m.envio ? 'Informe aberto no WhatsApp.' : 'Pedido marcado como enviado.'); },
  copyMsg: () => { const m = msgPrepare(); (navigator.clipboard ? navigator.clipboard.writeText(m.text) : Promise.reject()).then(() => toast(m.envio ? 'Informe copiado.' : 'Mensagem copiada e pedido marcado.'), () => { $('#m_txt').select(); document.execCommand('copy'); toast(m.envio ? 'Informe copiado.' : 'Mensagem copiada e pedido marcado.'); }); },
  confMsg: () => { const p = st.prog.find(x => x.id === ui.form.id); if (p && p.tipo !== 'envio') { p.confirmado = 'SIM'; save(); closeSheet(); render(); toast('Confirmado.'); } },
  modeloPadrao: () => { st.config.modelo = ''; save(); render(); toast('Modelo restaurado.'); },
  delProg: () => { if (confirm('Excluir este discurso?')) { st.prog = st.prog.filter(p => p.id !== ui.form.id); save(); closeSheet(); render(); toast('Discurso excluído.'); } },
  pf: el => { ui.prog.filtro = el.dataset.v; render(true); },
  confirmar: el => { const p = st.prog.find(x => x.id === el.dataset.id); if (p && p.tipo !== 'envio') { p.confirmado = 'SIM'; save(); render(); toast('Confirmado.'); } },
  pickO: el => { const d = ui.esc.draft; d.orador = key(d.orador) === key(el.dataset.v) ? '' : el.dataset.v; render(); },
  pickE: el => { const d = ui.esc.draft, n = Number(el.dataset.v); d.esboco = d.esboco === n ? null : n; render(); },
  pickC: el => { ui.esc.cong = el.dataset.v; render(true); },
  moreO: () => { ui.esc.no += 10; render(); }, moreE: () => { ui.esc.ne += 10; render(); },
  clearDraft: () => { ui.esc.draft = {}; render(); },
  launch: () => { const d = ui.esc.draft; openProg({ data: ui.esc.data, orador: d.orador || '', esboco: d.esboco == null ? '' : d.esboco }); },
  escalarEm: el => { ui.esc.data = el.dataset.v; ui.esc.draft = {}; go('escalar'); },
  zap: () => window.open('https://wa.me/?text=' + encodeURIComponent($('#cmpTxt').value), '_blank'),
  copiar: () => { const t = $('#cmpTxt'); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(() => toast('Texto copiado.'), () => { document.execCommand('copy'); toast('Texto copiado.'); }); },
  partilhar: () => { const t = $('#cmpTxt').value; if (navigator.share) navigator.share({ text: t }).catch(() => {}); else A.copiar(); },
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
  delOrad: () => { const o = st.oradores[ui.form.i], n = st.prog.filter(p => key(p.orador) === key(o.nome)).length; if (confirm('Excluir ' + o.nome + '?' + (n ? '\nOs ' + n + ' discursos dele continuam na programação.' : ''))) { st.prog.forEach(p => { if (key(p.orador) === key(o.nome) && !norm(p.origem)) p.origem = o.cong; }); st.oradores.splice(ui.form.i, 1); save(); closeSheet(); render(); } },
  newCong: () => openCong(null), editCong: el => openCong(el.dataset.v),
  saveCong: () => {
    const nome = norm($('#c_nome').value), hora = norm($('#c_hora').value), old = ui.form.name; if (!nome) return toast('Digite o nome.');
    if (C.allCongs(st).some(c => key(c) === key(nome) && key(c) !== key(old))) return toast('Essa congregação já existe.');
    if (old == null) { if (C.allCongs(st).some(c => key(c) === key(nome))) return toast('Essa congregação já existe.'); st.congregacoes.push(nome); }
    else { if (key(st.config.local) === key(old)) st.config.local = nome; st.prog.forEach(p => { if (key(p.origem) === key(old)) p.origem = nome; if (key(p.destino) === key(old)) p.destino = nome; }); st.oradores.forEach(o => { if (key(o.cong) === key(old)) o.cong = nome; }); st.congregacoes = st.congregacoes.map(c => key(c) === key(old) ? nome : c); delete st.horarios[key(old)]; }
    if (hora) st.horarios[key(nome)] = hora; else delete st.horarios[key(nome)];
    save(); closeSheet(); render(); toast('Congregação salva.');
  },
  delCong: () => { const old = ui.form.name; if (key(st.config.local) === key(old) || C.rows(st).some(r => C.participa(r, old))) return toast('Esta congregação está vinculada à configuração ou ao histórico.'); if (st.oradores.some(o => key(o.cong) === key(old))) return toast('Há oradores nessa congregação. Mude-os antes.'); if (confirm('Excluir ' + old + '?')) { st.congregacoes = st.congregacoes.filter(c => key(c) !== key(old)); delete st.horarios[key(old)]; save(); closeSheet(); render(); } },
  newEsb: () => openEsb(null), editEsb: el => openEsb(Number(el.dataset.v)),
  saveEsb: () => {
    const n = C.num($('#e_n').value), tema = norm($('#e_tema').value), old = ui.form.n; if (!Number.isInteger(n) || n <= 0 || !tema) return toast('Informe o número e o tema.');
    if (st.esbocos.some(e => e.n === n && e.n !== old)) return toast('Esse número já existe.');
    if (old == null) st.esbocos.push({ n, tema }); else { const e = st.esbocos.find(x => x.n === old); if (n !== old) st.prog.forEach(p => { if (Number(p.esboco) === old) p.esboco = n; }); e.n = n; e.tema = tema; }
    st.esbocos.sort((a, b) => a.n - b.n); save(); closeSheet(); render(); toast('Esboço salvo.');
  },
  delEsb: () => { const n = ui.form.n; if (confirm('Excluir o esboço ' + n + '?')) { st.esbocos = st.esbocos.filter(e => e.n !== n); save(); closeSheet(); render(); } },
  pickFile: () => $('#fileX').click(), pickJson: () => $('#fileJ').click(),
  expX: () => ensureXLSX().then(() => { download(new Blob([C.exportWorkbook(XLSX, st)], { type: XMIME }), 'Lista_de_Oradores_' + D.iso(D.today()) + '.xlsx'); toast('Planilha exportada.'); }).catch(e => toast(e.message)),
  shareX: () => ensureXLSX().then(() => { const name = 'Lista_de_Oradores_' + D.iso(D.today()) + '.xlsx', f = new File([C.exportWorkbook(XLSX, st)], name, { type: XMIME }); if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: 'Lista de Oradores' }); download(f, name); toast('Planilha salva no aparelho.'); }).catch(e => { if (e.name !== 'AbortError') toast(e.message); }),
  expJ: () => { download(new Blob([JSON.stringify(st)], { type: 'application/json' }), 'Lista_de_Oradores_backup_' + D.iso(D.today()) + '.json'); toast('Backup salvo.'); },
  wipe: () => { if (confirm('Apagar TODOS os dados deste aparelho? Isso não pode ser desfeito.')) { st = C.emptyState(); save(); render(); toast('Dados apagados.'); } },
  mesclar: () => applyImport(ui.imp, 'merge'), substituir: () => applyImport(ui.imp, 'replace'),
  instalar: () => { const e = window.__installEv; if (e) { e.prompt(); window.__installEv = null; } }
};
const CH = {
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
const INP = { formChg, rodQ: el => { ui.rod.q = el.value; ui.rod.n = 30; render(); const i = $('input[data-inp="rodQ"]'); if (i) { i.focus(); i.setSelectionRange(99, 99); } }, cadQ: el => { ui.cad.q = el.value; render(); const i = $('input[data-inp="cadQ"]'); if (i) { i.focus(); i.setSelectionRange(99, 99); } } };
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
