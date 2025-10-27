import helmet from 'helmet';
import type { RequestHandler } from 'express';

export const helmetConfig = (): RequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // Estilos
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          ...(isProduction ? [] : ["'unsafe-inline'"]),
        ],

        // Scripts
        scriptSrc: ["'self'", ...(isProduction ? [] : ["'unsafe-inline'"])],

        // Imágenes
        imgSrc: ["'self'", 'data:', 'blob:', frontendUrl],

        // Fuentes
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],

        // Conexiones (añade aquí tus APIs externas si las usas)
        connectSrc: [
          "'self'",
          frontendUrl,
          // Ejemplo: 'https://api.tuservicio.com',
        ],

        // Frames
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],

        // Objetos y embebidos
        objectSrc: ["'none'"],
        embedSrc: ["'none'"],

        // Base URI
        baseUri: ["'self'"],

        // Forms
        formAction: ["'self'"],

        // Media
        mediaSrc: ["'self'"],

        // Workers
        workerSrc: ["'self'", 'blob:'],

        // Manifests
        manifestSrc: ["'self'"],

        // Upgrade insecure requests en producción
        ...(isProduction && {
          upgradeInsecureRequests: [],
        }),
      },
      // 🔴 IMPORTANTE: Primero en modo reporte, luego cambiar a false
      reportOnly: isProduction, // Cambia a false después de validar
    },

    // HSTS - Solo en producción
    hsts: isProduction
      ? {
          maxAge: 31536000, // 1 año
          includeSubDomains: true,
          preload: true,
        }
      : false,

    // Frame options
    frameguard: { action: 'deny' },

    // MIME type sniffing
    noSniff: true,

    // XSS Filter
    xssFilter: true,

    // Referrer Policy
    referrerPolicy: {
      policy: ['strict-origin-when-cross-origin'],
    },

    // Cross Domain Policies
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },

    // COEP - Desactivado porque puede romper recursos externos
    crossOriginEmbedderPolicy: false,

    // CORP - Más restrictivo en producción
    crossOriginResourcePolicy: {
      policy: isProduction ? 'same-origin' : 'cross-origin',
    },

    // COOP
    crossOriginOpenerPolicy: {
      policy: 'same-origin',
    },

    // Hide X-Powered-By
    hidePoweredBy: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // DNS Prefetch Control
    dnsPrefetchControl: {
      allow: false,
    },

    // Download Options (IE)
    ieNoOpen: true,
  });
};
