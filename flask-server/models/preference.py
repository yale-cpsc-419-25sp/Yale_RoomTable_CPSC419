from models.base import Base
# from models.room import Room
from models.suite import Suite
from models.user import User

from sqlalchemy import (
    ForeignKey,
    Integer
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Preference(Base):
    __tablename__ = "preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    user: Mapped[User] = relationship("User")
    suite_id: Mapped[int] = mapped_column(Integer, ForeignKey("suites.id"))
    suite: Mapped[Suite] = relationship("Suite")

    # __mapper_args__ = {
    #     "polymorphic_identity":"preference",
    #     "polymorphic_on":type
    # }

# class RoomPreference(Preference):
#     room_id: Mapped[int] = mapped_column(Integer, ForeignKey("rooms.id"))
#     room: Mapped[Room] = relationship("Room")

#     __mapper_args__ = {
#         "polymorphic_identity":"room_preference"
#     }

# class SuitePreference(Preference):
#     suite_id: Mapped[int] = mapped_column(Integer, ForeignKey("suites.id"))
#     suite: Mapped[Suite] = relationship("Suite")
    
#     __mapper_args__ = {
#         "polymorphic_identity":"suite_preference"
#     }