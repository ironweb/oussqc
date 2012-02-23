from django.conf.urls.defaults import patterns, url, include

from views import zone_view, category_view, home_view, search_view

urlpatterns = patterns('',
    ('^$', home),

    ('^search/$', search_view),
    url('^zone/$', zone_view),
    url('^category/$', category_view),

)

