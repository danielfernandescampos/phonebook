require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
var morgan = require("morgan");
// const mongoose = require("mongoose");
const Person = require("./models/person");

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :response-time ms :body"));

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

app.get("/info", (request, response, error) => {
  const time = new Date();
  Person.find({})
    .then(persons => {
      response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${time}</p>
      `);
    })
    .catch(error => next(error))
});


// GET ALL
app.get("/api/persons", (request, response, next) => {
  Person.find({})
  .then((persons) => {
    console.log("phonebook:");
    response.json(persons);
    // mongoose.connection.close();
  })
  .catch(error => next(error));
});

// GET ONE
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (!person)
      return response.status(404).json({ error: "Person not found" });
      response.json(person)
    })
    .catch(error => next(error))
});

// SAVE
app.post("/api/persons", (request, response, next) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  });

  if (!person.name || !person.number)
    return response.status(400).json({ error: "Name and number are required" });

  Person.findOne({name: person.name}).then(person => {
    if(person) return response.status(400).json({error: "This name is already registered"})
  })
  
  Person.findOne({number: person.number}).then(person => {
    if(person) return response.status(400).json({error: "This number is already registered"})
  })

  person.save()
    .then((newPerson) => {
      response.json(newPerson);
      // mongoose.connection.close();
    })
    .catch(error => next(error));
});

// DELETE 
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => {
      console.log(error)
      next(error)
    })
});

// UPDATE
app.put("/api/persons/:id", (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})


// MIDLEWARES 
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// ERROR HANDLER
const errorHandler = (error, request, response, next) => {
  console.error(`${error.name}: ${error.message}`)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: error.message })
  } 
  if (error.name === 'ObjectParameterError') {
    return response.status(400).send({ error: error.message })
  } 
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

// START APP
const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server is running on port ${PORT}`);
