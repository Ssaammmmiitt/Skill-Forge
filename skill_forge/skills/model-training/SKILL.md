# Model training skill

## What this skill is for
Use this to train the Decision Tree and Neural Network classifiers on student session data.

## Environment facts
- Input: data/training_data.csv
- Features: quiz_score, time_taken, mistakes, consistency_score (std dev of last 5 sessions)
- Label column: learning_style
- Libraries: scikit-learn, torch, pandas, numpy
- Save trained models to: models/saved/dt_model.pkl and models/saved/nn_model.pt

## Step-by-step instructions
1. Load CSV, encode labels as integers (fast_learner=0, slow_learner=1, conceptual=2, memorization=3)
2. Split 80/20 train/test using train_test_split(random_state=42)
3. Normalize features with StandardScaler — fit on train only, transform both
4. Train Decision Tree: max_depth=5, random_state=42
5. Save DT with pickle to models/saved/dt_model.pkl
6. Build PyTorch MLP: Linear(4→64) ReLU Linear(64→32) ReLU Linear(32→4)
7. Train NN: Adam optimizer lr=0.001, CrossEntropyLoss, 50 epochs, print loss every 10
8. Save NN with torch.save() to models/saved/nn_model.pt
9. Print accuracy for both models on test set

## Rules
- Never fit the scaler on test data
- Always set random seeds before training (numpy, torch, sklearn)
- Models must predict all 4 classes — verify with unique(y_pred)

## Verification checklist
- [ ] Both model files exist in models/saved/
- [ ] Both achieve >65% accuracy on test set
- [ ] No class is completely missing from predictions