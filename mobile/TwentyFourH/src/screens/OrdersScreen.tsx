import React, { useState } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Takeaway from '@api/takeawayOrders';
import * as DineIn from '@api/dineInOrders';

type Mode = 'takeaway' | 'dine-in';

export default function OrdersScreen() {
  const [mode, setMode] = useState<Mode>('takeaway');

  const takeawayQ = useQuery({
    queryKey: ['takeaway-orders', mode],
    queryFn: () => (mode === 'takeaway' ? Takeaway.todayOrders() : Promise.resolve([])),
  });

  const dineInQ = useQuery({
    queryKey: ['dine-in-orders', mode],
    queryFn: () => (mode === 'dine-in' ? DineIn.todayOrders() : Promise.resolve([])),
  });

  const data = mode === 'takeaway' ? (takeawayQ.data || []) : (dineInQ.data || []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: 8, padding: 12, justifyContent: 'space-between' }}>
        <Button title="Takeaway" onPress={() => setMode('takeaway')} />
        <Button title="Dine-in" onPress={() => setMode('dine-in')} />
      </View>

      <FlatList
        data={data as any[]}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
            <Text>Order #{item.id}</Text>
            <Text>Tổng: {item.total ?? '-'}</Text>
            <Text>Trạng thái: {item.status ?? '-'}</Text>
          </View>
        )}
      />
    </View>
  );
}


