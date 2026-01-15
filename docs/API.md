# Documentação da API - Sistema de Gestão Multiempresas

## Base URL

```
http://localhost:8000/api
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação.

### Obter Token

```http
POST /api/token/
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "first_name": "João",
    "last_name": "Silva",
    "tipo_usuario": "ADMIN_EMPRESA",
    "empresa_id": 1,
    "empresa_nome": "Empresa Exemplo"
  }
}
```

### Renovar Token

```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Usar Token

Inclua o token no header de todas as requisições:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## Endpoints

### Empresas

#### Listar Empresas
```http
GET /api/empresas/
```

#### Obter Empresa
```http
GET /api/empresas/{id}/
```

#### Criar Empresa (Admin Chefe apenas)
```http
POST /api/empresas/
Content-Type: application/json

{
  "nome": "Empresa Exemplo",
  "razao_social": "Empresa Exemplo Ltda",
  "cnpj": "12345678000190",
  "email": "contato@empresa.com",
  "telefone": "11999999999",
  "endereco": "Rua Exemplo, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567"
}
```

#### Dashboard da Empresa
```http
GET /api/empresas/{id}/dashboard/
```

### Usuários

#### Listar Usuários
```http
GET /api/usuarios/
```

#### Criar Usuário
```http
POST /api/usuarios/
Content-Type: application/json

{
  "email": "novo@usuario.com",
  "password": "senha123",
  "password_confirm": "senha123",
  "first_name": "João",
  "last_name": "Silva",
  "tipo_usuario": "USUARIO_EMPRESA",
  "empresa": 1,
  "telefone": "11999999999"
}
```

#### Usuário Atual
```http
GET /api/usuarios/me/
```

#### Trocar Senha
```http
POST /api/usuarios/{id}/change_password/
Content-Type: application/json

{
  "old_password": "senha_antiga",
  "new_password": "senha_nova"
}
```

### Despesas

#### Listar Despesas
```http
GET /api/despesas/
GET /api/despesas/?empresa=1
GET /api/despesas/?status=PENDENTE
GET /api/despesas/?data_vencimento=2024-01-01
```

#### Criar Despesa
```http
POST /api/despesas/
Content-Type: application/json

{
  "empresa": 1,
  "categoria": 1,
  "descricao": "Aluguel Janeiro",
  "valor": "1500.00",
  "data_vencimento": "2024-01-10",
  "forma_pagamento": "TRANSFERENCIA",
  "status": "PENDENTE",
  "observacoes": "Referente ao mês de janeiro"
}
```

#### Categorias de Despesas
```http
GET /api/despesas/categorias/
POST /api/despesas/categorias/

{
  "empresa": 1,
  "nome": "Aluguel",
  "descricao": "Despesas com aluguel",
  "ativa": true
}
```

### Vendas

#### Listar Vendas
```http
GET /api/vendas/
GET /api/vendas/?empresa=1
GET /api/vendas/?cliente=1
GET /api/vendas/?status=PAGA
```

#### Criar Venda
```http
POST /api/vendas/
Content-Type: application/json

{
  "empresa": 1,
  "cliente": 1,
  "data_venda": "2024-01-15",
  "desconto": "0.00",
  "forma_pagamento": "PIX",
  "status": "PAGA",
  "itens": [
    {
      "produto": 1,
      "quantidade": 2,
      "preco_unitario": "100.00"
    },
    {
      "produto": 2,
      "quantidade": 1,
      "preco_unitario": "50.00"
    }
  ]
}
```

#### Clientes
```http
GET /api/vendas/clientes/
POST /api/vendas/clientes/

{
  "empresa": 1,
  "nome": "Cliente Exemplo",
  "email": "cliente@exemplo.com",
  "telefone": "11999999999",
  "cpf_cnpj": "12345678900",
  "endereco": "Rua Exemplo, 456",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

#### Produtos
```http
GET /api/vendas/produtos/
POST /api/vendas/produtos/

{
  "empresa": 1,
  "nome": "Produto Exemplo",
  "descricao": "Descrição do produto",
  "codigo": "PROD001",
  "preco": "100.00",
  "estoque": 50
}
```

### Receitas

#### Listar Receitas
```http
GET /api/receitas/
GET /api/receitas/?empresa=1
GET /api/receitas/?status=RECEBIDA
```

#### Criar Receita
```http
POST /api/receitas/
Content-Type: application/json

{
  "empresa": 1,
  "categoria": 1,
  "descricao": "Receita de Serviços",
  "valor": "2000.00",
  "data_prevista": "2024-01-20",
  "forma_recebimento": "PIX",
  "status": "PENDENTE"
}
```

#### Categorias de Receitas
```http
GET /api/receitas/categorias/
POST /api/receitas/categorias/

{
  "empresa": 1,
  "nome": "Serviços",
  "descricao": "Receitas de serviços prestados",
  "ativa": true
}
```

### Relatórios

#### Relatório Financeiro
```http
GET /api/relatorios/financeiro/?empresa_id=1&data_inicio=2024-01-01&data_fim=2024-01-31
```

**Resposta:**
```json
{
  "empresa": {
    "id": 1,
    "nome": "Empresa Exemplo"
  },
  "periodo": {
    "data_inicio": "2024-01-01",
    "data_fim": "2024-01-31"
  },
  "resumo": {
    "total_despesas": 5000.00,
    "total_despesas_pendentes": 1000.00,
    "total_vendas": 8000.00,
    "total_vendas_pendentes": 500.00,
    "total_receitas": 2000.00,
    "total_receitas_pendentes": 300.00,
    "saldo": 5000.00
  },
  "despesas_por_categoria": [...],
  "vendas_por_mes": [...]
}
```

#### Relatório Consolidado (Admin Chefe apenas)
```http
GET /api/relatorios/consolidado/?data_inicio=2024-01-01&data_fim=2024-01-31
```

## Filtros e Paginação

### Filtros

Todos os endpoints de listagem suportam filtros via query parameters:

```http
GET /api/despesas/?empresa=1&status=PENDENTE&categoria=2
GET /api/vendas/?cliente=1&data_venda__gte=2024-01-01
```

### Busca

```http
GET /api/usuarios/?search=joao
GET /api/despesas/?search=aluguel
```

### Ordenação

```http
GET /api/despesas/?ordering=-data_vencimento
GET /api/vendas/?ordering=valor_total
```

### Paginação

```http
GET /api/despesas/?page=2&page_size=20
```

**Resposta:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/despesas/?page=3",
  "previous": "http://localhost:8000/api/despesas/?page=1",
  "results": [...]
}
```

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro no servidor

## Erros

Formato de resposta de erro:

```json
{
  "detail": "Mensagem de erro",
  "field_name": ["Erro específico do campo"]
}
```

## Permissões

### Multi-Tenant

O sistema automaticamente filtra dados com base na empresa do usuário:

- **Admin Chefe**: Acesso a todas as empresas
- **Admin Empresa**: Acesso apenas à própria empresa
- **Usuário Empresa**: Acesso apenas à própria empresa

### Exemplo de Uso com cURL

```bash
# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@exemplo.com", "password": "senha123"}'

# Usar token
curl -X GET http://localhost:8000/api/despesas/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."

# Criar despesa
curl -X POST http://localhost:8000/api/despesas/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "empresa": 1,
    "categoria": 1,
    "descricao": "Aluguel",
    "valor": "1500.00",
    "data_vencimento": "2024-01-10",
    "forma_pagamento": "TRANSFERENCIA",
    "status": "PENDENTE"
  }'
```
