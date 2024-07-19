import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

// Charger les variables d'environnement depuis un fichier .env
dotenv.config();
const url = process.env.MONGO_URI; // URL de connexion MongoDB depuis les variables d'environnement

// Créer une instance du client MongoDB
const client = new MongoClient(url);

// Créer une instance de l'application Express
const app = express();
const PORT = process.env.PORT || 8080; // Port pour le serveur, soit celui défini dans les variables d'environnement, soit 8080 par défaut
app.use(express.json()); // Middleware pour parser le corps des requêtes en JSON
app.use(express.static("dist")); // Servir les fichiers statiques du dossier "dist"

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

app.get("/api/tasks", async (req, res) => {
  try {
    console.log("Fetching tasks...");
    const collection = client.db("todo_db").collection("tasks");
    const tasks = await collection.find({}).toArray();
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tasks/:id", async (req, res) => {
  try {
    console.log("Fetching task with id:", req.params.id);
    const collection = client.db("todo_db").collection("tasks");
    const { id } = req.params;
    const task = await collection.findOne({ _id: new ObjectId(id) });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
    } else {
      res.json(task);
    }
  } catch (err) {
    console.error("Error fetching task", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log request body
    const collection = client.db("todo_db").collection("tasks");
    const newTask = req.body;
    console.log("Inserting new task:", newTask); // Log task to be inserted
    const result = await collection.insertOne(newTask);
    console.log("Insert result:", result); // Log result of insert
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    console.log("Updating task with id:", req.params.id);
    const collection = client.db("todo_db").collection("tasks");
    const { id } = req.params;
    const updatedTask = req.body;
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedTask });
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task", err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    console.log("Deleting task with id:", req.params.id);
    const collection = client.db("todo_db").collection("tasks");
    const { id } = req.params;
    const deletionResult = await collection.deleteOne({ _id: new ObjectId(id) });
    if (deletionResult.deletedCount === 0) {
      res.status(404).json({ error: "Task not found" });
    } else {
      res.status(204).end();
    }
  } catch (err) {
    console.error("Error deleting task", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}\nvia http://localhost:${PORT}`);
  connectToMongo();
});
