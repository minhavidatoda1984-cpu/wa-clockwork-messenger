# Wa Clockwork Messenger

Crie um dashboard web (full-stack) para agendamento e disparo de mensagens de WhatsApp através de múltiplos números/chips conectados via Evolution API, orquestrado por fluxos externos no n8n.

Funcionalidades principais:

1. Cadastro de números/chips de WhatsApp: nome identificador, número, e instância da Evolution API associada (ex: endpoint https://evolution.naturaisterravida.com.br e nome da instância). Status de conexão (conectado/desconectado).

2. Cadastro de destinos de envio: pode ser um contato individual (nome + número) ou um grupo de WhatsApp (nome + ID do grupo). Deve ser fácil adicionar múltiplos destinos.

3. Cadastro de mensagens agendadas, com os seguintes campos, todos tratados como independentes e OPCIONAIS (o usuário marca em caixas de seleção o que quer usar):
   - Texto da mensagem
   - Qual chip/número vai enviar (seleção do cadastro de chips)
   - Qual destino vai receber (contato ou grupo, do cadastro de destinos)
   - Horário de envio (campo de hora)
   - Repetição: opção de enviar todos os dias, OU repetir a cada X dias (campo numérico, ex: a cada 15 dias), OU envio único sem repetição
   - Status ativo/pausado para cada agendamento

4. Uma tela de listagem geral mostrando todos os agendamentos criados, com filtros por chip e por status, e opção de editar/pausar/excluir cada um.

5. O disparo efetivo das mensagens será feito por um fluxo externo no n8n que vai consultar esse banco de dados periodicamente — então a estrutura de dados (tabelas) precisa ser clara e teria idealmente uma exposição via API/Supabase para o n8n conseguir ler os agendamentos pendentes e marcar como enviados.

Design: interface simples, limpa, em português do Brasil, focada em praticidade — este é um projeto pessoal de uso individual, não precisa de multiusuário nem autenticação complexa (pode ter um login simples).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e7eacfd9-a6bf-408b-8b1a-8a9e4fb87693).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
