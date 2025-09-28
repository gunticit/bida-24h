import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Tables from '@api/tables';

export default function TablesScreen() {
  const { data, isLoading, error } = useQuery({ queryKey: ['tables'], queryFn: Tables.list });

  if (isLoading) return <Text>Đang tải...</Text>;
  if (error) return <Text>Lỗi tải danh sách bàn</Text>;

  return (
    <FlatList
      data={data as Tables.Table[]}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <View style={{ borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 }}>
          <Text style={{ fontWeight: '700' }}>Bàn: {item.name}</Text>
          <Text>Trạng thái: {item.status ?? '-'}</Text>
          {item.qr_code_url ? (
            <Image source={{ uri: item.qr_code_url }} style={{ height: 160, width: 160 }} />
          ) : null}
        </View>
      )}
    />
  );
}


