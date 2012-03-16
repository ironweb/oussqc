#coding: utf-8
from django.http import HttpResponse, HttpResponseBadRequest
from django.core import serializers
from django.template import RequestContext
from iron.core.models import Evenement, Categorie, Quartier

from django.db.models import Q

from django.shortcuts import render_to_response
from constantes import ZONES
import json

json_serializer = serializers.get_serializer("json")()

ARR = (
    'Beauport',
    'Charlesbourg',
    'La Cité-Limoilou',
    'La Haute-Saint-Charles',
    'Les Rivières',
    'Sainte-Foy–Sillery–Cap-Rouge'
)

def accueil(request):
    d = {}
    d['page_id'] = 'accueil'

    qs_evenements = Evenement.objects.all().order_by('?')[:6]

    l_evenements = list(qs_evenements)

    L = []
    for x in range(2):
        l = []
        for y in range(3):
            l.append( l_evenements.pop() )
        L.append(l)

    print L

    d['EVENTGROUPS'] = L

    d['evenements'] = qs_evenements
    c = RequestContext(request, d)
    return render_to_response('home.html', c)

def activite(request, event_id):
    d = {}
    d['evenement'] = Evenement.objects.get(id=event_id)
    c = RequestContext(request, d)
    return render_to_response('activite.html', c)

def recherche(request):

    qs = Categorie.objects.all().order_by('UID')
    qs_evenements = Evenement.objects.all()

    d = {'categories' : qs, 'ARR': ARR}
    d['page_id'] = 'recherche'

    categorie_id = request.POST.get('categorie')

    params = {}
    if categorie_id:
        params['categorie'] = categorie_id

    events = find_events(params=params)

    d['evenements'] = qs_evenements

    # le bouton "recherche" n'est pas pertinent si on est déjà dans la recherche
    d['hide_search_button'] = qs_evenements

    c = RequestContext(request, d)

    return render_to_response('search.html', c)

def find_events(params):

    query = Evenement.objects.all()

    keyword_fields = [
        'TITRE_EVENEMENT',
        'DESCRIPTION_EVENEMENT',
        'NOMLIEU_EVENEMENT',
        'COMPLEMENT_LIEU_EVENEMENT',
    ]

    if 'arrondissement' in params:

        arrondissement = params['arrondissement']
        if arrondissement.strip() != "" and arrondissement != "#":

            query = query.filter(NOM_ARRONDISSEMENT = params['arrondissement'])

    if 'categorie' in params:
        query = query.filter(CATEGORIES__UID=params['categorie'])

    if 'keyword' in params:

        term = params['keyword']

        field = keyword_fields.pop() + "__contains"

        condition = Q(**{field: term})
        for field in keyword_fields:
            condition = condition | Q(**{field + "__icontains":term})

        query = query.filter(condition)

    evenements = query.all()

    return evenements


def resultats(request, mode='liste'):

    d = {}
    d['page_id'] = mode
    d['result_display_mode'] = {'liste':'map', 'map':'liste'}[mode]

    d['evenements'] = find_events(request.POST)
    c = RequestContext(request, d)

    # liste ou map
    return render_to_response(mode+'.html', c)

def eventsearch(request):

    evenements = find_events(request.GET)

    data = json_serializer.serialize(evenements)
    return HttpResponse(data)

def find_events_in_radius(longitude, latitude, km):

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

    return evenements

def eventradius(request):

    if 'latitude' not in request.GET and 'longitude' not in request.GET:
        return HttpResponseBadRequest('must pass latitude and longitude')

    latitude = float(request.GET['latitude'])
    longitude = float(request.GET['longitude'])
    km = float(request.GET['km'])

    evenements = find_events_in_radius(latitude, longitude, km)

    data = json_serializer.serialize(evenements)
    return HttpResponse(data)

def QUARTIERS(request):
    f = open('/home/rouge/rouges/data/quartier_formatted.kml', 'r')
    return HttpResponse(f.read())

def ARROND(request):
    f = open('/home/rouge/rouges/data/ARROND.KML', 'r')
    return HttpResponse(f.read())

def quartiers(request):

    arrondissement = request.GET.get('arrondissement', '')

    match = Quartier.objects.all()

    if arrondissement.strip() != "":
        match = match.filter(ARRONDISSEMENT=arrondissement)

    names = [ q.NOM for q in match ]

    data = json.dumps(names)
    return HttpResponse(data)

def greg_mess(request, event_id):

    d = {}

    d['evenement'] = Evenement.objects.get(id=event_id)

    sql = """
        SELECT
            *
        FROM
            core_evenement
        WHERE
            id IN (
                SELECT evenement_id
                FROM core_evenement_CATEGORIES
                WHERE categorie_id = %s
                AND evenement_id != %s
            )
        ORDER BY RAND()
        LIMIT 5
    """

    suggestions = Evenement.objects.raw( sql, [ d['evenement'].CATEGORIES.iterator().next().id, event_id ] )

    d['suggestions'] = suggestions

    c = RequestContext(request, d)
    return render_to_response('activite.html', c)

