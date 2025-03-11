import csv

from sqlalchemy import and_, create_engine, inspect
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.resco import ResidentialCollege
from models.suite import Suite
from models.review import SuiteReview

class Database():
    def __init__(self, database_url="sqlite:///data/roomtable.db"):
        self.engine = create_engine(database_url)

        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

        Base.metadata.create_all(self.engine)

        self._populate_database()

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

        for college in colleges:
            if not self.session.query(ResidentialCollege).filter(ResidentialCollege.name == college).first():
                self.session.add(ResidentialCollege(name=college))
        
        self.session.commit()

    def _populate_suites(self, csvfile_url):
        with open(csvfile_url, newline="") as csvfile:
            csvreader = csv.DictReader(csvfile)

            for row in csvreader:
                resco = self.session.query(
                            ResidentialCollege).filter(
                                ResidentialCollege.name == row["Residential College"]
                            ).first()
                
                if resco:
                    resco_id = resco.id
                    name = row["Name"]
                    
                    if not self.session.query(Suite).filter(
                        and_(Suite.name == name, 
                             Suite.resco_id == resco_id)
                    ).first():
                        suite = Suite(
                            name=row["Name"],
                            entryway=row["Entryway"],
                            capacity=row["Capacity"],
                            singles=int(row["Single Bedrooms"]),
                            doubles=int(row["Double Bedrooms"]),
                            year=int(row["Year"]),
                            resco_id=resco_id
                        )

                        self.session.add(suite)

        self.session.commit()
    
    def create_review(self, suite_id, review_text, overall_rating, accessibility_rating, space_rating, user_id=None):
        if not user_id:
            raise ValueError("A valid user_id is required")

        new_review = SuiteReview(
            suite_id=suite_id,
            review_text=review_text,
            overall_rating=overall_rating,
            accessibility_rating=accessibility_rating,
            space_rating=space_rating,
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