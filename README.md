# Sistema de Gestão Multiempresas

Sistema web multiempresas com controle centralizado para gerenciamento de despesas, vendas e receitas.

## Características

- **Multi-Tenant**: Suporte a múltiplas empresas em um único sistema
- **Admin Chefe**: Controle centralizado de todas as empresas
- **Admin Empresa**: Gestão individual por empresa
- **Módulos**: Despesas, Vendas, Receitas, Cadastros e Relatórios

## Arquitetura

- **Backend**: Django + Django REST Framework
- **Frontend**: React
- **Banco de Dados**: MySQL (Multi-Tenant)
- **Autenticação**: JWT (JSON Web Tokens)

## Tipos de Usuários

### 1. Admin Chefe (Super Admin)
- Cria e gerencia empresas
- Acesso a todas as empresas e usuários
- Visualiza relatórios consolidados

### 2. Admin da Empresa
- Gerencia apenas sua empresa
- Cadastra usuários internos
- Controla despesas, vendas e receitas

### 3. Usuário da Empresa
- Acesso limitado conforme permissões
- Visualiza e cadastra dados conforme autorização

## Estrutura do Projeto

```
Sistema-de-Gestao/
├── backend/                 # Django API
│   ├── core/               # Configurações principais
│   ├── empresas/           # App de empresas
│   ├── usuarios/           # App de usuários
│   ├── despesas/           # App de despesas
│   ├── vendas/             # App de vendas
│   ├── receitas/           # App de receitas
│   └── relatorios/         # App de relatórios
│
├── frontend/               # React App
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas do sistema
│   │   ├── services/      # Serviços de API
│   │   └── utils/         # Utilitários
│   └── public/
│
└── docs/                  # Documentação
```

## Instalação Rápida

### Pré-requisitos

- Python 3.9+
- Node.js 16+
- MySQL 8.0+

### 1. Configurar Banco de Dados

```sql
CREATE DATABASE sistema_gestao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend (Django)

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt

# Configure o arquivo .env (copie de .env.example)
# Edite com suas credenciais do MySQL

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend disponível em: `http://localhost:8000`

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em: `http://localhost:3000`

### Documentação Completa

- [Guia de Instalação Detalhado](docs/INSTALACAO.md)
- [Manual do Usuário](docs/MANUAL_USUARIO.md)
- [Documentação da API](docs/API.md)

## Funcionalidades Principais

### 📊 Dashboard
- Visão geral financeira da empresa
- Indicadores de receitas, vendas e despesas do mês
- Saldo mensal
- Alertas de despesas pendentes

### 💰 Despesas
- Cadastro e gerenciamento de despesas
- Categorização de gastos
- Controle de status (Pendente, Paga, Vencida, Cancelada)
- Anexo de comprovantes
- Filtros e busca avançada

### 🛒 Vendas
- Registro de vendas com itens
- Gestão de clientes
- Catálogo de produtos/serviços
- Controle de estoque
- Aplicação de descontos

### 📈 Receitas
- Controle de entradas financeiras
- Categorização de receitas
- Previsão vs Realizado
- Múltiplas formas de recebimento

### 👥 Cadastros
- Gerenciamento de usuários
- Cadastro de clientes
- Cadastro de produtos/serviços
- Categorias de despesas e receitas

### 📑 Relatórios
- **Relatório Financeiro**: Análise detalhada por empresa
- **Relatório Consolidado**: Visão geral de todas as empresas (Admin Chefe)
- Filtros por período
- Análise por categoria
- Gráficos e estatísticas

## Segurança e Permissões

- ✅ Autenticação JWT (JSON Web Tokens)
- ✅ Isolamento de dados por empresa (Multi-Tenant)
- ✅ Sistema de permissões baseado em roles
- ✅ Proteção contra acesso não autorizado
- ✅ Refresh token automático
- ✅ Validações de dados no backend

## Tecnologias Utilizadas

### Backend
- **Django 5.0**: Framework web Python
- **Django REST Framework**: API REST
- **Simple JWT**: Autenticação JWT
- **MySQL**: Banco de dados relacional
- **django-cors-headers**: Configuração de CORS
- **django-filter**: Filtros avançados

### Frontend
- **React 18**: Biblioteca JavaScript
- **Material-UI (MUI)**: Componentes de interface
- **React Router**: Roteamento
- **Axios**: Cliente HTTP
- **Recharts**: Gráficos e visualizações
- **React Toastify**: Notificações
- **Vite**: Build tool

## Screenshots

### Dashboard
![Dashboard](docs/images/dashboard.png)

### Despesas
![Despesas](docs/images/despesas.png)

### Relatórios
![Relatórios](docs/images/relatorios.png)

## Próximos Passos

Após a instalação:

1. ✅ Crie o superusuário (Admin Chefe)
2. ✅ Acesse o Django Admin e crie a primeira empresa
3. ✅ Crie usuários para a empresa
4. ✅ Configure categorias de despesas e receitas
5. ✅ Cadastre clientes e produtos
6. ✅ Comece a registrar transações
7. ✅ Gere seus primeiros relatórios

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Suporte

Para dúvidas, problemas ou sugestões:

- 📧 Email: suporte@sistema-gestao.com
- 📖 [Documentação](docs/)
- 🐛 [Reportar Bug](https://github.com/seu-usuario/sistema-gestao/issues)

## Roadmap

Funcionalidades planejadas:

- [ ] Exportação de relatórios para Excel/PDF
- [ ] Gráficos avançados e dashboards personalizáveis
- [ ] Integração com bancos (Open Banking)
- [ ] App mobile (React Native)
- [ ] Notificações por email/SMS
- [ ] Backup automático
- [ ] Auditoria e logs de atividades
- [ ] Integração com contabilidade
- [ ] API pública para integrações

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autores

- **Sistema de Gestão Multiempresas** - Desenvolvido com ❤️

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
