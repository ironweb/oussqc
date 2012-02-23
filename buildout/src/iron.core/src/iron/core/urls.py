from django.conf.urls.defaults import patterns, url, include

from views import zone_view, category_view

urlpatterns = patterns('',
    ('^$', 'iron.core.views.search_view'),

    url('^zone/$', zone_view),

    #url('^search/(\d+)/$', 'iron.core.views.search_view',name='search-by-category'),
    url('^category/$', category_view),
    #url('^search/arr/?P<arr>(.+)/$', 'iron.core.views.search_view',name='search-by-arr'),
    ('^search/$', 'iron.core.views.search_view'),

    (r"^evenements/$", 'iron.core.views.evenements'),
    ('^screen/(\d+)$', 'iron.core.views.screen'),
)

