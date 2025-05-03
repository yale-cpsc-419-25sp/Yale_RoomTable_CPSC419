"""Core functionality for communication between server and client."""
from os import urandom, environ
from flask import Flask, jsonify, request, session, redirect
from flask_cors import CORS
from cas import CASClient
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from dotenv import load_dotenv
import requests
from database import Database
from models.review import SuiteReview
from models.friend import Friend
from models.requests import Requests
from models.suite import Suite
from models.preference import Preference



db = Database()

app = Flask(__name__, template_folder='./templates', static_folder='./build/static')
app.secret_key = urandom(24)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

# https://stackoverflow.com/questions/67439625/python-equivalent-of-process-env-port-3000
port = int(environ.get('PORT', 8000))
load_dotenv()

CAS_SERVICE_URL = "http://localhost:" + str(port) + "/api/login"
CAS_SERVER_URL = "https://secure.its.yale.edu/cas/login"
cas = CASClient(
    version=3.0,
    service_url=CAS_SERVICE_URL,
    server_url=CAS_SERVER_URL
)

@app.route('/api/login', methods=['GET'])
def login():
    """Login the user using Yale CAS"""
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
    """Returns logged in user's NetID"""
    if 'net_id' in session:
        return jsonify({'net_id': session['net_id']})
    return jsonify({'error': 'not logged in'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """Log out user and remove from session."""
    session.pop('net_id', None)
    return jsonify({'message': 'logged out'})

@app.route('/api/results', methods=['GET'])
def api_results():
    """Returns list of dictionaries of suites given search filters."""
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

        suites_dicts = []
        for suite in suites:
            reviews = db_session.query(SuiteReview).filter(SuiteReview.suite_id==suite.id).all()
            num_reviews = len(reviews)

            if num_reviews > 0:
                overall = sum([r.overall_rating for r in reviews]) / num_reviews
                accessibility = sum([r.accessibility_rating for r in reviews]) / num_reviews
                space = sum([r.space_rating for r in reviews]) / num_reviews
            else:
                overall = accessibility = space = None

            suites_dicts.append({
                "id": suite.id,
                "name": suite.name,
                "entryway": suite.entryway,
                "capacity": suite.capacity,
                "resco": {"name": suite.resco.name} if suite.resco else None,
                "year": suite.year,
                "doubles": suite.doubles,
                "singles": suite.singles,
                "overall": overall,
                "accessibility": accessibility,
                "space": space,
            })

        return jsonify({"suites": suites_dicts})

@app.route('/api/summary/<int:suite_id>', methods=["GET", "POST", "DELETE"])
def summary_api(suite_id=None):
    """Returns all details of a suite, including reviews and ratings."""
    user_id = session.get('net_id')
    with db.get_session() as db_session:
        if request.method == "POST" and suite_id:
            db.save_suite(user_id, suite_id)

        elif request.method == "DELETE" and suite_id:
            db.remove_suite(user_id, suite_id)

        suite = db_session.query(Suite).filter(Suite.id == suite_id).first()
        reviews = db_session.query(SuiteReview).filter(SuiteReview.suite_id == suite_id).all()
        num_reviews = len(reviews)

        if num_reviews > 0:
            overall = sum([r.overall_rating for r in reviews]) / num_reviews
            accessibility = sum([r.accessibility_rating for r in reviews]) / num_reviews
            space = sum([r.space_rating for r in reviews]) / num_reviews
        else:
            overall = accessibility = space = None

        is_saved = db_session.query(Preference).filter_by(user_id=user_id, suite_id=suite_id).first() is not None

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
                "is_saved": is_saved,
                "overall": overall,
                "accessibility": accessibility,
                "space": space,
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
            overall_rating=int(data['overall']),
            accessibility_rating=int(data['accessibility']),
            space_rating=int(data['space']),
            user_id=session['net_id']
        )
        return jsonify({'message': 'Review submitted'}), 201

    with db.get_session() as db_session:
        all_reviews = db_session.query(SuiteReview).join(Suite).all()
        return jsonify({
            'reviews': [{
                'suite_id' : r.suite.id,
                'suite_name': r.suite.name,
                'accessibility_rating': r.accessibility_rating,
                'space_rating': r.space_rating,
                'overall_rating': r.overall_rating,
                'review_text': r.review_text
            } for r in all_reviews]
        })

@app.route('/api/friends', methods=['POST', 'DELETE'])
def add_friend():
    user_id = session.get('net_id')
    data = request.get_json()
    friend_id = data.get('friend_id')

    if request.method == "POST":
        if user_id == friend_id:
            return jsonify({"error": "You cannot add yourself as a friend."}), 400

        with db.get_session() as db_session:
            existing = db_session.query(Friend).filter_by(user_id=user_id, friend_id=friend_id).first()
            if existing:
                return jsonify({"error": "You are already friends with this user."}), 400
            # Check other direction
            existing = db_session.query(Friend).filter_by(user_id=friend_id, friend_id=user_id).first()

            if existing:
                return jsonify({"error": "This user is already your friend."}), 400

            # Check if a friend request already exists
            existing_request = db_session.query(Requests).filter_by(
                user_id=user_id, friend_id=friend_id
            ).first()
            if existing_request:
                return jsonify({"error": "Friend request already sent."}), 400
            # Check if a friend request already exists in the other direction
            existing_request = db_session.query(Requests).filter_by(
                user_id=friend_id, friend_id=user_id
            ).first()
            if existing_request:
                return jsonify({"error": "Friend request already sent."}), 400

        db.create_friendship(user_id, friend_id)
        return jsonify({"message": "Friend request sent successfully."})
    elif request.method == "DELETE":
        if not user_id or not friend_id:
            return jsonify({"error": "Missing user_id or friend_id"}), 400

        try:
            db.remove_friend(user_id, friend_id)
            return jsonify({"message": "Friend removed successfully"})
        except Exception:
            return jsonify({"error": "Failed to remove friend"}), 500


@app.route('/api/friends', methods=['GET'])
def get_friends():
    user_id = session.get('net_id')
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    with db.get_session() as db_session:
        friends = db_session.query(Friend).filter((Friend.user_id == user_id) | (Friend.friend_id == user_id)).all()

        friend_list = []
        for friend in friends:
            if friend.user_id == user_id:
                friend_list.append(friend.friend_id)
            else:
                friend_list.append(friend.user_id)
        return jsonify({"friends": friend_list})

@app.route('/api/friends/<string:friend_id>', methods=["GET"])
def friend_preferences(friend_id=None):
    if friend_id:
        with db.get_session() as db_session:
            user_id = session.get('net_id')
            # Check if the friend_id is actually a friend of the current user
            is_friend = db_session.query(Friend).filter(
                ((Friend.user_id == user_id) & (Friend.friend_id == friend_id)) |
                ((Friend.user_id == friend_id) & (Friend.friend_id == user_id))
            ).first()

        if not is_friend:
            return jsonify({"error": "You are not friends with this user"}), 403

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
                reviews = db_session.query(SuiteReview).filter(SuiteReview.suite_id==suite.id).all()
                num_reviews = len(reviews)

                if num_reviews > 0:
                    overall = sum([r.overall_rating for r in reviews]) / num_reviews
                    accessibility = sum([r.accessibility_rating for r in reviews]) / num_reviews
                    space = sum([r.space_rating for r in reviews]) / num_reviews
                else:
                    overall = accessibility = space = None

                suite_list.append({
                    "id": suite.id,
                    "name": suite.name,
                    "resco": suite.resco.name,
                    "entryway": suite.entryway,
                    "capacity": suite.capacity,
                    "singles": suite.singles,
                    "doubles": suite.doubles,
                    "year": suite.year,
                    "rank": rank_dict[suite.id],
                    "overall": overall,
                    "accessibility": accessibility,
                    "space": space
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

@app.route('/api/requests', methods=['GET', 'POST', 'DELETE'])
def get_requests():
    if request.method == "DELETE":
        # Delete the request
        user_id = session.get('net_id')
        data = request.get_json()
        friend_id = data.get('friend_id')
        # Remove the request from the database
        db.remove_friend_request(user_id, friend_id)
        return jsonify({"message": "Friend request deleted successfully"})
    elif request.method == "POST":
        user_id = session.get('net_id')
        data = request.get_json()
        friend_id = data.get('friend_id')
        db.accept_friend_request(user_id, friend_id)
        return jsonify({"message": "Friend request accepted successfully"})
    else:
        user_id = session.get('net_id')
        if not user_id:
            return jsonify({"error": "Not logged in"}), 401

        with db.get_session() as db_session:
            # Get requests from both the user and the friend
            requests = db_session.query(Requests).filter(
                (Requests.user_id == user_id) | (Requests.friend_id == user_id)
            ).all()
            requests_list = []
            for req in requests:
                # Differentiate between requests sent and requests received
                if req.user_id == user_id:
                    requests_list.append({
                        "friend_id": req.friend_id,
                        "status": "sent"
                    })
                else:
                    requests_list.append({
                        "friend_id": req.user_id,
                        "status": "received"
                    })
            return jsonify({"requests": requests_list})


@app.route('/api/friends/search', methods=['GET'])
def search_friends():
    query = request.args.get('query', '').strip()

    # Make sure query is long enough to get reasonable results
    if len(query) < 2:
        return jsonify({"results": []})

    try:
        # Minimal valid request format
        response = requests.post(
            "https://api.yalies.io/v2/people",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {environ.get('YALIES_API_KEY')}",
            },
            json={
                "query": query,  # Let the API handle the search logic
                "page_size": 20  # Return more results for better matches
            },
            timeout=5
        )

        response.raise_for_status()
        people = response.json()

        # Format results
        results = []
        for p in people:
            # Handle different name formats
            first_name = p.get('preferred_name') or p.get('first_name') or ''
            last_name = p.get('last_name') or ''
            name = f"{first_name} {last_name}".strip()

            if not name or not p.get('netid'):
                continue

            results.append({
                "netid": p["netid"],
                "name": name,
                "college": p.get("college", "Unknown"),
                "year": p.get("year", "Unknown")
            })

        return jsonify({"results": results})

    # Catch errors associated with being unable to access the API request
    except requests.exceptions.HTTPError as e:
        error_msg = f"HTTP {e.response.status_code}"
        if e.response.text:
            error_msg += f": {e.response.text[:200]}"
        print(f"API Error: {error_msg}")
        return jsonify({"results": [], "error": "Search failed"})
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({"results": [], "error": "Search failed"})
