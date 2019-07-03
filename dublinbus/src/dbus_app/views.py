from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie

# Read config JSON file and load parameters
import os
script_dir = os.path.dirname(__file__)  # <-- absolute dir the script is in
rel_path = "static/dbus_app/config/config.json"
abs_file_path = os.path.join(script_dir, rel_path)

with open(abs_file_path, 'r') as f:
    config = json.load(f)

# Create your views here.


def home_page(request):
    """Renders home page"""

    import requests
    import json

    # import sys
    # #import pymysql
    # import json
    # import psycopg2
    #
    # host='127.0.0.1'
    # user='postgres'
    # password='23081987'
    # db='postgres'
    #
    # try:
    #     #con=pymysql.connect(host=host, user=user, password=password, db=db, use_unicode=True, charset='utf8')
    #     con = psycopg2.connect(host=host,database=db, user=user, password=password)
    # except Exception as e:
    #     sys.exit(e)
    #
    # cur = con.cursor()
    # cur.execute("SELECT * FROM dbus_data.stops LIMIT 5")
    # data=cur.fetchall()
    #
    # # mycontext = {"mydata":data}
    # # for item in data:
    # #     print("Station: %s" % item[4])
    # #     print("\tstop code: %s" % item[6])
    # #     print("\tlat: %s" % item[0])
    # #     print("\tlon: %s\n" % item[2])
    #

    # weather_url = 'http://api.openweathermap.org/data/2.5/weather?id=2964574&APPID=ccd785798f791ebfcb49e22deabb99be&units=metric'
    weather_url = 'http://api.openweathermap.org/data/2.5/weather?id='
    r = requests.get(weather_url + config['WEATHER']['CITY_ID'] + '&APPID=' +
                     config['WEATHER']['SECRET_KEY'] + '&units=metric')

    # api.openweathermap.org/data/2.5/forecast?id={city ID}
    forecast = requests.get('http://api.openweathermap.org/data/2.5/forecast?id=' +
                            config['WEATHER']['CITY_ID'] + '&APPID=' + config['WEATHER']['SECRET_KEY'] + '&units=metric')

    return render(request, 'dbus_app/base.html', {'api_key': config['DIRECTIONS']['SECRET_KEY'], 'weather': r.json(), 'weather_forecast': forecast.json()})


@ensure_csrf_cookie
def get_directions(request):
    """Gets route data from Google"""

    import requests
    import json

    start = request.POST["start"]
    destination = request.POST["destination"]

    url = 'https://maps.googleapis.com/maps/api/directions/json?'

    r = requests.get(url + 'origin=' + start + '&destination=' +
                     destination + '&mode=' + "transit&key=" + config['DIRECTIONS']['SECRET_KEY'])
    x = r.json()
    print(x)

    return JsonResponse(x)


@ensure_csrf_cookie
def refresh_weather(request):
    """Fetches weather data from OpenWeather Map"""

    import requests
    import json

    #url ='http://api.openweathermap.org/data/2.5/weather?id=2964574&APPID=ccd785798f791ebfcb49e22deabb99be&units=metric'
    url = 'http://api.openweathermap.org/data/2.5/weather?id=' + \
        config['WEATHER']['CITY_ID'] + '&APPID=' + \
        config['WEATHER']['SECRET_KEY'] + '&units=metric'

    r = requests.get(url)
    x = r.json()

    # print(x)
    return JsonResponse(x)
