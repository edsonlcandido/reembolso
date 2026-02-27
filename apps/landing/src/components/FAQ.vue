<template>
  <section id="faq" class="py-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
        <p class="text-lg text-gray-600">Tire suas duvidas sobre o Reembolso Inteligente.</p>
      </div>
      <div class="space-y-4">
        <FAQItem v-for="item in faqItems" :key="item.id" :item="item" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FAQItem from './FAQItem.vue'

interface FAQItem {
  id: number
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'O que e OCR e como funciona?',
    answer: 'OCR (Reconhecimento Optico de Caracteres) e a tecnologia que permite extrair texto de imagens. Nosso sistema usa inteligencia artificial avancada (GPT-4 Vision) para nao apenas ler o texto do cupom, mas entender e categorizar automaticamente os dados como valor, data, estabelecimento e tipo de despesa.',
  },
  {
    id: 2,
    question: 'Quais tipos de cupom sao aceitos?',
    answer: 'Aceitamos fotos de cupons fiscais, notas fiscais, recibos e comprovantes em formatos JPG, PNG e PDF. A IA e treinada especialmente para cupons fiscais brasileiros, mas funciona bem com qualquer tipo de comprovante de despesa.',
  },
  {
    id: 3,
    question: 'Meus dados estao seguros?',
    answer: 'Sim. Utilizamos criptografia em transito (TLS 1.3) e em repouso. Os dados de cada empresa sao completamente isolados. Somos conformes com a LGPD e oferecemos trilha de auditoria completa de todas as acoes no sistema.',
  },
  {
    id: 4,
    question: 'Posso testar gratis antes de contratar?',
    answer: 'Com certeza! Oferecemos um plano gratuito com ate 5 relatorios por mes, sem necessidade de cartao de credito. Voce pode usar o sistema a vontade e fazer upgrade quando precisar de mais recursos.',
  },
  {
    id: 5,
    question: 'E se a IA errar na leitura do cupom?',
    answer: 'Nossa IA tem 95% de precisao, mas voce sempre pode revisar e corrigir os dados extraidos antes de enviar o relatorio. O sistema mostra um indicador de confianca para cada extracao, facilitando a identificacao de dados que precisam de revisao.',
  },
]
</script>
