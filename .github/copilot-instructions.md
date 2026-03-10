# Copilot Instructions - PocketBase + Vue + Tailwind CSS Template

## 🎯 Instruções para Copilot

**Stack**: PocketBase v0.36+ | Vue 3 + TypeScript | Vue Router + Pinia | Vite | Tailwind CSS  
**Arquitetura**: Monorepo (apps/landing + apps/web servidos via PocketBase)

## ⚠️ ALERTAS CRÍTICOS - PocketBase v0.23+ (LEIA ANTES DE GERAR CÓDIGO)

### 🔴 JSVM - `require()` e Node APIs NÃO FUNCIONAM

❌ **NUNCA** use em `pb_hooks/`:
```javascript
require('fs')           // ❌ ERRADO - vai falhar silenciosamente
require('path')         // ❌ ERRADO
import/export           // ❌ ERRADO - não funciona no JSVM
fs.readFile()           // ❌ ERRADO
```

✅ **USE SEMPRE** os helpers globais:
```javascript
$filesystem.fileContent(path)     // ✅ Lê arquivo
$apis.static(dir, true)            // ✅ Serve arquivo estático
$apis.requireAuth()                // ✅ Middleware de auth
$app.findRecordById(col, id)      // ✅ Query no banco
$http.send({ url, method, body }) // ✅ Request HTTP
```


### 🔴 Sintaxe `routerAdd()` Mudou em v0.23

❌ **Sintaxe Antiga (pré-v0.23) - ERRADA:**
```javascript
routerAdd("GET", "/app/*", (c) => c.file(200, "index.html"))
routerAdd("GET", "/api/test", (c) => c.json(200, { msg: "hi" }))
```

✅ **Sintaxe Nova (v0.23+) - CORRETA:**
```javascript
// Wildcards: use {path...} em vez de *
routerAdd("GET", "/app/{path...}", $apis.static("pb_public/app", true))

// Request handler usa (e), retorna e.json(), e.string(), etc.
routerAdd("GET", "/api/test", (e) => e.json(200, { msg: "hi" }))

// Middlewares são passados como argumentos opcionais
routerAdd("POST", "/api/admin", 
  (e) => e.json(200, { admin: true }),
  $apis.requireSuperuserAuth()
)
```



## 📌 Padrões de Código Esperados

### Apps Web/Landing - Vue + TypeScript

```typescript
// ✅ Sempre use composition API + script setup
<script setup lang="ts">
import { computed, ref } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>

// ✅ Use type-safe Pinia stores
import { defineStore } from 'pinia'
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserRecord | null>(null)
  return { user }
})

// ✅ Sempre importe o PocketBase service
import pb from '@/services/pocketbase'
const user = await pb.collection('users').getOne(id)
```

### PocketBase Hooks - JavaScript (JSVM)

```javascript
// ✅ Sempre use helpers globais
routerAdd("GET", "/api/test", (e) => {
  return e.json(200, { message: "ok" })
})

// ✅ Use e.next() para cadeia de middlewares
routerAdd("POST", "/api/protected", 
  (e) => {
    // lógica aqui
    return e.next()
  },
  $apis.requireAuth()
)

// ✅ Hooks de registro
onRecordCreate((e) => {
  console.log("Novo registro:", e.record.id)
  return e.next()
})
```

## 🔐 Autenticação

**Sempre use `authRefresh()` em rotas protegidas** - o `authStore.isValid` não valida com o backend:

```typescript
// ✅ Vue Router guard
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !pb.authStore.isValid) {
    return { name: 'login' }
  }
  // Valida com backend
  try {
    await pb.collection('users').authRefresh()
  } catch {
    pb.authStore.clear()
    return { name: 'login' }
  }
})

// ✅ Redirect após login com nextTick()
import { nextTick } from 'vue'
await pb.collection('users').authWithPassword(email, password)
await nextTick()
router.push({ name: 'dashboard' })
```

## 🌍 Variáveis de Ambiente

```env
# apps/web/.env.development
VITE_POCKETBASE_URL=http://localhost:8090

# apps/web/.env.production
VITE_POCKETBASE_URL=/

# apps/web/.env.local (gitignored - Codespaces)
VITE_POCKETBASE_URL=https://seu-codespace-8090.app.github.dev
```

Acesse no código com: `import.meta.env.VITE_POCKETBASE_URL`

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Hook falha silenciosamente | Usando `require()` ou Node APIs | Use `$apis.*` helpers |
| `/app/dashboard` retorna landing page | Falta hook ou `indexFallback=false` | Adicionar: `routerAdd("GET", "/app/{path...}", $apis.static("pb_public/app", true))` |
| Usuário deletado permanece logado | Não chama `authRefresh()` | Implementar no router guard |
| Login não redireciona | Sem `await nextTick()` | Adicionar entre auth e push |
| `npm ci` falha no Docker | `package-lock.json` no gitignore | Usar `npm install` ou desbloquear arquivo |
| `ReferenceError: X is not defined` no hook | Variável declarada no escopo do arquivo não é global no goja | Declarar a variável dentro da função |
| `Something went wrong` ao salvar registro | `Array.includes()` ou `Intl` usados em hook (não suportados no goja ES5.1) | Usar `indexOf() !== -1` e concatenação simples |

## 🔴 JSVM - Limitações do Runtime goja (ES5.1)

O runtime JavaScript dos hooks do PocketBase é baseado em **goja (ES5.1)**. Há restrições importantes:

### Variáveis de arquivo não são globais

Variáveis declaradas no escopo do arquivo (`const`, `let`, `var`) **não ficam visíveis dentro de funções nomeadas** — causam `ReferenceError`.

```javascript
// ❌ ERRADO — causa ReferenceError dentro da função
const CURRENCIES = ["BRL", "USD"]
function validate(e) {
  if (CURRENCIES.indexOf("USD") !== -1) { ... } // ReferenceError!
}

// ✅ CORRETO — declarar dentro da função
function validate(e) {
  const currencies = ["BRL", "USD"]
  if (currencies.indexOf("USD") !== -1) { ... }
}
```

### Métodos ES2016+ não suportados

```javascript
// ❌ ERRADO
arr.includes("valor")           // Array.prototype.includes não existe no ES5.1
(123456).toLocaleString("pt-BR") // Intl não disponível no goja

// ✅ CORRETO
arr.indexOf("valor") !== -1
String(123456)
```

### Registro de hooks de coleção

```javascript
// ✅ Correto (sem sufixo "Request")
onRecordCreate(handler, "nome_colecao")
onRecordUpdate(handler, "nome_colecao")
onRecordAfterCreateSuccess(handler, "nome_colecao")

// ⚠️ Evitar (pode ter comportamento diferente no v0.36)
onRecordCreateRequest(handler, "nome_colecao")
```

### Body em `routerAdd` — tipar com segurança

O SDK do PocketBase pode enviar `amount` como string ou número. Sempre use `parseFloat()`/`parseInt()`:

```javascript
routerAdd("POST", "/api/endpoint", (e) => {
  const body = e.requestInfo().body
  const amount = parseFloat(body.amount) // não confie no tipo
  if (isNaN(amount) || amount <= 0) {
    return e.json(400, { error: "Valor inválido" })
  }
}, $apis.requireAuth())
```
