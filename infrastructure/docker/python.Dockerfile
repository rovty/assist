# Base Python Dockerfile for AI/ML services (ai-engine, knowledge-base, analytics)
# Multi-stage build for minimal production images

# ─── Stage 1: Build ───
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies for building packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ && \
    rm -rf /var/lib/apt/lists/*

# Install uv for fast package management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

ARG SERVICE_NAME
COPY services/${SERVICE_NAME}/pyproject.toml services/${SERVICE_NAME}/uv.lock* ./

RUN uv pip install --system --no-cache -r pyproject.toml

# ─── Stage 2: Production image ───
FROM python:3.12-slim AS runner

RUN groupadd --system --gid 1001 assist && \
    useradd --system --uid 1001 --gid assist assist

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

ARG SERVICE_NAME
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV SERVICE_NAME=${SERVICE_NAME}

COPY --chown=assist:assist services/${SERVICE_NAME}/src ./src

USER assist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/health')" || exit 1

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3000"]
