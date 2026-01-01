FROM python:3.12-slim

WORKDIR /app

# Small build deps (kept minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m pip install --no-cache-dir --upgrade pip \
  && python -m pip install --no-cache-dir -r requirements.txt

# Optional (heavier): bake spaCy model in image
# RUN python -m spacy download en_core_web_sm

COPY . .

# Cloud Run injects PORT env var; default to 8080
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
