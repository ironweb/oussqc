#coding: utf-8
from django.db import models


class Evenement(models.Model):
    UID = models.CharField(max_length=200)

    CATEGORIE_EVENEMENT = models.CharField(max_length=100)

    TITRE_EVENEMENT = models.CharField(max_length=100)
    DEBUT_EVENEMENT = models.DateTimeField()
    FIN_EVENEMENT = models.DateTimeField()
    HORAIRE_EVENEMENT = models.CharField(max_length=100)
    COUT_EVENEMENT = models.IntegerField()
    DESCRIPTION_EVENEMENT = models.TextField()
    RENSEIGNEMENT_EVENEMENT = models.IntegerField()
    TEL1_EVENEMENT = models.CharField(max_length=30)
    TEL2_EVENEMENT = models.CharField(max_length=30)
    TEL_LIEU = models.CharField(max_length=30)
    COURRIEL_EVENEMENT = models.EmailField()
    URL_EVENEMENT = models.URLField()
    NOMLIEU_EVENEMENT = models.CharField(max_length=30)
    COMPLEMENT_LIEU_EVENEMENT = models.CharField(max_length=100)
    ADRESSE_EVENEMENT = models.CharField(max_length=100)
    NOM_ARRONDISSEMENT = models.CharField(max_length=100)
'''
<CATEGORIE_EVENEMENT>Activité familiale</CATEGORIE_EVENEMENT>
<TITRE_EVENEMENT>Michael Jackson, The Immortal World Tour</TITRE_EVENEMENT>
<DEBUT_EVENEMENT>2012-03-24</DEBUT_EVENEMENT>
<FIN_EVENEMENT>2012-03-25</FIN_EVENEMENT><HORAIRE_EVENEMENT></HORAIRE_EVENEMENT>
<COUT_EVENEMENT>1</COUT_EVENEMENT><DESCRIPTION_EVENEMENT>Conçue et mise en scène par Jamie King, cette production historique unique en son genre combine la musique et les chorégraphies de Michael Jackson au savoir-faire créatif du Cirque du Soleil en rassemblant une soixantaine d’artistes provenant de partout dans le monde. </DESCRIPTION_EVENEMENT>
<RENSEIGNEMENT_EVENEMENT>-1</RENSEIGNEMENT_EVENEMENT>
<TEL1_EVENEMENT>418-691-7211-</TEL1_EVENEMENT><TEL2_EVENEMENT></TEL2_EVENEMENT>
<COURRIEL_EVENEMENT></COURRIEL_EVENEMENT><URL_EVENEMENT>http://www.billetech.com/</URL_EVENEMENT> <NOMLIEU_EVENEMENT>Colisée Pepsi</NOMLIEU_EVENEMENT>
<COMPLEMENT_LIEU_EVENEMENT></COMPLEMENT_LIEU_EVENEMENT>
<ADRESSE_EVENEMENT>250, boulevard Wilfrid-Hamel</ADRESSE_EVENEMENT><TEL_LIEU>418-691-7211-</TEL_LIEU>
<NOM_ARRONDISSEMENT>La Cité-Limoilou</NOM_ARRONDISSEMENT>
'''

class Loisir(models.Model):
    UID = models.CharField(max_length=200)

    CODE_SESSION = models.CharField(max_length=100)
    DESCRIPTION = models.CharField(max_length=100)
    DESCRIPTION_ACT = models.CharField(max_length=100)
    DESCRIPTION_NAT = models.CharField(max_length=100)
    NOM_COUR = models.CharField(max_length=100)
    LIEU_1 = models.CharField(max_length=100)
    LIEU_2 = models.CharField(max_length=100)
    ARRONDISSEMENT = models.CharField(max_length=100)
    ADRESSE = models.CharField(max_length=100)
    DATE_DEB = models.DateField()
    DATE_FIN = models.DateField()

    # Pour ceux avec tarif.
    TARIF_BASE = models.DecimalField(max_digits=5, decimal_places=2)

class Horaire(models.Model):
    LOISIR = models.ForeignKey(Loisir)

    JOUR_SEMAINE = models.CharField(max_length=10)
    HEURE_DEBUT = models.TimeField()
    HEURE_FIN = models.TimeField()


'''
<LOISIR_LIBRE><CODE_SESSION>E2012</CODE_SESSION>
<DESCRIPTION>Camp de jour</DESCRIPTION>
<DESCRIPTION_ACT>Camp de jour</DESCRIPTION_ACT>
<DESCRIPTION_NAT>Camp spécialisé</DESCRIPTION_NAT>
<NOM_COUR>Jeunes Handicapés de Charlesbourg (Les)</NOM_COUR><LIEU_1>École Joseph-Paquin</LIEU_1>
<LIEU_2>École Joseph-Paquin - Gymnase</LIEU_2><ARRONDISSEMENT>Arrondissement de Charlesbourg</ARRONDISSEMENT>
<ADRESSE>465, 64e Rue Est, Québec (QC) G1H 1Y1 </ADRESSE>
<DATE_DEB>2012-06-27</DATE_DEB>
<DATE_FIN>2012-08-08</DATE_FIN>
<JOUR_SEMAINE>Jeudi</JOUR_SEMAINE>
<HEURE_DEBUT>08:30:00</HEURE_DEBUT>
<HEURE_FIN>16:30:00</HEURE_FIN>
</LOISIR_LIBRE>
'''