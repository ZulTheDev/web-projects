'use strict';
// app.js file
const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs');

app.use(express.json());

// define the route functions in your backend

// to test if your backend is reachable on localhost
app.get('/', (req, res) => {
    res.send(
        "Hello World"
    );
});

// Function to return hello message
function getHelloMessage() {
    return `<h1 style="color: blue;">Hello CYC participants!</h1>`;
}

// (Beginner) A simple route to call you function
app.get('/hello', (req, res) => {
    res.send(
        getHelloMessage()
    );
});

// (Intermediate) a backend function that takes in variables 
function getHelloUserMessage(params) {
    return `<h1 style="color: blue;">Hello ${params.name}</h1>`;
}

// (Intermediate) A simple route to call your function
app.get('/hello/:name', (req, res) => {
    res.send(
        getHelloUserMessage({ name: req.params.name })
    );
});


/* ===================================================
   ✅ SOLUTION: Convert Celsius to Fahrenheit (GET /convert/:celsius)
   ---------------------------------------------------
*/
app.get('/convert/:celsius', (req, res) => {
    const celsius = parseFloat(req.params.celsius);
    if (isNaN(celsius)) {
        return res.status(400).json({ error: "Invalid number format" });
    }

    const fahrenheit = (celsius * 9/5) + 32;
    res.json({ celsius, fahrenheit });
});

/* ===================================================
   ✅ SOLUTION: Reverse a String (GET /reverse/:word)
   ---------------------------------------------------
*/
app.get('/reverse/:word', (req, res) => {
    const word = req.params.word;
    const reversed = word.split("").reverse().join("");

    res.json({ original: word, reversed });
});

// This part of the code here lets you know that the backend server is running and on which port
app.listen(PORT, () => {
    console.log(`🚀 Server is listening at http://localhost:${PORT}`);
});