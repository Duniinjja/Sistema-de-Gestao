"""
Script para criar dados de exemplo no sistema
Execute: python manage.py shell < criar_dados_exemplo.py
"""

from empresas.models import Empresa
from usuarios.models import Usuario
from despesas.models import CategoriaDespesa, Despesa
from receitas.models import CategoriaReceita, Receita
from vendas.models import Cliente, Produto, Venda, ItemVenda
from datetime import datetime, timedelta
from decimal import Decimal

print("=" * 60)
print("CRIANDO DADOS DE EXEMPLO PARA O SISTEMA")
print("=" * 60)

# 1. CRIAR EMPRESAS
print("\n[1/6] Criando Empresas...")
empresa1, created = Empresa.objects.get_or_create(
    cnpj='12.345.678/0001-90',
    defaults={
        'nome': 'Tech Solutions LTDA',
        'razao_social': 'Tech Solutions Tecnologia LTDA',
        'email': 'contato@techsolutions.com',
        'telefone': '(11) 98765-4321',
        'endereco': 'Av. Paulista, 1000',
        'cidade': 'São Paulo',
        'estado': 'SP',
        'cep': '01310-100',
        'ativa': True
    }
)
print(f"   ✓ {empresa1.nome}")

empresa2, created = Empresa.objects.get_or_create(
    cnpj='98.765.432/0001-10',
    defaults={
        'nome': 'Comércio ABC',
        'razao_social': 'ABC Comércio e Serviços LTDA',
        'email': 'contato@comercioabc.com',
        'telefone': '(21) 99999-8888',
        'endereco': 'Rua das Flores, 500',
        'cidade': 'Rio de Janeiro',
        'estado': 'RJ',
        'cep': '20000-000',
        'ativa': True
    }
)
print(f"   ✓ {empresa2.nome}")

empresa3, created = Empresa.objects.get_or_create(
    cnpj='11.222.333/0001-44',
    defaults={
        'nome': 'Distribuidora XYZ',
        'razao_social': 'XYZ Distribuição e Logística LTDA',
        'email': 'contato@xyz.com',
        'telefone': '(31) 97777-6666',
        'endereco': 'Av. Amazonas, 2000',
        'cidade': 'Belo Horizonte',
        'estado': 'MG',
        'cep': '30000-000',
        'ativa': True
    }
)
print(f"   ✓ {empresa3.nome}")

# 2. CRIAR USUÁRIOS
print("\n[2/6] Criando Usuários...")

# Admin da Tech Solutions
user1, created = Usuario.objects.get_or_create(
    email='admin.tech@techsolutions.com',
    defaults={
        'first_name': 'João',
        'last_name': 'Silva',
        'tipo_usuario': 'ADMIN_EMPRESA',
        'empresa': empresa1,
        'telefone': '(11) 98888-7777',
        'is_active': True
    }
)
if created:
    user1.set_password('senha123')
    user1.save()
print(f"   ✓ {user1.get_full_name()} - {empresa1.nome}")

# Usuário comum da Tech Solutions
user2, created = Usuario.objects.get_or_create(
    email='maria@techsolutions.com',
    defaults={
        'first_name': 'Maria',
        'last_name': 'Santos',
        'tipo_usuario': 'USUARIO_EMPRESA',
        'empresa': empresa1,
        'telefone': '(11) 97777-6666',
        'is_active': True
    }
)
if created:
    user2.set_password('senha123')
    user2.save()
print(f"   ✓ {user2.get_full_name()} - {empresa1.nome}")

# Admin do Comércio ABC
user3, created = Usuario.objects.get_or_create(
    email='admin@comercioabc.com',
    defaults={
        'first_name': 'Pedro',
        'last_name': 'Costa',
        'tipo_usuario': 'ADMIN_EMPRESA',
        'empresa': empresa2,
        'telefone': '(21) 96666-5555',
        'is_active': True
    }
)
if created:
    user3.set_password('senha123')
    user3.save()
print(f"   ✓ {user3.get_full_name()} - {empresa2.nome}")

# 3. CRIAR CATEGORIAS DE DESPESAS E RECEITAS
print("\n[3/6] Criando Categorias...")

categorias_despesas = [
    ('Aluguel', 'Pagamento de aluguel'),
    ('Energia', 'Conta de energia elétrica'),
    ('Internet', 'Serviços de internet'),
    ('Salários', 'Folha de pagamento'),
    ('Material de Escritório', 'Compras de material'),
]

for empresa in [empresa1, empresa2, empresa3]:
    for nome, desc in categorias_despesas:
        CategoriaDespesa.objects.get_or_create(
            nome=nome,
            empresa=empresa,
            defaults={'descricao': desc, 'ativa': True}
        )
print(f"   ✓ {len(categorias_despesas)} categorias de despesa por empresa")

categorias_receitas = [
    ('Vendas', 'Receitas de vendas'),
    ('Serviços', 'Prestação de serviços'),
    ('Investimentos', 'Retorno de investimentos'),
]

