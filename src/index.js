const express = require("express");
const cors = require("cors");

const { randomUUID } = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username)) {
    return response
      .status(400)
      .json({ error: "Error creating the user. Username already taken." });
  }

  const user = { id: randomUUID(), name, username, todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;

  if (!title || !deadline) {
    return response.status(404).json({
      error:
        "You must inform the title and the deadline to create a new to-do item",
    });
  }

  const todo = {
    id: randomUUID(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    params: { id },
    user,
    body: { title, deadline },
  } = request;

  const todo = user.todos.find((item) => item.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Item not found",
    });
  }

  todo.deadline = deadline;
  todo.title = title;

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const {
    params: { id },
    user,
  } = request;

  const todo = user.todos.find((item) => item.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Item not found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const {
    params: { id },
    user,
  } = request;

  const todo = user.todos.find((item) => item.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Item not found" });
  }

  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
