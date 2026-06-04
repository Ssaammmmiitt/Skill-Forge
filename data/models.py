import sqlite3
import uuid
import dataclasses
import datetime
import os

_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_DB_DIR = os.path.join(_REPO_ROOT, "skill_forge", "data")


@dataclasses.dataclass
class Student:
    student_id: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    INT: int = 50
    WIS: int = 50
    energy: int = 80
    xp: int = 0
    level: int = 1
    learning_style: str = "unknown"
    streak: int = 0
    created_at: str = dataclasses.field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
    )


@dataclasses.dataclass
class DailyTodo:
    todo_id: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str = ""
    task_date: str = ""  # YYYY-MM-DD
    label: str = ""
    completed: bool = False
    sort_order: int = 0
    created_at: str = dataclasses.field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
    )


@dataclasses.dataclass
class Session:
    session_id: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str = ""
    quiz_score: float = 0.0
    time_taken: int = 0
    mistakes: int = 0
    topic: str = ""
    difficulty: int = 1
    timestamp: str = dataclasses.field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
    )


def get_db() -> sqlite3.Connection:
    os.makedirs(_DB_DIR, exist_ok=True)
    db_path = os.path.join(_DB_DIR, "skill_forge.db")

    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    return conn


def create_tables(conn: sqlite3.Connection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            INT INTEGER NOT NULL,
            WIS INTEGER NOT NULL,
            energy INTEGER NOT NULL,
            xp INTEGER NOT NULL,
            level INTEGER NOT NULL,
            learning_style TEXT NOT NULL,
            streak INTEGER NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            quiz_score REAL NOT NULL,
            time_taken INTEGER NOT NULL,
            mistakes INTEGER NOT NULL,
            topic TEXT NOT NULL,
            difficulty INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS daily_todos (
            todo_id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            task_date TEXT NOT NULL,
            label TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_daily_todos_student_date
        ON daily_todos (student_id, task_date)
    """)


def insert_student(conn: sqlite3.Connection, student: Student) -> None:
    student.INT = min(100, max(0, student.INT))
    student.WIS = min(100, max(0, student.WIS))
    student.energy = min(100, max(0, student.energy))

    conn.execute("""
        INSERT INTO students (student_id, name, INT, WIS, energy, xp, level, learning_style, streak, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        student.student_id,
        student.name,
        student.INT,
        student.WIS,
        student.energy,
        student.xp,
        student.level,
        student.learning_style,
        student.streak,
        student.created_at,
    ))


def insert_session(conn: sqlite3.Connection, session: Session) -> None:
    conn.execute("""
        INSERT INTO sessions (session_id, student_id, quiz_score, time_taken, mistakes, topic, difficulty, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session.session_id,
        session.student_id,
        session.quiz_score,
        session.time_taken,
        session.mistakes,
        session.topic,
        session.difficulty,
        session.timestamp,
    ))


def get_student_by_id(conn: sqlite3.Connection, student_id: str) -> Student | None:
    row = conn.execute("SELECT * FROM students WHERE student_id = ?", (student_id,)).fetchone()
    if row is None:
        return None
    return Student(
        student_id=row["student_id"],
        name=row["name"],
        INT=row["INT"],
        WIS=row["WIS"],
        energy=row["energy"],
        xp=row["xp"],
        level=row["level"],
        learning_style=row["learning_style"],
        streak=row["streak"],
        created_at=row["created_at"],
    )


def get_sessions_by_student(conn: sqlite3.Connection, student_id: str) -> list[Session]:
    rows = conn.execute("SELECT * FROM sessions WHERE student_id = ?", (student_id,)).fetchall()
    return [
        Session(
            session_id=row["session_id"],
            student_id=row["student_id"],
            quiz_score=row["quiz_score"],
            time_taken=row["time_taken"],
            mistakes=row["mistakes"],
            topic=row["topic"],
            difficulty=row["difficulty"],
            timestamp=row["timestamp"],
        )
        for row in rows
    ]


def _row_to_todo(row) -> DailyTodo:
    return DailyTodo(
        todo_id=row["todo_id"],
        student_id=row["student_id"],
        task_date=row["task_date"],
        label=row["label"],
        completed=bool(row["completed"]),
        sort_order=row["sort_order"],
        created_at=row["created_at"],
    )


def get_todos_for_date(conn: sqlite3.Connection, student_id: str, task_date: str) -> list[DailyTodo]:
    rows = conn.execute(
        """
        SELECT * FROM daily_todos
        WHERE student_id = ? AND task_date = ?
        ORDER BY sort_order ASC, created_at ASC
        """,
        (student_id, task_date),
    ).fetchall()
    return [_row_to_todo(r) for r in rows]


def insert_todo(conn: sqlite3.Connection, todo: DailyTodo) -> None:
    conn.execute(
        """
        INSERT INTO daily_todos (todo_id, student_id, task_date, label, completed, sort_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            todo.todo_id,
            todo.student_id,
            todo.task_date,
            todo.label.strip(),
            1 if todo.completed else 0,
            todo.sort_order,
            todo.created_at,
        ),
    )


def get_todo_by_id(conn: sqlite3.Connection, todo_id: str) -> DailyTodo | None:
    row = conn.execute("SELECT * FROM daily_todos WHERE todo_id = ?", (todo_id,)).fetchone()
    return _row_to_todo(row) if row else None


def update_todo(
    conn: sqlite3.Connection,
    todo_id: str,
    *,
    label: str | None = None,
    completed: bool | None = None,
    sort_order: int | None = None,
) -> None:
    todo = get_todo_by_id(conn, todo_id)
    if todo is None:
        return
    if label is not None:
        todo.label = label.strip()
    if completed is not None:
        todo.completed = completed
    if sort_order is not None:
        todo.sort_order = sort_order
    conn.execute(
        """
        UPDATE daily_todos
        SET label = ?, completed = ?, sort_order = ?
        WHERE todo_id = ?
        """,
        (todo.label, 1 if todo.completed else 0, todo.sort_order, todo_id),
    )


def delete_todo(conn: sqlite3.Connection, todo_id: str) -> None:
    conn.execute("DELETE FROM daily_todos WHERE todo_id = ?", (todo_id,))


def copy_incomplete_todos(
    conn: sqlite3.Connection, student_id: str, from_date: str, to_date: str
) -> int:
    """Copy incomplete tasks from one day to another. Returns count copied."""
    existing = {t.label.lower() for t in get_todos_for_date(conn, student_id, to_date)}
    incomplete = [
        t
        for t in get_todos_for_date(conn, student_id, from_date)
        if not t.completed and t.label.lower() not in existing
    ]
    base_order = len(get_todos_for_date(conn, student_id, to_date))
    for i, t in enumerate(incomplete):
        insert_todo(
            conn,
            DailyTodo(
                student_id=student_id,
                task_date=to_date,
                label=t.label,
                sort_order=base_order + i,
            ),
        )
    return len(incomplete)


def update_student(conn: sqlite3.Connection, student: Student) -> None:
    student.INT = min(100, max(0, student.INT))
    student.WIS = min(100, max(0, student.WIS))
    student.energy = min(100, max(0, student.energy))

    conn.execute("""
        UPDATE students
        SET INT = ?, WIS = ?, energy = ?, xp = ?, level = ?, learning_style = ?, streak = ?
        WHERE student_id = ?
    """, (
        student.INT,
        student.WIS,
        student.energy,
        student.xp,
        student.level,
        student.learning_style,
        student.streak,
        student.student_id,
    ))


if __name__ == "__main__":
    conn = get_db()
    try:
        create_tables(conn)
        test_student = Student(name="Test Student")
        insert_student(conn, test_student)
        conn.commit()
        print(get_student_by_id(conn, test_student.student_id))
        print("DB READY — tables created, test student verified")
    finally:
        conn.close()
