# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-01-15

### Adicionado

#### Backend
- Sistema de autenticação JWT com refresh token
- Arquitetura multi-tenant (banco único com isolamento por empresa_id)
- Models para Empresas, Usuários, Despesas, Vendas e Receitas
- Sistema de permissões baseado em roles (Admin Chefe, Admin Empresa, Usuário)
- API REST completa com Django REST Framework
- Filtros avançados e paginação
- Relatórios financeiros por empresa
- Relatórios consolidados para Admin Chefe
- Validações de dados e segurança
- Django Admin customizado para gerenciamento

#### Frontend
- Interface React com Material-UI
- Sistema de rotas com React Router
- Autenticação JWT com renovação automática
- Dashboard com indicadores financeiros
- Páginas de Despesas, Vendas e Receitas
- Sistema de Cadastros (Usuários, Clientes, Produtos, Categorias)
- Geração de Relatórios com filtros de período
- Notificações toast
- Design responsivo

#### Documentação
- README completo com instruções
- Guia de Instalação detalhado
- Manual do Usuário
- Documentação da API REST
- Guia Rápido de Início (QUICKSTART)
- Scripts de setup automático (Windows e Linux/Mac)

#### Funcionalidades
- Controle de Despesas com categorias e status
- Registro de Vendas com itens e clientes
- Controle de Receitas com categorias
- Gestão de Clientes e Produtos
- Relatórios financeiros detalhados
- Dashboard com métricas em tempo real
- Sistema multi-tenant completo
- Isolamento de dados por empresa

### Segurança
- Autenticação JWT segura
- Proteção CORS configurada
- Validações de entrada de dados
- Isolamento de dados por empresa
- Sistema de permissões robusto
- Proteção contra SQL Injection
- Senhas criptografadas

### Tecnologias
- Backend: Django 5.0, DRF, MySQL, JWT
- Frontend: React 18, Material-UI, Vite
- Ferramentas: Git, npm, pip

## [Planejado para 1.1.0]

### A Adicionar
- [ ] Exportação de relatórios para Excel
- [ ] Exportação de relatórios para PDF
- [ ] Gráficos interativos no Dashboard
- [ ] Notificações por email
- [ ] Alertas de vencimento de despesas
- [ ] Histórico de alterações (auditoria)
- [ ] Backup automático
- [ ] Tema escuro (dark mode)
- [ ] PWA (Progressive Web App)

### A Melhorar
- [ ] Performance de consultas com cache
- [ ] Upload de imagens otimizado
- [ ] Busca full-text
- [ ] Internacionalização (i18n)
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## [Planejado para 2.0.0]

### A Adicionar
- [ ] App Mobile (React Native)
- [ ] Integração com Open Banking
- [ ] Integração contábil
- [ ] API pública com documentação Swagger
- [ ] Sistema de webhooks
- [ ] Módulo de inventário
- [ ] Módulo de RH (folha de pagamento)
- [ ] Dashboard personalizado por usuário

---

## Legendas

- `Adicionado` para novas funcionalidades
- `Alterado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correção de bugs
- `Segurança` para vulnerabilidades corrigidas
