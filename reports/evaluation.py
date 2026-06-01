import sys
import os
import random
import pickle
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.adaptive import adjust_difficulty
from models.features import CustomLabelEncoder

class FakeSession:
    """Mock session class conforming to difficulty adjustment expectations."""
    def __init__(self, score):
        self.quiz_score = score
        self.timestamp = "2026-06-01T00:00:00"  # Dummy timestamp

def run_simulation():
    # Load ML preprocessors
    DT_MODEL_PATH = "models/saved/dt_model.pkl"
    SCALER_PATH = "models/saved/scaler.pkl"
    LE_PATH = "models/saved/label_encoder.pkl"
    
    with open(DT_MODEL_PATH, "rb") as f:
        clf = pickle.load(f)
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    with open(LE_PATH, "rb") as f:
        label_encoder = pickle.load(f)
        
    num_students = 10
    num_rounds = 15
    
    # 1. SETUP SIMULATION STATE
    # Each student starts with: difficulty=3, style="unknown", score = random(50, 70), completion = 0.60
    students_state = []
    for i in range(num_students):
        students_state.append({
            "difficulty": 3,
            "learning_style": "unknown",
            "score": random.uniform(50.0, 70.0),
            "completion_rate": 0.60,
            "session_history": []  # List of FakeSession objects
        })
        
    # To track histories over time
    scores_history = np.zeros((num_students, num_rounds))
    difficulties_history = np.zeros((num_students, num_rounds))
    completion_rates_history = np.zeros((num_students, num_rounds))
    
    # 2. RUN SIMULATION LOOP
    for r in range(num_rounds):
        round_idx = r + 1
        
        for s_idx in range(num_students):
            state = students_state[s_idx]
            
            # Learning effect: improve score by [1.0, 4.0] per round
            improvement = random.uniform(1.0, 4.0)
            state["score"] = min(100.0, state["score"] + improvement)
            
            # Update task completion rate (+0.02 per round)
            state["completion_rate"] = min(1.0, state["completion_rate"] + 0.02)
            
            # Save historical fake session
            state["session_history"].insert(0, FakeSession(state["score"]))  # prepend so most recent is first
            
            # After every 3 rounds: adjust difficulty
            if round_idx % 3 == 0:
                state["difficulty"] = adjust_difficulty(state["session_history"], state["difficulty"])
                
            # After every 5 rounds: re-classify style using ML model
            if round_idx % 5 == 0:
                # Generate realistic time_taken and mistakes based on score profile for ML
                if state["score"] >= 80.0:
                    time_taken = 60.0 * random.uniform(0.95, 1.05)
                    mistakes = 1.0 * random.uniform(0.95, 1.05)
                elif state["score"] < 70.0:
                    time_taken = 240.0 * random.uniform(0.95, 1.05)
                    mistakes = 8.0 * random.uniform(0.95, 1.05)
                else:
                    time_taken = 100.0 * random.uniform(0.95, 1.05)
                    mistakes = 2.0 * random.uniform(0.95, 1.05)
                    
                time_taken = int(round(min(360.0, max(20.0, time_taken))))
                mistakes = int(round(min(20.0, max(0.0, mistakes))))
                
                raw_features = np.array([[state["score"], time_taken, mistakes, state["difficulty"], state["score"] / 100.0]])
                scaled_features = scaler.transform(raw_features)
                pred_class = clf.predict(scaled_features)[0]
                pred_style = label_encoder.inverse_transform([pred_class])[0]
                state["learning_style"] = pred_style
                
            # Record state for rounds
            scores_history[s_idx, r] = state["score"]
            difficulties_history[s_idx, r] = state["difficulty"]
            completion_rates_history[s_idx, r] = state["completion_rate"]
            
    # Calculate round aggregates
    mean_scores = np.mean(scores_history, axis=0)
    mean_difficulties = np.mean(difficulties_history, axis=0)
    mean_completion_rates = np.mean(completion_rates_history, axis=0)
    
    # 3. PLOTS
    os.makedirs("reports", exist_ok=True)
    rounds_axis = list(range(1, num_rounds + 1))
    
    # Score Trend
    plt.figure(figsize=(8, 5))
    plt.plot(rounds_axis, mean_scores, marker="o", color="blue", linewidth=2)
    plt.title("Score improvement over sessions")
    plt.xlabel("Session Round")
    plt.ylabel("Mean Score")
    plt.grid(True)
    plt.savefig("reports/behavioral_score_trend.png", dpi=150, bbox_inches="tight")
    plt.close()
    
    # Difficulty Trend
    plt.figure(figsize=(8, 5))
    plt.plot(rounds_axis, mean_difficulties, marker="s", color="red", linewidth=2)
    plt.title("Difficulty progression over sessions")
    plt.xlabel("Session Round")
    plt.ylabel("Mean Difficulty")
    plt.grid(True)
    plt.savefig("reports/behavioral_difficulty_progression.png", dpi=150, bbox_inches="tight")
    plt.close()
    
    # Completion Rate Trend
    plt.figure(figsize=(8, 5))
    plt.plot(rounds_axis, mean_completion_rates, marker="^", color="green", linewidth=2)
    plt.title("Task completion rate over sessions")
    plt.xlabel("Session Round")
    plt.ylabel("Mean Completion Rate")
    plt.grid(True)
    plt.savefig("reports/behavioral_completion_rate.png", dpi=150, bbox_inches="tight")
    plt.close()
    
    # 4. FINAL REPORT
    print("=== SKILL FORGE — FINAL EVALUATION REPORT ===")
    print("\n[Trained Model Comparison Summary]")
    print("-" * 65)
    df_metrics = pd.read_csv("reports/model_comparison.csv")
    print(df_metrics.to_string(index=False))
    print("-" * 65)
    
    # Compute aggregates
    initial_score = mean_scores[0]
    final_score = mean_scores[-1]
    final_diff = mean_difficulties[-1]
    final_completion = mean_completion_rates[-1]
    score_improvement = final_score - initial_score
    
    print("\n[Simulated Behavioral Metrics (10 Students across 15 Sessions)]")
    print(f"  - Mean final score: {final_score:.1f}")
    print(f"  - Mean final difficulty: {final_diff:.1f}")
    print(f"  - Mean task completion rate: {final_completion:.1f}")
    print(f"  - Score improvement from round 1 to 15: +{score_improvement:.1f} points")
    print("\nAll reports saved to reports/")

if __name__ == "__main__":
    run_simulation()
