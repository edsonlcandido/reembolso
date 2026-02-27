/**
 * Plugin para gerar HTML estático (SSG) durante o build
 * Renderiza o conteúdo da landing como HTML puro
 */

import { Plugin } from 'vite'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

export function staticHtmlPlugin(): Plugin {
  return {
    name: 'vite-plugin-static-html',
    async closeBundle() {
      try {
        const outDir = resolve(process.cwd(), 'dist')
        const indexPath = resolve(outDir, 'index.html')
        
        // Ler o HTML gerado pelo Vite
        let html = readFileSync(indexPath, 'utf-8')
        
        // HTML estático com o conteúdo pré-renderizado
        const staticContent = `
    <!-- Header/Navbar -->
    <nav class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="text-2xl font-bold text-primary-600">Reembolsa AI</div>
          <div class="hidden md:flex space-x-8">
            <a href="#features" class="text-gray-700 hover:text-primary-600 transition">Recursos</a>
            <a href="#how-it-works" class="text-gray-700 hover:text-primary-600 transition">Como Funciona</a>
            <a href="#pricing" class="text-gray-700 hover:text-primary-600 transition">Preços</a>
          </div>
          <a href="/app/" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">Login</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-500/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Tire foto do cupom.<br>
            <span class="text-primary-600">A IA faz o resto.</span>
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Sistema completo de reembolso de despesas corporativas. Upload do cupom fiscal, extração automática de dados com IA e aprovação simplificada.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/app/" class="inline-flex items-center justify-center px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition shadow-lg">
              Comece Gratuitamente →
            </a>
            <a href="#how-it-works" class="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition">
              Ver como funciona
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-16">Tudo que você precisa para gerenciar reembolsos</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <article class="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
            <h3 class="text-xl font-bold text-gray-900 mb-3">📷 Captura Inteligente</h3>
            <p class="text-gray-700">Tire foto do cupom fiscal pelo celular ou desktop. A IA extrai valor, data, estabelecimento e categoria automaticamente.</p>
          </article>
          <article class="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <h3 class="text-xl font-bold text-gray-900 mb-3">✓ Aprovação Rápida</h3>
            <p class="text-gray-700">Dashboard centralizado para gestores aprovarem ou rejeitarem despesas com justificativa em poucos cliques.</p>
          </article>
          <article class="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <h3 class="text-xl font-bold text-gray-900 mb-3">📊 Relatórios Detalhados</h3>
            <p class="text-gray-700">Visualize gastos por departamento, categoria ou período. Exporte dados para análises e planejamento.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-16">Como Funciona em 3 Passos</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Tire uma Foto</h3>
            <p class="text-gray-700">Fotografe o cupom fiscal com seu celular ou envie uma imagem do computador.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">A IA Extrai Dados</h3>
            <p class="text-gray-700">Nossa inteligência artificial extrai automaticamente todos os dados relevantes do cupom.</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Aprovação Rápida</h3>
            <p class="text-gray-700">Envie para aprovação. Gestores revisam e aprovam em poucos cliques.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl font-bold text-center text-gray-900 mb-4">Planos Simples e Transparentes</h2>
        <p class="text-center text-gray-600 mb-16 max-w-2xl mx-auto">Escolha o plano que melhor se adequa às necessidades da sua empresa.</p>
        <div class="grid md:grid-cols-3 gap-8">
          <article class="border-2 border-gray-200 rounded-xl p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
            <p class="text-4xl font-bold text-primary-600 mb-6">Grátis</p>
            <ul class="space-y-4 mb-8 text-gray-700">
              <li>✓ Até 10 reembolsos/mês</li>
              <li>✓ Extração automática com IA</li>
              <li>✓ Suporte por email</li>
            </ul>
            <a href="/app/" class="block w-full text-center py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold">Começar Agora</a>
          </article>
          <article class="border-2 border-primary-600 rounded-xl p-8 bg-primary-50 relative">
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Mais Popular</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <p class="text-4xl font-bold text-primary-600 mb-6">R$ 99<span class="text-lg text-gray-600">/mês</span></p>
            <ul class="space-y-4 mb-8 text-gray-700">
              <li>✓ Reembolsos ilimitados</li>
              <li>✓ Extrações avançadas</li>
              <li>✓ Dashboard Analytics</li>
              <li>✓ Suporte prioritário</li>
            </ul>
            <a href="/app/" class="block w-full text-center py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold">Assinar Plano</a>
          </article>
          <article class="border-2 border-gray-200 rounded-xl p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p class="text-4xl font-bold text-primary-600 mb-6">Customizado</p>
            <ul class="space-y-4 mb-8 text-gray-700">
              <li>✓ Suporte 24/7</li>
              <li>✓ Integrações customizadas</li>
              <li>✓ Dedicado Account Manager</li>
              <li>✓ SLA garantido</li>
            </ul>
            <a href="mailto:contato@reembolsa.app" class="block w-full text-center py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold">Solicitar Demo</a>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA Final -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold text-white mb-4">Pronto para Simplificar Seus Reembolsos?</h2>
        <p class="text-xl text-primary-100 mb-8">Começe grátis. Nenhum cartão de crédito necessário.</p>
        <a href="/app/" class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg">
          Comece Gratuitamente →
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="text-lg font-bold mb-4">Reembolsa</h3>
            <p class="text-gray-400">Sistema inteligente de reembolso de despesas.</p>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Produto</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#features" class="hover:text-white transition">Recursos</a></li>
              <li><a href="#pricing" class="hover:text-white transition">Preços</a></li>
              <li><a href="#how-it-works" class="hover:text-white transition">Como Funciona</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Empresa</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="mailto:contato@reembolsa.app" class="hover:text-white transition">Contato</a></li>
              <li><a href="#" class="hover:text-white transition">Privacidade</a></li>
              <li><a href="#" class="hover:text-white transition">Termos</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-4">Redes Sociais</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="https://twitter.com/reembolsa" target="_blank" rel="noopener" class="hover:text-white transition">Twitter</a></li>
              <li><a href="https://linkedin.com/company/reembolsa" target="_blank" rel="noopener" class="hover:text-white transition">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8">
          <p class="text-center text-gray-400">© 2026 Reembolsa AI. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
`

        // Substituir div#app vazio pelo conteúdo estático
        html = html.replace(
          '<div id="app"></div>',
          `<div id="app">${staticContent}</div>`
        )
        
        // Remover o script module que carrega a aplicação Vue
        html = html.replace(
          /<script[^>]*type="module"[^>]*src="[^"]*main\.js[^"]*"[^>]*><\/script>/,
          ''
        )
        
        // Remover o noscript warning (já não é necessário)
        html = html.replace(
          /<noscript>[\s\S]*?<\/noscript>/,
          ''
        )
        
        writeFileSync(indexPath, html, 'utf-8')
        console.log('✓ HTML estático completo gerado')
        
      } catch (error) {
        console.error('⚠ Erro ao gerar HTML estático:', error)
      }
    }
  }
}
