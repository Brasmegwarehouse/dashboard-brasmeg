# Painel Gerencial — Brasmeg (protótipo)

Reconstrução do "Dashboard Armazém 2026" (Excel) como um app web, para preencher os dados mensais e apresentar de forma mais moderna à gerência.

## O que já funciona neste protótipo

- **Base de Dados** (`/base-dados`) — formulário único onde os números do mês são digitados (equivalente à aba "Base Dados" da planilha). Salva automaticamente ao sair do campo.
- **16 páginas de relatório** já geradas a partir do que é preenchido em Base de Dados — cartões de indicador, gráfico mensal, análise do mês e plano de ação, em cada uma:
  - Recebimento & Expedição, Picking, Processos Recebidos e Expedidos, Atendimento Transporte, Processos por Origem, TONs por Origem, M³ por Origem, Movimentação Mecânica x Manual
  - Ocupação PP, Ocupação BL
  - Faturamento vs Orçado, Índice de Resultados, Digital da Unidade, Acuracidade de Estoque, Inconformidades Operacionais
- Menu lateral já lista as **21 abas originais**. As que faltam (Posições Ocupadas diário, Seguro Contratado, Volumetria) aparecem como "em breve" — têm estrutura bem diferente da mensal padrão (eixo diário, semanal, ou formato analítico) e ficam para uma etapa separada.

## Como isso substitui a planilha

Na planilha, a aba "Base Dados" tinha os números crus e cada aba de relatório usava fórmulas para puxar de lá e montar o gráfico. Aqui é o mesmo princípio: uma tabela flexível no banco (`metrics`) guarda todo valor por (ano, mês, indicador, campo), e cada página de relatório só consulta os campos que precisa.

A maioria das páginas de relatório usa um **componente genérico** (`components/IndicatorReportPage.tsx`) configurado por um arquivo central (`lib/reportConfigs.ts`) — adicionar um indicador novo que segue o padrão mensal (Jan–Dez) é só adicionar uma entrada nesse arquivo, sem duplicar código. Duas páginas (Digital da Unidade e Índice de Resultados) são customizadas porque mostram razões calculadas (CIF/M³, Receita por Mão de Obra) em vez de só somar/comparar números digitados.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # depois edite com sua DATABASE_URL
npm run db:push              # cria as tabelas no banco
npm run dev
```

Abra http://localhost:3000

## Banco de dados (Neon — grátis)

1. Crie uma conta em https://neon.tech e um projeto novo.
2. Copie a "connection string" (pooled).
3. Cole em `.env.local` como `DATABASE_URL=...` (veja `.env.example`).
4. Rode `npm run db:push` para criar as tabelas.

## Deploy no Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em https://vercel.com, "Add New Project" → selecione o repositório.
3. Em "Environment Variables", adicione `DATABASE_URL` com a mesma string do Neon.
4. Deploy. Pronto — link público para acessar de qualquer lugar (celular incluso).

## Identidade visual

O tema já está com a paleta branco/azul/laranja em `tailwind.config.ts` (tokens `brand.blue`, `brand.orange`, `navy.*`). Assim que você mandar o logo da Brasmeg:

1. Salve o arquivo em `public/logo.svg` (ou `.png`).
2. Em `components/Sidebar.tsx`, troque o bloco `BM` por `<img src="/logo.svg" className="h-9" />`.
3. Se as cores exatas da marca forem diferentes das usadas aqui, me manda os hex codes (ou o próprio logo, que eu extraio) que eu ajusto os tokens em `tailwind.config.ts` — todo o app usa essas variáveis, então muda em um lugar só.

## Próximos passos sugeridos

- [ ] Validar as páginas com você
- [ ] Aplicar logo e cores finais da marca (já feito com aproximação extraída do arquivo do logo)
- [ ] Construir as 3 abas restantes: Posições Ocupadas (diário), Seguro Contratado (semanal) e Volumetria (analítica) — formato de dados diferente, ficam para depois
- [ ] Botão de exportar a página atual como imagem/PDF (para substituir o "print da tela" que é usado hoje)
- [ ] Login simples (se o painel for acessado por mais de uma pessoa e quiser controlar quem edita)

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts · Drizzle ORM · Neon Postgres · deploy Vercel
