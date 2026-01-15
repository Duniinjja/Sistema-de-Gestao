# Guia de Contribuição

Obrigado por considerar contribuir com o Sistema de Gestão Multiempresas! 🎉

## Como Contribuir

### Reportando Bugs

Antes de reportar um bug, verifique se já não existe uma issue aberta. Se não existir:

1. Crie uma nova issue
2. Use um título claro e descritivo
3. Descreva os passos para reproduzir o problema
4. Explique o comportamento esperado vs. o comportamento atual
5. Inclua screenshots se possível
6. Mencione seu ambiente (SO, versão do Python/Node, navegador)

### Sugerindo Melhorias

Sugestões de melhorias são sempre bem-vindas:

1. Verifique se a sugestão já não existe
2. Crie uma issue com a tag "enhancement"
3. Descreva claramente a melhoria
4. Explique por que seria útil
5. Forneça exemplos de uso, se possível

### Pull Requests

#### Processo

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Faça** suas alterações
5. **Teste** suas alterações
6. **Commit** com mensagens descritivas
7. **Push** para sua branch
8. **Abra** um Pull Request

#### Exemplo

```bash
# Fork o repositório no GitHub

# Clone seu fork
git clone https://github.com/seu-usuario/sistema-gestao.git
cd sistema-gestao

# Crie uma branch
git checkout -b feature/minha-feature

# Faça suas alterações
# ...

# Commit
git add .
git commit -m "Add: Descrição da feature"

# Push
git push origin feature/minha-feature

# Abra um PR no GitHub
```

## Padrões de Código

### Python (Backend)

- Siga o [PEP 8](https://pep8.org/)
- Use 4 espaços para indentação
- Máximo 79 caracteres por linha
- Docstrings para classes e funções
- Type hints quando possível

```python
def calcular_total(valores: list[float]) -> float:
    """
    Calcula o total de uma lista de valores.

    Args:
        valores: Lista de valores numéricos

    Returns:
        Soma total dos valores
    """
    return sum(valores)
```

### JavaScript/React (Frontend)

- Use ESLint
- Use 2 espaços para indentação
- Componentes em PascalCase
- Funções em camelCase
- Constantes em UPPER_CASE
- Preferir arrow functions
- Usar hooks ao invés de classes

```javascript
const MinhaComponente = ({ prop1, prop2 }) => {
  const [estado, setEstado] = useState(null);

  const handleClick = () => {
    // ...
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

## Padrões de Commit

Use mensagens de commit descritivas seguindo o padrão:

```
Tipo: Descrição curta

Descrição detalhada (opcional)
```

### Tipos

- `Add`: Adiciona nova funcionalidade
- `Fix`: Corrige um bug
- `Update`: Atualiza funcionalidade existente
- `Remove`: Remove código/funcionalidade
- `Refactor`: Refatoração de código
- `Docs`: Alterações em documentação
- `Style`: Formatação, sem mudança de lógica
- `Test`: Adiciona ou corrige testes
- `Chore`: Tarefas de manutenção

### Exemplos

```
Add: Sistema de notificações por email

Implementa envio de emails para:
- Boas-vindas ao novo usuário
- Recuperação de senha
- Alertas de despesas vencidas
```

```
Fix: Correção no cálculo de saldo mensal

O saldo estava considerando apenas receitas,
agora inclui vendas também.
```

## Estrutura de Branches

- `main`: Branch principal, código em produção
- `develop`: Branch de desenvolvimento
- `feature/nome`: Novas funcionalidades
- `fix/nome`: Correções de bugs
- `hotfix/nome`: Correções urgentes

## Testes

### Backend

```bash
cd backend
python manage.py test
```

### Frontend

```bash
cd frontend
npm test
```

## Revisão de Código

Todo Pull Request passa por revisão:

- ✅ Código segue os padrões
- ✅ Testes passam
- ✅ Documentação atualizada
- ✅ Sem conflitos com main
- ✅ Commit messages claras

## Documentação

Ao adicionar features, atualize:

- README.md
- Documentação relevante em `/docs`
- Docstrings/comentários no código
- CHANGELOG.md

## Ambiente de Desenvolvimento

### Configurar Ambiente

1. Siga o [Guia de Instalação](docs/INSTALACAO.md)
2. Crie um `.env` baseado no `.env.example`
3. Configure um banco de dados de teste

### Ferramentas Úteis

- **VSCode**: Editor recomendado
- **Python Extension**: Para Python
- **ESLint**: Para JavaScript
- **Prettier**: Formatação de código
- **GitLens**: Melhor visualização Git

### Extensões VSCode Recomendadas

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

## Boas Práticas

### Geral

- ✅ Escreva código limpo e legível
- ✅ Teste suas alterações
- ✅ Documente código complexo
- ✅ Siga os padrões do projeto
- ✅ Seja respeitoso nos comentários

### Backend

- ✅ Use migrations para mudanças no banco
- ✅ Valide dados de entrada
- ✅ Trate exceções apropriadamente
- ✅ Use serializers para validação
- ✅ Implemente permissões corretas

### Frontend

- ✅ Componentes pequenos e reutilizáveis
- ✅ Gerenciamento de estado apropriado
- ✅ Evite lógica no JSX
- ✅ Use hooks customizados
- ✅ Trate erros de API

## Segurança

### Ao Contribuir

- ❌ Nunca commite credenciais
- ❌ Nunca commite arquivos `.env`
- ❌ Não exponha dados sensíveis
- ✅ Use variáveis de ambiente
- ✅ Valide todas as entradas
- ✅ Sanitize dados do usuário

### Reportando Vulnerabilidades

Se encontrar uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para: security@sistema-gestao.com
3. Descreva a vulnerabilidade
4. Aguarde nossa resposta

## Código de Conduta

### Nossos Padrões

- ✅ Seja respeitoso e inclusivo
- ✅ Aceite críticas construtivas
- ✅ Foque no melhor para a comunidade
- ❌ Não use linguagem ofensiva
- ❌ Não faça ataques pessoais

### Aplicação

Violações podem resultar em:
- Aviso
- Ban temporário
- Ban permanente

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a [Licença MIT](LICENSE).

## Perguntas?

- 📧 Email: dev@sistema-gestao.com
- 💬 Discussions: Use as Discussions no GitHub
- 📖 Docs: Consulte a [documentação](docs/)

---

**Obrigado por contribuir! 🚀**
