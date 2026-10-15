// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const esStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: 'Buscar en ajustes',
  pages: {
    general: {
      title: 'General',
      hero: 'Idioma, inicio, consejos y comportamiento de la ventana.'
    },
    appearance: {
      title: 'Apariencia',
      hero: 'Colores, temas, cristal de la ventana, fuentes y mascotas.'
    },
    chat: {
      title: 'Chat',
      hero: 'Estilo de las respuestas y cómo se muestran el razonamiento, las llamadas a herramientas y los mensajes.'
    },
    notifications: {
      title: 'Notificaciones',
      hero: 'Qué puede interrumpirte y el sonido cuando termina un trabajo.'
    },
    keyboard: {
      title: 'Teclado y atajos',
      hero: 'Atajos, pregunta rápida, el gesto del HUD y la captura de ventanas.'
    },
    models: {
      title: 'Modelos',
      hero: 'El modelo predeterminado, los de respaldo y los modelos auxiliares de las tareas en segundo plano.'
    },
    providers: {
      title: 'Cuentas y proveedores',
      hero: 'Cuentas conectadas, claves API, endpoints personalizados y modelos locales.'
    },
    memory: {
      title: 'Memoria y contexto',
      hero: 'Qué recuerda Hermes, cuánto, y cómo se comprimen las conversaciones largas.'
    },
    voice: {
      title: 'Voz',
      hero: 'Conversación por voz, voz a texto, lectura en voz alta y palabra de activación.'
    },
    workspace: {
      title: 'Espacio de trabajo',
      hero: 'Carpetas de proyecto, dónde se ejecutan los comandos y puntos de control de archivos.'
    },
    safety: {
      title: 'Seguridad y privacidad',
      hero: 'Aprobación de comandos, privacidad, el navegador y el acceso a redes privadas.'
    },
    passwords: {
      title: 'Contraseñas e inicios de sesión',
      hero: 'Las credenciales que usa Hermes cuando inicia sesión en sitios por ti.'
    },
    tools: {
      title: 'Herramientas y claves',
      hero: 'Claves API de servicios de herramientas y variables de entorno del servidor.'
    },
    gateways: {
      title: 'Gateways y conexiones',
      hero: 'A qué Hermes se conecta esta ventana y tus conexiones guardadas.'
    },
    sessions: {
      title: 'Sesiones y archivo',
      hero: 'Archivado automático y sesiones archivadas.'
    },
    plugins: {
      title: 'Plugins',
      hero: page => `Ajustes de los plugins instalados. Se instalan y activan en «${page} › Plugins».`
    },
    billing: {
      title: 'Facturación',
      hero: 'Saldo, plan, recarga automática y límites de gasto.'
    },
    advanced: {
      title: 'Avanzado',
      hero: 'Pasos del agente, backend del terminal, subagentes y límites de salida. Para quien conoce bien Hermes.'
    },
    about: {
      title: 'Acerca de Hermes',
      hero: 'Versión, actualizaciones, copia de seguridad de la configuración y desinstalación.'
    }
  },
  window: {
    navLabel: 'Categorías de ajustes',
    noResults: query => `No hay resultados para «${query}»`,
    categoryResult: 'Categoría',
    onlyThisMac: 'Solo este Mac',
    onlyThisDevice: 'Solo este dispositivo',
    appliesToProfile: profile => `Se aplica a «${profile}»`,
    appliesTo: 'Se aplica a',
    scopeMenuTitle: 'Estos ajustes se aplican a'
  }
}
