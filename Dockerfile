FROM python:3

RUN mkdir -p /app/config

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "./src/main/main.py"]
EXPOSE 80
