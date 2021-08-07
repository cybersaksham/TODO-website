from flask import Flask, render_template, session, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import json
import os

# Loading variable configurations
with open("config.json") as f:
    params = json.load(f)

# Creating app
app = Flask(__name__)

# Secret key for session storage
app.secret_key = params["SECRET"]

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

    def __init__(self, email, password):
        self.email = email
        self.password = password


# Todos Table
class Todos(db.Model):
    __tablename__ = "todos"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(20), nullable=False)
    content = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(20), nullable=False)

    def __init__(self, email, title, content, time):
        self.email = email
        self.title = title
        self.content = content
        self.time = time


# Owner Region (used to send otp by website owner's email)
email_ = params["owner_email"]
password_ = os.environ.get('OWNER_PASSWORD', None)


@app.route('/')
def home():
    if "user" in session:
        return render_template("index.html")
    return render_template("login.html")


def add_user(email):
    # Adding user in session storage to check logged in or not
    session["user"] = email


@app.route('/login_user', methods=["POST"])
def login_user():
    # Logging in
    if request.method == "POST":
        # Getting values from form
        email = request.form["email"]
        password = request.form["password"]

        # Finding user by email
        user = db.session.query(Users).filter(Users.email == email).first()

        if user is not None:
            # If user is present in database
            if password == user.password:
                # If password is correct
                add_user(email)
                if "otp" in session and "email_otp" in session:
                    # Removing otp storage if present
                    session.pop("otp")
                    session.pop("email_otp")
                return jsonify(error=None)
            else:
                # If password is incorrect
                return jsonify(error="Incorrect Password")
        else:
            # If user is not present in database
            return jsonify(error="Not Registered")


@app.route('/register_user', methods=["POST"])
def register_user():
    # Registering
    if request.method == "POST":
        # Getting values from form
        email = request.form["email"]
        password = request.form["password"]
        otp = request.form["otp"]

        if "otp" in session and "email_otp" in session:
            # If otp is present
            try:
                if int(session["otp"]) == int(otp) and session["email_otp"] == email:
                    # If otp is correct
                    try:
                        # Try to add user in database
                        admin = Users(email, password)
                        db.session.add(admin)
                        db.session.commit()
                        add_user(email)
                        return jsonify(error=None)
                    except:
                        # If user is already present
                        return jsonify(error="Already Registered")
                    finally:
                        # In both cases clearing otp
                        session.pop("otp")
                        session.pop("email_otp")
                else:
                    # If otp is incorrect
                    return jsonify(error="Incorrect OTP")
            except:
                return jsonify(error="Incorrect OTP")
        else:
            # If otp is not present then request it
            return jsonify(error="Request OTP")


@app.route('/forgot_user', methods=["POST"])
def forgot_user():
    # Forgot password
    if request.method == "POST":
        # Getting values from form
        email = request.form["email"]
        password = request.form["password"]
        otp = request.form["otp"]

        # Finding user by email
        user = db.session.query(Users).filter(Users.email == email).first()

        if user is not None:
            # If user is found in database
            if "otp" in session and "email_otp" in session:
                # If otp is present in session storage
                try:
                    if int(session["otp"]) == int(otp) and email == session["email_otp"]:
                        # If otp is correct
                        # Updating Password
                        db.session.query(Users).filter(Users.email == email).update({Users.password: password})
                        db.session.commit()
                        add_user(email)
                        # Clearing otp
                        session.pop("otp")
                        session.pop("email_otp")
                        return jsonify(error=None)
                    else:
                        # If otp is incorrect
                        return jsonify(error="Incorrect OTP")
                except:
                    return jsonify(error="Incorrect OTP")
            else:
                # If otp is not present then request it
                return jsonify(error="Request OTP")
        else:
            # If user is not found in database
            return jsonify(error="Not Registered")


@app.route('/send_otp', methods=["POST"])
def send_otp():
    # Sending otp
    import requests
    email = request.form["email"]
    response = requests.post(
        url=f"https://cybersaksham-apis.herokuapp.com/mail_otp?from={email_}&to={email}&password={password_}"
    )
    # Adding otp in session storage
    session["otp"] = response.json()["otp"]
    session["email_otp"] = email
    return jsonify(response=response.json())


@app.route('/fetch_todos', methods=["POST"])
def fetch_todos():
    # Fetching todos
    if request.method == "POST":
        if "user" in session:
            # Getting all todos
            list__ = db.session.query(Todos).filter(Todos.email == session["user"]).all()
            if len(list__) != 0:
                data__ = []
                for todo in list__:
                    data__.append({"id": todo.id, "title": todo.title,
                                   "content": todo.content, "time": todo.time})
                return jsonify(error=None, data=data__)
            return jsonify(error="No todo", data=None)
        else:
            return jsonify(error="Login First", data=None)


@app.route('/add_todo', methods=["POST"])
def add_todo():
    # Adding todos
    if request.method == "POST":
        if "user" in session:
            # Getting data from form
            title__ = request.form["title"]
            content__ = request.form["todo"]
            todo__ = Todos(session["user"], title__, content__, "08 Aug, 2021 12:45")
            db.session.add(todo__)
            db.session.commit()
            return jsonify(error=None)
        else:
            return jsonify(error="Login First")


if __name__ == '__main__':
    app.run(debug=params["debug"])
