from base import Base

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

class ResidentialCollege(Base):
    __tablename__ = "rescos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)