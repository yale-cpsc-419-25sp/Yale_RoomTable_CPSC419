import csv

from contextlib import contextmanager
from sqlalchemy import and_, create_engine, inspect
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.resco import ResidentialCollege
from models.suite import Suite
from models.review import SuiteReview
from models.friend import Friend
from models.requests import Requests
from models.preference import Preference

class Database():
    def __init__(self, database_url="sqlite:///data/roomtable.db"):
        self.engine = create_engine(database_url, connect_args={'check_same_thread': False})
        self.Session = sessionmaker(bind=self.engine)

        Base.metadata.create_all(self.engine)
        self._populate_database()

    @contextmanager
    def get_session(self):
        session = self.Session()
        try:
            yield session
        finally:
            session.close()

    def _populate_database(self):
        self._populate_rescos()
        self._populate_suites(csvfile_url="data/MY 2022-23 Room Draw.csv")

    def _populate_rescos(self):
        colleges = [
            "Benjamin Franklin",
            "Berkeley",
            "Branford",
            "Davenport",
            "Ezra Stiles",
            "Grace Hopper",
            "Jonathan Edwards",
            "Morse",
            "Pauli Murray",
            "Pierson",
            "Saybrook",
            "Silliman",
            "Timothy Dwight",
            "Trumbull"
        ]

        with self.get_session() as session:
            for college in colleges:
                if not session.query(ResidentialCollege).filter_by(name=college).first():
                    session.add(ResidentialCollege(name=college))
            session.commit()

    def _populate_suites(self, csvfile_url):
        with open(csvfile_url, newline="") as csvfile:
            csvreader = csv.DictReader(csvfile)
            with self.get_session() as session:
                for row in csvreader:
                    resco = session.query(ResidentialCollege).filter_by(name=row["Residential College"]).first()
                    if resco:
                        if not session.query(Suite).filter(and_(Suite.name == row["Name"], Suite.resco_id == resco.id)).first():
                            suite = Suite(
                                name=row["Name"],
                                entryway=row["Entryway"],
                                capacity=row["Capacity"],
                                singles=int(row["Single Bedrooms"]),
                                doubles=int(row["Double Bedrooms"]),
                                year=int(row["Year"]),
                                resco_id=resco.id
                            )
                            session.add(suite)
                session.commit()
    
    def create_review(self, suite_id, review_text, overall_rating, accessibility_rating, space_rating, user_id=None):
        if not user_id:
            raise ValueError("A valid user_id is required")

        with self.get_session() as session:
            new_review = SuiteReview(
                suite_id=suite_id,
                review_text=review_text,
                overall_rating=overall_rating,
                accessibility_rating=accessibility_rating,
                space_rating=space_rating,
                user_id=user_id,
                type="suite_review"
            )
            session.add(new_review)
            session.commit()
    
    def create_friendship(self, user_id, friend_id):
        with self.get_session() as session:
            new_friend = Requests(
                user_id=user_id,
                friend_id=friend_id
            )
            session.add(new_friend)
            session.commit()
    
    def save_suite(self, user_id, suite_id):
        with self.get_session() as session:
            # Get existing preferences for the user
            existing_preferences = session.query(Preference).filter(Preference.user_id == user_id).all()

            found = False
            # Modify existing preferences by incrementing their rank
            for preference in existing_preferences:
                if preference.suite_id == suite_id:
                    preference.rank = 1
                    found = True
                else:
                    preference.rank += 1

            # Add new preference
            if not found:
                new_preference = Preference(
                    user_id=user_id,
                    suite_id=suite_id,
                    rank=1
                )
                session.add(new_preference)
            session.commit()
    
    def remove_suite(self, user_id, suite_id):
        with self.get_session() as session:
            preference = session.query(Preference).filter_by(user_id=user_id, suite_id=suite_id).first()
            if preference:
                removed_rank = preference.rank
                lower_ranked_preferences = session.query(Preference).filter(
                    Preference.user_id == user_id,
                    Preference.rank > removed_rank
                ).all()
                for pref in lower_ranked_preferences:
                    pref.rank -= 1
                session.delete(preference)
                session.commit()
    
    def remove_friend(self, user_id, friend_id):
        with self.get_session() as session:
            friendship = session.query(Friend).filter_by(user_id=user_id, friend_id=friend_id).first()

            if friendship:
                session.delete(friendship)
                session.commit()
                session.expire_all()

    def remove_friend_request(self, user_id, friend_id):
        with self.get_session() as session:
            friend_request = session.query(Requests).filter_by(user_id=user_id, friend_id=friend_id).first()

            if friend_request:
                session.delete(friend_request)
                session.commit()
                session.expire_all()

    def accept_friend_request(self, user_id, friend_id):
        with self.get_session() as session:
            friend_request = session.query(Requests).filter_by(user_id=user_id, friend_id=friend_id).first()

            if friend_request:
                new_friendship = Friend(
                    user_id=user_id,
                    friend_id=friend_id
                )
                session.add(new_friendship)
                session.delete(friend_request)
                session.commit()
                session.expire_all()
    
    def liked_suite_ids(self, user_id):
        with self.get_session() as session:
            preferences = session.query(Preference).filter_by(user_id=user_id).all()
            return [pref.suite_id for pref in preferences]

    def is_suite_liked(self, user_id, suite_id):
        with self.get_session() as session:
            return session.query(Preference).filter_by(user_id=user_id, suite_id=suite_id).first() is not None

    def show_tables(self):
        inspector = inspect(self.engine)
        tables = inspector.get_table_names()
        print(tables)

    # def close(self):
    #     self.session.close()