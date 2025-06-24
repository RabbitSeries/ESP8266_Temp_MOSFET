#pragma once
#include <DallasTemperature.h>
#include <Fan.h>
#include <OneWire.h>

#include "LoopModule.h"
struct TemperatureModule : public LoopModule {
    TemperatureModule( uint8_t _TEMP_PIN );
    virtual void begin();
    virtual void run();
    float currentTemp();

    OneWire TemeratrueWire;
    DallasTemperature sensors;

   private:
    float lastSyncedTemp = -127.0;
};