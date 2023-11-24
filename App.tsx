 import React, {useState} from 'react';
import {
  TouchableOpacity,
  Button,
  PermissionsAndroid,
  View,
  Text,
  Image,
  ActivityIndicator
} from 'react-native';
import base64 from 'react-native-base64';
//import CheckBox from '@react-native-community/checkbox';
import {BleManager, Device} from 'react-native-ble-plx';
import {styles} from './Styles/styles';
import {LogBox} from 'react-native';

import ButtonC from './Components/Button';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const BLTManager = new BleManager();

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

const MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
const BOX_UUID = 'f27b53ad-c63d-49a0-8c0f-9f297e6cc520';

function StringToBool(input: String) {
  if (input == '1') {
    return true;
  } else {
    return false;
  }
}

function BoolToString(input: boolean) {
  if (input == true) {
    return '1';
  } else {
    return '0';
  }
}

export default function App() {
  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState<Device>();

  const [message, setMessage] = useState('No conectado');
  const [boxvalue, setBoxValue] = useState(false);
  const [toogle, setToogle] = useState(false);

  const toogleFunction = () => {
   setToogle(!toogle);
  }

  // Scans availbale BLT Devices and then call connectDevice
  async function scanDevices() {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permission Localisation Bluetooth',
        message: 'Requirement for Bluetooth',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then(answere => {
      console.log('scanning');
      // display the Activityindicator

      BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error);
        }

        if (scannedDevice && scannedDevice.name == 'BLEExample') {
          BLTManager.stopDeviceScan();
          connectDevice(scannedDevice);
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        BLTManager.stopDeviceScan();
      }, 5000);
    });
  }
  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    console.log('Disconnecting start');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');
        BLTManager.cancelTransaction('nightmodetransaction');

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
          console.log('DC completed'),
        );
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setIsConnected(false);
      }
    }
  }

  //Function to send data to ESP32
  async function sendBoxValue(value: boolean) {
    BLTManager.writeCharacteristicWithResponseForDevice(
      connectedDevice?.id!,
      SERVICE_UUID,
      BOX_UUID,
      base64.encode(value.toString()),
    ).then(characteristic => {
      console.log('Boxvalue changed to :', base64.decode(characteristic.value!));
    });
  }
  //Connect the device and start monitoring characteristics
  async function connectDevice(device: Device) {
    console.log('connecting to Device:', device.name);

    device
      .connect()
      .then(device => {
        setConnectedDevice(device);
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        //  Set what to do when DC is detected
        BLTManager.onDeviceDisconnected(device.id, (error, device) => {
          console.log('Device DC');
          setIsConnected(false);
        });

        //Read inital values

        //Message
        device
          .readCharacteristicForService(SERVICE_UUID, MESSAGE_UUID)
          .then(valenc => {
            setMessage(base64.decode(valenc?.value!));
          });

        //BoxValue
        device
          .readCharacteristicForService(SERVICE_UUID, BOX_UUID)
          .then(valenc => {
            setBoxValue(StringToBool(base64.decode(valenc?.value!)));
          });

        //monitor values and tell what to do when receiving an update

        //Message
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          MESSAGE_UUID,
          (error, characteristic) => {
            if (characteristic?.value != null) {
              setMessage(base64.decode(characteristic?.value));
              console.log(
                'Message update received: ',
                base64.decode(characteristic?.value),
              );
            }
          },
          'messagetransaction',
        );

        //BoxValue
        device.monitorCharacteristicForService(
          SERVICE_UUID,
          BOX_UUID,
          (error, characteristic) => {
            if (characteristic?.value != null) {
              setBoxValue(StringToBool(base64.decode(characteristic?.value)));
              console.log(
                'Box Value update received: ',
                base64.decode(characteristic?.value),
              );
            }
          },
          'boxtransaction',
        );

        console.log('Connection established');
      });
  }

  return (
    <View style={styles.main}>
      <View style={styles.header}>
         {/* Image 1 */}
         <Image style={styles.tinyLogo} source={require('./Images/digital-ocean.png')}/>
          <Text style={styles.HeaderTitle}>Home</Text>
        {/* Image 2 */}
        <Image style={styles.tinyBell} source={require('./Images/bell-regular.png')}/>
   </View>
      {/* Connect Button */}
      <View style={styles.connect}>
        <View style={styles.connectContainer}>
          <Text style={styles.title}>Bienvenido!</Text>
          <Text style={styles.subtitle}>
          Para comenzar a monitorear 
          su sistema pulse el boton de conectar.</Text>
        </View>
        <View style={styles.buttonContainer}>
         <TouchableOpacity >
            {!isConnected ? (
              <>
                  <ButtonC 
                  title='Conectar' 
                  onPress={() => {
                    scanDevices();
                  }} 
                  color='white'
                  width='70%'
                  height='50%'
                  borderRadius={30}
                  margin={15}
                  
                  />
              </>
              ) : (
            
                <ButtonC 
              title='Desconectar' 
              onPress={() => {
                disconnectDevice();
              }} 
              color='white'
              width='70%'
              height='50%'
              borderRadius={30}
              margin={15}
              />
                )}
          </TouchableOpacity>
        </View>
      </View>
      {/* Monitored Value */}
      <View style={styles.Monitoring}>
        {!isConnected ? (
          <>
          <Text style={styles.baseText}>
          {message}
          </Text>
          <Text style={styles.baseText2}>Esperando Conexion</Text>
          <ActivityIndicator size="large" color="0000ff" />
          </>
        ):(
          <>
            <Text style={styles.baseText3}>
              {message} NTU
            </Text>
          </>
        )
      }
      </View>
      {/* Checkbox */}
      <View style={styles.checkState}>

        <ButtonC 
              title={!toogle ? "Off" : "On"}
              onPress={() => {
                toogleFunction();
                console.log(typeof toogle);
                console.log(!toogle);
                sendBoxValue(BoolToString(!toogle));
                
              }} 
              color={!toogle ? "#EA906C" : "#9AD0C2"}
              width='25%'
              height='75%'
              borderRadius={20}
              fontSize={28}
           
          />
          <View style={styles.SisContainer}>
            {toogle ? (
              <>
                <Text style={styles.sistema}>Sistema de limpieza iniciado</Text>
                <Text>Favor de revisar el proceso</Text>
              </>
            ):(
              <>
                <Text style={styles.sistema}>Sistema de limpieza en paro</Text>
                <Text>Favor de revisar el proceso</Text>
              </>
            )}
          </View>
      </View>
      <View style={styles.devices}>
              <View style={styles.card}>
                <Text style={styles.sistema}>ElectroNivel</Text>
                <Text>Rotoplas</Text>
                <Text>110 - 220V</Text>
                <Image style={styles.tinyLogo2} source={require('./Images/bolt-lightning-solid.png')}/>
              </View>
              <View style={styles.card}>
              <Text style={styles.sistema}>MotoBomba</Text>
                <Text>Periferica, .5 Hp</Text>
                <Text>110V</Text>
                <Image style={styles.tinyLogo3} source={require('./Images/toolbox-solid.png')}/>
              </View>
      </View>
    </View>
  );
}

