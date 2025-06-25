#include <ArduinoJson.h>
#include <LittleFS.h>

#include <iomanip>
#include <set>
#include <sstream>
#include <utility>

#include "TemperatureModule.h"
#include "TimerModule.h"
#include "WifiModule.h"
#include "utils.h"
namespace Modules {
    namespace dataTypes {
        std::set<String> controllers{ "TimerController", "TemperatureController" };  // TODO Store all these in a const char * varaible? for context consistency
        std::set<String> request_types{ "get", "set" };
        std::vector<String> timer_datas{ "syncTime", "startTime", "duration" };
        std::vector<String> temperature_datas{ "lowerTemp", "upperTemp" };
        bool verifyConnection( JsonDocument const& doc ) {
            return doc["controller"].is<JsonVariantConst>() && doc["request_type"].is<JsonVariantConst>();
        }
        bool verifyTimerData( JsonDocument const& doc ) {
            return std::all_of( timer_datas.begin(), timer_datas.end(), [&doc = std::as_const( doc )]( const String& v ) { return doc[v].is<JsonVariantConst>(); } );
        }
        bool verifyTempData( JsonDocument const& doc ) {
            return std::all_of( temperature_datas.begin(), temperature_datas.end(), [&doc = std::as_const( doc )]( const String& v ) { return doc[v].is<JsonVariantConst>(); } );
        }
    };  // namespace dataTypes

