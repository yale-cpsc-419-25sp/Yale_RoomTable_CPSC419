from os import urandom, environ
from functools import wraps
from flask import Flask, jsonify, request, make_response, session, redirect, url_for
from flask import render_template, request
from flask_cors import CORS
from cas import CASClient
from sqlalchemy import func
from sqlalchemy.orm import joinedload

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

    with db.get_session() as db_session:
        query = db_session.query(Suite)
        if capacity and capacity != "Any":
            query = query.filter(Suite.capacity == capacity)
        if floor and floor != "Any":
            if floor == "Lower":
                query = query.filter(Suite.name.ilike('%Lower'))
            else:
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

@app.route('/api/summary/<int:suite_id>', methods=["GET", "POST", "DELETE"])
def summary_api(suite_id=None):
    user_id = session.get('net_id')
    with db.get_session() as db_session:
        if request.method == "POST" and suite_id:
            db.save_suite(user_id, suite_id)

        elif request.method == "DELETE" and suite_id:
            db.remove_suite(user_id, suite_id)

        suite = db_session.query(Suite).filter(Suite.id == suite_id).first()
        reviews = db_session.query(SuiteReview).filter(SuiteReview.suite_id == suite_id).all()
        is_saved = db_session.query(Preference).filter_by(user_id=user_id, suite_id=suite_id).first() is not None
        print(f"Returning is_saved={is_saved} for suite_id={suite_id} and user_id={user_id}")  # Add logging to debug


        return jsonify({
            "suite": {
                "id": suite.id,
                "name": suite.name,
                "resco": suite.resco.name,
                "entryway": suite.entryway,
                "capacity": suite.capacity,
                "singles": suite.singles,
                "doubles": suite.doubles,
                "year": suite.year,
                "is_saved": is_saved
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
    
    with db.get_session() as db_session:
        suites = db_session.query(Suite).join(Preference).filter(Preference.user_id == user_id).options(
            joinedload(Suite.resco)
        ).all()

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

@app.route('/api/suites')
def get_suites():
    with db.get_session() as db_session:
        suites = db_session.query(Suite).all()
        suites_dicts = [
            {"id": suite.id, "name": suite.name}
            for suite in suites
        ]
        return jsonify({"suites": suites_dicts})

@app.route('/api/reviews', methods=['GET', 'POST'])
def reviews_api():
    if request.method == 'POST':
        data = request.json
        db.create_review(
            suite_id=data['suite'],
            review_text=data['review'],
            overall_rating=int(data['rating']),
            accessibility_rating=int(data['accessibility']),
            space_rating=int(data['space']),
            user_id=session['net_id']
        )
        return jsonify({'message': 'Review submitted'}), 201

    with db.get_session() as db_session:
        all_reviews = db_session.query(SuiteReview).join(Suite).all()
        return jsonify({
            'reviews': [{
                'suite_name': r.suite.name,
                'accessibility_rating': r.accessibility_rating,
                'space_rating': r.space_rating,
                'overall_rating': r.overall_rating,
                'review_text': r.review_text
            } for r in all_reviews]
        })

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

    with db.get_session() as db_session:
        existing = db_session.query(Friend).filter_by(user_id=user_id, friend_id=friend_id).first()
        if existing:
            return jsonify({"error": "You are already friends with this user."}), 400

    db.create_friendship(user_id, friend_id)
    return jsonify({"message": "Friend added successfully"})

@app.route('/api/friends', methods=['GET'])
def get_friends():
    user_id = session.get('net_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    with db.get_session() as db_session:
        friends = db_session.query(Friend).filter(Friend.user_id == user_id).all()
        friend_list = [f.friend_id for f in friends]
        return jsonify({"friends": friend_list})

@app.route('/api/friends/<string:friend_id>', methods=["GET"])
def friend_preferences(friend_id=None):
    if friend_id:
        with db.get_session() as db_session:
            # Query the friend's saved suites
            suites = db_session.query(Suite).join(Preference).filter(Preference.user_id == friend_id).all()
            # Get the ranks for each suite
            ranks = db_session.query(Preference).filter(Preference.user_id == friend_id).all()
            rank_dict = {}
            for rank in ranks:
                rank_dict[rank.suite_id] = rank.rank
            
            suites.sort(key=lambda suite: rank_dict[suite.id])

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
                    "rank": rank_dict[suite.id]
                })

            return jsonify({
                "friend_id": friend_id,
                "suites": suite_list
            })
        
@app.route('/api/unsave/<int:suite_id>', methods=["POST"])
def unsave_suite(suite_id):
    user_id = session.get('net_id')  # or 'user_id' depending on your login
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401

    # with db.get_session() as db_session:
    db.remove_suite(user_id, suite_id)
    return jsonify({'message': 'Suite unsaved successfully'})
