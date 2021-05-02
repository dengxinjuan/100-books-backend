CREATE TABLE users
(
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1)
);

CREATE TABLE reads
(
    read_id SERIAL PRIMARY KEY ,
    username VARCHAR
(25)
        REFERENCES users ON
DELETE CASCADE,
    book_id TEXT
        NOT NULL
);

CREATE TABLE wishlists
(
    wish_id SERIAL PRIMARY KEY,
    username VARCHAR
(25)
        REFERENCES users ON
DELETE CASCADE,
    book_id TEXT
        NOT NULL
);

--seed some sample data--

INSERT INTO users
    (username, password, first_name, last_name, email)
VALUES
    ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'joel@joelburton.com');

INSERT INTO users
    (username, password, first_name, last_name, email)
VALUES
    ('dengxinjuan',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'xinjuan',
        'deng',
        'dengxinj@gmail.com');

--insert data into reads
INSERT INTO reads
    (username,book_id)
VALUES('testuser', 'qMB4DwAAQBAJ');
INSERT INTO reads
    (username,book_id)
VALUES('testuser', 'bCpzAgAAQBAJ');
INSERT INTO reads
    (username,book_id)
VALUES('testuser', 'u1LaDwAAQBAJ');
INSERT INTO reads
    (username,book_id)
VALUES('testuser', 'bKRPXoFe728C');


----insert data into wishlist
INSERT INTO wishlists
    (username,book_id)
VALUES('testuser', 'crrfVT2XdmoC');
INSERT INTO wishlists
    (username,book_id)
VALUES('testuser', 'ca9EAQAAMAAJ');
