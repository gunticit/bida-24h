import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, Button } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Expenses from '@api/expenses';

export default function ExpensesScreen() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['expenses'], queryFn: Expenses.list });
  const summary = useQuery({ queryKey: ['expenses', 'summary'], queryFn: () => Expenses.summary() });

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const create = useMutation({
    mutationFn: () => Expenses.create({ title, amount: Number(amount), note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['expenses', 'summary'] });
      setTitle(''); setAmount(''); setNote('');
    }
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>Tổng quan</Text>
        <Text>{JSON.stringify(summary.data)}</Text>
      </View>

      <View style={{ padding: 12, gap: 8 }}>
        <Text style={{ fontWeight: '700' }}>Thêm chi phí</Text>
        <TextInput placeholder="Tên" value={title} onChangeText={setTitle} style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
        <TextInput placeholder="Số tiền" keyboardType="numeric" value={amount} onChangeText={setAmount} style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
        <TextInput placeholder="Ghi chú" value={note} onChangeText={setNote} style={{ borderWidth: 1, borderRadius: 8, padding: 8 }} />
        <Button title="Thêm" onPress={() => create.mutate()} />
      </View>

      <FlatList
        data={(data as Expenses.Expense[]) || []}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}>
            <Text>{item.title} - {item.amount}</Text>
            {item.note ? <Text>{item.note}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}


