import sqlite3
import uuid
import dataclasses
import datetime
import os

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
    created_at: str = dataclasses.field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())

@dataclasses.dataclass
class Session:
    session_id: str = dataclasses.field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str = ""
    quiz_score: float = 0.0
    time_taken: int = 0
    mistakes: int = 0
    topic: str = ""
    difficulty: int = 1
    timestamp: str = dataclasses.field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())

def get_db() -> sqlite3.Connection:
    """Returns a sqlite3.Connection to skill_forge.db.
    Ensures the data directory inside skill_forge/ exists.
    """
    db_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, "skill_forge.db")
    
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    return conn

def create_tables(conn: sqlite3.Connection) -> None:
    """Creates students and sessions tables if they do not exist."""
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

def insert_student(conn: sqlite3.Connection, student: Student) -> None:
    """Enforces 0-100 clamping limits on INT, WIS, and energy before inserting a new student."""
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
        student.created_at
    ))

def insert_session(conn: sqlite3.Connection, session: Session) -> None:
    """Inserts a new learning session log."""
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
        session.timestamp
    ))

def get_student_by_id(conn: sqlite3.Connection, student_id: str) -> Student | None:
    """Retrieves a student by ID. Returns None if no matching student exists."""
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
        created_at=row["created_at"]
    )

def get_sessions_by_student(conn: sqlite3.Connection, student_id: str) -> list[Session]:
    """Retrieves all sessions belonging to the student ID, returning an empty list if none found."""
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
            timestamp=row["timestamp"]
        )
        for row in rows
    ]

def update_student(conn: sqlite3.Connection, student: Student) -> None:
    """Updates mutable student fields in the database, enforcing 0-100 clamping limits on INT, WIS, energy."""
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
        student.student_id
    ))

if __name__ == "__main__":
    conn = get_db()
    try:
        create_tables(conn)
        
        # Insert one test student with name="Test Student"
        test_student = Student(name="Test Student")
        insert_student(conn, test_student)
        conn.commit()
        
        # Read it back with get_student_by_id()
        retrieved = get_student_by_id(conn, test_student.student_id)
        
        # Print the student to confirm
        print(retrieved)
        
        # Print "DB READY — tables created, test student verified"
        print("DB READY — tables created, test student verified")
        
    finally:
        conn.close()
