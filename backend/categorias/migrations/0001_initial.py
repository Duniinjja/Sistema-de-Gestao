# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Categoria',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100, verbose_name='Nome')),
                ('descricao', models.TextField(blank=True, verbose_name='Descrição')),
                ('tipo', models.CharField(choices=[('DESPESA', 'Despesa'), ('RECEITA', 'Receita')], default='DESPESA', max_length=10, verbose_name='Tipo')),
                ('ativa', models.BooleanField(default=True, verbose_name='Ativa')),
                ('cor', models.CharField(default='#1976d2', help_text='Cor em hexadecimal (ex: #1976d2)', max_length=7, verbose_name='Cor')),
                ('icone', models.CharField(blank=True, help_text='Nome do ícone Material Icons (ex: shopping_cart)', max_length=50, verbose_name='Ícone')),
                ('ordem', models.PositiveIntegerField(default=0, verbose_name='Ordem de exibição')),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('atualizado_em', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Categoria',
                'verbose_name_plural': 'Categorias',
                'ordering': ['ordem', 'nome'],
            },
        ),
    ]
