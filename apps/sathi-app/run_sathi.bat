@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Administrator\AppData\Local\Android\Sdk"
set PATH=C:\Program Files\nodejs;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%
npx expo run:android --port 8082
