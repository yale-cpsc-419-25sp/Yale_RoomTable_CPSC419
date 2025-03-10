from models.base import Base
from models.room import Room
from models.suite import Suite

from sqlalchemy import (
    CheckConstraint, ForeignKey,
    Integer, String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.user import User

class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rating: Mapped[int] = mapped_column(Integer, CheckConstraint("rating BETWEEN 1 AND 5"))
    text: Mapped[str] = mapped_column(String)
    # image: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    user: Mapped[User] = relationship("User")

    __mapper_args__ = {
        "polymorphic_identity":"review",
        "polymorphic_on":type
    }
    


# class RoomReview(Review):
#     room_id: Mapped[int] = mapped_column(Integer, ForeignKey("rooms.id"))
#     room: Mapped[Room] = relationship("Room")

#     __mapper_args__ = {
#         "polymorphic_identity":"room_review"
#     }

class SuiteReview(Review):
    suite_id: Mapped[int] = mapped_column(Integer, ForeignKey("rooms.id"))
    suite: Mapped[Suite] = relationship("Suite")

    __mapper_args__ = {
        "polymorphic_identity":"suite_review"
    }
