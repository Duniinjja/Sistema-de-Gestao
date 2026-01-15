# Guia Rápido de Início

## Passo a Passo para Começar

### 1. Pré-requisitos

Certifique-se de ter instalado:
- ✅ Python 3.9+ ([Download](https://www.python.org/downloads/))
- ✅ Node.js 16+ ([Download](https://nodejs.org/))
- ✅ MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/))

### 2. Criar Banco de Dados

Abra o MySQL e execute:

```sql
CREATE DATABASE sistema_gestao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Setup Automático

#### Windows
```bash
setup.bat
```

#### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

Siga as instruções na tela.

### 4. Iniciar o Sistema

**Opção 1: Scripts Prontos**

Windows - Abra 2 terminais:
```bash
# Terminal 1
start-backend.bat

# Terminal 2
start-frontend.bat
```

Linux/Mac - Abra 2 terminais:
```bash
# Terminal 1
chmod +x start-backend.sh
./start-backend.sh

# Terminal 2
chmod +x start-frontend.sh
./start-frontend.sh
```

**Opção 2: Manual**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Acessar o Sistema

- Frontend: [http://localhost:3000](http://localhost:3000)
- Admin Django: [http://localhost:8000/admin](http://localhost:8000/admin)

### 6. Primeiro Login

Use as credenciais do superusuário criado durante o setup.

### 7. Configuração Inicial

1. **Criar Primeira Empresa**
   - Acesse Django Admin: `http://localhost:8000/admin`
   - Vá em **Empresas** > **Adicionar**
   - Preencha: Nome, CNPJ, Email, etc.
   - Salve

2. **Criar Usuário da Empresa**
   - No Admin, vá em **Usuários** > **Adicionar**
   - Preencha os dados
   - Tipo de Usuário: **Admin da Empresa**
   - Empresa: Selecione a empresa criada
   - Senha: defina uma senha
   - Salve

3. **Fazer Login no Frontend**
   - Vá para `http://localhost:3000`
   - Login com o usuário da empresa
   - Explore o sistema!

### 8. Configurar Categorias

No frontend, vá em **Cadastros** > **Categorias**:

**Categorias de Despesas:**
- Aluguel
- Energia
- Água
- Internet
- Salários
- Impostos
- Material de Escritório
- Manutenção

**Categorias de Receitas:**
- Vendas
- Serviços
- Investimentos
- Outras Receitas

### 9. Cadastrar Dados

1. **Clientes**
   - Cadastros > Clientes > Novo Cliente

2. **Produtos**
   - Cadastros > Produtos > Novo Produto

3. **Despesas**
   - Despesas > Nova Despesa

4. **Vendas**
   - Vendas > Nova Venda

5. **Receitas**
   - Receitas > Nova Receita

### 10. Gerar Relatórios

- Vá em **Relatórios**
- Selecione o período
- Clique em **Gerar Relatório**

## Funcionalidades por Tipo de Usuário

### Admin Chefe
- ✅ Cria empresas
- ✅ Gerencia todos os usuários
- ✅ Acessa dados de todas as empresas
- ✅ Gera relatórios consolidados

### Admin da Empresa
- ✅ Gerencia usuários da empresa
- ✅ Cadastra despesas, vendas, receitas
- ✅ Cadastra clientes e produtos
- ✅ Gera relatórios da empresa
- ❌ Não acessa outras empresas

### Usuário da Empresa
- ✅ Cadastra despesas, vendas, receitas
- ✅ Visualiza dados da empresa
- ❌ Não gerencia usuários
- ❌ Acesso limitado a cadastros

## Dicas Úteis

### Gerar SECRET_KEY

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Resetar Banco de Dados

```bash
cd backend
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Ver Logs de Erro

Backend:
- Terminal onde está rodando `runserver`

Frontend:
- Console do navegador (F12)

### Criar Backup

```bash
# MySQL
mysqldump -u root -p sistema_gestao > backup.sql

# Restaurar
mysql -u root -p sistema_gestao < backup.sql
```

## Problemas Comuns

### Porta em uso

**Backend (8000):**
```bash
python manage.py runserver 8001
```

**Frontend (3000):**
Edite `vite.config.js` e mude a porta.

### Erro de conexão com MySQL

Verifique:
1. MySQL está rodando?
2. Credenciais corretas no `.env`?
3. Banco de dados foi criado?

### Módulo não encontrado

**Backend:**
```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

## Próximos Passos

1. ✅ Leia o [Manual do Usuário](docs/MANUAL_USUARIO.md)
2. ✅ Explore a [Documentação da API](docs/API.md)
3. ✅ Configure sua empresa
4. ✅ Comece a usar!

## Suporte

Precisa de ajuda? Consulte:
- [Guia de Instalação](docs/INSTALACAO.md)
- [Manual do Usuário](docs/MANUAL_USUARIO.md)
- [Documentação da API](docs/API.md)

---

**Boa sorte! 🚀**