for empresa in [empresa1, empresa2, empresa3]:
    for nome, desc in categorias_receitas:
        CategoriaReceita.objects.get_or_create(
            nome=nome,
            empresa=empresa,
            defaults={'descricao': desc, 'ativa': True}
        )
print(f"   ✓ {len(categorias_receitas)} categorias de receita por empresa")

# 4. CRIAR DESPESAS
print("\n[4/6] Criando Despesas...")

hoje = datetime.now().date()
count_despesas = 0

# Despesas da Tech Solutions
cat_aluguel = CategoriaDespesa.objects.filter(nome='Aluguel', empresa=empresa1).first()
cat_energia = CategoriaDespesa.objects.filter(nome='Energia', empresa=empresa1).first()
cat_salarios = CategoriaDespesa.objects.filter(nome='Salários', empresa=empresa1).first()

despesas_tech = [
    ('Aluguel Janeiro 2026', cat_aluguel, 5000.00, hoje + timedelta(days=5), 'PENDENTE'),
    ('Energia Dezembro 2025', cat_energia, 850.00, hoje - timedelta(days=2), 'VENCIDA'),
    ('Salários Janeiro 2026', cat_salarios, 45000.00, hoje + timedelta(days=3), 'PENDENTE'),
    ('Aluguel Dezembro 2025', cat_aluguel, 5000.00, hoje - timedelta(days=30), 'PAGA'),
]

for desc, cat, valor, venc, status in despesas_tech:
    Despesa.objects.get_or_create(
        descricao=desc,
        empresa=empresa1,
        defaults={
            'categoria': cat,
            'valor': Decimal(str(valor)),
            'data_vencimento': venc,
            'status': status,
            'forma_pagamento': 'BOLETO',
            'usuario_cadastro': user1,
            'data_pagamento': hoje if status == 'PAGA' else None
        }
    )
    count_despesas += 1

# Despesas do Comércio ABC
cat_aluguel2 = CategoriaDespesa.objects.filter(nome='Aluguel', empresa=empresa2).first()
cat_energia2 = CategoriaDespesa.objects.filter(nome='Energia', empresa=empresa2).first()

despesas_abc = [
    ('Aluguel Janeiro 2026', cat_aluguel2, 3500.00, hoje + timedelta(days=10), 'PENDENTE'),
    ('Energia Janeiro 2026', cat_energia2, 650.00, hoje + timedelta(days=15), 'PENDENTE'),
    ('Aluguel Dezembro 2025', cat_aluguel2, 3500.00, hoje - timedelta(days=25), 'PAGA'),
]

for desc, cat, valor, venc, status in despesas_abc:
    Despesa.objects.get_or_create(
        descricao=desc,
        empresa=empresa2,
        defaults={
            'categoria': cat,
            'valor': Decimal(str(valor)),
            'data_vencimento': venc,
            'status': status,
            'forma_pagamento': 'PIX',
            'usuario_cadastro': user3,
            'data_pagamento': hoje if status == 'PAGA' else None
        }
    )
    count_despesas += 1

print(f"   ✓ {count_despesas} despesas criadas")

# 5. CRIAR RECEITAS
print("\n[5/6] Criando Receitas...")

cat_vendas = CategoriaReceita.objects.filter(nome='Vendas', empresa=empresa1).first()
cat_servicos = CategoriaReceita.objects.filter(nome='Serviços', empresa=empresa1).first()

count_receitas = 0
receitas = [
    ('Venda de Software - Cliente A', cat_vendas, 15000.00, hoje + timedelta(days=7), 'PREVISTA'),
    ('Consultoria - Cliente B', cat_servicos, 8000.00, hoje - timedelta(days=1), 'ATRASADA'),
    ('Venda de Licenças', cat_vendas, 25000.00, hoje + timedelta(days=30), 'PREVISTA'),
    ('Manutenção Dezembro', cat_servicos, 5000.00, hoje - timedelta(days=20), 'RECEBIDA'),
]

for desc, cat, valor, data_prev, status in receitas:
    Receita.objects.get_or_create(
        descricao=desc,
        empresa=empresa1,
        defaults={
            'categoria': cat,
            'valor': Decimal(str(valor)),
            'data_prevista': data_prev,
            'status': status,
            'forma_recebimento': 'TRANSFERENCIA',
            'usuario_cadastro': user1,
            'data_recebimento': hoje if status == 'RECEBIDA' else None
        }
    )
    count_receitas += 1

print(f"   ✓ {count_receitas} receitas criadas")

# 6. CRIAR CLIENTES, PRODUTOS E VENDAS
print("\n[6/6] Criando Clientes, Produtos e Vendas...")

# Clientes
cliente1, _ = Cliente.objects.get_or_create(
    email='cliente1@email.com',
    empresa=empresa1,
    defaults={
        'nome': 'Empresa Cliente A LTDA',
        'cpf_cnpj': '11.111.111/0001-11',
        'telefone': '(11) 91111-1111',
        'endereco': 'Rua A, 100',
        'cidade': 'São Paulo',
        'estado': 'SP',
        'cep': '01000-000',
        'ativo': True
    }
)

