import sys
import os
import pickle
import time
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.features import load_and_prepare

class SkillForgeNet(nn.Module):
    """3-layer PyTorch MLP classifier for student learning styles (needed for model reconstruction)."""
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Sequential(
            nn.Linear(5, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3)
        )
        self.layer2 = nn.Sequential(
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        self.layer3 = nn.Linear(32, 4)
        
    def forward(self, x):
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        return x

def main():
    # 1. LOAD EVERYTHING
    X_train, X_test, y_train, y_test, scaler, label_encoder = load_and_prepare("data/training_data.csv")
    
    # Load Decision Tree
    with open("models/saved/dt_model.pkl", "rb") as f:
        clf_dt = pickle.load(f)
        
    # Load Neural Network
    model_nn = torch.load("models/saved/nn_model_full.pt", map_location="cpu", weights_only=False)
    model_nn.eval()
    
    # Load Label Encoder (from features or saved path)
    with open("models/saved/label_encoder.pkl", "rb") as f:
         label_encoder = pickle.load(f)
         
    # 2. GET PREDICTIONS & MEASURE PROXY INFERENCE TIME
    # Decision Tree prediction
    start_dt = time.time()
    y_pred_dt = clf_dt.predict(X_test)
    dt_time = time.time() - start_dt
    
    # Neural Network prediction
    start_nn = time.time()
    with torch.no_grad():
        test_t = torch.FloatTensor(X_test)
        logits = model_nn(test_t)
        y_pred_nn = torch.argmax(logits, dim=1).numpy()
    nn_time = time.time() - start_nn
    
    # 3. COMPUTE METRICS
    # Decision Tree
    acc_dt = accuracy_score(y_test, y_pred_dt)
    prec_dt = precision_score(y_test, y_pred_dt, average="macro", zero_division=0)
    rec_dt = recall_score(y_test, y_pred_dt, average="macro", zero_division=0)
    f1_dt = f1_score(y_test, y_pred_dt, average="macro", zero_division=0)
    
    # Neural Net
    acc_nn = accuracy_score(y_test, y_pred_nn)
    prec_nn = precision_score(y_test, y_pred_nn, average="macro", zero_division=0)
    rec_nn = recall_score(y_test, y_pred_nn, average="macro", zero_division=0)
    f1_nn = f1_score(y_test, y_pred_nn, average="macro", zero_division=0)
    
    # Print prediction speed metrics as proxy
    print(f"Decision Tree prediction time: {dt_time:.6f}s")
    print(f"Neural Net prediction time: {nn_time:.6f}s\n")
    
    # 4. PRINT FULL REPORTS TO STDOUT
    class_names = list(label_encoder.classes_)
    print("=" * 60)
    print("DECISION TREE CLASSIFICATION REPORT")
    print("=" * 60)
    print(classification_report(y_test, y_pred_dt, target_names=class_names))
    
    print("=" * 60)
    print("NEURAL NETWORK CLASSIFICATION REPORT")
    print("=" * 60)
    print(classification_report(y_test, y_pred_nn, target_names=class_names))
    
    # 5. SAVE CSV
    os.makedirs("reports", exist_ok=True)
    comparison_data = [
        {
            "Model": "Decision Tree",
            "Accuracy": round(acc_dt, 4),
            "Precision_Macro": round(prec_dt, 4),
            "Recall_Macro": round(rec_dt, 4),
            "F1_Macro": round(f1_dt, 4)
        },
        {
            "Model": "Neural Net",
            "Accuracy": round(acc_nn, 4),
            "Precision_Macro": round(prec_nn, 4),
            "Recall_Macro": round(rec_nn, 4),
            "F1_Macro": round(f1_nn, 4)
        }
    ]
    df = pd.DataFrame(comparison_data)
    df.to_csv("reports/model_comparison.csv", index=False)
    
    # 6. PLOT CONFUSION MATRICES
    cm_dt = confusion_matrix(y_test, y_pred_dt)
    cm_nn = confusion_matrix(y_test, y_pred_nn)
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Decision Tree Heatmap
    sns.heatmap(cm_dt, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=axes[0])
    axes[0].set_title("Decision Tree")
    axes[0].set_xlabel("Predicted label")
    axes[0].set_ylabel("True label")
    
    # Neural Net Heatmap
    sns.heatmap(cm_nn, annot=True, fmt="d", cmap="Blues",
                xticklabels=class_names, yticklabels=class_names, ax=axes[1])
    axes[1].set_title("Neural Net")
    axes[1].set_xlabel("Predicted label")
    axes[1].set_ylabel("True label")
    
    plt.tight_layout()
    plt.savefig("reports/confusion_matrix.png", dpi=150, bbox_inches="tight")
    plt.close()
    
    # 7. PRINT WINNER
    if f1_dt >= f1_nn:
        print(f"WINNER: Decision Tree (F1={f1_dt:.2f})")
    else:
        print(f"WINNER: Neural Net (F1={f1_nn:.2f})")

if __name__ == "__main__":
    main()
