# Sistema de Gestao Multiempresas

Sistema web multiempresas com controle centralizado para gerenciamento financeiro completo: despesas, vendas, receitas e analise de resultados.

## Visao Geral

Este sistema foi desenvolvido para gerenciar multiplas empresas de forma centralizada, oferecendo:
- Controle financeiro completo (despesas, receitas, vendas)
- Dashboard com indicadores em tempo real
- Relatorios consolidados e por empresa
- Sistema de permissoes baseado em roles
- Arquitetura multi-tenant segura

## Arquitetura

```
Sistema-de-Gestao/
├── backend/                 # Django REST API
│   ├── core/               # Configuracoes principais
│   ├── empresas/           # Gerenciamento de empresas
│   ├── usuarios/           # Autenticacao e usuarios
│   ├── despesas/           # Modulo de despesas
│   ├── receitas/           # Modulo de receitas
│   ├── vendas/             # Modulo de vendas (clientes, produtos)
│   ├── categorias/         # Categorias centralizadas
│   └── relatorios/         # Relatorios financeiros
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/    # Componentes reutilizaveis
│   │   ├── pages/         # Paginas do sistema
│   │   ├── context/       # Contextos (Auth, Filter)
│   │   └── services/      # Servicos de API
│   └── public/
│
└── docs/                  # Documentacao
```

## Stack Tecnologica

### Backend
| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| Django | 5.0 | Framework web Python |
| Django REST Framework | 3.14 | API REST |
| Simple JWT | 5.3 | Autenticacao JWT |
| MySQL | 8.0+ | Banco de dados |
| django-cors-headers | 4.3 | Configuracao CORS |
| django-filter | 23.5 | Filtros avancados |

### Frontend
| Tecnologia | Versao | Descricao |
|------------|--------|-----------|
| React | 18.2 | Biblioteca UI |
| Material-UI (MUI) | 5.14 | Componentes visuais |
| Recharts | 2.10 | Graficos e visualizacoes |
| Vite | 5.0 | Build tool |
| Axios | 1.6 | Cliente HTTP |
| React Router | 6.20 | Roteamento |
| React Toastify | 9.1 | Notificacoes |
| date-fns | 3.0 | Manipulacao de datas |

## Tipos de Usuarios

### 1. Admin Chefe (Super Admin)
- Acesso total ao sistema
- Gerencia todas as empresas
- Visualiza relatorios consolidados
- Gerencia categorias globais
- Cria admins de empresa

### 2. Admin da Empresa
- Gerencia sua empresa
- Cadastra usuarios internos
- Controle total de despesas/receitas/vendas
- Relatorios da empresa

### 3. Usuario da Empresa
- Acesso limitado conforme permissoes
- Registra transacoes
- Visualiza dados autorizados

## Funcionalidades

### Dashboard
- Cards com indicadores principais
  - Receitas do periodo
  - Vendas do periodo
  - Despesas do periodo
  - Saldo (resultado)
- Alertas de despesas pendentes
- Resumo financeiro visual
- Filtros por periodo e empresa

### Despesas
- Cadastro com categorias
- Status: Pendente, Paga, Vencida, Cancelada
- Anexo de comprovantes
- Filtros avancados
- Data de vencimento

### Receitas
- Cadastro categorizado
- Status: Pendente, Recebida, Cancelada
- Data prevista vs realizada
- Multiplas formas de recebimento

### Vendas
- Registro com multiplos itens
- Gestao de clientes
- Catalogo de produtos
- Aplicacao de descontos
- Controle de estoque

### Cadastros
- Usuarios
- Empresas
- Clientes
- Produtos/Servicos
- Categorias (Despesas e Receitas)

### Relatorios
- Relatorio Financeiro por empresa
- Relatorio Consolidado (Admin Chefe)
- Analise por categoria
- Graficos e estatisticas
- Filtros por periodo

## Instalacao

### Pre-requisitos
- Python 3.9+
- Node.js 16+
- MySQL 8.0+

### 1. Banco de Dados

```sql
CREATE DATABASE sistema_gestao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variaveis de ambiente
# Copie .env.example para .env e configure suas credenciais

# Executar migracoes
python manage.py migrate

# Criar superusuario (Admin Chefe)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

Backend disponivel em: `http://localhost:8000`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Frontend disponivel em: `http://localhost:3000`

