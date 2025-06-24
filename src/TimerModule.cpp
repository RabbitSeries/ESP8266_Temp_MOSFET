#include "TimerModule.h"

TimerModule::TimerModule( timer_handler handler, unsigned long _beginStamp, unsigned long _durationMillis, timeout_handler const& callback )
    : t_handler{ move( handler ) },
      beginMillis{ _beginStamp },
      durationMillis{ _durationMillis },
      callback{ callback } {
}
bool TimerModule::isTriggering() {
    return triggering;
}
void TimerModule::config( unsigned long _beginStamp, unsigned long _durationMillis ) {
    triggering = false;
    beginMillis = _beginStamp;
    durationMillis = _durationMillis;
}
void TimerModule::begin() {
    triggering = false;
}
void TimerModule::run() {
    unsigned int curMillis = t_handler();
    bool curStatus = triggering;
    triggering = curMillis > beginMillis && curMillis - beginMillis < durationMillis;
    if ( curStatus && !triggering ) {
        callback();
    }
}
unsigned long& TimerModule::getBeginMillis() {
    return beginMillis;
}
unsigned long& TimerModule::getDurationMillis() {
    return durationMillis;
}
TimerModule::timeout_handler& TimerModule::get_timeout_handler() {
    return callback;
}
