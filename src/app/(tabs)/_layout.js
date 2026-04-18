import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import {
    FilePieChart,
    LayoutDashboard,
    ScanLine,
    Settings2,
    Users
} from 'lucide-react-native';
import { Platform, StyleSheet } from 'react-native';
import { Theme, hexToRGBA } from '../../theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.primary,
        tabBarInactiveTintColor: Theme.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        // Efek Glassmorphism pada Tab Bar
        tabBarBackground: () => (
          <BlurView 
            intensity={80} 
            tint="dark" 
            style={StyleSheet.absoluteFill} 
          />
        ),
      }}
    >
      {/* 1. MENU DASHBOARD */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard 
              color={color} 
              size={focused ? 26 : 22} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />

      {/* 2. MENU ABSENSI (SCANNER) */}
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Absensi',
          tabBarIcon: ({ color, focused }) => (
            <ScanLine 
              color={color} 
              size={focused ? 26 : 22} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />

      {/* 3. MENU MASTER DATA */}
      <Tabs.Screen
        name="master"
        options={{
          title: 'Master',
          tabBarIcon: ({ color, focused }) => (
            <Users 
              color={color} 
              size={focused ? 26 : 22} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />

      {/* 4. MENU REPORT / REKAPAN */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <FilePieChart 
              color={color} 
              size={focused ? 26 : 22} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />

      {/* 5. MENU SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Settings2 
              color={color} 
              size={focused ? 26 : 22} 
              strokeWidth={focused ? 2.5 : 2} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: hexToRGBA(Theme.primary, 0.1),
    backgroundColor: hexToRGBA(Theme.background, 0.7),
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
    elevation: 0, // Hilangkan shadow bawaan android agar blur terlihat
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});