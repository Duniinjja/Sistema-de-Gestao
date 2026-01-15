# Manual do Usuário - Sistema de Gestão Multiempresas

## Visão Geral

O Sistema de Gestão Multiempresas é uma plataforma web que permite gerenciar múltiplas empresas de forma centralizada, com controle de despesas, vendas, receitas e geração de relatórios.

## Tipos de Usuários

### 1. Admin Chefe (Super Admin)
- Acesso total ao sistema
- Pode criar e gerenciar empresas
- Pode criar usuários para qualquer empresa
- Visualiza relatórios consolidados de todas as empresas
- Acessa dados de todas as empresas

### 2. Admin da Empresa
- Gerencia apenas sua empresa
- Cadastra usuários internos
- Gerencia despesas, vendas e receitas da empresa
- Visualiza relatórios da empresa
- Não tem acesso a outras empresas

### 3. Usuário da Empresa
- Acesso limitado
- Pode visualizar dados conforme permissões
- Pode cadastrar despesas, vendas e receitas
- Visualiza apenas dados da própria empresa

## Funcionalidades

### Dashboard

O Dashboard apresenta uma visão geral da empresa:

- **Receitas do Mês**: Total de receitas recebidas no mês atual
- **Vendas do Mês**: Total de vendas pagas no mês atual
- **Despesas do Mês**: Total de despesas pagas no mês atual
- **Saldo do Mês**: Resultado financeiro (Receitas + Vendas - Despesas)
- **Total de Usuários**: Quantidade de usuários ativos
- **Despesas Pendentes**: Quantidade de despesas não pagas

### Despesas

Controle completo de despesas da empresa.

#### Cadastrar Despesa

1. Clique em **Nova Despesa**
2. Preencha:
   - **Descrição**: Nome da despesa
   - **Categoria**: Selecione uma categoria (ex: Aluguel, Energia, Salários)
   - **Valor**: Valor em R$
   - **Data de Vencimento**: Quando a despesa vence
   - **Forma de Pagamento**: Como será pago
   - **Status**: Pendente, Paga, Vencida ou Cancelada
   - **Observações**: Informações adicionais (opcional)
   - **Anexo**: Comprovante ou nota fiscal (opcional)
3. Clique em **Salvar**

#### Visualizar Despesas

- Lista todas as despesas
- Filtros disponíveis: Categoria, Status, Período
- Cores indicam o status:
  - 🟢 Verde: Paga
  - 🟡 Amarelo: Pendente
  - 🔴 Vermelho: Vencida
  - ⚪ Cinza: Cancelada

### Vendas

Registro de vendas realizadas.

#### Cadastrar Venda

1. Clique em **Nova Venda**
2. Selecione o **Cliente**
3. Informe a **Data da Venda**
4. Adicione **Produtos/Serviços**:
   - Selecione o produto
   - Informe a quantidade
   - O valor será calculado automaticamente
5. Aplique **Desconto** se necessário
6. Escolha a **Forma de Pagamento**
7. Defina o **Status**: Pendente, Paga ou Cancelada
8. Clique em **Salvar**

#### Gerenciar Clientes

No menu **Cadastros** > **Clientes**:
- Cadastre novos clientes
- Mantenha dados atualizados
- CPF/CNPJ, endereço, contatos

#### Gerenciar Produtos

No menu **Cadastros** > **Produtos**:
- Cadastre produtos/serviços
- Defina preços
- Controle estoque

### Receitas

Controle de entradas financeiras além das vendas.

#### Cadastrar Receita

1. Clique em **Nova Receita**
2. Preencha:
   - **Descrição**: Origem da receita
   - **Categoria**: Tipo de receita (ex: Investimentos, Serviços)
   - **Valor**: Valor em R$
   - **Data Prevista**: Quando espera receber
   - **Data de Recebimento**: Quando efetivamente recebeu
   - **Forma de Recebimento**: Como receberá
   - **Status**: Pendente, Recebida ou Cancelada
3. Clique em **Salvar**

### Cadastros

Central de cadastros do sistema.

#### Usuários

**Admin Chefe:**
- Pode cadastrar usuários para qualquer empresa
- Define o tipo de usuário

**Admin da Empresa:**
- Cadastra apenas usuários da própria empresa
- Pode criar Admin da Empresa ou Usuário da Empresa

