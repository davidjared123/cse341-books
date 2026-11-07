# Books API Week 02 Spec

---

# Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:
```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:
```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

---

## Feature 2: Author CRUD Operations

### Goal
Add an `authors` collection and implement full CRUD operations for authors. Authors will use custom string IDs (`a1`, `a2`) consistent with the books model. Every author route must be documented and testable in Swagger.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`
- `name`: string, required, full name of the author
- `birthYear`: number, required, integer representing the birth year (e.g., 1892)

Authors will use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship Safeguards
Books reference authors via `authorId`. Therefore, an author who still has one or more books referencing their `id` must not be deleted.
- When deleting an author, the API must verify if any book in the `books` collection has an `authorId` matching the author's `id`.
- If associated books exist, the API must reject the deletion with a `409 Conflict` status code and an informative error message explaining that books are still associated with the author.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by their custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:
```json
{
  "id": "a3",
  "name": "Jane Austen",
  "birthYear": 1775
}
```

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:
```json
{
  "name": "Jane Austen",
  "birthYear": 1775
}
```

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if a required field is missing
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no author exists with that id
- `409` if the author still has associated books in the `books` collection
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

---

# Specification Evaluation (Review & Analysis)

### 1. Are there any bugs or short-sighted decisions in this specification?
- **Data Validation Strictness**: Version 1 specifies required fields, but does not specify data types, formats, or handling of empty strings/whitespace (e.g., `birthYear` sent as a negative number, a string, or future date, or `publicationDate` with an invalid date string format like `YYYY-MM-DD`).
- **Mutability of `id` in PUT**: The spec does not explicitly state whether clients can pass `id` in the body of a `PUT /books/:id` or `PUT /authors/:id` request. Changing custom `id` via `PUT` would break referential integrity with books or route parameters. The custom `id` must be immutable.
- **MongoDB `_id` Leakage**: When returning documents from MongoDB, the default `_id` is included unless explicitly excluded in the projection (`{ projection: { _id: 0 } }`) or mapped out. This could cause confusion between `_id` and the custom `id`.
- **Handling of Extra Fields**: Clients could send arbitrary unexpected fields in the request body unless input sanitization or whitelisting is applied.

### 2. Are there any security considerations that are missing?
- **NoSQL Injection / Type Confusion**: Parameter inputs like `req.params.id` should be sanitized as strings to prevent query operator injection (e.g., passing `{ $ne: null }`).
- **Input Sanitization**: Strings should be trimmed and checked for reasonable length limits to prevent DoS via massive payloads.
- **Content-Type Enforcement**: Requests with a JSON body (`POST`, `PUT`) should validate the `Content-Type: application/json` header and gracefully handle malformed JSON bodies (Express body parser error handling).

### 3. Are there any efficiency concerns with the current endpoint design?
- **Unbounded Queries**: `GET /books` and `GET /authors` return the entire collection. For small school projects this is fine, but missing indexing on `id` and `authorId` will cause full collection scans. Creating unique indexes on `id` in both collections and an index on `authorId` in `books` ensures \(O(1)\) and efficient foreign key checks.
- **Two-Step Checks without Transactions**: When creating/updating a book, querying the author collection first adds a round-trip. While expected in NoSQL, it should be done efficiently using indexed queries.

### 4. Are any response examples or error behaviors unclear?
- **Error Response Format**: Version 1 specifies status codes (e.g., 400, 404, 409), but does not standardize the error payload structure (e.g., `{ "error": "Description of error" }` vs `{ "message": "..." }`). Standardizing on `{ "error": "message" }` ensures consistent client parsing.
- **Duplicate Custom IDs**: Version 1 notes 400 if ID exists, but 409 Conflict is often considered more semantically descriptive for duplicate resource creation. However, either a 400 or 409 with a clear message like `"Book with id 'b4' already exists"` is necessary.

---

# Version 2: Implementation Specification & Checklist

## Standard Conventions & Global Rules
1. **Response Format**:
   - Successful reads/writes return JSON (except 204 DELETE which returns empty body).
   - All errors return JSON with an `error` key: `{ "error": "<detailed message>" }`.
2. **MongoDB Projection**:
   - All responses should exclude internal MongoDB `_id` (e.g., `{ projection: { _id: 0 } }`) or return objects containing only specified model fields.
3. **Immutability of `id`**:
   - The custom `id` cannot be modified via `PUT`. If passed in the PUT body, it is either ignored or rejected if it differs from `req.params.id`.
4. **Data Sanitization**:
   - String inputs must be trimmed and non-empty.
   - `birthYear` must be an integer between 0 and the current year.
   - `publicationDate` must follow `YYYY-MM-DD` format.

---

## Feature 1: Books CRUD Operations (Revised)

### Data Model (`books` collection)
| Field | Type | Required | Constraints / Description |
|---|---|---|---|
| `id` | String | Yes | Unique custom ID (e.g., `b1`, `b2`). Immutable. |
| `authorId` | String | Yes | Must match an existing author's `id`. |
| `title` | String | Yes | Non-empty string. |
| `publicationDate` | String | Yes | ISO date string (`YYYY-MM-DD`). |

### Book Endpoints

#### 1. `GET /books`
- **Purpose**: Retrieve all books in the database.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "b1",
      "authorId": "a1",
      "title": "The Hobbit",
      "publicationDate": "1937-09-21"
    }
  ]
  ```
