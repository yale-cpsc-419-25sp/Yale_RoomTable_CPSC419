from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.resco import ResidentialCollege

from models.review import SuiteReview


class Database():
    def __init__(self, database_url="sqlite:///data/roomtable.db"):
        self.engine = create_engine(database_url)

        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

        Base.metadata.create_all(self.engine)

        self._database_init()

    def _database_init(self):
        # ResidentialCollege(self.session)
        ResidentialCollege()

    def create_review(self, suite_id, accessibility_rating, space_rating, review_text, rating, user_id=None):
        if not user_id:
            raise ValueError("A valid user_id is required")

        new_review = SuiteReview(
        suite_id=suite_id,
        accessibility_rating=accessibility_rating,
        space_rating=space_rating,
        text=review_text,
        rating=rating,
        user_id=user_id,
        type = "suite_review"
    )

        self.session.add(new_review)
        self.session.commit()


    def show_tables(self):
        inspector = inspect(self.engine)
        tables = inspector.get_table_names()
        print(tables)

    def close(self):
        self.session.close()
    