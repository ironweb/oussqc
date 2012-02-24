
def settings(request):
    from django.conf import settings
    res = {'STATIC_URL': settings.STATIC_URL}


    D = {
        '/':'',
        '/liste/':'/search/',
        '/map/':'/search/',
        '/search/':'/',
        '/activite/':'/liste/',
    }
    #print request.META['PATH_INFO']
    #res['back_url'] = D.get( request.META['PATH_INFO'] )


    return res

