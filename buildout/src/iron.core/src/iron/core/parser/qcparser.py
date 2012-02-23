
class SimpleParser(object):

    def parse(self, text):
        raise NotImplementedError()

    def get_node_text(self, node, tag):

        childNode = node.getElementsByTagName(tag)

        if childNode.length == 0:
            return None

        if len( childNode[0].childNodes ) == 0:
            return None
        return childNode[0].childNodes[0].data

    def map_node(self, node, maptable):

        mapping = {}
        for key, value in maptable.items():
            text = self.get_node_text(node, value)
            mapping[key] = text

        return mapping

