#include <DallasTemperature.h>
#include <OneWire.h>

const int FAN_PIN = D4;      // GPIO2 (NodeMCU D4)
const int TEMP_PIN = D3;     // GPIO0 (NodeMCU D3)
const float FAN_ON = 39.5;   // Turn fan ON above this temp (°C)
const float FAN_OFF = 38.0;  // Turn fan OFF below this temp

OneWire oneWire = OneWire( TEMP_PIN );
DallasTemperature sensors = DallasTemperature( &oneWire );
bool fanState = false;
const long interval = 1000;  // Check interval (1 second)

void setup() {
  pinMode( FAN_PIN, OUTPUT );
  digitalWrite( FAN_PIN, LOW );
  pinMode( LED_BUILTIN, OUTPUT );
  digitalWrite( LED_BUILTIN, LOW );
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex( 0 );
  if ( tempC <= FAN_OFF ) {
    fanState = false;
  } else if ( tempC >= FAN_ON ) {
    fanState = true;
  }
  digitalWrite( LED_BUILTIN, fanState ? LOW : HIGH );  // LED LOW Effect
  digitalWrite( FAN_PIN, fanState ? HIGH : LOW );
  delay( interval );
}