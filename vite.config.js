import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'os'

function getLocalIp() {
  const ifaces = os.networkInterfaces()
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'network-ip-endpoint',
      configureServer(server) {
        server.middlewares.use('/api/network-ip', (req, res) => {
          const ip = getLocalIp()
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ ip }))
        })
      }
    }
  ],
  define: {
    __DEV_NETWORK_IP__: JSON.stringify(getLocalIp()),
  },
  server: {
    host: '0.0.0.0', // Dostęp z sieci lokalnej / Wi-Fi (np. telefon, inny komputer)
    port: 5173,
  }
})
