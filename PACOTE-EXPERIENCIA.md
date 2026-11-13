# Pacote de experiência do app

## Padronização aprovada em 13/11/2026

A tela inicial apresenta a mesma sequência nas seções locais e de envios: card de destaque, lista de até três próximos agendamentos (incluindo o destaque), indicadores e ações. As paletas configuradas continuam aplicadas a cada seção.

Nos cards de destaque, nas listas da tela inicial e nos cards de pendências, o título identifica o orador como **Nome • Congregação de origem**. Quando não há congregação informada, mostra apenas o nome. O destino do discurso continua identificado separadamente.

Pendências reúne os filtros no topo e os indicadores em um resumo compacto. Cada card apresenta data, orador, destino e pendências; as ações ficam em um rodapé separado. **Solicitar** abre a revisão da mensagem; quando há pedido registrado, aparece **Solicitar novamente**. **Confirmar** continua registrando a confirmação local, mantendo as demais pendências. **Ver detalhes** abre a edição. Os controles se adaptam a telas estreitas, texto ampliado e modo noturno.

A verificação no Chrome cobre as duas listas, a abertura da solicitação sem confirmar o discurso, a confirmação mantendo cântico e imagens pendentes e os controles a 320 pixels com texto muito grande. Capturas: `qa/pendencias-claro.png` e `qa/pendencias-escuro.png`.

Implementações locais das nove prioridades aprovadas, com o calendário opcional.

| Prioridade | Resultado |
| --- | --- |
| Pendências sem menu duplicado | Removido o acesso separado a Confirmações. Pendências oferece todos os itens ou somente confirmações locais, com ações de pedir e confirmar. O endereço interno antigo continua sendo redirecionado. |
| Modo noturno | Configurações permite Claro, Modo noturno e Acompanhar o aparelho. As paletas de azul e verde continuam aplicadas aos cards. |
| Histórico de informes | Mais → Histórico de informes registra o texto e a programação da ocasião, com data/hora e ação: Preparado, Copiado ou Aberto no WhatsApp. Mudanças posteriores na data, orador, destino, esboço, tema ou horário ficam sinalizadas; excluir a programação também sinaliza o histórico. |
| Busca e ordenação | Buscar no cabeçalho pesquisa nomes, congregações, telefones, esboços, temas e datas, ignorando acentos. Resultados abrem seus registros. Busca geral e Programação têm ordenação por nome/congregação/data; o cadastro de oradores permite ordem alfabética ou congregação. |
| Rodízio | Filtros por modalidade e intervalo de datas, busca e ordenação. Última participação e próximo compromisso são calculados apenas no recorte escolhido. Sem registro no período aparece primeiro na ordenação por tempo sem participar. |
| Agendamento guiado | Novos agendamentos passam por cinco etapas: modalidade/data, orador, congregação, discurso/detalhes e revisão. Envio oferece apenas oradores locais; compromissos no mesmo dia são bloqueados. Voltar preserva os campos. Editar registros existentes mantém o formulário completo. |
| Revisão antes de compartilhar | WhatsApp, Copiar e Outros apps abrem primeiro uma revisão do período, modalidade, quantidade e orador/destinatário. O texto pode ser ajustado. Cancelar não compartilha nada. Um período sem registros ou inválido é bloqueado. |
| Desfazer exclusões | Exclusões individuais de discursos, oradores, congregações e esboços oferecem Desfazer por 10 segundos. Também ficam em Mais → Exclusões recentes por até 7 dias, limitadas às 50 últimas. Restaurar verifica conflito e não substitui registros atuais. |
| Acessibilidade | Texto Normal/Grande/Muito grande, contraste reforçado, foco visível, campos associados aos rótulos, ações acessíveis por teclado, mensagens de estado e diálogos com foco contido, Escape e retorno de foco. Identificação das modalidades inclui texto além das cores. |
| Calendário opcional | Lista continua padrão. Configurações permite escolher Calendário mensal, com filtros, detalhes do dia e agendamento na data selecionada. |

## Dados e limites

As preferências, o histórico de mensagens e as exclusões recentes são salvos no aparelho e preservados no backup JSON. Backups antigos recebem valores padrão; os registros existentes não são convertidos nem apagados. O Excel continua sendo intercâmbio de cadastros e programação, sem incluir os novos arquivos de histórico de mensagens ou exclusões.

Abrir o WhatsApp não comprova que a mensagem foi enviada, entregue ou lida. O histórico registra a ação que o app consegue observar. Copiar um pedido local mantém o acompanhamento de pedido realizado; não marca o discurso como confirmado. Para envios, continua sendo gerado apenas o informe.

O desfazer abrange exclusões individuais. Apagar todos os dados e substituir por um backup/planilha são operações diferentes e continuam exigindo suas confirmações. Os itens expirados não ficam disponíveis para restauração. Faça backup regularmente.

Uma programação sem orador ou esboço ainda pode ser lançada na modalidade local. O assistente oferece Definir depois, preservando o planejamento de datas. Envio exige orador local e congregação de destino distinta.

A captura de contatos segue suspensa na interface. Não foram incluídos os demais recursos sugeridos para o escopo futuro, como repertório de esboços, status Realizado/Cancelado, gráficos ou sincronização entre aparelhos.

## Verificação

- `node review.test.cjs`: regressões de datas, planilhas, migração e programação.
- `node fine-tuning.test.cjs`: separação das modalidades, cards, filtros e calendário.
- `node package.test.cjs`: busca, rodízio, snapshots imutáveis, restauração com conflito e preferências.
- `node --experimental-websocket browser.test.cjs`: Chrome temporário, sem dependências externas. Testa fluxo guiado real, informe e histórico, tema, calendário, busca, rodízio, revisão, excluir/restaurar, larguras de 390 e 320 pixels, texto muito grande, contraste, foco/Escape e preferências após recarregar. O teste usa dados fictícios e substitui a abertura do WhatsApp por um simulador; não envia mensagens externas.

Inspeção visual local em modo noturno: `qa/inicio-noturno.png`. Os testes de navegador foram executados fora do sandbox porque o Chrome não iniciou dentro dele. Cada execução cria um perfil temporário separado, sem usar o perfil pessoal do navegador.

A validação não equivale a uma auditoria completa com leitor de tela. O APK Android e os seletores nativos de compartilhamento ainda devem ser conferidos no aparelho.

## Publicação

Execute `node build.js` após editar as fontes. Ele regenera `index.html` e a versão de cache em `sw.js`. Os arquivos foram preparados localmente; nenhuma publicação ou alteração no repositório remoto foi realizada nesta etapa.
