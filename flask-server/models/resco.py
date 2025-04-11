from models.base import Base
# from models.suite import Suite

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

class ResidentialCollege(Base):
    __tablename__ = "rescos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)

    # suites: Mapped[list["Suite"]] = relationship("Suite", back_populates="resco")