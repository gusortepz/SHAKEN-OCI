import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configurar el servidor MSW
export const server = setupServer(...handlers)