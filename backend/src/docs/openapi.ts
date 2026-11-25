// OpenAPI 3 spec served at /api/docs (Swagger UI) and /api/docs.json
const bearer = [{ bearerAuth: [] }];
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const err = (description: string) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});
const json = (schema: object) => ({ 'application/json': { schema } });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Wallet API',
    version: '1.1.0',
    description:
      'Personal finance API: money sources, transactions, savings and objectives. ' +
      'All balance-changing operations are atomic (single Postgres transaction).',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: {
            type: 'array',
            items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
          },
        },
      },
      Credentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 } },
      },
      Register: {
        allOf: [ref('Credentials'), { type: 'object', required: ['name'], properties: { name: { type: 'string' } } }],
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: { id: { type: 'integer' }, email: { type: 'string' }, name: { type: 'string' } },
          },
        },
      },
      MoneySourceInput: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', example: 'Bank account' },
          type: { type: 'string', example: 'bank' },
          balance: { type: 'number', minimum: 0, example: 1500 },
          description: { type: 'string' },
        },
      },
      MoneySource: {
        allOf: [ref('MoneySourceInput'), { type: 'object', properties: { id: { type: 'integer' } } }],
      },
      TransactionInput: {
        type: 'object',
        required: ['type', 'amount'],
        description: 'expense: source_id required; income: destination_id required; transfer: both.',
        properties: {
          type: { type: 'string', enum: ['income', 'expense', 'transfer'] },
          amount: { type: 'number', minimum: 0.01, multipleOf: 0.01, example: 49.9 },
          description: { type: 'string' },
          source_id: { type: 'integer' },
          destination_id: { type: 'integer' },
        },
      },
      Transaction: {
        allOf: [
          ref('TransactionInput'),
          {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              status: { type: 'string', enum: ['active', 'voided'] },
              date: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      Amount: {
        type: 'object',
        required: ['amount'],
        properties: { amount: { type: 'number', example: 100 }, source_id: { type: 'integer' } },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create an account',
        requestBody: { required: true, content: json(ref('Register')) },
        responses: {
          201: { description: 'Created', content: json(ref('AuthResponse')) },
          400: err('Validation failed'),
          409: err('Email already registered'),
          429: err('Too many attempts'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in and receive a JWT',
        requestBody: { required: true, content: json(ref('Credentials')) },
        responses: {
          200: { description: 'OK', content: json(ref('AuthResponse')) },
          401: err('Invalid credentials'),
          429: err('Too many attempts'),
        },
      },
    },
    '/sources': {
      get: {
        tags: ['Money sources'],
        summary: 'List money sources with total balance',
        security: bearer,
        responses: { 200: { description: 'OK' }, 401: err('Unauthorized') },
      },
      post: {
        tags: ['Money sources'],
        summary: 'Create a money source',
        security: bearer,
        requestBody: { required: true, content: json(ref('MoneySourceInput')) },
        responses: { 201: { description: 'Created', content: json(ref('MoneySource')) }, 400: err('Validation failed') },
      },
    },
    '/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List active transactions (paginated)',
        security: bearer,
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100, default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Create income / expense / transfer and update balances atomically',
        security: bearer,
        requestBody: { required: true, content: json(ref('TransactionInput')) },
        responses: {
          201: { description: 'Created', content: json(ref('Transaction')) },
          400: err('Validation failed or insufficient balance'),
          404: err('Source/destination not found'),
        },
      },
    },
    '/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get a transaction with its modification history',
        security: bearer,
        parameters: [idParam],
        responses: { 200: { description: 'OK' }, 404: err('Not found') },
      },
      put: {
        tags: ['Transactions'],
        summary: 'Edit amount and/or description (balances re-adjusted, change logged)',
        security: bearer,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: json({
            type: 'object',
            properties: { amount: { type: 'number' }, description: { type: 'string', nullable: true } },
          }),
        },
        responses: { 200: { description: 'OK' }, 400: err('Invalid or insufficient balance'), 404: err('Not found') },
      },
    },
    '/transactions/{id}/void': {
      post: {
        tags: ['Transactions'],
        summary: 'Void a transaction and reverse its balance effects',
        security: bearer,
        parameters: [idParam],
        responses: { 200: { description: 'OK' }, 400: err('Already voided'), 404: err('Not found') },
      },
    },
    '/savings/{id}/deposit': {
      post: {
        tags: ['Savings'],
        summary: 'Deposit into a saving (optionally debiting a money source)',
        security: bearer,
        parameters: [idParam],
        requestBody: { required: true, content: json(ref('Amount')) },
        responses: { 200: { description: 'OK' }, 400: err('Insufficient balance'), 404: err('Not found') },
      },
    },
    '/objectives/{id}/assign': {
      post: {
        tags: ['Objectives'],
        summary: 'Assign money from a source to an objective',
        security: bearer,
        parameters: [idParam],
        requestBody: { required: true, content: json(ref('Amount')) },
        responses: { 200: { description: 'OK' }, 400: err('Insufficient balance'), 404: err('Not found') },
      },
    },
    '/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Totals and recent activity',
        security: bearer,
        responses: { 200: { description: 'OK' } },
      },
    },
  },
};
