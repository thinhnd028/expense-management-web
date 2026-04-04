'use client'

import { useEffect } from 'react'

export default function ApiDocsPage() {
  useEffect(() => {
    // Load Swagger UI bundle and init
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'
    script.onload = () => {
      // @ts-expect-error SwaggerUIBundle is loaded from CDN
      window.SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger-ui',
        presets: [
          // @ts-expect-error SwaggerUIBundle is loaded from CDN
          window.SwaggerUIBundle.presets.apis,
          // @ts-expect-error SwaggerUIBundle is loaded from CDN
          window.SwaggerUIBundle.SwaggerUIStandalonePreset,
        ],
        layout: 'BaseLayout',
        deepLinking: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      })
    }
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />
      <div
        id="swagger-ui"
        style={{ minHeight: '100vh' }}
      />
    </>
  )
}
