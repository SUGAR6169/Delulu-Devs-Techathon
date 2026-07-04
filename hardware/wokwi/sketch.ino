// ====================================================================
// DESIGN NOTE: LEDs simulate actual office fans and lights for safety
// and evaluation clarity within the koncept environment.
// ====================================================================

// Output Device Pin Mappings
const int fan1Pin = 2;
const int fan2Pin = 3;
const int light1Pin = 4;
const int light2Pin = 5;
const int light3Pin = 6;

// Input Toggle Switch Pin Mappings (As Requested)
const int fan1Switch = 7;
const int fan2Switch = 8;
const int light1Switch = 9;
const int light2Switch = 10;
const int light3Switch = 11;

// Device State Registers
bool fan1State = false;
bool fan2State = false;
bool light1State = false;
bool light2State = false;
bool light3State = false;

void setup() {
  Serial.begin(115200);
  Serial.println("==================================================");
  Serial.println(" SMART OFFICE INPUT/OUTPUT CONTROL BUS RUNNING   ");
  Serial.println("==================================================");

  // Initialize Hardware Outputs
  pinMode(fan1Pin, OUTPUT);
  pinMode(fan2Pin, OUTPUT);
  pinMode(light1Pin, OUTPUT);
  pinMode(light2Pin, OUTPUT);
  pinMode(light3Pin, OUTPUT);

  // Initialize Input Wall Switches using Internal Pull-Up Topology
  pinMode(fan1Switch, INPUT_PULLUP);
  pinMode(fan2Switch, INPUT_PULLUP);
  pinMode(light1Switch, INPUT_PULLUP);
  pinMode(light2Switch, INPUT_PULLUP);
  pinMode(light3Switch, INPUT_PULLUP);

  printDashboard();
}

void loop() {
  bool actionDetected = false;

  // Read and Process Fan 1 State Change
  if (digitalRead(fan1Switch) == LOW) {
    fan1State = !fan1State;
    digitalWrite(fan1Pin, fan1State ? HIGH : LOW);
    actionDetected = true;
    delay(250); // Hardwired Debounce Window
  }

  // Read and Process Fan 2 State Change
  if (digitalRead(fan2Switch) == LOW) {
    fan2State = !fan2State;
    digitalWrite(fan2Pin, fan2State ? HIGH : LOW);
    actionDetected = true;
    delay(250); 
  }

  // Read and Process Light 1 State Change
  if (digitalRead(light1Switch) == LOW) {
    light1State = !light1State;
    digitalWrite(light1Pin, light1State ? HIGH : LOW);
    actionDetected = true;
    delay(250); 
  }

  // Read and Process Light 2 State Change
  if (digitalRead(light2Switch) == LOW) {
    light2State = !light2State;
    digitalWrite(light2Pin, light2State ? HIGH : LOW);
    actionDetected = true;
    delay(250); 
  }

  // Read and Process Light 3 State Change
  if (digitalRead(light3Switch) == LOW) {
    light3State = !light3State;
    digitalWrite(light3Pin, light3State ? HIGH : LOW);
    actionDetected = true;
    delay(250); 
  }

  if (actionDetected) {
    printDashboard();
  }
}

// System State Console Logging
void printDashboard() {
  Serial.println("\n[SYSTEM BUS STATE REPORT]");
  Serial.println("------------------------------------");
  Serial.print("Pin D2 -> Fan 1:   "); Serial.println(fan1State ? "[ON]" : "[OFF]");
  Serial.print("Pin D3 -> Fan 2:   "); Serial.println(fan2State ? "[ON]" : "[OFF]");
  Serial.print("Pin D4 -> Light 1: "); Serial.println(light1State ? "[ON]" : "[OFF]");
  Serial.print("Pin D5 -> Light 2: "); Serial.println(light2State ? "[ON]" : "[OFF]");
  Serial.print("Pin D6 -> Light 3: "); Serial.println(light3State ? "[ON]" : "[OFF]");
  Serial.println("------------------------------------");
}