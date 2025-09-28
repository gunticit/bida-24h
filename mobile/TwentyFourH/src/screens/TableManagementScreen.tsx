import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sessions from '@api/sessions';
import * as Menus from '@api/menus';

interface TableManagementScreenProps {
  route?: {
    params: {
      tableId: number;
      tableName: string;
    };
  };
  navigation?: any;
}

export default function TableManagementScreen({ route, navigation }: TableManagementScreenProps) {
  const { tableId, tableName } = route?.params || { tableId: 1, tableName: 'Bàn 1' };
  const qc = useQueryClient();
  
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Lấy danh sách sessions cho bàn này
  const { data: sessions } = useQuery({
    queryKey: ['sessions', 'table', tableId],
    queryFn: () => Sessions.todayOrPlaying(),
  });

  // Lấy danh sách menu
  const { data: menus } = useQuery({
    queryKey: ['menus'],
    queryFn: () => Menus.available(),
  });

  // Tìm session hiện tại của bàn
  const currentSession = sessions?.find((s: any) => s.table_id === tableId && s.status === 'playing');

  // Mutation để tạo session mới
  const createSession = useMutation({
    mutationFn: () => Sessions.create({ table_id: tableId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setSessionStartTime(new Date());
      Alert.alert('Thành công', 'Đã bắt đầu session mới');
    },
  });

  // Mutation để kết thúc session
  const endSession = useMutation({
    mutationFn: () => Sessions.update(currentSession?.id, { status: 'ended', ended_at: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setSessionStartTime(null);
      setSessionDuration(0);
      Alert.alert('Thành công', 'Đã kết thúc session');
    },
  });

  // Mutation để thêm order
  const addOrder = useMutation({
    mutationFn: () => {
      if (!currentSession) throw new Error('Không có session đang hoạt động');
      return Sessions.addOrder(currentSession.id, { 
        menu_id: parseInt(selectedMenuId), 
        quantity: parseInt(orderQuantity) 
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setSelectedMenuId('');
      setOrderQuantity('1');
      Alert.alert('Thành công', 'Đã thêm món vào order');
    },
  });

  // Tính thời gian chơi
  useEffect(() => {
    if (currentSession && currentSession.started_at) {
      setSessionStartTime(new Date(currentSession.started_at));
    }
  }, [currentSession]);

  useEffect(() => {
    if (sessionStartTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setSessionDuration(diff);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionStartTime]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{tableName}</Text>
        <Text style={styles.subtitle}>ID: {tableId}</Text>
      </View>

      {/* Trạng thái session */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trạng thái Session</Text>
        {currentSession ? (
          <View>
            <Text style={styles.statusText}>Đang chơi</Text>
            <Text style={styles.durationText}>
              Thời gian: {formatDuration(sessionDuration)}
            </Text>
            <Button 
              title="Kết thúc Session" 
              onPress={() => endSession.mutate()} 
              color="red"
            />
          </View>
        ) : (
          <View>
            <Text style={styles.statusText}>Chưa có session</Text>
            <Button 
              title="Bắt đầu Session" 
              onPress={() => createSession.mutate()} 
              color="green"
            />
          </View>
        )}
      </View>

      {/* Đặt đồ ăn */}
      {currentSession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặt đồ ăn</Text>
          
          <View style={styles.inputGroup}>
            <Text>Chọn món:</Text>
            <ScrollView horizontal style={styles.menuScroll}>
              {menus?.map((menu: any) => (
                <Button
                  key={menu.id}
                  title={menu.name}
                  onPress={() => setSelectedMenuId(menu.id.toString())}
                  color={selectedMenuId === menu.id.toString() ? 'blue' : 'gray'}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text>Số lượng:</Text>
            <TextInput
              value={orderQuantity}
              onChangeText={setOrderQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Button
            title="Thêm vào Order"
            onPress={() => addOrder.mutate()}
            disabled={!selectedMenuId || !orderQuantity}
          />
        </View>
      )}

      {/* Danh sách orders hiện tại */}
      {currentSession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders hiện tại</Text>
          <Text>Session ID: {currentSession.id}</Text>
          {/* TODO: Hiển thị danh sách orders của session này */}
        </View>
      )}

      <View style={styles.footer}>
        <Button 
          title="Quay lại" 
          onPress={() => navigation?.goBack()} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 10,
  },
  durationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  menuScroll: {
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginTop: 5,
  },
  footer: {
    marginTop: 20,
    marginBottom: 20,
  },
});
