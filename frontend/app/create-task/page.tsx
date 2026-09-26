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
  const [creating, setCreating] = useState(false);

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

  const handleCreateTask = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    setCreating(true);
    setMessage("");

    const { data: userData } =
      await supabase.auth.getUser();

    if (!userData.user) {
      setMessage("Please login first.");
      setCreating(false);
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
            title: title.trim(),
            description: description.trim(),
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
        setCreating(false);
        return;
      }

      setMessage(
        "Task created successfully! Email notification sent. 🎉"
      );

      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (error) {
      console.error("Create task error:", error);

      setMessage(
        "Failed to connect to Flask backend."
      );
    }

    setCreating(false);
  };

  return (
    <main className="page">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>

          <div>
            <h2>TaskFlow</h2>
            <span>Task Management</span>
          </div>
        </div>

        <nav className="navigation">
          <a
            className="nav-item"
            href="/dashboard"
          >
            <span>▦</span>
            Dashboard
          </a>

          <a
            className="nav-item active"
            href="/create-task"
          >
            <span>＋</span>
            Create Task
          </a>
        </nav>

        <div className="sidebar-bottom">
          <p>
            Organize your work.
            <br />
            Stay productive.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <section className="content">
        <div className="top-bar">
          <div>
            <p className="eyebrow">
              TASK MANAGEMENT
            </p>

            <h1>Create Task</h1>

            <p className="subtitle">
              Create a task and assign it to a team
              member.
            </p>
          </div>

          <a
            href="/dashboard"
            className="back-button"
          >
            ← Dashboard
          </a>
        </div>

        <div className="form-wrapper">
          <div className="form-card">
            <div className="form-header">
              <div className="form-icon">✓</div>

              <div>
                <h2>Task Details</h2>
                <p>
                  Add the information needed to
                  complete this task.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="task-form"
            >
              {/* TITLE */}

              <div className="field">
                <label htmlFor="title">
                  Task Title
                  <span>*</span>
                </label>

                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Submit project report"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                />

                <small>
                  Give your task a clear and
                  descriptive title.
                </small>
              </div>

              {/* DESCRIPTION */}

              <div className="field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  placeholder="Describe what needs to be completed..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={6}
                />

                <small>
                  Add any useful details or
                  instructions.
                </small>
              </div>

              {/* ASSIGN USER */}

              <div className="field">
                <label htmlFor="assignedTo">
                  Assign Task To
                </label>

                <select
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) =>
                    setAssignedTo(e.target.value)
                  }
                >
                  <option value="">
                    Select a team member
                  </option>

                  {profiles.map((profile) => (
                    <option
                      key={profile.id}
                      value={profile.id}
                    >
                      {profile.full_name
                        ? `${profile.full_name} (${profile.email})`
                        : profile.email}
                    </option>
                  ))}
                </select>

                <small>
                  The selected user will receive an
                  email notification.
                </small>
              </div>

              {/* MESSAGE */}

              {message && (
                <div
                  className={`message ${
                    message.includes(
                      "successfully"
                    )
                      ? "success"
                      : "error"
                  }`}
                >
                  <span>
                    {message.includes(
                      "successfully"
                    )
                      ? "✓"
                      : "!"}
                  </span>

                  {message}
                </div>
              )}

              {/* BUTTONS */}

              <div className="form-actions">
                <a
                  href="/dashboard"
                  className="cancel-button"
                >
                  Cancel
                </a>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <span className="button-loader"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span>＋</span>
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* INFO CARD */}

          <div className="info-card">
            <div className="info-icon">📧</div>

            <div>
              <h3>Email Notifications</h3>

              <p>
                When you assign this task, TaskFlow
                automatically sends an email notification
                to the selected user.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STYLES */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #172033;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* SIDEBAR */

        .sidebar {
          width: 255px;
          min-height: 100vh;
          background: white;
          border-right: 1px solid #e7ebf2;
          padding: 28px 18px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 10px 35px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          font-weight: 700;
        }

        .brand h2 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }

        .brand span {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 3px;
        }

        .navigation {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .nav-item {
          text-decoration: none;
          color: #64748b;
          padding: 12px 14px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
        }

        .nav-item span {
          font-size: 18px;
        }

        .nav-item:hover {
          background: #f1f5ff;
          color: #2563eb;
        }

        .nav-item.active {
          background: #eff6ff;
          color: #2563eb;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 15px 10px;
          border-top: 1px solid #edf0f5;
        }

        .sidebar-bottom p {
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        /* CONTENT */

        .content {
          margin-left: 255px;
          width: calc(100% - 255px);
          padding: 42px 50px;
        }

        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 35px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .top-bar h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.8px;
        }

        .subtitle {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .back-button {
          text-decoration: none;
          color: #475569;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .back-button:hover {
          color: #2563eb;
          border-color: #bfdbfe;
        }

        /* FORM */

        .form-wrapper {
          max-width: 850px;
        }

        .form-card {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.03);
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 25px;
          border-bottom: 1px solid #edf0f5;
          margin-bottom: 27px;
        }

        .form-icon {
          width: 45px;
          height: 45px;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }

        .form-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .form-header p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .task-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .field {
          display: flex;
          flex-direction: column;
        }

        .field label {
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .field label span {
          color: #ef4444;
          margin-left: 3px;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid #dbe2ea;
          background: #fbfcfe;
          border-radius: 8px;
          padding: 12px 13px;
          font-size: 13px;
          color: #1e293b;
          outline: none;
          font-family: inherit;
          transition: 0.2s;
        }

        .field input {
          height: 44px;
        }

        .field textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }

        .field select {
          height: 44px;
          cursor: pointer;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 3px #dbeafe;
        }

        .field small {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 6px;
        }

        /* MESSAGE */

        .message {
          padding: 12px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 600;
        }

        .message.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .message.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .message span {
          font-weight: 800;
        }

        /* BUTTONS */

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 5px;
        }

        .cancel-button {
          text-decoration: none;
          color: #64748b;
          background: white;
          border: 1px solid #dbe2ea;
          padding: 11px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .cancel-button:hover {
          background: #f8fafc;
        }

        .submit-button {
          border: none;
          background: #2563eb;
          color: white;
          padding: 11px 19px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 5px 14px rgba(37, 99, 235, 0.18);
        }

        .submit-button:hover {
          background: #1d4ed8;
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-loader {
          width: 13px;
          height: 13px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* INFO */

        .info-card {
          margin-top: 18px;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          padding: 18px;
          display: flex;
          gap: 13px;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 20px;
        }

        .info-card h3 {
          margin: 0;
          color: #1e40af;
          font-size: 13px;
        }

        .info-card p {
          margin: 5px 0 0;
          color: #3b82f6;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 850px) {
          .sidebar {
            width: 210px;
          }

          .content {
            margin-left: 210px;
            width: calc(100% - 210px);
            padding: 30px;
          }
        }

        @media (max-width: 650px) {
          .sidebar {
            display: none;
          }

          .content {
            margin-left: 0;
            width: 100%;
            padding: 25px 18px;
          }

          .top-bar {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .form-card {
            padding: 20px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}