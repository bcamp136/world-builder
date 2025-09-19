import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { StripeProvider } from './components/StripeProvider'

// Import Mantine styles
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/tiptap/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StripeProvider>
      <AuthProvider>
        <MantineProvider>
          <ModalsProvider
            modalProps={{
              centered: true,
              overlayProps: { backgroundOpacity: 0.55, blur: 3 },
            }}
          >
            <Notifications />
            <App />
          </ModalsProvider>
        </MantineProvider>
      </AuthProvider>
    </StripeProvider>
  </StrictMode>
)
