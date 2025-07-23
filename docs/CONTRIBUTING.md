# Guia de Contribuição - Timeline Project System

Obrigado por considerar contribuir com o Timeline Project System! Este documento fornece diretrizes para contribuir com o projeto.

## Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Desenvolvimento Local](#desenvolvimento-local)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Documentação](#documentação)

## Código de Conduta

Este projeto adota um código de conduta para garantir um ambiente acolhedor para todos. Por favor:

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas com graça
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## Como Contribuir

### 1. Fork e Clone

```bash
# Fork o projeto no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/timeline-project-system.git
cd timeline-project-system

# Adicione o repositório original como remote
git remote add upstream https://github.com/original/timeline-project-system.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie branch para sua feature
git checkout -b feature/minha-feature
# ou para bugfix
git checkout -b fix/meu-bugfix
```

### 3. Configure o Ambiente

```bash
# Instale dependências
npm install

# Copie variáveis de ambiente
cp .env.example .env.local

# Configure com suas credenciais de desenvolvimento
```

## Reportando Bugs

### Antes de Reportar

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/seu-usuario/timeline-project-system/issues)
2. Verifique se está usando a versão mais recente
3. Confirme que o problema é reproduzível

### Como Reportar

Crie uma issue com:

```markdown
## Descrição do Bug
Descrição clara e concisa do bug.

## Como Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Role até '...'
4. Veja o erro

## Comportamento Esperado
O que deveria acontecer.

## Screenshots
Se aplicável, adicione screenshots.

## Ambiente
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Versão: [ex: 1.0.0]

## Contexto Adicional
Qualquer outra informação relevante.
```

## Sugerindo Melhorias

### Enhancement Request

```markdown
## Descrição da Feature
Descrição clara da feature proposta.

## Motivação
Por que esta feature seria útil?

## Solução Proposta
Como você imagina a implementação?

## Alternativas Consideradas
Outras soluções que você considerou.

## Contexto Adicional
Screenshots, mockups, ou exemplos.
```

## Desenvolvimento Local

### Comandos Essenciais

```bash
# Desenvolvimento
npm run dev           # Inicia servidor de desenvolvimento

# Qualidade de Código
npm run lint          # Verifica linting
npm run format        # Formata código
npm run type-check    # Verifica tipos TypeScript

# Testes
npm test             # Roda testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Relatório de cobertura

# Build
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Estrutura de Branches

- `main` - Branch principal, sempre estável
- `develop` - Branch de desenvolvimento
- `feature/*` - Novas features
- `fix/*` - Correções de bugs
- `docs/*` - Atualizações de documentação
- `refactor/*` - Refatorações de código
- `test/*` - Adição ou correção de testes

## Padrões de Código

### TypeScript/React

```typescript
// ✅ BOM: Componente bem tipado e documentado
/**
 * Card de exibição de projeto
 * @param projeto - Dados do projeto
 * @param onEdit - Callback de edição
 */
interface ProjetoCardProps {
  projeto: Projeto;
  onEdit?: (id: string) => void;
}

export const ProjetoCard: React.FC<ProjetoCardProps> = ({ 
  projeto, 
  onEdit 
}) => {
  // Implementação...
};

// ❌ RUIM: Sem tipos ou documentação
export const ProjetoCard = ({ projeto, onEdit }) => {
  // Implementação...
};
```

### Nomenclatura

```typescript
// Componentes: PascalCase
export const UserProfile = () => {};

// Hooks: camelCase com 'use'
export const useAuth = () => {};

// Utilitários: camelCase
export const formatDate = () => {};

// Constantes: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 10485760;

// Tipos/Interfaces: PascalCase
interface UserData {}
type StatusType = 'active' | 'inactive';
```

### Estrutura de Componentes

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';

// 2. Types/Interfaces
interface ComponentProps {
  user: User;
}

// 3. Componente
export const Component: React.FC<ComponentProps> = ({ user }) => {
  // 4. Hooks
  const [state, setState] = useState(false);
  const { isAdmin } = useAuth();
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    setState(!state);
  };
  
  // 7. Render helpers
  const renderContent = () => {
    return <div>Content</div>;
  };
  
  // 8. Return
  return (
    <div onClick={handleClick}>
      {renderContent()}
    </div>
  );
};
```

### CSS/Tailwind

