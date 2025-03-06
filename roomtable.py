from os import urandom
from time import localtime, asctime, strftime
from flask import Flask, request, make_response, session, redirect, url_for
from flask import render_template
from cas import CASClient

app = Flask(__name__, template_folder='./templates')
app.secret_key = urandom(24)

CAS_SERVICE_URL = "http://localhost:8000"
CAS_SERVER_URL = "https://secure.its.yale.edu/cas/login"
cas = CASClient(
    version=3.0,
    service_url=CAS_SERVICE_URL,
    server_url=CAS_SERVER_URL
)

@app.route('/', methods=['GET'])
def index():
    html = render_template('index.html')
    response = make_response(html)
    return response

@app.route('/login', methods=['GET'])
def login():
    if 'username' in session:
        return redirect(url_for('search'))

    next_url = request.args.get('next', url_for('search'))
    ticket = request.args.get('ticket')
    print(next_url)
    print(ticket)
    if not ticket:
        cas_login_url = cas.get_login_url()
        return redirect(cas_login_url)

    user, _, _ = cas.verify_ticket(ticket)

    if not user:
        return
    else:
        session['username'] = user
        return redirect(next_url)

@app.route('/search', methods=['GET'])
def search():
    html = render_template('search.html')
    response = make_response(html)
    return response

@app.route('/results', methods=['GET'])
def results():
    capacity = request.args.get('capacity')
    print(capacity)
    floor = request.args.get('floor')
    class_year = request.args.get('class')
    html = render_template('results.html', capacity=capacity, floor=floor, class_year=class_year)
    response = make_response(html)
    return response
