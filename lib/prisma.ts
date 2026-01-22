import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    _prisma: PrismaClient | undefined
}

/**
 * Lazy-initialized Prisma client getter
 */
function getPrismaClient(): PrismaClient {
    // Return cached instance if available
    if (globalForPrisma._prisma) {
        return globalForPrisma._prisma
    }

    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set')
    }

    console.log('🔌 [Prisma] Initializing with pg adapter...')

    // Create standard pg pool
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Neon
    })

    // Create Prisma pg adapter
    const adapter = new PrismaPg(pool)

    // Create Prisma client
    const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })

    // Cache in development
    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma._prisma = client
    }

    return client
}

// Export Prisma client via Proxy for lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
    get(_, prop) {
        const client = getPrismaClient()
        return (client as unknown as Record<string, unknown>)[prop as string]
    }
})
