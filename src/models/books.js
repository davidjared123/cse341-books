import { getDb } from '../db/connect.js';

const getAllBooks = async () => {
    const db = getDb();
    const collection = db.collection('books');
    const books = await collection.find({}, { projection: { _id: 0 } }).toArray();
    return books;
};

const getBookById = async (bookId) => {
    const db = getDb();
    const collection = db.collection('books');
    const book = await collection.findOne({ id: bookId }, { projection: { _id: 0 } });
    return book;
};

const createBook = async (bookData) => {
    const db = getDb();
    const collection = db.collection('books');
    await collection.insertOne({ ...bookData });
    return bookData;
};

const updateBook = async (bookId, updateData) => {
    const db = getDb();
    const collection = db.collection('books');
    await collection.updateOne(
        { id: bookId },
        { $set: updateData }
    );
    return { id: bookId, ...updateData };
};

const deleteBook = async (bookId) => {
    const db = getDb();
    const collection = db.collection('books');
    const result = await collection.deleteOne({ id: bookId });
    return result.deletedCount > 0;
};

export {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
