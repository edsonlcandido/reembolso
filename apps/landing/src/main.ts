import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <span class="text-xl font-bold text-gray-900">Reembolso<span class="text-primary-600">IA</span></span>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Recursos</a>
            <a href="#how-it-works" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Como Funciona</a>
            <a href="#pricing" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Planos</a>
            <a href="#faq" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">FAQ</a>
          </div>
          <div class="flex items-center space-x-3">
            <a href="/app/" class="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">Entrar</a>
            <a href="/app/" class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-sm">
              Criar Conta Gratis
            </a>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-500/5"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div class="text-center max-w-4xl mx-auto">
            <div class="inline-flex items-center px-4 py-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-sm font-medium rounded-full mb-8 fade-in">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              OCR Inteligente com IA
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 fade-in delay-100">
              Tire foto do cupom.<br>
              <span class="text-primary-600">A IA faz o resto.</span>
            </h1>
            <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 fade-in delay-200">
              Sistema completo de reembolso de despesas corporativas. Upload do cupom fiscal, extração automática de dados com IA e aprovação simplificada.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8 fade-in delay-300">
              <a href="/app/" class="inline-flex items-center justify-center px-8 py-3.5 bg-primary-600 text-white text-base font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-600/25">
                Comece Gratuitamente
                <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </a>
              <a href="#how-it-works" class="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-all">
                Ver como funciona
              </a>
            </div>
            <div class="flex items-center justify-center space-x-6 text-sm text-gray-500 fade-in delay-400">
              <div class="flex items-center"><svg class="w-4 h-4 mr-1.5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Gratis por 30 dias</div>
              <div class="flex items-center"><svg class="w-4 h-4 mr-1.5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Sem cartao de credito</div>
              <div class="flex items-center"><svg class="w-4 h-4 mr-1.5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Setup em 5 minutos</div>
            </div>
          </div>

          <!-- Hero Visual -->
          <div class="mt-16 max-w-5xl mx-auto fade-in delay-400">
            <div class="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                <span class="ml-3 text-gray-400 text-sm">Dashboard - Reembolso Inteligente</span>
              </div>
              <div class="bg-gray-50 rounded-xl p-6 sm:p-8">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <p class="text-sm text-gray-500 mb-1">Despesas do Mes</p>
                    <p class="text-2xl font-bold text-gray-900">R$ 4.250<span class="text-sm font-normal text-gray-400">,00</span></p>
                    <p class="text-xs text-secondary-500 mt-1">+12% vs mes anterior</p>
                  </div>
                  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <p class="text-sm text-gray-500 mb-1">Pendentes</p>
                    <p class="text-2xl font-bold text-accent-500">3</p>
                    <p class="text-xs text-gray-400 mt-1">aguardando aprovacao</p>
                  </div>
                  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <p class="text-sm text-gray-500 mb-1">Aprovados</p>
                    <p class="text-2xl font-bold text-secondary-500">12</p>
                    <p class="text-xs text-gray-400 mt-1">neste periodo</p>
                  </div>
                </div>
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div class="flex items-center justify-between mb-3">
                    <p class="font-semibold text-gray-900 text-sm">Ultimos Reembolsos</p>
                    <span class="text-xs text-primary-600 font-medium">Ver todos</span>
                  </div>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between py-2 border-b border-gray-50">
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">🍽</div>
                        <div><p class="text-sm font-medium text-gray-900">Restaurante Sabor</p><p class="text-xs text-gray-400">15/02/2026</p></div>
                      </div>
                      <div class="text-right"><p class="text-sm font-semibold text-gray-900">R$ 85,50</p><span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Aprovado</span></div>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-gray-50">
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🚕</div>
                        <div><p class="text-sm font-medium text-gray-900">Taxi Premium</p><p class="text-xs text-gray-400">14/02/2026</p></div>
                      </div>
                      <div class="text-right"><p class="text-sm font-semibold text-gray-900">R$ 45,00</p><span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">Pendente</span></div>
                    </div>
                    <div class="flex items-center justify-between py-2">
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">🏨</div>
                        <div><p class="text-sm font-medium text-gray-900">Hotel Central</p><p class="text-xs text-gray-400">13/02/2026</p></div>
                      </div>
                      <div class="text-right"><p class="text-sm font-semibold text-gray-900">R$ 320,00</p><span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Aprovado</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Problem & Solution -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">O problema com reembolsos tradicionais</h2>
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <p class="text-gray-600">Preenchimento manual de formularios e tedioso e sujeito a erros</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <p class="text-gray-600">Cupons fiscais se perdem ou ficam ilegíveis com o tempo</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <p class="text-gray-600">Processo de aprovacao lento e descentralizado</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <p class="text-gray-600">Falta de rastreabilidade e auditoria das despesas</p>
                </div>
              </div>
            </div>
            <div>
              <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Nossa <span class="text-primary-600">solucao</span></h2>
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-secondary-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p class="text-gray-600">IA extrai dados do cupom automaticamente em segundos</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-secondary-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p class="text-gray-600">Fotos digitais ficam armazenadas com seguranca para sempre</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-secondary-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p class="text-gray-600">Dashboard centralizado para aprovacao em poucos cliques</p>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-6 h-6 bg-secondary-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <p class="text-gray-600">Trilha de auditoria completa e compliance garantido</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="py-16 bg-primary-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center">
              <p class="text-4xl sm:text-5xl font-extrabold text-white">80%</p>
              <p class="text-primary-200 mt-2 text-sm sm:text-base">mais rapido que o processo manual</p>
            </div>
            <div class="text-center">
              <p class="text-4xl sm:text-5xl font-extrabold text-white">95%</p>
              <p class="text-primary-200 mt-2 text-sm sm:text-base">de precisao no OCR</p>
            </div>
            <div class="text-center">
              <p class="text-4xl sm:text-5xl font-extrabold text-white">&lt;10s</p>
              <p class="text-primary-200 mt-2 text-sm sm:text-base">para processar cada cupom</p>
            </div>
            <div class="text-center">
              <p class="text-4xl sm:text-5xl font-extrabold text-white">60%</p>
              <p class="text-primary-200 mt-2 text-sm sm:text-base">de reducao em custos operacionais</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section id="features" class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tudo que voce precisa para gerenciar reembolsos</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">Recursos poderosos para funcionarios, gestores e administradores.</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                <svg class="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Captura Inteligente</h3>
              <p class="text-gray-600 text-sm">Tire foto do cupom fiscal pelo celular ou desktop. A IA extrai valor, data, estabelecimento e categoria automaticamente.</p>
            </div>
            <div class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-secondary-200 hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-secondary-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary-500 transition-colors">
                <svg class="w-6 h-6 text-secondary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Aprovacao Rapida</h3>
              <p class="text-gray-600 text-sm">Dashboard centralizado para gestores aprovarem ou rejeitarem despesas com justificativa em poucos cliques.</p>
            </div>
            <div class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <svg class="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Multi-empresa</h3>
              <p class="text-gray-600 text-sm">Gerencie multiplas empresas com dados isolados, configuracoes personalizadas e centros de custo independentes.</p>
            </div>
            <div class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-accent-200 hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent-500 transition-colors">
                <svg class="w-6 h-6 text-accent-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Relatorios Completos</h3>
              <p class="text-gray-600 text-sm">Crie relatorios de despesas com agrupamento por periodo, calculo automatico de totais e rastreamento de status.</p>
            </div>
            <div class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500 transition-colors">
                <svg class="w-6 h-6 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Compliance e Auditoria</h3>
              <p class="text-gray-600 text-sm">Trilha de auditoria completa, logs imutaveis e conformidade com LGPD. Tudo rastreavel e exportavel.</p>
            </div>
            <div class="group p-6 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <svg class="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Mobile-first</h3>
              <p class="text-gray-600 text-sm">Interface responsiva que funciona perfeitamente em qualquer dispositivo. Registre despesas em qualquer lugar.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How it Works -->
      <section id="how-it-works" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">Tres passos simples para um reembolso sem estresse.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div class="relative text-center">
              <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/30">
                <span class="text-2xl font-bold text-white">1</span>
              </div>
              <div class="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200"></div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Fotografe o cupom</h3>
              <p class="text-gray-600">Use a camera do celular ou faca upload de uma foto. Aceita JPG, PNG e PDF.</p>
            </div>
            <div class="relative text-center">
              <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/30">
                <span class="text-2xl font-bold text-white">2</span>
              </div>
              <div class="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary-200"></div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">IA extrai os dados</h3>
              <p class="text-gray-600">Em menos de 10 segundos, a inteligencia artificial extrai valor, data, estabelecimento e categoria.</p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-600/30">
                <span class="text-2xl font-bold text-white">3</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Aprove e reembolse</h3>
              <p class="text-gray-600">O gestor recebe a notificacao, revisa os dados e aprova com um clique. Simples assim.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">O que nossos clientes dizem</h2>
            <p class="text-lg text-gray-600">Empresas que ja transformaram seu processo de reembolso.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="flex text-accent-500">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
              </div>
              <p class="text-gray-600 mb-6 italic">"Reduziu nosso tempo de processamento de reembolsos em 75%. Nossos vendedores adoram a simplicidade de tirar uma foto e pronto."</p>
              <div class="flex items-center">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">MS</div>
                <div class="ml-3">
                  <p class="font-semibold text-gray-900 text-sm">Maria Silva</p>
                  <p class="text-gray-500 text-xs">Gerente Financeiro, TechCorp</p>
                </div>
              </div>
            </div>
            <div class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="flex text-accent-500">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
              </div>
              <p class="text-gray-600 mb-6 italic">"A precisao do OCR e impressionante. Antes, gastávamos horas digitando dados de cupons. Agora e tudo automatico."</p>
              <div class="flex items-center">
                <div class="w-10 h-10 bg-secondary-500/10 rounded-full flex items-center justify-center font-bold text-secondary-600">JM</div>
                <div class="ml-3">
                  <p class="font-semibold text-gray-900 text-sm">Joao Mendes</p>
                  <p class="text-gray-500 text-xs">Controller, Grupo Innovare</p>
                </div>
              </div>
            </div>
            <div class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div class="flex items-center mb-4">
                <div class="flex text-accent-500">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                </div>
              </div>
              <p class="text-gray-600 mb-6 italic">"Finalmente um sistema que funciona no celular. Minha equipe de vendas consegue registrar despesas na hora, direto do campo."</p>
              <div class="flex items-center">
                <div class="w-10 h-10 bg-accent-500/10 rounded-full flex items-center justify-center font-bold text-accent-600">AC</div>
                <div class="ml-3">
                  <p class="font-semibold text-gray-900 text-sm">Ana Costa</p>
                  <p class="text-gray-500 text-xs">Diretora Comercial, VendaMais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section id="pricing" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Planos para cada necessidade</h2>
            <p class="text-lg text-gray-600">Comece gratis e escale conforme sua empresa cresce.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <!-- Free -->
            <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Gratuito</h3>
              <p class="text-sm text-gray-500 mb-6">Para profissionais individuais</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold text-gray-900">R$ 0</span>
                <span class="text-gray-500">/mes</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Ate 10 relatorios/mes</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>OCR basico</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>1 empresa</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Suporte por email</li>
              </ul>
              <a href="/app/" class="block w-full text-center px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all">Comecar Gratis</a>
            </div>
            <!-- Pro -->
            <div class="bg-white rounded-2xl p-8 border-2 border-primary-600 shadow-xl relative">
              <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span class="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">Mais Popular</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-2">Profissional</h3>
              <p class="text-sm text-gray-500 mb-6">Para equipes em crescimento</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold text-gray-900">R$ 29</span>
                <span class="text-gray-500">/usuario/mes</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Relatorios ilimitados</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>OCR avancado com IA</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Ate 5 empresas</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Fluxo de aprovacao</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Suporte prioritario</li>
              </ul>
              <a href="/app/" class="block w-full text-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg">Comecar Agora</a>
            </div>
            <!-- Enterprise -->
            <div class="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 class="text-lg font-bold text-gray-900 mb-2">Empresarial</h3>
              <p class="text-sm text-gray-500 mb-6">Para grandes corporacoes</p>
              <div class="mb-6">
                <span class="text-4xl font-extrabold text-gray-900">Custom</span>
              </div>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Tudo do Profissional</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Empresas ilimitadas</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>SSO / SAML</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>API dedicada</li>
                <li class="flex items-center text-sm text-gray-600"><svg class="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>SLA garantido</li>
              </ul>
              <a href="#" class="block w-full text-center px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary-300 hover:text-primary-600 transition-all">Falar com Vendas</a>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="py-20">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p class="text-lg text-gray-600">Tire suas duvidas sobre o Reembolso Inteligente.</p>
          </div>
          <div class="space-y-4" id="faq-list">
            <div class="faq-item border border-gray-200 rounded-xl overflow-hidden">
              <button class="faq-toggle w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors" onclick="this.parentElement.classList.toggle('open')">
                <span class="font-semibold text-gray-900">O que e OCR e como funciona?</span>
                <svg class="faq-icon w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="faq-content px-5 pb-5 hidden">
                <p class="text-gray-600 text-sm">OCR (Reconhecimento Optico de Caracteres) e a tecnologia que permite extrair texto de imagens. Nosso sistema usa inteligencia artificial avancada (GPT-4 Vision) para nao apenas ler o texto do cupom, mas entender e categorizar automaticamente os dados como valor, data, estabelecimento e tipo de despesa.</p>
              </div>
            </div>
            <div class="faq-item border border-gray-200 rounded-xl overflow-hidden">
              <button class="faq-toggle w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors" onclick="this.parentElement.classList.toggle('open')">
                <span class="font-semibold text-gray-900">Quais tipos de cupom sao aceitos?</span>
                <svg class="faq-icon w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="faq-content px-5 pb-5 hidden">
                <p class="text-gray-600 text-sm">Aceitamos fotos de cupons fiscais, notas fiscais, recibos e comprovantes em formatos JPG, PNG e PDF. A IA e treinada especialmente para cupons fiscais brasileiros, mas funciona bem com qualquer tipo de comprovante de despesa.</p>
              </div>
            </div>
            <div class="faq-item border border-gray-200 rounded-xl overflow-hidden">
              <button class="faq-toggle w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors" onclick="this.parentElement.classList.toggle('open')">
                <span class="font-semibold text-gray-900">Meus dados estao seguros?</span>
                <svg class="faq-icon w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="faq-content px-5 pb-5 hidden">
                <p class="text-gray-600 text-sm">Sim. Utilizamos criptografia em transito (TLS 1.3) e em repouso. Os dados de cada empresa sao completamente isolados. Somos conformes com a LGPD e oferecemos trilha de auditoria completa de todas as acoes no sistema.</p>
              </div>
            </div>
            <div class="faq-item border border-gray-200 rounded-xl overflow-hidden">
              <button class="faq-toggle w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors" onclick="this.parentElement.classList.toggle('open')">
                <span class="font-semibold text-gray-900">Posso testar gratis antes de contratar?</span>
                <svg class="faq-icon w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="faq-content px-5 pb-5 hidden">
                <p class="text-gray-600 text-sm">Com certeza! Oferecemos um plano gratuito com ate 10 relatorios por mes, sem necessidade de cartao de credito. Voce pode usar o sistema a vontade e fazer upgrade quando precisar de mais recursos.</p>
              </div>
            </div>
            <div class="faq-item border border-gray-200 rounded-xl overflow-hidden">
              <button class="faq-toggle w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors" onclick="this.parentElement.classList.toggle('open')">
                <span class="font-semibold text-gray-900">E se a IA errar na leitura do cupom?</span>
                <svg class="faq-icon w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div class="faq-content px-5 pb-5 hidden">
                <p class="text-gray-600 text-sm">Nossa IA tem 95% de precisao, mas voce sempre pode revisar e corrigir os dados extraidos antes de enviar o relatorio. O sistema mostra um indicador de confianca para cada extracao, facilitando a identificacao de dados que precisam de revisao.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Final -->
      <section class="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">Pronto para revolucionar seus reembolsos?</h2>
          <p class="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">Junte-se a centenas de empresas que ja economizam tempo e dinheiro com o Reembolso Inteligente.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/app/" class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 text-lg font-bold rounded-xl hover:bg-primary-50 transition-all shadow-xl">
              Comecar Gratuitamente
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            </a>
          </div>
          <p class="text-primary-200 text-sm mt-6">Gratis por 30 dias. Sem cartao de credito. Cancele quando quiser.</p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <span class="text-lg font-bold text-white">ReembolsoIA</span>
            </div>
            <p class="text-sm">Sistema inteligente de reembolso de despesas corporativas com OCR via IA.</p>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Produto</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#features" class="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#pricing" class="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#how-it-works" class="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#faq" class="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Empresa</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Carreiras</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Privacidade</a></li>
              <li><a href="#" class="hover:text-white transition-colors">LGPD</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
          <p>&copy; 2026 ReembolsoIA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
`

document.querySelectorAll('.faq-item').forEach(item => {
  const content = item.querySelector('.faq-content') as HTMLElement
  const icon = item.querySelector('.faq-icon') as HTMLElement
  if (!content || !icon) return

  const observer = new MutationObserver(() => {
    const isOpen = item.classList.contains('open')
    content.classList.toggle('hidden', !isOpen)
    icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
  })

  observer.observe(item, { attributes: true, attributeFilter: ['class'] })
})
