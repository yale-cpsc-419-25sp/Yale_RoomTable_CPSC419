from os import urandom, environ
from time import localtime, asctime, strftime
from functools import wraps
from flask import Flask, request, make_response, session, redirect, url_for
from flask import render_template, request
from cas import CASClient

# from models.room import Room
from models.review import SuiteReview
from models.base import Base
from models.user import User
from database import Database
from models.suite import Suite

db = Database()

# suites = db.session.query(Suite).all()
# for suite in suites:
#     print(suite.name, suite.capacity)

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


    query = db.session.query(Suite)
    if capacity:
        query = query.filter(Suite.capacity == capacity)
    # if floor:
    #     query = query.filter(Suite.entryway == floor)
    # if class_year:
    #     query = query.filter(Suite.year == int(class_year))
    print(f"Capacity: {capacity}")
    suites = query.all()
    html = render_template('results.html', capacity=capacity, suites = suites)
    response = make_response(html)
    return response


@app.route('/summary/<int:suite_id>', methods = ["GET", "POST"])
def summary(suite_id=None):
    # Display information about the suite, as well as the reviews it has
    query = db.session.query(Suite)
    review_query = db.session.query(SuiteReview)

    if suite_id:
        query = query.filter(Suite.id == suite_id)
        review_query = review_query.filter(SuiteReview.suite_id == suite_id)
    suites = query.all()
    reviews = review_query.all()
    print(reviews)

    html = render_template('summary.html', suites=suites, reviews=reviews)
    response = make_response(html)
    return response


@app.route('/reviews', methods = ["GET", "POST"])
def review():
    suites = db.session.query(Suite).all()

    if request.method == 'POST':
        suite_id = request.form['suite']
        accessibility_rating = int(request.form['accessibility'])
        space_rating = int(request.form['space'])
        review_text = request.form['review']
        overall_rating = int(request.form['rating'])
        user_id = request.form.get('user_id')

        # user_id = session.get('user_id')
        
        db.create_review(
            suite_id=suite_id,
            review_text=review_text,
            overall_rating=overall_rating,
            # type='suite_review',
            accessibility_rating=accessibility_rating,
            space_rating=space_rating,
            user_id=user_id
        )
        
        
        return redirect(url_for('review'))

    # Query all reviews to display
    all_reviews = db.session.query(SuiteReview).all()
    return render_template('reviews.html', reviews=all_reviews, suites=suites)