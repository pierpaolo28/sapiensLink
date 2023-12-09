# Use an official Python runtime as a parent image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
WORKDIR /app

ENV PIP_TIMEOUT=120

# Install dependencies
RUN apt-get update \
    && apt-get install -y postgresql-client graphviz libgraphviz-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --upgrade pip
RUN pip install celery
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# Copy the project code into the container
COPY . /app/

# Expose the port the app runs on
EXPOSE 8000

# Run the application
ENTRYPOINT ["wait-for-it", "db:5432", "--"]
CMD ["gunicorn", "sapiensLink.wsgi:application", "--bind", "0.0.0.0:8000"]


