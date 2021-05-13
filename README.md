# 100-books-backend

# deployed

https://books100backend.herokuapp.com/

# Description

It is the backend created for the 100-books project.

# Tech

express, node.js, jwt, morgan, postgre, jsonschema, cors, bcrypt

# Data

![data schema](./images/100books.png)

# Routes

# auth

[POST] /auth/register

- - POST /auth/register: { user } => { token }
- user must include { username, password, firstName, lastName, email }

[POST] /auth/token
-- POST /auth/token: { username, password } => { token }

```
{"username":"dog",
"password":"123456"}
```

# users

[GET] /users

- return all the users info

[GET] /users/:username

- return the user's info
- sample return

* ```
     {
      "users": {
        "username": "testuser",
        "firstName": "Test",
        "lastName": "User",
        "email": "joel@joelburton.com",
        "reads": [
          "qMB4DwAAQBAJ",
          "bCpzAgAAQBAJ",
          "u1LaDwAAQBAJ",
          "bKRPXoFe728C"
        ],
        "wishlist": [
          "crrfVT2XdmoC",
          "ca9EAQAAMAAJ"
        ]
      }
    }
  ```

[DELETE] users/:username

- token required.

- delete the user

[POST] users/:username/read/:id

- token required.

- add user's read book id

[DELETE] users/:username/unread/:id

- token required.

- delete user's read book id

[POST] users/wish/:id

- token required.

- add user's wishlist book id

[DELETE] users/unwish/:id

- token required.

- remove users wish book id

[PATCH] users/:username

- token required.

- ensure correct user. Only the correct user can patch the user.
- You couldnt change the username. It is primary key couldnt be changed.

* Data can include:

```
{ firstName, lastName, password, email }
```

-
- Returns

```
{ username, firstName, lastName, email }
```

-

# Test

- Using supertest to test the function. To run test, simply type 'jest'.

```
jest
```

# Protected Route:

some route are authoriaztion required. You must provide token in the body.

```
{"_token": "XXXXXXX"}
```

To be continue.
