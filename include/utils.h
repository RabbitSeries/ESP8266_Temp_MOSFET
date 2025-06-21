#pragma once
#include <WString.h>

#include <iomanip>
#include <sstream>
namespace utils {
    String HHMMSS( int time ) {
        int hh = time / 10000, mm = time / 100 % 100, ss = time % 100;
        std::stringstream iss;
        iss << std::setfill( '0' )
            << std::setw( 2 ) << hh << ":"
            << std::setw( 2 ) << mm << ":"
            << std::setw( 2 ) << ss;
        return iss.str().c_str();
    }
    unsigned long H2Millis( unsigned long hours ) {
        return hours * 3600 * 1000;
    }
    unsigned long M2Millis( unsigned long minutes ) {
        return minutes * 60 * 1000;
    }
    unsigned long HHMMSS2Millis( int HHMMSS ) {
        return H2Millis( HHMMSS / 10000 ) + M2Millis( HHMMSS / 100 % 100 ) + HHMMSS % 100 * 1000;
    }
}  // namespace utils