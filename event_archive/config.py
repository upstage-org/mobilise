import sys

MONGO_HOST = "svc.upstage.org.nz"
MONGO_PORT = 27017
MONGO_DB = "upstage"
EVENT_COLLECTION = "events"

MQTT_BROKER = "svc.upstage.org.nz"
MQTT_PORT = 1883
MQTT_TRANSPORT = "tcp"
MQTT_USER = "performance"
MQTT_PASSWORD = "z48FCTsJVEUkYmtUw5S9"
PERFORMANCE_TOPIC_RULE = "#"

PG_CONNECTION_STR = sys.argv[1:].pop(0)