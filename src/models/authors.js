import { getDb } from '../db/connect.js';

const getAllAuthors = async () => {
    const db = getDb();
    const collection = db.collection('authors');
    const authors = await collection.find({}, { projection: { _id: 0 } }).toArray();
    return authors;
};

const getAuthorById = async (authorId) => {
    const db = getDb();
    const collection = db.collection('authors');
    const author = await collection.findOne({ id: authorId }, { projection: { _id: 0 } });
    return author;
};

const createAuthor = async (authorData) => {
    const db = getDb();
    const collection = db.collection('authors');
    await collection.insertOne({ ...authorData });
    return authorData;
};

const updateAuthor = async (authorId, updateData) => {
    const db = getDb();
    const collection = db.collection('authors');
    await collection.updateOne(
        { id: authorId },
        { $set: updateData }
    );
    return { id: authorId, ...updateData };
};

const deleteAuthor = async (authorId) => {
    const db = getDb();
    const collection = db.collection('authors');
    const result = await collection.deleteOne({ id: authorId });
    return result.deletedCount > 0;
};

const authorHasBooks = async (authorId) => {
    const db = getDb();
    const collection = db.collection('books');
    const count = await collection.countDocuments({ authorId });
    return count > 0;
};

export {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
    authorHasBooks
};
