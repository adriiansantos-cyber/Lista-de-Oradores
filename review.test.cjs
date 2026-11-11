const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
require('./core.js');
const C = globalThis.Core, D = C.D;
assert.ok(Number.isNaN(D.parse('2026-02-30')));
assert.ok(Number.isNaN(D.parse('')));
assert.equal(D.iso(D.parse('2028-02-29')), '2028-02-29');
assert.throws(() => C.restoreState({v:1,prog:[]}));
const state = C.emptyState();
state.oradores.push({nome:'João',cong:'Centro',fone:'85999990000'});
state.esbocos.push({n:1,tema:'Tema de teste'});
state.prog.push({id:'p1',data:'2026-11-15',orador:'João',esboco:1,cantico:10,imagens:'NÃO',confirmado:'SIM',hora:'18h',pedido:'2026-11-11'});
const restored = C.restoreState(state);
assert.notEqual(restored,state);
assert.equal(C.indicadores(C.emptyState(),D.parse('2026-11-15')).livres8,8);
assert.equal(C.alerta(state,{id:'p2',data:'2026-11-22',orador:'João',esboco:1}).any,true);
assert.equal(C.alerta(state,state.prog[0]).any,false);
const XLSX = require('./xlsx.full.min.js');
const imported = C.importWorkbook(XLSX,C.exportWorkbook(XLSX,state));
for (const field of ['data','orador','esboco','cantico','imagens','confirmado','hora','pedido']) assert.equal(imported.prog[0][field],state.prog[0][field],field);
assert.deepEqual(imported.esbocos,state.esbocos);
assert.deepEqual(imported.oradores,state.oradores);
const html = fs.readFileSync('index.html','utf8');
assert.equal((html.match(/Lista de Oradores — interface/g)||[]).length,1);
assert.ok(!html.includes('src="./build.js"'));
for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
assert.ok(!html.includes('/*CORE*/'));
const handlers = {}, deleted = [];
const own = 'lista-oradores:https://example.com/Lista-de-Oradores/:';
const sandbox = {URL, self:{registration:{scope:'https://example.com/Lista-de-Oradores/'},clients:{claim:async()=>{}},addEventListener:(type,fn)=>handlers[type]=fn},caches:{keys:async()=>['other-app',own+'old'],delete:async key=>deleted.push(key)}};
vm.runInNewContext(fs.readFileSync('sw.js','utf8'),sandbox);
(async()=>{let task;handlers.activate({waitUntil:p=>task=p});await task;assert.deepEqual(deleted,[own+'old']);console.log('OK: datas, backups, indicadores, repetição, XLSX, HTML e isolamento de cache.');})();
const nodes = new Map();
const element = () => ({innerHTML:'',textContent:'',style:{},scrollTop:0,classList:{add(){},remove(){},toggle(){}},addEventListener(){}});
const document = {querySelector:s=>{if(!nodes.has(s))nodes.set(s,element());return nodes.get(s);},querySelectorAll:()=>[],addEventListener(){}};
const browser = {Core:C,document,localStorage:{getItem:()=>null},navigator:{},location:{protocol:'file:'},setTimeout:()=>0,clearTimeout(){}};
browser.window = browser; browser.addEventListener=()=>{};
vm.runInNewContext(fs.readFileSync('ui.js','utf8'),browser);
for(const route of ['inicio','prog','escalar','pend','mais','livres','compartilhar','rodizio','relatorios','cadastros','dados','config','ajuda','msgs']) {
  browser.__app.go(route);
  assert.ok(nodes.get('#view').innerHTML.length,route);
}
console.log('OK: inicialização e renderização das 14 telas sem dados.');
Object.assign(browser.__app.st, restored);
for(const route of ['inicio','prog','escalar','pend','msgs','rodizio','relatorios','cadastros']) browser.__app.go(route);
console.log('OK: telas principais com programação cadastrada.');
const arrangements = C.emptyState();
arrangements.config.local = 'Central';
arrangements.oradores = [{nome:'Local',cong:'Central',fone:''},{nome:'Visitante',cong:'Norte',fone:''}];
arrangements.congregacoes = ['Norte','Sul'];
arrangements.esbocos = [{n:1,tema:'Tema'}];
arrangements.horarios = {norte:'19h',central:'17h'};
const base = {cantico:1,imagens:'NÃO',confirmado:'SIM',esboco:1};
arrangements.prog = [
  {...base,id:'a',data:'2026-11-15',orador:'Local',tipo:'envio',origem:'Central',destino:'Norte'},
  {...base,id:'b',data:'2026-11-22',orador:'Visitante',tipo:'local',origem:'Norte',destino:'Central'},
  {...base,id:'c',data:'2026-11-29',orador:'Local',tipo:'local',origem:'Central',destino:'Central'}
];
assert.equal(C.historico(arrangements,'o','Local',D.parse('2026-11-11')).total,2);
assert.equal(C.historico(arrangements,'c','Norte',D.parse('2026-11-11')).total,2);
assert.equal(C.historico(arrangements,'c','Central',D.parse('2026-11-11')).total,3);
assert.equal(C.arranjos(arrangements).find(c=>c.nome==='Norte').enviados,1);
assert.equal(C.arranjos(arrangements).find(c=>c.nome==='Norte').recebidos,1);
assert.equal(C.datasLivres(arrangements,'2026-11-15','2026-11-15',0).length,1);
assert.equal(C.indicadores(arrangements,D.parse('2026-11-11')).prox.id,'b');
assert.equal(C.horaDe(arrangements,arrangements.prog[0]),'19h');
assert.ok(C.mensagemConfirmacao(arrangements,arrangements.prog[0]).includes('Congregação: Norte'));
assert.equal(C.alerta(arrangements,{...base,id:'d',data:'2026-11-15',orador:'Local',tipo:'local',destino:'Central'}).conflito.id,'a');
assert.equal(C.alerta(arrangements,{...base,id:'d',data:'2026-11-16',orador:'Visitante',tipo:'envio',destino:'Sul'}).esboco,null);
assert.ok(!C.escalar(arrangements,'2026-11-15',0).disponiveis.some(o=>o.nome==='Local'));
arrangements.oradores[0].cong='Sul';
assert.equal(C.historico(arrangements,'c','Norte',D.parse('2026-11-11')).future[0].origem,'Central');
const roundtrip = C.importWorkbook(XLSX,C.exportWorkbook(XLSX,arrangements));
assert.equal(roundtrip.config.local,'Central');
for(let i=0;i<3;i++) for(const field of ['data','tipo','origem','destino','orador']) assert.equal(roundtrip.prog[i][field],arrangements.prog[i][field],field);
assert.equal(C.restoreState(arrangements).prog[0].tipo,'envio');
assert.throws(()=>C.restoreState({...arrangements,prog:[{...arrangements.prog[0],destino:''}]}));
assert.equal(C.restoreState(state).prog[0].tipo,undefined); // backups antigos continuam válidos
console.log('OK: envios, recebimentos, local em casa, históricos, conflitos, horários, XLSX e migração.');

