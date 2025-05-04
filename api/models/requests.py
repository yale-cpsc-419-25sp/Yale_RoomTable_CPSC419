from models.base import Base

from sqlalchemy import (
    ForeignKey,
    Integer
)
from sqlalchemy.orm import Mapped, mapped_column

class Requests(Base):
    __tablename__ = "friend_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    friend_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))