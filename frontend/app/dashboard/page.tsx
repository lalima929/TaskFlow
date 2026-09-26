"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  assigned_to: string | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/";
      return;
    }

    setUser(userData.user);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/tasks"
      );

      const data = await response.json();

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setMessage("Failed to load tasks.");
    }

    setLoading(false);
  };

  const completeTask = async (taskId: string) => {
    try {
      setMessage("Completing task...");

      const response = await fetch(
        `http://127.0.0.1:5000/tasks/${taskId}/complete`,
        {
          method: "PUT",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || "Failed to complete task."
        );
        return;
      }

      setMessage("Task completed successfully! 🎉");

      // Refresh tasks
      loadDashboard();

    } catch (error) {
      console.error("Complete task error:", error);
      setMessage("Failed to connect to Flask backend.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <h1>TaskFlow Dashboard</h1>

      <p>Welcome back! 👋</p>

      {user && (
        <p>
          Logged in as: <strong>{user.email}</strong>
        </p>
      )}

      <hr />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>My Tasks</h2>

        <a href="/create-task">
          <button
            style={{
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            + Create Task
          </button>
        </a>
      </div>

      {message && (
        <p style={{ marginTop: "15px" }}>
          {message}
        </p>
      )}

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "15px",
              }}
            >
              <h3>{task.title}</h3>

              <p>{task.description}</p>

              <p>
                Status:{" "}
                <strong>
                  {task.status}
                </strong>
              </p>

              <p>
                Created:{" "}
                {new Date(
                  task.created_at
                ).toLocaleString()}
              </p>

              <p>
                Assigned to:{" "}
                {task.assigned_to ||
                  "Not assigned"}
              </p>

              {task.completed_at && (
                <p>
                  Completed:{" "}
                  {new Date(
                    task.completed_at
                  ).toLocaleString()}
                </p>
              )}

              {task.status !== "completed" && (
                <button
                  onClick={() =>
                    completeTask(task.id)
                  }
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Complete Task
                </button>
              )}

              {task.status === "completed" && (
                <p>
                  ✅ Task Completed
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <br />

      <button
        onClick={signOut}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Sign Out
      </button>
    </main>
  );
}