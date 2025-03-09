from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.resco import ResidentialCollege

class Database():
    def __init__(self, database_url="sqlite:///roomtable.db"):
        self.engine = create_engine(database_url)

        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

        Base.metadata.create_all(self.engine)

        ResidentialCollege(self.session)

    def show_tables(self):
        inspector = inspect(self.engine)
        tables = inspector.get_table_names()
        print(tables)

    def close(self):
        self.session.close()
    