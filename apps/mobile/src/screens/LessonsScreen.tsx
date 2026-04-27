import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockLessons = [
  { id: '1', title: 'Введение в испанский', date: '2024-05-01', teacher: 'Мария' },
  { id: '2', title: 'Грамматика уровня A1', date: '2024-05-02', teacher: 'Карлос' },
];

export default function LessonsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockLessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.lessonItem}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonInfo}>{item.teacher}</Text>
            <Text style={styles.lessonDate}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  lessonItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lessonInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  lessonDate: {
    fontSize: 12,
    color: '#999',
  },
});
