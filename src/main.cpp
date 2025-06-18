#include <LittleFS.h>

#include <thread>

#include "TemperatureModule.h"
#include "WifiModule.h"
namespace Modules {
    WifiModule* wifimodule = nullptr;
    TemperatureModule* t_module = nullptr;
    void handleWifi() {
        wifimodule->run();
    }
    void handleTemperature() {
        t_module->run();
        static unsigned long beginTime = 0;
        if ( millis() - beginTime > 2000 ) {
            beginTime = millis();
            Serial.printf( "Current fan status: %d", t_module->fan.status );
            Serial.println( "" );
            Serial.printf( "Current temperature: %.2f", t_module->current() );
            Serial.println( "" );
        }
    }
    void setupModules() {
        wifimodule = new WifiModule();
        wifimodule->config().begin();
        t_module = new TemperatureModule( D0, D1 );
        t_module->config( false ).begin();
    }
    void handleMoudles() {
        handleWifi();
        handleTemperature();
    }
}  // namespace Modules
void setup() {
    Serial.begin( 115200 );
    LittleFS.begin();
    Modules::setupModules();
    using namespace Modules;
    wifimodule->printNetworkInfo();
    wifimodule->bind_restful( "/", []() {
        File file = LittleFS.open( "/index.html", "r" );
        if ( !file ) {
            Modules::wifimodule->server.send( 500, "text/plain", "Failed to load index.html" );
            return;
        }
        Modules::wifimodule->server.streamFile( file, "text/html" );
        file.close();
    } );
    wifimodule->bind_restful( "/on", []() {
        t_module->fan.ON();
        wifimodule->server.send( 200, "text/plain", "ON!" );
    } );
    wifimodule->bind_restful( "/off", []() {
        t_module->fan.OFF();
        wifimodule->server.send( 200, "text/plain", "OFF!" );
    } );
}
void loop() {
    Modules::handleMoudles();
}