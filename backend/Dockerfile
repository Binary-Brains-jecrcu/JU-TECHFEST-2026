FROM python:3.9-slim

# Install system dependencies for OpenCV and PaddlePaddle
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source and public directory
COPY backend/ ./backend/
COPY public/ ./public/

ENV PORT=8000
EXPOSE 8000

CMD ["python3", "backend/prescription_server.py", "8000"]
