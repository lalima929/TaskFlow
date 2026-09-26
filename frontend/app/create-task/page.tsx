"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
};

export default function CreateTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [message, setMessage] = useState("");

  // Load users from Flask
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/profiles"
        );

        const data = await response.json();

        setProfiles(data.profiles || []);
      } catch (error) {
        console.error("Failed to load profiles:", error);
        setMessage("Could not load users.");
      }
    };

    loadProfiles();
  }, []);

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("Creating task...");

    // Get logged-in user
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setMessage("Please login first.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            description: description,
            created_by: userData.user.id,
            assigned_to: assignedTo || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(
          result.error || "Failed to create task."
        );
        return;
      }

      console.log("Created task:", result.task);

      setMessage("Task created successfully! 🎉");

      // Clear form
      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (error) {
      console.error("Create task error:", error);

      setMessage(
        "Failed to connect to Flask backend."
      );
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <h1>Create Task</h1>

      <p>
        Create a new task and assign it to another user.
      </p>

      <form
        onSubmit={handleCreateTask}
        style={{
          maxWidth: "500px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {/* Title */}

        <label>Task Title</label>

        <input
          type="text"
          placeholder="Enter task title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
          style={{
            padding: "10px",
          }}
        />

        {/* Description */}

        <label>Description</label>

        <textarea
          placeholder="Enter task description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          rows={5}
          style={{
            padding: "10px",
          }}
        />

        {/* Assign */}

        <label>Assign Task To</label>

        <select
          value={assignedTo}
          onChange={(e) =>
            setAssignedTo(e.target.value)
          }
          style={{
            padding: "10px",
          }}
        >
          <option value="">
            Select a user
          </option>

          {profiles.map((profile) => (
            <option
              key={profile.id}
              value={profile.id}
            >
              {profile.full_name ||
                profile.email}
            </option>
          ))}
        </select>

        {/* Create */}

        <button
          type="submit"
          style={{
            padding: "12px",
            cursor: "pointer",
          }}
        >
          Create Task
        </button>

        {/* Message */}

        {message && (
          <p>{message}</p>
        )}
      </form>

      <br />

      <a href="/dashboard">
        ← Back to Dashboard
      </a>
    </main>
  );
}