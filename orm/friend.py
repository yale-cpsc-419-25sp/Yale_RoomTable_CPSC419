from base import Base

from sqlalchemy import (
    ForeignKey,
    Integer
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

def Friend(Base):
    __tablename__ = "friends"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    friend_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))