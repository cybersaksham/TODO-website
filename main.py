from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import json
import os

# Loading variable configurations
with open("config.json") as f:
    params = json.load(f)

# Creating app
app = Flask(__name__)

# Connecting to database
if params["debug"]:
    app.config['SQLALCHEMY_DATABASE_URI'] = params["local_database_uri"]
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', None).replace("postgres", "postgresql")
db = SQLAlchemy(app)


# Users Table
class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(30), nullable=False)


# Todos Table
class Todos(db.Model):
    __tablename__ = "todos"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(20), nullable=False)
    content = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(20), nullable=False)


@app.route('/')
def home():
    return "Website content"


if __name__ == '__main__':
    app.run(debug=params["debug"])
