import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { useGoldTheme } from '../context/GoldThemeContext';
import { MainTabParamList, HomeStackParamList, CameraStackParamList, CollectionsStackParamList, FriendsStackParamList, ProfileStackParamList } from '../types/navigation';

// Screens
import WeeklyChallengesScreen from '../screens/collections/WeeklyChallengesScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import ScanningScreen from '../screens/camera/ScanningScreen';
import AnimalCardScreen from '../screens/camera/AnimalCardScreen';
import CollectionsScreen from '../screens/collections/CollectionsScreen';
import CategoryScreen from '../screens/collections/CategoryScreen';
import SubcategoryScreen from '../screens/collections/SubcategoryScreen';
import AnimalDetailScreen from '../screens/collections/AnimalDetailScreen';
import FriendsScreen from '../screens/friends/FriendsScreen';
import FriendProfileScreen from '../screens/friends/FriendProfileScreen';
import ChatScreen from '../screens/friends/ChatScreen';
import TradeScreen from '../screens/friends/TradeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// ── Stacks ────────────────────────────────────────────────────────────────────

const HomeStack = createStackNavigator<HomeStackParamList>();
function HomeNavigator() {
  const { bg } = useGoldTheme();
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: bg } }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

const CameraStack = createStackNavigator<CameraStackParamList>();
function CameraNavigator() {
  const { bg } = useGoldTheme();
  return (
    <CameraStack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: bg } }}>
      <CameraStack.Screen name="Camera" component={CameraScreen} />
      <CameraStack.Screen name="Scanning" component={ScanningScreen} />
      <CameraStack.Screen name="AnimalCard" component={AnimalCardScreen} options={{ headerShown: true, title: 'New Discovery' }} />
    </CameraStack.Navigator>
  );
}

const CollectionsStack = createStackNavigator<CollectionsStackParamList>();
function CollectionsNavigator() {
  const { bg } = useGoldTheme();
  return (
    <CollectionsStack.Navigator screenOptions={{ headerTintColor: COLORS.primary, cardStyle: { backgroundColor: bg } }}>
      <CollectionsStack.Screen name="Collections" component={CollectionsScreen} options={{ headerShown: false }} />
      <CollectionsStack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({ title: (route.params?.category ?? 'Animals').charAt(0).toUpperCase() + (route.params?.category ?? 'animals').slice(1) + ' Animals' })}
      />
      <CollectionsStack.Screen
        name="Subcategory"
        component={SubcategoryScreen}
        options={({ route }) => ({ title: (route.params?.subcategory ?? 'Animals').charAt(0).toUpperCase() + (route.params?.subcategory ?? 'animals').slice(1) })}
      />
      <CollectionsStack.Screen name="AnimalDetail" component={AnimalDetailScreen} options={{ title: 'Animal Detail' }} />
      <CollectionsStack.Screen name="WeeklyChallenges" component={WeeklyChallengesScreen} options={{ title: 'Weekly Challenges' }} />
    </CollectionsStack.Navigator>
  );
}

const FriendsStack = createStackNavigator<FriendsStackParamList>();
function FriendsNavigator() {
  const { bg } = useGoldTheme();
  return (
    <FriendsStack.Navigator screenOptions={{ headerTintColor: COLORS.primary, cardStyle: { backgroundColor: bg } }}>
      <FriendsStack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
      <FriendsStack.Screen name="FriendProfile" component={FriendProfileScreen} options={({ route }) => ({ title: route.params.friendName })} />
      <FriendsStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.friendName })} />
      <FriendsStack.Screen name="Trade" component={TradeScreen} options={({ route }) => ({ title: route.params.mode === 'offer' ? 'Make a Trade' : 'Accept Trade' })} />
    </FriendsStack.Navigator>
  );
}

const ProfileStack = createStackNavigator<ProfileStackParamList>();
function ProfileNavigator() {
  const { bg } = useGoldTheme();
  return (
    <ProfileStack.Navigator screenOptions={{ headerTintColor: COLORS.primary, cardStyle: { backgroundColor: bg } }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </ProfileStack.Navigator>
  );
}

// ── Main Tabs ─────────────────────────────────────────────────────────────────

export default function MainTabs() {
  const { tabBar } = useGoldTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: tabBar,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            HomeTab: { active: 'home', inactive: 'home-outline' },
            CollectionsTab: { active: 'book', inactive: 'book-outline' },
            CameraTab: { active: 'camera', inactive: 'camera-outline' },
            FriendsTab: { active: 'people', inactive: 'people-outline' },
            ProfileTab: { active: 'person', inactive: 'person-outline' },
          };
          const icon = icons[route.name];
          const iconName = focused ? icon.active : icon.inactive;
          const iconSize = route.name === 'CameraTab' ? size + 6 : size;
          return <Ionicons name={iconName as any} size={iconSize} color={color} />;
        },
        tabBarLabel: ({ focused, color }) => {
          const labels: Record<string, string> = {
            HomeTab: 'Home',
            CollectionsTab: 'Collection',
            CameraTab: 'Scan',
            FriendsTab: 'Friends',
            ProfileTab: 'Profile',
          };
          return undefined; // icons only for cleaner look
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} />
      <Tab.Screen name="CollectionsTab" component={CollectionsNavigator} />
      <Tab.Screen name="CameraTab" component={CameraNavigator} />
      <Tab.Screen name="FriendsTab" component={FriendsNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
