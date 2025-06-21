#include "LoopModule.h"
#include "functional"
struct TimerModule : private LoopModule {
    using timer_handler = std::function<unsigned int( void )>;
    using trigger_handler = std::function<void( void )>;
    TimerModule( timer_handler, unsigned int _beginStamp = 0, unsigned int _durationMillis = 0 );
    void setBeginTime( unsigned long _beginStamp );
    void setDuration( unsigned long _duration );
    void begin() override;
    void run() override;

   private:
    timer_handler handler;
    unsigned int beginStamp, durationMillis;
    bool started = false, triggered = false;
};