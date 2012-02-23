import xml.dom.minidom
from pprint import pprint
import json
import parser

class EvenementParser(parser.SimpleParser):

    mapping = {
        'categorie': "CATEGORIE_EVENEMENT",
        'titre' : "TITRE_EVENEMENT",
        'debut' : "DEBUT_EVENEMENT",
        'fin'   : "FIN_EVENEMENT",
        'horaire' : "HORAIRE_EVENEMENT",
        'cout' : "COUT_EVENEMENT",
        'description' : "DESCRIPTION_EVENEMENT",
        'renseignement' : "RENSEIGNEMENT_EVENEMENT",
        'courriel' : "COURRIEL_EVENEMENT",
        'url' : "URL_EVENEMENT",
        'lieu' : "NOMLIEU_EVENEMENT",
        'complement_lieu' : "COMPLEMENT_LIEU_EVENEMENT",
        'adresse' : "ADRESSE_EVENEMENT",
        'tel_lieu' : "TEL_LIEU",
        'arondissement' : "NOM_ARRONDISSEMENT",
    }

    def __init__(self):
        pass

    def parse(self, data):

        self.document = xml.dom.minidom.parseString(data)

        evenements = self.document.getElementsByTagName("IDEE_SORTIE")

        transformed = []

        for evenement in evenements:

            element = self.map_node( evenement, self.mapping )
            element['telephones'] = self.get_telephones(evenement)

            transformed.append(element)

        return transformed

    def get_telephones(self, node):
        telephones = []
        telephones.append( self.get_node_text(node, "TEL1_EVENEMENT") )
        telephones.append( self.get_node_text(node, "TEL2_EVENEMENT") )
        return [ x for x in telephones if x is not None ]

if __name__ == "__main__":

    f = open("evenement_formatted.xml", "r")
    parser = EvenementParser()
    pprint( parser.parse( f.read() ) )
