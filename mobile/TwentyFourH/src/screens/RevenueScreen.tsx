import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Revenue from '@api/revenue';

export default function RevenueScreen() {
  const daily = useQuery({ queryKey: ['revenue', 'daily'], queryFn: () => Revenue.daily() });
  const monthly = useQuery({ queryKey: ['revenue', 'monthly'], queryFn: () => Revenue.monthly() });
  const yearly = useQuery({ queryKey: ['revenue', 'yearly'], queryFn: () => Revenue.yearly() });
  const topTables = useQuery({ queryKey: ['revenue', 'top-tables'], queryFn: () => Revenue.topTables() });
  const chart = useQuery({ queryKey: ['revenue', 'chart'], queryFn: () => Revenue.chart() });

  return (
    <FlatList
      data={[{ key: 'daily' }, { key: 'monthly' }, { key: 'yearly' }, { key: 'top' }, { key: 'chart' }]}
      keyExtractor={(i) => i.key}
      contentContainerStyle={{ padding: 12, gap: 12 }}
      renderItem={({ item }) => {
        if (item.key === 'daily') return (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontWeight: '700' }}>Doanh thu ngày</Text>
            <Text>{JSON.stringify(daily.data)}</Text>
          </View>
        );
        if (item.key === 'monthly') return (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontWeight: '700' }}>Doanh thu tháng</Text>
            <Text>{JSON.stringify(monthly.data)}</Text>
          </View>
        );
        if (item.key === 'yearly') return (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontWeight: '700' }}>Doanh thu năm</Text>
            <Text>{JSON.stringify(yearly.data)}</Text>
          </View>
        );
        if (item.key === 'top') return (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontWeight: '700' }}>Top bàn</Text>
            <Text>{JSON.stringify(topTables.data)}</Text>
          </View>
        );
        return (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <Text style={{ fontWeight: '700' }}>Biểu đồ</Text>
            <Text>{JSON.stringify(chart.data)}</Text>
          </View>
        );
      }}
    />
  );
}


