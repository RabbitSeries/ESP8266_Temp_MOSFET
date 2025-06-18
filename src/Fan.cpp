#include <Fan.h>
FAN::FAN( int MOSFET_G_PIN ) : PIN{ MOSFET_G_PIN } {
  pinMode( PIN, OUTPUT );
  digitalWrite( PIN, LOW );
}
void FAN::ON() {
  digitalWrite( PIN, HIGH );
  status = true;
}
void FAN::OFF() {
  digitalWrite( PIN, LOW );
  status = false;
}
