---
title: 'React Hooks: Guía Práctica'
description: 'Domina los React Hooks con ejemplos prácticos'
pubDate: 2024-11-11
lang: 'es'
slug: 'react-hooks'
alternates:
  pt: 'react-hooks'
  en: 'react-hooks'
heroImage: '../../../assets/blog-placeholder-3.jpg'
category: 'development'
tags: ['react', 'javascript', 'hooks', 'frontend']
---

# React Hooks: Guía Práctica

Los Hooks revolucionaron la forma en que escribimos componentes React. Introducidos en React 16.8, permiten usar estado y otras características de React sin escribir clases. Esto hizo que el código fuera más reutilizable, testeable y fácil de entender. En esta guía, exploraremos los principales hooks y cómo usarlos efectivamente en tus proyectos.

## Principales Hooks

### useState
Gestiona el estado en componentes funcionales. Es el hook más fundamental y versátil.

```javascript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

Puedes usar múltiples `useState` en un componente. Cada uno mantiene su propio estado independiente.

### useEffect
Ejecuta efectos secundarios como fetching de datos, suscripciones y manipulación del DOM.

```javascript
useEffect(() => {
  document.title = `Hiciste clic ${count} veces`;
}, [count]);

// Sin dependencias - se ejecuta después de cada render
useEffect(() => {
  console.log('Componente renderizado');
});

// Array vacío - se ejecuta solo una vez
useEffect(() => {
  console.log('Componente montado');
}, []);
```

### useContext
Accede al contexto sin prop drilling, evitando pasar props a través de múltiples niveles.

```javascript
const theme = useContext(ThemeContext);
const user = useContext(UserContext);
```

### useReducer
Para estado más complejo, `useReducer` es más apropiado que `useState`.

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### useCallback
Memoriza una función para evitar re-renders innecesarios en componentes hijos.

```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### useMemo
Memoriza un valor computado para evitar cálculos innecesarios.

```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);
```

### useRef
Crea una referencia mutable que persiste entre renders.

```javascript
const inputRef = useRef(null);
const countRef = useRef(0);
```

## Buenas Prácticas

Al trabajar con hooks, sigue estas recomendaciones:

1. **Siempre usa Hooks en la parte superior del componente** - No uses dentro de condicionales o loops
2. **No uses Hooks dentro de condicionales** - Esto puede romper el orden de los hooks
3. **Crea Hooks personalizados para lógica reutilizable** - Extrae lógica común en hooks personalizados
4. **Usa el plugin de ESLint** - `eslint-plugin-react-hooks` ayuda a evitar errores comunes
5. **Optimiza dependencias** - Incluye todas las dependencias en el array de dependencias

## Hooks Personalizados

Puedes crear tus propios hooks para reutilizar lógica:

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

## Patrones Comunes

Aquí hay algunos patrones útiles con hooks:

- **Fetching de datos** - Usar `useEffect` con `useState` para gestionar loading y errores
- **Formularios** - Combinar `useState` con `useCallback` para handlers eficientes
- **Autenticación** - Usar `useContext` con `useReducer` para gestionar estado global
- **Paginación** - Combinar `useState` con `useEffect` para cargar datos

## Migración de Clases a Hooks

Si tienes componentes de clase, puedes migrarlos a hooks:

- `componentDidMount` → `useEffect` con array vacío
- `componentDidUpdate` → `useEffect` con dependencias
- `componentWillUnmount` → Función de limpieza en `useEffect`
- `this.state` → `useState`
- `this.setState` → Setter del `useState`

## Conclusión

Los Hooks hacen que tu código sea más limpio, fácil de mantener y reutilizable. Dominar hooks es esencial para el desarrollo React moderno. Practica creando componentes con diferentes hooks y explora la documentación oficial para aprender más.

---

## Ejemplo Completo: Componente con Múltiples Hooks

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

  // Agregar todo
  const addTodo = useCallback(() => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input }]);
      setInput('');
    }
  }, [input, todos]);

  return (
    <div style={{ background: theme.bg, color: theme.text }}>
      <h1>Mis Todos</h1>
      {loading ? <p>Cargando...</p> : <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>}
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Agregar</button>
    </div>
  );
}
```

## Comparación: Hooks vs Clases

| Aspecto | Hooks | Clases |
|--------|-------|--------|
| **Sintaxis** | Más concisa | Más verbosa |
| **Reutilización** | Fácil con hooks personalizados | Difícil, requiere HOC |
| **Rendimiento** | Optimizable con useMemo | Menos control |
| **Aprendizaje** | Curva moderada | Más conceptos |

## Consejo Profesional

> "Los Hooks no son solo una forma diferente de escribir React. Cambian fundamentalmente cómo piensas sobre componentes." - Dan Abramov

## Lista de Verificación de Dominio de Hooks

- [ ] Entender useState y useEffect
- [ ] Dominar useContext
- [ ] Aprender useReducer
- [ ] Optimizar con useCallback y useMemo
- [ ] Crear hooks personalizados
- [ ] Depurar con React DevTools
- [ ] Implementar en un proyecto real

## Errores Comunes a Evitar

- ~~Usar hooks dentro de condicionales~~ → Siempre en la parte superior
- ~~Olvidar dependencias~~ → Incluir todas las dependencias
- ~~Crear demasiados estados~~ → Usa useReducer para estado complejo
- ~~No memoizar callbacks~~ → Usa useCallback cuando sea necesario

## Herramientas Recomendadas

Consulta estas herramientas para mejorar tu desarrollo:

- [React DevTools](https://react-devtools-tutorial.vercel.app)
- [Plugin ESLint React Hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [Storybook](https://storybook.js.org)

## Estructura de un Componente con Hooks

```
ComponenteConHooks.jsx
├── Imports
├── Hooks Personalizados
├── Declaraciones useState
├── Declaraciones useEffect
├── Declaraciones useCallback
├── Lógica de renderizado
└── Export
```

## Recursos Adicionales

Para profundizar tus conocimientos[^1], consulta:

- [Documentación de React Hooks](https://react.dev/reference/react/hooks)
- [Patrones de Hooks Personalizados](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Mejores Prácticas de React Hooks](https://www.patterns.dev/posts/react-hooks)

[^1]: La documentación oficial de React es siempre la mejor fuente
[^2]: Hay muchos patrones y prácticas que puedes aprender

---

¡Ahora estás listo para dominar React Hooks!
