import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/theme';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ConcertDetailScreen from '../screens/concerts/ConcertDetailScreen';
import TicketSelectScreen from '../screens/tickets/TicketSelectScreen';
import CheckoutScreen from '../screens/orders/CheckoutScreen';
import PaymentGatewayScreen from '../screens/orders/PaymentGatewayScreen';
import ETicketScreen from '../screens/tickets/ETicketScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import PaymentOptionsScreen from '../screens/menu/PaymentOptionsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Wishlist: { active: 'heart', inactive: 'heart-outline' },
  Orders: { active: 'receipt', inactive: 'receipt-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS = {
  Home: 'Beranda',
  Wishlist: 'Wishlist',
  Orders: 'Pesanan',
  Profile: 'Profil',
};

const GUEST_ACCOUNT_TAB = { label: 'Menu', icons: { active: 'menu', inactive: 'menu-outline' } };

function getTabMeta(routeName, isLoggedIn) {
  if (routeName === 'Profile' && !isLoggedIn) {
    return { label: GUEST_ACCOUNT_TAB.label, icons: GUEST_ACCOUNT_TAB.icons };
  }
  return { label: TAB_LABELS[routeName] || routeName, icons: TAB_ICONS[routeName] };
}

function TabItem({ label, icons, isFocused, onPress }) {
  const color = isFocused ? COLORS.primary : COLORS.textMuted;
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
      <Ionicons name={isFocused ? icons.active : icons.inactive} size={21} color={color} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const meta = getTabMeta(route.name, Boolean(user));
        if (!meta.icons) return null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return <TabItem key={route.key} label={meta.label} icons={meta.icons} isFocused={isFocused} onPress={onPress} />;
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} />
      <Tab.Screen name="Profile" component={AccountTab} />
    </Tab.Navigator>
  );
}

// Keep one stable tab route so logout can replace the account content safely.
function AccountTab(props) {
  const { user } = useApp();
  return user ? <ProfileScreen {...props} /> : <MenuScreen {...props} />;
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ConcertDetail" component={ConcertDetailScreen} />
      <Stack.Screen name="TicketSelect" component={TicketSelectScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
      <Stack.Screen name="ETicket" component={ETicketScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoading } = useApp();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
