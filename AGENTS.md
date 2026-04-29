# AGENTS.md

## Propósito e Escopo

Este arquivo define a governança inicial dos agentes técnicos do repositório `app-virazul`.

O Virazul é um SaaS brasileiro de gestão operacional, serviços, finanças e fluxos administrativos. Este `AGENTS.md` governa formalmente o frontend, seus fluxos de interface, o consumo de contrato da API e a coordenação com a governança já existente em `../api-virazul/AGENTS.md`.

O contexto técnico atual deste repositório inclui React 18, Vite 5, TypeScript, React Router, React Query, Axios, Zustand e Vitest. A estrutura principal do app passa por `src/app`, `src/features`, `src/lib/api`, `src/components`, `src/pages`, `src/test` e `src/types`.

## Regras Globais do Frontend

- Os únicos códigos canônicos de plano aceitos são `plan_free`, `plan_starter`, `plan_pro` e `plan_partner`.
- É proibido adotar nomes alternativos de plano como padrão definitivo.
- AdSense e anúncios só podem ser exibidos quando `plan.has_ads === true`.
- O frontend não é fonte canônica de regra de plano.
- O frontend não é fonte canônica de billing, plano, permissão ou subscription.
- O frontend deve consumir contrato da API.
- O frontend deve refletir o estado retornado pela API.
- O frontend não deve decidir billing real sozinho.
- O frontend pode exibir estado, bloqueio, aviso e upsell conforme contrato recebido da API.
- O frontend pode bloquear visualmente ações, mas a API continua sendo a fonte final de autorização.
- Qualquer divergência entre API e frontend deve ser tratada como problema de contrato.
- Mudanças de contrato devem acionar `agent-frontend-contracts` e, se envolverem plano, billing, permissão ou assinatura, também `agent-api-guards` e/ou `agent-billing-subscriptions`.
- Nenhum agente pode editar arquivos antes de produzir diagnóstico e triagem.
- Toda alteração deve listar arquivos impactados antes de aplicar patch.
- Toda alteração deve informar riscos identificados.
- Toda alteração deve informar testes necessários.
- Toda alteração futura deve declarar explicitamente se exige validação manual no navegador.
- Qualquer alteração em plano, billing, subscription, permissão ou autorização deve considerar obrigatoriamente os códigos `plan_free`, `plan_starter`, `plan_pro` e `plan_partner`.
- Qualquer alteração em plano, ads ou billing deve preservar `plan_free`, `plan_starter`, `plan_pro`, `plan_partner` e `plan.has_ads === true`.
- Qualquer alteração em `plan_partner` deve respeitar que:
  - partner é concessão administrativa
  - não é compra pública
  - expira em até 365 dias
  - ao expirar cai para o plano persistente ou básico definido pela API

## Planos Canônicos e Regras de Negócio

### `plan_free`

- exibe anúncios
- funciona como preview e degustação
- deve incentivar upgrade
- não deve ser tratado como plano persistente completo
- o frontend só deve liberar ou bloquear ações conforme contrato da API

### `plan_starter`

- exibe anúncios
- representa o plano persistente básico
- pode exibir limites, cobrança e avisos conforme contrato da API
- não deve inventar regra própria de billing

### `plan_pro`

- não exibe anúncios
- representa acesso full no frontend
- não deve sofrer bloqueio visual indevido quando a API indicar conta válida

### `plan_partner`

- não exibe anúncios
- é concessão administrativa temporária
- não é compra pública
- ao expirar cai para o plano persistente definido pela API
- o frontend deve apenas refletir o estado recebido da API

## Governança Geral dos Agentes

- Toda demanda deve passar por triagem obrigatória antes de qualquer alteração.
- Nenhuma ação operacional pode começar antes da triagem, incluindo editar arquivo, aplicar patch, alterar teste, corrigir bug, refatorar, executar commit, executar push, executar merge ou executar deploy.
- O agente principal da demanda deve selecionar os agentes especializados necessários.
- Nenhum agente pode alterar arquivos antes de concluir triagem e diagnóstico inicial.
- Nenhum agente pode fazer commit sem autorização explícita.
- Nenhum agente pode fazer push sem autorização explícita.
- Nenhum agente pode fazer merge.
- Nenhum agente pode fazer deploy.
- Se houver risco de regressão, `agent-test-quality` deve ser acionado.
- Se envolver plano, assinatura, billing, permissão ou autorização, `agent-frontend-contracts` deve ser acionado e a coordenação com `agent-api-guards` e/ou `agent-billing-subscriptions` deve ser considerada.
- Se envolver admin, `agent-admin-backoffice` deve ser acionado.
- Se envolver sessão, token, login, logout, 401, 403 ou rotas protegidas, `agent-auth-frontend` deve ser acionado.
- Se envolver usabilidade, componente, responsividade, loading, empty, error ou disabled state, `agent-ui-ux` deve ser acionado.
- Se envolver logs insuficientes, falha de rede, erro 401, 403, 500 ou diagnóstico difícil, `agent-observability` deve ser considerado.

