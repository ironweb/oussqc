from iron.core.models import Evenement

def fix_evenement_descriptions():

    counter = 0

    for evenement in Evenement.objects.all():

        evenement.DESCRIPTION_EVENEMENT = evenement.DESCRIPTION_EVENEMENT.replace("\n", "")
        evenement.save()
        print counter
        counter += 1