### Inicio Rapido (Windows)

Execute os arquivos batch na pasta raiz:
- `iniciar-backend.bat` - Inicia o servidor Django
- `iniciar-frontend.bat` - Inicia o servidor Vite
- `iniciar-sistema.bat` - Inicia ambos simultaneamente

## Estrutura da API

### Endpoints Principais

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/usuarios/login/` | Login |
| POST | `/api/token/refresh/` | Renovar token |
| GET | `/api/usuarios/me/` | Dados do usuario logado |
| GET/POST | `/api/empresas/` | Empresas |
| GET/POST | `/api/usuarios/` | Usuarios |
| GET/POST | `/api/despesas/` | Despesas |
| GET/POST | `/api/receitas/` | Receitas |
| GET/POST | `/api/vendas/` | Vendas |
| GET/POST | `/api/vendas/clientes/` | Clientes |
| GET/POST | `/api/vendas/produtos/` | Produtos |
| GET/POST | `/api/categorias/` | Categorias |
| GET | `/api/relatorios/financeiro/` | Relatorio financeiro |
| GET | `/api/relatorios/consolidado/` | Relatorio consolidado |

### Autenticacao

O sistema utiliza JWT (JSON Web Tokens):
- Access token: 60 minutos
- Refresh token: 7 dias
- Renovacao automatica pelo frontend

## Seguranca

- Autenticacao JWT com refresh automatico
- Isolamento de dados por empresa (Multi-Tenant)
- Sistema de permissoes baseado em roles
- Protecao contra acesso nao autorizado
- Validacoes no backend
- Logout automatico por inatividade (5 min)
- CORS configurado

## Modelo de Dados

```
Empresa (raiz)
├── Usuario (ForeignKey -> Empresa)
├── Despesa (ForeignKey -> Empresa)
├── Receita (ForeignKey -> Empresa)
└── Venda (ForeignKey -> Empresa)
    ├── Cliente
    ├── Produto
    └── ItemVenda

Categoria (Global)
├── Tipo: DESPESA | RECEITA
└── Gerenciada por Admin Chefe
```

## Scripts de Inicializacao

### Windows (Batch)

```batch
:: iniciar-backend.bat
cd backend
call venv\Scripts\activate
python manage.py runserver

:: iniciar-frontend.bat
cd frontend
npm run dev

:: iniciar-sistema.bat
start cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
start cmd /k "cd frontend && npm run dev"
```

## Desenvolvimento

### Estrutura de Componentes React

```
pages/
├── Dashboard.jsx       # Dashboard com indicadores
├── Despesas.jsx        # Listagem de despesas
├── DespesaForm.jsx     # Formulario de despesa
├── Receitas.jsx        # Listagem de receitas
├── ReceitaForm.jsx     # Formulario de receita
├── Vendas.jsx          # Listagem de vendas
├── VendaForm.jsx       # Formulario de venda
├── Cadastros.jsx       # Hub de cadastros
├── Relatorios.jsx      # Relatorios e graficos
└── Perfil.jsx          # Perfil do usuario
```

### Contextos

- **AuthContext**: Gerencia autenticacao, usuario logado, tokens
- **FilterContext**: Filtros globais (empresa, usuario, periodo)

## Roadmap

### Implementados
- [x] Sistema multi-tenant
- [x] Autenticacao JWT
- [x] CRUD completo (despesas, receitas, vendas)
- [x] Dashboard com indicadores
- [x] Relatorios basicos
- [x] Sistema de categorias centralizado
- [x] Filtros avancados

### Planejados
- [ ] Dashboard avancado com KPIs financeiros
  - [ ] Receita Operacional Liquida
  - [ ] Analise de Ticket Medio
  - [ ] Comparativo mes a mes
  - [ ] Graficos de evolucao
  - [ ] Benchmarks de mercado
- [ ] Exportacao Excel/PDF
- [ ] Graficos de evolucao mensal
- [ ] DRE automatico
- [ ] App mobile
- [ ] Notificacoes email/SMS
- [ ] Integracao bancaria (Open Banking)
- [ ] Auditoria e logs

## Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudancas (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## Licenca

Este projeto esta licenciado sob a Licenca MIT.

---

Desenvolvido com Django + React