// Fluxos da interface com DOM controlado, sem expor ações no app publicado.
const actionListeners = {};
document.addEventListener=(type,fn)=>actionListeners[type]=fn;
browser.localStorage.setItem=()=>{};
browser.confirm=()=>true;
vm.runInNewContext(fs.readFileSync('ui.js','utf8').replace('window.__app = {','window.__test = {A, CH, openOrad}; window.__app = {'),browser);
Object.assign(browser.__app.st,C.restoreState(arrangements));
for(const route of ['arranjos','prog','pend','msgs']) browser.__app.go(route);
browser.__app.ui.hist={tipo:'c',id:'Norte'}; browser.__app.go('hist');
assert.ok(nodes.get('#view').innerHTML.includes('Central → Norte'));
// Simulate actual inputs after opening the form (the fake DOM does not parse HTML).
browser.__app.openProg({tipo:'envio'});
for(const [id,value] of Object.entries({f_data:'2026-12-06',f_orad:'Local',f_tipo:'envio',f_dest:'Norte',f_esb:'1',f_cant:'10',f_img:'NÃO',f_conf:'SIM',f_hora:''})) document.querySelector('#'+id).value=value;
const before=browser.__app.st.prog.length;
browser.__test.A.saveProg();
assert.equal(browser.__app.st.prog.length,before); // orador mudou para Sul, envio bloqueado
browser.__app.st.oradores[0].cong='Central';
browser.__test.A.saveProg();
assert.equal(browser.__app.st.prog.length,before+1);
assert.equal(browser.__app.st.prog.at(-1).destino,'Norte');
assert.equal(browser.__app.st.prog.at(-1).origem,'Central');
browser.__app.openProg({tipo:'envio'});
for(const [id,value] of Object.entries({f_data:'2026-12-06',f_orad:'Local',f_tipo:'envio',f_dest:'Sul',f_esb:'1'})) document.querySelector('#'+id).value=value;
browser.__test.A.saveProg();
assert.equal(browser.__app.st.prog.length,before+1); // mesmo dia, outra congregação
browser.isSecureContext=true;
browser.navigator.contacts={select:async()=>{throw new Error('A agenda não deve ser chamada');}};
browser.__test.openOrad(0);
assert.ok(!nodes.get('#overlay').innerHTML.includes('Escolher telefone da agenda'));
assert.ok(nodes.get('#overlay').innerHTML.includes('Digite ou cole'));
console.log('OK: seleção de contatos suspensa.');
