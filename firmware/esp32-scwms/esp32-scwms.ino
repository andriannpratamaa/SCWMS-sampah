#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

#define WIFI_SSID      "MOZAA"
#define WIFI_PASSWORD  "ANDRIAN02"

#define SERVER_BASE    "http://10.207.65.176:3000/api/esp32"
#define API_KEY        "rahasia123"
#define PLAT_NOMOR     "B 1234 ABC"

#define GPS_BAUD       9600
#define GPS_RX_PIN     17
#define GPS_TX_PIN     16

#define TRIG_PIN       18
#define ECHO_PIN       5
#define BUZZER_PIN     13

#define SERVER_IP       IPAddress(10, 207, 65, 176)
#define SERVER_PORT     3000

#define GPS_INTERVAL_MS      30000UL
#define VOLUME_INTERVAL_MS   30000UL
#define LCD_UPDATE_MS        5000UL

#define LCD_ADDR    0x27
#define LCD_COLS    16
#define LCD_ROWS    2

LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

unsigned long lastGpsSend = 0;
unsigned long lastVolumeSend = 0;
unsigned long lastLcdUpdate = 0;
int lcdScreen = 0;
float lastDistance = -1;

void connectWiFi();
void buzzerBeep(int times, int delayMs);
bool testTcpConnection();
float measureDistance();
void sendGps();
void sendVolume(float jarakSensor);

void setup() {

    Serial.begin(115200);

    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(TRIG_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);

    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("  WELCOME TO  ");
    lcd.setCursor(0, 1);
    lcd.print("   SCWMS   ");
    delay(2000);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Connecting WiFi");
    lcd.setCursor(0, 1);
    lcd.print("Please wait...");

    connectWiFi();
    buzzerBeep(2, 150);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());
    delay(2000);

    Serial.println("===== ESP32 SCWMS =====");
}

void loop() {

    while (gpsSerial.available()) {
        gps.encode(gpsSerial.read());
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected...");
        connectWiFi();
    }

    unsigned long now = millis();

    if (now - lastGpsSend >= GPS_INTERVAL_MS) {

        if (gps.location.isValid() &&
            gps.location.age() < 5000 &&
            gps.satellites.value() >= 4) {

            sendGps();

        } else {

            Serial.println("GPS belum mendapatkan fix...");
            Serial.printf("Satelit : %d\n", gps.satellites.value());

        }

        lastGpsSend = now;
    }

    if (now - lastVolumeSend >= VOLUME_INTERVAL_MS) {

        float distance = measureDistance();

        if (distance > 0) {

            lastDistance = distance;

            Serial.printf("Jarak sensor: %.1f cm\n", distance);

            sendVolume(distance);

        } else {

            Serial.println("Ultrasonic gagal membaca.");

        }

        lastVolumeSend = now;
    }

    if (now - lastLcdUpdate >= LCD_UPDATE_MS) {

        lcd.clear();

        if (lcdScreen == 0) {

            lcd.setCursor(0, 0);
            lcd.print("Lokasi:");

            lcd.setCursor(0, 1);
            if (gps.location.isValid()) {
                char latStr[10], lngStr[10];
                dtostrf(gps.location.lat(), 7, 4, latStr);
                dtostrf(gps.location.lng(), 7, 4, lngStr);
                lcd.print(latStr);
                lcd.print(",");
                lcd.print(lngStr);
            } else {
                lcd.print("Mencari GPS...");
            }

            lcdScreen = 1;

        } else {

            lcd.setCursor(0, 0);
            lcd.print("Tinggi Sampah:");

            lcd.setCursor(0, 1);
            if (lastDistance > 0) {
                lcd.print(lastDistance, 1);
                lcd.print(" cm");
            } else {
                lcd.print("Mengukur...");
            }

            lcdScreen = 0;

        }

        lastLcdUpdate = now;

    }

}

