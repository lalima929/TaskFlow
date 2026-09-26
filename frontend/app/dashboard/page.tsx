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

const API_URL =
  "https://taskflow-backend-lalima.onrender.com";

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
        `${API_URL}/tasks`
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
        `${API_URL}/tasks/${taskId}/complete`,
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

      setMessage("Task completed successfully!");

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

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== "completed"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loader"></div>
        <p>Loading your workspace...</p>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f7fb;
            color: #475569;
            font-family: Arial, sans-serif;
          }

          .loader {
            width: 42px;
            height: 42px;
            border: 4px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="dashboard">
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
          <a className="nav-item active" href="/dashboard">
            <span>▦</span>
            Dashboard
          </a>

          <a className="nav-item" href="/create-task">
            <span>＋</span>
            Create Task
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user?.email?.split("@")[0]}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <section className="content">
        {/* HEADER */}

        <header className="top-header">
          <div>
            <p className="eyebrow">WORKSPACE</p>

            <h1>Dashboard</h1>

            <p className="subtitle">
              Manage your tasks and stay productive.
            </p>
          </div>

          <a href="/create-task" className="create-button">
            <span>＋</span>
            Create Task
          </a>
        </header>

        {/* MESSAGE */}

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* STATISTICS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">▦</div>

            <div>
              <p>Total Tasks</p>
              <h2>{totalTasks}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>

            <div>
              <p>Pending</p>
              <h2>{pendingTasks}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <p>Completed</p>
              <h2>{completedTasks}</h2>
            </div>
          </div>
        </section>

        {/* TASK SECTION */}

        <section className="tasks-section">
          <div className="section-header">
            <div>
              <h2>Your Tasks</h2>
              <p>Track and manage your assigned work.</p>
            </div>

            <span className="task-count">
              {totalTasks}{" "}
              {totalTasks === 1 ? "task" : "tasks"}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✓</div>

              <h3>No tasks yet</h3>

              <p>
                Create your first task and start managing
                your work.
              </p>

              <a href="/create-task">
                Create Your First Task
              </a>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <article
                  className="task-card"
                  key={task.id}
                >
                  <div className="task-main">
                    <div className="task-title-row">
                      <h3>{task.title}</h3>

                      <span
                        className={`status ${
                          task.status === "completed"
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        {task.status === "completed"
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </div>

                    <p className="task-description">
                      {task.description ||
                        "No description provided."}
                    </p>

                    <div className="task-meta">
                      <span>
                        📅{" "}
                        {new Date(
                          task.created_at
                        ).toLocaleDateString()}
                      </span>

                      <span>
                        👤{" "}
                        {task.assigned_to
                          ? "Assigned"
                          : "Not assigned"}
                      </span>
                    </div>

                    {task.completed_at && (
                      <div className="completed-info">
                        ✓ Completed on{" "}
                        {new Date(
                          task.completed_at
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="task-action">
                    {task.status !== "completed" ? (
                      <button
                        onClick={() =>
                          completeTask(task.id)
                        }
                      >
                        Mark Complete
                      </button>
                    ) : (
                      <div className="done-label">
                        ✓ Done
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {/* STYLES */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          display: flex;
          background: #f5f7fb;
          color: #172033;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .sidebar {
          width: 255px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e7ebf2;
          padding: 28px 18px;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
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
        }

        .user-mini {
          border-top: 1px solid #edf0f5;
          padding: 18px 8px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          background: #dbeafe;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .user-info {
          min-width: 0;
        }

        .user-info strong {
          display: block;
          font-size: 12px;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-info span {
          display: block;
          color: #94a3b8;
          font-size: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 3px;
        }

        .logout-button {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .logout-button:hover {
          background: #f8fafc;
          color: #ef4444;
        }

        .content {
          margin-left: 255px;
          width: calc(100% - 255px);
          padding: 42px 50px;
          max-width: 1500px;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .top-header h1 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.8px;
        }

        .subtitle {
          color: #64748b;
          margin: 7px 0 0;
          font-size: 14px;
        }

        .create-button {
          text-decoration: none;
          background: #2563eb;
          color: white;
          padding: 12px 18px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 7px;
          box-shadow: 0 5px 15px rgba(37, 99, 235, 0.18);
        }

        .create-button:hover {
          background: #1d4ed8;
        }

        .message {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 38px;
        }

        .stat-card {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 12px;
          padding: 22px;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          font-weight: 700;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .stat-card p {
          margin: 0 0 5px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-card h2 {
          margin: 0;
          font-size: 25px;
        }

        .tasks-section {
          background: transparent;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .section-header p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .task-count {
          color: #64748b;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .task-card {
          background: white;
          border: 1px solid #e7ebf2;
          border-radius: 12px;
          padding: 22px;
          display: flex;
          justify-content: space-between;
          gap: 25px;
          transition: 0.2s;
        }

        .task-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 7px 22px rgba(15, 23, 42, 0.05);
        }

        .task-main {
          flex: 1;
          min-width: 0;
        }

        .task-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .task-title-row h3 {
          margin: 0;
          font-size: 16px;
          color: #1e293b;
        }

        .status {
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .status.pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .status.completed {
          background: #ecfdf5;
          color: #047857;
        }

        .task-description {
          color: #64748b;
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
        }

        .task-meta {
          display: flex;
          gap: 20px;
          margin-top: 15px;
          color: #94a3b8;
          font-size: 11px;
        }

        .completed-info {
          margin-top: 12px;
          color: #059669;
          font-size: 11px;
          font-weight: 600;
        }

        .task-action {
          display: flex;
          align-items: center;
        }

        .task-action button {
          border: 1px solid #2563eb;
          background: white;
          color: #2563eb;
          padding: 9px 13px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .task-action button:hover {
          background: #2563eb;
          color: white;
        }

        .done-label {
          color: #059669;
          background: #ecfdf5;
          padding: 9px 13px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .empty-state {
          background: white;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 22px;
          font-weight: 700;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 17px;
        }

        .empty-state p {
          color: #94a3b8;
          font-size: 13px;
          margin: 8px 0 20px;
        }

        .empty-state a {
          display: inline-block;
          text-decoration: none;
          background: #2563eb;
          color: white;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
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

          .stats-grid {
            grid-template-columns: 1fr;
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

          .top-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
          }

          .task-card {
            flex-direction: column;
          }

          .task-action {
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  );
}