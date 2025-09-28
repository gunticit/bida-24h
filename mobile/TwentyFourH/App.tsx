/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { } from 'react-native';
import LoginScreen from '@screens/Auth/LoginScreen';
import RegisterScreen from '@screens/Auth/RegisterScreen';
import { useAuthStore } from '@store/auth';
import MenusScreen from '@screens/MenusScreen';
import SessionsScreen from '@screens/SessionsScreen';
import OrdersScreen from '@screens/OrdersScreen';
import TablesScreen from '@screens/TablesScreen';
import RevenueScreen from '@screens/RevenueScreen';
import ExpensesScreen from '@screens/ExpensesScreen';
import QRScannerScreen from '@screens/QRScannerScreen';
import TableManagementScreen from '@screens/TableManagementScreen';

const queryClient = new QueryClient();

// placeholder simple screen removed (no longer used)

function AppTabs() {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
      <Tab.Screen name="Menus" component={MenusScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Tables" component={TablesScreen} />
      <Tab.Screen name="Revenue" component={RevenueScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const Root = createNativeStackNavigator();
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  React.useEffect(() => { hydrate(); }, [hydrate]);
  const isAuthenticated = !!token;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Root.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
              <>
                <Root.Screen name="AppTabs" component={AppTabs} />
                <Root.Screen name="TableManagement" component={TableManagementScreen} />
              </>
            ) : (
              <Root.Screen name="Auth" component={AuthStack} />
            )}
          </Root.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