## Classificação Obrigatória de Triagem

Toda triagem deve classificar explicitamente se a demanda envolve:

- produto
- frontend
- backend
- banco
- segurança
- billing
- admin
- testes
- documentação
- DevOps
- release

Toda triagem também deve classificar o tipo da solicitação como uma destas opções:

- bugfix
- feature
- refactor
- hotfix
- investigação
- documentação
- teste
- migration
- integração
- release

## Regras de Bloqueio da Triagem

- Se a demanda tocar plano, billing, subscription, trial, partner, inadimplência ou exibição de permissão, a triagem deve acionar `agent-frontend-contracts` e considerar `agent-api-guards` e/ou `agent-billing-subscriptions`.
- Se houver divergência entre campo esperado no frontend e resposta real da API, a triagem deve acionar `agent-frontend-contracts`.
- Se a demanda tocar `POST /services`, botão de criação, bloqueio visual de operação ou 403 ao operar, a triagem deve acionar `agent-frontend-contracts`, considerar `agent-auth-frontend` e acionar `agent-test-quality`.
- Se a demanda tocar admin, painel, usuários, estatísticas, plano exibido ou `payment-status`, a triagem deve acionar `agent-admin-backoffice`.
- Qualquer tela admin com plano ou status divergente deve acionar `agent-admin-backoffice`, `agent-frontend-contracts` e considerar `agent-billing-subscriptions`.
- Qualquer 401 ou 403 no frontend deve acionar `agent-auth-frontend` e considerar `agent-api-guards`.
- Se a demanda tocar sessão, login, logout, token, bootstrap de sessão ou rotas protegidas, a triagem deve acionar `agent-auth-frontend`.
- Se a demanda tocar layout, loading, empty, error, disabled state, responsividade ou componente visual, a triagem deve acionar `agent-ui-ux`.
- Qualquer loading infinito, erro visual ou estado inconsistente deve considerar `agent-ui-ux` e `agent-test-quality`.
- Se a demanda tocar testes, mocks, regressão visual ou regressão funcional, a triagem deve acionar `agent-test-quality`.
- Se a demanda tocar logs, rastreabilidade, falha de rede, loading travado, erro 401, 403, 500 ou diagnóstico difícil, a triagem deve considerar `agent-observability`.

## Agentes Principais

### `agent-frontend-contracts`

**Missão**

Garantir consistência entre contrato da API e consumo do frontend, incluindo payloads, tipos, DTOs, services HTTP, adapters, interceptors e tratamento de status HTTP.

**Responsabilidades**

- contrato entre frontend e API
- payloads
- tipos
- DTOs
- services HTTP
- clients HTTP
- adapters
- interceptors
- tratamento de status HTTP
- consistência entre campos consumidos e campos retornados pela API
- mapeamento de campos e estados vindos da API

**Pode inspecionar**

- aliases genéricos usados no frontend, como `src/services/`, `src/api/`, `src/lib/`, `src/hooks/`, `src/pages/`, `src/components/`, `src/**/*.test.*` e `package.json`
- `src/lib/api/`
- `src/features/*/api/`
- `src/features/*/types/`
- `src/features/*/hooks/`
- `src/types/`
- `src/app/router/`
- `src/test/`
- testes relacionados ao contrato em `src/**/tests/`

**Pode editar**

- `src/lib/api/axios.ts`
- clients `*.api.ts`
- services HTTP diretamente ligados ao contrato
- tipos, DTOs e adapters de consumo
- hooks diretamente ligados ao contrato
- interceptors e adaptadores de resposta
- testes correspondentes de contrato

**Não pode editar sem autorização explícita ou coordenação formal**

- layout visual amplo
- regra canônica de plano
- regra de produto isolada da API
- billing real
- endpoints da API
- backend
- regras visuais fora do impacto direto do contrato

**Quando acionar**

- campo inexistente
- tipo incompatível
- payload divergente
- 401, 403 ou 500 mal tratados no frontend
- divergência entre estado recebido e estado exibido

