import pino from 'pino'

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
})

// Log helpers
export const log = {
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, error?: Error | object) => {
    if (error instanceof Error) {
      logger.error({ err: error }, msg)
    } else {
      logger.error(error, msg)
    }
  },
  debug: (msg: string, data?: object) => logger.debug(data, msg),
  trace: (msg: string, data?: object) => logger.trace(data, msg),
}

// Create child logger for specific context
export function createLogger(context: string) {
  return logger.child({ context })
}
