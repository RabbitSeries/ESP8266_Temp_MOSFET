#include "WifiModule.h"

WifiModule::WifiModule( int _port ) : port{ _port }, server( _port ) {
    using namespace std;
}
WifiModule& WifiModule::config(
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
}