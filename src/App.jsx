import React, { useEffect, useState } from "react";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const STORAGE_KEY = "todos_v1";

export default function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to parse todos from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      alert("Task can't be empty");
      return false;
    }

    const newTodo = {
      id: uid(),
      text: trimmed,
      completed: false,
      notes: "",
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    return true;
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const editTodo = (id, newFields) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...newFields } : t)));
  };

  const clearAll = () => {
    if (confirm("Clear all todos?")) setTodos([]);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Todo App</h1>
        <p className="muted">Add, edit, complete, delete - stored in localStorage</p>
      </header>

      <main>
        <TodoForm onAdd={addTodo} />

        <section className="controls">
          <button onClick={clearAll} className="danger small">Clear all</button>
        </section>

        <TodoList
          todos={todos}
          onDelete={deleteTodo}
          onToggle={toggleComplete}
          onEdit={editTodo}
        />
      </main>

      <footer className="muted small">Tip: press Enter to add a task. Double-click task text to edit quickly</footer>

      <style>{`
        .app-container { max-width:720px; margin:28px auto; padding;18px; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;}
        header h1 { margin:0 0 6px 0; }
        .muted { color:#666; }
        main { background:#fff; padding:16px; border-radius:8px; box-shadow: 0 6px 18px rgba(0,0,0,0.04);}
        .controls { margin:10px 0 18px 0; }
        button { padding: 8px 12px; border-radius:6px; border:1px solid #ddd; background:white; cursor:pointer; }
        button.small { padding:6px 10px; font-size:0.9rem; }
        button.danger { border-color:#f2a0a0; }
        .todo-list { list-style:none; padding:0; margin:0; }
        .todo-item { display:flex; gap:12px; align-items:center; padding: 10px; border-bottom:1px solid #f2f2f2; }
        .todo-item .text { flex:1; }
        .todo-item .text.completed { text-decoration: line-through; color:#999; }
        .todo-item .actions { display:flex; gap:8px; }
        .edit-input { width:100%; padding:6px; border:1px solid #ddd; border-radius:4px; }
        .note { font-size:0.85rem; color:#444; margin-top:6px; }
        .small { font-size:0.85rem; }
        `}</style>
    </div>
  );
}

function TodoForm({ onAdd }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = onAdd(value);
    if (ok) setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form" style={{ marginBottom: 8 }}>
      <input
        aria-label="New task"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What needs to be done?"
        style={{ padding: 10, width: "calc(100% - 110px)", marginRight: 8, borderRadius: 6, border: "1px solid #ddd" }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || !e.shiftKey)) {

          }
        }}
      />
      <button type="submit">Add</button>  
    </form>
  );
}

function TodoList({ todos, onDelete, onToggle, onEdit }) {
  if (!todos || todos.length === 0) return <p className="muted">No tasks yet - add your first todo!</p>;

  return (
    <ul className="todo-list" role="list">
      {todos.map((t) => (
        <li key={t.id} className="todo-item">
          <TodoItem todo={t} onDelete={onDelete} onToggle={onToggle} onEdit={onEdit} />
        </li>
      ))}
    </ul>
  );
}

function TodoItem({ todo, onDelete, onToggle, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const [notes, setNotes] = useState(todo.notes || "");

  useEffect(() => {
    setDraft(todo.text);
    setNotes(todo.notes || "");
  }, [todo.text, todo.notes]);

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      alert("Task can't be empty");
      return;
    }
    onEdit(todo.id, { text: trimmed, notes });
    setIsEditing(false);
  };

  return (
    <>
      <input
        type="checkbox"
        aria-label={`Mark ${todo.text} complete`}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />

      <div className="text" style={{ display: "flex", flexDirection: "column" }}>
        {isEditing ? (
          <div>
            <input
              className="edit-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setDraft(todo.text);
                }
              }}
            />
            <div style={{ marginTop: 6}}>
              <input
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="edit-input"
              />
            </div>
            <div className="actions" style={{ marginTop: 6 }}>
              <button onClick={saveEdit}>Save</button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDraft(todo.text);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div
              className={`title ${todo.completed ? "completed" : ""}`}
              onDoubleClick={() => setIsEditing(true)}
              style={{ cursor: "text" }}
            >
              <span className={`text ${todo.completed ? "completed" : ""}`}>{todo.text}</span>  
            </div>
            {todo.notes ? <div className="note">{todo.notes}</div> : null}  
          </div>
        )}
      </div>

      <div className="actions">
        {!isEditing && (
          <>
            <button onClick={() => setIsEditing(true)} className="small">Edit</button>
            <button onClick={() => onDelete(todo.id)} className="small danger">Delete</button>
          </>
        )}
      </div>
    </>
  );
}