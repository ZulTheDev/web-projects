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
   🎯 TASK 3: Convert Celsius to Fahrenheit (GET /convert/:celsius)
   ---------------------------------------------------
   Instructions:
   - Create a function that converts Celsius to Fahrenheit.
   - Use the formula:
     `Fahrenheit = (Celsius * 9/5) + 32`
   - Return the temperature in JSON format.
*/
app.get('<enter your route here>', (req, res) => {
    // 🚧 Participants must implement this!
});


/* ===================================================
   🎯 TASK 4: Reverse a String (GET /reverse/:word)
   ---------------------------------------------------
   Instructions:
   - Create a function that reverses a string.
   - Use `.split("").reverse().join("")` to reverse it.
   - Return the original and reversed string in JSON format.
*/
app.get('<enter your route here>', (req, res) => {
    // 🚧 Participants must implement this!
});


// This part of the code here lets you know that the backend server is running and on which port
app.listen(PORT, () => {
    console.log(
        `🚀 Server is listening at http://localhost:${PORT}`
    );
});