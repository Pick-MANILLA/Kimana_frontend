# Kimana Frontend — Security & Engineering Issues

This document outlines the actionable security, authentication, and architectural issues identified during the frontend audit of `Kimana_frontend` (Next.js 16.3 / React 19). Each issue includes exact file locations, technical root causes, step-by-step resolution guides, code patches, and testable acceptance criteria.

---

## Issue Summary

| Issue ID | Severity | Target Module | Description |
| :--- | :---: | :--- | :--- |
| **`ISSUE-FE-01`** | **HIGH** | `src/features/auth/LoginPage.jsx` | Connect real authentication API and eliminate cosmetic mock login. |
| **`ISSUE-FE-02`** | **MEDIUM** | `src/api/` & `integration/` | Standardize Next.js environment variable syntax (`process.env.NEXT_PUBLIC_*`). |
| **`ISSUE-FE-03`** | **LOW** | `src/components/ui/Prism.jsx` | WebGL context disposal on unmount to prevent GPU resource leaks. |
| **`ISSUE-FE-04`** | **LOW** | `src/features/exchange/ExchangePage.jsx` | Resolve Oxlint warnings & synchronous `setState` in effects. |

---

### ISSUE-FE-01: Connect Real Authentication API & Secure Cookie Handling

**Priority:** High (P1)  
**Labels:** `auth`, `security`, `frontend`  
**Files:** `src/features/auth/LoginPage.jsx`, `src/features/dashboard/Sidebar.jsx`, `src/features/exchange/ExchangePage.jsx`  

#### 1. What the Problem Is
`LoginPage.jsx` contains a simulated login function:
```javascript
const onSubmit = async (_values) => {
  setIsSubmitting(true);
  // Simulate brief network authentication check
  await new Promise((resolve) => setTimeout(resolve, 600));
  setIsSubmitting(false);
  router.push('/dashboard');
};
```
No credentials are submitted to the backend, and no session or authentication token is established. In `Sidebar.jsx`, `HomePage.jsx`, and `ExchangePage.jsx`, the logout handlers call `localStorage.removeItem('kimana_session')`, which is orphaned dead code because `kimana_session` was never written.

#### 2. Step-by-Step Resolution Guide
1. **Define Auth API Method in `src/api/`:**
   ```javascript
   export async function login(credentials) {
     const res = await fetch(`${BASE_URL}/auth/login`, {
       method: 'POST',
       headers: { 'content-type': 'application/json' },
       credentials: 'include', // Allows browser to receive and store HttpOnly session cookie
       body: JSON.stringify(credentials),
     });
     if (!res.ok) {
       const err = await res.json().catch(() => ({}));
       throw new Error(err.message || 'Authentication failed');
     }
     return res.json();
   }
   ```
2. **Wire Login Form to the Real Endpoint:**
   In `LoginPage.jsx`:
   ```javascript
   const onSubmit = async (values) => {
     setIsSubmitting(true);
     setAuthError('');
     try {
       await api.auth.login(values);
       router.push('/dashboard');
     } catch (err) {
       setAuthError(err.message);
     } finally {
       setIsSubmitting(false);
     }
   };
   ```
3. **Implement Real Logout Flow:**
   In `Sidebar.jsx` and `ExchangePage.jsx`, call `api.auth.logout()` to revoke the session server-side before redirecting to `/login`.

#### 3. Acceptance Criteria
- [ ] Submitting invalid credentials displays an inline error message from the API.
- [ ] Successful authentication navigates to `/dashboard` with session cookies set.
- [ ] Logout revokes the session on the backend.

---

### ISSUE-FE-02: Standardize Next.js Environment Variable Syntax

**Priority:** Medium (P2)  
**Labels:** `bug`, `config`, `nextjs`  
**Files:** `src/api/index.js`, `Kimana_backend/integration/live-api-client.ts`  

#### 1. What the Problem Is
The drop-in live API client template (`live-api-client.ts`) uses Vite environment variable syntax:
```typescript
const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:4000';
```
In Next.js 16 (App Router), `import.meta.env` is either undefined or throws a runtime ReferenceError in browser bundles. Next.js requires environment variables exposed to the browser to be prefixed with `NEXT_PUBLIC_` and accessed via `process.env`.

#### 2. Step-by-Step Resolution Guide
1. Replace `import.meta.env.VITE_API_URL` with:
   ```typescript
   const BASE_URL =
     process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
     'http://localhost:4000';
   ```
2. Create `.env.example` in `Kimana_frontend/`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

#### 3. Acceptance Criteria
- [ ] Client correctly reads `process.env.NEXT_PUBLIC_API_URL`.
- [ ] Next.js build (`npm run build`) completes without `import.meta` errors.

---

### ISSUE-FE-03: WebGL Context Disposal in `Prism.jsx`

**Priority:** Low (P3)  
**Labels:** `performance`, `webgl`, `cleanup`  
**Files:** `src/components/ui/Prism.jsx`  

#### 1. What the Problem Is
In `src/components/ui/Prism.jsx`:
```javascript
return () => {
  stopRAF();
  ro.disconnect();
  // ...
  if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
};
```
While the canvas DOM element is removed, WebGL contexts and GPU buffer allocations persist until garbage collected by the browser. Rapid tab navigation can lead to browser WebGL context exhaustion.

#### 2. Step-by-Step Resolution Guide
In the cleanup function of `useEffect` in `src/components/ui/Prism.jsx`, explicitly trigger WebGL context loss:
```javascript
return () => {
  stopRAF();
  ro.disconnect();
  // ...
  const loseContext = gl.getExtension('WEBGL_lose_context');
  if (loseContext) {
    loseContext.loseContext();
  }
  if (gl.canvas.parentElement === container) container.removeChild(gl.canvas);
};
```

#### 3. Acceptance Criteria
- [ ] `WEBGL_lose_context` is invoked upon component unmount.
- [ ] Zero WebGL memory warnings in browser console during rapid page navigation.

---

### ISSUE-FE-04: Resolve Oxlint Warnings & Synchronous SetState in Effects

**Priority:** Low (P3)  
**Labels:** `code-quality`, `lint`, `react19`  
**Files:** `src/features/exchange/ExchangePage.jsx`, `src/features/dashboard/TransfersPage.jsx`  

#### 1. What the Problem Is
`npx oxlint` identified 15 warnings across frontend components, including:
1. Synchronous `setState` calls inside `useEffect` (lines 412, 663, 922, 1216 in `ExchangePage.jsx`), which disables React 19 compiler optimizations and causes cascading re-renders.
2. Unused imported icons (`ArrowRightIcon`).
3. Unused catch error parameters (`catch (_) {}`).

#### 2. Step-by-Step Resolution Guide
1. Refactor synchronous state setters out of `useEffect` by deriving state or initializing it directly during render.
2. Remove unused imports and rename unused catch variables to omit parameters `catch {}`.
3. Verify `npx oxlint` exits with `0 warnings and 0 errors`.

#### 3. Acceptance Criteria
- [ ] `npx oxlint` reports zero errors and zero warnings.
- [ ] No React Compiler de-optimizations triggered by cascading state effects.
