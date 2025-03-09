from models.base import Base

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

class ResidentialCollege(Base):
    __tablename__ = "rescos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)

    def __init__(self, session):
        if session.query(ResidentialCollege).count() == 0:
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
                session.add(ResidentialCollege(name=college))
            
            session.commit()