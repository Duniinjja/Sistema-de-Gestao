# 🛒 Sistema de Cadastro de Vendas

## ✨ Melhorias Implementadas

### 📋 Resumo

Implementei um sistema completo de cadastro de vendas com tela de listagem e formulário de cadastro/edição, seguindo o mesmo padrão do sistema de despesas.

---

## 🚀 Funcionalidades Implementadas

### 1. **Tela de Listagem de Vendas Aprimorada**

#### Funcionalidades:
- ✅ Botão "Nova Venda" funcional
- ✅ Botões de Editar e Excluir em cada linha
- ✅ Confirmação antes de excluir
- ✅ Atualização automática da lista após ações
- ✅ Tooltips nos botões de ação

#### Colunas Exibidas:
1. ID da Venda
2. Cliente
3. Data da Venda (dd/MM/yyyy)
4. Valor Total (R$)
5. Desconto (R$)
6. Valor Final (R$)
7. Status (chip colorido)
8. **Ações** (Editar e Excluir)

**Arquivo**: `frontend/src/pages/Vendas.jsx`

---

### 2. **Formulário de Cadastro/Edição**

#### Características:
- ✅ Funciona para cadastro e edição
- ✅ Validação de campos obrigatórios
- ✅ Layout responsivo com múltiplas seções
- ✅ Botão "Voltar" para retornar à listagem
- ✅ Feedback visual durante salvamento
- ✅ Mensagens de sucesso/erro
- ✅ **Sistema de adição de produtos (itens)**
- ✅ **Cálculo automático de valores**

**Arquivo**: `frontend/src/pages/VendaForm.jsx` (550+ linhas)

---

## 📝 Seções do Formulário

### 📌 Seção 1: Informações da Venda

#### Campos Obrigatórios:

1. **Cliente** (Select)
   - Carrega clientes do backend
   - Filtrados por empresa

2. **Data da Venda** (Date)
   - Padrão: data atual
   - Formato: YYYY-MM-DD

3. **Status** (Select)
   - Pendente (padrão)
   - Paga
   - Cancelada

4. **Forma de Pagamento** (Select)
   - Dinheiro
   - PIX
   - Cartão de Crédito
   - Cartão de Débito
   - Boleto
   - Transferência

#### Campos Opcionais:

5. **Desconto** (TextField Number)
   - Prefixo "R$"
   - Aceita decimais (step: 0.01)
   - Padrão: 0

6. **Observações** (TextField Multiline)
   - 2 linhas
   - Placeholder: "Informações adicionais sobre a venda"

---

### 🛍️ Seção 2: Adicionar Produtos

#### Interface de Adição:
- **Produto** (Select) - Dropdown com produtos disponíveis
- **Quantidade** (Number) - Quantidade desejada
- **Preço Unitário** (Number) - Preenchido automaticamente ao selecionar produto
- **Botão Adicionar** - Adiciona item à lista

#### Funcionalidade Inteligente:
```javascript
// Ao selecionar produto, preenche preço automaticamente
if (name === 'produto') {
  const produto = produtos.find((p) => p.id === parseInt(value));
  if (produto) {
    setNovoItem((prev) => ({
      ...prev,
      preco_unitario: produto.preco_venda || '',
    }));
  }
}
```

---

### 📦 Seção 3: Itens da Venda

#### Tabela de Itens:
- Lista todos os produtos adicionados
- Colunas: Produto | Quantidade | Preço Unit. | Subtotal | Ações
- Botão de excluir para cada item
- Cálculo automático de subtotal por item

#### Painel de Totais:
```
Subtotal:  R$ 1.500,00
Desconto:  R$   100,00
─────────────────────────
Total:     R$ 1.400,00
```

**Cálculo Automático**:
```javascript
const calcularTotal = () => {
  const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const desconto = parseFloat(formData.desconto) || 0;
  return {
    subtotal,
    desconto,
    total: subtotal - desconto,
  };
};
```

---

## 🔄 Fluxo de Uso

### Cadastrar Nova Venda:

1. Acesse "Vendas" no menu
2. Clique em "Nova Venda"
3. **Preencha informações básicas:**
   - Selecione o cliente
   - Defina data, status e forma de pagamento
   - Adicione desconto se necessário
4. **Adicione produtos:**
   - Selecione um produto
   - Defina quantidade
   - Ajuste preço se necessário
   - Clique em "Adicionar"
   - Repita para cada produto
5. **Revise os totais** calculados automaticamente
6. Clique em "Salvar"
7. Venda é criada e você retorna à listagem

### Editar Venda:

1. Na listagem, clique no ícone de lápis (Editar)
2. Formulário abre com dados preenchidos
3. Modifique informações ou itens
4. Clique em "Salvar"
5. Retorna para a listagem