```tsx
// ✅ BOM: Classes organizadas e legíveis
<div className={`
  flex items-center justify-between
  p-4 rounded-lg border
  ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
  hover:shadow-md transition-shadow
`}>

// ❌ RUIM: Classes desorganizadas
<div className="flex p-4 border-gray-300 items-center hover:shadow-md rounded-lg justify-between transition-shadow">
```

## Processo de Pull Request

### 1. Antes de Abrir PR

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] `npm run lint` passa sem erros
- [ ] `npm run type-check` passa sem erros
- [ ] `npm test` passa sem erros
- [ ] Branch está atualizada com `main`

### 2. Template de PR

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Checklist
- [ ] Código segue style guide
- [ ] Self-review realizado
- [ ] Comentários em código complexo
- [ ] Documentação atualizada
- [ ] Sem warnings novos
- [ ] Testes passando
- [ ] Testes adicionados

## Screenshots
Se aplicável.

## Issues Relacionadas
Closes #123
```

### 3. Review Process

1. **Automated Checks**: CI/CD roda automaticamente
2. **Code Review**: Pelo menos 1 aprovação necessária
3. **Testes**: Todos os testes devem passar
4. **Merge**: Apenas maintainers fazem merge

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Component.tsx   # Componente
│   ├── Component.test.tsx # Testes
│   └── index.ts        # Export
├── contexts/           # React Contexts
├── hooks/             # Custom Hooks
├── lib/               # Configurações externas
├── pages/             # Páginas/Rotas
├── services/          # Serviços externos
├── types/             # TypeScript types
└── utils/             # Funções utilitárias
```

### Adicionando Novo Componente

```bash
# Crie a estrutura
mkdir src/components/MeuComponente
touch src/components/MeuComponente/MeuComponente.tsx
touch src/components/MeuComponente/MeuComponente.test.tsx
touch src/components/MeuComponente/index.ts
```

```typescript
// MeuComponente.tsx
export const MeuComponente: React.FC = () => {
  return <div>Meu Componente</div>;
};

// index.ts
export { MeuComponente } from './MeuComponente';

// MeuComponente.test.tsx
describe('MeuComponente', () => {
  it('should render', () => {
    // teste
  });
});
```

## Testes

### Executando Testes

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage

# Teste específico
npm test Button.test.tsx
```

### Escrevendo Testes

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<Component loading />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
```

### Testes de Integração

```typescript
// Integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';
import { ProjectList } from './ProjectList';

jest.mock('@supabase/supabase-js');

describe('ProjectList Integration', () => {
  it('should load and display projects', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' }
    ];

    createClient.mockReturnValue({
      from: () => ({
        select: () => ({
          data: mockProjects,
          error: null
        })
      })
    });

    render(<ProjectList />);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });
});
```

## Documentação

### Comentários em Código

```typescript
/**
 * Calcula o progresso total do projeto
 * @param timeline - Array de itens da timeline
 * @returns Percentual de conclusão (0-100)
 * @example
 * const progress = calculateProgress(timeline);
 * console.log(`${progress}% concluído`);
 */
export const calculateProgress = (timeline: TimelineItem[]): number => {
  if (!timeline.length) return 0;
  
  const completed = timeline.filter(item => item.status === 'completed').length;
  return Math.round((completed / timeline.length) * 100);
};
```

### Atualizando README

Ao adicionar features, atualize:
- Lista de funcionalidades
- Requisitos se necessário
- Instruções de configuração
- Exemplos de uso

### Documentação de API

Para endpoints novos, atualize `docs/API.md`:
- Endpoint path
- Método HTTP
- Parâmetros
- Response esperado
- Exemplos

## Dicas de Produtividade

### Aliases Úteis

```bash
# .gitconfig
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
```

### VS Code Extensions

- ESLint
- Prettier
- TypeScript Hero
- Tailwind CSS IntelliSense
- GitLens
- Error Lens

### Snippets Úteis

```json
// .vscode/snippets.json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export const ${1:Component}: React.FC<${1:Component}Props> = ({$3}) => {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "};"
    ]
  }
}
```

## Recursos

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library](https://testing-library.com)

## Dúvidas?

- Abra uma [Discussion](https://github.com/seu-usuario/timeline-project-system/discussions)
- Entre em contato via issues
- Email: contribuicao@timeline-project.com

---

Obrigado por contribuir! 🎉