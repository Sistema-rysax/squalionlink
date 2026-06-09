# SqualionLink — Mockup React

Protótipo interativo completo do sistema com 30+ telas navegáveis.

## 🚀 Como rodar

```bash
cd mockup
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Build para produção

```bash
npm run build
```

Os arquivos são gerados em `dist/`.

## 📦 Stack

- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS (dark mode first)
- Recharts (gráficos)
- React-Leaflet (mapa)
- TanStack Table v8 (tabelas)
- Lucide React (ícones)
- React Router v6 (HashRouter)

## 🗂️ Estrutura

```
src/
├── components/
│   ├── layout/     → Sidebar, Topbar
│   ├── ui/         → DataTable (reutilizável)
│   └── charts/     → (wrappers Recharts)
├── pages/
│   ├── dashboard/  → KPIs + gráficos
│   ├── mapa/       → Mapa com equipamentos
│   ├── frota/      → Equipamentos, Modelos, Contratadas, Ficha
│   ├── operacao/   → Atividades, Ciclos, Dispatch, Alertas
│   ├── abastecimento/
│   ├── mensageria/ → Chat sala ↔ equip
│   ├── checklist/
│   ├── manutencao/ → OS, Preventiva
│   ├── qualidade/  → Pilhas
│   ├── relatorios/
│   ├── areas/
│   ├── operadores/
│   ├── planejamento/ → Apropriação, Fechamento
│   ├── admin/      → Usuários, Perfis (matrix permissões), Config
│   └── Login.tsx
├── mock/           → Dados mockados (JSON)
├── hooks/
└── lib/
```

## 🌐 Demo online

https://d14tv9oaoje0xr.cloudfront.net/cmnqsvdqt000204jvckbjv4t9/squalionlink-react-mockup/
