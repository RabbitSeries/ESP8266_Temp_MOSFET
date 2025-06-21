#include "TimerModule.h"

TimerModule::TimerModule( timer_handler handler, unsigned int _beginStamp, unsigned int _durationMillis )
    : handler{ move( handler ) },
      beginStamp{ _beginStamp },
      durationMillis{ _durationMillis } {
}

void TimerModule::setBeginTime( unsigned long millis ) {
    beginStamp = millis;
}
void TimerModule::setDuration( unsigned long _duration ) {
    durationMillis = _duration;
}
void TimerModule::begin() {
    started = true;
    triggered = false;
}

void TimerModule::run() {
    if ( !started ) {
        return;
    }
    unsigned int curMillis = handler();
    triggered = curMillis > beginStamp && curMillis - beginStamp < durationMillis;
}