- **Errors**: `500 Internal Server Error` -> `{ "error": "Failed to fetch books." }`

#### 2. `GET /books/:id`
- **Purpose**: Retrieve a single book by custom `id`.
- **Response**: `200 OK`
  ```json
  {
    "id": "b1",
    "authorId": "a1",
    "title": "The Hobbit",
    "publicationDate": "1937-09-21"
  }
  ```
- **Errors**:
  - `404 Not Found` -> `{ "error": "Book not found." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to fetch book." }`

#### 3. `POST /books`
- **Purpose**: Create a new book.
- **Request Body**:
  ```json
  {
    "id": "b3",
    "authorId": "a1",
    "title": "The Return of the King",
    "publicationDate": "1955-10-20"
  }
  ```
- **Validation**:
  - All fields (`id`, `authorId`, `title`, `publicationDate`) must be present, non-empty, and valid strings.
  - `id` must not already exist in `books` collection.
  - `authorId` must exist in `authors` collection.
- **Response**: `201 Created`
  ```json
  {
    "id": "b3",
    "authorId": "a1",
    "title": "The Return of the King",
    "publicationDate": "1955-10-20"
  }
  ```
- **Errors**:
  - `400 Bad Request` -> `{ "error": "Missing required fields: id, authorId, title, and publicationDate are required." }`
  - `400 Bad Request` -> `{ "error": "Book with id 'b3' already exists." }`
  - `400 Bad Request` -> `{ "error": "Author with id 'a1' does not exist." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to create book." }`

#### 4. `PUT /books/:id`
- **Purpose**: Update an existing book's details (`authorId`, `title`, `publicationDate`).
- **Request Body**:
  ```json
  {
    "authorId": "a1",
    "title": "The Return of the King (Revised Edition)",
    "publicationDate": "1955-10-20"
  }
  ```
- **Validation**:
  - Required fields in body: `authorId`, `title`, `publicationDate`.
  - `authorId` must exist in `authors` collection.
  - Book with `:id` must exist.
- **Response**: `200 OK`
  ```json
  {
    "id": "b3",
    "authorId": "a1",
    "title": "The Return of the King (Revised Edition)",
    "publicationDate": "1955-10-20"
  }
  ```
- **Errors**:
  - `400 Bad Request` -> `{ "error": "Missing required fields: authorId, title, and publicationDate are required." }`
  - `400 Bad Request` -> `{ "error": "Author with id 'a1' does not exist." }`
  - `404 Not Found` -> `{ "error": "Book not found." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to update book." }`

