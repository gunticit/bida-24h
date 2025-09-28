import React, { useState } from 'react';
import { View, Text, FlatList, Button, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Sessions from '@api/sessions';

type Filter = 'today' | 'today-or-playing' | 'playing-or-last7days';

export default function SessionsScreen() {
  const [filter, setFilter] = useState<Filter>('today');
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['sessions', filter],
    queryFn: async () => {
      if (filter === 'today') return Sessions.today();
      if (filter === 'today-or-playing') return Sessions.todayOrPlaying();
      return Sessions.playingOrLast7Days();
    },
  });

  const [menuId, setMenuId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('1');

  const addOrder = useMutation({
    mutationFn: ({ sessionId, menu_id, quantity }: { sessionId: number; menu_id: number; quantity: number }) =>
      Sessions.addOrder(sessionId, { menu_id, quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions', filter] }),
  });

  const updateOrderQty = useMutation({
    mutationFn: ({ orderId, quantity }: { orderId: number; quantity: number }) =>
      Sessions.updateOrderQuantity(orderId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions', filter] }),
  });

  const removeOrder = useMutation({
    mutationFn: (orderId: number) => Sessions.removeOrder(orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions', filter] }),
  });

  const sessions = query.data || [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 8, padding: 12, justifyContent: 'space-between' }}>
        <Button title="Hôm nay" onPress={() => setFilter('today')} />
        <Button title="Hnay/Đang chơi" onPress={() => setFilter('today-or-playing')} />
        <Button title="Đang chơi/7 ngày" onPress={() => setFilter('playing-or-last7days')} />
      </View>

      <FlatList
        data={sessions as Sessions.Session[]}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
            <Text style={{ fontWeight: '700' }}>Session #{item.id}</Text>
            <Text>Bàn: {item.table_id ?? '-'}</Text>
            <Text>Trạng thái: {item.status ?? '-'}</Text>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput
                placeholder="menu_id"
                keyboardType="number-pad"
                value={menuId}
                onChangeText={setMenuId}
                style={{ borderWidth: 1, borderRadius: 8, padding: 8, minWidth: 80 }}
              />
              <TextInput
                placeholder="qty"
                keyboardType="number-pad"
        value={orderQuantity}
        onChangeText={setOrderQuantity}
                style={{ borderWidth: 1, borderRadius: 8, padding: 8, minWidth: 60 }}
              />
              <Button
                title="Thêm order"
                onPress={() =>
                  addOrder.mutate({ sessionId: item.id, menu_id: Number(menuId), quantity: Number(orderQuantity) })
                }
              />
            </View>

            {/* Các nút minh hoạ update/remove */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Giảm order#1" onPress={() => updateOrderQty.mutate({ orderId: 1, quantity: 1 })} />
              <Button title="Xoá order#1" onPress={() => removeOrder.mutate(1)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}


