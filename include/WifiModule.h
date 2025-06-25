#pragma once
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>
#include <ESP8266WiFi.h>

#include "LoopModule.h"
struct WifiModule : public LoopModule {
   private:
    enum class ConnectionState {
        IDLE,
        CONNECTING,
        CONNECTED,
        FAILED
    };
    const int port = 80;
    ConnectionState connectionState = ConnectionState::IDLE;
    unsigned long connectionStartTime = 0;
    unsigned long connectionTimeout = 0;
    String ssid;
    String password;
    IPAddress local_IP, gateway, subnet;

   public:
    ESP8266WebServer server;
    WifiModule( int = 80 );
    WifiModule& configAP( IPAddress ip = { 192, 168, 5, 1 }, IPAddress gateway = { 192, 168, 5, 1 }, IPAddress subnet = { 255, 255, 255, 0 } );
    void startConnection( const String& ssid, const String& pswd, unsigned long timeout = 10000 );
    std::optional<JsonDocument> pendJson();
    void run();
    void begin();
    void bind_restful( const Uri&, std::function<void()> );
    void printNetworkInfo();
    String DHCPIP() {
        return WiFi.isConnected() ? WiFi.localIP().toString() : String();
    }
};