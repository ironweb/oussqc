# coding=utf8
import re
import datetime

time_regexes = [
    re.compile(r"(d|D)e ?(?P<hour_start>\d{1,2}) ?(h|H) ?((?P<min_start>\d{1,2}) ?(m|M))? ?à ?(?P<hour_end>\d{1,2}) ?(h|H) ?((?P<min_end>\d{1,2}) ?(m|M))?"),
    re.compile(r"^ *?(?P<hour_start>\d{1,2}) ?(h|H) *?((?P<min_start>\d{1,2}) ?(m|M))? *?$")
]

def guess_time(text):

    for regex in time_regexes:

        match = regex.match(text)

        if match:

            values = match.groupdict()

            hour_start, hour_end, min_start, min_end = 0,0,0,0
            start, end = None, None

            if values.get('hour_start', None):
                hour_start = int(values['hour_start'])

            if values.get('hour_end', None):
                hour_end = int(values['hour_end'])

            if values.get('min_start', None):
                min_start = int(values['min_start'])

            if values.get('min_end', None):
                min_end = int(values['min_end'])

            if hour_start != 0 or min_start != 0:
                start = datetime.time(hour_start, min_start)

            if hour_end != 0 or min_end != 0:
                end = datetime.time(hour_end, min_end)

            return start, end

    return None, None

if __name__ == "__main__":

    print guess_time("De 11 h à 13 h")
    print guess_time("   14h ")

