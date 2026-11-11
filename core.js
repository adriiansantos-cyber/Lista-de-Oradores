/* Lista de Oradores — lógica (sem interface). Datas internas = número de dias desde 1970-01-01 (UTC). */
(function (root) {
  const p2 = n => String(n).padStart(2, '0');
  const D = {
    parse(s) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return NaN;
      const [y, m, d] = s.split('-').map(Number), t = new Date(0);
      t.setUTCFullYear(y, m - 1, d);
      return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d ? t.getTime() / 86400000 : NaN;
    },
    iso(n) { const t = new Date(n * 86400000); return t.getUTCFullYear() + '-' + p2(t.getUTCMonth() + 1) + '-' + p2(t.getUTCDate()); },
    today() { const t = new Date(); return Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) / 86400000; },
    dow(n) { return new Date(n * 86400000).getUTCDay(); },
    year(n) { return new Date(n * 86400000).getUTCFullYear(); },
    br(n) { const t = new Date(n * 86400000); return p2(t.getUTCDate()) + '/' + p2(t.getUTCMonth() + 1); },
    brFull(n) { const t = new Date(n * 86400000); return p2(t.getUTCDate()) + '/' + p2(t.getUTCMonth() + 1) + '/' + t.getUTCFullYear(); },
    dow3(n) { return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][D.dow(n)]; },
    dowFull(n) { return ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][D.dow(n)]; },
    fromSerial(s) { return Math.floor(s) - 25569; }
  };
  const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const key = s => norm(s).toLowerCase();
  const num = v => { const n = Number(String(v).replace(',', '.')); return isFinite(n) && String(v).trim() !== '' ? n : null; };
  let _id = 0; const newId = () => 'p' + Date.now().toString(36) + (++_id).toString(36) + Math.random().toString(36).slice(2, 5);

  function emptyState() {
    return { v: 1, config: { intervalo: 90, diaSemana: 0, diasPendencias: 30, horaPadrao: '17h', modelo: '' }, oradores: [], congregacoes: [], horarios: {}, esbocos: [], prog: [] };
  }
  function restoreState(s) {
    if (!s || s.v !== 1 || !['prog', 'oradores', 'esbocos'].every(k => Array.isArray(s[k]))) throw new Error('estrutura de backup inválida');
    const validString = value => typeof value === 'string';
    if (!s.oradores.every(o => o && validString(o.nome) && norm(o.nome) && validString(o.cong)) ||
        !s.esbocos.every(e => e && Number.isInteger(e.n) && e.n > 0 && validString(e.tema)) ||
        !s.prog.every(p => p && validString(p.orador) && Number.isFinite(D.parse(p.data)) && (p.esboco == null || p.esboco === '' || (Number.isInteger(p.esboco) && p.esboco > 0)))) throw new Error('registros inválidos no backup');
    const out = JSON.parse(JSON.stringify(s)), defaults = emptyState();
    out.config = Object.assign(defaults.config, out.config);
    for (const k of ['intervalo', 'diasPendencias', 'diaSemana']) {
      if (!Number.isInteger(out.config[k]) || out.config[k] < (k === 'diasPendencias' ? 1 : 0) || (k === 'diaSemana' && out.config[k] > 6)) throw new Error('configurações inválidas');
    }
    out.congregacoes = out.congregacoes || [];
    if (!Array.isArray(out.congregacoes) || !out.congregacoes.every(validString)) throw new Error('congregações inválidas');
    out.horarios = out.horarios || {};
    if (typeof out.horarios !== 'object' || Array.isArray(out.horarios)) throw new Error('horários inválidos');
    const ids = new Set();
    out.prog.forEach(p => { if (typeof p.id !== 'string' || !p.id || ids.has(p.id)) p.id = newId(); ids.add(p.id); });
    return out;
  }
  function congDe(st, nome) { const o = st.oradores.find(o => key(o.nome) === key(nome)); return o ? o.cong : ''; }
  function temaDe(st, n) { const e = st.esbocos.find(e => e.n === Number(n)); return e ? norm(e.tema) : ''; }
  function allCongs(st) {
    const set = new Map();
    st.oradores.forEach(o => { if (norm(o.cong)) set.set(key(o.cong), norm(o.cong)); });
    st.congregacoes.forEach(c => { if (norm(c)) set.set(key(c), norm(c)); });
    return [...set.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }
  // linhas da programação com data numérica e congregação atual
  function rows(st) {
    return st.prog.filter(p => p.data).map(p => ({ ...p, d: D.parse(p.data), cong: congDe(st, p.orador) }));
  }
  /* ---------- alerta de repetição ---------- */
  function alerta(st, row) {
    const N = Number(st.config.intervalo) || 0, d = D.parse(row.data);
    const others = st.prog.filter(p => p.id !== row.id && p.data);
    const pick = fn => others.find(fn) || null;
    const orador = norm(row.orador) ? pick(p => key(p.orador) === key(row.orador) && Math.abs(D.parse(p.data) - d) < N) : null;
    const esboco = row.esboco ? pick(p => Number(p.esboco) === Number(row.esboco) && Math.abs(D.parse(p.data) - d) < N) : null;
    return { orador, esboco, any: !!(orador || esboco) };
  }
  /* ---------- histórico: último (<= ref) e próximo (> ref) ---------- */
  function lastNext(list, ref) {
    let last = null, next = null;
    for (const r of list) {
      if (r.d <= ref) { if (!last || r.d > last.d) last = r; }
      else if (!next || r.d < next.d) next = r;
    }
    return { last, next };
  }
  const sortNever = (a, b) => (a.lastD == null ? -1e12 : a.lastD) - (b.lastD == null ? -1e12 : b.lastD);
  /* ---------- Escalar ---------- */
  function escalar(st, dateISO, N, congFilter) {
    const d = D.parse(dateISO), R = rows(st); N = Number(N);
    const oradores = [];
    st.oradores.forEach((o, idx) => {
      if (congFilter && key(o.cong) !== key(congFilter)) return;
      const mine = R.filter(r => key(r.orador) === key(o.nome));
      const busy = mine.find(r => Math.abs(r.d - d) < N);
      const { last, next } = lastNext(mine, d);
      oradores.push({ nome: o.nome, cong: o.cong, livre: !busy, conflito: busy || null, lastD: last ? last.d : null, dias: last ? d - last.d : null, lastEsb: last ? last.esboco : null, next: next ? next.d : null, idx });
    });
    const disponiveis = oradores.filter(o => o.livre).sort(sortNever);
    const congs = allCongs(st).map((c, idx) => {
      const mine = R.filter(r => key(r.cong) === key(c));
      const { last, next } = lastNext(mine, d);
      return { nome: c, lastD: last ? last.d : null, dias: last ? d - last.d : null, lastOrador: last ? last.orador : null, next: next ? next.d : null, nextOrador: next ? next.orador : null, idx };
    }).sort(sortNever);
    const esbocos = st.esbocos.map((e, idx) => {
      const mine = R.filter(r => Number(r.esboco) === e.n);
      const busy = mine.find(r => Math.abs(r.d - d) < N);
      const { last, next } = lastNext(mine, d);
      return { n: e.n, tema: norm(e.tema), livre: !busy, lastD: last ? last.d : null, dias: last ? d - last.d : null, lastOrador: last ? last.orador : null, next: next ? next.d : null, nextOrador: next ? next.orador : null, idx };
    });
    const esbDisp = esbocos.filter(e => e.livre).sort(sortNever);
    return { disponiveis, total: oradores.length, congs, esbDisp, esbLivres: esbDisp.length };
  }
  /* ---------- Rodízio (referência = hoje) ---------- */
  function rodizio(st, ref) {
    const R = rows(st);
    const oradores = st.oradores.map((o, idx) => {
      const mine = R.filter(r => key(r.orador) === key(o.nome)); const { last, next } = lastNext(mine, ref);
      return { nome: o.nome, cong: o.cong, lastD: last ? last.d : null, dias: last ? ref - last.d : null, lastEsb: last ? last.esboco : null, next: next ? next.d : null, nextEsb: next ? next.esboco : null, idx };
    }).sort(sortNever);
    const congs = allCongs(st).map((c, idx) => {
      const mine = R.filter(r => key(r.cong) === key(c)); const { last, next } = lastNext(mine, ref);
      return { nome: c, lastD: last ? last.d : null, dias: last ? ref - last.d : null, lastOrador: last ? last.orador : null, next: next ? next.d : null, nextOrador: next ? next.orador : null, idx };
    }).sort(sortNever);
    const esbocos = st.esbocos.map((e, idx) => {
      const mine = R.filter(r => Number(r.esboco) === e.n); const { last, next } = lastNext(mine, ref);
      return { n: e.n, tema: norm(e.tema), lastD: last ? last.d : null, dias: last ? ref - last.d : null, lastOrador: last ? last.orador : null, next: next ? next.d : null, nextOrador: next ? next.orador : null, idx };
    }).sort(sortNever);
    return { oradores, congs, esbocos };
  }
  /* ---------- Pendências ---------- */
  function faltas(p) {
    const f = [];
    if (!norm(p.orador)) f.push('orador');
    if (norm(p.confirmado).toUpperCase() !== 'SIM') f.push('confirmação');
    if (p.cantico === '' || p.cantico == null) f.push('cântico');
    if (!norm(p.imagens)) f.push('imagens');
    return f;
  }
  function pendencias(st, today, dias) {
    const R = rows(st).filter(r => r.d >= today && r.d <= today + Number(dias)).sort((a, b) => a.d - b.d);
    const lista = R.map(r => ({ ...r, faltas: faltas(r), faltam: r.d - today })).filter(r => r.faltas.length);
    const count = k => lista.filter(r => r.faltas.includes(k)).length;
    return { total: R.length, lista, semConfirmacao: count('confirmação'), semCantico: count('cântico'), semImagens: count('imagens'), semOrador: count('orador') };
  }
  /* ---------- Datas livres ---------- */
  function datasLivres(st, iniISO, fimISO, dow) {
    const ini = D.parse(iniISO), fim = D.parse(fimISO), R = rows(st), out = [];
    if (!(fim >= ini)) return out;
    let d = ini + ((Number(dow) - D.dow(ini) + 7) % 7);
    for (; d <= fim; d += 7) {
      const doDia = R.filter(r => r.d === d);
      if (!doDia.length) out.push({ d, situacao: 'Data não lançada' });
      else if (!doDia.some(r => norm(r.orador))) out.push({ d, situacao: 'Lançada, sem orador', id: doDia[0].id });
    }
    return out;
  }
  /* ---------- Compartilhar ---------- */
  function compartilhar(st, iniISO, fimISO) {
    const ini = D.parse(iniISO), fim = D.parse(fimISO);
    const R = rows(st).filter(r => r.d >= ini && r.d <= fim).sort((a, b) => a.d - b.d);
    const head = '*Programação de discursos (' + D.br(ini) + ' a ' + D.br(fim) + ')*';
    if (!R.length) return head + '\nNenhum discurso no período';
    const lines = R.map(r => {
      const orad = norm(r.orador) ? norm(r.orador) + (r.cong ? ' (' + r.cong + ')' : '') : 'orador a definir';
      const tema = r.esboco ? ' - Nº ' + r.esboco + ': ' + temaDe(st, r.esboco) : ' - tema a definir';
      return D.br(r.d) + ' (' + D.dow3(r.d) + ') - ' + orad + tema;
    });
    return head + '\n' + lines.join('\n');
  }
  /* ---------- Relatórios ---------- */
  function ranking(items) {
    items.sort((a, b) => b.count - a.count || String(a.nome != null ? a.nome : a.n).localeCompare(String(b.nome != null ? b.nome : b.n), 'pt-BR', { numeric: true }));
    let pos = 0; items.forEach((it, i) => { if (i === 0 || it.count !== items[i - 1].count) pos = i + 1; it.pos = pos; });
    return items;
  }
  function relatorios(st, iniISO, fimISO) {
    const lo = iniISO ? D.parse(iniISO) : -1e9, hi = fimISO ? D.parse(fimISO) : 1e9;
    const R = rows(st).filter(r => r.d >= lo && r.d <= hi);
    const oradores = ranking(st.oradores.map(o => ({ nome: o.nome, cong: o.cong, count: R.filter(r => key(r.orador) === key(o.nome)).length })));
    const congs = ranking(allCongs(st).map(c => ({ nome: c, count: R.filter(r => key(r.cong) === key(c)).length })));
    const esbocos = ranking(st.esbocos.map(e => ({ n: e.n, tema: norm(e.tema), count: R.filter(r => Number(r.esboco) === e.n).length })));
    return { total: R.length, oradores, congs, esbocos };
  }
  /* ---------- Indicadores da tela inicial ---------- */
  function indicadores(st, today) {
    const R = rows(st);
    const futuros = R.filter(r => r.d >= today).sort((a, b) => a.d - b.d);
    const prox = futuros[0] || null;
    const ano = D.year(today);
    const pend = pendencias(st, today, st.config.diasPendencias || 30);
    const livres = datasLivres(st, D.iso(today), D.iso(today + 55), st.config.diaSemana).length;
    const confirmados = R.filter(r => norm(r.confirmado).toUpperCase() === 'SIM').length;
    return { prox, discursosAno: R.filter(r => D.year(r.d) === ano).length, pendencias: pend.lista.length, livres8: livres, oradores: st.oradores.length, total: R.length, confirmados };
  }

  /* ---------- Histórico por orador, congregação ou esboço ---------- */
  function historico(st, tipo, id, today) {
    const R = rows(st).sort((a, b) => a.d - b.d);
    const L = tipo === 'o' ? R.filter(r => key(r.orador) === key(id)) : tipo === 'c' ? R.filter(r => key(r.cong) === key(id)) : R.filter(r => Number(r.esboco) === Number(id));
    const dec = r => ({ id: r.id, d: r.d, data: r.data, orador: r.orador, cong: r.cong, esboco: r.esboco, tema: r.esboco ? temaDe(st, r.esboco) : '', confirmado: r.confirmado, pedido: r.pedido || '' });
    const past = L.filter(r => r.d < today).map(dec).reverse(), future = L.filter(r => r.d >= today).map(dec);
    return { past, future, total: L.length, last: past[0] || null, next: future[0] || null };
  }
  /* ---------- Mensagem de confirmação ---------- */
  const MODELO_PADRAO = 'Olá, {nome}!\n\nO irmão foi convidado para proferir o discurso: {tema}\nna congregação: {congregacao}\nno dia {data}\nàs {hora}.\n\nConfirme por gentileza se poderá comparecer.\nEm caso positivo, já pode nos informar também o número do cântico e as mídias que serão executadas durante o discurso.\n\nDe já agradecemos! Até Breve!';
  function horaDe(st, p) { return norm(p.hora) || norm((st.horarios || {})[key(congDe(st, p.orador))]) || norm(st.config.horaPadrao); }
  function mensagemConfirmacao(st, p) {
    if (!norm(p.orador) || !p.data) return null;
    const hora = horaDe(st, p), modelo = norm(st.config.modelo) ? st.config.modelo : MODELO_PADRAO;
    let t = modelo; if (!hora) t = t.split('\n').filter(l => !l.includes('{hora}')).join('\n');
    const map = { nome: norm(p.orador), tema: (p.esboco ? temaDe(st, p.esboco) : '') || '(tema a definir)', congregacao: congDe(st, p.orador) || '(congregação a definir)', data: D.brFull(D.parse(p.data)), hora };
    return t.replace(/\{(\w+)\}/g, (m, k) => k in map ? map[k] : m);
  }
  function foneWa(f) {
    const d = String(f == null ? '' : f).replace(/\D/g, ''); if (!d) return '';
    if (d.startsWith('55') && d.length >= 12) return d;
    return d.length === 10 || d.length === 11 ? '55' + d : d;
  }
  function confirmacoes(st, today, dias) {
    return rows(st).filter(r => r.d >= today && r.d <= today + Number(dias) && norm(r.orador) && norm(r.confirmado).toUpperCase() !== 'SIM').sort((a, b) => a.d - b.d)
      .map(r => ({ ...r, status: r.pedido ? 'aguardando' : 'novo', diasPedido: r.pedido ? today - D.parse(r.pedido) : null, fone: ((st.oradores.find(o => key(o.nome) === key(r.orador)) || {}).fone) || '' }));
  }
  /* ---------- Importação / exportação (SheetJS) ---------- */
  function sheetRows(XLSX, ws) { return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' }); }
  function toDay(v) {
    if (v instanceof Date) return Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) / 86400000;
    if (typeof v === 'number' && v > 20000 && v < 80000) return D.fromSerial(v);
    if (typeof v === 'string') { const m = v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); const d = D.parse(m ? m[3] + '-' + p2(m[2]) + '-' + p2(m[1]) : v.trim()); if (Number.isFinite(d)) return d; }
    return null;
  }
  function findHeader(rs, test) {
    for (let r = 0; r < Math.min(rs.length, 30); r++) { const names = rs[r].map(x => norm(x).toUpperCase()); if (test(names)) return { r, names }; }
    return null;
  }
  function importWorkbook(XLSX, buf) {
    const wb = XLSX.read(buf, { type: 'array' });
    const res = { oradores: [], congregacoes: [], horarios: {}, esbocos: [], prog: [], avisos: [], abas: [] };
    const strip = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
    for (const name of wb.SheetNames) {
      const rs = sheetRows(XLSX, wb.Sheets[name]); const sn = strip(name);
      if (/^\d{4}$/.test(sn)) {
        const h = findHeader(rs, n => n.includes('DATA') && n.includes('ORADOR')); if (!h) { res.avisos.push('Aba ' + name + ': cabeçalho não encontrado.'); continue; }
        const col = pred => h.names.findIndex(pred);
        const cD = col(n => n === 'DATA'), cO = col(n => n === 'ORADOR'), cE = col(n => /^N[º°O]?( ESB.*)?$|^N[ÚU]MERO|^ESBO[ÇC]O$/.test(strip(n))), cC = col(n => strip(n).startsWith('CANTICO')), cI = col(n => n === 'IMAGENS'), cF = col(n => n === 'CONFIRMADO'), cH = col(n => strip(n) === 'HORARIO'), cP = col(n => n === 'PEDIDO');
        let k = 0;
        for (let r = h.r + 1; r < rs.length; r++) {
          const row = rs[r], d = toDay(row[cD]); if (d == null) continue;
          const ev = cE >= 0 ? num(row[cE]) : null, cv = cC >= 0 ? row[cC] : '';
          res.prog.push({ id: newId(), data: D.iso(d), orador: norm(row[cO]), esboco: ev, cantico: cv === '' ? '' : (num(cv) != null ? num(cv) : norm(cv)), imagens: cI >= 0 ? norm(row[cI]).toUpperCase() : '', confirmado: cF >= 0 ? norm(row[cF]).toUpperCase() : '', hora: cH >= 0 ? norm(row[cH]) : '', pedido: cP >= 0 && toDay(row[cP]) != null ? D.iso(toDay(row[cP])) : '' }); k++;
        }
        res.abas.push(name + ': ' + k + ' discursos');
      } else if (sn === 'CADASTROS' || sn === 'CADASTRO') {
        const h = findHeader(rs, n => n.includes('ORADOR') && n.some(x => x.startsWith('CONGREGA'))); if (!h) { res.avisos.push('Aba ' + name + ': cabeçalho não encontrado.'); continue; }
        const cO = h.names.findIndex(n => n === 'ORADOR'), cG = h.names.findIndex(n => strip(n) === 'CONGREGACAO'), cL = h.names.findIndex(n => strip(n) === 'CONGREGACOES'), cT = h.names.findIndex(n => ['TELEFONE', 'CELULAR', 'WHATSAPP', 'FONE'].includes(strip(n))), cHr = h.names.findIndex(n => strip(n) === 'HORARIO');
        for (let r = h.r + 1; r < rs.length; r++) {
          const nome = norm(rs[r][cO]); if (nome) res.oradores.push({ nome, cong: cG >= 0 ? norm(rs[r][cG]) : '', fone: cT >= 0 ? norm(rs[r][cT]) : '' });
          if (cL >= 0 && norm(rs[r][cL])) { res.congregacoes.push(norm(rs[r][cL])); if (cHr >= 0 && norm(rs[r][cHr])) res.horarios[key(rs[r][cL])] = norm(rs[r][cHr]); }
        }
        res.abas.push(name + ': ' + res.oradores.length + ' oradores');
      } else if (sn === 'ESBOCOS') {
        const h = findHeader(rs, n => n.includes('TEMA') && n.some(x => /^N[º°O]?$/.test(x))); if (!h) { res.avisos.push('Aba ' + name + ': cabeçalho não encontrado.'); continue; }
        const cN = h.names.findIndex(x => /^N[º°O]?$/.test(x)), cT = h.names.findIndex(x => x === 'TEMA');
        for (let r = h.r + 1; r < rs.length; r++) { const n = num(rs[r][cN]); if (n != null && norm(rs[r][cT])) res.esbocos.push({ n, tema: norm(rs[r][cT]) }); }
        res.abas.push(name + ': ' + res.esbocos.length + ' esboços');
      }
    }
    if (!res.prog.length && !res.oradores.length && !res.esbocos.length) res.avisos.push('Não encontrei abas conhecidas (anos como 2026, CADASTROS, ESBOÇOS).');
    if (!res.oradores.length && res.prog.length) { const s = new Set(); res.prog.forEach(p => { if (p.orador && !s.has(key(p.orador))) { s.add(key(p.orador)); res.oradores.push({ nome: p.orador, cong: '' }); } }); res.avisos.push('Sem aba CADASTROS: criei a lista de oradores a partir da programação (sem congregação).'); }
    return res;
  }
  function exportWorkbook(XLSX, st) {
    const wb = XLSX.utils.book_new();
    const years = [...new Set(st.prog.filter(p => p.data).map(p => D.year(D.parse(p.data))))].sort();
    if (!years.length) years.push(D.year(D.today()));
    for (const y of years) {
      const list = st.prog.filter(p => p.data && D.year(D.parse(p.data)) === y).sort((a, b) => a.data.localeCompare(b.data));
      const aoa = [['DATA', 'ORADOR', 'CONGREGAÇÃO', 'Nº', 'TEMA', 'CÂNTICO', 'IMAGENS', 'CONFIRMADO', 'HORÁRIO', 'PEDIDO']];
      list.forEach(p => { const d = D.parse(p.data); aoa.push([d + 25569, p.orador, congDe(st, p.orador), p.esboco == null ? '' : p.esboco, p.esboco ? temaDe(st, p.esboco) : '', p.cantico === '' ? '' : p.cantico, p.imagens, p.confirmado, p.hora || '', p.pedido || '']); });
      const ws = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true }); ws['!cols'] = [{ wch: 12 }, { wch: 24 }, { wch: 26 }, { wch: 6 }, { wch: 50 }, { wch: 9 }, { wch: 9 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
      for (let r = 1; r < aoa.length; r++) { const c = ws['A' + (r + 1)]; if (c) { c.t = 'n'; c.z = 'dd/mm/yyyy'; } }
      XLSX.utils.book_append_sheet(wb, ws, String(y));
    }
    const cg = allCongs(st); const n = Math.max(st.oradores.length, cg.length);
    const cad = [['Orador', 'Congregação', 'Telefone', '', 'Congregações', 'Horário']]; for (let i = 0; i < n; i++) cad.push([st.oradores[i] ? st.oradores[i].nome : '', st.oradores[i] ? st.oradores[i].cong : '', st.oradores[i] ? (st.oradores[i].fone || '') : '', '', cg[i] || '', cg[i] ? ((st.horarios || {})[key(cg[i])] || '') : '']);
    const wc = XLSX.utils.aoa_to_sheet(cad); wc['!cols'] = [{ wch: 26 }, { wch: 26 }, { wch: 16 }, { wch: 3 }, { wch: 26 }, { wch: 10 }]; XLSX.utils.book_append_sheet(wb, wc, 'CADASTROS');
    const es = [['Nº', 'TEMA']]; st.esbocos.forEach(e => es.push([e.n, norm(e.tema)]));
    const we = XLSX.utils.aoa_to_sheet(es); we['!cols'] = [{ wch: 6 }, { wch: 70 }]; XLSX.utils.book_append_sheet(wb, we, 'ESBOÇOS');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx', cellDates: true });
  }
  root.Core = { restoreState, MODELO_PADRAO, historico, horaDe, mensagemConfirmacao, foneWa, confirmacoes, D, norm, key, num, newId, emptyState, congDe, temaDe, allCongs, rows, alerta, escalar, rodizio, faltas, pendencias, datasLivres, compartilhar, relatorios, indicadores, importWorkbook, exportWorkbook };
})(typeof window !== 'undefined' ? window : globalThis);
