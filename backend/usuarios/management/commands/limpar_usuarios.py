from django.core.management.base import BaseCommand
from usuarios.models import Usuario
from empresas.models import Empresa


class Command(BaseCommand):
    help = 'Limpa todos os usuarios e cria 3 usuarios de exemplo (voce deve criar o Admin Chefe manualmente)'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando limpeza de usuarios...')

        # Deletar todos os usuarios existentes
        count = Usuario.objects.all().count()
        Usuario.objects.all().delete()
        self.stdout.write(self.style.WARNING(f'{count} usuarios deletados.'))

        # Verificar se existe empresa, se nao existir criar uma de exemplo
        empresa = Empresa.objects.first()
        if not empresa:
            empresa = Empresa.objects.create(
                nome='Empresa Exemplo',
                razao_social='Empresa Exemplo LTDA',
                cnpj='12345678000190',
                email='contato@empresaexemplo.com',
                telefone='11999999999',
                endereco='Rua Exemplo, 123',
                cidade='Sao Paulo',
                estado='SP',
                cep='01310100',
                ativa=True
            )
            self.stdout.write(self.style.SUCCESS(f'Empresa de exemplo criada: {empresa.nome}'))
        else:
            self.stdout.write(f'Usando empresa existente: {empresa.nome}')

        # Criar 3 usuarios de exemplo (sem Admin Chefe - o usuario vai criar manualmente)
        usuarios_exemplo = [
            {
                'email': 'admin@empresa.com',
                'first_name': 'Admin',
                'last_name': 'Empresa',
                'tipo_usuario': 'ADMIN_EMPRESA',
                'empresa': empresa,
                'telefone': '11988888888',
                'password': 'admin123'
            },
            {
                'email': 'usuario1@empresa.com',
                'first_name': 'Usuario',
                'last_name': 'Um',
                'tipo_usuario': 'USUARIO_EMPRESA',
                'empresa': empresa,
                'telefone': '11977777777',
                'password': 'usuario123'
            },
            {
                'email': 'usuario2@empresa.com',
                'first_name': 'Usuario',
                'last_name': 'Dois',
                'tipo_usuario': 'USUARIO_EMPRESA',
                'empresa': empresa,
                'telefone': '11966666666',
                'password': 'usuario123'
            },
        ]

        for dados in usuarios_exemplo:
            password = dados.pop('password')
            usuario = Usuario.objects.create(**dados)
            usuario.set_password(password)
            usuario.save()
            self.stdout.write(self.style.SUCCESS(
                f'Usuario criado: {usuario.email} ({usuario.tipo_usuario}) - Senha: {password if usuario.tipo_usuario != "ADMIN_EMPRESA" else "admin123"}'
            ))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('LIMPEZA CONCLUIDA!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')
        self.stdout.write('Usuarios criados:')
        self.stdout.write('  1. admin@empresa.com (ADMIN_EMPRESA) - Senha: admin123')
        self.stdout.write('  2. usuario1@empresa.com (USUARIO_EMPRESA) - Senha: usuario123')
        self.stdout.write('  3. usuario2@empresa.com (USUARIO_EMPRESA) - Senha: usuario123')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('IMPORTANTE: Para criar o Admin Chefe, execute:'))
        self.stdout.write(self.style.WARNING('  python manage.py createsuperuser'))
        self.stdout.write('')
