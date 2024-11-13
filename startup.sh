#!/bin/bash

cd /root/anonymous
#rm /root/anonymous/images/*
#rm /root/anonymous/uploads/*
source venv/bin/activate
#kill gunicorn if running
pkill gunicorn
#start gunicorn
gunicorn -b 0.0.0.0:8000 app:app -t 180 --daemon
