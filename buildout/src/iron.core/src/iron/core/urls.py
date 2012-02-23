from django.conf.urls.defaults import patterns, url, include

urlpatterns = patterns('iron.core.views',
    ('^$', 'home'),
    ('^search/$', 'search'),
    ('^list/$', 'results'),
    url('^activite/(\d+)/$', 'activite', name='fiche_activite'),

    (r"^evenements/$", 'iron.core.views.evenements'),
    (r"^evenements/search/$", 'iron.core.views.eventsearch'),
)
