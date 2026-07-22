declare module 'gif.js' {
  interface GifOptions {
    workers?: number
    quality?: number
    width: number
    height: number
    workerScript?: string
    background?: string
  }

  interface AddFrameOptions {
    copy?: boolean
    delay?: number
    dispose?: number
  }

  class GIF {
    constructor(options: GifOptions)
    addFrame(element: CanvasRenderingContext2D | HTMLCanvasElement | HTMLImageElement, options?: AddFrameOptions): void
    on(event: 'progress', callback: (progress: number) => void): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'error', callback: (error: Error) => void): void
    render(): void
  }

  export default GIF
}