from fastapi.responses import JSONResponse


def success(data, status: int = 200) -> JSONResponse:
    return JSONResponse(
        content={"data": data, "error": None, "status": status},
        status_code=status,
    )


def error(msg: str, status: int = 400) -> JSONResponse:
    return JSONResponse(
        content={"data": None, "error": msg, "status": status},
        status_code=status,
    )
