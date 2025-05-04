from models.base import Base
from models.resco import ResidentialCollege

from sqlalchemy import (
    ForeignKey,
    Integer, String
)
from sqlalchemy.orm import backref, Mapped, mapped_column, relationship

class Suite(Base):
    __tablename__ = "suites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)
    entryway: Mapped[str] = mapped_column(String)

    capacity: Mapped[int] = mapped_column(Integer)
    singles: Mapped[int] = mapped_column(Integer)
    doubles: Mapped[int] = mapped_column(Integer)

    year: Mapped[int] = mapped_column(Integer)

    resco_id: Mapped[int] = mapped_column(Integer, ForeignKey('rescos.id'))
    resco: Mapped["ResidentialCollege"] = relationship("ResidentialCollege", backref=backref("suite"))