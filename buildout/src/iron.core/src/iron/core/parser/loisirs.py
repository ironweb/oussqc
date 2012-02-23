import xml.dom.minidom
import sys
sys.path.append('/home/sylvain/rouges/buildout/core/parser')
import qcparser
from pprint import pprint
from iron.core.models import Loisir, Horaire

class LoisirParser(qcparser.SimpleParser):

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

    if sys.argv[1] == 'libre':
        f = open("/home/sylvain/rouges/data/loisir_libre_format.xml", "r")
        parser = LoisirParser("LOISIR_LIBRE")

    elif sys.argv[1] == 'payant':
        f = open("/home/sylvain/rouges/data/loisir_payant_format.xml", "r")
        parser = LoisirParser("LOISIR_PAYANT")
    else:
        print "bad"
        exit()

    #loisirs = parser.parse( f.read() )

    for l in parser.parse( f.read() ):
        L = Loisir()
            
        L.CODE_SESSION = l['code_session']
        L.DESCRIPTION = l['description']
        L.DESCRIPTION_ACT = l['act']
        L.DESCRIPTION_NAT = l['nat']
        L.NOM_COUR = l['cours']
        L.ARRONDISSEMENT = l['arrondissement']
        L.ADRESSE = l['adresse']

        if len(l['lieux']) > 0:
            L.LIEU_1 = l['lieux'][0]

        if len(l['lieux']) > 1:
            L.LIEU_2 = l['lieux'][1]

        print l
        L.save()

        for h in l['horaires']:
            H = Horaire()
            H.LOISIR = (L)
            H.DATE_DEB = h['date_debut']
            H.DATE_FIN = h['date_fin']
            H.HEURE_DEBUT = h['heure_debut']
            H.HEURE_FIN = h['heure_fin']
            H.JOUR_SEMAINE = h['jour']
            H.save()

    pprint( l )

'''
{'act': u'Chant choral - Journ\xe9e portes ouvertes',
 'adresse': u'650, Av Du Bourg-Royal, Qu\xe9bec (QC) G2L 1M8 ',
 'arrondissement': u'Arrondissement de Charlesbourg',
 'code_session': u'P2012',
 'cours': u'Petits chanteurs de Charlesbourg (Les)',
 'description': u'Chant choral - Journ\xe9e portes ouvertes',
 'horaires': [{'date_debut': u'2012-05-05',
               'date_fin': u'2012-05-05',
               'heure_debut': u'13:00:00',
               'heure_fin': u'16:00:00',
               'jour': u'Samedi'}],
 'lieux': [u'\xc9cole Saint-Jean-Eudes',
           u'Ext. St-Jean Eudes-Local des cadets (musique)'],
 'nat': u'Arts de la sc\xe8ne',
 'tarif': None}
'''
