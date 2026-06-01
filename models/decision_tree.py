import sys
import os
import pickle
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.features import load_and_prepare, save_preprocessors

def main():
    # 2. Call load_and_prepare
    X_train, X_test, y_train, y_test, scaler, label_encoder = load_and_prepare("data/training_data.csv")
    
    # 3. Train DT classifier
    clf = DecisionTreeClassifier(
        max_depth=5,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42
    )
    clf.fit(X_train, y_train)
    
    # 4. Print DT accuracy
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Decision Tree — Test accuracy: {accuracy:.2f}")
    
    # 5. Save model
    os.makedirs("models/saved", exist_ok=True)
    with open("models/saved/dt_model.pkl", "wb") as f:
        pickle.dump(clf, f)
        
    # 6. Save preprocessors
    save_preprocessors(scaler, label_encoder)

if __name__ == "__main__":
    main()
