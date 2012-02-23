from django.conf.urls.defaults import patterns, url, include

urlpatterns = patterns('',
    ('^$', 'iron.core.views.test'),
    ('^screen/(\d+)$', 'iron.core.views.screen'),
)

