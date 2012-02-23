from django.conf.urls.defaults import patterns, url, include


urlpatterns = patterns('iron.core.views',
    ('^$', 'home'),
    ('^search/$', 'search'),
    ('^list/$', 'results'),
    ('^activite/$', 'activite'),

    #url('^category/$', category_view),
    #url('^zone/$', zone_view),

)
