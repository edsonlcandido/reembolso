import { renderToString } from '@vue/server-renderer'
import { createApp } from 'vue'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// Importar App compilado pelo Vite após o build
const __dirname = fileURLToPath(new URL('.', import.meta.url))

async function renderApp() {
  try {
    // Importar App.vue compiled by Vite - use default export from main.js
    const module = await import('./dist/js/main.js')
    const App = module.default
    
    if (!App) {
      console.warn('⚠ App component não encontrado. Usando HTML estático do Vite.')
      return true
    }
    
    // Renderizar App para HTML string
    const app = createApp(App)
    const renderedHtml = await renderToString(app)
    
    // Ler template HTML
    const templatePath = resolve(__dirname, 'index.html')
    let html = readFileSync(templatePath, 'utf-8')
    
    // Ler HTML compilado pelo Vite
    const distPath = resolve(__dirname, 'dist/index.html')
    let distHtml = readFileSync(distPath, 'utf-8')
    
    // Substituir conteúdo do app
    distHtml = distHtml.replace(
      '<div id="app"></div>',
      `<div id="app">${renderedHtml}</div>`
    )
    
    // Remover scripts que carregam Vue (não necessário mais)
    distHtml = distHtml.replace(/<script[^>]*type="module"[^>]*><\/script>/g, '')
    
    // Guardar HTML renderizado
    writeFileSync(distPath, distHtml, 'utf-8')
    
    console.log('✓ HTML estático renderizado com sucesso')
    return true
  } catch (error) {
    console.warn('⚠ SSR renderization falhou, mantendo output estático:', error.message)
    // Não falhar o build, apenas continuar com HTML estático do Vite
    return true
  }
}

renderApp().then(success => {
  process.exit(success ? 0 : 1)
})

