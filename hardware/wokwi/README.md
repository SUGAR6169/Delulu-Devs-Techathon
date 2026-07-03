# Office Room Simulation - Wokwi

This directory contains a virtual hardware simulation representing our office nodes. Each node represents a single room featuring two fans and three lights. This setup is identical for all three rooms in the Delulu-Devs office environment.

## Purpose of this Simulation

- **ESP32 Core:** We use an ESP32 microcontroller to process five physical wall switches.
- **Relay Control:** The ESP32 drives five separate relay channels via GPIO pins.
- **Visual Feedback:** 
  - Three warm-white LEDs simulate the light fixtures.
  - Two blue LEDs simulate the fan circuits.
- **Power Calculation:** Our internal logic handles the electrical math: fans pull 60W, lights pull 15W.
- **Data Export:** The node outputs a JSON snapshot every second for seamless backend integration.

*Safety Note:* The browser simulator operates at safe logic levels. A physical deployment would require proper contactors for the fan circuits. Never connect mains electricity to an ESP32 without professional electrical supervision.

## How to use

1. Go to [Wokwi](https://wokwi.com/) and start a new ESP32 project.
2. Paste the contents of `diagram.json` and `sketch.ino` into the respective editors.
3. Hit play to start the simulation.
4. Toggle any of the five slide switches.
5. Watch the corresponding LED turn on, and see the JSON output in the Serial Monitor.

## Pin Configuration

| Load Type | Switch Pin | Relay Pin | Power Draw |
|---|---:|---:|---:|
| Fan 1 | GPIO 21 | GPIO 25 | 60W |
| Fan 2 | GPIO 22 | GPIO 26 | 60W |
| Light 1 | GPIO 23 | GPIO 27 | 15W |
| Light 2 | GPIO 18 | GPIO 32 | 15W |
| Light 3 | GPIO 19 | GPIO 33 | 15W |

All switches connect the input pins to ground when ON, avoiding floating states. Relay modules are isolated to protect the ESP32 logic level from the higher power loads.
