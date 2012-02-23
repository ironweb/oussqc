from django.conf.urls.defaults import patterns, url, include

urlpatterns = patterns('',
    ('^$', 'iron.core.views.test'),
    (r"^evenements/$", 'iron.core.views.evenements'),
    ('^screen/(\d+)$', 'iron.core.views.screen'),
)

