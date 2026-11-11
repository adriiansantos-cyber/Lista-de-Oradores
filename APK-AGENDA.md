# Agenda no APK do PWABuilder

## O que foi verificado

Nesta pasta há o app web; não há um projeto Android/Gradle, código Kotlin/Java ou APK para inspeção. Portanto, não foi possível identificar a causa específica no APK instalado nem testar o seletor no aparelho.

A documentação do PWABuilder informa que seu pacote Android utiliza Bubblewrap e Trusted Web Activity (TWA). Isso não converte automaticamente uma API web indisponível em um recurso nativo. O app detecta `navigator.contacts.select`; se essa função não estiver exposta pelo navegador que executa o APK, a seleção direta da agenda não aparece.

Fontes: [PWABuilder Android](https://github.com/pwa-builder/PWABuilder/blob/main/docs/builder/android.md), [Contact Picker no Chrome](https://developer.chrome.com/docs/capabilities/web-apis/contact-picker).

## Alternativa disponível nesta implementação

No cadastro do orador, use **Importar contato (.vcf)**:

1. Na agenda do celular, exporte o contato desejado para um arquivo `.vcf`. O nome dos menus varia conforme o aplicativo de contatos.
2. No cadastro do orador, toque em **Importar contato (.vcf)** e escolha o arquivo.
3. Se houver vários números, selecione um. Revise o telefone e salve o cadastro.

Esse fluxo usa o seletor de arquivos, sem depender da API de agenda do navegador. Também continua possível copiar e colar o telefone. O importador aceita campos TEL comuns de vCard 3/4 e arquivos de até 2 MB; não é um importador integral de agendas. O nome do cadastro não é substituído. A interface exibe nomes do arquivo apenas para ajudar a escolher entre números.

O fluxo está coberto por testes com arquivo e interface simulados. A abertura do seletor de arquivos e a importação de um contato real ainda devem ser conferidas no APK instalado.

## Alternativa para seleção direta dentro do APK

É possível desenvolver uma integração Android que abra o seletor nativo usando `Intent.ACTION_PICK` com o tipo `ContactsContract.CommonDataKinds.Phone.CONTENT_TYPE`, receba o resultado e devolva o telefone escolhido ao formulário. A documentação Android descreve esse fluxo para escolher um dado específico do contato. Essa etapa exige código nativo e tratamento do resultado da Activity; um link HTML `intent://` isolado não resolve o retorno do telefone ao campo web.

Para manter a TWA, uma implementação possível é configurar comunicação entre a página e o pacote Android com o canal `postMessage` documentado para TWA, validar o site associado, abrir a Activity seletora e retornar somente o telefone escolhido. O suporte do navegador, a associação do domínio e a configuração do projeto Android precisam ser verificados. Isso exige gerar, compilar e assinar um novo APK, preservando a chave de assinatura para atualizar a instalação existente.

Outra arquitetura possível é um contêiner WebView com uma ponte nativa restrita à origem do app. Nesse caso a troca de contêiner também exige revisar instalação, armazenamento dos dados, comportamento offline e atualização. Não há garantia de migração automática do armazenamento da TWA.

Fontes: [Android — seleção de dados de contato](https://developer.android.com/guide/components/intents-common#Contacts), [Chrome — postMessage em TWA](https://developer.chrome.com/docs/android/post-message-twa), [Android — comunicação com APIs nativas em WebView](https://developer.android.com/develop/ui/views/layout/webapps/native-api-access-jsbridge).

Não foi adicionada uma ponte nativa fictícia ao app web nem gerado um APK nesta etapa. A alternativa VCF já está implementada; a integração direta depende do projeto Android e da compilação do pacote.
