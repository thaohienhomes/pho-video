import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Global cache for Prisma client (prevents multiple instances in dev)
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Prisma client initialization using @prisma/adapter-pg
// This uses standard 'pg' package which is more stable than @neondatabase/serverless
function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL

    console.log('[Prisma] Creating client with pg adapter...')
    console.log('[Prisma] DATABASE_URL exists:', !!connectionString)

    if (!connectionString) {
        throw new Error('[Prisma] DATABASE_URL environment variable is not set!')
    }

    // Use standard pg Pool - more reliable than Neon serverless Pool
    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false } // Required for Neon
    })

    const adapter = new PrismaPg(pool)

    console.log('[Prisma] Client created successfully with pg adapter')
    return new PrismaClient({ adapter })
}

// Get or create Prisma client
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db
}

// ==========================================
// User Management
// ==========================================

export async function getOrCreateUser(clerkId: string, email?: string | null) {
    const user = await db.user.upsert({
        where: { clerkId },
        update: { email },
        create: {
            clerkId,
            email,
            credits: 50 // Default starter credits
        },
    })
    return user
}

// ==========================================
// Credit System
// ==========================================

export async function checkCredits(userId: string, required: number) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    })
    return (user?.credits ?? 0) >= required
}

export async function deductCredits(userId: string, amount: number) {
    // Only deduct if user has enough credits
    // In a real transactional system, we'd use a transaction or check constraints
    const user = await db.user.update({
        where: { id: userId },
        data: {
            credits: {
                decrement: amount
            }
        }
    })
    return user.credits
}

export async function refundCredits(userId: string, amount: number) {
    const user = await db.user.update({
        where: { id: userId },
        data: {
            credits: {
                increment: amount
            }
        }
    })
    return user.credits
}

// ==========================================
// Generation History
// ==========================================

export async function createGeneration(data: {
    userId: string
    type?: string
    imageUrl?: string
    imageUrls?: string[]
    videoUrl?: string
    status?: string
    cost: number
    // The prompt and model fields were present in the original function's data type
    // and are used in the create call in the provided edit.
    // To maintain syntactic correctness, they are kept here.
    prompt: string
    model: string
}) {
    return db.generation.create({
        data: {
            userId: data.userId,
            prompt: data.prompt,
            model: data.model,
            type: data.type || "video",
            imageUrl: data.imageUrl,
            imageUrls: data.imageUrls ? (data.imageUrls as any) : null,
            videoUrl: data.videoUrl,
            status: data.status || "pending",
            cost: data.cost,
        },
    })
}

export async function updateGeneration(
    id: string,
    data: {
        status?: string
        imageUrl?: string
        imageUrls?: string[]
        videoUrl?: string
        audioUrl?: string
        upscaledUrl?: string
    }
) {
    return await db.generation.update({
        where: { id },
        data: {
            ...data,
            imageUrls: data.imageUrls ? (data.imageUrls as any) : undefined
        }
    })
}

export async function getUserGenerations(userId: string) {
    return await db.generation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })
}
