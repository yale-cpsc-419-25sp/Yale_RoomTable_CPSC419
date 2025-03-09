from base import Base
from resco import ResidentialCollege

from sqlalchemy import (
    ForeignKey,
    Integer, String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    netid: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)

    resco_id: Mapped[int] = mapped_column(Integer, ForeignKey("rescos.id"))
    resco: Mapped[ResidentialCollege] = relationship("ResidentialCollege")