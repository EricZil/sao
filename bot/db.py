from sqlalchemy import Column, String, DateTime, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import uuid, datetime


Base = declarative_base()

def gen_id():
    return "msg-" + uuid.uuid4().hex[:6].upper()


class SlackMessage(Base):
    __tablename__ = 'slack_messages'
    id = Column(String, primary_key=True, default=gen_id)
    ts = Column(String, index=True)
    text = Column(String)
    channel = Column(String, index=True)
    user = Column(String, index=True)
    time = Column(DateTime, default=datetime.datetime.utcnow)

engine = create_engine('sqlite:///db.sqlite', echo=True, future=True)
Session = sessionmaker(bind=engine)

def save_message(message):
    session = Session()
    msg = SlackMessage(
        ts=message.get('ts', None),
        text=message.get('text', None),
        channel=message.get('channel', None),
        user=message.get('user', None),
        time=message.get('time'),
    )
    session.add(msg)
    session.commit()
    session.close()

def get_by_id(message_id):
    session = Session()
    try:
        msg = session.get(SlackMessage, message_id)
        return msg
    finally:
        session.close()