#### 5. `DELETE /books/:id`
- **Purpose**: Delete a book by custom `id`.
- **Response**: `204 No Content` (empty body)
- **Errors**:
  - `404 Not Found` -> `{ "error": "Book not found." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to delete book." }`

---

## Feature 2: Authors CRUD Operations (Revised)

### Data Model (`authors` collection)
| Field | Type | Required | Constraints / Description |
|---|---|---|---|
| `id` | String | Yes | Unique custom ID (e.g., `a1`, `a2`). Immutable. |
| `name` | String | Yes | Full author name (non-empty string). |
| `birthYear` | Number | Yes | Integer (e.g., 1892). |

### Author Endpoints

#### 1. `GET /authors`
- **Purpose**: Retrieve all authors in the database.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "a1",
      "name": "J.R.R. Tolkien",
      "birthYear": 1892
    }
  ]
  ```
- **Errors**: `500 Internal Server Error` -> `{ "error": "Failed to fetch authors." }`

#### 2. `GET /authors/:id`
- **Purpose**: Retrieve a single author by custom `id`.
- **Response**: `200 OK`
  ```json
  {
    "id": "a1",
    "name": "J.R.R. Tolkien",
    "birthYear": 1892
  }
  ```
- **Errors**:
  - `404 Not Found` -> `{ "error": "Author not found." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to fetch author." }`

#### 3. `POST /authors`
- **Purpose**: Create a new author.
- **Request Body**:
  ```json
  {
    "id": "a2",
    "name": "George R.R. Martin",
    "birthYear": 1948
  }
  ```
- **Validation**:
  - Required fields: `id` (string), `name` (string), `birthYear` (number).
  - `id` must not already exist in `authors` collection.
- **Response**: `201 Created`
  ```json
  {
    "id": "a2",
    "name": "George R.R. Martin",
    "birthYear": 1948
  }
  ```
- **Errors**:
  - `400 Bad Request` -> `{ "error": "Missing or invalid required fields: id, name, and birthYear are required." }`
  - `400 Bad Request` -> `{ "error": "Author with id 'a2' already exists." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to create author." }`

#### 4. `PUT /authors/:id`
- **Purpose**: Update an existing author's details (`name`, `birthYear`).
- **Request Body**:
  ```json
  {
    "name": "George Raymond Richard Martin",
    "birthYear": 1948
  }
  ```
- **Validation**:
  - Required fields: `name` (string), `birthYear` (number).
  - Author with `:id` must exist.
- **Response**: `200 OK`
  ```json
  {
    "id": "a2",
    "name": "George Raymond Richard Martin",
    "birthYear": 1948
  }
  ```
- **Errors**:
  - `400 Bad Request` -> `{ "error": "Missing or invalid required fields: name and birthYear are required." }`
  - `404 Not Found` -> `{ "error": "Author not found." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to update author." }`

#### 5. `DELETE /authors/:id`
- **Purpose**: Delete an author by custom `id`.
- **Integrity Check**:
  - Before deletion, query `books` where `authorId == req.params.id`.
  - If any books are found, reject with `409 Conflict`.
- **Response**: `204 No Content` (empty body)
- **Errors**:
  - `404 Not Found` -> `{ "error": "Author not found." }`
  - `409 Conflict` -> `{ "error": "Cannot delete author: one or more books are associated with this author." }`
  - `500 Internal Server Error` -> `{ "error": "Failed to delete author." }`

---

## Swagger & Deployment Requirements
1. **Swagger Documentation (`/api-docs`)**:
   - All 10 routes (`GET`, `POST`, `PUT`, `DELETE` for books, `GET`, `POST`, `PUT`, `DELETE` for authors) must be fully annotated with JSDoc/Swagger tags.
   - Schemas for Book, Author, and Error payloads must be defined.
   - Example request bodies and response schemas must be testable through the Swagger UI.
2. **Deployment**:
   - Commit and push to GitHub.
   - Verify all routes and the `/api-docs` interface on Render.
