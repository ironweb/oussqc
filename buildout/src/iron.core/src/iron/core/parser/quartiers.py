import shapely.geometry
from shapely.geometry.collection import GeometryCollection
import qcparser
import xml.dom.minidom
from decimal import Decimal
from pprint import pprint

class RegionParser(qcparser.SimpleParser): 

    node_tag = "Placemark"
    metadata_tag = "SimpleData"
    coordinate_tag = "coordinates"
    name_attribute = "name"
    name_att_value = "NOM"

    def parse(self, data):

        self.document = xml.dom.minidom.parseString(data)

        arrondissements = []

        nodes = self.document.getElementsByTagName(self.node_tag)

        for node in nodes:

            arrondissement = self.generate_arrondissement(node)
            arrondissements.append(arrondissement)

        return arrondissements

    def generate_arrondissement(self, node):

        name = self.get_nom_arrondissement(node)
        coordinates = self.get_coordinates(node)

        return {
            'name' : name,
            'coordinates' : coordinates,
        }

    def get_nom_arrondissement(self, node):

        reduced = [ x
                for x in node.getElementsByTagName(self.metadata_tag)
                if x.getAttribute(self.name_attribute) == self.name_att_value
                ]

        return reduced[0].childNodes[0].data

    def get_coordinates(self, node):

        coordinate_node = node.getElementsByTagName(self.coordinate_tag)[0]

        text = coordinate_node.childNodes[0].data

        coordinates = text.split(" ")
        coordinates.pop()

        transformed = []
        for coordinate in coordinates:
            parts = coordinate.split(",")
            transformed.append( (Decimal(parts[0]), Decimal(parts[1]) ) )

        return transformed


def find_overlaps(arrondissements, quartiers):

    mapping = {}
    for arrondissement in arrondissements:

        print "arrondissement", arrondissement['name']
        area = shapely.geometry.Polygon( arrondissement['coordinates'] )

        for quartier in quartiers:

            print "quartier", quartier['name']
            region = shapely.geometry.Polygon( quartier['coordinates'] )

            overlaps = region.overlaps(area)
            intersection = region.intersection(area)

            if overlaps and type(intersection) is not GeometryCollection:

                print "overlaps"

                a_name = arrondissement['name']
                q_name = quartier['name']

                mapping.setdefault(a_name, []).append(q_name)

    return mapping

if __name__ == "__main__":

    import sys
    from iron.core.models import Quartier

    if len(sys.argv) <= 1:
        print "Usage: %s ARRONDISSEMENT_KML QUARTIER_KML" % sys.argv[0]

    filepath = sys.argv[1]
    data = open(filepath, 'r').read()

    parser = RegionParser()
    arrondissements = parser.parse( data )

    filepath = sys.argv[2]
    data = open(filepath, 'r').read()
    quartiers = parser.parse( data )

    mapping = find_overlaps(arrondissements, quartiers)

    for arrondissement, quartier_l in mapping.items():

        for quartier in quartier_l:
            model = Quartier()
            model.NOM = quartier
            model.ARRONDISSEMENT = arrondissement
            model.save()
            print model

