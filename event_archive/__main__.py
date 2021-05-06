import logging
import os
import ssl
import sys

from system import run
from mqtt import build_client
import config as conf
import actions

if __name__ == "__main__":
    run()
    mqtt_client = build_client()
    mqtt_client.username_pw_set(conf.MQTT_USER, conf.MQTT_PASSWORD)
    mqtt_client.connect(conf.MQTT_BROKER, conf.MQTT_PORT)
    mqtt_client.loop_forever()
