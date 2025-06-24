#include "TemperatureModule.h"
TemperatureModule::TemperatureModule( uint8_t _TEMP_PIN )  // default parameter can only be stored in the class itself
    : TemeratrueWire{ _TEMP_PIN },
      sensors( &TemeratrueWire ) {
    pinMode( _TEMP_PIN, INPUT );
}
void TemperatureModule::begin() {
    sensors.begin();
}
float TemperatureModule::currentTemp() {
    return lastSyncedTemp;
}
void TemperatureModule::run() {
    sensors.requestTemperatures();
    float curTemp = sensors.getTempCByIndex( 0 );  // I have only one sensor
    std::swap( curTemp, lastSyncedTemp );
}