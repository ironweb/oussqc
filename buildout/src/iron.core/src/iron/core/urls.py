from django.conf.urls.defaults import patterns, url, include

from views import zone_view, results, activite

urlpatterns = patterns('',
    ('^$', 'iron.core.views.search_view'),

    #url('^search/(\d+)/$', 'iron.core.views.search_view',name='search-by-category'),
    #url('^zone/$', zone_view),
    #url('^category/$', category_view),
    #url('^search/arr/?P<arr>(.+)/$', 'iron.core.views.search_view',name='search-by-arr'),
    ('^search/$', 'iron.core.views.search_view'),
    ('^list/$', results),
    ('^activite/$', activite),

    (r"^evenements/$", 'iron.core.views.evenements'),
    (r"^evenements/search/$", 'iron.core.views.eventsearch'),
    ('^screen/(\d+)$', 'iron.core.views.screen'),

    ('^quartiers/(\d+)/$', 'iron.core.views.quartiers'),
)
