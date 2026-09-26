from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client
from gmail_service import send_email

import os
from datetime import datetime, timezone


# ==================================================
# LOAD ENVIRONMENT VARIABLES
# ==================================================

load_dotenv()


# ==================================================
# CREATE FLASK APP
# ==================================================

app = Flask(__name__)

CORS(app)


# ==================================================
# SUPABASE CONFIGURATION
# ==================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "SUPABASE_URL and SUPABASE_KEY must be set in backend/.env"
    )


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ==================================================
# HOME
# ==================================================

@app.route("/", methods=["GET"])
def home():

    return {
        "message": "TaskFlow API is running"
    }


# ==================================================
# GET PROFILES
# ==================================================

@app.route("/profiles", methods=["GET"])
def get_profiles():

    try:

        response = (
            supabase
            .table("profiles")
            .select("*")
            .execute()
        )

        return {
            "profiles": response.data
        }

    except Exception as e:

        return {
            "error": str(e)
        }, 500


# ==================================================
# CREATE TASK
# ==================================================

@app.route("/tasks", methods=["POST"])
def create_task():

    try:

        data = request.get_json()

        title = data.get("title")
        description = data.get("description")
        created_by = data.get("created_by")
        assigned_to = data.get("assigned_to")


        # ------------------------------------------
        # VALIDATION
        # ------------------------------------------

        if not title:

            return {
                "error": "Task title is required"
            }, 400


        if not created_by:

            return {
                "error": "created_by is required"
            }, 400


        # ------------------------------------------
        # CREATE TASK
        # ------------------------------------------

        task = {
            "title": title,
            "description": description,
            "created_by": created_by,
            "assigned_to": assigned_to,
            "status": "pending"
        }


        response = (
            supabase
            .table("tasks")
            .insert(task)
            .execute()
        )


        if not response.data:

            return {
                "error": "Task could not be created"
            }, 500


        created_task = response.data[0]


        # ------------------------------------------
        # SEND EMAIL TO ASSIGNED USER
        # ------------------------------------------

        if assigned_to:

            profile_response = (
                supabase
                .table("profiles")
                .select("email, full_name")
                .eq("id", assigned_to)
                .execute()
            )


            if profile_response.data:

                assigned_user = profile_response.data[0]

                assigned_email = assigned_user["email"]

                assigned_name = (
                    assigned_user.get("full_name")
                    or assigned_email
                )


                email_subject = (
                    f"New Task Assigned - {title}"
                )


                email_body = f"""
Hello {assigned_name},

You have been assigned a new task in TaskFlow.

Task Title:
{title}

Description:
{description or "No description provided"}

Status:
Pending

Please log in to TaskFlow to view the task.

Thank you,
TaskFlow
"""


                try:

                    send_email(
                        assigned_email,
                        email_subject,
                        email_body
                    )

                    print(
                        f"Task notification sent to {assigned_email}"
                    )

                except Exception as email_error:

                    print(
                        "Email sending failed:",
                        email_error
                    )


        # ------------------------------------------
        # RETURN RESPONSE
        # ------------------------------------------

        return {
            "message": "Task created successfully",
            "task": response.data
        }, 201


    except Exception as e:

        print("Create task error:", e)

        return {
            "error": str(e)
        }, 500


# ==================================================
# GET ALL TASKS
# ==================================================

@app.route("/tasks", methods=["GET"])
def get_tasks():

    try:

        response = (
            supabase
            .table("tasks")
            .select("*")
            .order(
                "created_at",
                desc=True
            )
            .execute()
        )


        return {
            "tasks": response.data
        }


    except Exception as e:

        return {
            "error": str(e)
        }, 500


# ==================================================
# COMPLETE TASK
# ==================================================

@app.route(
    "/tasks/<task_id>/complete",
    methods=["PUT"]
)
def complete_task(task_id):

    try:

        # ------------------------------------------
        # FIND TASK
        # ------------------------------------------

        task_response = (
            supabase
            .table("tasks")
            .select("*")
            .eq("id", task_id)
            .execute()
        )


        if not task_response.data:

            return {
                "error": "Task not found"
            }, 404


        task = task_response.data[0]


        # ------------------------------------------
        # UPDATE TASK
        # ------------------------------------------

        completed_time = datetime.now(
            timezone.utc
        ).isoformat()


        response = (
            supabase
            .table("tasks")
            .update({
                "status": "completed",
                "completed_at": completed_time
            })
            .eq("id", task_id)
            .execute()
        )


        if not response.data:

            return {
                "error": "Task could not be completed"
            }, 500


        # ------------------------------------------
        # FIND TASK CREATOR
        # ------------------------------------------

        creator_id = task["created_by"]


        profile_response = (
            supabase
            .table("profiles")
            .select("email, full_name")
            .eq("id", creator_id)
            .execute()
        )


        # ------------------------------------------
        # SEND COMPLETION EMAIL
        # ------------------------------------------

        if profile_response.data:

            creator = profile_response.data[0]

            creator_email = creator["email"]

            creator_name = (
                creator.get("full_name")
                or creator_email
            )


            email_subject = (
                f"Task Completed - {task['title']}"
            )


            email_body = f"""
Hello {creator_name},

Your TaskFlow task has been completed.

Task Title:
{task['title']}

Description:
{task.get('description') or 'No description provided'}

Status:
Completed

Completed At:
{completed_time}

Thank you,
TaskFlow
"""


            try:

                send_email(
                    creator_email,
                    email_subject,
                    email_body
                )

                print(
                    f"Completion notification sent to {creator_email}"
                )

            except Exception as email_error:

                print(
                    "Email sending failed:",
                    email_error
                )


        # ------------------------------------------
        # RETURN RESPONSE
        # ------------------------------------------

        return {
            "message": "Task completed successfully",
            "task": response.data
        }


    except Exception as e:

        print("Complete task error:", e)

        return {
            "error": str(e)
        }, 500


# ==================================================
# RUN SERVER
# ==================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )