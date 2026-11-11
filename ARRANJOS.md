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

A tela inicial separa a programação local dos envios, com cards para o próximo discurso local e o próximo envio, totais separados, próximos envios e botões de agendamento, consulta e compartilhamento.

Envios não ocupam datas livres locais nem entram nos totais locais. As pendências de confirmação e a lista de confirmações consideram apenas discursos locais. Envios não geram alertas de repetição de orador ou esboço e também não contam como repetições na programação local. O mesmo orador não pode ser agendado duas vezes no mesmo dia, mesmo com intervalo zero: esse bloqueio trata conflito de agenda, inclusive em horários diferentes.

Ao salvar um envio, o aplicativo abre um **informe da programação**, sem pedido de confirmação, com congregação de destino, data, horário, número do esboço e tema. O usuário pode editar, copiar ou abrir o texto no WhatsApp. Abrir o WhatsApp não comprova a entrega da mensagem, e os informes não criam pedidos de confirmação.

Em **Compartilhar**, selecione a modalidade e o período. Para envios, escolha todos os oradores ou um nome para gerar somente a programação dele. A lista de nomes inclui os registros históricos de envio, mesmo que o cadastro do orador tenha mudado.

Os rankings possuem filtro entre discurso local e envio. O histórico também permite filtrar por essas modalidades ou consultar todas; ao abrir pelo ranking, mantém a modalidade selecionada. Contagens de ranking incluem todos os registros lançados no período, inclusive futuros.

**Quem escalar** continua voltado à programação local: considera os compromissos externos no mesmo dia para disponibilidade e o uso local dos esboços. Para enviar oradores, use Arranjos.

## Compatibilidade dos dados

Backups antigos permanecem aceitos. Registros antigos são interpretados como discursos locais; a primeira definição da congregação local preenche origem e destino dos registros existentes. Antes de definir essa configuração, a origem dos registros antigos ainda depende do cadastro atual. Faça um backup antes da configuração inicial.

O Excel exportado contém as colunas `TIPO`, `ORIGEM`, `DESTINO` nas abas dos anos e a aba `CONFIGURAÇÕES` com a congregação local. A importação preserva esses campos. Planilhas antigas continuam aceitas como programação local. Não se mesclam planilhas identificadas com outra congregação local, pois isso inverteria o sentido de envios e recebimentos. O backup JSON preserva a configuração completa.

## Telefone da agenda

No cadastro do orador, **Escolher telefone da agenda** aparece quando o navegador disponibiliza `navigator.contacts.select` em contexto seguro. O botão pede apenas telefones de um contato escolhido pelo usuário. Se houver vários números, o aplicativo permite selecionar um deles. Cancelar não altera o cadastro. O telefone só é persistido ao salvar o orador.

A Contact Picker API tem disponibilidade limitada; a documentação do Chrome descreve seu uso no Android, com HTTPS, página principal e interação explícita. Quando indisponível, o campo manual permanece e a interface explica que se deve digitar ou colar o número. Não há acesso automático à agenda inteira. A opção **Importar contato (.vcf)** permite escolher um contato exportado da agenda pelo seletor de arquivos; quando houver vários telefones ou contatos, escolha um número na lista. O importador lê campos TEL comuns de vCard 3/4, inclusive números com prefixo tel:, sem gravar automaticamente o nome ou o telefone. A leitura do arquivo não depende da Contact Picker API. Consulte também [APK-AGENDA.md](APK-AGENDA.md).

Referências: [Chrome](https://developer.chrome.com/docs/capabilities/web-apis/contact-picker), [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Contact_Picker_API).

## Validação e publicação

Execute `node build.js`, `node review.test.cjs` e `node fine-tuning.test.cjs`. Os testes cobrem regras de arranjos, histórico, datas livres locais, conflitos, horários, migração, ida e volta pelo Excel e fluxos de cadastro/agenda com DOM e API simulados. Os testes adicionais cobrem painel inicial, ausência de repetição e confirmação para envios, informes, filtros de compartilhamento/ranking/histórico e importação VCF. As telas e APIs são testadas com DOM simulado; o APK e o seletor nativo ainda precisam de validação em um celular compatível, após publicar por HTTPS.

Os arquivos foram preparados localmente. Para disponibilizar a atualização, publique os arquivos regenerados no GitHub Pages, incluindo `index.html`, `sw.js`, `manifest.json`, biblioteca XLSX e ícones.

## Atualização visual e suspensão de contatos

A seleção de contatos e a importação VCF foram retiradas da interface por enquanto; o telefone é preenchido manualmente. As rotinas auxiliares de VCF permanecem disponíveis no código, sem controles na tela.

O início apresenta boas-vindas com a quantidade de agendamentos de hoje, cards locais e de envio com a mesma estrutura, divisória entre as seções e Confirmações locais no grupo de ações locais. O botão de informe foi retirado do card de próximo envio; os informes continuam no fluxo de salvar um envio.

Configurações oferece seis paletas predefinidas para cada seção, aplicadas ao card, indicadores e botões daquela seção. Os padrões continuam azul e verde; as escolhas são salvas no aparelho e no backup JSON.

O histórico e a edição da congregação mostram seus oradores vinculados. O botão Cadastrar orador nesta congregação abre o cadastro com a congregação selecionada. Para uma congregação nova, salve primeiro e depois use o atalho. No editor, salve alterações de nome/horário antes de abrir o cadastro do orador.
