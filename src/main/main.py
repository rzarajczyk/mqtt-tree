import paho.mqtt.client as mqtt
from actions_server import JsonGet, http_server, Redirect, StaticResources
from bootstrap.bootstrap import start_service

from tree import Tree

config, logger, timezone = start_service()

MQTT_HOST = config['mqtt']['broker']
MQTT_PORT = config['mqtt']['port']
MQTT_USER = config['mqtt']['username']
MQTT_PASS = config['mqtt']['password']

tree = Tree()


def on_connect(client, userdata, flags, rc):
    logger.info("Connected with result code %s" % str(rc))
    client.subscribe("#")


def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode(encoding='UTF-8')
    logger.debug("Received event: %-70s | %s" % (topic, payload))
    tree.accept_message(topic, payload)


client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_HOST, MQTT_PORT)

client.loop_start()


def show_tree(params):
    return tree.to_json()


ACTIONS = [
    JsonGet('/tree', show_tree),
    Redirect('/', '/index.html'),
    StaticResources('/', './src/web')
]

server = http_server(8075, ACTIONS)
try:
    server.start(block_caller_thread=True)
finally:
    logger.info('Closing server')
    server.stop()
