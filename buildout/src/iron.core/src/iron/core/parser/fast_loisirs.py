import xml.dom.minidom
import sys
import decimal

import qcparser
from pprint import pprint
from iron.core.models import Loisir, Horaire, Categorie

class LoisirParser(qcparser.SimpleParser):

    fields = [
        "CODE_SESSION",
        "DESCRIPTION",
        "DESCRIPTION_ACT",
        "DESCRIPTION_NAT",
        "NOM_COUR",
        "LIEU_1",
        "LIEU_2",
        "ARRONDISSEMENT",
        "ADRESSE",
    ]

    horaire_fields = {
        'DATE_DEB' : 'DATE_DEBUT',
        'DATE_FIN' : 'DATE_FIN',
        'HEURE_DEBUT' : 'HEURE_DEBUT',
        'HEURE_FIN' : 'HEURE_FIN',
        'JOUR_SEMAINE' : 'JOUR_SEMAINE',
    }

    categorie_key = "DESCRIPTION_ACT"

    def __init__(self, root_tag):
        self.root_tag = root_tag

    def convert_and_save(self, text):

        print "conversion started"

        self.document = xml.dom.minidom.parseString(text)
        processed = set()
        loisirs = self.document.getElementsByTagName(self.root_tag)

        print "xml loaded"

        for loisir in loisirs:

            uid = self.generate_uid(loisir)

            self.manage_categorie(loisir)

            if uid not in processed:
                model = self.create_loisir(loisir)
                processed.add(uid)
            else:
                model = Loisir.objects.get(
                        NOM_COUR = self.get_node_text(loisir, "NOM_COUR"),
                        CODE_SESSION = self.get_node_text(loisir, "CODE_SESSION"),
                        ARRONDISSEMENT = self.get_node_text(loisir, "ARRONDISSEMENT"),
                        ADRESSE = self.get_node_text(loisir, "ADRESSE")
                        )

            self.create_horaire(model, loisir)

    def generate_uid(self, loisir):
        return (
            self.get_node_text(loisir,"CODE_SESSION") +
            self.get_node_text(loisir,"NOM_COUR") +
            self.get_node_text(loisir,"ARRONDISSEMENT") +
            self.get_node_text(loisir,"ADRESSE")
            )

    def create_loisir(self, loisir):

        model = Loisir()

        for field in self.fields:
            text = self.get_node_text(loisir, field)
            setattr(model, field, text)

        text = self.get_node_text(loisir, "TARIF_BASE")
        print "tarif", text
        if text is not None:
            model.TARIF_BASE = decimal.Decimal(text)

        categorie_name = self.get_node_text(loisir, self.categorie_key)
        if categorie_name is not None:
            model.CATEGORIE = Categorie.objects.get(UID=categorie_name)

        model.save()
        pprint(model)

        return model

    def create_horaire(self, id_loisir, loisir):

        model = Horaire()
        model.LOISIR = id_loisir

        model.DATE_DEB = self.get_node_text(loisir, "DATE_DEB")
        model.DATE_FIN = self.get_node_text(loisir, "DATE_FIN")
        model.JOUR_SEMAINE = self.get_node_text(loisir, "JOUR_SEMAINE")
        model.HEURE_DEBUT = self.get_node_text(loisir, "HEURE_DEBUT")
        model.HEURE_FIN = self.get_node_text(loisir, "HEURE_FIN")

        pprint(model)
        model.save()

    def manage_categorie(self, loisir):

        text = self.get_node_text(loisir, self.categorie_key)
        if text is not None:
            if Categorie.objects.filter(UID=text).count() == 0:
                model = Categorie()
                model.UID = text
                model.save()
                pprint(model)

if __name__ == "__main__":

    if len(sys.argv) <= 2:
        print "Usage: %s MODE XML_FILE (mode: libre or payant)" % sys.argv[0]
        sys.exit(1)

    mode = sys.argv[1]
    filepath = sys.argv[2]

    if mode == 'libre':
        f = open(filepath, "r")
        parser = LoisirParser("LOISIR_LIBRE")

    elif mode == 'payant':
        f = open(filepath, "r")
        parser = LoisirParser("LOISIR_PAYANT")
    else:
        print "bad"
        exit()

    parser.convert_and_save( f.read() )

