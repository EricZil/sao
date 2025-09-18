from sqlalchemy import Column, String, DateTime, Boolean, JSON, create_engine
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
    time = Column(String, default=datetime.datetime.utcnow)
    status = Column(Boolean, default=False, index=True)
    output = Column(JSON)

engine = create_engine('sqlite:///db.sqlite', echo=True, future=True)
Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)

def save_message(message, output=None):
    session = Session()
    msg = SlackMessage(
        ts=message.get('ts', None),
        text=message.get('text', None),
        channel=message.get('channel', None),
        user=message.get('user', None),
        time=message.get('time'),
        status=False,
        output=output
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

def get_by_user(uid):
    session = Session()
    try:
        msg = session.query(SlackMessage).filter(SlackMessage.user == uid).all()
        return msg
    finally:
        session.close()