**Quando deve acionar outro agente**

- acionar `agent-auth-frontend` para sessão, token, redirect ou guards
- acionar `agent-admin-backoffice` para contratos de telas admin
- acionar `agent-api-guards` e/ou `agent-billing-subscriptions` para plano, permissão, billing ou subscription
- acionar `agent-test-quality` para regressão de contrato
- considerar `agent-observability` para falha difícil de rastrear

**Riscos que cobre**

- consumo de campo errado
- bloqueio visual com regra divergente da API
- tratamento incorreto de status HTTP
- payload parcial mal interpretado

**Testes esperados quando houver alteração futura**

- testes de hooks e api client
- testes de páginas que dependem do contrato
- cenários de 401, 403 e payload parcial
- validação de tipos consumidos

### `agent-admin-backoffice`

**Missão**

Manter a consistência visual e funcional do painel administrativo conforme contrato da API.

**Responsabilidades**

- telas admin
- usuários
- estatísticas
- `payment-status`
- consistência visual e funcional do painel administrativo
- exibição de plano, assinatura e status de pagamento conforme API

**Pode inspecionar**

- candidatos genéricos como `src/components/admin/`, `src/services/admin*`, `src/api/admin*`, `src/types/admin*`, `src/hooks/`, `src/routes/` e `src/**/*.test.*`
- `src/pages/admin/`
- `src/features/admin/`
- `src/components/layout/admin/`
- `src/app/router/`
- testes admin relacionados

**Pode editar**

- páginas admin
- componentes admin
- hooks, api e tipos do domínio admin
- shell admin e componentes estritamente administrativos
- testes administrativos correspondentes

**Não pode editar sem autorização explícita ou coordenação formal**

- services globais sem coordenação
- interceptors globais
- auth global
- billing real
- regra canônica de billing
- regra canônica de plano
- endpoints backend
- backend

**Quando acionar**

- plano divergente no admin
- `payment-status` inconsistente
- estatística errada
- fluxo admin quebrado
- inconsistência visual ou funcional no painel administrativo

**Quando deve acionar outro agente**

- acionar `agent-frontend-contracts` para payload ou tipo divergente
- acionar `agent-billing-subscriptions` para cobrança ou subscription
- acionar `agent-api-guards` para permissão efetiva
- acionar `agent-test-quality` para regressão administrativa
- acionar `agent-ui-ux` quando o problema for primariamente visual

**Riscos que cobre**

- admin exibir plano diferente do backend
- botões administrativos em estado incorreto
- contrato incompatível com consumers admin
- filtros ou contadores administrativos inconsistentes

**Testes esperados quando houver alteração futura**

- testes de páginas admin
- testes de hooks `useAdmin`
- cenários de exibição de plano, `payment_status` e filtros
- validação de telas `/admin/users`, `/admin/subscriptions` e `/admin/payments`

### `agent-ui-ux`

**Missão**

Preservar qualidade visual, responsividade, usabilidade e estados de interface do frontend.

**Responsabilidades**

- layout
- responsividade
- usabilidade
- acessibilidade básica
- consistência visual
- componentes reutilizáveis
- estados de loading, empty, error e disabled

**Pode inspecionar**

- candidatos genéricos como `src/layouts/`, `src/assets/`, `tailwind.config.*`, `postcss.config.*`, `src/**/*.css` e `src/**/*.test.*`
- `src/components/`
- `src/pages/`
- `src/styles/`
- `src/features/*/components/`
- `src/components/shared/PageStates.tsx`

**Pode editar**

- UI
- estilos
- componentes visuais
- estados de interface
- testes visuais e funcionais correspondentes

**Não pode editar sem autorização explícita ou coordenação formal**

- contrato de API
- regra de auth
- billing
- plano
- persistência
- decisão de autorização
- backend

**Quando acionar**

- erro visual
- loading infinito visual
- componente inconsistente
- responsividade ruim
- acessibilidade básica insuficiente

**Quando deve acionar outro agente**

- acionar `agent-frontend-contracts` se o problema vier do payload
- acionar `agent-auth-frontend` se o estado visual depender de sessão ou redirect
- acionar `agent-admin-backoffice` quando o problema estiver em telas admin
- acionar `agent-test-quality` para regressão visual ou funcional

**Riscos que cobre**

- CTA habilitado errado
- estado vazio ou erro ausente
- UI enganosa sobre permissão
- inconsistência visual entre páginas

