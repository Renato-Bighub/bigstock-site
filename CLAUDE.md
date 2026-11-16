# CLAUDE.md — Bighub Bigstock

Este ficheiro orienta o Claude Code (e qualquer pessoa que comece a implementar) neste repositório. Resume, de forma autossuficiente, as decisões já tomadas no PRD v1.0, na Especificação Técnica v1.0, no Backlog v1.0 e no mapeamento UX/UI v1.0 do projeto "Bighub Bigstock". Sempre que uma instrução daqui divergir do pedido de uma tarefa pontual, este ficheiro prevalece — ele representa decisões de produto já fechadas, não sugestões.

## 1. O que estamos construindo

Uma plataforma SaaS europeia (Portugal + União Europeia, EUR, PT/EN) que funciona simultaneamente como:
1. Banco de imagens comercial (acervo próprio licenciado).
2. Estúdio de geração/edição de imagens por IA, pago por créditos.
3. Infraestrutura de imagens via API pública, para que outros SaaS, construtores de sites e e-commerces consumam o mesmo serviço.
4. Base preparada para white-label e contratos B2B, mesmo que essa parte não seja construída no MVP.

**Premissa arquitetural que nunca deve ser violada:** há uma única lógica de negócio (preços, licenças, créditos, permissões) servida por dois canais — a aplicação web e a API pública. Nunca implementar uma regra de negócio duas vezes (uma para a web, outra para a API). A API consome os mesmos serviços internos da web.

**Modelo comercial:** assinatura (Starter/Pro/Business/API Platform) + créditos de IA (incluídos e avulsos) + consumo de API + add-ons. Nunca vender acesso ilimitado a geração de IA nos planos iniciais.

## 2. Stack tecnológico (decisão fechada)

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind |
| Backend | NestJS + TypeScript |
| Base de dados | PostgreSQL + extensão `pgvector` |
| Pesquisa textual | PostgreSQL Full Text Search (`portuguese` e `english`) |
| Armazenamento de objetos | S3 ou Cloudflare R2 |
| CDN | Cloudflare (ou equivalente) |
| Filas/assíncrono | Redis + BullMQ |
| Pagamentos | Stripe (+ solução de faturação fiscal compatível com PT/UE — não construir motor fiscal próprio) |
| IA | Adaptadores por fornecedor — nunca acoplar o domínio a um único fornecedor |
| Observabilidade | Sentry + OpenTelemetry |

**Decisão explícita de arquitetura de serviço:** monólito modular com workers separados para processamento assíncrono (geração de IA). Não introduzir microserviços nem Kubernetes neste estágio — a separação física só se justifica quando métricas reais o exigirem.

## 3. Estrutura de repositório esperada

```
apps/
  web/        # Next.js — app pública + área logada + painel admin
  api/        # NestJS — API pública e interna, mesma lógica de negócio da web
  worker/     # NestJS/BullMQ — geração de IA e processamento assíncrono

packages/
  database/   # schema Prisma/Drizzle (ou equivalente), migrações
  contracts/  # tipos e validações partilhados entre apps (ex. zod/io-ts)
  billing/    # regras de créditos, assinaturas, licenciamento — núcleo do domínio
  api-sdk/    # SDK TypeScript (V1.1)
  ui/         # componentes visuais partilhados

modules/      # organização lógica dentro de api/ e web/ — ver §5
  identity/ organizations/ catalog/ search/ licensing/
  downloads/ ai-orchestrator/ credit-ledger/ subscriptions/
  api-access/ usage-metering/ administration/ audit/
```

Cada módulo em `modules/` tem fronteira clara: `identity` não acede diretamente a tabelas de `credit-ledger`, por exemplo — a comunicação entre módulos passa por serviços/interfaces explícitas, nunca por `import` direto de repositório de outro módulo.

## 4. Convenções de base de dados

