#coding: utf-8
from django.http import HttpResponse, HttpResponseBadRequest
from django.core import serializers
from django.template import RequestContext
from iron.core.models import Evenement, Categorie

from django.db.models import Q

from django.shortcuts import render_to_response
from constantes import ZONES

json = serializers.get_serializer("json")()

ARR = (
    'Beauport',
    'Charlesbourg',
    'La Cité-Limoilou',
    'La Haute-Saint-Charles',
    'Les Rivières',
    'Sainte-Foy–Sillery–Cap-Rouge'
)


def home(request):
    d = {}
    qs_evenements = Evenement.objects.all().order_by('?')[:3]
    d['evenements'] = qs_evenements
    c = RequestContext(request, d)
    return render_to_response('home.html', c)

def category(request):
    qs = Categorie.objects.all().order_by('UID')
    d = {'categories' : qs}
    c = RequestContext(request, d)
    return render_to_response('category.html', c)

def results(request, mode='liste'):

    d = {}
    qs_evenements = Evenement.objects.all()[:10]
    d['evenements'] = qs_evenements
    c = RequestContext(request, d)

    # liste ou map
    return render_to_response(mode+'.html', c)

def activite(request, event_id):
    d = {}
    d['evenement'] = Evenement.objects.get(id=event_id)
    c = RequestContext(request, d)
    return render_to_response('activite.html', c)

def search(request, categorie_id=None):

    qs = Categorie.objects.all().order_by('UID')
    qs_evenements = Evenement.objects.all()

    d = {'categories' : qs, 'selected_categorie_id': categorie_id, 'ARR': ARR}
    #print 'before', len(qs_evenements)

    # par arrondissement
    #print arr
    
    # par catégorie
    if categorie_id is not None:

        sql = """
        SELECT * FROM core_evenement
        WHERE id IN (SELECT evenement_id FROM core_evenement_CATEGORIES WHERE
        categorie_id = %s)
        """

        qs_evenements = Evenement.objects.raw(sql, [int(categorie_id)])

        d['selected_categorie_id'] = int(d['selected_categorie_id'])
        #qs_evenements = qs_evenements.filter(CATEGORIE_EVENEMENT__id=categorie_id)

    d['evenements'] = qs_evenements

    # le bouton "recherche" n'est pas pertinent si on est déjà dans la recherche
    d['hide_search_button'] = qs_evenements

    for e in qs_evenements:
        print e

    c = RequestContext(request, d)

    print c['STATIC_URL']
    
    return render_to_response('search.html', c)


def screen(request, screen_no):
    return HttpResponse(screen_no)

def evenements(request):
    serializer = serializers.get_serializer("json")()
    objects = Evenement.objects.all()
    data = serializer.serialize(objects)
    return HttpResponse(data)


def eventsearch(request):

    query = Evenement.objects

    keyword_fields = [
        'TITRE_EVENEMENT',
        'DESCRIPTION_EVENEMENT',
        'NOMLIEU_EVENEMENT',
        'COMPLEMENT_LIEU_EVENEMENT',
    ]

    if 'district' in request.GET:
        query = query.filter(NOM_ARRONDISSEMENT = request.GET['district'])

    if 'keyword' in request.GET:

        term = request.GET['keyword']

        field = keyword_fields.pop() + "__contains"

        condition = Q(**{field: term})
        for field in keyword_fields:
            condition = condition | Q(**{field + "__contains":term})

        query = query.filter(condition)

    evenements = query.all()

    for e in evenements:
        e.HORAIRE_EVENEMENT.replace("\n", "<br />")

    serializer = serializers.get_serializer("json")()
    data = serializer.serialize(evenements)
    return HttpResponse(data)


def quartiers(request, arr_index):
    arr_index = int(arr_index)
    quartiers = ZONES[arr_index]
    import json
    data = json.dumps(quartiers)

def eventradius(request):

    sql = """
    SELECT * FROM core_evenement WHERE
     ( 3959 * acos( cos( radians(%s) ) * cos( radians( LATITUDE ) )
      * cos( radians(LONGITUDE) - radians(%s)) + sin(radians(%s))
      * sin( radians(LATITUDE)))) <= %s
    """
    if 'latitude' not in request.GET and 'longitude' not in request.GET:
        return HttpResponseBadRequest('must pass latitude and longitude')

    latitude = float(request.GET['latitude'])
    longitude = float(request.GET['longitude'])
    km = float(request.GET['km'])

    evenements = Evenement.objects.raw( sql, [latitude, longitude, latitude, km] )

    serializer = serializers.get_serializer("json")()
    data = serializer.serialize(evenements)
    return HttpResponse(data)

