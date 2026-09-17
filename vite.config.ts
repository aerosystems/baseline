import { defineConfig, type Plugin, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Vite serves .docx without a Content-Type, and a browser given an empty type
// refuses to save the file. Static hosting sets the header on its own.
function docxMimeType(): Plugin {
  const setDocxType: Connect.NextHandleFunction = (req, res, next) => {
    if (req.url?.split('?')[0].endsWith('.docx')) {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
    }
    next()
  }

  return {
    name: 'docx-mime-type',
    configureServer: (server) => server.middlewares.use(setDocxType),
    configurePreviewServer: (server) => server.middlewares.use(setDocxType),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), docxMimeType()],
  base: '/baseline/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.md'],
})
