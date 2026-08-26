/// <reference types="vite/client" />

declare module 'react-dom/client' {
  import { ReactNode } from 'react'
  export function createRoot(container: Element | DocumentFragment): Root
  export function createRoot(container: Element | DocumentFragment, options?: CreateRootOptions): Root
  export interface Root {
    render(children: ReactNode): void
    unmount(): void
  }
  export interface CreateRootOptions {
    onCaughtError?: (error: Error, errorInfo: React.ErrorInfo) => void
    onUncaughtError?: (error: Error, errorInfo: React.ErrorInfo) => void
    onRecoverableError?: (error: Error, errorInfo: React.ErrorInfo) => void
  }
}

declare module 'react-dom' {
  import { ReactNode } from 'react'
  export function createRoot(container: Element | DocumentFragment): Root
  export interface Root {
    render(children: ReactNode): void
    unmount(): void
  }
}

declare module '*.css' {
  const content: string
  export default content
}
