import xml.dom.minidom
import json
import sys
sys.path.append('/home/sylvain/rouges/buildout/core/parser')

import qcparser

from pprint import pprint

class EvenementParser(qcparser.SimpleParser):

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

        grouping = self.regroup_evenements(transformed)
        return self.merge_evenements(grouping)

    def regroup_evenements(self, evenements):

        grouping = {}

        for evenement in evenements:

            uid = (
                    evenement['titre'] +
                    evenement['debut'] +
                    evenement['fin']
                )

            group = grouping.setdefault( uid, [] )
            group.append(evenement)

        return grouping

    def merge_evenements(self, grouping):

        transformed = []

        for entries in grouping.values():

            categories = []
            for entry in entries:
                categories.append( entry['categorie'] )

            entry = entries.pop()
            del entry['categorie']
            entry['categories'] = categories

            transformed.append(entry)

        return transformed

    def get_telephones(self, node):
        telephones = []
        telephones.append( self.get_node_text(node, "TEL1_EVENEMENT") )
        telephones.append( self.get_node_text(node, "TEL2_EVENEMENT") )
        return [ x for x in telephones if x is not None ]

if __name__ == "__main__":

    from iron.core.models import Evenement, Categorie
    from iron.core.parser.categories import CategoryParser

    if len(sys.argv) <= 1:
        print "USAGE: %s XML_FILE" % sys.argv[0]
        sys.exit(1)

    filepath = sys.argv[1]
    f = open(filepath, 'r')
    parser = EvenementParser()
    category_parser = CategoryParser()

    evenements = parser.parse( f.read() )

    categories = category_parser.categorie_evenements(evenements)

    for category in categories:
        if Categorie.objects.filter(UID=category).count() == 0:
            model = Categorie()
            model.UID = category
            model.save()
        print category

    for e in evenements:

        E = Evenement()

        E.TITRE_EVENEMENT = e['titre']
        E.DEBUT_EVENEMENT = e['debut']
        E.FIN_EVENEMENT = e['fin']
        E.HORAIRE_EVENEMENT = e['horaire']
        E.COUT_EVENEMENT = e['cout']
        E.DESCRIPTION_EVENEMENT = e['description']
        E.RENSEIGNEMENT_EVENEMENT = e['renseignement']
        E.TEL_LIEU = e['tel_lieu']
        E.COURRIEL_EVENEMENT = e['courriel']
        E.URL_EVENEMENT = e['url']
        E.NOMLIEU_EVENEMENT = e['lieu']
        E.COMPLEMENT_LIEU_EVENEMENT = e['complement_lieu']
        E.ADRESSE_EVENEMENT = e['adresse']
        E.NOM_ARRONDISSEMENT = e['arondissement']

        if len(e['telephones']) > 0:
            E.TEL1_EVENEMENT = e['telephones'][0]

        if len(e['telephones']) > 1:
            E.TEL2_EVENEMENT = e['telephones'][1]

        E.save()

        for categorie in e['categories']:
            E.CATEGORIES.add( Categorie.objects.get(UID=categorie) )

        E.save()

        print e



'''
'renseignement': u'-1'
 'arondissement': u'La Cit\xe9-Limoilou'
 'categorie': u'Arts'
 'cout': u'1'
 'url': u'http://www.billetech.com/'
 'debut': u'2012-03-24'
 'adresse': u'250
 boulevard Wilfrid-Hamel'
 'tel_lieu': u'418-691-7211-'
 'courriel': None
 'telephones': [u'418-691-7211-']
 'horaire': None
 'lieu': u'Colis\xe9e Pepsi'
 'titre': u'Michael Jackson
 The Immortal World Tour'
 'complement_lieu': None
 'fin': u'2012-03-25'
 'description': u'Con\xe7ue et mise en sc\xe8ne par Jamie King
 cette production historique unique en son genre combine la musique et les chor\xe9graphies de Michael Jackson au savoir-faire cr\xe9atif du\xa0Cirque du Soleil en rassemblant une soixantaine d\u2019artistes provenant de partout dans le monde. '} '''
