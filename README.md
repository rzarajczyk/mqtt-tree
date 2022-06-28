# MQTT-Tree

A MQTT client which provides a web-based tree-like visualization of MQTT topics.

## Usage in docker-compose

**docker-compose.yaml:**
```yaml
version: '3.2'
services:
  mqtt-tree:
    image: rzarajczyk/mqtt-tree:latest
    volumes:
      - ./config/mqtt-tree.yaml:/app/config/config.yaml
    restart: unless-stopped
    network_mode: host
```

**mqtt-tree.yaml**
```yaml
mqtt:
  broker: <<mqtt address>
  port: <<mqtt port>>
  username: <<mqtt username>>
  password: <<mqtt password>>
```
