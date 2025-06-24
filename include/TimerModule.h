#include "LoopModule.h"
#include "functional"
struct TimerModule : public LoopModule {
    using timer_handler = std::function<unsigned long( void )>;
    using timeout_handler = std::function<void( void )>;
    TimerModule( timer_handler, unsigned long _beginStamp = 0, unsigned long _durationMillis = 0, timeout_handler const& callback = []() {} );
    bool isTriggering();
    void config( unsigned long _beginStamp = 0, unsigned long _durationMillis = 0 );
    void begin() override;
    void run() override;
    unsigned long& getBeginMillis();
    unsigned long& getDurationMillis();
    timeout_handler& get_timeout_handler();

    private:
    timer_handler t_handler;
    bool triggering = false;
    unsigned long beginMillis, durationMillis;
    timeout_handler callback;
};