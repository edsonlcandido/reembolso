<template>
  <section class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">O que nossos clientes dizem</h2>
        <p class="text-lg text-gray-600">Empresas que ja transformaram seu processo de reembolso.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <TestimonialCard v-for="testimonial in testimonials" :key="testimonial.id" :testimonial="testimonial" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import TestimonialCard from './TestimonialCard.vue'

interface Testimonial {
  id: number
  rating: number
  quote: string
  author: string
  role: string
  initials: string
  color: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    rating: 5,
    quote: 'Reduziu nosso tempo de processamento de reembolsos em 75%. Nossos vendedores adoram a simplicidade de tirar uma foto e pronto.',
    author: 'Maria Silva',
    role: 'Gerente Financeiro, TechCorp',
    initials: 'MS',
    color: 'primary',
  },
  {
    id: 2,
    rating: 5,
    quote: 'A precisao do OCR e impressionante. Antes, gastávamos horas digitando dados de cupons. Agora e tudo automatico.',
    author: 'Joao Mendes',
    role: 'Controller, Grupo Innovare',
    initials: 'JM',
    color: 'secondary',
  },
  {
    id: 3,
    rating: 5,
    quote: 'Finalmente um sistema que funciona no celular. Minha equipe de vendas consegue registrar despesas na hora, direto do campo.',
    author: 'Ana Costa',
    role: 'Diretora Comercial, VendaMais',
    initials: 'AC',
    color: 'accent',
  },
]
</script>
