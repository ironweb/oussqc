#coding: utf-8
from django.http import HttpResponse, HttpResponseBadRequest
from django.core import serializers
from django.template import RequestContext
from iron.core.models import Evenement, Categorie

from django.db.models import Q

from django.shortcuts import render_to_response

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
    return render_to_response('home.html')

def category(request):
    qs = Categorie.objects.all().order_by('UID')
    d = {'categories' : qs}
    c = RequestContext(request, d)
    return render_to_response('category.html', c)

def results(request, mode='list'):
    from django.conf import settings
    d = {'settings' : settings}
    qs_evenements = Evenement.objects.all()[:10]
    d['evenements'] = qs_evenements
    c = RequestContext(request, d)
    return render_to_response('liste.html', c)

def activite(request, event_id):
    e = Evenement.objects.get(id=event_id)
    d = {}
    d['evenement'] = e
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
        d['selected_categorie_id'] = int(d['selected_categorie_id'])
        qs_evenements = qs_evenements.filter(CATEGORIE_EVENEMENT__id=categorie_id)

    d['evenements'] = qs_evenements

    for e in qs_evenements:
        print e

    c = RequestContext(request, d)
    
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

    serializer = serializers.get_serializer("json")()
    data = serializer.serialize(evenements)
    return HttpResponse(data)

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

    print [latitude, longitude, latitude, km]

    evenements = Evenement.objects.raw( sql, [latitude, longitude, latitude, km] )

    serializer = serializers.get_serializer("json")()
    data = serializer.serialize(evenements)
    return HttpResponse(data)

