import express from 'express';
import { getBooksHandler, getBookByIdHandler } from './controllers/books.js';
import {
    getAuthorsHandler,
    getAuthorByIdHandler,
    createAuthorHandler,
    updateAuthorHandler,
    deleteAuthorHandler
} from './controllers/authors.js';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Author:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - birthYear
 *       properties:
 *         id:
 *           type: string
 *           example: "a1"
 *         name:
 *           type: string
 *           example: "J.R.R. Tolkien"
 *         birthYear:
 *           type: integer
 *           example: 1892
 *     AuthorInput:
 *       type: object
 *       required:
 *         - name
 *         - birthYear
 *       properties:
 *         name:
 *           type: string
 *           example: "J.R.R. Tolkien"
 *         birthYear:
 *           type: integer
 *           example: 1892
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message description"
 */

/**
 * @openapi
 * /books:
 *   get:
 *     summary: Get all books
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Books returned successfully
 *       500:
 *         description: Unable to retrieve books
 */
router.get('/books', getBooksHandler);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get one book by id
 *     tags:
 *       - Books
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The custom book id, such as b1
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Unable to retrieve book
 */
router.get('/books/:id', getBookByIdHandler);

/**
 * @openapi
 * /authors:
 *   get:
 *     summary: Get all authors
 *     tags:
 *       - Authors
 *     responses:
 *       200:
 *         description: Authors returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *       500:
 *         description: Unable to retrieve authors
 *   post:
 *     summary: Create a new author
 *     tags:
 *       - Authors
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Author'
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Missing or invalid required fields or ID already exists
 *       500:
 *         description: Unable to create author
 */
router.get('/authors', getAuthorsHandler);
router.post('/authors', createAuthorHandler);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     summary: Get one author by id
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Custom author id, such as a1
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Author returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to retrieve author
 *   put:
 *     summary: Update an author
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Custom author id, such as a1
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorInput'
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       400:
 *         description: Missing or invalid required fields
 *       404:
 *         description: Author not found
 *       500:
 *         description: Unable to update author
 *   delete:
 *     summary: Delete an author
 *     tags:
 *       - Authors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Custom author id, such as a1
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Author deleted successfully (no content)
 *       404:
 *         description: Author not found
 *       409:
 *         description: Cannot delete author because one or more books are associated with this author
 *       500:
 *         description: Unable to delete author
 */
router.get('/authors/:id', getAuthorByIdHandler);
router.put('/authors/:id', updateAuthorHandler);
router.delete('/authors/:id', deleteAuthorHandler);

export default router;