    FAN fan{ D0 };
    float lower_temp = 32, upper_temp = 35;
    unsigned long time_offset = 0;
    WifiModule* wifimodule = nullptr;
    TemperatureModule* t_module = nullptr;
    TimerModule* timer_module = nullptr;
    std::optional<LoopModule*> controller = std::nullopt;
    unsigned long getRealTime() {
        return time_offset + utils::elapsed();
    }
    void setupModules() {
        wifimodule = new WifiModule();
        wifimodule->configAP().begin();
        t_module = new TemperatureModule( D1 );
        t_module->begin();
        timer_module = new TimerModule(
            getRealTime, 0, 0, []() { Serial.println( "Timer duration finished" ); } );
        controller = t_module;
    }
    void handleMoudles() {
        static unsigned long beginTime = 0;
        wifimodule->run();
        if ( controller ) {
            controller.value()->run();
        }
        if ( controller == t_module ) {
            if ( !fan.status && t_module->currentTemp() >= upper_temp ) {
                fan.ON();
            } else if ( fan.status && t_module->currentTemp() <= lower_temp ) {
                fan.OFF();
            }
        } else if ( controller == timer_module ) {
            if ( !fan.status && timer_module->isTriggering() ) {
                fan.ON();
            } else if ( fan.status && !timer_module->isTriggering() ) {
                fan.OFF();
            }
        }
        if ( millis() - beginTime > 2000 ) {
            beginTime = millis();
            Serial.println( "" );
            Serial.printf( "Current timer status: %d\n", timer_module->isTriggering() );
            Serial.printf( "Current fan status: %d\n", fan.status );
            Serial.printf( "Current temperature: %.2f\n", t_module->currentTemp() );
        }
    }
    void responseTimerController( JsonDocument& doc ) {
        doc["currentTime"] = utils::Millis2HHMMSSStr( getRealTime() ).c_str();
    }
    void responseTempController( JsonDocument& doc ) {
        doc["currentTemp"] = t_module->currentTemp();
    }
    bool configTimerController( JsonDocument& doc ) {
        if ( !dataTypes::verifyTimerData( doc ) ) {
            Serial.println( "Verification failed" );
            return false;
        }
        unsigned long syncTime = utils::HHMMSS2Millis( doc["syncTime"].as<unsigned long>() );
        unsigned long beginTime = utils::HHMMSS2Millis( doc["startTime"].as<unsigned long>() );
        unsigned long duration = utils::HHMMSS2Millis( doc["duration"].as<unsigned long>() );
        time_offset = syncTime;
        utils::syncTime();
        timer_module->config( beginTime, duration );
        return true;
    }
    bool configTempController( JsonDocument& doc ) {
        if ( !dataTypes::verifyTempData( doc ) ) {
            Serial.println( "Verification failed" );
            return false;
        }
        lower_temp = doc["lowerTemp"].as<float>();
        upper_temp = doc["upperTemp"].as<float>();
        return true;
    }
    void bind_restful_apis() {
        wifimodule->bind_restful( "/", []() {
            // wifimodule->server.client().setTimeout( 20000 );
            Serial.println( "Pending connection" );
            File file = LittleFS.open( "/index.html", "r" );
            if ( !file ) {
                Modules::wifimodule->server.send( 500, "text/plain", "Failed to load index.html" );
                return;
            }
            Modules::wifimodule->server.streamFile( file, "text/html" );
            file.close();
        } );
        wifimodule->bind_restful( "/on", []() {
            Serial.println( "Pending connection" );
            controller = std::nullopt;
            fan.ON();
            wifimodule->server.send( 200, "text/plain", "Dropped all controllers, fan is ON!" );
        } );
        wifimodule->bind_restful( "/off", []() {
            Serial.println( "Pending connection" );
            controller = std::nullopt;
            fan.OFF();
            wifimodule->server.send( 200, "text/plain", "Dropped all controllers, fan is OFF!" );
        } );
        wifimodule->bind_restful( "/connection", []() {
            Serial.println( "Pending connection" );
            String response;
            std::optional<JsonDocument> pendRes = wifimodule->pendJson();
            if ( pendRes && pendRes.value()["ssid"].is<JsonVariant>() && pendRes.value()["password"].is<JsonVariant>() ) {
                JsonDocument& doc = pendRes.value();
                wifimodule->startConnection( doc["ssid"].as<String>(), doc["password"].as<String>() );
                doc["message"] = "connection started";
                serializeJson( doc, response );
                wifimodule->server.send( 200, "application/json", response );
            } else {
                JsonDocument doc;
                doc["DHCP IP"] = wifimodule->DHCPIP();
                doc["DHCP gateway"] = WiFi.gatewayIP().toString();
                serializeJson( doc, response );
                wifimodule->server.send( 200, "application/json", response );
            }
        } );
        const auto dataApi = []() {
            Serial.println( "Pending connection" );
            if ( wifimodule->server.method() != HTTP_POST && wifimodule->server.method() != HTTP_PUT ) {
                wifimodule->server.send( 405, "application/plain", "error: Use POST/PUT" );
                return;
            }
            std::optional<JsonDocument> pendRes = wifimodule->pendJson();
            if ( !pendRes || !dataTypes::verifyConnection( pendRes.value() ) ) {
                Serial.println( "Connection verification failed" );
                wifimodule->server.send( 400, "application/json", R"({"error":"Bad JSON"})" );
                return;
            }
            JsonDocument& doc = pendRes.value();
            String response;
            serializeJson( doc, response );
            Serial.println( response );
            String curController = doc["controller"].as<String>(), requestType = doc["request_type"].as<String>();
            bool success_status = true;
            if ( !dataTypes::controllers.contains( curController ) || !dataTypes::request_types.contains( requestType ) ) {
                Serial.println( String( "Bad dataTypes" ) );
                success_status = false;
            }
            if ( success_status ) {
                JsonDocument resDoc;
                if ( requestType == "get" ) {
                    if ( curController == "TimerController" ) {
                        responseTimerController( resDoc );
                    } else {
                        responseTempController( resDoc );
                    }
                    serializeJson( resDoc, response );
                } else {
                    if ( curController == "TimerController" ) {
                        controller = timer_module;
                        success_status = configTimerController( doc );
                    } else {
                        controller = t_module;
                        success_status = configTempController( doc );
                    }
                }
            }
            if ( success_status ) {
                wifimodule->server.send( 200, "application/json", response );
            } else {
                Serial.println( String( "Error parsing json: " ) + response );
                wifimodule->server.send( 400, "text/plain", "Error parsing json" + response );
            }
        };
        wifimodule->bind_restful( "/set", dataApi );
        wifimodule->bind_restful( "/data", dataApi );
    }
}  // namespace Modules

void setup() {
    Serial.begin( 115200 );
    LittleFS.begin();
    Modules::setupModules();
    using namespace Modules;
    wifimodule->printNetworkInfo();
    bind_restful_apis();
    pinMode( LED_BUILTIN, OUTPUT );
    digitalWrite( LED_BUILTIN, HIGH );
}

void loop() {
    Modules::handleMoudles();
}