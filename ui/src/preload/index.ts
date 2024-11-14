import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  send: (message: string): void => {
    ipcRenderer.send('send-to-tunnel', message)
  },
  onMessage: (callback: (message: string) => void): (() => void) => {
    const subscription = (_event: unknown, message: string): void => callback(message)
    ipcRenderer.on('tunnel-message', subscription)

    return () => {
      ipcRenderer.removeListener('tunnel-message', subscription)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
