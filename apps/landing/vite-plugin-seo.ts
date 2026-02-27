import { Plugin } from 'vite'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'

export function seoPlugin(): Plugin {
  return {
    name: 'vite-plugin-seo',
    async closeBundle() {
      const outDir = resolve(process.cwd(), 'dist')

      // Gerar sitemap.xml
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.mobile.googlebot.com/schemas/mobile-0.9">
  <url>
    <loc>https://reembolsa.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf-8')
      console.log('✓ sitemap.xml gerado')

      // Gerar robots.txt
      const robots = `User-agent: *
Allow: /
Disallow: /admin/

# Sitemap
Sitemap: https://reembolsa.app/sitemap.xml

# Crawl delay (opcional)
Crawl-delay: 1`

      writeFileSync(resolve(outDir, 'robots.txt'), robots, 'utf-8')
      console.log('✓ robots.txt gerado')

      // Otimizar HTML para SEO estático
      try {
        const indexPath = resolve(outDir, 'index.html')
        let html = readFileSync(indexPath, 'utf-8')
        
        // Adicionar preload para crítico CSS/fonts
        html = html.replace(
          '  <link rel="preconnect" href="https://fonts.googleapis.com">',
          `  <link rel="preload" as="style" href="/css/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">`
        )
        
        // Adicionar meta noindex se necessário em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
          html = html.replace(
            'content="index, follow,',
            'content="noindex, nofollow,'
          )
        }
        
        writeFileSync(indexPath, html, 'utf-8')
        console.log('✓ HTML otimizado para SEO')
      } catch (e) {
        console.log('⚠ Não foi possível otimizar HTML')
      }
    }
  }
}
