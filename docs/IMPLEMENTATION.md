# Guia de Implementação - Sistema de Reembolso

Este documento complementa o PRD fornecendo orientações práticas para a implementação técnica do sistema.

## 1. Estrutura do Projeto

O projeto seguirá a estrutura do template PocketBase + Vue + Tailwind CSS existente:

```
reembolso/
├── apps/
│   ├── landing/                 # Landing page institucional
│   │   ├── src/
│   │   │   ├── components/      # Componentes da landing
│   │   │   │   ├── Hero.vue
│   │   │   │   ├── Features.vue
│   │   │   │   ├── HowItWorks.vue
│   │   │   │   ├── Pricing.vue
│   │   │   │   └── FAQ.vue
│   │   │   ├── main.ts
│   │   │   └── style.css
│   │   └── public/
│   │
│   └── web/                     # Aplicação web principal
│       ├── src/
│       │   ├── components/      # Componentes reutilizáveis
│       │   │   ├── common/      # Botões, inputs, modals
│       │   │   ├── expense/     # Relacionados a despesas
│       │   │   └── approval/    # Relacionados a aprovações
│       │   ├── views/           # Páginas/Views
│       │   │   ├── auth/
│       │   │   │   ├── Login.vue
│       │   │   │   └── Register.vue
│       │   │   ├── dashboard/
│       │   │   │   └── Dashboard.vue
│       │   │   ├── companies/
│       │   │   │   ├── CompanyList.vue
│       │   │   │   └── CompanyForm.vue
│       │   │   ├── expenses/
│       │   │   │   ├── ExpenseList.vue
│       │   │   │   ├── ExpenseForm.vue
│       │   │   │   └── ExpenseDetail.vue
│       │   │   └── approvals/
│       │   │       ├── ApprovalList.vue
│       │   │       └── ApprovalDetail.vue
│       │   ├── router/
│       │   │   └── index.ts     # Rotas da aplicação
│       │   ├── stores/          # Pinia stores
│       │   │   ├── auth.ts
│       │   │   ├── company.ts
│       │   │   ├── expense.ts
│       │   │   └── approval.ts
│       │   ├── services/        # Serviços
│       │   │   ├── pocketbase.ts
│       │   │   ├── ocr.ts
│       │   │   └── upload.ts
│       │   ├── composables/     # Composables Vue
│       │   │   ├── useUpload.ts
│       │   │   └── useNotification.ts
│       │   ├── types/           # TypeScript types
│       │   │   ├── company.ts
│       │   │   ├── expense.ts
│       │   │   └── user.ts
│       │   └── utils/           # Utilitários
│       │       ├── formatters.ts
│       │       └── validators.ts
│
├── pocketbase/
│   ├── pb_hooks/                # Hooks do PocketBase
│   │   ├── main.pb.js           # Routing SPA
│   │   ├── ocr_processor.pb.js  # Processamento OCR
│   │   ├── notifications.pb.js  # Sistema de notificações
│   │   └── audit.pb.js          # Logging de auditoria
│   ├── pb_migrations/           # Migrations do banco
│   │   └── 1234567890_initial_schema.js
│   └── pb_public/               # Arquivos servidos
│
├── docs/                        # Documentação
│   ├── PRD.md                   # Product Requirements Document
│   ├── IMPLEMENTATION.md        # Este arquivo
│   ├── API.md                   # Documentação da API
│   └── DEPLOYMENT.md            # Guia de deployment
│
└── scripts/                     # Scripts auxiliares
    ├── pocketbase.js
    ├── copy-landing.js
    ├── copy-app.js
    └── seed-dev-data.js         # Seed dados de desenvolvimento
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

2. **Configurar Collections:**
   - Companies
   - Users (já existe)
   - Company_Users
   - Approvers
   - Expense_Reports
   - Expense_Items
   - Categories
   - Audit_Logs

3. **Configurar Rules de Acesso:**
   - Ver seção 3.3 para exemplos

### 2.3 Configuração de Variáveis de Ambiente

**apps/web/.env.local:**
```env
VITE_POCKETBASE_URL=http://localhost:8090
VITE_OPENAI_API_KEY=sk-...
VITE_APP_NAME=Reembolso Inteligente
```

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

**Responsável:** AI/ML Engineer  
**Estimativa:** 7 dias  
**Dependências:** Módulo de Despesas

**Tarefas:**
- [ ] Integração com OpenAI GPT-4 Vision
- [ ] Hook de processamento assíncrono
- [ ] Parsing de resposta da IA
- [ ] Tratamento de erros
- [ ] Sistema de retry
- [ ] Logging e métricas

**Hook OCR (exemplo):**
```javascript
// pocketbase/pb_hooks/ocr_processor.pb.js
onRecordCreate((e) => {
  const collection = e.record.collection().name
  
  if (collection !== "expense_items") return
  
  const item = e.record
  const imageUrl = item.get("receipt_image")
  
  if (!imageUrl) return
  
  // Processa OCR de forma assíncrona
  processOCR(item.id, imageUrl)
})

function processOCR(itemId, imageUrl) {
  const fullImageUrl = `${$app.settings().meta.appUrl}/api/files/${imageUrl}`
  
  // Chama OpenAI Vision API
  const response = $http.send({
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise este cupom fiscal brasileiro e extraia as seguintes informações em formato JSON:
            - valor_total: valor total da compra (número)
            - data: data da compra (YYYY-MM-DD)
            - hora: hora da compra (HH:MM)
            - estabelecimento: nome do estabelecimento
            - categoria: categoria sugerida (food, transport, lodging, supplies, other)
            - itens: lista de itens (opcional)
            
            Retorne apenas o JSON, sem explicações.`
          },
          {
            type: "image_url",
            image_url: { url: fullImageUrl }
          }
        ]
      }],
      max_tokens: 500
    })
  })
  
  if (response.statusCode === 200) {
    const data = JSON.parse(response.raw)
    const ocrText = data.choices[0].message.content
    
    try {
      const ocrData = JSON.parse(ocrText)
      
      // Atualiza o item com os dados extraídos
      const item = $app.findRecordById("expense_items", itemId)
      item.set("amount", Math.round(ocrData.valor_total * 100))
      item.set("date", `${ocrData.data}T${ocrData.hora}:00Z`)
      item.set("merchant", ocrData.estabelecimento)
      item.set("category", ocrData.categoria)
      item.set("ocr_data", ocrData)
      item.set("ocr_confidence", 0.9)
      item.set("ocr_processed", true)
      
      $app.save(item)
      
      console.log(`OCR processado para item ${itemId}`)
    } catch (error) {
      console.error(`Erro ao parsear OCR: ${error}`)
    }
  }
}
```

### 3.5 Módulo de Aprovações

**Responsável:** Frontend Developer  
**Estimativa:** 5 dias  
**Dependências:** Despesas

**Tarefas:**
- [ ] Dashboard de aprovações pendentes
- [ ] Detalhe da aprovação
- [ ] Ações de aprovar/rejeitar
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
