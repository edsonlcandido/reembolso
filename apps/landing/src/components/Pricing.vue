<template>
  <section id="pricing" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Planos para cada necessidade</h2>
        <p class="text-lg text-gray-600">Comece gratis e escale conforme sua empresa cresce.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PricingCard v-for="plan in plans" :key="plan.id" :plan="plan" :featured="plan.featured" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import PricingCard from './PricingCard.vue'

interface Plan {
  id: number
  name: string
  subtitle: string
  price: string
  period: string
  features: string[]
  cta: string
  featured?: boolean
}

const plans: Plan[] = [
  {
    id: 1,
    name: 'Gratuito',
    subtitle: 'Para profissionais individuais',
    price: 'R$ 0',
    period: '/mes',
    features: [
      'Ate 5 relatorios/mes',
      'OCR basico',
      'Suporte por email',
    ],
    cta: 'Comecar Gratis',
  },
  {
    id: 2,
    name: 'Profissional',
    subtitle: 'Para equipes em crescimento',
    price: 'R$ 10',
    period: '/usuario/mes',
    features: [
      'Relatorios ilimitados',
      'OCR avancado com IA',
      'Fluxo de aprovacao',
      'Suporte prioritario',
    ],
    cta: 'Comecar Agora',
    featured: true,
  },
  {
    id: 3,
    name: 'Empresarial',
    subtitle: 'Para grandes corporacoes',
    price: 'Custom',
    period: '',
    features: [
      'Tudo do Profissional',
      'SSO / SAML',
      'API dedicada',
      'SLA garantido',
    ],
    cta: 'Falar com Vendas',
  },
]
</script>
