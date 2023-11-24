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

//Las definiciones de pines debajo de este enunciado
//no han sido probadas pues no se tienen los componentes exactos
//favor de modificar los valores a su conveniencia

//El electronivel debe tener un voltaje de entre 0-3.3v para
//La lectura del esp32 maximo 5V para la entrada del ADC de los pines de entrada del ESP32
//Revisar el Pinout del ESP32-wroom o el modelo de su SOC
const int electronivel = 5;//GPIO 5 o pin D5
const int motoBomba = 18;//GPIO 18 = pin D18
const int motorLimpiador = 19;//GPIO 19 = pinD19
float volt;
float ntu;



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

    //Codigo de ejemplo se puede reemplazar a sus valores de medicion
    //-----------------------------------------
    if(n == "MA=="){
      Serial.println("Apaga el sistema");
      digitalWrite(LED,LOW);
    }
    if(n == "MQ=="){
      Serial.println("Prende el sistema");
      digitalWrite(LED,HIGH);
      if(ntu >= 3000){
        Serial.println("Agua turbia");
        digitalWrite(motoBomba,HIGH); //High o Low dependiendo del funcionamiento de sus relays
        digitalWrite(motorLimpiador,HIGH);//High o Low dependiendo del funcionamiento de sus relays
      }if(ntu<3000 && ntu>1200){
        Serial.println("Agua no tan limpia");
        digitalWrite(motoBomba,HIGH); //High o Low dependiendo del funcionamiento de sus relays
        digitalWrite(motorLimpiador,HIGH);//High o Low dependiendo del funcionamiento de sus relays
      }else{
        Serial.println("Agua limpia");
        digitalWrite(motoBomba,LOW); //High o Low dependiendo del funcionamiento de sus relays
        digitalWrite(motorLimpiador,LOW);//High o Low dependiendo del funcionamiento de sus relays
      }
    }
    if (pCharacteristic == box_characteristic){
      boxValue = pCharacteristic->getValue().c_str();
      box_characteristic->setValue(const_cast<char *>(boxValue.c_str()));
      box_characteristic->notify();
    }
  }
};

float redondear(float sensVal, int decimales){
  float multiplo = powf(10.0f, decimales);
  sensVal = roundf(sensVal*multiplo)/multiplo;
  return sensVal;
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED,OUTPUT);
  pinMode(motoBomba,OUTPUT);
  pinMode(motorLimpiador,OUTPUT);
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
///lEER PORFAVOR
//las pruebas de medicion del sensor dieron muchos errores de variacion por que el
//sensor no se estabilizaba no alcanzaba valores maximos y tampoco valores minimos
//Como recomendacion la lectura digital del sensor es mas estable que la analogica
//La desventaja es comprar otro modulo que ofrezca esta funcion de lectura digital.
//--------------------------------------
//--------------------------------
//-------------------------


volt = 0;
for(int i=0;i<800;i++){
  volt += ((float)analogRead(potPin)/4096)*3.3*1.66; // Esta formula puede cambiar dependiendo del Controlador que se use
  //Revisar bien el tipo de ADC que se tenga si es de 10 bits o de 12
}

volt = volt/800;
volt= redondear(volt,2);
if(volt < 2.5){
  ntu = 3000;
}else{
  //y = -1120.5*x^2+5742.3*x-4352.9 --- Escuacion de relacion x = voltsSensor
  ntu = -1120.5*sq(volt)+5742.3*volt-4353.8; //Esta ecuacion es la relacion entre turbidez y voltaje
}

Serial.print(volt);
Serial.print("---");
Serial.println(ntu);
String data = String(ntu);
message_characteristic->setValue(data.c_str());
message_characteristic->notify();
delay(100);


 /*potValue = analogRead(potPin);
  int valor_map = map(potValue,0,700,100,0);
  //Serial.println(potValue);
  Serial.println(valor_map);
  String data = String(valor_map);
  delay(100);
  message_characteristic->setValue(data.c_str());
  message_characteristic->notify();
  delay(100);*/
}


