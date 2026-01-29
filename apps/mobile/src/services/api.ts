// Real API Service - Connects to NestJS Backend
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:3000';

    // For physical device / emulator, use the metro bundler IP
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (!localhost) return 'http://192.168.1.158:3000'; // Fallback to your likely local IP or loopback
    return `http://${localhost}:3000`;
};

const API_URL = getBaseUrl();

// Helper to get headers with token
const getHeaders = async () => {
    const token = await AsyncStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            console.log(`[API] Attempting login at ${API_URL}/auth/login`);
            console.log(`[API] Email: ${email}`);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log(`[API] Response status: ${response.status}`);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Login failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // Store token and user data
            if (data.access_token) {
                await AsyncStorage.setItem('jwt_token', data.access_token);
                await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
            }

            return data;
        },
        logout: async () => {
            await AsyncStorage.removeItem('jwt_token');
            await AsyncStorage.removeItem('user_data');
        },
        getSession: async () => {
            const token = await AsyncStorage.getItem('jwt_token');
            const userStr = await AsyncStorage.getItem('user_data');
            return { token, user: userStr ? JSON.parse(userStr) : null };
        },
        changePassword: async (newPassword: string) => {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PATCH',
                headers: await getHeaders(),
                body: JSON.stringify({ newPassword }),
            });
            if (!response.ok) throw new Error('Failed to update password');
            return await response.json();
        },
        updateProfile: async (data: { recoveryEmail?: string; phone?: string }) => {
            const response = await fetch(`${API_URL}/auth/update-profile`, {
                method: 'PATCH',
                headers: await getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update profile');
            const result = await response.json();
            // Update local storage if successful
            const userStr = await AsyncStorage.getItem('user_data');
            if (userStr) {
                const user = JSON.parse(userStr);
                const updatedUser = { ...user, ...data };
                await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
            return result;
        }
    },
    events: {
        getToday: async (userId: string) => {
            const response = await fetch(`${API_URL}/events/today`, {
                method: 'GET',
                headers: await getHeaders(),
            });

            if (!response.ok) {
                console.error('Failed to fetch events');
                return [];
            }

            return await response.json();
            if (!response.ok) {
                console.error('Failed to fetch events');
                return [];
            }

            return await response.json();
        }
    },
    admin: {
        getStats: async () => {
            const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch stats');
            return await response.json();
        },
        getProfileRequests: async (status?: string) => {
            const url = status
                ? `${API_URL}/admin/profile-requests?status=${status}`
                : `${API_URL}/admin/profile-requests`;
            const response = await fetch(url, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch requests');
            return await response.json();
        },
        approveRequest: async (id: string) => {
            const response = await fetch(`${API_URL}/admin/profile-requests/${id}/approve`, {
                method: 'POST',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to approve request');
            return await response.json();
        },
        rejectRequest: async (id: string, reason: string) => {
            const response = await fetch(`${API_URL}/admin/profile-requests/${id}/reject`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ reason }),
            });
            if (!response.ok) throw new Error('Failed to reject request');
            return await response.json();
        },
        getComplaints: async () => {
            const response = await fetch(`${API_URL}/admin/complaints`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch complaints');
            return await response.json();
        },
        getStaff: async () => {
            const response = await fetch(`${API_URL}/admin/staff`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch staff');
            return await response.json();
        },
        assignComplaint: async (id: string, staffId: string) => {
            const response = await fetch(`${API_URL}/admin/complaints/${id}/assign`, {
                method: 'PATCH',
                headers: await getHeaders(),
                body: JSON.stringify({ staffId })
            });
            if (!response.ok) throw new Error('Failed to assign complaint');
            return await response.json();
        },
        updateComplaintStatus: async (id: string, status: string) => {
            const response = await fetch(`${API_URL}/admin/complaints/${id}/status`, {
                method: 'PATCH',
                headers: await getHeaders(),
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Failed to update status');
            return await response.json();
        },
        deleteStaff: async (id: string) => {
            const response = await fetch(`${API_URL}/admin/staff/${id}`, {
                method: 'DELETE',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to delete staff');
            return await response.json();
        },
        getAdmins: async () => {
            const response = await fetch(`${API_URL}/admin/admins`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch admins');
            return await response.json();
        },
        getDepartments: async () => {
            const response = await fetch(`${API_URL}/admin/departments`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch departments');
            return await response.json();
        },
        getLecturers: async () => {
            const response = await fetch(`${API_URL}/admin/lecturers`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch lecturers');
            return await response.json();
        },
        getStudents: async () => {
            const response = await fetch(`${API_URL}/admin/students`, {
                method: 'GET',
                headers: await getHeaders(),
            });
            if (!response.ok) throw new Error('Failed to fetch students');
            return await response.json();
        },
        createUser: async (data: any) => {
            const response = await fetch(`${API_URL}/admin/users`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'User creation failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }
            return await response.json();
        }
    },
    timetable: {
        getMySchedule: async () => {
            const response = await fetch(`${API_URL}/timetable/my-schedule`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch schedule');
            return await response.json();
        },
        getWeeklySchedule: async (dept: string, level: number) => {
            const response = await fetch(`${API_URL}/timetable/events?department=${dept}&level=${level}`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch weekly schedule');
            return await response.json();
        }
    },
    academic: {
        getAvailableCourses: async (dept: string, level: number) => {
            const response = await fetch(`${API_URL}/academic/courses?department=${dept}&level=${level}`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch courses');
            return await response.json();
        },
        getEnrolledCourses: async () => {
            const response = await fetch(`${API_URL}/academic/my-courses`, {
                headers: await getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch enrolled courses');
            return await response.json();
        },
        registerCourse: async (courseId: string) => {
            const response = await fetch(`${API_URL}/academic/register`, {
                method: 'POST',
                headers: await getHeaders(),
                body: JSON.stringify({ courseId })
            });
            if (!response.ok) throw new Error('Failed to register course');
            return await response.json();
        }
    },
    cashier: {
        registerPayment: async (data: any) => {
            const response = await fetch(`${API_URL}/cashier/register-payment`, {
                method: 'POST',
                headers: await getHeaders(), // Only admins/cashiers should call this
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        }
    }
};
