import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

interface QRScannerScreenProps {
  navigation?: any;
}

export default function QRScannerScreen({ navigation }: QRScannerScreenProps) {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const data = codes[0].value;
        
        if (!data) return;
        
        // Kiểm tra xem QR code có chứa thông tin bàn không
        // Giả sử QR code chứa JSON: {"table_id": 1, "table_name": "Bàn 1"}
        try {
          const qrData = JSON.parse(data);
          if (qrData.table_id) {
            navigation?.navigate('TableManagement', { 
              tableId: qrData.table_id,
              tableName: qrData.table_name || `Bàn ${qrData.table_id}`
            });
            return;
          }
        } catch (error) {
          // Nếu không phải JSON, thử parse table_id từ string
          const tableIdMatch = data.match(/table[_-]?id[=:]?(\d+)/i);
          if (tableIdMatch) {
            navigation?.navigate('TableManagement', { 
              tableId: parseInt(tableIdMatch[1], 10),
              tableName: `Bàn ${tableIdMatch[1]}`
            });
            return;
          }
        }
        
        Alert.alert('Lỗi', 'QR code không hợp lệ. Vui lòng quét mã QR của bàn.');
      }
    }
  });

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerText}>
          Không tìm thấy camera
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.centerText}>
        Quét mã QR trên bàn để bắt đầu quản lý
      </Text>
      
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />
      
      <Text style={styles.buttonText}>
        Đưa camera vào mã QR trên bàn
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
    textAlign: 'center',
  },
  camera: {
    height: '100%',
  },
});
