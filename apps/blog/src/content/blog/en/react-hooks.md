---
title: 'React Hooks: Practical Guide'
description: 'Master React Hooks with practical examples'
pubDate: 2024-11-11
lang: 'en'
permalink: 'react-hooks'
alternates:
  pt: 'react-hooks'
  es: 'react-hooks'
heroImage: '../../../assets/blog-placeholder-3.jpg'
category: 'development'
tags: ['react', 'javascript', 'hooks', 'frontend']
---

# React Hooks: Practical Guide

Hooks revolutionized how we write React components. Introduced in React 16.8, they allow you to use state and other React features without writing classes. This made code more reusable, testable, and easier to understand.
> **Note:** To make the most of Hooks, it's essential to have a solid foundation in the language. If you need to review concepts like destructuring or arrow functions, check out our [Complete JavaScript Guide](/en/blog/javascript-guide).

In this guide, we'll explore the main hooks and how to use them effectively in your projects.

## Main Hooks

### useState
Manages state in functional components. It's the most fundamental and versatile hook.

```javascript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

You can use multiple `useState` in a component. Each one maintains its own independent state.

### useEffect
Executes side effects like data fetching, subscriptions, and DOM manipulation.

```javascript
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);

// No dependencies - runs after every render
useEffect(() => {
  console.log('Component rendered');
});

// Empty array - runs only once
useEffect(() => {
  console.log('Component mounted');
}, []);
```

### useContext
Accesses context without prop drilling, avoiding passing props through multiple levels.

```javascript
const theme = useContext(ThemeContext);
const user = useContext(UserContext);
```

### useReducer
For more complex state, `useReducer` is more appropriate than `useState`.

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### useCallback
Memoizes a function to avoid unnecessary re-renders in child components.

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### useMemo
Memoizes a computed value to avoid unnecessary calculations.

```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);
```

### useRef
Creates a mutable reference that persists between renders.

```javascript
const inputRef = useRef(null);
const countRef = useRef(0);
```

## Best Practices

When working with hooks, follow these recommendations:

1. **Always use Hooks at the top of the component** - Don't use inside conditionals or loops
2. **Don't use Hooks inside conditionals** - This can break the order of hooks
3. **Create custom Hooks for reusable logic** - Extract common logic into custom hooks
4. **Use the ESLint plugin** - `eslint-plugin-react-hooks` helps avoid common mistakes
5. **Optimize dependencies** - Include all dependencies in the dependency array

## Custom Hooks

You can create your own hooks to reuse logic:

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

## Common Patterns

Here are some useful patterns with hooks:

- **Data fetching** - Use `useEffect` with `useState` to manage loading and errors
- **Forms** - Combine `useState` with `useCallback` for efficient handlers
- **Authentication** - Use `useContext` with `useReducer` to manage global state
- **Pagination** - Combine `useState` with `useEffect` to load data

## Migration from Classes to Hooks

If you have class components, you can migrate them to hooks:

- `componentDidMount` → `useEffect` with empty array
- `componentDidUpdate` → `useEffect` with dependencies
- `componentWillUnmount` → Cleanup function in `useEffect`
- `this.state` → `useState`
- `this.setState` → Setter from `useState`

## Conclusion

Hooks make your code cleaner, easier to maintain, and reusable. Mastering hooks is essential for modern React development. Practice creating components with different hooks and explore the official documentation to learn more.

---

## Complete Example: Component with Multiple Hooks

```javascript
import { useState, useEffect, useContext, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useContext(ThemeContext);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        setTodos(data);
        setLoading(false);
      });
  }, []);

  // Add todo
  const addTodo = useCallback(() => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  }, [input, todos]);

  return (
    <div style={{ background: theme.bg, color: theme.text }}>
      <h1>My Todos</h1>
      {loading ? <p>Loading...</p> : <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
    </div>
  );
}
```

## Comparison: Hooks vs Classes

| Aspect | Hooks | Classes |
|--------|-------|---------|
| **Syntax** | More concise | More verbose |
| **Reusability** | Easy with custom hooks | Difficult, requires HOC |
| **Performance** | Optimizable with useMemo | Less control |
| **Learning** | Moderate curve | More concepts |

## Pro Tip

> "Hooks aren't just a different way to write React. They fundamentally change how you think about components." - Dan Abramov

## Hooks Mastery Checklist

- [ ] Understand useState and useEffect
- [ ] Master useContext
- [ ] Learn useReducer
- [ ] Optimize with useCallback and useMemo
- [ ] Create custom hooks
- [ ] Debug with React DevTools
- [ ] Implement in a real project

## Common Mistakes to Avoid

- ~~Use hooks inside conditionals~~ → Always at the top
- ~~Forget dependencies~~ → Include all dependencies
- ~~Create too many states~~ → Use useReducer for complex state
- ~~Don't memoize callbacks~~ → Use useCallback when needed

## Recommended Tools

Check out these tools to improve your development:

- [React DevTools](https://react-devtools-tutorial.vercel.app)
- [ESLint React Hooks Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [Storybook](https://storybook.js.org)

## Component with Hooks Structure

```
ComponentWithHooks.jsx
├── Imports
├── Custom Hooks
├── useState declarations
├── useEffect declarations
├── useCallback declarations
├── Render logic
└── Export
```

## Additional Resources

To deepen your knowledge[^1], check out:

- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [Custom Hooks Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React Hooks Best Practices](https://www.patterns.dev/posts/react-hooks)

[^1]: The official React documentation is always the best source
[^2]: There are many patterns and practices you can learn

---

Now you're ready to master React Hooks!


