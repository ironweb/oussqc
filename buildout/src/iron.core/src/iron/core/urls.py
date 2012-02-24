from django.conf.urls.defaults import patterns, url, include


urlpatterns = patterns('iron.core.views',
    url('^$', 'accueil', name='accueil'),
    url('^recherche/$', 'recherche', name='recherche'),
    url('^liste/$', 'resultats', {'mode':'liste'}, name='resultats_liste' ),
    url('^map/$', 'resultats', {'mode': 'map'}, name='resultats_map'),
    url('^activite/(\d+)/$', 'activite', name='activite_fiche'),

    (r"^evenements/$", 'evenements'),
    (r"^evenements/search/$", 'eventsearch'),

    ('^quartiers/(\d+)/$', 'quartiers'),

)
