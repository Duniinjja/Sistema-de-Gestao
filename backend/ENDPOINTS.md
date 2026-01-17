# Documentação dos Endpoints da API

Esta documentação descreve todos os endpoints REST disponíveis no backend do sistema, organizados por módulo.

## Autenticação JWT

- `POST /api/token/` — Obter token JWT (usuário e senha)
- `POST /api/token/refresh/` — Atualizar token JWT

## Empresas
- `GET /api/empresas/` — Listar empresas
- `POST /api/empresas/` — Criar empresa
- `GET /api/empresas/{id}/` — Detalhar empresa
- `PUT/PATCH /api/empresas/{id}/` — Atualizar empresa
- `DELETE /api/empresas/{id}/` — Remover empresa
- `GET /api/empresas/{id}/dashboard/` — Dashboard da empresa

## Usuários
- `POST /api/usuarios/login/` — Login (JWT customizado)
- `GET /api/usuarios/` — Listar usuários
- `POST /api/usuarios/` — Criar usuário
- `GET /api/usuarios/{id}/` — Detalhar usuário
- `PUT/PATCH /api/usuarios/{id}/` — Atualizar usuário
- `DELETE /api/usuarios/{id}/` — Remover usuário

## Despesas
- `GET /api/despesas/categorias/` — Listar categorias de despesa
- `POST /api/despesas/categorias/` — Criar categoria de despesa
- `GET /api/despesas/categorias/{id}/` — Detalhar categoria de despesa
- `PUT/PATCH /api/despesas/categorias/{id}/` — Atualizar categoria de despesa
- `DELETE /api/despesas/categorias/{id}/` — Remover categoria de despesa
- `GET /api/despesas/` — Listar despesas
- `POST /api/despesas/` — Criar despesa
- `GET /api/despesas/{id}/` — Detalhar despesa
- `PUT/PATCH /api/despesas/{id}/` — Atualizar despesa
- `DELETE /api/despesas/{id}/` — Remover despesa

## Receitas
- `GET /api/receitas/categorias/` — Listar categorias de receita
- `POST /api/receitas/categorias/` — Criar categoria de receita
- `GET /api/receitas/categorias/{id}/` — Detalhar categoria de receita
- `PUT/PATCH /api/receitas/categorias/{id}/` — Atualizar categoria de receita
- `DELETE /api/receitas/categorias/{id}/` — Remover categoria de receita
- `GET /api/receitas/` — Listar receitas
- `POST /api/receitas/` — Criar receita
- `GET /api/receitas/{id}/` — Detalhar receita
- `PUT/PATCH /api/receitas/{id}/` — Atualizar receita
- `DELETE /api/receitas/{id}/` — Remover receita

## Vendas
- `GET /api/vendas/clientes/` — Listar clientes
- `POST /api/vendas/clientes/` — Criar cliente
- `GET /api/vendas/clientes/{id}/` — Detalhar cliente
- `PUT/PATCH /api/vendas/clientes/{id}/` — Atualizar cliente
- `DELETE /api/vendas/clientes/{id}/` — Remover cliente
- `GET /api/vendas/produtos/` — Listar produtos
- `POST /api/vendas/produtos/` — Criar produto
- `GET /api/vendas/produtos/{id}/` — Detalhar produto
- `PUT/PATCH /api/vendas/produtos/{id}/` — Atualizar produto
- `DELETE /api/vendas/produtos/{id}/` — Remover produto
- `GET /api/vendas/` — Listar vendas
- `POST /api/vendas/` — Criar venda
- `GET /api/vendas/{id}/` — Detalhar venda
- `PUT/PATCH /api/vendas/{id}/` — Atualizar venda
- `DELETE /api/vendas/{id}/` — Remover venda

## Relatórios
- `GET /api/relatorios/financeiro/?empresa_id=&data_inicio=&data_fim=` — Relatório financeiro da empresa
- `GET /api/relatorios/consolidado/` — Relatório consolidado

---

Todos os endpoints (exceto login e obtenção de token) requerem autenticação JWT.
Filtros, ordenação e busca estão disponíveis conforme os campos definidos em cada ViewSet.
