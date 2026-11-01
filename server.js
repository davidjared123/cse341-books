import app from './app.js';
import { connectToDb, getDb } from './src/db/connect.js';

const PORT = process.env.PORT;

if (!PORT) {
    throw new Error('PORT is not defined.');
}

const startServer = async () => {
    try {
        await connectToDb();

        // Consulta temporal para verificar que los libros se leen de MongoDB
        const books = await getDb().collection('books').find({}).toArray();
        console.log('Book documents:', books);

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

await startServer();