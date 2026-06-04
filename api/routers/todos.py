import dataclasses
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Query
from pydantic import BaseModel

from api.deps import DbConn
from api.responses import error, success
from data.models import (
    DailyTodo,
    copy_incomplete_todos,
    delete_todo,
    get_student_by_id,
    get_todo_by_id,
    get_todos_for_date,
    insert_todo,
    update_todo,
)

router = APIRouter(prefix="/api/todos", tags=["todos"])

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _valid_date(value: str) -> bool:
    if not DATE_RE.match(value):
        return False
    try:
        datetime.strptime(value, "%Y-%m-%d")
        return True
    except ValueError:
        return False


class CreateTodoBody(BaseModel):
    student_id: str = ""
    task_date: str = ""
    label: str = ""


class UpdateTodoBody(BaseModel):
    label: str | None = None
    completed: bool | None = None
    sort_order: int | None = None


class CopyTodosBody(BaseModel):
    student_id: str = ""
    from_date: str = ""
    to_date: str = ""


@router.get("/{student_id}")
def list_todos(
    student_id: str,
    conn: DbConn,
    date: str = Query(..., alias="date", description="YYYY-MM-DD"),
):
    if not _valid_date(date):
        return error("Invalid date — use YYYY-MM-DD", 400)

    student = get_student_by_id(conn, student_id)
    if student is None:
        return error("Student not found", 404)

    todos = get_todos_for_date(conn, student_id, date)
    completed = sum(1 for t in todos if t.completed)
    return success(
        {
            "task_date": date,
            "todos": [dataclasses.asdict(t) for t in todos],
            "total": len(todos),
            "completed": completed,
        }
    )


@router.post("")
def create_todo(body: CreateTodoBody, conn: DbConn):
    if not body.student_id or not body.task_date or not body.label.strip():
        return error("student_id, task_date, and label are required", 400)
    if not _valid_date(body.task_date):
        return error("Invalid task_date — use YYYY-MM-DD", 400)

    student = get_student_by_id(conn, body.student_id)
    if student is None:
        return error("Student not found", 404)

    existing = get_todos_for_date(conn, body.student_id, body.task_date)
    todo = DailyTodo(
        student_id=body.student_id,
        task_date=body.task_date,
        label=body.label.strip()[:200],
        sort_order=len(existing),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    insert_todo(conn, todo)
    conn.commit()
    return success(dataclasses.asdict(todo))


@router.patch("/{todo_id}")
def patch_todo(todo_id: str, body: UpdateTodoBody, conn: DbConn):
    todo = get_todo_by_id(conn, todo_id)
    if todo is None:
        return error("Task not found", 404)

    if body.label is not None and not body.label.strip():
        return error("Label cannot be empty", 400)

    update_todo(
        conn,
        todo_id,
        label=body.label.strip()[:200] if body.label is not None else None,
        completed=body.completed,
        sort_order=body.sort_order,
    )
    conn.commit()
    updated = get_todo_by_id(conn, todo_id)
    return success(dataclasses.asdict(updated))


@router.delete("/{todo_id}")
def remove_todo(todo_id: str, conn: DbConn):
    todo = get_todo_by_id(conn, todo_id)
    if todo is None:
        return error("Task not found", 404)
    delete_todo(conn, todo_id)
    conn.commit()
    return success({"deleted": todo_id})


@router.post("/copy-incomplete")
def copy_incomplete(body: CopyTodosBody, conn: DbConn):
    if not body.student_id or not body.from_date or not body.to_date:
        return error("student_id, from_date, and to_date are required", 400)
    if not _valid_date(body.from_date) or not _valid_date(body.to_date):
        return error("Invalid date — use YYYY-MM-DD", 400)

    student = get_student_by_id(conn, body.student_id)
    if student is None:
        return error("Student not found", 404)

    count = copy_incomplete_todos(conn, body.student_id, body.from_date, body.to_date)
    conn.commit()
    todos = get_todos_for_date(conn, body.student_id, body.to_date)
    return success(
        {
            "copied": count,
            "task_date": body.to_date,
            "todos": [dataclasses.asdict(t) for t in todos],
        }
    )
