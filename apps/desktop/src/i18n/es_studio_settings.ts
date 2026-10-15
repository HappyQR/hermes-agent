// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
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
    scopeMenuTitle: 'Estos ajustes se aplican a',
    searchResults: 'Resultados de búsqueda',
    pageMenu: 'Página de ajustes'
  },
  sections: {
    general: {
      language: 'Idioma e inicio',
      tips: 'Consejos y tutoriales',
      system: 'Ventana y sistema'
    },
    appearance: {
      look: 'Apariencia',
      theme: 'Temas',
      themeNote: 'Los temas se guardan por perfil. También puedes instalar uno desde el VS Code Marketplace.',
      window: 'Ventana',
      typography: 'Fuentes y escala',
      pet: 'Mascota'
    },
    chat: {
      replies: 'Respuestas',
      messages: 'Mensajes',
      media: 'Contenido incrustado y adjuntos'
    },
    notifications: {
      alerts: 'Alertas de escritorio',
      sounds: 'Sonido y hápticos'
    },
    keyboard: {
      shortcuts: 'Atajos',
      shortcutsNote: 'Haz clic en una combinación para cambiarla. Los conflictos se señalan en la fila.',
      quickAsk: 'Pregunta rápida',
      hud: 'HUD y captura de ventana'
    },
    models: {
      main: 'Modelo principal',
      fallbacks: 'Modelos de respaldo',
      fallbacksNote: 'Se prueban en orden cuando el modelo principal no está disponible o se queda sin crédito.',
      auxiliary: 'Modelos auxiliares',
      auxiliaryDisclosure: 'Tareas en segundo plano (visión, compresión, títulos…)',
      moa: 'Mezcla de agentes',
      moaDisclosure: 'Varios modelos responden juntos y un agregador combina las respuestas (/moa)'
    },
    providers: {
      accounts: 'Cuentas',
      apiKeys: 'Claves API',
      endpoints: 'Endpoints personalizados',
      local: 'Modelos locales'
    },
    memory: {
      memory: 'Memoria a largo plazo',
      context: 'Contexto y compresión',
      contextDisclosure: 'Detalles de compresión',
      maintenance: 'Mantenimiento'
    },
    voice: {
      conversation: 'Conversación por voz',
      stt: 'Voz a texto',
      tts: 'Lectura en voz alta',
      wake: 'Palabra de activación'
    },
    workspace: {
      projects: 'Proyectos',
      execution: 'Ejecución',
      checkpoints: 'Puntos de control',
      checkpointsNote: 'Se guardan automáticamente antes de cada cambio en archivos; puedes restaurarlos desde un mensaje.'
    },
    safety: {
      approvals: 'Aprobación de comandos',
      privacy: 'Privacidad',
      browser: 'Navegador y red'
    },
    passwords: {
      credentials: 'Credenciales guardadas',
      credentialsNote: 'Se usan cuando Hermes inicia sesión o rellena formularios por ti.',
      managers: 'Gestores de contraseñas'
    },
    tools: {
      toolKeys: 'Claves de servicios de herramientas',
      serverEnv: 'Variables de entorno del servidor',
      toolsets: 'Conjuntos de herramientas'
    },
    gateways: {
      connection: 'Esta ventana se conecta a',
      saved: 'Conexiones guardadas',
      remoteUpdates: 'Actualizaciones remotas'
    },
    sessions: {
      retention: 'Archivo y retención',
      archived: 'Sesiones archivadas'
    },
    plugins: {
      pages: 'Ajustes de plugins',
      manage: 'Instalar y activar'
    },
    advanced: {
      agent: 'Agente',
      terminal: 'Backend del terminal',
      subagents: 'Subagentes',
      output: 'Límites de salida',
      updates: 'Actualizaciones en la app'
    },
    about: {
      updates: 'Actualizaciones',
      config: 'Configuración',
      diagnostics: 'Diagnóstico',
      uninstall: 'Desinstalar'
    }
  },
  rows: {
    modeLight: 'Claro',
    modeDark: 'Oscuro',
    modeAuto: 'Automático',
    modeGroup: 'Modo de color',
    accentTitle: 'Color de acento',
    accentDesc: 'El color de los botones, las selecciones y los enlaces',
    accentNous: 'Azul',
    accentHermes: 'Azul Hermes',
    accentViolet: 'Morado',
    accentPink: 'Rosa',
    accentRed: 'Rojo',
    accentOrange: 'Naranja',
    accentGreen: 'Verde',
    accentMono: 'Grafito',
    thinkingTitle: 'Razonamiento',
    thinkingDesc: 'Cómo aparece el razonamiento del modelo en las respuestas',
    thinkingShow: 'Mostrar',
    thinkingCollapse: 'Contraído',
    thinkingHide: 'Oculto',
    timestampsTitle: 'Mostrar marcas de tiempo',
    hapticsTitle: 'Respuesta háptica',
    hapticsDesc: 'Señales hápticas al arrastrar y al terminar un trabajo. Al desactivarlas también se silencia el sonido de finalización.',
    wakeTitle: 'Escuchar la palabra de activación',
    wakeDesc: 'Escucha en segundo plano e inicia una conversación por voz al oír la frase',
    wakePhrase: 'Frase de activación',
    memoryOpenTitle: 'Ver y editar',
    memoryOpenDesc: 'Explora el grafo y la lista en la página Memoria.',
    memoryOpenAction: 'Abrir memoria',
    resetMemoryTitle: 'Restablecer memoria',
    resetMemoryDesc: 'Vacía MEMORY.md. No se puede deshacer.',
    resetProfileTitle: 'Restablecer perfil de usuario',
    resetProfileDesc: 'Vacía USER.md.',
    resetAction: 'Restablecer…',
    maintenanceActiveOnly: profile => `Los restablecimientos se aplican al perfil que usa esta ventana («${profile}»).`,
    toolsetsTitle: 'Activar o desactivar conjuntos de herramientas',
    toolsetsDesc: page => `Se gestionan en «${page} › Herramientas».`,
    openAction: 'Abrir',
    pluginsManageDesc: 'Instalar, actualizar, activar y desinstalar',
    pluginsManageAction: 'Abrir plugins',
    exportDesc: 'Guarda hermes-config.json. No incluye las claves.',
    exportAction: 'Exportar…',
    importAction: 'Importar…',
    resetConfigDesc: 'Solo afecta al perfil actual. Los ajustes de apariencia de este dispositivo no cambian.',
    resetConfigAction: 'Restablecer…',
    diagnosticsTitle: 'Enviar diagnóstico',
    diagnosticsDesc: 'Sube registros anonimizados para soporte. Confirmas antes del envío y el enlace caduca.',
    diagnosticsAction: 'Enviar…',
    logsTitle: 'Carpeta de registros',
    logsActionMac: 'Mostrar en Finder',
    logsActionOther: 'Abrir carpeta',
    localModelsDesc: 'Descarga modelos abiertos y ejecútalos en este equipo.',
    localModelsAction: 'Gestionar modelos locales…',
    sendTestAction: 'Enviar',
    resetShortcutsAction: 'Restaurar todo'
  }
}
