# Arranjos e agenda do celular

## Como usar

1. Em **Mais → Configurações**, informe o nome da congregação local.
2. Em **Cadastros**, vincule os oradores locais a essa congregação. Não é necessário duplicar o cadastro para discursos fora.
3. Em **Mais → Arranjos**, escolha **Agendar envio**, inclusive pelo botão ao lado de um orador local, e informe a congregação de destino.
4. Para receber um visitante ou escalar um orador local em casa, use **Agendar discurso local**.
5. Consulte o histórico tocando no orador ou na congregação. A programação também tem filtros para locais, envios ou todos.

Um recebimento e um envio são agendamentos independentes. Podem ter datas diferentes e não precisam ser criados juntos. Os totais por congregação mostram os dois sentidos, incluindo agendamentos anteriores e futuros; não representam uma obrigação automática de reciprocidade. Discursos locais de oradores locais não entram nos totais de troca com outras congregações.

## Levantamento e modelo implementado

Antes, a congregação do cadastro do orador representava toda a relação do discurso. Isso não identificava o local do evento e não permitia distinguir envio e recebimento.

Agora `config.local` identifica a congregação administrada pelo aparelho. Um orador é local quando sua congregação cadastral coincide com essa configuração. Cada registro de `prog` guarda:

| Campo | Significado |
| --- | --- |
| `tipo` | `local` para discursos na congregação local; `envio` para discursos fora |
| `origem` | Congregação do orador na ocasião do agendamento |
| `destino` | Congregação onde acontecerá o discurso |

As datas, horários, esboços, confirmações e pedidos continuam no próprio registro. A origem fica preservada ao transferir ou excluir um orador. Renomear uma congregação corrige suas referências, inclusive históricas. A edição de um envio antigo preserva a origem registrada mesmo que o orador tenha sido transferido.

O histórico do orador reúne seus discursos em casa e fora. O histórico da congregação reúne os eventos em que ela participa como origem ou destino, contando o evento uma vez. Rodízio e relatórios de congregações consideram ambas as participações. A tela Arranjos separa os totais enviados e recebidos de cada parceira.

Envios não ocupam datas livres locais nem entram no próximo discurso e totais locais da tela inicial. Pendências, confirmações e compartilhamento incluem ambas as modalidades, identificando o destino. O horário e a mensagem de confirmação usam a congregação de destino. O alerta de repetição de esboço considera o mesmo destino; o alerta de repetição do orador mantém o intervalo configurado. O mesmo orador não pode ser agendado duas vezes no mesmo dia, mesmo com intervalo zero — regra conservadora que também bloqueia horários diferentes.

**Quem escalar** continua voltado à programação local: considera os compromissos externos no mesmo dia para disponibilidade e o uso local dos esboços. Para enviar oradores, use Arranjos.

## Compatibilidade dos dados

Backups antigos permanecem aceitos. Registros antigos são interpretados como discursos locais; a primeira definição da congregação local preenche origem e destino dos registros existentes. Antes de definir essa configuração, a origem dos registros antigos ainda depende do cadastro atual. Faça um backup antes da configuração inicial.

O Excel exportado contém as colunas `TIPO`, `ORIGEM`, `DESTINO` nas abas dos anos e a aba `CONFIGURAÇÕES` com a congregação local. A importação preserva esses campos. Planilhas antigas continuam aceitas como programação local. Não se mesclam planilhas identificadas com outra congregação local, pois isso inverteria o sentido de envios e recebimentos. O backup JSON preserva a configuração completa.

## Telefone da agenda

No cadastro do orador, **Escolher telefone da agenda** aparece quando o navegador disponibiliza `navigator.contacts.select` em contexto seguro. O botão pede apenas telefones de um contato escolhido pelo usuário. Se houver vários números, o aplicativo permite selecionar um deles. Cancelar não altera o cadastro. O telefone só é persistido ao salvar o orador.

A Contact Picker API tem disponibilidade limitada; a documentação do Chrome descreve seu uso no Android, com HTTPS, página principal e interação explícita. Quando indisponível, o campo manual permanece e a interface explica que se deve digitar ou colar o número. Não há acesso automático à agenda inteira.

Referências: [Chrome](https://developer.chrome.com/docs/capabilities/web-apis/contact-picker), [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API).

## Validação e publicação

Execute `node build.js` e `node review.test.cjs`. Os testes cobrem regras de arranjos, histórico, datas livres locais, conflitos, horários, migração, ida e volta pelo Excel e fluxos de cadastro/agenda com DOM e API simulados. O seletor nativo ainda precisa de validação em um celular compatível, após publicar por HTTPS.

Os arquivos foram preparados localmente. Para disponibilizar a atualização, publique os arquivos regenerados no GitHub Pages, incluindo `index.html`, `sw.js`, `manifest.json`, biblioteca XLSX e ícones.
