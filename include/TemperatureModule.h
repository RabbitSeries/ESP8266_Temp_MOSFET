#pragma once
#include <DallasTemperature.h>
#include <Fan.h>
#include <OneWire.h>

#include "LoopModule.h"
struct TemperatureModule : private LoopModule {
    FAN fan;
    OneWire TemeratrueWire;
    DallasTemperature sensors;
    const float FAN_OFF_TEMP, FAN_ON_TEMP;
    float current();
    TemperatureModule( uint8_t _FAN_PIN, uint8_t _TEMP_PIN, float lower_bound_t = 28, float upper_bound_t = 28 );
    virtual void run();
    virtual void begin();
    TemperatureModule& config( bool enableSensor = true );

   private:
    float _currentTemp = 0.0;
    bool _enableSensor = true;
};