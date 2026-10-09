// Motionary native 2.0 sample (9.8) — React Native.
// MotionView.tsx was generated with:
//   toReactNative('enter: fade-up 500ms smooth stagger 80ms; click: pop', { name: 'MotionView' })
import React from 'react';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import { MotionView } from './MotionView';

const items = ['Inbox', 'Starred', 'Sent', 'Drafts'];

export default function App() {
  return (
    <SafeAreaView style={styles.page}>
      {items.map((t, i) => (
        <MotionView key={t} index={i} onPress={() => console.log(t)}>
          <View style={styles.card}><Text style={styles.text}>{t}</Text></View>
        </MotionView>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, gap: 12, backgroundColor: '#f8fafc' },
  card: { padding: 16, borderRadius: 14, backgroundColor: '#fff', shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  text: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
});
