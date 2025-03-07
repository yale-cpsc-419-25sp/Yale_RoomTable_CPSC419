from os import urandom, environ
from time import localtime, asctime, strftime
from functools import wraps
from flask import Flask, request, make_response, session, redirect, url_for
from flask import render_template
from cas import CASClient

app = Flask(__name__, template_folder='./templates')
app.secret_key = urandom(24)

# https://stackoverflow.com/questions/67439625/python-equivalent-of-process-env-port-3000
port = int(environ.get('PORT', 8000))

CAS_SERVICE_URL = "http://localhost:" + str(port) + "/login"
CAS_SERVER_URL = "https://secure.its.yale.edu/cas/login"
cas = CASClient(
    version=3.0,
    service_url=CAS_SERVICE_URL,
    server_url=CAS_SERVER_URL
)


def login_required(f):
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/1.1.x/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('net_id') is None:
            return render_template("index.html")
        return f(*args, **kwargs)
    return decorated_function

@app.route('/', methods=['GET'])
def index():
    html = render_template('index.html')
    response = make_response(html)
    return response

@app.route('/login', methods=['GET'])
def login():
    if 'net_id' in session:
        return redirect(url_for('search'))

    next_url = request.args.get('next', url_for('search'))
    ticket = request.args.get('ticket')
    if not ticket:
        cas_login_url = cas.get_login_url()
        return redirect(cas_login_url)

    net_id, _, _ = cas.verify_ticket(ticket)

    if not net_id:
        return
    else:
        session['net_id'] = net_id
        return redirect(next_url)
    
@app.route('/homepage', methods=["GET"])
@login_required
def homepage():
    html = render_template("homepage.html")
    response = make_response(html)
    return response

@app.route('/search', methods=['GET'])
@login_required
def search():
    html = render_template('search.html')
    response = make_response(html)
    return response

@app.route('/results', methods=['GET'])
@login_required
def results():
    capacity = request.args.get('capacity')
    print(capacity)
    floor = request.args.get('floor')
    class_year = request.args.get('class')
    html = render_template('results.html', capacity=capacity, floor=floor, class_year=class_year)
    response = make_response(html)
    return response
