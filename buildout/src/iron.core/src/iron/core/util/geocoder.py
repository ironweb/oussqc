# coding=utf8
import urllib
import json
from pprint import pprint 

GOOGLE_API_URL = unicode("https://maps.googleapis.com/maps/api/geocode/json", 'utf-8')
COUNTRY_CODE = unicode("ca", 'utf-8')
LANGUAGE = unicode("fr", 'utf-8')
SENSOR = unicode("false", 'utf-8')
ADDRESS_PREPEND = unicode(",Québec, Canada", 'utf-8')

def custom_urlencode(params):

    data = []
    for key, value in params.items():
        key = unicode(key)
        chunk = urllib.quote(key) + unicode("=") + urllib.quote(value.encode('utf-8'))
        data.append(chunk)

    return unicode("&").join(data)


def get_response(address):

    if isinstance(address, str):
        address = unicode(address, 'utf-8')

    if address is None or address.strip() == "":
        raise ValueError("Address cannot be empty")

    params = {
        'address' : address + ADDRESS_PREPEND,
        'region' : COUNTRY_CODE,
        'language' : LANGUAGE,
        'sensor' : SENSOR
    }

    #encoding = 'utf-8'
    #data = [ ( x.encode(encoding), y.encode(encoding) ) for x,y in
    #        params.items() ]

    data = custom_urlencode(params)

    query = unicode("?") + data
    url = GOOGLE_API_URL + query
    response = urllib.urlopen(url)

    data = response.read()

    return data

def find_location(address):

    text = get_response(address)
    data = json.loads(text)

    if data['status'] != "OK":
        return None

    location = data['results'][0]['geometry']['location']
    return location['lat'], location['lng']

def set_and_save_location(evenement, result):

    latitude, longitude = result
    evenement.LATITUDE = latitude
    evenement.LONGITUDE = longitude
    evenement.save()

def update_location(evenement):

    if evenement.ADRESSE_EVENEMENT is not None and evenement.ADRESSE_EVENEMENT.strip() != "":

        result = find_location(evenement.ADRESSE_EVENEMENT)

        if result is not None:
            set_and_save_location(evenement, result)
            #Try getting location from alternative location description
        elif evenement.NOMLIEU_EVENEMENT is not None and evenement.NOMLIEU_EVENEMENT.strip() != "":
            result = find_location(evenement.NOMLIEU_EVENEMENT)
            if result is not None:
                set_and_save_location(evenement, result)

if __name__ == "__main__":

    from iron.core.models import Evenement

    evenements = Evenement.objects.all()

    for e in evenements:
        update_location(e)
        print e.TITRE_EVENEMENT
        print e.ADRESSE_EVENEMENT
        print e.LATITUDE
        print e.LONGITUDE

