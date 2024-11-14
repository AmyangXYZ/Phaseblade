import { ElectronAPI } from '@electron-toolkit/preload'

export interface TunnelAPI {
  send: (message: string) => void
  onMessage: (callback: (message: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: TunnelAPI
  }
}
