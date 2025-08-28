# Sistema de Controle Financeiro Pessoal

Uma aplicação Next.js moderna para gerenciamento de finanças pessoais, com design responsivo e validação rigorosa de dados.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Interativo**: Visão geral com gráficos e resumo financeiro
- **Gestão de Salário**: Cadastro e edição da receita mensal
- **Gastos Fixos**: Gerenciamento de despesas mensais recorrentes
- **Gastos Variáveis**: Registro de despesas esporádicas com filtros por data e categoria
- **Categorização**: Sistema de categorias para melhor organização dos gastos
- **Gráficos**: Visualização em pizza e barras dos dados financeiros
- **Responsividade**: Design otimizado para desktop e mobile
- **Persistência Local**: Dados salvos no localStorage do navegador
- **Validação de Dados**: Esquemas Zod para validação robusta

### 📱 Interface
- **Design Moderno**: Interface limpa e intuitiva com shadcn/ui
- **Navegação Responsiva**: Menu lateral no desktop, menu móvel com overlay
- **Cards Informativos**: Resumos visuais dos dados financeiros
- **Modais e Formulários**: Interface fluida para entrada de dados

## 🛠️ Tecnologias Utilizadas

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização utilitária e responsiva
- **shadcn/ui**: Componentes de UI modernos e acessíveis
- **Zod**: Validação de esquemas e tipos
- **React Hook Form**: Gerenciamento eficiente de formulários
- **Recharts**: Biblioteca para gráficos interativos
- **Lucide React**: Ícones modernos e consistentes

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── app/                    # Páginas do App Router
│   ├── page.tsx           # Dashboard principal
│   ├── salary/            # Página de salário
│   ├── fixed-expenses/    # Página de gastos fixos
│   └── variable-expenses/ # Página de gastos variáveis
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base do shadcn/ui
│   ├── layout/           # Componentes de layout
│   └── navigation/       # Componentes de navegação
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
└── types/               # Definições de tipos TypeScript
```

### Gerenciamento de Estado
- **Hook customizado `useFinancialData`**: Centraliza toda a lógica de estado
- **localStorage**: Persistência automática dos dados
- **React State**: Estado reativo com callbacks otimizados

### Validação de Dados
- **Schemas Zod**: Validação robusta para todos os formulários
- **Tipos TypeScript**: Tipagem derivada dos schemas Zod
- **Validação em tempo real**: Feedback imediato para o usuário

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd sistema-controle-financeiro

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
```

## 📱 Como Usar

### 1. Configure seu Salário
- Acesse a página "Salário"
- Informe o valor da sua receita mensal
- Adicione uma descrição (ex: "Salário - Empresa XYZ")

### 2. Cadastre Gastos Fixos
- Vá para "Gastos Fixos"
- Clique em "Novo Gasto Fixo"
- Preencha: nome, valor, categoria, dia de vencimento
- Os gastos fixos são automaticamente incluídos nos cálculos

### 3. Registre Gastos Variáveis
- Entre em "Gastos Variáveis"
- Adicione despesas esporádicas com data
- Use filtros por mês e categoria para análise
- Ideal para compras, entretenimento, etc.

### 4. Monitore no Dashboard
- Visualize seu saldo restante
- Analise gráficos de gastos por categoria
- Compare receitas vs despesas
- Acompanhe o resumo mensal

## 🎨 Design Responsivo

### Desktop (≥768px)
- Menu lateral fixo
- Layout em grid com múltiplas colunas
- Resumo financeiro no header
- Gráficos lado a lado

### Mobile (<768px)
- Menu hambúrguer com overlay
- Layout empilhado em coluna única
- Cards de resumo destacados
- Botões de ação otimizados

## 🔒 Privacidade

- **Armazenamento Local**: Todos os dados ficam no seu navegador
- **Sem Servidor**: Nenhuma informação é enviada para servidores externos
- **Controle Total**: Você tem controle completo dos seus dados

## 🔄 Funcionalidades Futuras

- Exportação de dados (CSV, PDF)
- Metas financeiras e alertas
- Histórico de gastos por período
- Categorias personalizadas
- Backup/restore de dados
- Relatórios avançados
- Comparativos mensais

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Reportar Bugs

Encontrou um problema? Abra uma issue descrevendo:
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (browser, versão, etc.)

---

Desenvolvido com ❤️ usando Next.js e TypeScript