import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CampusProvider } from './src/context/CampusContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { CampusSwitchScreen } from './src/screens/CampusSwitchScreen';
import { CashierScreen } from './src/screens/CashierScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ComplaintScreen } from './src/screens/ComplaintScreen';
import { SuperAdminDashboard } from './src/screens/SuperAdminDashboard';
import { ProfileRequestsScreen } from './src/screens/ProfileRequestsScreen';
import { ComplaintsManagementScreen } from './src/screens/ComplaintsManagementScreen';
import { StaffManagementScreen } from './src/screens/StaffManagementScreen';
import { UserListScreen } from './src/screens/UserListScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { CourseRegistrationScreen } from './src/screens/CourseRegistrationScreen';

import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

// Simple Error Boundary Fallback
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 20, color: 'red' }}>Something went wrong.</Text>
                    <Text style={{ color: '#000' }}>{this.state.error?.toString()}</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ErrorBoundary>
                    <CampusProvider>
                        <AuthNavigator />
                    </CampusProvider>
                </ErrorBoundary>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const AuthNavigator = () => {
    const [initialRoute, setInitialRoute] = React.useState<string | null>(null);

    React.useEffect(() => {
        const checkLogin = async () => {
            try {
                const { token, user } = await import('./src/services/api').then(m => m.api.auth.getSession());
                if (token && user) {
                    setInitialRoute('Home');
                } else {
                    setInitialRoute('Login');
                }
            } catch (e) {
                setInitialRoute('Login');
            }
        };
        checkLogin();
    }, []);

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
                <Text style={{ color: 'white' }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <NavigationContainer fallback={<Text>Loading Navigation...</Text>}>
                <Stack.Navigator initialRouteName={initialRoute}>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'U-OS Dashboard' }} initialParams={initialRoute === 'Home' ? { user: null } : undefined} />
                    <Stack.Screen name="SuperAdmin" component={SuperAdminDashboard} options={{ title: '👑 Super Admin', headerShown: false }} />
                    <Stack.Screen name="ProfileRequests" component={ProfileRequestsScreen} options={{ title: '📝 Profile Requests' }} />
                    <Stack.Screen name="ComplaintsManager" component={ComplaintsManagementScreen} options={{ title: '📢 Complaints Manager' }} />
                    <Stack.Screen name="StaffManager" component={StaffManagementScreen} options={{ title: '👥 Staff Management' }} />
                    <Stack.Screen name="UserList" component={UserListScreen} />
                    <Stack.Screen name="Cashier" component={CashierScreen} options={{ title: '💰 Cashier Portal' }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: '👤 My Profile' }} />
                    <Stack.Screen name="Complaint" component={ComplaintScreen} options={{ title: '📢 Submit Complaint' }} />
                    <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Campus Map' }} />
                    <Stack.Screen name="Timetable" component={TimetableScreen} options={{ title: '📅 Your Timetable' }} />
                    <Stack.Screen name="CourseRegistration" component={CourseRegistrationScreen} options={{ title: '📚 Course Registration' }} />
                    <Stack.Screen name="CampusSwitch" component={CampusSwitchScreen} options={{ presentation: 'modal', title: 'Switch Campus' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>

    );
}
