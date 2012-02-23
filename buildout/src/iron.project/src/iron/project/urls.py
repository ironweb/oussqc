from django.conf.urls.defaults import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    url(r'', include('iron.core.urls')),

    #url(r'^admin/', include(admin.site.urls)),
    #url(r'^admin_tools/', include('admin_tools.urls')),
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

)
