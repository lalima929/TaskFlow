"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
      }

      if (event === "SIGNED_OUT") {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      router.replace("/dashboard");
      return;
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError("");
      setLoggingIn(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error("Google login error:", err);

      setError(
        err.message || "Unable to sign in with Google."
      );

      setLoggingIn(false);
    }
  }

  if (loading) {
    return (
      <main className="loading-page">
        <div className="loading-card">
          <div className="spinner"></div>

          <p>Checking your session...</p>
        </div>

        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f7fb;
            font-family:
              Arial,
              Helvetica,
              sans-serif;
          }

          .loading-card {
            text-align: center;
            color: #475569;
          }

          .spinner {
            width: 36px;
            height: 36px;
            margin: 0 auto 14px;

            border: 4px solid #e2e8f0;
            border-top-color: #2563eb;

            border-radius: 50%;

            animation: spin 0.8s linear infinite;
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
    <main className="login-page">
      <div className="login-container">

        {/* BRANDING */}

        <div className="brand-section">

          <div className="logo">
            ✓
          </div>

          <h1>
            TaskFlow
          </h1>

          <p>
            Simple and professional task management
            <br />
            for teams and individuals.
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="login-card">

          <div className="card-header">

            <h2>
              Welcome to TaskFlow
            </h2>

            <p>
              Sign in with your Google account
              <br />
              to continue.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* GOOGLE LOGIN */}

          <button
            type="button"
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={loggingIn}
          >
            {loggingIn ? (
              <>
                <span className="button-spinner"></span>

                Signing in...
              </>
            ) : (
              <>
                <span className="google-icon">
                  G
                </span>

                Continue with Google
              </>
            )}
          </button>

          {/* SECURITY MESSAGE */}

          <div className="security-note">

            <span>
              🔒
            </span>

            <p>
              Your account is securely authenticated
              using Google OAuth 2.0.
            </p>

          </div>

        </div>

        {/* FOOTER */}

        <p className="footer-text">
          © 2026 TaskFlow. Task management made simple.
        </p>

        <p className="creator-text">
          Created by{" "}
          <strong>
            Lalima Rajesh
          </strong>
        </p>

      </div>

      <style jsx>{`

        /* PAGE */

        .login-page {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 24px;

          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef4ff 100%
            );

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* MAIN CONTAINER */

        .login-container {
          width: 100%;
          max-width: 460px;

          text-align: center;
        }


        /* BRAND */

        .brand-section {
          margin-bottom: 28px;
        }


        .logo {
          width: 58px;
          height: 58px;

          margin: 0 auto 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          background: #2563eb;

          color: white;

          font-size: 30px;
          font-weight: 700;

          box-shadow:
            0 10px 25px
            rgba(37, 99, 235, 0.22);
        }


        .brand-section h1 {
          margin: 0;

          font-size: 32px;

          font-weight: 750;

          color: #0f172a;
        }


        .brand-section p {
          margin: 9px 0 0;

          color: #64748b;

          font-size: 14px;

          line-height: 1.6;
        }


        /* LOGIN CARD */

        .login-card {
          padding: 34px;

          background: white;

          border:
            1px solid #e2e8f0;

          border-radius: 18px;

          box-shadow:
            0 20px 45px
            rgba(15, 23, 42, 0.08);
        }


        /* HEADER */

        .card-header h2 {
          margin: 0;

          color: #0f172a;

          font-size: 22px;

          font-weight: 700;
        }


        .card-header p {
          margin: 9px 0 25px;

          color: #64748b;

          font-size: 14px;

          line-height: 1.6;
        }


        /* ERROR */

        .error-message {
          margin-bottom: 16px;

          padding: 12px 14px;

          border:
            1px solid #fecaca;

          border-radius: 10px;

          background: #fef2f2;

          color: #b91c1c;

          font-size: 13px;

          text-align: left;
        }


        /* GOOGLE BUTTON */

        .google-button {
          width: 100%;

          min-height: 50px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 11px;

          border:
            1px solid #cbd5e1;

          border-radius: 10px;

          background: white;

          color: #1e293b;

          font-size: 15px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.2s,
            box-shadow 0.2s,
            transform 0.2s;
        }


        .google-button:hover:not(:disabled) {
          background: #f8fafc;

          box-shadow:
            0 6px 18px
            rgba(15, 23, 42, 0.08);

          transform:
            translateY(-1px);
        }


        .google-button:disabled {
          cursor: not-allowed;

          opacity: 0.7;
        }


        /* GOOGLE ICON */

        .google-icon {
          width: 24px;
          height: 24px;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 19px;

          font-weight: 700;

          color: #4285f4;
        }


        /* BUTTON LOADING */

        .button-spinner {
          width: 18px;
          height: 18px;

          border:
            2px solid #cbd5e1;

          border-top-color:
            #2563eb;

          border-radius: 50%;

          animation:
            spin 0.7s linear infinite;
        }


        /* SECURITY */

        .security-note {
          display: flex;

          align-items: flex-start;

          gap: 8px;

          margin-top: 22px;

          padding: 12px;

          border-radius: 10px;

          background: #f8fafc;

          text-align: left;
        }


        .security-note span {
          font-size: 15px;
        }


        .security-note p {
          margin: 0;

          color: #64748b;

          font-size: 12px;

          line-height: 1.5;
        }


        /* FOOTER */

        .footer-text {
          margin: 22px 0 0;

          color: #94a3b8;

          font-size: 12px;
        }


        /* CREATOR */

        .creator-text {
          margin: 8px 0 0;

          color: #64748b;

          font-size: 12px;
        }


        .creator-text strong {
          color: #2563eb;

          font-weight: 600;
        }


        /* LOADING */

        .loading-page {
          min-height: 100vh;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #f5f7fb;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        .loading-card {
          text-align: center;

          color: #475569;
        }


        .spinner {
          width: 36px;
          height: 36px;

          margin:
            0 auto 14px;

          border:
            4px solid #e2e8f0;

          border-top-color:
            #2563eb;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;
        }


        @keyframes spin {
          to {
            transform:
              rotate(360deg);
          }
        }


        /* MOBILE */

        @media (max-width: 520px) {

          .login-page {
            padding: 16px;
          }


          .login-card {
            padding: 25px 20px;
          }


          .brand-section h1 {
            font-size: 28px;
          }

        }

      `}</style>
    </main>
  );
}