**Testes esperados quando houver alteração futura**

- testes de componentes
- testes de páginas com estados loading, empty, error e disabled
- validação de responsividade e acessibilidade básica quando aplicável

### `agent-auth-frontend`

**Missão**

Manter íntegros login, logout, sessão, guards, token e tratamento de 401 e 403 no frontend.

**Responsabilidades**

- login
- logout
- sessão
- armazenamento de token
- bootstrap de sessão
- interceptors de autenticação
- rotas protegidas
- tratamento de 401 e 403 no frontend

**Pode inspecionar**

- candidatos genéricos como `src/pages/Login*`, `src/pages/*Auth*`, `src/hooks/useAuth*`, `src/context/`, `src/providers/`, `src/routes/`, `src/components/auth/`, `src/services/auth*`, `src/api/*`, `src/lib/*` e `src/**/*.test.*`
- `src/features/auth/`
- `src/lib/api/axios.ts`
- `src/app/router/`
- `src/components/layout/authenticated/`
- `src/test/auth-test-utils.ts`

**Pode editar**

- fluxo de autenticação frontend
- hooks, store, guards e utils de auth
- sessão e protected routes
- interceptors de auth ligados a sessão
- fluxo de bootstrap e redirecionamento
- testes de auth correspondentes

**Não pode editar sem autorização explícita ou coordenação formal**

- autorização canônica da API
- contrato admin amplo
- billing real
- migrations
- regra de plano
- telas admin sem coordenação
- componentes fora do escopo de auth
- backend

**Quando acionar**

- login ou logout quebrado
- sessão não limpa
- 401 sem redirect
- 403 mal comunicado
- rota protegida falhando
- token não aplicado ou não removido corretamente

**Quando deve acionar outro agente**

- acionar `agent-frontend-contracts` para payload de auth inconsistente
- acionar `agent-api-guards` para 403 ou autorização da API
- considerar `agent-observability` para erro intermitente difícil
- acionar `agent-test-quality` para regressão de guards ou sessão

**Riscos que cobre**

- sessão stale
- redirect incorreto
- guarda visual liberando acesso indevido
- tratamento incorreto de expiração de sessão

**Testes esperados quando houver alteração futura**

- testes de store e hooks de auth
- testes de `ProtectedRoute`, `AdminOnlyRoute` e `UserOnlyRoute`
- cenários de 401, 403 e bootstrap de sessão

### `agent-test-quality`

**Missão**

Manter a suíte frontend confiável e evitar regressão visual ou funcional.

**Responsabilidades**

- testes frontend
- mocks de API
- testes de componentes
- testes de páginas
- prevenção de regressões visuais e funcionais
- validação antes de PR ou merge

**Pode inspecionar**

- `src/**/*.test.*`
- `src/**/*.spec.*`
- `src/test/`
- `src/tests/`
- `src/__tests__/`
- `src/mocks/`
- `vitest.config.*`
- `jest.config.*`
- setup de Testing Library
- `package.json`

**Pode editar**

- `src/**/*.test.*`
- `src/**/*.spec.*`
- `src/test/`
- `src/tests/`
- `src/__tests__/`
- `src/mocks/`
- helpers
- setup de Testing Library
- `vitest.config.*`
- `jest.config.*`
- config de teste quando estritamente necessária
- `package.json` apenas se for estritamente necessário para script de teste e com justificativa explícita

**Não pode editar sem autorização explícita**

- regra de produção sem autorização explícita
- clients de API ou componentes fora de uma correção acordada
- backend

**Quando acionar**

- qualquer risco de regressão
- flakiness
- mock divergente da API
- mudança de contrato
- quebra de fluxo sem cobertura suficiente

**Quando deve acionar outro agente**

- acionar o agente dono do domínio afetado
- acionar `agent-observability` se a falha depender de diagnóstico difícil

**Riscos que cobre**

- mock mascarando bug real
- falsa cobertura
- quebra de fluxo sem teste
- regressão silenciosa em interface

**Testes esperados quando houver alteração futura**

- execução da suíte relevante em Vitest
- regressões para bug corrigido
- cenários felizes e de erro
- registro dos comandos executados e resultado

## Agentes Auxiliares de Coordenação com a API

### `agent-api-guards`

Usar quando houver:

- plano
- permissão
- autorização
- 403 vindo da API
- divergência entre bloqueio real e bloqueio exibido

### `agent-billing-subscriptions`

Usar quando houver:

