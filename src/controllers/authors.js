import {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    authorHasBooks
} from '../models/authors.js';

const getAuthorsHandler = async (req, res) => {
    try {
        const authors = await getAllAuthors();
        return res.status(200).json(authors);
    } catch (error) {
        console.error('GET /authors failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getAuthorByIdHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const author = await getAuthorById(requestedId);

        if (!author) {
            return res.status(404).json({ error: 'Author not found' });
        }

        return res.status(200).json(author);
    } catch (error) {
        console.error('GET /authors/:id failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const createAuthorHandler = async (req, res) => {
    const { id, name, birthYear } = req.body;

    if (
        !id || typeof id !== 'string' || !id.trim() ||
        !name || typeof name !== 'string' || !name.trim() ||
        birthYear === undefined || birthYear === null || typeof birthYear !== 'number' || Number.isNaN(birthYear)
    ) {
        return res.status(400).json({
            error: 'Missing or invalid required fields: id (string), name (string), and birthYear (number) are required.'
        });
    }

    const trimmedId = id.trim();
    const trimmedName = name.trim();

    try {
        const existingAuthor = await getAuthorById(trimmedId);
        if (existingAuthor) {
            return res.status(400).json({ error: `Author with id '${trimmedId}' already exists.` });
        }

        const newAuthor = {
            id: trimmedId,
            name: trimmedName,
            birthYear
        };

        await createAuthor(newAuthor);
        return res.status(201).json(newAuthor);
    } catch (error) {
        console.error('POST /authors failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const updateAuthorHandler = async (req, res) => {
    const requestedId = req.params.id;
    const { name, birthYear } = req.body;

    if (
        !name || typeof name !== 'string' || !name.trim() ||
        birthYear === undefined || birthYear === null || typeof birthYear !== 'number' || Number.isNaN(birthYear)
    ) {
        return res.status(400).json({
            error: 'Missing or invalid required fields: name (string) and birthYear (number) are required.'
        });
    }

    const trimmedName = name.trim();

    try {
        const existingAuthor = await getAuthorById(requestedId);
        if (!existingAuthor) {
            return res.status(404).json({ error: 'Author not found' });
        }

        const updated = await updateAuthor(requestedId, {
            name: trimmedName,
            birthYear
        });

        return res.status(200).json(updated);
    } catch (error) {
        console.error('PUT /authors/:id failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteAuthorHandler = async (req, res) => {
    const requestedId = req.params.id;

    try {
        const existingAuthor = await getAuthorById(requestedId);
        if (!existingAuthor) {
            return res.status(404).json({ error: 'Author not found' });
        }

        const hasBooks = await authorHasBooks(requestedId);
        if (hasBooks) {
            return res.status(409).json({
                error: 'Cannot delete author: one or more books are associated with this author.'
            });
        }

        await deleteAuthor(requestedId);
        return res.status(204).send();
    } catch (error) {
        console.error('DELETE /authors/:id failed:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export {
    getAuthorsHandler,
    getAuthorByIdHandler,
    createAuthorHandler,
    updateAuthorHandler,
    deleteAuthorHandler
};
