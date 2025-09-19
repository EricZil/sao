import os, datetime, json
from dotenv import load_dotenv
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
import db, message

load_dotenv()
slack_api_key = os.environ.get("SLACK_API_KEY")
slack_signing_secret = os.environ.get("SLACK_SIGNING_SECRET")
socket_id = os.environ.get("SOCKET_ID")
ai_url = os.environ.get("AI_URL")

trigger_tiers = ["medium", "high", "critical"]

def build_app(api_key, signing_secret):
    app = App(
        token=api_key,
        signing_secret=signing_secret
        )

    @app.event("message")
    def handle_message(body, client):

        event = body.get("event", {})
        if not event:
            return
        if event.get("type") == "message":
            data = {
                "type": "message",
                "text": event.get("text"),
                "channel": event.get("channel"),
                "ts": event.get("ts"),
                "user": event.get("user"),
                "time": datetime.datetime.utcnow().isoformat()
            }
            response = message.classify(ai_url, data["text"])
            if not response or len(response) == 0:
                return
            response = json.loads(response)
            if response["severity"] in trigger_tiers:
                db.save_message(data, response)
                client.chat_postEphemeral(
                    channel=data["channel"],
                    user=data["user"],
                    text="ok you said some wild shit fucking chill."
                )
                return
            return
    return app


if __name__ == "__main__":
    app = build_app(slack_api_key, slack_signing_secret)
    handler = SocketModeHandler(app, socket_id)
    handler.start()