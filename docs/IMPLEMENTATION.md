# Guia de Implementação - Sistema de Reembolso

Este documento complementa o PRD fornecendo orientações práticas para a implementação técnica do sistema.

## 1. Estrutura do Projeto

O projeto seguirá a estrutura do template PocketBase + Vue + Tailwind CSS existente:

```
reembolso/
├── apps/
│   ├── landing/                 # Landing page institucional
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── style.css
│   │   └── public/
│   │
│   └── web/                     # Aplicação web principal
│       ├── src/
│       │   ├── views/           # Páginas/Views
│       │   │   ├── LoginView.vue
│       │   │   ├── DashboardView.vue
│       │   │   ├── ProfileView.vue
│       │   │   ├── CompaniesListView.vue
│       │   │   ├── CompanyAuthView.vue
│       │   │   ├── CompanyMembersView.vue
│       │   │   ├── CompanySetupView.vue
│       │   │   ├── ExpenseReportsView.vue
│       │   │   ├── CreateExpenseReportView.vue
│       │   │   ├── EditExpenseReportView.vue
│       │   │   ├── ExpenseReportDetailView.vue
│       │   │   ├── AddExpenseView.vue
│       │   │   ├── ApprovalsView.vue
│       │   │   └── CategoriesView.vue
│       │   ├── router/
│       │   │   └── index.ts     # Rotas da aplicação
│       │   ├── stores/          # Pinia stores
│       │   │   ├── auth.ts
│       │   │   ├── company.ts
│       │   │   └── expenses.ts
│       │   └── services/        # Serviços
│       │       └── pocketbase.ts
│
├── pocketbase/
│   ├── pb_hooks/                # Hooks do PocketBase
│   │   ├── main.pb.js           # Roteamento SPA + endpoints customizados
│   │   ├── hooksExpenseReports.pb.js  # Workflow de relatórios + limite FREE
│   │   ├── hooksApprovalActions.pb.js # Validações de aprovação
│   │   ├── hooksCategories.pb.js      # CRUD de categorias
│   │   ├── hooksCompanies.pb.js       # Lifecycle de empresas + categorias padrão
│   │   ├── hooksCompanyUsers.pb.js    # Gestão de membros
│   │   └── hooksExpenseItems.pb.js    # Cálculo de km e validações
│   ├── pb_migrations/           # Migrations do banco
│   └── pb_public/               # Arquivos servidos
│
├── docs/                        # Documentação
│   ├── PRD.md                   # Product Requirements Document
│   ├── IMPLEMENTATION.md        # Este arquivo
│   ├── API.md                   # Documentação da API
│   ├── USER_STORIES.md          # Histórias de usuário por papel
│   └── README.md                # Índice da documentação
│
└── scripts/                     # Scripts auxiliares
    ├── pocketbase.js
    ├── copy-landing.js
    └── copy-app.js
```

## 2. Setup Inicial

### 2.1 Instalação

```bash
# Clone o repositório
git clone https://github.com/edsonlcandido/reembolso.git
cd reembolso

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
cp apps/landing/.env.example apps/landing/.env.local
```

### 2.2 Configuração do PocketBase

