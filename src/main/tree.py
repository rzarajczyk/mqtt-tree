import logging


class Node:
    def __init__(self, id: str):
        self.id: str = id
        self.value: str = None
        self.nodes: dict = {}

    def get_or_create_child(self, id: str):
        if id not in self.nodes:
            self.nodes[id] = Node(id)
        return self.nodes[id]

    def find_child(self, id: str):
        if id not in self.nodes:
            return None
        return self.nodes[id]

    def children(self):
        return self.nodes.values()

    def debug(self, indent=''):
        print("%s # %s => %s" % (indent, self.id, self.value))
        for child_id in self.nodes:
            self.nodes[child_id].debug(indent + '    ')

    def to_json(self, path=''):
        path = f'{path}/{self.id}' if len(path) > 0 else self.id
        return {
            'id': path,
            'name': self.id,
            'path': path,
            'value': self.value,
            'children': [node.to_json(path) for node in self.nodes.values()]
        }


class Tree:
    def __init__(self):
        self.root = Node('#')
        self.logger = logging.getLogger("devices")

    def root(self):
        return self.root

    def to_json(self):
        return [node.to_json() for node in self.root.children()]

    def accept_message(self, topic, payload):
        try:
            parts = topic.split("/")
            get_node(parts, self.root).value = payload
        except Exception as e:
            self.logger.exception(f"Problem processing topic {topic} with payload {payload}", e)


def get_node(path, root) -> Node:
    if len(path) == 0:
        return root
    else:
        id = path.pop(0)
        root = root.get_or_create_child(id)
        return get_node(path, root)
