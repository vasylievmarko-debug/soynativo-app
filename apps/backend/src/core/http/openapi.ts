import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '@config/env';

/**
 * OpenAPI spec is generated from JSDoc annotations placed alongside route
 * handlers. As we add modules, simply add `@openapi` blocks above the
 * controller methods — no central spec file to keep in sync.
 */
export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Soynativo API',
      version: '1.0.0',
      description: 'Language learning platform API',
    },
    servers: [{ url: `${env.API_PREFIX}/${env.API_VERSION}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/modules/**/*.controller.ts', 'src/modules/**/*.routes.ts'],
});
