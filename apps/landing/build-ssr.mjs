import { createApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import App from './src/App.vue'

async function renderApp() {
  try {
    const app = createApp(App)
    const html = await renderToString(app)
    
    // Ler o index.html template
    const templatePath = resolve(process.cwd(), 'index.html')
    let indexHtml = readFileSync(templatePath, 'utf-8')
    
    // Substituir o div#app vazio pelo conteúdo renderizado
    indexHtml = indexHtml.replace(
      '<div id="app"></div>',
      `<div id="app">${html}</div>`
    )
    
    // Remover o script do módulo principal (não precisa mais carregar Vue)
    // Manter o script de analytics ou outros scripts necessários
    indexHtml = indexHtml.replace(
      /<script[\s\S]*?type="module"[\s\S]*?src="\/src\/main\.ts"[\s\S]*?<\/script>/,
      ''
    )
    
    // Escrever o HTML renderizado na pasta dist
    const distPath = resolve(process.cwd(), 'dist/index.html')
    writeFileSync(distPath, indexHtml, 'utf-8')
    
    console.log('✓ HTML estático renderizado com sucesso')
    return true
  } catch (error) {
    console.error('✗ Erro ao renderizar HTML:', error)
    return false
  }
}

// Executar renderização
renderApp().then(success => {
  process.exit(success ? 0 : 1)
})
