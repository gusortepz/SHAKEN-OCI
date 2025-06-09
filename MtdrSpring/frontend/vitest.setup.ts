// vitest.setup.ts
import { expect } from 'vitest'; // Importa el 'expect' de Vitest
import * as matchers from '@testing-library/jest-dom/matchers'; // Importa los matchers de jest-dom

// Extiende el expect de Vitest con los matchers de jest-dom
expect.extend(matchers);