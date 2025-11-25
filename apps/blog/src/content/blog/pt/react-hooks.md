---
title: 'React Hooks: Guia Prático'
description: 'Domine os React Hooks com exemplos práticos'
pubDate: 2024-11-11
lang: 'pt'
permalink: 'react-hooks'
alternates:
  en: 'react-hooks'
  es: 'react-hooks'
heroImage: '../../../assets/blog-placeholder-3.jpg'

```javascript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

Você pode usar múltiplos `useState` em um componente. Cada um mantém seu próprio estado independente.

### useEffect
Executa efeitos colaterais como fetching de dados, subscrições e manipulação do DOM.

```javascript
useEffect(() => {
  document.title = `Você clicou ${count} vezes`;
}, [count]);

// Sem dependências - executa após cada render
useEffect(() => {
  console.log('Componente renderizado');
});

// Array vazio - executa apenas uma vez
useEffect(() => {
  console.log('Componente montado');
}, []);
```

### useContext
Acessa o contexto sem prop drilling, evitando passar props através de múltiplos níveis.

```javascript
const theme = useContext(ThemeContext);
const user = useContext(UserContext);
```

### useReducer
Para estado mais complexo, `useReducer` é mais apropriado que `useState`.

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### useCallback
Memoriza uma função para evitar re-renders desnecessários em componentes filhos.

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### useMemo
Memoriza um valor computado para evitar cálculos desnecessários.

```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);
```

### useRef
Cria uma referência mutável que persiste entre renders.

```javascript
const inputRef = useRef(null);
const countRef = useRef(0);
```

## Boas Práticas

Ao trabalhar com hooks, siga estas recomendações:

1. **Sempre use Hooks no topo do componente** - Não use dentro de condicionais ou loops
2. **Não use Hooks dentro de condicionais** - Isso pode quebrar a ordem dos hooks
3. **Crie Hooks customizados para lógica reutilizável** - Extraia lógica comum em hooks personalizados
4. **Use o ESLint plugin** - `eslint-plugin-react-hooks` ajuda a evitar erros comuns
5. **Otimize dependências** - Inclua todas as dependências no array de dependências

## Hooks Customizados

Você pode criar seus próprios hooks para reutilizar lógica:

```javascript
function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  return {
    value,
    setValue,
    bind: {
      value,
      onChange: e => setValue(e.target.value)
    }
  };
}
```

## Padrões Comuns

Aqui estão alguns padrões úteis com hooks:

- **Fetch de dados** - Usar `useEffect` com `useState` para gerenciar loading e erros
- **Formulários** - Combinar `useState` com `useCallback` para handlers eficientes
- **Autenticação** - Usar `useContext` com `useReducer` para gerenciar estado global
- **Paginação** - Combinar `useState` com `useEffect` para carregar dados

## Migração de Classes para Hooks

Se você tem componentes de classe, pode migrá-los para hooks:

- `componentDidMount` → `useEffect` com array vazio
- `componentDidUpdate` → `useEffect` com dependências
- `componentWillUnmount` → Função de limpeza em `useEffect`
- `this.state` → `useState`
- `this.setState` → Setter do `useState`

## Conclusão

Hooks tornam seu código mais limpo, fácil de manter e reutilizável. Dominar hooks é essencial para desenvolvimento React moderno. Pratique criando componentes com diferentes hooks e explore a documentação oficial para aprender mais.

---

## Exemplo Completo: Componente com Múltiplos Hooks

```javascript
import { useState, useEffect, useContext, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useContext(ThemeContext);

  // Fetch inicial
  useEffect(() => {
    setLoading(true);
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        setTodos(data);
        setLoading(false);
      });
  }, []);

  // Adicionar todo
  const addTodo = useCallback(() => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  }, [input, todos]);

  return (
    <div style={{ background: theme.bg, color: theme.text }}>
      <h1>Meus Todos</h1>
      {loading ? <p>Carregando...</p> : <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Adicionar</button>
    </div>
  );
}
```

## Comparação: Hooks vs Classes

| Aspecto | Hooks | Classes |
|--------|-------|---------|
| **Sintaxe** | Mais concisa | Mais verbosa |
| **Reutilização** | Fácil com custom hooks | Difícil, requer HOC |
| **Performance** | Otimizável com useMemo | Menos controle |
| **Aprendizado** | Curva moderada | Mais conceitos |

## Dica Profissional

> "Hooks não são apenas uma forma diferente de escrever React. Eles mudam fundamentalmente como você pensa sobre componentes." - Dan Abramov

## Checklist de Domínio de Hooks

- [ ] Entender useState e useEffect
- [ ] Dominar useContext
- [ ] Aprender useReducer
- [ ] Otimizar com useCallback e useMemo
- [ ] Criar custom hooks
- [ ] Debugar com React DevTools
- [ ] Implementar em um projeto real

## Erros Comuns a Evitar

- ~~Usar hooks dentro de condicionais~~ → Sempre no topo
- ~~Esquecer dependências~~ → Incluir todas as dependências
- ~~Criar muitos estados~~ → Use useReducer para estado complexo
- ~~Não memoizar callbacks~~ → Use useCallback quando necessário

## Ferramentas Recomendadas

Confira estas ferramentas para melhorar seu desenvolvimento:

- [React DevTools](https://react-devtools-tutorial.vercel.app)
- [ESLint React Hooks Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [Storybook](https://storybook.js.org)

## Estrutura de um Componente com Hooks

```
ComponenteComHooks.jsx
├── Imports
├── Custom Hooks
├── useState declarations
├── useEffect declarations
├── useCallback declarations
├── Render logic
└── Export
```

## Recursos Adicionais

Para aprofundar seus conhecimentos[^1], consulte:

- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Custom Hooks Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React Hooks Best Practices](https://www.patterns.dev/posts/react-hooks)

[^1]: A documentação oficial do React é sempre a melhor fonte
[^2]: Existem muitos padrões e práticas que você pode aprender

---

Agora você está pronto para dominar React Hooks!
