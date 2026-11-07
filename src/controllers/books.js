import {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} from '../models/books.js';
import { getAuthorById } from '../models/authors.js';

const getBooksHandler = async (req, res) => {
    try {
        const books = await getAllBooks();
        return res.status(200).json(books);
    } catch (error) {
        console.error('GET /books failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getBookByIdHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const book = await getBookById(requestedId);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error('GET /books/:id failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const createBookHandler = async (req, res) => {
    const { id, authorId, title, publicationDate } = req.body;

    if (
        !id || typeof id !== 'string' || !id.trim() ||
        !authorId || typeof authorId !== 'string' || !authorId.trim() ||
        !title || typeof title !== 'string' || !title.trim() ||
        !publicationDate || typeof publicationDate !== 'string' || !publicationDate.trim()
    ) {
        return res.status(400).json({
            error: 'Missing required fields: id, authorId, title, and publicationDate are required.'
        });
    }

    const trimmedId = id.trim();
    const trimmedAuthorId = authorId.trim();
    const trimmedTitle = title.trim();
    const trimmedPublicationDate = publicationDate.trim();

    try {
        const existingBook = await getBookById(trimmedId);
        if (existingBook) {
            return res.status(400).json({ error: `Book with id '${trimmedId}' already exists.` });
        }

        const existingAuthor = await getAuthorById(trimmedAuthorId);
        if (!existingAuthor) {
            return res.status(400).json({ error: `Author with id '${trimmedAuthorId}' does not exist.` });
        }

        const newBook = {
            id: trimmedId,
            authorId: trimmedAuthorId,
            title: trimmedTitle,
            publicationDate: trimmedPublicationDate
        };

        await createBook(newBook);
        return res.status(201).json(newBook);
    } catch (error) {
        console.error('POST /books failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const updateBookHandler = async (req, res) => {
    const requestedId = req.params.id;
    const { authorId, title, publicationDate } = req.body;

    if (
        !authorId || typeof authorId !== 'string' || !authorId.trim() ||
        !title || typeof title !== 'string' || !title.trim() ||
        !publicationDate || typeof publicationDate !== 'string' || !publicationDate.trim()
    ) {
        return res.status(400).json({
            error: 'Missing required fields: authorId, title, and publicationDate are required.'
        });
    }

    const trimmedAuthorId = authorId.trim();
    const trimmedTitle = title.trim();
    const trimmedPublicationDate = publicationDate.trim();

    try {
        const existingBook = await getBookById(requestedId);
        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const existingAuthor = await getAuthorById(trimmedAuthorId);
        if (!existingAuthor) {
            return res.status(400).json({ error: `Author with id '${trimmedAuthorId}' does not exist.` });
        }

        const updated = await updateBook(requestedId, {
            authorId: trimmedAuthorId,
            title: trimmedTitle,
            publicationDate: trimmedPublicationDate
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error('PUT /books/:id failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteBookHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const existingBook = await getBookById(requestedId);
        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        await deleteBook(requestedId);
        return res.status(204).send();
    } catch (error) {
        console.error('DELETE /books/:id failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export {
    getBooksHandler,
    getBookByIdHandler,
    createBookHandler,
    updateBookHandler,
    deleteBookHandler
};
