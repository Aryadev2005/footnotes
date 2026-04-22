const express = require('express'); // Import the Express library
const app = express();// Create an instance of the Express application
const cors = require('cors'); // Import the CORS middleware

app.use(cors()); // Enable CORS for all routes
app.use(express.json());// Middleware to parse JSON bodies

let myFootnotes = [
    { id:1, location: "RVCE CAMPUS", review: "A great place to learn and grow!" },
    { id:2, location: "Bangalore", review: "A bustling city with a vibrant culture." },
    { id:3, location: "Mysore", review: "A city rich in history and culture." } 
];

app.get('/search', (req,res) => {
    const query = req.query.location; // Get the search query from the request
    if(!query) {
        return res.status(400).json({ error: 'Location query parameter is required' }); // Return an error if the query parameter is missing
    }
    const results = myFootnotes.filter(footnote => 
        footnote.location.toLowerCase().includes(query.toLowerCase()) || 
        footnote.review.toLowerCase().includes(query.toLowerCase())
    ); // Filter footnotes based on the search query
    res.json(results); // Send the filtered results as a JSON response
});

app.listen(3000, () => {
    console.log('Server is running on port 3000'); // Start the server and log a message
});