FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy AI service source code
COPY . .

# AI service configuration
ENV HOST=0.0.0.0
ENV PORT=8000

# FastAPI port
EXPOSE 8000

# Start AI service
CMD ["python", "main.py"]