void connectWiFi() {

    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.persistent(true);

    if (WiFi.status() == WL_CONNECTED)
        return;

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting WiFi");

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {

        Serial.print(".");
        delay(500);
        attempts++;

    }

    if (WiFi.status() == WL_CONNECTED) {

        Serial.println();
        Serial.println("WiFi Connected");
        Serial.print("IP : ");
        Serial.println(WiFi.localIP());
        Serial.print("Gateway : ");
        Serial.println(WiFi.gatewayIP());
        Serial.print("Subnet : ");
        Serial.println(WiFi.subnetMask());
        Serial.print("DNS : ");
        Serial.println(WiFi.dnsIP());
        Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());

    } else {

        Serial.println();
        Serial.println("WiFi Gagal!");

    }

}

float measureDistance() {

    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);

    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);

    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH, 30000);

    if (duration == 0)
        return -1;

    float distance = duration * 0.0343 / 2.0;

    if (distance < 2 || distance > 400)
        return -1;

    return distance;

}

void buzzerBeep(int times, int delayMs) {
    for (int i = 0; i < times; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(delayMs);
        digitalWrite(BUZZER_PIN, LOW);
        if (i < times - 1) delay(delayMs);
    }
}

bool testTcpConnection() {
    WiFiClient client;

    if (client.connect(SERVER_IP, SERVER_PORT)) {
        client.stop();
        Serial.println("TCP test: OK");
        return true;
    }

    client.stop();

    WiFiClient gwTest;
    if (gwTest.connect(IPAddress(192, 168, 0, 1), 80)) {
        gwTest.stop();
        Serial.println("Gateway 80: OK");
    } else {
        Serial.println("Gateway 80: GAGAL");
    }
    gwTest.stop();

    return false;
}

void sendGps() {

    if (WiFi.status() != WL_CONNECTED) {

        Serial.println("WiFi putus, skip GPS.");
        return;

    }

    if (!testTcpConnection()) {
        Serial.println("TCP test gagal, skip.");
        return;
    }

    HTTPClient http;

    http.setTimeout(5000);

    http.begin(String(SERVER_BASE) + "/tracking");

    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");
    http.addHeader("X-API-Key", API_KEY);

    JsonDocument doc;

    doc["plat_nomor"] = PLAT_NOMOR;
    doc["latitude"] = gps.location.lat();
    doc["longitude"] = gps.location.lng();

    String body;

    serializeJson(doc, body);

    int code = http.POST(body);

    Serial.println("========== GPS ==========");
    Serial.printf("HTTP : %d\n", code);

    if (code > 0) {

        Serial.println(http.getString());

    } else {

        Serial.printf("Error: %s\n", http.errorToString(code).c_str());

    }

    Serial.printf("Latitude  : %.6f\n", gps.location.lat());
    Serial.printf("Longitude : %.6f\n", gps.location.lng());

    http.end();

}

void sendVolume(float jarakSensor) {

    if (WiFi.status() != WL_CONNECTED) {

        Serial.println("WiFi putus, skip Volume.");
        return;

    }

    if (!testTcpConnection()) {
        Serial.println("TCP test gagal, skip Volume.");
        return;
    }

    HTTPClient http;

    http.setTimeout(5000);

    http.begin(String(SERVER_BASE) + "/volume");

    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");
    http.addHeader("X-API-Key", API_KEY);

    JsonDocument doc;

    doc["plat_nomor"] = PLAT_NOMOR;
    doc["jarak_sensor"] = jarakSensor;

    String body;

    serializeJson(doc, body);

    int code = http.POST(body);

    Serial.println("======= VOLUME =======");
    Serial.printf("HTTP : %d\n", code);

    if (code > 0) {

        Serial.println(http.getString());

    } else {

        Serial.printf("Error: %s\n", http.errorToString(code).c_str());

    }

    Serial.printf("Jarak Sensor : %.1f cm\n", jarakSensor);

    http.end();

}