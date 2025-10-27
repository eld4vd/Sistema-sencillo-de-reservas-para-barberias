// LOGGER - Sistema de logging para desarrollo y producción.
// En desarrollo muestra todo en consola; en producción deja visibles warn/error.
// Los helpers exportados (authLogger, apiLogger, etc.) permiten prefijos por sección.

class Logger {
  private isDev = import.meta.env.DEV;

  // Log general disponible solo en desarrollo.
  log(...args: unknown[]): void {
    if (this.isDev) {
      console.log(...args);
    }
  }

  // Mensajes de información solo en desarrollo.
  info(...args: unknown[]): void {
    if (this.isDev) {
      console.info(...args);
    }
  }

  // Advertencias visibles en cualquier entorno.
  warn(...args: unknown[]): void {
    console.warn(...args);
  }

  // Errores siempre visibles; aquí podríamos enganchar un servicio externo.
  error(...args: unknown[]): void {
    console.error(...args);
    
    // TODO: En producción, enviar a servicio de logging como Sentry
  }

  // Mensajes de debug solo cuando Vite corre en modo DEV.
  debug(...args: unknown[]): void {
    if (this.isDev) {
      console.debug(...args);
    }
  }

  // Crea un logger que agrega el prefijo [Categoría] antes del mensaje.
  withCategory(category: string) {
    return {
      log: (...args: unknown[]) => this.log(`[${category}]`, ...args),
      info: (...args: unknown[]) => this.info(`[${category}]`, ...args),
      warn: (...args: unknown[]) => this.warn(`[${category}]`, ...args),
      error: (...args: unknown[]) => this.error(`[${category}]`, ...args),
      debug: (...args: unknown[]) => this.debug(`[${category}]`, ...args),
    };
  }
}

// Instancia singleton del logger principal.
export const logger = new Logger();

// Loggers con categorías predefinidas para uso común.
export const authLogger = logger.withCategory('Auth');
export const apiLogger = logger.withCategory('API');
export const productLogger = logger.withCategory('Productos');
