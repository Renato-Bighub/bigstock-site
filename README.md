# BIGstock — Landing page em React

Implementação em **React + Vite + CSS** do mockup desktop aprovado para o serviço BIGstock, produto do ecossistema BIGhub. O site está em português de Portugal e utiliza euros nos exemplos de preços.

## Iniciar o projeto

Requisitos: Node.js 20.19+ (ou 22.12+) e npm.

```bash
npm install
npm run dev
```

Abrir o endereço apresentado pelo Vite, normalmente `http://localhost:5173`.

Para compilar a versão de produção:

```bash
npm run build
npm run preview
```

O build estático será criado em `dist/` e pode ser publicado na Vercel, Netlify, Cloudflare Pages ou outro alojamento estático.

**Nota de validação:** a sintaxe JSX foi verificada, mas não foi possível executar `npm install` nem compilar o bundle neste ambiente, porque o acesso ao registo npm está indisponível. Execute os comandos acima num ambiente com acesso à Internet antes da publicação.

## Estrutura de ficheiros

```text
BIGstock_React/
├── index.html                  # HTML base, metadados e fontes
├── package.json                # React, Vite, Lucide
├── vite.config.js              # Configuração Vite
├── src/
│   ├── main.jsx               # Entrada React
│   ├── App.jsx                # Componentes e interações da landing page
│   └── styles.css             # Identidade visual e responsividade
├── public/
│   ├── favicon.svg
│   └── images/                # Fallbacks visuais locais do mockup
└── README.md
```

## Funcionalidades demonstrativas incluídas

- Navegação com âncoras e menu responsivo para mobile.
- Hero, pesquisa e scroll para o catálogo.
- Filtros por categoria e pesquisa por palavra-chave em 8 amostras.
- Favoritos guardados no `localStorage` do browser.
- Modal de pré-visualização de imagem.
- Secção de geração IA com prompt, formato, estilo, qualidade e amostras visuais; **não gera imagens reais**.
- Demonstração da API, alternância cURL/JSON e cópia do exemplo.
- Três planos com alternância de faturação mensal/anual e preços indicativos em euros.
- Packs de créditos IA demonstrativos, FAQ accordion e modal de registo de interesse.
- Design responsivo para desktop, tablet e telemóvel.

## O que precisa ser ligado ao backend

1. **Conta e identidade:** login, registo, sessão, perfil, permissões, SSO opcional com BIGhub.
2. **Catálogo:** base de dados, indexação e pesquisa, categorias, metadados, tags, filtros avançados, autoria e licenças por ativo.
3. **Downloads/licenciamento:** verificação de licença, controlo de quota e geração de URL de download temporário.
4. **IA Studio:** serviço de geração de imagens, moderação, fila de trabalhos, storage e medição/debito de créditos.
5. **Subscrições:** Stripe ou outro fornecedor UE, IVA, faturas, renovação/cancelamento e webhooks.
6. **API:** endpoints versionados, autenticação por chave, quotas, rate limits, gestão de chaves, auditoria.
7. **Administração:** importação do catálogo próprio, direitos, coleções, utilização e relatórios.
8. **CRM e consentimento:** ligar o formulário a um sistema real, com RGPD e política de privacidade.

A API mostrada no frontend utiliza o domínio **`api.bigstock.example`**, que é intencionalmente fictício. **Não introduza chaves secretas de fornecedores no código React nem em variáveis `VITE_`**: as chaves privadas devem residir no servidor.

## Imagens

A landing utiliza URLs externas do Unsplash apenas como **imagens demonstrativas de desenvolvimento**. Em caso de falha de rede, apresenta recortes locais derivados do mockup que aprovou (`public/images`). Para a publicação comercial, substitua **todas** as fotografias por ativos do catálogo BIGstock com direitos/licenças auditados, respetivos créditos de autoria quando exigidos e versões otimizadas. Os recortes locais são material visual de referência, não um conjunto de fotografias originais em alta resolução.

Para alterar uma imagem, edite o objeto `photography` no início de `src/App.jsx` e/ou substitua os ficheiros em `public/images`.

## Cores e fontes

- Vermelho principal: `#e50914` (`--brand`).
- Negro: `#121214` (`--ink`).
- Cinzento de fundo: `#f5f5f6` (`--subtle`).
- Títulos: **Manrope**; texto: **DM Sans**.

Estas variáveis estão no topo de `src/styles.css`.

## Avisos antes de lançar

- **Marca:** "Bigstock" já é uma designação usada no mercado de imagens; realize pesquisa e análise de risco de marca junto do INPI Portugal / EUIPO com apoio jurídico.
- **Planos/preços:** valores e limites são propostas ilustrativas, não ofertas vinculativas. Rever margens e cobrança de IVA.
- **RGPD/licenciamento:** não ativar registos, publicidade, downloads, geração por IA ou atribuição de direitos sem os termos, consentimentos e verificações necessários.
- **Redes sociais/estatísticas:** não foram incluídos testemunhos ou métricas de clientes inventados.

A landing page é **frontend funcional para demonstração**. Não se trata ainda da plataforma SaaS completa.
