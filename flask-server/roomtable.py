from os import urandom, environ
from functools import wraps
from flask import Flask, jsonify, request, make_response, session, redirect, url_for
from flask import render_template, request
from flask_cors import CORS
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

app = Flask(__name__, template_folder='./templates', static_folder='./build/static')
app.secret_key = urandom(24)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# https://stackoverflow.com/questions/67439625/python-equivalent-of-process-env-port-3000
port = int(environ.get('PORT', 8000))

CAS_SERVICE_URL = "http://localhost:" + str(port) + "/api/login"
CAS_SERVER_URL = "https://secure.its.yale.edu/cas/login"
cas = CASClient(
    version=3.0,
    service_url=CAS_SERVICE_URL,
    server_url=CAS_SERVER_URL
)

@app.route('/api/login', methods=['GET'])
def login():
    if 'net_id' in session:
        return redirect('http://localhost:5173/search')

    ticket = request.args.get('ticket')
    if not ticket:
        cas_login_url = cas.get_login_url()
        return redirect(cas_login_url)

    net_id, _, _ = cas.verify_ticket(ticket)
    session['net_id'] = net_id
    return redirect('http://localhost:5173/search')

@app.route('/api/user', methods=['GET'])
def get_user():
    # print(session['net_id'])
    if 'net_id' in session:
        return jsonify({'net_id': session['net_id']})
    return jsonify({'error': 'not logged in'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('net_id', None)
    return jsonify({'message': 'logged out'})
    
@app.route('/api/results', methods=['GET'])
def api_results():
    capacity = request.args.get('capacity')
    floor = request.args.get('floor')
    class_year = request.args.get('class_year')

    query = db.session.query(Suite)
    if capacity and capacity != "Any":
        query = query.filter(Suite.capacity == capacity)
    if floor and floor != "Any":
        query = query.filter(func.substring(Suite.name, 2, 1) == floor)
    if class_year:
        query = query.filter(Suite.year == int(class_year))
    
    suites = query.all()

    suites_dicts = [
        {
            "id": suite.id,
            "name": suite.name,
            "entryway": suite.entryway,
            "capacity": suite.capacity,
            "resco": {"name": suite.resco.name} if suite.resco else None
        }
        for suite in suites
    ]

    return jsonify({"suites": suites_dicts})

@app.route('/api/summary/<int:suite_id>', methods=["GET", "POST"])
def summary_api(suite_id=None):

    if request.method == "POST" and suite_id:
        user_id = session.get('net_id')
        db.save_suite(user_id, suite_id)
        return redirect('http://localhost:5173/homepage')

    suite = db.session.query(Suite).filter(Suite.id == suite_id).first()
    reviews = db.session.query(SuiteReview).filter(SuiteReview.suite_id == suite_id).all()

    return jsonify({
        "suite": {
            "id": suite.id,
            "name": suite.name,
            "resco": suite.resco.name,
            "entryway": suite.entryway,
            "capacity": suite.capacity,
            "singles": suite.singles,
            "doubles": suite.doubles,
            "year": suite.year
        },
        "reviews": [
            {
                "overall_rating": r.overall_rating,
                "accessibility_rating": r.accessibility_rating,
                "space_rating": r.space_rating,
                "review_text": r.review_text
            } for r in reviews
        ]
    })

@app.route('/api/homepage', methods=["GET"])
def homepage_api():
    user_id = session.get('net_id')
    suites = db.session.query(Suite).join(Preference).filter(Preference.user_id == user_id).all()
    
    suites_data = []
    for suite in suites:
        suites_data.append({
            'id': suite.id,
            'name': suite.name,
            'entryway': suite.entryway,
            'capacity': suite.capacity,
            'singles': suite.singles,
            'doubles': suite.doubles,
            'year': suite.year,
            'resco_id': suite.resco_id,
            'resco_name': suite.resco.name if suite.resco else None
        })

    return jsonify({'suites': suites_data})

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

@app.route('/api/friends', methods=['POST'])
def add_friend():
    user_id = session.get('net_id')
    data = request.get_json()
    friend_id = data.get('friend_id')

    if user_id == friend_id:
        return jsonify({"error": "You cannot add yourself as a friend."}), 400

    existing = db.session.query(Friend).filter_by(user_id=user_id, friend_id=friend_id).first()
    if existing:
        return jsonify({"error": "You are already friends with this user."}), 400

    db.create_friendship(user_id, friend_id)
    return jsonify({"message": "Friend added successfully"})

@app.route('/api/friends', methods=['GET'])
def get_friends():
    user_id = session.get('net_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    friends = db.session.query(Friend).filter(Friend.user_id == user_id).all()
    friend_list = [f.friend_id for f in friends]
    return jsonify({"friends": friend_list})

@app.route('/api/friends/<string:friend_id>', methods=["GET"])
def friend_preferences(friend_id=None):
    if friend_id:
        suites = db.session.query(Suite).join(Preference).filter(Preference.user_id == friend_id).all()
        # ranks = db.session.query(Preference).filter(Preference.user_id == friend_id).all()
        # rank_dict = {rank.suite_id: rank.rank for rank in ranks}

        suite_list = []
        for suite in suites:
            suite_list.append({
                "id": suite.id,
                "name": suite.name,
                "resco": suite.resco.name,
                "entryway": suite.entryway,
                "capacity": suite.capacity,
                "singles": suite.singles,
                "doubles": suite.doubles,
                "year": suite.year,
                # "rank": rank_dict[suite.id]
            })

        return jsonify({
            "friend_id": friend_id,
            "suites": suite_list
        })