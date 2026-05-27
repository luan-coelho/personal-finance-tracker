# Organizacao, Tarefas e Notas - Design

## Contexto

O app atual e um Next.js com area autenticada em `/admin`, Drizzle/Postgres, Better Auth, React Query, PWA basico e modelo de `spaces` compartilhados. Hoje o produto e focado em financas familiares, mas tambem precisa cobrir organizacao cotidiana para duas pessoas: tarefas com data e horario, lembretes, tela Hoje, recorrencia, captura rapida, projetos/listas, secoes, etiquetas e anotacoes simples.

## Decisoes Aprovadas

- A primeira versao deve ser simples, completa o suficiente para uso diario e sem integracao externa.
- Google Agenda e push servidor ficam fora do escopo inicial.
- Lembretes usam notificacao local do navegador/PWA quando possivel.
- A tela Hoje e o fallback confiavel quando notificacoes locais nao forem entregues.
- Tarefas e notas seguem o modelo hibrido: podem ser pessoais ou compartilhadas no espaco selecionado.
- Tarefas compartilhadas podem ter um responsavel opcional.
- Projetos terao secoes e etiquetas.
- Notas podem ficar soltas, pertencer a um projeto ou ser vinculadas a uma tarefa.
- Captura rapida sera um campo simples de titulo, sem parser automatico em portugues nesta primeira versao.

## Objetivos

1. Criar um modulo de Organizacao dentro da area `/admin`.
2. Permitir registrar tarefas com data, horario opcional, lembrete local opcional, recorrencia simples e responsavel opcional.
3. Entregar uma tela Hoje que mostre tarefas atrasadas, tarefas do dia sem horario, tarefas do dia com horario e proximas tarefas relevantes.
4. Organizar tarefas por projetos/listas, secoes e etiquetas.
5. Permitir anotacoes simples independentes ou conectadas a projetos/tarefas.
6. Reaproveitar autenticacao, espacos, permissao, layout, componentes de UI e padroes de API existentes.

## Fora do Escopo Inicial

- Google Agenda, Google Tasks, Todoist ou qualquer integracao externa.
- Push notification de servidor, Vercel Cron ou chaves VAPID.
- Parser de linguagem natural para frases como "pagar boleto amanha as 20h".
- Regras avancadas de recorrencia estilo RRULE completa.
- Historico detalhado de cada ocorrencia recorrente concluida.
- Comentarios, anexos, arquivos ou wiki de notas.

## Modelo de Acesso

Todo item de organizacao pertence a um `spaceId`, para manter a experiencia consistente com o seletor de espaco existente.

Cada item tambem possui `visibility`:

- `shared`: visivel para membros do espaco com permissao de visualizacao.
- `personal`: visivel apenas para o usuario que criou o item.

Permissoes:

- Usuarios com acesso de visualizacao ao espaco podem ver itens compartilhados e gerenciar seus proprios itens pessoais.
- Criar ou editar itens compartilhados exige permissao de edicao no espaco.
- Itens pessoais so podem ser editados pelo criador.
- Tarefas compartilhadas podem ter `assigneeId` opcional apontando para um membro do espaco.

## Dados

Novas entidades principais:

- `organization_projects`
  - `id`, `spaceId`, `name`, `description`, `color`, `icon`, `visibility`, `createdById`, `createdAt`, `updatedAt`, `archivedAt`.
  - Representa listas/projetos como Trabalho, Casa, Compras, Estudos, Projetos e Igreja.

- `organization_project_sections`
  - `id`, `projectId`, `name`, `position`, `createdAt`, `updatedAt`, `archivedAt`.
  - Representa secoes simples dentro do projeto, como A fazer, Aguardando e Proximos passos.

- `organization_labels`
  - `id`, `spaceId`, `name`, `color`, `createdAt`, `updatedAt`.
  - Vocabulario compartilhado do espaco para filtros e contexto, como urgente, mercado, ligacao e online.

- `organization_tasks`
  - `id`, `spaceId`, `projectId`, `sectionId`, `title`, `description`, `status`, `visibility`, `createdById`, `assigneeId`.
  - Campos de prazo: `dueDate`, `dueTime`, `reminderAt`.
  - Campos de recorrencia: `recurrenceType`, `recurrenceInterval`, `recurrenceDaysOfWeek`, `recurrenceDayOfMonth`, `recurrenceEndsAt`.
  - Campos de controle: `completedAt`, `lastCompletedAt`, `createdAt`, `updatedAt`, `archivedAt`.

- `organization_task_labels`
  - `taskId`, `labelId`.
  - Relacao muitos-para-muitos entre tarefas e etiquetas.

- `organization_notes`
  - `id`, `spaceId`, `projectId`, `taskId`, `title`, `content`, `visibility`, `createdById`, `createdAt`, `updatedAt`, `archivedAt`.
  - Guarda ideias, links, observacoes e pequenas listas.

Datas:

- `dueDate` guarda o dia da tarefa.
- `dueTime` guarda horario `HH:mm` quando existir.
- `reminderAt` guarda o momento exato do lembrete quando o usuario escolher ser avisado.
- A aplicacao continua usando o fuso do Brasil, seguindo os utilitarios existentes de data.

## Recorrencia

A primeira versao suporta recorrencia simples:

- diaria;
- semanal;
- mensal;
- anual;
- intervalo numerico, como a cada 2 semanas;
- dias da semana para recorrencia semanal;
- dia do mes para recorrencia mensal;
- data final opcional.

