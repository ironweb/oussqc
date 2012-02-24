from django.conf.urls.defaults import patterns, url, include


urlpatterns = patterns('iron.core.views',
    ('^$', 'home'),
    url('^search/$', 'search', name='recherche'),
    url('^list/$', 'results', {'mode':'liste'} ),
    url('^map/$', 'results', {'mode': 'map'}),
    ('^activite/(\d+)/$', 'activite'),

    (r"^evenements/$", 'iron.core.views.evenements'),
    (r"^evenements/search/$", 'iron.core.views.eventsearch'),

    ('^quartiers/(\d+)/$', 'quartiers'),

)