### Excluir Venda:

1. Na listagem, clique no ícone de lixeira
2. Confirme a exclusão
3. Venda é excluída
4. Lista atualiza automaticamente

---

## 🎯 Validações Implementadas

### Validação de Formulário:

```javascript
// Cliente obrigatório
if (!formData.cliente) {
  toast.error('Cliente é obrigatório');
  return;
}

// Data obrigatória
if (!formData.data_venda) {
  toast.error('Data da venda é obrigatória');
  return;
}

// Pelo menos um item
if (itens.length === 0) {
  toast.error('Adicione pelo menos um item à venda');
  return;
}
```

### Validação de Itens:

```javascript
// Produto selecionado
if (!novoItem.produto) {
  toast.error('Selecione um produto');
  return;
}

// Quantidade válida
if (!novoItem.quantidade || parseFloat(novoItem.quantidade) <= 0) {
  toast.error('Quantidade deve ser maior que zero');
  return;
}

// Preço válido
if (!novoItem.preco_unitario || parseFloat(novoItem.preco_unitario) <= 0) {
  toast.error('Preço deve ser maior que zero');
  return;
}
```

---

## 📊 Estrutura de Dados

### Dados da Venda Enviados ao Backend:

```javascript
{
  // Informações básicas
  cliente: 1,                    // ID do cliente
  data_venda: "2026-01-15",
  status: "PAGA",
  forma_pagamento: "PIX",
  observacoes: "Venda à vista",

  // Valores calculados
  valor_total: 1500.00,          // Soma dos itens
  desconto: 100.00,
  valor_final: 1400.00,          // Total - Desconto

  // Relacionamentos
  empresa: user.empresa_id,      // Adicionado automaticamente
  usuario_cadastro: user.id,     // Adicionado automaticamente

  // Itens da venda
  itens: [
    {
      produto: 5,                // ID do produto
      quantidade: 2,
      preco_unitario: 500.00
    },
    {
      produto: 8,
      quantidade: 1,
      preco_unitario: 500.00
    }
  ]
}
```

---

## 🎨 Design e UX

### Componentes Utilizados:
- **Material-UI v5.14.20**
- Grid system para layout responsivo
- Paper com elevação para seções
- Table para lista de itens
- TextField para inputs
- Select para dropdowns
- IconButton para ações
- Tooltip para dicas visuais
- Divider para separadores
- CircularProgress para loading

### Cores dos Status:
- **PAGA**: Verde (success)
- **PENDENTE**: Laranja (warning)
- **CANCELADA**: Vermelho (error)

### Layout do Formulário:

```
┌──────────────────────────────────────────────┐
│ [← Voltar]  Nova Venda                       │
├──────────────────────────────────────────────┤
│                                              │
│  📋 Informações da Venda                     │
│  ┌────────────┬────────────┐                │
│  │ Cliente    │ Data       │                │
│  ├────────────┼────────────┤                │
│  │ Status     │ Forma Pgto │  Desconto      │
│  ├────────────────────────────┤             │
│  │ Observações                │             │
│  └────────────────────────────┘             │
│                                              │
│  🛍️ Adicionar Produtos                       │
│  ┌────────┬─────┬────────┬─────────┐        │
│  │Produto │ Qtd │ Preço  │[Adicionar]       │
│  └────────┴─────┴────────┴─────────┘        │
│                                              │
│  📦 Itens da Venda                           │
│  ┌────────────────────────────────┐         │
│  │ Produto    │Qtd│Preço│Total│❌ │         │
│  ├────────────────────────────────┤         │
│  │ Item 1...                      │         │
│  │ Item 2...                      │         │
│  ├────────────────────────────────┤         │
│  │           Subtotal: R$ 1500,00 │         │
│  │           Desconto: R$  100,00 │         │
│  │              Total: R$ 1400,00 │         │
│  └────────────────────────────────┘         │
│                                              │
│              [Cancelar] [Salvar]             │
└──────────────────────────────────────────────┘
```

---

## 🔌 Integração com API

### Funções Utilizadas:

```javascript
// Vendas
getVendas(params)        // Listar vendas
getVenda(id)             // Buscar uma venda
createVenda(data)        // Criar nova
updateVenda(id, data)    // Atualizar existente
deleteVenda(id)          // Excluir

// Dados auxiliares
getClientes(params)      // Buscar clientes
getProdutos(params)      // Buscar produtos
```

**Todas já existentes em**: `frontend/src/services/api.js`

---

## 🎯 Rotas Configuradas

