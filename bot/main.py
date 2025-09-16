import os
from dotenv import load_dotenv
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

load_dotenv()
slack_api_key = os.environ.get("SLACK_API_KEY")
slack_signing_secret = os.environ.get("SLACK_SIGNING_SECRET")
socket_id = os.environ.get("SOCKET_ID")

def build_app(api_key, signing_secret):
    app = App(
        token=api_key,
        signing_secret=signing_secret
        )
    return app


if __name__ == "__main__":
    app = build_app(slack_api_key, slack_signing_secret)
    handler = SocketModeHandler(app, socket_id)