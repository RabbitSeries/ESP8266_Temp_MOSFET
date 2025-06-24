#pragma once
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>
#include <ESP8266WiFi.h>

#include "LoopModule.h"
struct WifiModule : public LoopModule {
    WifiModule( int = 80 );
    const int port;
    const char* ssid = "HELLO";
    const char* password = "WORLD";
    ESP8266WebServer server;
    IPAddress local_IP, gateway, subnet;
    WifiModule& configAP( IPAddress ip = { 192, 168, 5, 1 }, IPAddress gateway = { 192, 168, 5, 1 }, IPAddress subnet = { 255, 255, 255, 0 } );
    void startConnection( const String& ssid, const String& pswd, unsigned long timeout = 10000 );
    std::optional<JsonDocument> pendJson();
    void run();
    void begin();
    void bind_restful( const Uri&, std::function<void()> );
    void printNetworkInfo();
};