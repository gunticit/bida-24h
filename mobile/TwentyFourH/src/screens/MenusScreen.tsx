import React from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Menus from '@api/menus';

export default function MenusScreen() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['menus'],
    queryFn: () => Menus.list().then((d: any) => (Array.isArray(d) ? d : d.data)),
  });

  const inc = useMutation({
    mutationFn: (menu: Menus.Menu) => Menus.increaseQuantity(menu.id, 1),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });
  const dec = useMutation({
    mutationFn: (menu: Menus.Menu) => Menus.decreaseQuantity(menu.id, 1),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });
  const setQty = useMutation({
    mutationFn: ({ menu, quantity }: { menu: Menus.Menu; quantity: number }) =>
      Menus.updateQuantity(menu.id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menus'] }),
  });

  if (isLoading) return <Text>Đang tải...</Text>;
  if (error) return <Text>Lỗi tải menus</Text>;

  return (
    <FlatList
      data={data as Menus.Menu[]}
      keyExtractor={(item) => String(item.id)}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
            <Text>Giá: {item.price}</Text>
            <Text>Số lượng: {item.quantity}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="-" onPress={() => dec.mutate(item)} />
            <Button title="+" onPress={() => inc.mutate(item)} />
            <Button title="=10" onPress={() => setQty.mutate({ menu: item, quantity: 10 })} />
          </View>
        </View>
      )}
    />
  );
}


