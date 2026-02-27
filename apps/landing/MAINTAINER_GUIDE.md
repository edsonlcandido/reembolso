# 🚀 Guia Rápido - Landing Page Refatorada

## O que foi feito?

A landing page **570 linhas de HTML puro** foi transformada em uma **arquitetura Vue 3 modular** com **16 componentes reutilizáveis**.

---

## 📂 Estrutura Simples

```
src/
├── App.vue                        # Orquestra tudo
├── main.ts                        # Entry point (7 linhas!)
├── components/
│   ├── Navbar.vue                # Menu + header
│   ├── Hero.vue + HeroVisual.vue  # Seção inicial
│   ├── ProblemSolution.vue        # Problema vs solução
│   ├── Stats.vue                  # Números (80%, 95%, etc)
│   ├── Features.vue + FeatureCard.vue       # 6 cards de features
│   ├── HowItWorks.vue             # 3 passos
│   ├── Testimonials.vue + TestimonialCard.vue  # Depoimentos
│   ├── Pricing.vue + PricingCard.vue        # 3 planos
│   ├── FAQ.vue + FAQItem.vue      # Perguntas com toggle
│   ├── CTAFinal.vue               # Último CTA
│   └── Footer.vue                 # Rodapé
└── style.css                      # Styles globais
```

---

## ✨ Como Editar

### 1️⃣ **Mudar Texto/Conteúdo**
Procure o arquivo do componente (ex: `Hero.vue`) e edite diretamente o template:

```vue
<!-- Hero.vue -->
<h1>Tire foto do cupom.<br>A IA faz o resto.</h1>
<!-- 👆 Edite aqui -->
```

### 2️⃣ **Mudar Dados (arrays)**
Os dados estão em `<script setup>`:

```vue
<!-- Features.vue -->
<script setup>
const features = [
  { title: 'Captura Inteligente', ... },
  // 👆 Edite aqui
]
</script>
```

### 3️⃣ **Adicionar Nova Seção**

1. Crie `src/components/MinhaSecao.vue`
2. Cole um exemplo:
```vue
<template>
  <section class="py-20">
    <div class="max-w-7xl mx-auto">
      <h2>Minha Seção</h2>
      <p>Conteúdo aqui</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Dados aqui se precisar
</script>
```

3. Importe em `App.vue`:
```vue
<script setup>
import MinhaSecao from './components/MinhaSecao.vue'
</script>

<template>
  <MinhaSecao />  <!-- Pronto! -->
</template>
```

### 4️⃣ **Mudar Cores/Estilos**
Use as classes Tailwind nos templates. Exemplos:
- `text-primary-600` → cor primária
- `bg-gradient-to-br` → gradiente
- `hover:shadow-lg` → hover com sombra

---

## 🔧 Componentes Reutilizáveis

### FeatureCard.vue
```vue
<!-- Para criar grids de cards com hover -->
<FeatureCard v-for="feature in features" :feature="feature" />
```

### TestimonialCard.vue
```vue
<!-- Para mostrar depoimentos -->
<TestimonialCard v-for="t in testimonials" :testimonial="t" />
```

### PricingCard.vue
```vue
<!-- Para planos de preço -->
<PricingCard v-for="plan in plans" :plan="plan" :featured="plan.featured" />
```

### FAQItem.vue
```vue
<!-- Para Q&A com toggle automático -->
<FAQItem v-for="item in faqItems" :item="item" />
```

---

## 📊 Seções Principais

| Seção | Arquivo | O que faz |
|-------|---------|-----------|
| **Navbar** | `Navbar.vue` | Menu navegação |
| **Hero** | `Hero.vue` | Headline + CTA principal |
| **Problema** | `ProblemSolution.vue` | Pain points vs soluções |
| **Stats** | `Stats.vue` | KPIs (80%, 95%, etc) |
| **Features** | `Features.vue` | 6 recursos principais |
| **Como funciona** | `HowItWorks.vue` | 3 passos processo |
| **Depoimentos** | `Testimonials.vue` | Social proof |
| **Preços** | `Pricing.vue` | 3 planos preço |
| **FAQ** | `FAQ.vue` | Perguntas frequentes |
| **CTA Final** | `CTAFinal.vue` | Last call to action |
| **Footer** | `Footer.vue` | Links rodapé |

---

## 🎨 Classes Tailwind Úteis

```html
<!-- Cores primárias -->
<div class="bg-primary-600 text-primary-700">Primário</div>

<!-- Gradientes -->
<div class="bg-gradient-to-br from-primary-600 to-primary-800">Gradient</div>

<!-- Spacing -->
<section class="py-20 px-4">...</section>

<!-- Hover effects -->
<div class="hover:shadow-lg hover:border-primary-300 transition-all">Card</div>

<!-- Responsive -->
<div class="text-xl sm:text-2xl lg:text-4xl">Responsive</div>
```

---

## 🔄 Fluxo de Dados

```
App.vue
  └─ Navbar
  └─ Hero
  │  └─ HeroVisual
  └─ ProblemSolution
  └─ Stats
  └─ Features
  │  └─ FeatureCard (loop)
  └─ HowItWorks
  └─ Testimonials
  │  └─ TestimonialCard (loop)
  └─ Pricing
  │  └─ PricingCard (loop)
  └─ FAQ
  │  └─ FAQItem (loop)
  └─ CTAFinal
  └─ Footer
```

---

## ⚡ Dev Server

```bash
cd apps/landing

# Instalar dependências
npm install

# Rodar em dev (hot reload)
npm run dev

# Build para produção
npm run build
```

Vai estar em `http://localhost:5000`

---

## 📝 Checklist de Manutenção

- [ ] Verificar links em `Navbar` e `Footer`
- [ ] Atualizar `Testimonials` com clientes reais
- [ ] Manter `Features` com máx 6 cards
- [ ] FAQ sempre com respostas claras
- [ ] Preços em `Pricing` atualizados
- [ ] SEO meta tags em `index.html`

---

## 🎯 Boas Práticas

✅ **Faça:**
- Use `v-for` para renderizar listas
- Estruture dados em arrays/objetos
- Reutilize componentes quando possível
- Mantenha template limpo (lógica em script)

❌ **Evite:**
- Hardcoded HTML demais em um arquivo
- Estilos inline (use Tailwind classes)
- Props mutáveis (use ref/computed)
- Criar novo componente para tudo

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Componente não aparece | Verificar import em App.vue |
| Estilos Tailwind não funcionam | `npm run build` recompila CSS |
| Imagens não carregam | Colocar em `public/` e usar `/images/...` |
| Mudanças não refletem | Limpar cache do navegador (Ctrl+Shift+Del) |

---

## 💡 Próximas Ideias

1. **Animações**: Adicionar Framer Motion nas seções
2. **Dados dinâmicos**: Conectar ao PocketBase
3. **i18n**: Tradução PT/EN com vue-i18n
4. **Dark mode**: Toggle com Tailwind classes
5. **Email**: Integrar newsletter com form
6. **Analytics**: Google Analytics ou Plausible
7. **Video**: Hero video em vez de imagem

---

**Sucesso! A landing page agora é fácil de manter! 🎉**
