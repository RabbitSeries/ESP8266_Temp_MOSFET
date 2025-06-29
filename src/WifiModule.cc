#include "WifiModule.h"

WifiModule::WifiModule( int _port ) : port{ _port }, server( _port ) {
    using namespace std;
}
WifiModule& WifiModule::configAP(
    IPAddress _local_IP,
    IPAddress _gateway,
    IPAddress _subnet ) {
    std::swap( local_IP, _local_IP );
    std::swap( gateway, _gateway );
    std::swap( subnet, _subnet );
    WiFi.softAPConfig( local_IP, gateway, subnet );
    WiFi.softAP( "ESP8266_AP", "12345678" );
    return *this;
}
void WifiModule::startConnection( const String& ssid, const String& pswd, unsigned long timeout ) {
    if ( connectionState == ConnectionState::CONNECTING ) {
        Serial.println( "Connection canceled" );
        WiFi.disconnect();
    }
    connectionState = ConnectionState::CONNECTING;
    WiFi.begin( ssid, pswd );
    Serial.println( "Begin connection" );
    connectionStartTime = millis();
    connectionTimeout = timeout;
}
std::optional<JsonDocument> WifiModule::pendJson() {
    std::optional<JsonDocument> res = std::nullopt;
    if ( server.hasArg( "plain" ) ) {
        String data = server.arg( "plain" );
        JsonDocument tmp;
        DeserializationError err = deserializeJson( tmp, data );
        if ( !err ) {
            res = tmp;
        }
    }
    return res;
}
void WifiModule::begin() {
    server.begin();
}
void WifiModule::bind_restful( const Uri& uri, std::function<void()> handler ) {
    server.on( uri, handler );
}
void WifiModule::printNetworkInfo() {
    Serial.println( "" );
    Serial.print( "IP address: " );
    Serial.println( WiFi.softAPIP() );
    Serial.print( "On port: " );
    Serial.println( port );
}
void WifiModule::run() {
    server.handleClient();
    if ( connectionState != ConnectionState::CONNECTING ) {
        return;
    }
    if ( WiFi.isConnected() ) {
        connectionState = ConnectionState::CONNECTED;
        Serial.println( "\nConnected! IP: " + WiFi.localIP().toString() );
        Serial.println( "Gateway: " + WiFi.gatewayIP().toString() );

    } else if ( millis() - connectionStartTime < connectionTimeout ) {
        Serial.println( "ConnectingWifi...." );
    } else {
        connectionState = ConnectionState::FAILED;
        WiFi.disconnect();
    }
}