import { defineConfig } from 'prisma/define-config'

const databaseUrl = process.env.DATABASE_URL

console.log('DEBUG: DATABASE_URL is', databaseUrl ? 'defined' : 'undefined')

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Please set it in your environment variables.')
}

export default defineConfig({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
})
