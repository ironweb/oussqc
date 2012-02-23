import xml.dom.minidom
import parser
from pprint import pprint

class LoisirParser(parser.SimpleParser):

    mapping = {
            'code_session' : "CODE_SESSION",
            'description' : "DESCRIPTION",
            #TODO: wat is act and nat ?
            'act' : "DESCRIPTION_ACT",
            'nat' : "DESCRIPTION_NAT",
            'cours' : "NOM_COUR",
            #'tarif' : "TARIF_BASE",
            'arrondissement' : "ARRONDISSEMENT",
            'adresse' : "ADRESSE",
            'date_debut' : "DATE_DEB",
            'date_fin' : "DATE_FIN",
            'jour' : "JOUR_SEMAINE",
            'heure_debut' : "HEURE_DEBUT",
            'heure_fin' : "HEURE_FIN",
            }

    horaire_keys = [
        'date_debut', 
        'date_fin', 
        'heure_debut', 
        'heure_fin',
        'jour'
    ]

    def __init__(self, root_tag):
        self.root_tag = root_tag

    def parse(self, data):

        self.document = xml.dom.minidom.parseString(data)

        loisirs = self.document.getElementsByTagName(self.root_tag)

        transformed = []

        for loisir in loisirs:

            element = self.map_node(loisir, self.mapping)
            element['tarif'] = self.get_tarif(loisir)
            element['lieux'] = self.get_lieux(loisir)

            transformed.append(element)

        return self.restructure_loisirs(transformed)

    def get_tarif(self, node):
        tarif = self.get_node_text(node, "TARIF_BASE")

        if tarif is None:
            return None

        try:
            return float(tarif)
        except ValueError:
            return None

    def get_lieux(self, node):

        lieux = []
        lieux.append( self.get_node_text(node, "LIEU_1") )
        lieux.append( self.get_node_text(node, "LIEU_2") )
        return lieux

    def regroup_loisirs(self, loisirs):

        grouping = {}
        for loisir in loisirs:

            uid = (
                    loisir['code_session'] +
                    loisir['cours'] +
                    loisir['arrondissement'] +
                    loisir['adresse']
                )

            bucket = grouping.setdefault(uid, [])
            bucket.append(loisir)

        return grouping

    def merge_horaires(self, group):

        horaires = []
        for entry in group:

            horaire = dict([
                (key, entry[key])
                for key in self.horaire_keys
                ])

            horaires.append(horaire)

        return horaires

    def reduce_loisir(self, loisir):

        for key in self.horaire_keys:
            del loisir[key]

        return loisir

    def restructure_loisirs(self, loisirs):

        transformed = []

        grouping = self.regroup_loisirs(loisirs)

        for group in grouping.values():

            horaires = self.merge_horaires(group)
            loisir = self.reduce_loisir( group[0] )
            loisir['horaires'] = horaires

            transformed.append(loisir)

        return transformed

if __name__ == "__main__":

    f = open("../loisirs/loisir_libre_format.xml")
    parser = LoisirParser("LOISIR_LIBRE")
    loisirs = parser.parse( f.read() )

    pprint( loisirs )

