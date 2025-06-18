#pragma once
#include <Arduino.h>
struct FAN {
    int PIN = LED_BUILTIN;
    bool status = false;
    FAN( int );
    void ON();
    void OFF();
};