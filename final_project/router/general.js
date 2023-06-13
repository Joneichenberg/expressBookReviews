const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//register user
public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;  
  const authorBooks = [];
  //search through books array and check if author matches
  for (const book in books) {  
    if (books[book].author === author) {  
      authorBooks.push(books[book]);
    }
  }
  
  if (authorBooks.length > 0) {  
    res.send(authorBooks);  
  } else {
    res.status(404).send('No books found for author');  
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title
  const titleBooks = [];

  //search all books in array for title and if mathches send
  for (const book in books){
    if(books[book].title === title){
      titleBooks.push(books[book]);
    }
  }

  if (titleBooks.length > 0) {  
    res.send(titleBooks);  
  } else {
    res.status(404).send('No books found for title');  
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    return res.status(200).json({reviews: reviews})
  }else {
    return res.status(404).json({ message: "Book not found" });
  }

});

//getting the list of books available in the shop using Promise callbacks or async-await with axios
public_users.get("/server/asynbooks", async function (req,res) {
  try {
    let response = await axios.get("http://localhost:5000/");
    console.log(response.data);
    return res.status(200).json(response.data);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Error getting book list"});
  }
});

//Get book details by ISBN using Promises
public_users.get("/server/asynbooks/isbn/:isbn", function (req,res) {
  let {isbn} = req.params;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
  .then(function(response){
    console.log(response.data);
    return res.status(200).json(response.data);
  })
  .catch(function(error){
      console.log(error);
      return res.status(500).json({message: "Error while fetching book details."})
  })
});

//Get book details by author using promises
public_users.get("/server/asynbooks/author/:author", function (req,res) {
  let {author} = req.params;
  axios.get(`http://localhost:5000/author/${author}`)
  .then(function(response){
    console.log(response.data);
    return res.status(200).json(response.data);
  })
  .catch(function(error){
      console.log(error);
      return res.status(500).json({message: "Error while fetching book details."})
  })
});

module.exports.general = public_users;
