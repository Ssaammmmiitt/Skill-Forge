"""Quiz question pools — 5 questions sampled per session per difficulty band."""

QUESTIONS_BY_LEVEL = {
    1: [
        {"id": "b1_01", "question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "correct_index": 1, "topic": "mathematics"},
        {"id": "b1_02", "question": "How many sides does a triangle have?", "options": ["2", "3", "4", "5"], "correct_index": 1, "topic": "mathematics"},
        {"id": "b1_03", "question": "What color is the sky on a clear day?", "options": ["Red", "Blue", "Green", "Yellow"], "correct_index": 1, "topic": "geography"},
        {"id": "b1_04", "question": "What is the capital of France?", "options": ["Berlin", "Madrid", "Paris", "Rome"], "correct_index": 2, "topic": "geography"},
        {"id": "b1_05", "question": "What is H₂O commonly known as?", "options": ["Air", "Water", "Fire", "Salt"], "correct_index": 1, "topic": "chemistry"},
        {"id": "b1_06", "question": "Which organ pumps blood?", "options": ["Lungs", "Heart", "Liver", "Kidney"], "correct_index": 1, "topic": "biology"},
        {"id": "b1_07", "question": "How many days are in a week?", "options": ["5", "6", "7", "8"], "correct_index": 2, "topic": "mathematics"},
        {"id": "b1_08", "question": "What gas do plants absorb?", "options": ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], "correct_index": 2, "topic": "biology"},
        {"id": "b1_09", "question": "Who wrote 'Romeo and Juliet'?", "options": ["Shakespeare", "Dickens", "Tolkien", "Austen"], "correct_index": 0, "topic": "literature"},
        {"id": "b1_10", "question": "What is 10 − 3?", "options": ["5", "6", "7", "8"], "correct_index": 2, "topic": "mathematics"},
        {"id": "b1_11", "question": "Which planet do we live on?", "options": ["Mars", "Earth", "Venus", "Jupiter"], "correct_index": 1, "topic": "geography"},
        {"id": "b1_12", "question": "What is the largest ocean?", "options": ["Atlantic", "Indian", "Pacific", "Arctic"], "correct_index": 2, "topic": "geography"},
    ],
    5: [
        {"id": "b5_01", "question": "What is the capital of Italy?", "options": ["Rome", "Venice", "Milan", "Naples"], "correct_index": 0, "topic": "geography"},
        {"id": "b5_02", "question": "Which planet is the Red Planet?", "options": ["Earth", "Mars", "Venus", "Mercury"], "correct_index": 1, "topic": "geography"},
        {"id": "b5_03", "question": "What is 12 × 5?", "options": ["50", "55", "60", "65"], "correct_index": 2, "topic": "mathematics"},
        {"id": "b5_04", "question": "Chemical symbol for gold?", "options": ["Ag", "Fe", "Au", "Pb"], "correct_index": 2, "topic": "chemistry"},
        {"id": "b5_05", "question": "Who painted the Mona Lisa?", "options": ["Van Gogh", "Da Vinci", "Picasso", "Monet"], "correct_index": 1, "topic": "literature"},
        {"id": "b5_06", "question": "Speed = distance ÷ ?", "options": ["Mass", "Time", "Weight", "Volume"], "correct_index": 1, "topic": "physics"},
        {"id": "b5_07", "question": "Largest organ in the human body?", "options": ["Heart", "Liver", "Skin", "Brain"], "correct_index": 2, "topic": "biology"},
        {"id": "b5_08", "question": "Square root of 81?", "options": ["7", "8", "9", "10"], "correct_index": 2, "topic": "mathematics"},
        {"id": "b5_09", "question": "First element on the periodic table?", "options": ["Helium", "Hydrogen", "Lithium", "Carbon"], "correct_index": 1, "topic": "chemistry"},
        {"id": "b5_10", "question": "WWII ended in which year?", "options": ["1943", "1944", "1945", "1946"], "correct_index": 2, "topic": "history"},
        {"id": "b5_11", "question": "CPU stands for?", "options": ["Central Process Unit", "Computer Personal Unit", "Central Processing Unit", "Core Program Utility"], "correct_index": 2, "topic": "computer_science"},
        {"id": "b5_12", "question": "Photosynthesis occurs mainly in?", "options": ["Roots", "Stem", "Leaves", "Flowers"], "correct_index": 2, "topic": "biology"},
    ],
    10: [
        {"id": "b10_01", "question": "Derivative of x²?", "options": ["x", "2", "2x", "x²"], "correct_index": 2, "topic": "mathematics"},
        {"id": "b10_02", "question": "Speed of light (approx.)?", "options": ["300,000 km/s", "150,000 km/s", "30,000 km/s", "3,000 km/s"], "correct_index": 0, "topic": "physics"},
        {"id": "b10_03", "question": "Theory of general relativity by?", "options": ["Newton", "Galileo", "Einstein", "Hawking"], "correct_index": 2, "topic": "physics"},
        {"id": "b10_04", "question": "Capital of Australia?", "options": ["Sydney", "Melbourne", "Canberra", "Perth"], "correct_index": 2, "topic": "geography"},
        {"id": "b10_05", "question": "Powerhouse of the cell?", "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi"], "correct_index": 1, "topic": "biology"},
        {"id": "b10_06", "question": "Integral of 2x dx?", "options": ["x", "x²", "x² + C", "2x² + C"], "correct_index": 2, "topic": "mathematics"},
        {"id": "b10_07", "question": "Heisenberg uncertainty relates to?", "options": ["Gravity", "Quantum measurements", "Thermodynamics", "Optics"], "correct_index": 1, "topic": "physics"},
        {"id": "b10_08", "question": "DNA double helix discovered by?", "options": ["Darwin", "Watson & Crick", "Mendel", "Pasteur"], "correct_index": 1, "topic": "biology"},
        {"id": "b10_09", "question": "Big-O of binary search?", "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"], "correct_index": 1, "topic": "computer_science"},
        {"id": "b10_10", "question": "Inflation in economics means?", "options": ["Falling prices", "Rising general price level", "Zero growth", "Trade surplus"], "correct_index": 1, "topic": "economics"},
        {"id": "b10_11", "question": "Socrates is associated with?", "options": ["Stoicism", "Socratic method", "Empiricism", "Utilitarianism"], "correct_index": 1, "topic": "philosophy"},
        {"id": "b10_12", "question": "Schrodinger equation domain?", "options": ["Classical mechanics", "Quantum systems", "Fluid dynamics", "Relativity only"], "correct_index": 1, "topic": "physics"},
    ],
}

QUIZ_QUESTIONS_PER_SESSION = 5
