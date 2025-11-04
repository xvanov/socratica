/**
 * KaTeX Configuration
 * 
 * Centralized configuration for KaTeX math rendering library.
 * Provides consistent error handling and rendering options across the application.
 * 
 * Advanced Notation Support:
 * KaTeX supports advanced mathematical notation by default, including:
 * - Matrix notation: \begin{pmatrix}...\end{pmatrix}, \begin{bmatrix}...\end{bmatrix}, etc.
 * - Summation and product notation: \sum_{lower}^{upper}, \prod_{lower}^{upper}
 * - Integrals and derivatives: \int, \iint, \iiint, \oint, \frac{d}{dx}, \frac{\partial}{\partial x}
 * - Greek letters: \alpha, \beta, \gamma, \Delta, \Theta, \Pi, \Sigma, etc.
 * - Special symbols: \in, \notin, \subset, \leq, \geq, \neq, \rightarrow, \forall, \exists, \infty, etc.
 * - Nested expressions: Fully supported (matrices within matrices, sums within fractions, etc.)
 */

import type { KaTeXOptions } from 'katex';

/**
 * TypeScript type for advanced notation configuration
 * Extends KaTeXOptions with documentation for advanced notation support
 */
export interface AdvancedNotationConfig extends KaTeXOptions {
  /** When false, KaTeX renders errors as HTML instead of throwing exceptions */
  throwOnError: false;
  /** Color for error messages when LaTeX is malformed */
  errorColor: string;
  /** Custom macro definitions for LaTeX expressions (extend as needed for algebra notation) */
  macros: Record<string, string>;
}

/**
 * KaTeX configuration options with advanced notation support
 * 
 * @property throwOnError - When false, KaTeX will render errors as HTML instead of throwing
 * @property errorColor - Color to use for error messages (default: #cc0000)
 * @property macros - Custom macro definitions for LaTeX expressions
 * 
 * Supported Advanced Notation:
 * - Matrices: \begin{pmatrix}...\end{pmatrix}, \begin{bmatrix}...\end{bmatrix}, etc.
 * - Summation: \sum_{i=1}^{n} expression
 * - Product: \prod_{i=1}^{n} expression
 * - Integrals: \int_{a}^{b}, \iint, \iiint, \oint
 * - Derivatives: \frac{d}{dx}, f'(x), \frac{\partial}{\partial x}
 * - Greek letters: All common lowercase and uppercase Greek letters
 * - Special symbols: Set operations, relations, arrows, logic operators, etc.
 * - Nested expressions: Fully supported by KaTeX
 */
export const KATEX_CONFIG: AdvancedNotationConfig = {
  throwOnError: false, // Graceful error handling - don't break app on malformed LaTeX
  errorColor: '#cc0000', // Red color for error messages
  // Custom macros can be added here if needed for specific algebra notation
  // Example: macros: { '\RR': '\\mathbb{R}' } for real numbers
  macros: {},
};

/**
 * Export configuration for use with react-katex components
 * This configuration ensures consistent rendering behavior across inline and block math
 * 
 * Note: react-katex components may need to be configured separately if they don't accept
 * KaTeXOptions directly. The throwOnError behavior is handled by KaTeX itself.
 */
export default KATEX_CONFIG;

