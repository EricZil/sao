from sqlalchemy import Column, String, DateTime, Boolean, JSON, select, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.inspection import inspect
import uuid, datetime, json


Base = declarative_base()

def gen_id():
    return "msg-" + uuid.uuid4().hex[:6].upper()

def _row_to_dict(obj):
    d = {c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs}
    if isinstance(d.get("time"), (datetime.datetime, datetime.date)):
        d["time"] = d.get("time").isoformat()
    return d

def _json_dumps(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))

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

def get_all(as_string=False):
    session = Session()
    rows = session.execute(select(SlackMessage)).scalars().all()
    data = [_row_to_dict(r) for r in rows]
    return _json_dumps(data) if as_string else data

def get_by_id(message_id, as_string=False):
    session = Session()
    row = session.get(SlackMessage, message_id)
    data = _row_to_dict(row) if row else None
    return _json_dumps(data) if as_string else data


def get_by_user(uid, as_string=False):
    session = Session()
    rows = session.execute(
        select(SlackMessage).where(SlackMessage.user == uid)
    ).scalars().all()
    data = [_row_to_dict(r) for r in rows]
    return _json_dumps(data) if as_string else data

def get_unresolved(as_string=False):
    session = Session()
    rows = session.execute(select(SlackMessage).where(SlackMessage.status.is_(False))).scalars().all()
    data = [_row_to_dict(r) for r in rows]
    return _json_dumps(data) if as_string else data

def get_resolved(as_string=False):
    session = Session()
    rows = session.execute(select(SlackMessage).where(SlackMessage.status.is_(True))).scalars().all()
    data = [_row_to_dict(r) for r in rows]
    return _json_dumps(data) if as_string else data

def resolve_case(message_id):
    session = Session()
    row = session.get(SlackMessage, message_id)
    row.status = True
    session.commit()