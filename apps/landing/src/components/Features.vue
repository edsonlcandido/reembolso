<template>
  <section id="features" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tudo que voce precisa para gerenciar reembolsos</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">Recursos poderosos para funcionarios, gestores e administradores.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard v-for="feature in features" :key="feature.id" :feature="feature" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FeatureCard from './FeatureCard.vue'

interface Feature {
  id: number
  icon: string
  title: string
  description: string
  color: string
  hoverColor: string
}

const features: Feature[] = [
  {
    id: 1,
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Captura Inteligente',
    description: 'Tire foto do cupom fiscal pelo celular ou desktop. A IA extrai valor, data, estabelecimento e categoria automaticamente.',
    color: 'primary',
    hoverColor: 'primary-200',
  },
  {
    id: 2,
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Aprovacao Rapida',
    description: 'Dashboard centralizado para gestores aprovarem ou rejeitarem despesas com justificativa em poucos cliques.',
    color: 'secondary',
    hoverColor: 'secondary-200',
  },
  {
    id: 3,
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    title: 'Multi-empresa',
    description: 'Gerencie multiplas empresas com dados isolados, configuracoes personalizadas e centros de custo independentes.',
    color: 'purple',
    hoverColor: 'purple-200',
  },
  {
    id: 4,
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Relatorios Completos',
    description: 'Crie relatorios de despesas com agrupamento por periodo, calculo automatico de totais e rastreamento de status.',
    color: 'accent',
    hoverColor: 'accent-200',
  },
  {
    id: 5,
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Compliance e Auditoria',
    description: 'Trilha de auditoria completa, logs imutaveis e conformidade com LGPD. Tudo rastreavel e exportavel.',
    color: 'red',
    hoverColor: 'red-200',
  },
  {
    id: 6,
    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
    title: 'Mobile-first',
    description: 'Interface responsiva que funciona perfeitamente em qualquer dispositivo. Registre despesas em qualquer lugar.',
    color: 'indigo',
    hoverColor: 'indigo-200',
  },
]
</script>