### Novas Rotas:
```jsx
<Route path="vendas" element={<Vendas />} />
<Route path="vendas/nova" element={<VendaForm />} />
<Route path="vendas/editar/:id" element={<VendaForm />} />
```

### Navegação:
- `/vendas` → Lista de vendas
- `/vendas/nova` → Cadastro de nova venda
- `/vendas/editar/:id` → Edição de venda existente

**Arquivo**: `frontend/src/App.jsx`

---

## 📱 Comportamento Mobile

### Desktop (> 960px):
- Formulário com 2-4 colunas conforme seção
- Tabela completa de itens
- Sidebar permanente

### Tablet (600px - 960px):
- Formulário com 2 colunas
- Tabela responsiva

### Mobile (< 600px):
- Formulário com 1 coluna
- Campos em largura total
- Tabela com scroll horizontal
- Sidebar modal (hamburger menu)

---

## ✨ Destaques Técnicos

### 1. **Preenchimento Automático de Preço**
Ao selecionar um produto, o preço é automaticamente preenchido com o preço de venda cadastrado.

### 2. **Cálculo Dinâmico**
Todos os valores são calculados em tempo real:
- Subtotal por item (qtd × preço)
- Subtotal geral (soma dos itens)
- Total final (subtotal - desconto)

### 3. **Gerenciamento de Estado**
```javascript
const [formData, setFormData] = useState({...});  // Dados da venda
const [itens, setItens] = useState([]);           // Lista de produtos
const [novoItem, setNovoItem] = useState({...});  // Item sendo adicionado
```

### 4. **Validações em Múltiplas Camadas**
- Validação ao adicionar item
- Validação ao salvar venda
- Feedback imediato com toast

### 5. **UX Otimizada**
- Loading states durante operações
- Desabilitar botões durante salvamento
- Confirmações antes de ações destrutivas
- Mensagens claras de erro/sucesso

---

## 📂 Arquivos Modificados/Criados

### Criados:
- ✅ `frontend/src/pages/VendaForm.jsx` (550+ linhas)

### Modificados:
- ✅ `frontend/src/pages/Vendas.jsx`
  - Adicionado useNavigate
  - Adicionado botões de ação (Editar/Excluir)
  - Adicionado função handleDelete
  - Botão "Nova Venda" funcional
  - Coluna "Ações" na tabela

- ✅ `frontend/src/App.jsx`
  - Import VendaForm
  - Rotas /vendas/nova e /vendas/editar/:id

### Não modificados:
- ✅ `frontend/src/services/api.js` (todas as funções já existiam)

---

## 🆚 Comparação: Vendas vs Despesas

### Semelhanças:
- Estrutura de formulário similar
- Botões de ação (Editar/Excluir)
- Validações de campos
- Feedback visual
- Navegação entre páginas

### Diferenças Principais:

| Recurso | Despesas | Vendas |
|---------|----------|--------|
| **Complexidade** | Formulário simples | Formulário com itens |
| **Campos** | 8 campos | 6 campos + tabela de itens |
| **Cálculos** | Apenas valor | Subtotal, desconto, total |
| **Seções** | 1 seção | 3 seções |
| **Tabela interna** | Não | Sim (itens) |
| **Adição dinâmica** | Não | Sim (produtos) |

---

## 🎯 Próximos Passos Sugeridos

### Para Vendas:

1. **Controle de Estoque**
   - Validar quantidade disponível
   - Atualizar estoque ao confirmar venda
   - Alertas de estoque baixo

2. **Busca e Filtros**
   - Filtrar por cliente
   - Filtrar por período
   - Filtrar por status
   - Buscar por ID

3. **Impressão**
   - Gerar nota de venda
   - Cupom fiscal
   - Exportar PDF

4. **Parcelas**
   - Opção de venda parcelada
   - Controle de parcelas
   - Data de vencimento por parcela

5. **Visualização Detalhada**
   - Modal com detalhes completos da venda
   - Histórico de alterações
   - Observações adicionais

6. **Relatórios**
   - Vendas por período
   - Vendas por cliente
   - Produtos mais vendidos
   - Comissões

---

## 🎉 Conclusão

Sistema de vendas completo e funcional, seguindo o padrão estabelecido no cadastro de despesas, mas com funcionalidades avançadas de gerenciamento de itens e cálculos automáticos!

**Principais Conquistas:**
✅ Cadastro completo de vendas
✅ Gerenciamento de itens/produtos
✅ Cálculos automáticos
✅ Interface intuitiva
✅ Validações robustas
✅ Design responsivo
✅ Padrão consistente com despesas

---

**🎉 Sistema de vendas pronto para uso!**

*Desenvolvido com React 18.2.0 + Material-UI 5.14.20 + React Router DOM*
