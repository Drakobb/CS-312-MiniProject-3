const express = require("express");
const path = require('path');

// Import pg module for database
const { Pool } = require('pg');
// Import blog routes
const blogRoutes = require('./routes/blogRoutes');

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));

// Set up the database connection
const pool = new Pool({
    user: 'postgres',  
    host: 'localhost',      
    database: 'BlogDB',     
    password: 'drake0527', 
    port: 5432,             
  });
  
  // Make the database accessible in all routes
  app.use((req, res, next) => {
    req.pool = pool;
    next();
  });



app.use(blogRoutes);

//Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
