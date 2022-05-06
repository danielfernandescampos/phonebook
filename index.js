const express = require("express");
const cors = require("cors");
const app = express();
var morgan = require('morgan');

app.use(express.static('build'))
app.use(cors());
app.use(express.json());
morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms :body'));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => String(person.id) === id);
  if (!person)
    return response.status(404).json({ error: "cannot find person" });
  return response.json(person);
});

app.get("/info", (request, response) => {
  const time = new Date();
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${time}</p>
  `);
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const newPerson = {...body, id: generateId()}
  if (!body.name)
    return response.status(400).json({ error: "name was not found" });
  if (!body.number)
    return response.status(400).json({ error: "number was not found" });
  if (persons.find(person => person.name === body.name))
    return response.status(400).json({ error: "name is already registered" });
  if (persons.find(person => person.number === body.number))
    return response.status(400).json({ error: "number is already registered" });
  persons.push(newPerson);
  response.json(newPerson);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const index = persons.findIndex(person => String(person.id) === id);
  if(index < 0) return response.status(404).json({ error: "person not found" });
  persons.splice(index,1);
  response.status(204).end()
})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

const PORT = process.env.PORT || 3002
app.listen(PORT);
console.log(`Server is running on port ${PORT}`);
