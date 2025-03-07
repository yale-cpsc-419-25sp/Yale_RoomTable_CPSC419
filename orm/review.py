from base import Base

def Review(Base):
    def __init__(self):
        pass
    
def SuiteReview(Review):
    __tablename__ = "suite_reviews"

def RoomReview(Review):
    __tablename__ = "room_reviews"