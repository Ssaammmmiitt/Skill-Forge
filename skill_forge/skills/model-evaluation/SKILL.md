# Model evaluation skill

## What this skill is for
Use this to compare model performance and save reports after training.

## Environment facts
- Libraries: sklearn.metrics, matplotlib, seaborn, pandas
- Output folder: reports/

## Step-by-step instructions
1. Load both saved models and the test set
2. Get predictions from both
3. For each model compute: accuracy, precision (macro), recall (macro), F1 (macro)
4. Print sklearn classification_report for both
5. Plot confusion matrix for both side-by-side using seaborn heatmap
6. Save the plot to reports/confusion_matrix.png
7. Save metric comparison to reports/model_comparison.csv

## Rules
- Always use macro averaging for precision/recall/F1 (not weighted)
- Confusion matrix must have class names on axes, not integers
- CSV must have exactly these columns: Model, Accuracy, Precision, Recall, F1

## Verification checklist
- [ ] reports/model_comparison.csv exists and has 2 rows (one per model)
- [ ] reports/confusion_matrix.png is saved and non-empty
- [ ] All metric values are between 0 and 1