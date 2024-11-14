import { ipcMain } from 'electron'
import * as net from 'net'

export class TunnelManager {
  private client: net.Socket
  private mainWindow: Electron.BrowserWindow
  private ipcSetup: boolean = false

  constructor(window: Electron.BrowserWindow) {
    this.mainWindow = window
    this.client = new net.Socket()
    this.setupTunnel()
    this.setupIPC()
  }

  private setupTunnel(): void {
    this.client.connect(7373, '127.0.0.1', () => {
      console.log('[Tunnel] Connected to Rust backend')
    })

    this.client.on('data', (data: Buffer) => {
      const messages = data.toString().split('\n')
      messages.forEach((msg) => {
        if (msg && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('tunnel-message', msg)
        }
      })
    })

    this.client.on('error', (error) => {
      console.error('[Tunnel] Error:', error.message)
    })

    this.client.on('close', () => {
      console.log('[Tunnel] Connection closed')
    })
  }

  private setupIPC(): void {
    if (this.ipcSetup) return

    ipcMain.on('send-to-tunnel', (_event, message) => {
      if (this.client.writable) {
        this.client.write(JSON.stringify(message) + '\n')
      }
    })

    this.ipcSetup = true
  }

  public cleanup(): void {
    console.log('[Tunnel] Cleaning up...')

    // Remove IPC listeners
    ipcMain.removeAllListeners('send-to-tunnel')
    this.ipcSetup = false

    // Close TCP connection
    if (this.client) {
      this.client.end(() => {
        this.client.destroy()
        console.log('[Tunnel] Connection closed and cleaned up')
      })
    }
  }
}