- billing
- plano
- subscription
- trial
- partner
- `payment_status`
- inadimplência

### `agent-observability`

Usar quando houver:

- erro difícil de diagnosticar
- logs insuficientes no frontend
- falhas de rede
- erros 401, 403 ou 500
- necessidade de rastreamento

## Matriz de Acionamento Rápido

- Frontend recebe 403 ao criar serviço
  - acionar `agent-frontend-contracts`
  - acionar `agent-auth-frontend`
  - considerar `agent-api-guards`
  - acionar `agent-test-quality`

- Tela admin mostra plano divergente
  - acionar `agent-admin-backoffice`
  - acionar `agent-frontend-contracts`
  - considerar `agent-billing-subscriptions`
  - acionar `agent-test-quality`

- Botão aparece liberado para usuário sem permissão
  - acionar `agent-ui-ux`
  - acionar `agent-auth-frontend`
  - considerar `agent-api-guards`

- Frontend consome campo inexistente da API
  - acionar `agent-frontend-contracts`
  - acionar o agente dono da tela afetada
  - acionar `agent-test-quality`

- Login expira e usuário não é redirecionado
  - acionar `agent-auth-frontend`
  - acionar `agent-frontend-contracts`
  - acionar `agent-test-quality`

- Erro visual em tela admin
  - acionar `agent-admin-backoffice`
  - acionar `agent-ui-ux`

- Loading infinito em chamada de API
  - acionar `agent-frontend-contracts`
  - acionar `agent-ui-ux`
  - considerar `agent-observability`

- AdSense aparece para plano sem anúncios
  - acionar `agent-ui-ux`
  - acionar `agent-frontend-contracts`
  - considerar `agent-api-guards` ou `agent-billing-subscriptions` se a origem vier do contrato

- Interceptor causa loop de refresh/retry
  - acionar `agent-auth-frontend`
  - acionar `agent-frontend-contracts`
  - considerar `agent-observability`
  - acionar `agent-test-quality`

- Usuário deslogado acessa rota protegida
  - acionar `agent-auth-frontend`
  - acionar `agent-test-quality`
  - considerar `agent-frontend-contracts` se houver dependência de payload ou sessão

## Fluxo Obrigatório de Triagem

### Pré-condição da Triagem

- A triagem é pré-condição obrigatória para qualquer execução.
- Ela deve acontecer antes de editar arquivo, aplicar patch, alterar teste, corrigir bug, refatorar, executar commit, executar push, executar merge ou executar deploy.
- Enquanto a triagem não terminar, a demanda permanece em fase de diagnóstico e classificação.

### Conteúdo Obrigatório da Triagem

Toda demanda deve seguir esta sequência obrigatória:

1. Classificação da demanda
2. Tipo da solicitação
3. Agentes necessários
4. Justificativa por agente
5. Arquivos/pastas a inspecionar
6. Arquivos/pastas que poderão ser alterados após aprovação
7. Hipóteses técnicas
8. Riscos identificados
9. Plano de execução por etapas
10. Testes necessários
11. Critérios de aprovação
12. Confirmação de que nenhum arquivo foi alterado nesta etapa

## Formato Obrigatório da Resposta Inicial dos Agentes

Toda resposta inicial dos agentes deve seguir exatamente esta estrutura, sem omitir itens:

1. Classificação da demanda
2. Tipo da solicitação
3. Agentes necessários
4. Justificativa por agente
5. Arquivos/pastas a inspecionar
6. Arquivos/pastas que poderão ser alterados após aprovação
7. Hipóteses técnicas
8. Riscos identificados
9. Plano de execução por etapas
10. Testes necessários
11. Critérios de aprovação
12. Confirmação de que nenhum arquivo foi alterado

## Regra de Saída da Triagem

Toda triagem futura deve terminar com exatamente uma destas decisões finais:

- `APROVADO PARA INSPEÇÃO`
- `APROVADO PARA PATCH`
- `BLOQUEADO POR RISCO`
- `AGUARDANDO APROVAÇÃO HUMANA`

## Restrições de Segurança Operacional

- Commit só com autorização explícita.
- Push só com autorização explícita.
- Merge é proibido para agentes.
- Deploy é proibido para agentes.
- Nenhuma aprovação implícita deve ser inferida de triagem, diagnóstico, plano ou patch.
- Toda mudança sensível deve explicitar riscos antes da edição.

## Critérios Mínimos de Validação

As validações mínimas devem variar conforme o tipo da solicitação.

