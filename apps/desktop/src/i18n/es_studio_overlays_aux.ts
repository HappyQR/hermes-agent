// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const esStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'Pregunta a Hermes…',
    disconnected: 'Sin conexión: abre Hermes para volver a conectar',
    sendTo: 'Enviar a',
    targetLabel: 'Sesión de destino',
    targetCurrent: 'Chat actual',
    targetNew: 'Nueva sesión',
    send: 'enviar',
    dismiss: 'cerrar',
    summon: combo => `${combo} desde cualquier app`,
    deliveryFailed: 'Hermes no pudo entregar el mensaje.'
  },
  wake: {
    listening: 'Escuchando'
  },
  pet: {
    label: name => `Mascota: ${name}`,
    messagePlaceholder: 'Mensaje…',
    openInHermes: 'Abrir en Hermes',
    lines: {
      run: [
        'trabajando…',
        'en ello…',
        'calculando…',
        'trasteando…',
        'cocinando…',
        'en los detalles…',
        'conectando…',
        'avanzando…',
        'concentrado…',
        'martilleando…'
      ],
      review: [
        'pensando…',
        'leyendo…',
        'revisando…',
        'meditando…',
        'uniendo puntos…',
        'evaluando…',
        'rastreando…',
        'rumiando…',
        'tramando…',
        'mmm…'
      ],
      failed: [
        'un tropiezo',
        'vaya',
        'se rompió',
        'uf',
        'atascado'
      ],
      waiting: [
        'tu turno',
        'todo tuyo',
        'te toca',
        'la pelota está en tu tejado',
        'esperando órdenes'
      ],
      idle: [
        'hola',
        '¿necesitas algo?',
        'todo tranquilo',
        'a la espera',
        '¿un descanso?'
      ]
    }
  },
  boot: {
    connecting: 'Conectando con Hermes…',
    step: (current, total) => `Paso ${current} de ${total}`
  }
}
