from django.http import HttpResponse

def test(request):
    return HttpResponse('yo')

def screen(request, screen_no):
    return HttpResponse(screen_no)
