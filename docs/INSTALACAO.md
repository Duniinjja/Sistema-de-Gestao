# Guia de Instalação - Sistema de Gestão Multiempresas

## Requisitos do Sistema

### Software Necessário
- **Python**: 3.9 ou superior
- **Node.js**: 16 ou superior
- **MySQL**: 8.0 ou superior
- **Git**: Para clonar o repositório

## Instalação Passo a Passo

### 1. Configurar o Banco de Dados MySQL

```sql
-- Entre no MySQL
mysql -u root -p

-- Crie o banco de dados
CREATE DATABASE sistema_gestao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crie um usuário (opcional)
CREATE USER 'gestao_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON sistema_gestao.* TO 'gestao_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Configurar o Backend (Django)

```bash
# Navegue até a pasta do backend
cd backend

# Crie um ambiente virtual Python
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Copie o arquivo de ambiente de exemplo
copy .env.example .env   # Windows
# ou
cp .env.example .env     # Linux/Mac

# Edite o arquivo .env com suas configurações
# Use um editor de texto para configurar:
# - SECRET_KEY (gere uma chave secreta única)
# - DB_NAME=sistema_gestao
# - DB_USER=root (ou o usuário que você criou)
# - DB_PASSWORD=sua_senha
# - DB_HOST=localhost
# - DB_PORT=3306
```

#### Gerar SECRET_KEY

```python
# Execute no Python:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Executar Migrações

```bash
# Crie as tabelas no banco de dados
python manage.py makemigrations
python manage.py migrate

# Crie um superusuário (Admin Chefe)
python manage.py createsuperuser
# Será solicitado:
# - Email
# - Nome
# - Sobrenome
# - Senha
```

#### Iniciar o Servidor Backend

```bash
python manage.py runserver
```

O backend estará disponível em: `http://localhost:8000`

### 3. Configurar o Frontend (React)

```bash
# Abra um novo terminal
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## Acessando o Sistema

### Primeiro Acesso

1. Acesse `http://localhost:3000`
2. Faça login com o superusuário criado
3. Como Admin Chefe, você pode:
   - Criar empresas
   - Criar usuários para cada empresa
   - Acessar dados de todas as empresas

### Criando a Primeira Empresa

1. Acesse o Django Admin: `http://localhost:8000/admin`
2. Login com o superusuário
3. Vá em **Empresas** > **Adicionar**
4. Preencha os dados da empresa
5. Salve

### Criando Usuários para a Empresa

1. No Django Admin, vá em **Usuários** > **Adicionar**
2. Preencha:
   - Email
   - Nome e Sobrenome
   - Tipo de Usuário: Admin da Empresa
   - Empresa: Selecione a empresa criada
   - Senha
3. Salve

Agora esse usuário pode fazer login no sistema frontend!

## Solução de Problemas

### Erro de Conexão com MySQL

```bash
# Verifique se o MySQL está rodando
# Windows:
services.msc  # Procure por MySQL

# Linux:
sudo systemctl status mysql

# Verifique as credenciais no arquivo .env
```

### Erro ao Instalar mysqlclient

**Windows:**
```bash
# Baixe o wheel apropriado de:
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient

# Instale o arquivo baixado:
pip install mysqlclient‑xxx.whl
```

**Linux:**
```bash
# Instale as dependências do sistema
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
pip install mysqlclient
```

### Porta já em uso

Se a porta 8000 ou 3000 estiver em uso:

**Backend:**
```bash
python manage.py runserver 8001
```

**Frontend:**
```bash
# Edite vite.config.js e altere a porta
```

## Configuração para Produção

### Backend

```bash
# No arquivo .env, altere:
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com

# Colete arquivos estáticos
python manage.py collectstatic

# Use um servidor WSGI como Gunicorn
pip install gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:8000
```

### Frontend

```bash
# Faça o build
npm run build

# Os arquivos estarão em frontend/dist
# Configure um servidor web (Nginx, Apache) para servir esses arquivos
```

## Próximos Passos

1. Leia o [Manual do Usuário](MANUAL_USUARIO.md)
2. Configure categorias de despesas e receitas
3. Cadastre clientes e produtos
4. Comece a registrar transações
5. Gere relatórios

## Suporte

Para problemas ou dúvidas:
- Verifique a documentação
- Revise os logs de erro
- Certifique-se de que todas as dependências estão instaladas