- Identificadores: `UUID v4` em toda tabela.
- Datas: `timestamptz`, sempre UTC.
- Todo recurso sujeito a isolamento de cliente carrega `organization_id` — nenhuma excepção.
- **Nunca** criar uma coluna `balance` numa carteira. Créditos são sempre um livro de movimentos (`credit_entries`), e o saldo disponível é uma soma calculada, nunca um valor escrito diretamente.
- Tabelas financeiras e de auditoria (`credit_entries`, `payments`, `invoices`, `refunds`, `audit_events`) são **append-only**. Nunca gerar uma migração ou código que faça `UPDATE`/`DELETE` nessas tabelas fora de um estorno/anulação registado como nova linha.
- Migrações são sempre aditivas em produção: nova coluna `nullable` → *backfill* → só depois `NOT NULL`. Nunca `ALTER` destrutivo direto numa tabela com dados em produção.
- O esquema completo (todas as tabelas, colunas e relações por domínio) está detalhado no documento `Especificação Técnica - BD, API e Regras de Negócio (v1.0).md` do projeto — qualquer migração deve ser conferida contra esse documento antes de ser escrita.

## 5. Convenções de API

- Base: `/v1`. Autenticação por `Authorization: Bearer <api_key>`.
- Toda resposta inclui `request_id`.
- Paginação sempre por cursor (`cursor`/`limit` no pedido; `pagination.next_cursor`/`has_more` na resposta).
- Toda operação paga (licenciar, gerar imagem, comprar créditos) **exige** `Idempotency-Key` no cabeçalho — a chave combinada com `organization_id` é única e impede duplicação de cobrança em retries.
- Limite excedido devolve `HTTP 429` com `Retry-After`.
- Nunca expor: prompts privados de outra organização, dados de outros clientes, caminhos internos de armazenamento, ou a chave de API em claro depois da criação inicial.
- Preço, elegibilidade de licença e permissões de acesso são **sempre** recalculados no backend. Nunca confiar em nenhum parâmetro vindo do cliente (web ou API) para determinar custo ou direito de acesso.

## 6. Regras de negócio não-negociáveis

Estas regras vêm do PRD e da Especificação Técnica e são critério de aceitação do MVP (AC-04, AC-06, AC-07, AC-15 no PRD) — qualquer implementação que as viole deve ser tratada como bug crítico, não como débito técnico.

### Créditos
- Toda operação de IA estima o custo em créditos e mostra ao utilizador **antes** de confirmar.
- Confirmar cria uma **reserva** (`credit_entries` negativa), nunca um débito definitivo direto.
- Sucesso → fecha a reserva como `consume`. Falha técnica sem entrega → `release`, devolvendo o valor.
- Consumo sempre em ordem FIFO por `expires_at` mais próximo, respeitando a prioridade de tipo de saldo (promocional → incluído na assinatura → comprado → empresarial).
- Nenhuma operação pode levar o saldo disponível a negativo — a reserva falha com `insufficient_credits` antes de qualquer job ser enfileirado.
- Idempotência por `(organization_id, idempotency_key)` em `ai_jobs` é obrigatória — sem ela, um retry de rede duplica cobrança.

### Assinaturas
- Upgrade no meio do período: proporcionalizar (prorate) e liberar o benefício do novo plano imediatamente.
- Downgrade: só no próximo ciclo de faturação — nunca penalizar uso já feito no período corrente.
- Créditos incluídos na assinatura não acumulam entre períodos; créditos comprados têm validade própria.
- Pagamento falhado → janela de dunning antes de suspender operações pagas. **Nunca** bloquear acesso a faturas e dados já adquiridos, mesmo em `past_due` ou `cancelled`.

### Licenciamento e direitos
- Toda licença concedida (`license_grants`) regista a versão dos termos vigente no momento da compra — mudanças futuras nos termos nunca afetam licenças já concedidas retroativamente.
- Um `asset` sem `rights_records` verificado (`verified_at` preenchido) nunca pode ser publicado — bloquear isso no backend, não só no processo editorial.
- Um `asset` com `allows_ai_transform = false` nunca pode ser usado como referência numa operação de IA.
- Pedido de remoção de direitos bloqueia novas licenças, mas **nunca** revoga automaticamente licenças já concedidas — isso é decisão jurídica/administrativa explícita.
- Imagens geradas numa conta privada nunca entram automaticamente no catálogo público.

