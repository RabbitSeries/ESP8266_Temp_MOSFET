#include <LittleFS.h>

#include <iomanip>
#include <sstream>

#include "ArduinoJson.h"
#include "TemperatureModule.h"
#include "TimerModule.h"
#include "WifiModule.h"
#include "utils.h"

namespace Data {
    unsigned long time_offset = 0;
}

namespace Modules {
    WifiModule* wifimodule = nullptr;
    TemperatureModule* t_module = nullptr;
    TimerModule* timer_module = nullptr;
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
        t_module = new TemperatureModule( D0, D1, 32, 34 );
        t_module->config( true ).begin();
    }
    void handleMoudles() {
        wifimodule  ->run();
        handleTemperature();
        if ( timer_module ) {
            timer_module->run();
        }
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
    wifimodule->bind_restful( "/set", []() {
        if ( wifimodule->server.method() != HTTP_POST ) {
            wifimodule->server.send( 405, "application/json", "{\"error\":\"Use POST\"}" );
            return;
        }
        String body = wifimodule->server.arg( "plain" );
        JsonDocument doc;
        DeserializationError err = deserializeJson( doc, body );
        if ( err ) {
            wifimodule->server.send( 400, "application/json", "{\"error\":\"Invalid JSON\"}" );
            return;
        }
        int syncTime = doc["syncTime"] | -1;
        int beginTime = doc["startTime"] | -1;
        int duration = doc["duration"] | -1;
        Serial.printf( "Received number via JSON: {syncTime: %d}\n", syncTime );
        Serial.printf( "Received number via JSON: {startTime: %d}\n", beginTime );
        Serial.printf( "Received number via JSON: {duration: %d}\n", duration );
        Data::time_offset = syncTime;
        if ( timer_module )
            delete timer_module;
        timer_module = new TimerModule(
            []() {
                using namespace Data;
                return time_offset + millis();
            },
            utils::HHMMSS2Millis( beginTime ),
            utils::HHMMSS2Millis( duration ) );
        timer_module->begin();
        JsonDocument res;
        res["syncTime"] = utils::HHMMSS( syncTime );
        res["beginTime"] = utils::HHMMSS( beginTime );
        res["duration"] = utils::HHMMSS( duration );
        String response;
        serializeJson( res, response );
        wifimodule->server.send( 200, "application/json", response );
    } );
    pinMode( LED_BUILTIN, OUTPUT );
    digitalWrite( LED_BUILTIN, HIGH );
}

void loop() {
    Modules::handleMoudles();
}