#include "TemperatureModule.h"
float TemperatureModule::current() {
    return _currentTemp;
}
TemperatureModule::TemperatureModule( uint8_t _FAN_PIN, uint8_t _TEMP_PIN, float lower_bound_t, float upper_bound_t )  // default parameter can only be stored in the class itself
    : fan{ _FAN_PIN },
      TemeratrueWire{ _TEMP_PIN },
      sensors( &TemeratrueWire ),
      FAN_OFF_TEMP{ lower_bound_t },
      FAN_ON_TEMP{ upper_bound_t } {
    pinMode( _TEMP_PIN, INPUT );
}
void TemperatureModule::begin() {
    if ( !_enableSensor ) {
        return;
    }
    sensors.begin();
}
TemperatureModule& TemperatureModule::config( bool enableSensor ) {
    this->_enableSensor = enableSensor;
    return *this;
}
void TemperatureModule::run() {
    if ( !_enableSensor ) {
        return;
    }
    sensors.requestTemperatures();
    float curTemp = sensors.getTempCByIndex( 0 );  // I have only one sensor
    if ( curTemp >= FAN_ON_TEMP && !fan.status ) {
        fan.ON();
    } else if ( curTemp <= FAN_OFF_TEMP && fan.status ) {
        fan.OFF();
    }
    std::swap( curTemp, _currentTemp );
}