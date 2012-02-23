from django.http import HttpResponse
from django.core import serializers
from iron.core.models import Evenement

json = serializer.get_serializer("json")()

def test(request):
    return HttpResponse('yo')

def screen(request, screen_no):
    return HttpResponse(screen_no)

def evenements(request):
    serializer = serializers.get_serializer("json")()
    objects = Evenement.objects.all()
    data = serializer.serialize(objects)
    return HttpResponse(data)

