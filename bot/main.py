import os, datetime
from dotenv import load_dotenv
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

load_dotenv()
domain = os.environ.get('DOMAIN')
slack_api_key = os.environ.get("SLACK_API_KEY")
slack_signing_secret = os.environ.get("SLACK_SIGNING_SECRET")
socket_id = os.environ.get("SOCKET_ID")

bulk_messages = []

def build_app(api_key, signing_secret):
    app = App(
        token=api_key,
        signing_secret=signing_secret
        )

    @app.event("message")
    def handle_message(body, client, logger):
        event = body.get("event", {})
        if not event:
            return
        if event.get("type") == "message":
            if len(bulk_messages) < 10:
                data = {
                    "type": "message",
                    "text": event.get("text"),
                    "channel": event.get("channel"),
                    "ts": event.get("ts"),
                    "user": event.get("user"),
                    "time": datetime.datetime.utcnow().isoformat()
                }
                bulk_messages.append(data)

    return app


if __name__ == "__main__":
    app = build_app(slack_api_key, slack_signing_secret)
    handler = SocketModeHandler(app, socket_id)