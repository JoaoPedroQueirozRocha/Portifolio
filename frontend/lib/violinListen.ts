/* ---------------------------------------------------------------
   Escuta o violino pelo microfone — detecção de altura com a pitchy
   (McLeod Pitch Method, o algoritmo dos afinadores).

   Nada é gravado nem sai do navegador: o áudio vai do microfone para
   um AnalyserNode e de lá para a análise, em memória.

   Mesmo desenho do violinSound.ts: módulo único com estado global e
   `subscribe`, para a UI ler com useSyncExternalStore.
--------------------------------------------------------------- */
import { resumeAudioContext } from "./audioContext"

/** off → asking → on · os outros são finais até tentar de novo */
export type ListenStatus =
  | "off"       // microfone desligado
  | "asking"    // esperando a permissão do navegador
  | "on"        // escutando
  | "denied"    // o usuário (ou a política do site) negou
  | "nomic"     // nenhum microfone disponível
  | "busy"      // microfone em uso por outro programa
  | "insecure"  // sem HTTPS: o navegador nem oferece o microfone
  | "error"

/** Uma leitura de altura. `hz = 0` quando não há nota clara no ar. */
export interface Reading { hz: number; clarity: number }

export type FrameListener = (r: Reading) => void

/* Janela de análise: 2048 amostras ≈ 43 ms a 48 kHz. Cobre de sobra a
   faixa do caderno (Sol³ 196 Hz até ~1250 Hz) e responde rápido. */
const FFT_SIZE = 2048
/* Abaixo disso é ruído de arco, sala ou respiração — não é nota.
   0,9 seria rígido demais para violino com vibrato. */
const CLARITY_MIN = 0.85
/* RMS mínimo, em dB abaixo do som mais alto possível: corta o silêncio */
const VOLUME_MIN_DB = -35

type Detector = { findPitch(input: Float32Array, sampleRate: number): [number, number] }

let status: ListenStatus = "off"
let stream: MediaStream | null = null
let source: MediaStreamAudioSourceNode | null = null
let analyser: AnalyserNode | null = null
let detector: Detector | null = null
let buffer: Float32Array<ArrayBuffer> | null = null
let raf = 0
let muted = false

const statusListeners = new Set<() => void>()
const frameListeners = new Set<FrameListener>()

function setStatus(next: ListenStatus) {
  status = next
  statusListeners.forEach((l) => l())
}

export const getListenStatus = () => status

export function subscribeListen(listener: () => void) {
  statusListeners.add(listener)
  return () => { statusListeners.delete(listener) }
}

/** Recebe cada leitura da análise (~43 ms). Fora do React: quem quiser
 *  mostrar na tela que decida a própria cadência. */
export function onFrame(listener: FrameListener) {
  frameListeners.add(listener)
  return () => { frameListeners.delete(listener) }
}

/** Pausa a análise sem soltar o microfone — usado enquanto o próprio
 *  app toca a nota de referência, senão ele escuta a si mesmo. */
export function setListenMuted(next: boolean) {
  muted = next
}

function errorStatus(err: unknown): ListenStatus {
  const name = err instanceof DOMException ? err.name : ""
  if (name === "NotAllowedError" || name === "SecurityError") return "denied"
  if (name === "NotFoundError" || name === "OverconstrainedError") return "nomic"
  if (name === "NotReadableError" || name === "AbortError") return "busy"
  return "error"
}

/** Liga o microfone e começa a analisar. Chamar a partir de um clique. */
export async function startListening(): Promise<ListenStatus> {
  if (status === "on" || status === "asking") return status
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    setStatus("insecure")
    return status
  }
  setStatus("asking")
  try {
    /* Os três processamentos precisam ficar desligados: o cancelamento de
       eco e a supressão de ruído do navegador tratam nota sustentada como
       ruído estacionário e a apagam; o ganho automático bagunça o volume. */
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    })
    const ctx = await resumeAudioContext()
    const { PitchDetector } = await import("pitchy")
    const d = PitchDetector.forFloat32Array(FFT_SIZE)
    d.clarityThreshold = CLARITY_MIN
    d.minVolumeDecibels = VOLUME_MIN_DB
    detector = d
    buffer = new Float32Array(FFT_SIZE)
    analyser = ctx.createAnalyser()
    analyser.fftSize = FFT_SIZE
    source = ctx.createMediaStreamSource(stream)
    source.connect(analyser) // não conecta no destino: nada é devolvido ao alto-falante
    muted = false
    setStatus("on")
    loop()
    return status
  } catch (err) {
    release()
    setStatus(errorStatus(err))
    return status
  }
}

function loop() {
  raf = requestAnimationFrame(loop)
  if (muted || !analyser || !detector || !buffer) return
  analyser.getFloatTimeDomainData(buffer)
  const [hz, clarity] = detector.findPitch(buffer, analyser.context.sampleRate)
  const reading: Reading = clarity >= CLARITY_MIN ? { hz, clarity } : { hz: 0, clarity }
  frameListeners.forEach((l) => l(reading))
}

function release() {
  cancelAnimationFrame(raf)
  raf = 0
  source?.disconnect()
  // soltar as tracks apaga o indicador de gravação na aba
  stream?.getTracks().forEach((t) => t.stop())
  source = null
  analyser = null
  detector = null
  buffer = null
  stream = null
  muted = false
}

/** Desliga o microfone e para a análise. */
export function stopListening() {
  release()
  setStatus("off")
}