Ao concluir uma tarefa recorrente, o app calcula a proxima data, grava `lastCompletedAt`, limpa `completedAt` e mantem a tarefa como pendente com o novo prazo. Se nao houver proxima data valida, a tarefa fica concluida como uma tarefa normal. Nao sera criado historico detalhado de ocorrencias nesta primeira versao.

## Lembretes Locais

O app tera um componente cliente global para lembretes de organizacao.

Fluxo:

1. O usuario autoriza notificacoes do navegador quando acionar lembretes.
2. O app consulta tarefas abertas com `reminderAt` proximo ou vencido.
3. Enquanto o app estiver aberto, instalado ou ativo no navegador, um verificador local dispara notificacoes via Notification API ou service worker.
4. O app registra localmente quais lembretes ja foram exibidos para evitar duplicacao.
5. Se notificacoes nao estiverem disponiveis, negadas ou o navegador encerrar o app, a tela Hoje continua mostrando tarefas vencidas e do dia.

Limite assumido: notificacao local nao tem a mesma confiabilidade de push servidor com app fechado. Isso sera documentado na interface de permissao, sem bloquear o uso.

## Rotas e Interface

Rotas novas:

- `/admin/organization/today`: tela Hoje.
- `/admin/organization/tasks`: lista completa de tarefas com filtros.
- `/admin/organization/projects`: projetos/listas, secoes e etiquetas.
- `/admin/organization/notes`: notas simples.

Navegacao:

- Adicionar grupo ou item "Organizacao" na sidebar existente.
- A tela Hoje deve ser o ponto de entrada principal do modulo.

Tela Hoje:

- Captura rapida no topo com campo de titulo e botao de adicionar.
- Secao de tarefas atrasadas.
- Secao de tarefas de hoje com horario, ordenadas por hora.
- Secao de tarefas de hoje sem horario.
- Secao de proximas tarefas, limitada e focada no que exige atencao.
- Acoes rapidas para concluir, editar, atribuir responsavel e abrir detalhes.

Tarefas:

- Lista com filtros por status, projeto, responsavel, etiqueta, visibilidade e periodo.
- Formulario com titulo, descricao, projeto, secao, etiquetas, data, horario, lembrete, recorrencia, responsavel e visibilidade.
- Captura rapida cria uma tarefa pendente com titulo e valores padrao; o usuario pode detalhar depois.

Projetos:

- CRUD de projetos/listas.
- Secoes dentro do projeto com ordenacao simples.
- Gestao basica de etiquetas por espaco.

Notas:

- Lista pesquisavel por texto.
- Formulario simples com titulo e conteudo.
- Projeto e tarefa vinculada opcionais.
- Visibilidade pessoal ou compartilhada.

## API, Servicos e Hooks

Seguir o padrao existente de rotas API em `src/app/api`, servicos em `src/services` e hooks React Query em `src/hooks`.

APIs previstas:

- `GET/POST /api/organization/projects`
- `GET/PUT/DELETE /api/organization/projects/[id]`
- `POST /api/organization/projects/[id]/sections`
- `PUT/DELETE /api/organization/projects/[id]/sections/[sectionId]`
- `GET/POST /api/organization/labels`
- `GET/POST /api/organization/tasks`
- `GET/PUT/DELETE /api/organization/tasks/[id]`
- `POST /api/organization/tasks/[id]/complete`
- `POST /api/organization/tasks/[id]/reopen`
- `GET /api/organization/today`
- `GET/POST /api/organization/notes`
- `GET/PUT/DELETE /api/organization/notes/[id]`

Hooks previstos:

- `useOrganizationToday`
- `useOrganizationTasks`
- `useCreateOrganizationTask`
- `useUpdateOrganizationTask`
- `useCompleteOrganizationTask`
- `useOrganizationProjects`
- `useOrganizationLabels`
- `useOrganizationNotes`

## Estados e Tratamento de Erro

- Sem espaco selecionado: mostrar estado vazio pedindo selecao de espaco.
- Sem permissao para item compartilhado: retornar 403 e mostrar erro claro.
- Notificacao negada: manter tarefa salva e mostrar aviso discreto de que a Tela Hoje sera o lembrete principal.
- Tarefa recorrente sem proxima data valida: concluir como tarefa normal e remover recorrencia ativa.
- Projeto arquivado: nao aparece como padrao em novas tarefas, mas tarefas antigas continuam visiveis.
- Nota vinculada a tarefa removida: manter nota e limpar `taskId` se a relacao for apagada.

## Migracao e Seeds

Criar migracao Drizzle para as novas tabelas e enums.

Seed inicial opcional por espaco:

- Projetos: Casa, Compras, Trabalho, Estudos, Projetos, Igreja.
- Secoes padrao: A fazer, Aguardando, Concluido.
- Etiquetas: urgente, mercado, ligacao, online.

O seed nao deve duplicar registros se executado mais de uma vez.

## Verificacao

Na implementacao, validar pelo menos:

- Build TypeScript/Next.
- Lint.
- Criacao, edicao, conclusao, reabertura e arquivamento de tarefas.
- Tela Hoje com tarefa atrasada, tarefa de hoje sem horario e tarefa de hoje com horario.
- Calculo de proxima data para recorrencias diaria, semanal e mensal.
- Restricao entre item pessoal e compartilhado.
- Notificacao local quando a permissao estiver concedida e fallback quando estiver negada.
- Notas soltas, notas por projeto e notas vinculadas a tarefa.

## Evolucoes Futuras

- Push servidor com Vercel Cron e Web Push.
- Parser local em portugues para captura rapida.
- Integracao opcional com Google Agenda.
- Historico de ocorrencias recorrentes.
- Arrastar e soltar tarefas entre secoes.
- Busca global entre tarefas, notas e financas.