1. **Criar Collections via Admin UI** (http://localhost:8090/_/)
   - Ou usar migrations em `pb_migrations/`

2. **Collections implementadas:**
   - users (built-in PocketBase)
   - companies
   - company_users
   - expense_reports
   - expense_items
   - categories
   - approval_actions
   - system_variables

3. **Configurar chave de API para OCR:**
   - Acesse PocketBase Admin UI → Collections → system_variables
   - Crie um registro com `key=OPENROUTER_API_KEY` e `value=<sua-chave>`

### 2.3 Configuração de Variáveis de Ambiente

**apps/web/.env.local:**
```env
VITE_POCKETBASE_URL=http://localhost:8090
VITE_APP_NAME=Reembolso Inteligente
```

> **Chave de API de IA:** A chave do OpenRouter **não** é uma variável de ambiente do frontend. Ela é armazenada na collection `system_variables` do PocketBase e acessada apenas server-side pelos hooks.

**apps/landing/.env.local:**
```env
VITE_POCKETBASE_URL=http://localhost:8090
VITE_WEBAPP_URL=http://localhost:5174
```

## 3. Implementação por Módulo

### 3.1 Módulo de Autenticação

**Responsável:** Frontend Developer  
**Estimativa:** 3 dias  
**Dependências:** Nenhuma

**Tarefas:**
- [ ] Criar tela de Login (`apps/web/src/views/auth/Login.vue`)
- [ ] Criar tela de Registro (`apps/web/src/views/auth/Register.vue`)
- [ ] Implementar store de autenticação (`stores/auth.ts`)
- [ ] Configurar guards do Vue Router
- [ ] Implementar recuperação de senha
- [ ] Testes de autenticação

**Store de Autenticação (exemplo):**
```typescript
// apps/web/src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import pb from '@/services/pocketbase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  
  const isLoggedIn = computed(() => pb.authStore.isValid)
  
  const login = async (email: string, password: string) => {
    const authData = await pb.collection('users').authWithPassword(email, password)
    user.value = authData.record
  }
  
  const logout = () => {
    pb.authStore.clear()
    user.value = null
  }
  
  return { user, isLoggedIn, login, logout }
})
```

### 3.2 Módulo de Empresas

**Responsável:** Frontend Developer  
**Estimativa:** 5 dias  
**Dependências:** Autenticação

**Tarefas:**
- [ ] CRUD de empresas
- [ ] Gestão de usuários da empresa
- [ ] Configurações da empresa
- [ ] Upload de logo
- [ ] Validação de CNPJ

**Collection Schema (PocketBase):**
```javascript
// pb_migrations/1234567890_create_companies.js
migrate((db) => {
  const collection = new Collection({
    name: "companies",
    type: "base",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "cnpj", type: "text", required: true, unique: true },
      { name: "email", type: "email", required: true },
      { name: "phone", type: "text" },
      { name: "address", type: "text" },
      { name: "logo", type: "file", maxSelect: 1, maxSize: 5242880 },
      { name: "currency", type: "text", required: true, default: "BRL" },
      { name: "settings", type: "json" },
      { name: "active", type: "bool", required: true, default: true }
    ]
  })
  
  return db.saveCollection(collection)
})
```

### 3.3 Módulo de Despesas

**Responsável:** Frontend Developer + Backend Developer  
**Estimativa:** 10 dias  
**Dependências:** Empresas, Usuários

**Tarefas Frontend:**
- [ ] Formulário de criação de relatório
- [ ] Lista de relatórios
- [ ] Detalhe do relatório
- [ ] Adicionar itens de despesa
- [ ] Upload de foto de cupom
- [ ] Interface de revisão de dados OCR
- [ ] Submissão de relatório

**Tarefas Backend:**
- [ ] Collection expense_reports
- [ ] Collection expense_items
- [ ] Hook de processamento OCR
- [ ] API de upload
- [ ] Cálculo de totais

**Componente de Upload (exemplo):**
```vue
<!-- apps/web/src/components/expense/ReceiptUpload.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useUpload } from '@/composables/useUpload'

const emit = defineEmits<{
  (e: 'ocr-complete', data: OCRData): void
}>()

const { upload, isUploading, progress } = useUpload()

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const result = await upload(file, 'receipt')
  
  // Aguardar processamento OCR
  if (result.ocr_data) {
    emit('ocr-complete', result.ocr_data)
  }
}
</script>

<template>
  <div class="upload-zone">
    <input 
      type="file" 
      accept="image/*" 
      capture="environment"
      @change="handleFileChange"
    />
    <div v-if="isUploading">
      Processando... {{ progress }}%
    </div>
  </div>
</template>
```

### 3.4 Módulo de OCR/IA

**Responsável:** Backend Developer  
**Status:** ✅ Implementado  
**Dependências:** Módulo de Despesas

**Como funciona:**
1. Frontend converte imagem para base64 e envia para `POST /api/ai/read-receipt`
2. Hook em `main.pb.js` chama o OpenRouter com a imagem e um prompt estruturado
3. Resposta JSON é retornada diretamente ao frontend (fluxo **síncrono**)
4. Frontend pré-preenche o formulário; usuário revisa e corrige se necessário
5. Usuário salva o item de despesa com a imagem via `POST /api/collections/expense_items/records`

**Endpoint OCR (main.pb.js):**
```javascript
// pocketbase/pb_hooks/main.pb.js
routerAdd("POST", "/api/ai/read-receipt", (e) => {
  // Lê chave da API de system_variables
  const apiKeyRecord = $app.findFirstRecordByFilter(
    "system_variables", "key='OPENROUTER_API_KEY'"
  )
  if (!apiKeyRecord) {
    return e.json(500, { message: "API key não configurada." })
  }
  const apiKey = apiKeyRecord.get("value")

  const body = e.requestInfo().body
  const imageBase64 = body.image

  const response = $http.send({
    url: "https://openrouter.ai/api/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-flash-1.5",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extraia os dados deste cupom fiscal em JSON: valor_total, data, hora, estabelecimento, categoria, itens" },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }]
    })
  })

  if (response.statusCode !== 200) {
    return e.json(500, { message: "Erro ao processar imagem com IA." })
  }

  try {
    const ocrData = JSON.parse(JSON.parse(response.raw).choices[0].message.content)
    return e.json(200, ocrData)
  } catch (err) {
    return e.json(500, { message: "Erro ao interpretar resposta da IA." })
  }
}, $apis.requireAuth())
```

### 3.5 Módulo de Aprovações

**Responsável:** Frontend Developer  
**Estimativa:** 5 dias  
**Dependências:** Despesas

**Tarefas:**
- [ ] Dashboard de aprovações pendentes
- [ ] Detalhe da aprovação
- [ ] Ações de aprovar/rejeitar/devolver para revisão
- [ ] Fluxo de correção: relatório devolvido volta para rascunho e exige reenvio
- [ ] Pagamento somente integral do relatório (sem pagamento parcial)
- [ ] Sistema de notificações
- [ ] Histórico de aprovações

### 3.6 Landing Page

**Responsável:** UI/UX Designer + Frontend Developer  
**Estimativa:** 5 dias  
**Dependências:** Nenhuma (pode ser paralelo)

**Tarefas:**
- [ ] Hero section
- [ ] Features section
- [ ] How it works
- [ ] Pricing
- [ ] FAQ
- [ ] Footer
- [ ] Otimização SEO
- [ ] Responsividade

## 4. Desenvolvimento Incremental

### Sprint 1 (2 semanas): Fundação
- Setup do projeto
- Autenticação
- CRUD de empresas
- Design system básico

### Sprint 2 (2 semanas): Despesas Core
- Criação de relatórios
- Itens de despesa
- Upload de imagens
- Listagem e detalhes

### Sprint 3 (2 semanas): IA/OCR
- Integração OpenAI
- Processamento assíncrono
- UI de revisão de dados
- Tratamento de erros

### Sprint 4 (2 semanas): Aprovações
- Dashboard de aprovações
- Fluxo de aprovação
- Notificações
- Histórico

### Sprint 5 (2 semanas): Landing Page & Polish
- Landing page completa
- Melhorias de UX
- Testes end-to-end
- Deploy MVP

## 5. Testes

### 5.1 Testes Unitários
- Usar Vitest para testes de components
- Coverage mínimo: 70%

### 5.2 Testes E2E
- Usar Playwright ou Cypress
- Testar fluxos críticos:
  - Login → Criar relatório → Upload cupom → OCR → Aprovar

### 5.3 Testes de Performance
- Lighthouse CI
- Tempo de OCR < 10s
- FCP < 1.5s

## 6. Deploy

### 6.1 Desenvolvimento
```bash
npm run dev
```
Acesso:
- Landing: http://localhost:5173
- App: http://localhost:5174
- PocketBase: http://localhost:8090

### 6.2 Produção

**Build:**
```bash
npm run build
```

**Docker:**
```bash
docker build -t reembolso-app .
docker run -p 8090:8090 -v ./pb_data:/app/pb_data reembolso-app
```

**Cloud Providers:**
- Railway.app (recomendado para MVP)
- Render.com
- Fly.io
- AWS ECS

## 7. Monitoramento

### 7.1 Métricas a Monitorar
- Requests por segundo
- Tempo de resposta API
- Taxa de sucesso OCR
- Erros 5xx
- Uptime

### 7.2 Ferramentas
- Sentry para error tracking
- Plausible Analytics para analytics
- Uptime Robot para monitoring

## 8. Documentação da API

Ver `docs/API.md` para documentação completa da API REST do PocketBase.

## 9. Checklist de Lançamento

- [ ] Testes E2E passando
- [ ] Performance otimizada (Lighthouse > 90)
- [ ] SEO configurado
- [ ] Analytics instalado
- [ ] Backup automático configurado
- [ ] Monitoring ativo
- [ ] Documentação completa
- [ ] Termos de uso e privacidade
- [ ] Emails transacionais funcionando
- [ ] Domain e SSL configurados

## 10. Recursos Adicionais

- [PocketBase Docs](https://pocketbase.io/docs/)
- [Vue 3 Best Practices](https://vuejs.org/guide/best-practices/)
- [Tailwind CSS Components](https://tailwindui.com/)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
