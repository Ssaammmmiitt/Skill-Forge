import os

import pandas as pd
from fastapi import APIRouter
from fastapi.responses import FileResponse

from api.responses import error, success

router = APIRouter(prefix="/api/ml", tags=["ml"])

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COMPARISON_CSV = os.path.join(ROOT, "reports", "model_comparison.csv")
CONFUSION_PNG = os.path.join(ROOT, "reports", "confusion_matrix.png")


@router.get("/comparison")
def get_model_comparison():
    if not os.path.isfile(COMPARISON_CSV):
        return error(
            "Model metrics not available — run: python scripts/setup_ml.py",
            503,
        )

    df = pd.read_csv(COMPARISON_CSV)
    models = []
    for _, row in df.iterrows():
        name = str(row["Model"])
        key = name.lower().replace(" ", "_")
        models.append(
            {
                "key": key,
                "name": name,
                "accuracy": float(row["Accuracy"]),
                "precision": float(row["Precision_Macro"]),
                "recall": float(row["Recall_Macro"]),
                "f1_score": float(row["F1_Macro"]),
            }
        )

    winner = max(models, key=lambda m: m["f1_score"]) if models else None
    return success(
        {
            "models": models,
            "winner": winner["name"] if winner else None,
            "winner_f1": winner["f1_score"] if winner else None,
            "has_confusion_matrix": os.path.isfile(CONFUSION_PNG),
        }
    )


@router.get("/confusion-matrix")
def get_confusion_matrix_image():
    if not os.path.isfile(CONFUSION_PNG):
        return error(
            "Confusion matrix image not found — run: python scripts/setup_ml.py",
            404,
        )
    return FileResponse(CONFUSION_PNG, media_type="image/png")
