from base import Base

from sqlalchemy import (
    ForeignKey,
    Integer, String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

def Suite(Base):
    __tablename__ = "suites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String)
    entryway: Mapped[str] = mapped_column(String)
    capacity: Mapped[int] = mapped_column(Integer)

    resco_id: Mapped[int] = mapped_column(Integer, ForeignKey('rescos.id'))