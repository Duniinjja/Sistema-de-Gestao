# 🔍 Guia de Debug - Erros no Frontend

## 🚨 Como Identificar Erros

### 1. **Console do Navegador**
Pressione `F12` ou `Ctrl+Shift+I` para abrir as ferramentas de desenvolvedor.

**Aba Console**: Mostra erros JavaScript
**Aba Network**: Mostra requisições HTTP e respostas

### 2. **Erros Comuns ao Cadastrar Despesas**

#### ❌ Erro: "Erro ao carregar categorias"

**Possíveis Causas:**
1. Backend não está rodando
2. Endpoint não existe
3. Sem categorias cadastradas
4. Usuário sem empresa vinculada

**Como Verificar:**

```bash
# 1. Verificar se o backend está rodando
# Acesse: http://localhost:8000/api/despesas/categorias/
```

**Solução no Django Admin:**
1. Acesse http://localhost:8000/admin/
2. Login: `admin@sistema.com` / `Admin@123`
3. Vá em "Categorias de Despesa"
4. Cadastre pelo menos uma categoria

#### ❌ Erro: "Usuário sem empresa vinculada"

**Causa:** O usuário logado não tem `empresa_id`

**Solução:**
1. Acesse o Django Admin
2. Vá em "Usuários"
3. Edite o usuário
4. Selecione uma empresa
5. Salve

#### ❌ Erro: Network Error ou CORS

**Causa:** Backend não está rodando ou CORS mal configurado

**Solução:**
```bash
# Iniciar backend
cd backend
venv\Scripts\activate  # Windows
python manage.py runserver
```

#### ❌ Erro: "Cannot read property 'id' of undefined"

**Causa:** Dados da categoria ou usuário não estão carregados

**Solução:** Verifique no console se:
```javascript
console.log('User:', user);
console.log('Categorias:', categorias);
```

---

## 🛠️ Melhorias Implementadas

### ✅ Tratamento de Erros Aprimorado

O sistema agora mostra mensagens de erro mais detalhadas:

```javascript
// Antes
toast.error('Erro ao salvar despesa');

// Depois
toast.error('Erro ao salvar despesa: ' + errorMessage);
// Exemplo: "Erro ao salvar despesa: categoria é obrigatório"
```

### ✅ Logs no Console

Adicionados logs para debug:

```javascript
console.log('Dados enviados:', data);
console.error('Erro ao carregar categorias:', error);
```

### ✅ Validação de Usuário

Verifica se o usuário tem empresa antes de salvar:

```javascript
if (!user?.empresa_id) {
  toast.error('Usuário sem empresa vinculada');
  return;
}
```

---

## 📋 Checklist de Troubleshooting

### Antes de cadastrar uma despesa:

- [ ] Backend está rodando? (`http://localhost:8000`)
- [ ] Frontend está rodando? (`http://localhost:3000`)
- [ ] Usuário está logado?
- [ ] Usuário tem empresa vinculada?
- [ ] Existem categorias cadastradas?
- [ ] Console do navegador não mostra erros?

### Como verificar cada item:

#### ✅ Backend rodando
```bash
# Abra o navegador
http://localhost:8000/api/despesas/categorias/

# Deve retornar JSON com categorias
```

#### ✅ Usuário logado
```javascript
// No console do navegador
localStorage.getItem('user')
// Deve retornar dados do usuário
```

#### ✅ Categorias existem
1. Acesse http://localhost:8000/admin/
2. Vá em "Categorias de Despesa"
3. Deve ter pelo menos 1 categoria

---

## 🔧 Comandos Úteis

### Verificar logs do backend
```bash
# Os logs aparecem no terminal onde você rodou:
python manage.py runserver
```

### Limpar cache do navegador
```
Ctrl + Shift + Delete
```

### Recarregar página ignorando cache
```
Ctrl + F5
```

### Ver requisições HTTP
```
F12 → Aba Network → Filtrar por "XHR"
```

---

## 📊 Estrutura de Dados Esperada

### Dados enviados ao criar despesa:

```json
{
  "descricao": "Energia Janeiro 2026",
  "categoria": 1,
  "valor": "650.00",
  "data_vencimento": "2026-01-29",
  "data_pagamento": "",
  "status": "PENDENTE",
  "forma_pagamento": "PIX",
  "observacoes": "",
  "empresa": 1,
  "usuario_cadastro": 1
}
```

### Resposta esperada do endpoint de categorias:

```json
[
  {
    "id": 1,
    "nome": "Energia",
    "descricao": "Contas de energia elétrica",
    "empresa": 1
  },
  {
    "id": 2,
    "nome": "Internet",
    "descricao": "Serviços de internet",
    "empresa": 1
  }
]
```

---

## 🎯 Próximos Passos se o Erro Persistir

1. **Copiar erro completo do console**
   - Pressione F12
   - Vá na aba Console
   - Copie a mensagem de erro completa

2. **Verificar Network**
   - Aba Network
   - Clique na requisição que falhou
   - Veja a resposta (Response)

3. **Testar endpoint direto**
   ```bash
   curl http://localhost:8000/api/despesas/categorias/
   ```

4. **Verificar permissões no backend**
   - O usuário pode acessar categorias?
   - O CORS está configurado?

---

## 📞 Informações do Sistema

**Backend:** Django 5.0
**Frontend:** React 18.2.0
**API Base URL:** http://localhost:8000/api

**Endpoints Importantes:**
- Login: `POST /api/usuarios/login/`
- Categorias: `GET /api/despesas/categorias/`
- Criar Despesa: `POST /api/despesas/`
- Listar Despesas: `GET /api/despesas/`

---

**🎉 Com essas melhorias, os erros agora mostram mensagens mais claras!**
