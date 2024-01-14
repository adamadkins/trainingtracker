@echo off
start /b python TrainingTracker.py
ping 127.0.0.1 -n 2 > nul
start http://127.0.0.1:5000
