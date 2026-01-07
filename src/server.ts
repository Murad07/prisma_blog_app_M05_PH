import app from "./app"
import { prisma } from "./lib/prisma"

const PORT = process.env.PORT || 5000

async function main() {
    try {
        // Connect the client
        await prisma.$connect()
        console.log('Connected to the database successfully.')

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Error connecting to the database:', error)
    } finally {
        // Disconnect the client
        await prisma.$disconnect()
    }
}

main(); 