**Cadastrar Usuário:**
1. Vá em **Cadastros** > **Usuários**
2. Clique em **Novo Usuário**
3. Preencha:
   - Email (será o login)
   - Nome e Sobrenome
   - Tipo de Usuário
   - Empresa
   - Senha
4. Clique em **Salvar**

#### Categorias

Crie categorias para organizar despesas e receitas:

**Categorias de Despesas:**
- Aluguel
- Energia
- Água
- Internet
- Salários
- Impostos
- etc.

**Categorias de Receitas:**
- Vendas
- Serviços
- Investimentos
- Outras receitas
- etc.

### Relatórios

Geração de relatórios financeiros.

#### Relatório Financeiro (Admin Empresa)

1. Vá em **Relatórios**
2. Selecione o **Período** (Data Início e Data Fim)
3. Clique em **Gerar Relatório**

**Informações exibidas:**
- Total de Receitas no período
- Total de Vendas no período
- Total de Despesas no período
- Saldo do período
- Receitas/Despesas pendentes
- Despesas por categoria
- Vendas por mês

#### Relatório Consolidado (Admin Chefe)

Exclusivo para Admin Chefe, mostra dados de todas as empresas:

1. Vá em **Relatórios**
2. Selecione o **Período**
3. Clique em **Gerar Relatório**

**Informações exibidas:**
- Total de empresas
- Total de usuários
- Receitas gerais
- Despesas gerais
- Vendas gerais
- Saldo geral
- Detalhamento por empresa

## Dicas de Uso

### Organização

1. **Configure Categorias Primeiro**
   - Antes de cadastrar despesas/receitas
   - Facilita a organização e relatórios

2. **Cadastre Clientes e Produtos**
   - Mantenha um cadastro completo
   - Agiliza o registro de vendas

3. **Atualize Status Regularmente**
   - Marque despesas como pagas
   - Atualize datas de recebimento
   - Mantém dados precisos

### Segurança

1. **Senhas Fortes**
   - Use senhas complexas
   - Não compartilhe credenciais

2. **Permissões Adequadas**
   - Dê acesso apenas ao necessário
   - Revise usuários periodicamente

3. **Backup Regular**
   - Admin Chefe deve fazer backup do banco de dados
   - Proteja contra perda de dados

### Relatórios Eficientes

1. **Períodos Definidos**
   - Use períodos fechados (mês, trimestre)
   - Facilita comparações

2. **Análise de Categorias**
   - Identifique maiores gastos
   - Otimize recursos

3. **Acompanhamento de Saldo**
   - Monitore saúde financeira
   - Tome decisões baseadas em dados

## Fluxo de Trabalho Recomendado

### Diário
1. Registre despesas do dia
2. Registre vendas realizadas
3. Registre receitas recebidas

### Semanal
1. Revise despesas pendentes
2. Atualize status de pagamentos
3. Verifique vendas da semana

### Mensal
1. Gere relatório financeiro do mês
2. Analise gastos por categoria
3. Compare com meses anteriores
4. Planeje próximo mês

### Admin Chefe - Mensal
1. Gere relatório consolidado
2. Analise performance de cada empresa
3. Identifique tendências
4. Tome decisões estratégicas

## Perguntas Frequentes

### Como trocar minha senha?

1. Clique no ícone de usuário (canto superior direito)
2. Selecione **Alterar Senha**
3. Informe senha atual e nova senha
4. Confirme

### Como adicionar uma nova empresa?

Apenas Admin Chefe pode criar empresas:
1. Acesse o Django Admin (`/admin`)
2. Vá em **Empresas** > **Adicionar**
3. Preencha os dados
4. Salve

### Posso deletar uma despesa/venda?

Sim, mas recomendamos usar o status "Cancelada" para manter histórico.

### Como exportar relatórios?

Atualmente, use a função de impressão do navegador ou copie os dados. Futuramente será implementada exportação para Excel/PDF.

### Esqueci minha senha

Entre em contato com:
- Admin da Empresa (se você for usuário)
- Admin Chefe (se você for admin da empresa)

## Suporte

Para dúvidas ou problemas:
1. Consulte este manual
2. Entre em contato com seu administrador
3. Verifique a documentação técnica
