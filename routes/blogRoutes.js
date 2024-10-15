const express = require('express');
const router = express.Router();

// Temporary storage for blog posts
let posts = [];

// Route to render the homepage with all posts
router.get('/', async (req, res) => {
  try {
    const result = await req.pool.query('SELECT * FROM blogs ORDER BY date_created DESC');
    res.render('index', { posts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving blog posts');
  }
});


// Route to create a new post
router.post('/new', async (req, res) => {
  const { title, content, creator_name } = req.body;

  try {
    // Insert the new post into the blogs table
    await req.pool.query(
      'INSERT INTO blogs (title, body, creator_name, date_created) VALUES ($1, $2, $3, NOW())',
      [title, content, creator_name]
    );

    // Redirect to the homepage after successfully creating the post
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating a new post');
  }
});


// Route to view a single post
router.get('/post/:id', (req, res) => {
    const postId = parseInt(req.params.id);  
    const post = posts[postId];  
  
    if (post) {
      res.render('posts', { post });  
    } else {
      res.status(404).send('Post not found'); 
    }
  });

// GET route to render the edit form with the existing post data
router.get('/edit/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    // Fetch the post by ID from the database
    const result = await req.pool.query('SELECT * FROM blogs WHERE blog_id = $1', [postId]);

    if (result.rows.length > 0) {
      // Render the edit form, passing the post data to the view
      res.render('edit', { post: result.rows[0], postId });
    } else {
      res.status(404).send('Post not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching post for editing');
  }
});


// Route to handle post update after form submission
router.post('/edit/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, content, author } = req.body;

  try {
    // Update the post in the database
    await req.pool.query(
      'UPDATE blogs SET title = $1, body = $2, creator_name = $3, date_created = NOW() WHERE blog_id = $4', 
      [title, content, author, postId]
    );

    // Redirect to the homepage after updating
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating post');
  }
});


// Route to handle post deletion
router.post('/delete/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    // Delete the post from the database
    await req.pool.query('DELETE FROM blogs WHERE blog_id = $1', [postId]);

    // Redirect to the homepage after deletion
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting post');
  }
});

// GET route to render the signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});


// POST route for user signup
router.post('/signup', async (req, res) => {
  const { name, password } = req.body;

  try {
    // Check if the username or password already exists
    const result = await req.pool.query('SELECT * FROM users WHERE name = $1 OR password = $2', [name, password]);

    if (result.rows.length > 0) {
      // Username or password already exists, prompt user to choose a different one
      res.send('Username or password already taken. Please choose a different one.');
    } else {
      // Insert the new user into the users table
      await req.pool.query('INSERT INTO users (name, password) VALUES ($1, $2)', [name, password]);
      res.redirect('/signin');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during signup');
  }
});



// Route to render the sign-in page 
router.get('/signin', (req, res) => {
  res.render('signin');
});


router.post('/signin', async (req, res) => {
  const { user_id, password } = req.body;

  try {
    // Query the users table using the name field instead of user_id
    const result = await req.pool.query('SELECT * FROM users WHERE name = $1', [user_id]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Check if the passwords match
      if (user.password === password) {
        // Successful login, redirect to homepage
        res.redirect('/');
      } else {
        res.send('Incorrect password');
      }
    } else {
      res.send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error during sign-in');
  }
});

  
module.exports = router;
