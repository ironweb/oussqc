from django.conf.urls.defaults import patterns, url, include

from views import zone_view, category_view

urlpatterns = patterns('',

urlpatterns = patterns('iron.core.views',
    ('^$', 'home'),
    ('^search/$', 'search'),
    ('^list/$', 'results'),
    ('^activite/$', 'activite'),

    (r"^evenements/$", 'iron.core.views.evenements'),
    (r"^evenements/search/$", 'iron.core.views.eventsearch'),

   )

