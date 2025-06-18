#pragma once
#include <ESP8266WebServer.h>
#include <ESP8266WiFi.h>

#include "LoopModule.h"
struct WifiModule : private LoopModule {
    WifiModule( int = 80 );
    const int port;
    const char* ssid = "HELLO";
    const char* password = "WORLD";
    ESP8266WebServer server;
    IPAddress local_IP, gateway, subnet;
    WifiModule& config( IPAddress ip = { 192, 168, 5, 1 }, IPAddress gateway = { 192, 168, 5, 1 }, IPAddress subnet = { 255, 255, 255, 0 } );
    void run();
    void begin();
    void bind_restful( const Uri&, std::function<void()> );
    void printNetworkInfo();
};