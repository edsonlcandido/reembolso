<template>
  <section id="faq" class="py-20">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
        <p class="text-lg text-gray-600">Tire suas dúvidas sobre o Reembolso Inteligente.</p>
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
    question: 'O que é OCR e como funciona?',
    answer: 'OCR (Reconhecimento Óptico de Caracteres) é a tecnologia que permite extrair texto de imagens. Nosso sistema usa inteligência artificial avançada (GPT-4 Vision) para não apenas ler o texto do cupom, mas entender e categorizar automaticamente os dados como valor, data, estabelecimento e tipo de despesa.',
  },
  {
    id: 2,
    question: 'Quais tipos de cupom são aceitos?',
    answer: 'Aceitamos fotos de cupons fiscais, notas fiscais, recibos e comprovantes em formatos JPG, PNG e PDF. A IA é treinada especialmente para cupons fiscais brasileiros, mas funciona bem com qualquer tipo de comprovante de despesa.',
  },
  {
    id: 3,
    question: 'Meus dados estao seguros?',
    answer: 'Sim. Utilizamos criptografia em trânsito (TLS 1.3) e em repouso. Os dados de cada empresa são completamente isolados. Somos conformes com a LGPD e oferecemos trilha de auditoria completa de todas as ações no sistema.',
  },
  {
    id: 4,
    question: 'Posso testar grátis antes de contratar?',
    answer: 'Com certeza! Oferecemos um plano gratuito com até 5 relatórios por mês, sem necessidade de cartão de crédito. Você pode usar o sistema à vontade e fazer upgrade quando precisar de mais recursos.',
  },
  {
    id: 5,
    question: 'E se a IA errar na leitura do cupom?',
    answer: 'Nossa IA tem 95% de precisão, mas você sempre pode revisar e corrigir os dados extraídos antes de enviar o relatório. O sistema mostra um indicador de confiança para cada extração, facilitando a identificação de dados que precisam de revisão.',
  },
]
</script>
