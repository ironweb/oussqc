import sys

class CategoryParser(object):

    def __init__(self):
        pass

    def categorie_evenements(self, evenements):

        categories = set()

        for evenement in evenements:
            for c in evenement['categories']:
                categories.add(c)

        return categories

    def categorie_loisirs(self, loisirs):

        categories = set([ x['nat'] for x in loisirs ])

        return categories

    def nested_categories(self, loisirs):
        pass


if __name__ == "__main__":

    sys.path.append('.')
    import iron.core.parser.evenements as evenements_parser
    from iron.core.models import Categorie

    if len(sys.argv) < 2:
        print "Usage: %s TYPE XML_FILE (type: evenement or loisir)" % sys.argv[0]
        sys.exit(1)

    mode = sys.argv[1]
    filepath = sys.argv[2]

    f = open(filepath, 'r')

    if mode == "evenement":
        parser = evenements_parser.EvenementParser()
        category_parser = CategoryParser()

        evenements = parser.parse( f.read() )

        categories = category_parser.categorie_evenements(evenements)

        for category in categories:
            model = Categorie()
            model.UID = category
            print model
            model.save()

    elif mode == "loisir":
        parser = evenements_parser.EvenementParser()
        category_parser = CategoryParser()

        loisirs = parser

