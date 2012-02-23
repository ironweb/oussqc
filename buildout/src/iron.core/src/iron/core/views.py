#coding: utf-8
from django.http import HttpResponse
from django.core import serializers
from django.template import RequestContext
from iron.core.models import Evenement, Categorie

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

def zone_view(request):
    return render_to_response('arrondissement.html')

def category_view(request):
    qs = Categorie.objects.all().order_by('UID')
    d = {'categories' : qs}
    c = RequestContext(request, d)
    return render_to_response('category.html', c)


def search_view(request, categorie_id=None):

    qs = Categorie.objects.all().order_by('UID')
    qs_evenements = Evenement.objects.all()

    d = {'categories' : qs, 'selected_categorie_id': categorie_id, 'ARR': ARR}
    print 'before', len(qs_evenements)

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

    if 'district' in request.GET:
        query = query.filter(NOM_ARRONDISSEMENT = request.GET['district'])

    evenements = query.all()

    serializer = serializers.get_serializer("json")()
    data = serializer.serialize(evenements)
    return HttpResponse(data)