### Multi-tenancy e segurança
- Uma organização nunca pode ler ou escrever dados de outra — isto precisa de teste automatizado em CI, não apenas de revisão de código, e o teste deve correr em todo PR que toque tabelas com `organization_id`.
- Administradores globais só acedem a dados privados de clientes via mecanismo de acesso temporário e auditado — nunca por acesso direto e silencioso.

## 7. Conformidade (não esquecer durante a implementação, não só no final)

- **RGPD:** proteção de dados desde a conceção — minimizar o que se guarda, documentar a base legal, prever exportação/eliminação dentro dos limites legais.
- **AI Act (art. 50, vigente desde 2 de agosto de 2026):** registar fornecedor/modelo usado em cada geração, preservar metadados de proveniência, sinalizar conteúdo sintético na interface, nunca remover indevidamente marca de proveniência.
- **IVA/UE:** distinguir B2B/B2C, validar VAT ID quando aplicável, nunca calcular imposto no frontend.
- Nenhuma destas obrigações é "feature opcional" — fazem parte da definição de pronto de qualquer módulo que toque em dados pessoais, faturação ou geração de IA.

## 8. Convenções de código

- TypeScript estrito (`strict: true`) em todo o monorepo.
- Validação de entrada em toda rota de API com schema explícito (zod ou equivalente em `packages/contracts`) — nunca confiar em tipagem estática em runtime.
- Toda operação financeira (créditos, pagamentos, licenças) corre dentro de uma transação de base de dados.
- Testes obrigatórios por módulo: unitários nas regras de negócio de `packages/billing`, integração nos endpoints de `apps/api`, e2e nos fluxos de checkout e geração de IA.
- Logs estruturados (nunca `console.log` solto) com `request_id`/`organization_id` propagados para rastreio.
- Nenhum segredo (chave de API, credencial de fornecedor de IA, segredo de webhook) em código-fonte ou commit — sempre via variáveis de ambiente/gestor de segredos.

## 9. Ordem de implementação (roadmap já decidido — ver Backlog v1.0 para histórias detalhadas)

1. **Fundação** — multi-tenant, auth, organizações, permissões, CI/CD.
2. **Catálogo comercial** — importação, metadados, pesquisa (textual + semântica), licenciamento/downloads.
3. **Monetização** — planos, checkout, carteira de créditos, faturação fiscal.
4. **Geração de IA** — orquestração, filas, idempotência, conformidade AI Act.
5. **API para parceiros** — expor os mesmos serviços internos via `/v1`, chaves, rate limiting, documentação OpenAPI.
6. **Validação e lançamento** — carga, segurança, backup/restauro, revisão jurídica, beta com um parceiro B2B piloto.

Não adiantar módulos de fases posteriores (ex. API) antes da lógica de negócio da fase correspondente estar implementada na web — a API reutiliza esses serviços, não os duplica.

## 10. Explicitamente fora do MVP

Não implementar, mesmo que pareça simples, sem decisão explícita do dono do produto: marketplace aberto a criadores, geração de vídeo, treino de modelo próprio, app mobile nativa, DAM empresarial completo, white-label integral, pesquisa reversa por imagem, SSO, Brand Kit, modelos de IA especializados por setor, integrações com dezenas de construtores de sites.

## 11. Documentos de referência do projeto

Este ficheiro é um resumo operacional. Os documentos completos (com tabelas, exemplos de payload de API, diagramas de fluxo e critérios de aceitação detalhados) estão no projeto "Bighub Bigstock" em claude.ai:
- `PRD - Banco de Imagens SaaS (v1.0).md` — visão, módulos, papéis, jornadas, monetização, MVP, roadmap.
- `Especificação Técnica - BD, API e Regras de Negócio (v1.0).md` — esquema completo de BD, contratos de API, máquinas de estado.
- `Backlog de Desenvolvimento (v1.0).md` — épicos, histórias de utilizador, dependências, critérios de aceitação.
- `UX-UI - Mapa de Ecrãs, Fluxos e Dashboards (v1.0).md` — arquitetura de informação, fluxos, wireframes, dashboards.

Em caso de dúvida sobre uma regra de negócio não resumida aqui, consultar esses documentos antes de decidir sozinho.
