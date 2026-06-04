from typing import Any


def patch_sklearn_estimator(estimator: Any) -> Any:
    """Backfill attributes missing on models pickled with older sklearn versions."""
    if estimator is None:
        return estimator
    if not hasattr(estimator, "monotonic_cst"):
        estimator.monotonic_cst = None
    return estimator
