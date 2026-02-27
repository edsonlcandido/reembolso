/**
 * Plugin para gerar HTML estático (SSG) durante o build
 * O build-ssr.mjs renderiza os componentes Vue para HTML puro
 */

import { Plugin } from 'vite'

export function staticHtmlPlugin(): Plugin {
  return {
    name: 'vite-plugin-static-html',
    async closeBundle() {
      console.log('✓ Build Vite concluído. O build-ssr.mjs irá renderizar Vue para HTML estático')
    }
  }
}