cliente2, _ = Cliente.objects.get_or_create(
    email='cliente2@email.com',
    empresa=empresa1,
    defaults={
        'nome': 'João da Silva',
        'cpf_cnpj': '123.456.789-00',
        'telefone': '(11) 92222-2222',
        'endereco': 'Rua B, 200',
        'cidade': 'São Paulo',
        'estado': 'SP',
        'cep': '02000-000',
        'ativo': True
    }
)
print(f"   ✓ 2 clientes criados")

# Produtos
produto1, _ = Produto.objects.get_or_create(
    codigo='SOFT-001',
    empresa=empresa1,
    defaults={
        'nome': 'Software de Gestão',
        'descricao': 'Sistema completo de gestão empresarial',
        'preco': Decimal('5000.00'),
        'estoque': 100,
        'ativo': True
    }
)

produto2, _ = Produto.objects.get_or_create(
    codigo='CONS-001',
    empresa=empresa1,
    defaults={
        'nome': 'Consultoria 8h',
        'descricao': 'Pacote de consultoria de 8 horas',
        'preco': Decimal('2000.00'),
        'estoque': 50,
        'ativo': True
    }
)

produto3, _ = Produto.objects.get_or_create(
    codigo='LIC-001',
    empresa=empresa1,
    defaults={
        'nome': 'Licença Anual',
        'descricao': 'Licença de uso anual do software',
        'preco': Decimal('1200.00'),
        'estoque': 5,
        'ativo': True
    }
)
print(f"   ✓ 3 produtos criados")

# Vendas
count_vendas = 0

# Venda 1 - Entregue
venda1, created = Venda.objects.get_or_create(
    cliente=cliente1,
    empresa=empresa1,
    data_venda=hoje - timedelta(days=10),
    defaults={
        'status': 'ENTREGUE',
        'forma_pagamento': 'BOLETO',
        'desconto': Decimal('0.00'),
        'observacoes': 'Primeira venda do cliente',
        'usuario_cadastro': user1
    }
)
if created:
    ItemVenda.objects.create(
        venda=venda1,
        produto=produto1,
        quantidade=2,
        preco_unitario=produto1.preco,
        desconto=Decimal('500.00')
    )
    count_vendas += 1

# Venda 2 - Confirmada
venda2, created = Venda.objects.get_or_create(
    cliente=cliente2,
    empresa=empresa1,
    data_venda=hoje - timedelta(days=2),
    defaults={
        'status': 'CONFIRMADA',
        'forma_pagamento': 'PIX',
        'desconto': Decimal('0.00'),
        'observacoes': '',
        'usuario_cadastro': user1
    }
)
if created:
    ItemVenda.objects.create(
        venda=venda2,
        produto=produto2,
        quantidade=4,
        preco_unitario=produto2.preco,
        desconto=Decimal('0.00')
    )
    count_vendas += 1

# Venda 3 - Pendente
venda3, created = Venda.objects.get_or_create(
    cliente=cliente1,
    empresa=empresa1,
    data_venda=hoje,
    defaults={
        'status': 'PENDENTE',
        'forma_pagamento': 'CARTAO_CREDITO',
        'desconto': Decimal('100.00'),
        'observacoes': 'Aguardando confirmação de pagamento',
        'usuario_cadastro': user2
    }
)
if created:
    ItemVenda.objects.create(
        venda=venda3,
        produto=produto3,
        quantidade=10,
        preco_unitario=produto3.preco,
        desconto=Decimal('100.00')
    )
    count_vendas += 1

print(f"   ✓ {count_vendas} vendas criadas")

print("\n" + "=" * 60)
print("RESUMO DA CRIAÇÃO DE DADOS")
print("=" * 60)
print(f"✓ Empresas: {Empresa.objects.count()}")
print(f"✓ Usuários: {Usuario.objects.count()}")
print(f"✓ Categorias de Despesas: {CategoriaDespesa.objects.count()}")
print(f"✓ Categorias de Receitas: {CategoriaReceita.objects.count()}")
print(f"✓ Despesas: {Despesa.objects.count()}")
print(f"✓ Receitas: {Receita.objects.count()}")
print(f"✓ Clientes: {Cliente.objects.count()}")
print(f"✓ Produtos: {Produto.objects.count()}")
print(f"✓ Vendas: {Venda.objects.count()}")
print("=" * 60)
print("\n✅ DADOS DE EXEMPLO CRIADOS COM SUCESSO!")
print("\nAgora você pode:")
print("1. Acessar http://localhost:8000/admin")
print("2. Login: admin@sistema.com / Admin@123")
print("3. Explorar Empresas, Despesas, Receitas, Vendas, etc.")
print("4. Testar os filtros por empresa!")
print("=" * 60)
