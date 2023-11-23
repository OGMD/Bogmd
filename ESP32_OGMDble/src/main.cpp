#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <base64.h>

// BLE SECTION
BLEServer *pServer = NULL;

BLECharacteristic *message_characteristic = NULL;
BLECharacteristic *box_characteristic = NULL;

String boxValue = "0";
String state = "1";
String encoded = base64::encode(state);
// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"

#define MESSAGE_CHARACTERISTIC_UUID "6d68efe5-04b6-4a85-abc4-c2670b7bf7fd"
#define BOX_CHARACTERISTIC_UUID "f27b53ad-c63d-49a0-8c0f-9f297e6cc520"

//Definir pines de componenetes
#define LED 2 //lED INTEGRADO DE LA PLACA ESP32
const int potPin = 34;

//variables del programa
int potValue = 0;

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer){
    Serial.println("Connected");
  };
  void onDisconnect(BLEServer *pServer){
    Serial.println("Disconnected");
    pServer->startAdvertising();
  }
};

class CharacteristicsCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic){
    Serial.print("Value Written ");
    Serial.println(pCharacteristic->getValue().c_str());
    String n = base64::encode(pCharacteristic->getValue().c_str());
    Serial.println(n);
    if(n == "MA=="){
      Serial.println("Apaga el sistema");
      digitalWrite(LED,LOW);
    }
    if(n == "MQ=="){
      Serial.println("Prende el sistema");
      digitalWrite(LED,HIGH);
    }
    if (pCharacteristic == box_characteristic){
      boxValue = pCharacteristic->getValue().c_str();
      box_characteristic->setValue(const_cast<char *>(boxValue.c_str()));
      box_characteristic->notify();
    }
  }
};

void setup()
{
  Serial.begin(115200);
  pinMode(LED,OUTPUT);
  // Create the BLE Device
  BLEDevice::init("BLEExample");
  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);
  delay(100);

  // Create a BLE Characteristic
  message_characteristic = pService->createCharacteristic(
      MESSAGE_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);

  box_characteristic = pService->createCharacteristic(
      BOX_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_NOTIFY |
          BLECharacteristic::PROPERTY_INDICATE);

  // Start the BLE service
  pService->start();

  // Start advertising
  pServer->getAdvertising()->start();

  message_characteristic->setValue("Message one");
  message_characteristic->setCallbacks(new CharacteristicsCallbacks());

  box_characteristic->setValue("0");
  box_characteristic->setCallbacks(new CharacteristicsCallbacks());

  Serial.println("Waiting for a client connection to notify...");
}

void loop()
{
 /*  message_characteristic->setValue("Message one");
  message_characteristic->notify();

  delay(1000);

  message_characteristic->setValue("Message Two");
  message_characteristic->notify(); */
  potValue = analogRead(potPin);
  int valor_map = map(potValue,0,4095,0,100);
  Serial.println(valor_map);
  String data = String(valor_map);
  delay(100);
  message_characteristic->setValue(data.c_str());
  message_characteristic->notify();
  delay(100);
}