from os import urandom, environ
from time import localtime, asctime, strftime
from functools import wraps
from flask import Flask, request, make_response, session, redirect, url_for
from flask import render_template, request
from cas import CASClient
from sqlalchemy import func
# from models.room import Room
from models.review import SuiteReview
from models.base import Base
from models.user import User
from models.friend import Friend
from database import Database
from models.suite import Suite
from models.preference import Preference

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
    # Get all the suites that the user has saved
    user_id = session.get('net_id')
    suites = db.session.query(Suite).join(Preference).filter(Preference.user_id == user_id).all()

    html = render_template("homepage.html", suites=suites)
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
    floor = request.args.get('floor') 
    class_year = request.args.get('class')

    query = db.session.query(Suite)
    if capacity:
        query = query.filter(Suite.capacity == capacity)
    if floor:
        query = query.filter(func.substring(Suite.name, 2, 1) == floor)
    if class_year:
        query = query.filter(Suite.year == int(class_year))
    suites = query.all()
    html = render_template('results.html', capacity=capacity, suites = suites)
    response = make_response(html)
    return response


@app.route('/like_room<int:suite_id>', methods = ['GET', 'POST'])
@login_required
def like_room(suite_id):
    netid = session.get('net_id')
    print(f"User net_id from session: {netid}")

    suite = db.session.query(Suite).filter_by(id=suite_id).first()
    if not suite:
        return "Suite not found", 404

    existing_pref = db.session.query(Preference).filter_by(user_id=netid, suite_id=suite.id).first()

    if not existing_pref:
        preference = Preference(user_id=netid, suite_id=suite.id)
        db.session.add(preference)
        db.session.commit()
        print(f"Added preference for netid {netid} and suite {suite.id}")
    else:
        print(f"Preference already exists for netid {netid} and suite {suite.id}")

    return redirect(url_for('homepage'))


@app.route('/summary/<int:suite_id>', methods = ["GET", "POST"])
def summary(suite_id=None):
    # Display information about the suite, as well as the reviews it has
    query = db.session.query(Suite)
    review_query = db.session.query(SuiteReview)

    if request.method == "POST":
        # Save the suite
        if suite_id:
            user_id = session.get('net_id')
            db.save_suite(user_id, suite_id)
            return redirect(url_for('homepage'))
    

    if suite_id:
        query = query.filter(Suite.id == suite_id)
        review_query = review_query.filter(SuiteReview.suite_id == suite_id)
    suites = query.all()
    reviews = review_query.all()
    print(reviews)

    html = render_template('summary.html', suites=suites, reviews=reviews, suite_id=suite_id)
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

@app.route('/friends', methods = ["GET", "POST"])
@login_required
def friends():
    if request.method == 'POST':
        user_id = session.get('net_id')
        friend_id = request.form['friend_id']

        friends = db.session.query(Friend).filter(Friend.user_id == session.get('net_id')).all()

        # Check if user is trying to add themselves as a friend
        if user_id == friend_id:
            return render_template('friends.html', error="You cannot add yourself as a friend.", friends=friends)
        
        # Check if the user is already friends with the friend_id
        if db.session.query(Friend).filter(Friend.user_id == user_id, Friend.friend_id == friend_id).first():
            return render_template('friends.html', error="You are already friends with this user.", friends=friends)
        
        db.create_friendship(user_id, friend_id)

        return redirect(url_for('friends'))

    # Query all friends where the user_id is the current user
    friends = db.session.query(Friend).filter(Friend.user_id == session.get('net_id')).all()

    # TODO: Also query all friends where the friend_id is the current user? 
    # TODO: Friend requests instead of just being able to add someone without their permission
    # Briley: The way I envision this is that the user can send a friend request to another user, 
    # and the other user can accept or decline the request.
    # Then, each friend in the user's friend list will be a hyperlink to the friend's stuff.

    return render_template('friends.html', friends=friends)

@app.route('/friend/<string:friend_id>', methods = ["GET"])
@login_required
def friend(friend_id=None):
    if friend_id:
        # Query the friend's saved suites
        suites = db.session.query(Suite).join(Preference).filter(Preference.user_id == friend_id).all()
        return render_template('homepage.html', suites=suites, friend_id=friend_id)