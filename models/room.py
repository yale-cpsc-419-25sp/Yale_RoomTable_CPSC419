# from base import Base

# from sqlalchemy import (
#     ForeignKey,
#     Integer, String
# )
# from sqlalchemy.orm import Mapped, mapped_column, relationship

# from suite import Suite

# class Room(Base):
#     __tablename__ = "rooms"

#     id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     name: Mapped[str] = mapped_column(String)
#     capacity: Mapped[int] = mapped_column(Integer)
    
#     suite_id: Mapped[int] = mapped_column(Integer, ForeignKey("suites.id"))
#     suite: Mapped[Suite] = relationship("Suite")