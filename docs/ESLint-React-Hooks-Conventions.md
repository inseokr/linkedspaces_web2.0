# ESLint React Hooks Conventions

This project uses `react-hooks/set-state-in-effect` (from `eslint-plugin-react-hooks`). It blocks **synchronous** `setState` inside `useEffect` to avoid cascading renders.

## Why it fails

Calling `setState` directly in the effect body runs in the same tick as the effect, so React does an extra render right after. The rule wants effects to either:

- Update **external** systems (DOM, APIs, subscriptions), or
- Subscribe to external systems and call `setState` **only in a callback** when that system changes.

## How to avoid the error

### 1. **Hydration / “mounted” flag**

**Don’t:** `useEffect(() => setMounted(true), []);`

**Do:** Use `useSyncExternalStore` so there’s no effect and no setState:

```ts
const mounted = useSyncExternalStore(
  () => () => {},
  () => true,
  () => false,
);
// Server: false, client: true
```

### 2. **Reading from cache/storage on mount**

**Don’t:** `useEffect(() => setUser(getCachedUser()), []);`

**Do:** Defer so setState isn’t synchronous:

```ts
useEffect(() => {
  queueMicrotask(() => setUser(getCachedUser()));
}, []);
```

### 3. **Clamping derived state (e.g. page index)**

**Don’t:** `useEffect(() => { if (page > maxPage) setPage(maxPage); }, [page, maxPage]);`

**Do:** Derive during render and use that value:

```ts
const effectivePage = Math.min(page, maxPage);
// Use effectivePage for slicing; keep page in state for arrows.
```

### 4. **Subscribing to external values (e.g. `matchMedia`)**

**Don’t:** `useEffect(() => { const m = window.matchMedia(q); setMatches(m.matches); m.addEventListener('change', ...); }, [q]);`

**Do:** Use `useSyncExternalStore`:

```ts
const subscribe = (cb) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
return useSyncExternalStore(
  subscribe,
  () => window.matchMedia(query).matches,
  () => false,
);
```

### 5. **When you must setState inside an effect**

If the rule still fires (e.g. resetting state when a prop changes), defer:

```ts
queueMicrotask(() => setState(...));
```

## Pre-commit

Husky runs `lint-staged`, which runs ESLint on staged files. Fix these patterns before committing, or the commit will be blocked.

## Reference

- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
