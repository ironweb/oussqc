DEBUG = True
TEMPLATE_DEBUG = DEBUG
#MEDIA_ROOT = '/home/sylvain/rouges/www/media/'
#MEDIA_URL = 'http://dev1.socodevi.l3i.ca/'
STATIC_ROOT = ''
STATIC_URL = 'http://s1.www.sylvain.l3i.ca/rouges-lm/'
#ADMIN_MEDIA_PREFIX = 'http://dev1.socodevi.l3i.ca/adminmedia/'
#ADMIN_TOOLS_MEDIA_URL = 'http://dev1.socodevi.l3i.ca/'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'ironweb',                      # Or path to database file if using sqlite3.
        'USER': 'jeffrey',                      # Not used with sqlite3.
        'PASSWORD': 'jeffrey',                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
        'OPTIONS': {
            'init_command': 'SET storage_engine=INNODB',
        }
    }
}
