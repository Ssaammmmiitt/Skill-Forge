import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

class CustomLabelEncoder(LabelEncoder):
    """Custom LabelEncoder subclass to enforce specific class order mappings:
    fast_learner=0, slow_learner=1, conceptual=2, memorization=3
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.classes_ = np.array(['fast_learner', 'slow_learner', 'conceptual', 'memorization'], dtype=object)

    def fit(self, y):
        # Override to keep classes fixed
        self.classes_ = np.array(['fast_learner', 'slow_learner', 'conceptual', 'memorization'], dtype=object)
        return self

    def transform(self, y):
        mapping = {val: idx for idx, val in enumerate(self.classes_)}
        return np.array([mapping[x] for x in y])

    def fit_transform(self, y):
        self.fit(y)
        return self.transform(y)

    def inverse_transform(self, y):
        return np.array([self.classes_[x] for x in y])

def load_and_prepare(csv_path: str):
    """Loads CSV, performs feature engineering, encodes target labels,
    splits data 80/20, and normalizes features using StandardScaler.
    Returns: X_train_scaled, X_test_scaled, y_train, y_test, scaler, label_encoder
    """
    df = pd.read_csv(csv_path)
    
    # 2. Select feature columns
    feature_cols = ['quiz_score', 'time_taken', 'mistakes', 'difficulty']
    X = df[feature_cols].copy()
    
    # 3. Add derived feature
    X['accuracy_rate'] = X['quiz_score'] / 100.0
    
    # 4. Encode labels
    label_encoder = CustomLabelEncoder()
    y = label_encoder.fit_transform(df['learning_style'])
    
    # 5. Split 80/20
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 6. Normalize with StandardScaler (fit ONLY on X_train)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, label_encoder

def save_preprocessors(scaler, label_encoder):
    """Saves scaler and label_encoder to models/saved/ using pickle."""
    os.makedirs("models/saved", exist_ok=True)
    with open("models/saved/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    with open("models/saved/label_encoder.pkl", "wb") as f:
        pickle.dump(label_encoder, f)

def load_preprocessors():
    """Loads and returns scaler and label_encoder from models/saved/."""
    with open("models/saved/scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    with open("models/saved/label_encoder.pkl", "rb") as f:
        label_encoder = pickle.load(f)
    return scaler, label_encoder
