import React, { useState, useEffect } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTask, setEditTask] = useState({ id: null, text: "" });

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const tasks = await response.json();
        setTasks(tasks);
      } else {
        console.error("Failed to fetch tasks:", await response.text());
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const createTask = async () => {
    if (newTask.trim() === "") return;
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newTask, status: "pending" }),
      });
      if (response.ok) {
        setNewTask("");
        getTasks();
      } else {
        console.error("Failed to create task:", await response.text());
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

  const modifyTask = async (id) => {
    if (!isValidId(id)) {
      console.error("Invalid ID format");
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editTask.text }),
      });
      if (response.ok) {
        setEditTask({ id: null, text: "" });
        getTasks();
      } else {
        console.error("Update failed:", await response.text());
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const removeTask = async (id) => {
    if (!isValidId(id)) {
      console.error("Invalid ID format");
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (response.ok) {
        getTasks();
      } else {
        console.error("Failed to delete task:", await response.text());
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const displayTasks = () => {
    return tasks.map((taskItem) => (
      <li key={taskItem._id} className="flex justify-between items-center p-2 border-b border-gray-200">
        <span>
          {taskItem.text}, status: {taskItem.status}
        </span>
        <div>
          <button
            className="px-2 py-1 rounded mr-2 bg-yellow-300"
            onClick={() => setEditTask({ id: taskItem._id, text: taskItem.text })}
          >
            Edit
          </button>
          <button className="px-2 py-1 rounded bg-red-500 text-white" onClick={() => removeTask(taskItem._id)}>
            Delete
          </button>
        </div>
      </li>
    ));
  };

  return (
    <main className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <div className="mb-4 w-full">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
          className="border rounded p-2 w-full"
        />
        <button className="px-4 py-2 rounded mt-2 bg-blue-500 text-white" onClick={createTask}>
          Add Task
        </button>
      </div>
      <ul className="list-disc pl-5 w-full">{displayTasks()}</ul>
      {editTask.id && (
        <div className="mt-4 w-full">
          <input
            type="text"
            value={editTask.text}
            onChange={(e) => setEditTask({ ...editTask, text: e.target.value })}
            placeholder="Update task"
            className="border rounded p-2 w-full"
          />
          <button className="px-4 py-2 rounded mt-2 bg-green-500 text-white" onClick={() => modifyTask(editTask.id)}>
            Update Task
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
