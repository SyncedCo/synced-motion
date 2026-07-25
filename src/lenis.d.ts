import type Lenis from 'lenis'

export interface LenisAdapterOptions {
  gsap: {
    ticker: { add(callback: (time: number) => void): void; remove(callback: (time: number) => void): void; lagSmoothing(value: number): void }
  }
  ScrollTrigger: { update(): void }
  options?: ConstructorParameters<typeof Lenis>[0]
}

export interface LenisAdapter {
  lenis: Lenis
  start(): void
  stop(): void
  scrollTo(...args: Parameters<Lenis['scrollTo']>): ReturnType<Lenis['scrollTo']>
  destroy(): void
}

export declare function createLenisAdapter(options: LenisAdapterOptions): LenisAdapter
