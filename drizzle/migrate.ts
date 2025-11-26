import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { env } from '../src/env.js'

async function runMigration() {
    console.log('Migration started ⌛')

    // Not using the getDbUrl helper function because we aren't copying that into our runtime app prior to deployment in our Dockerfile. We'll live with the code duplication.
    const dbUrl = env.DATABASE_URL

    if (!dbUrl) throw new Error('No database url found')

    const client = postgres(dbUrl, {
        max: 1,
        ssl: "prefer"
    })

    const db = drizzle(client)
    try {
        await migrate(db, { migrationsFolder: './drizzle' })
        console.log('Migration completed ✅')
    } catch (error) {
        console.error('Migration failed 🚨:', error)
    } finally {
        await client.end()
    }
}

runMigration().catch((error) => console.error('Error in migration process 🚨:', error))