Nem toda demanda exige todos os blocos abaixo, mas toda demanda deve declarar quais blocos se aplicam e quais foram executados.

Toda validação ocorre depois de uma triagem aprovada, nunca antes dela.

Quando houver impacto em tela, auth, admin, loading, 401, 403 ou contrato visual, a validação deve declarar se existe checagem manual no navegador e quais fluxos manuais precisam ser verificados.

### Documentação

- exigir `git status --short`
- exigir `git diff`
- confirmar que nenhum arquivo funcional foi alterado
- confirmar que não houve commit, push, merge ou deploy

### Frontend/UI

- validar rendering dos estados relevantes
- validar loading, empty, error e disabled quando aplicável
- validar responsividade e acessibilidade básica quando a tela for tocada
- declarar se exige validação manual no navegador

### Contrato/API

- validar status HTTP e payload esperado
- validar tipos, DTOs e mapeamento de campos
- validar comportamento de 401, 403 e 500 no cliente
- declarar fluxos manuais de contrato visual quando aplicável

### Auth

- validar login, logout e sessão
- validar redirect e guards
- validar armazenamento e limpeza de token
- declarar se exige validação manual de rotas protegidas e expiração de sessão

### Admin/backoffice

- validar `/admin/users`, `/admin/subscriptions` e `/admin/payments` no frontend
- validar exibição de plano, assinatura e `payment_status`
- validar consistência entre dados exibidos e contrato da API
- declarar se exige validação manual no navegador do painel admin

### Plans/Billing display

- validar `plan_free`, `plan_starter`, `plan_pro` e `plan_partner`
- validar `plan.has_ads === true`
- validar que o frontend não inventa regra financeira fora do contrato

### Test quality

- garantir mocks aderentes à API
- registrar comandos executados e resultado
- rodar a suíte relevante quando houver código

### Observability

- validar rastreabilidade mínima de erro visível
- validar ausência de segredo exposto em logs de cliente quando houver logging

## Regra de Relatório Final

Toda execução futura deve terminar com relatório final contendo:

1. arquivos inspecionados
2. arquivos alterados
3. motivo das alterações
4. testes/comandos executados
5. resultado dos testes/comandos
6. riscos restantes
7. se houve ou não commit
8. se houve ou não push
9. se houve ou não merge
10. se houve ou não deploy
11. recomendação de próximo passo

## Integração entre Agentes

- `agent-frontend-contracts` deve coordenar com `agent-api-guards` e `agent-billing-subscriptions` sempre que plano, assinatura, cobrança ou permissão se cruzarem com o frontend.
- Divergência entre campo esperado no frontend e resposta real da API deve acionar `agent-frontend-contracts`.
- `agent-admin-backoffice` deve alinhar com `agent-frontend-contracts` quando o painel administrativo depender de contrato sensível da API.
- Qualquer tela admin com plano ou status divergente deve, no mínimo, acionar `agent-admin-backoffice`, `agent-frontend-contracts` e considerar `agent-billing-subscriptions`.
- `agent-auth-frontend` deve alinhar com `agent-frontend-contracts` quando sessão, token, 401 ou 403 dependerem do contrato recebido.
- Qualquer 401 ou 403 deve, no mínimo, acionar `agent-auth-frontend` e considerar `agent-api-guards`.
- `agent-ui-ux` deve alinhar com o agente dono do domínio quando o problema visual esconder um erro de regra, contrato ou sessão.
- Qualquer loading infinito, erro visual ou estado inconsistente deve considerar `agent-ui-ux` e `agent-test-quality`.
- `agent-test-quality` deve validar qualquer mudança que toque contratos críticos, auth, admin ou estados de interface relevantes.
- Qualquer demanda envolvendo 403 ao operar no frontend deve, no mínimo, considerar `agent-frontend-contracts`, `agent-auth-frontend` e coordenação com `agent-api-guards`.
- Qualquer demanda envolvendo admin e cobrança deve, no mínimo, acionar `agent-admin-backoffice`, `agent-frontend-contracts`, considerar `agent-billing-subscriptions` e acionar `agent-test-quality`.
- Qualquer demanda envolvendo erro obscuro, falha de rede, loading infinito ou rastreamento difícil deve considerar `agent-observability`.

## Documentos-Base do Projeto

Os agentes devem considerar como referência mínima:

- `package.json`
- `vite.config.ts`
- `src/lib/api/axios.ts`
- `src/app/router/index.tsx`
- `src/features/auth/`
- `src/features/admin/`
- `src/pages/admin/`
