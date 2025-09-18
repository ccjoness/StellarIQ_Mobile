/**
 * Profile screen component
 */

import {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    Switch,
} from 'react-native';
import {useAuth} from '@/contexts/AuthContext';
import {useTheme} from '@/hooks/useTheme';

export function ProfileScreen() {
    const {user, updateProfile, changePassword, logout, isLoading, error, clearError} = useAuth();
    const {theme, themeMode, setThemeMode} = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [profileData, setProfileData] = useState({
        fullName: user?.full_name || '',
        timezone: user?.timezone || 'UTC',
        preferredCurrency: user?.preferred_currency || 'USD',
        emailNotifications: user?.email_notifications || false,
        pushNotifications: user?.push_notifications || false,
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const updateProfileData = (field: string, value: string | boolean) => {
        setProfileData(prev => ({...prev, [field]: value}));
    };

    const updatePasswordData = (field: string, value: string) => {
        setPasswordData(prev => ({...prev, [field]: value}));
    };

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: theme.colors.textSecondary };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        if (score <= 2) return { strength: score, label: 'Weak', color: theme.colors.error };
        if (score <= 3) return { strength: score, label: 'Fair', color: '#FF8C00' };
        if (score <= 4) return { strength: score, label: 'Good', color: '#32CD32' };
        return { strength: score, label: 'Strong', color: '#228B22' };
    };

    const handleSaveProfile = async () => {
        try {
            clearError();
            await updateProfile({
                full_name: profileData.fullName.trim() || undefined,
                timezone: profileData.timezone,
                preferred_currency: profileData.preferredCurrency,
                email_notifications: profileData.emailNotifications,
                push_notifications: profileData.pushNotifications,
            });
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            // Error is handled by the auth context
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword.trim()) {
            Alert.alert('Error', 'Please enter your current password');
            return;
        }

        if (!passwordData.newPassword.trim()) {
            Alert.alert('Error', 'Please enter a new password');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters long');
            return;
        }

        // Additional password strength validation
        const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
        const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
        const hasNumbers = /\d/.test(passwordData.newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            Alert.alert(
                'Weak Password',
                'Password should contain at least one uppercase letter, one lowercase letter, and one number for better security.',
                [
                    {text: 'Continue Anyway', onPress: () => proceedWithPasswordChange()},
                    {text: 'Cancel', style: 'cancel'}
                ]
            );
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            Alert.alert('Error', 'New password must be different from current password');
            return;
        }

        proceedWithPasswordChange();
    };

    const proceedWithPasswordChange = async () => {
        try {
            clearError();
            await changePassword({
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            });
            setIsChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            Alert.alert(
                'Success',
                'Password changed successfully. You may need to log in again on other devices.',
                [
                    {text: 'OK', onPress: () => {}}
                ]
            );
        } catch (error) {
            // Error is handled by the auth context
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Logout', style: 'destructive', onPress: logout},
            ]
        );
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setProfileData({
            fullName: user?.full_name || '',
            timezone: user?.timezone || 'UTC',
            preferredCurrency: user?.preferred_currency || 'USD',
            emailNotifications: user?.email_notifications || false,
            pushNotifications: user?.push_notifications || false,
        });
    };

    const cancelPasswordChange = () => {
        setIsChangingPassword(false);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    if (!user) {
        return (
            <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
                <Text style={[styles.errorText, {color: theme.colors.error}]}>User not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
            <View style={[styles.header, {backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border}]}>
                <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>{user.email}</Text>
                {user.is_oauth_user && (
                    <View style={[styles.badge, {backgroundColor: theme.colors.info + '20'}]}>
                        <Text style={[styles.badgeText, {color: theme.colors.primary}]}>Google Account</Text>
                    </View>
                )}
            </View>

            {error && (
                <View style={[styles.errorContainer, {backgroundColor: theme.colors.error + '20'}]}>
                    <Text style={[styles.errorText, {color: theme.colors.error}]}>{error}</Text>
                </View>
            )}

            <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Personal Information</Text>
                    {!isEditing && (
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text style={[styles.editButton, {color: theme.colors.primary}]}>Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, {color: theme.colors.text}]}>Full Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text},
                            !isEditing && {backgroundColor: theme.colors.surface, color: theme.colors.textSecondary}
                        ]}
                        value={profileData.fullName}
                        onChangeText={(value) => updateProfileData('fullName', value)}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.textSecondary}
                        editable={isEditing && !isLoading}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, {color: theme.colors.text}]}>Timezone</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text},
                            !isEditing && {backgroundColor: theme.colors.surface, color: theme.colors.textSecondary}
                        ]}
                        value={profileData.timezone}
                        onChangeText={(value) => updateProfileData('timezone', value)}
                        placeholder="UTC"
                        placeholderTextColor={theme.colors.textSecondary}
                        editable={isEditing && !isLoading}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, {color: theme.colors.text}]}>Preferred Currency</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text},
                            !isEditing && {backgroundColor: theme.colors.surface, color: theme.colors.textSecondary}
                        ]}
                        value={profileData.preferredCurrency}
                        onChangeText={(value) => updateProfileData('preferredCurrency', value)}
                        placeholder="USD"
                        placeholderTextColor={theme.colors.textSecondary}
                        editable={isEditing && !isLoading}
                    />
                </View>

                {isEditing && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}
                            onPress={cancelEdit}
                            disabled={isLoading}
                        >
                            <Text style={[styles.cancelButtonText, {color: theme.colors.text}]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton, {backgroundColor: theme.colors.primary}]}
                            onPress={handleSaveProfile}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" size="small"/>
                            ) : (
                                <Text style={styles.saveButtonText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Notifications</Text>

                <View style={styles.switchContainer}>
                    <Text style={[styles.switchLabel, {color: theme.colors.text}]}>Email Notifications</Text>
                    <Switch
                        value={profileData.emailNotifications}
                        onValueChange={(value) => updateProfileData('emailNotifications', value)}
                        disabled={!isEditing || isLoading}
                        trackColor={{false: theme.colors.border, true: theme.colors.primary}}
                        thumbColor={profileData.emailNotifications ? '#FFFFFF' : theme.colors.textSecondary}
                    />
                </View>

                <View style={styles.switchContainer}>
                    <Text style={[styles.switchLabel, {color: theme.colors.text}]}>Push Notifications</Text>
                    <Switch
                        value={profileData.pushNotifications}
                        onValueChange={(value) => updateProfileData('pushNotifications', value)}
                        disabled={!isEditing || isLoading}
                        trackColor={{false: theme.colors.border, true: theme.colors.primary}}
                        thumbColor={profileData.pushNotifications ? '#FFFFFF' : theme.colors.textSecondary}
                    />
                </View>
            </View>

            <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Appearance</Text>

                <View style={styles.themeContainer}>
                    <Text style={[styles.switchLabel, {color: theme.colors.text}]}>Theme</Text>
                    <View style={styles.themeOptions}>
                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                {borderColor: theme.colors.border},
                                themeMode === 'light' && {backgroundColor: theme.colors.primary}
                            ]}
                            onPress={() => setThemeMode('light')}
                        >
                            <Text style={[
                                styles.themeOptionText,
                                {color: themeMode === 'light' ? '#FFFFFF' : theme.colors.text}
                            ]}>
                                Light
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                {borderColor: theme.colors.border},
                                themeMode === 'dark' && {backgroundColor: theme.colors.primary}
                            ]}
                            onPress={() => setThemeMode('dark')}
                        >
                            <Text style={[
                                styles.themeOptionText,
                                {color: themeMode === 'dark' ? '#FFFFFF' : theme.colors.text}
                            ]}>
                                Dark
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.themeOption,
                                {borderColor: theme.colors.border},
                                themeMode === 'auto' && {backgroundColor: theme.colors.primary}
                            ]}
                            onPress={() => setThemeMode('auto')}
                        >
                            <Text style={[
                                styles.themeOptionText,
                                {color: themeMode === 'auto' ? '#FFFFFF' : theme.colors.text}
                            ]}>
                                Auto
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {!user.is_oauth_user && (
                <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
                    <View style={[styles.sectionHeader]}>
                        <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>Security</Text>
                        {!isChangingPassword && (
                            <TouchableOpacity onPress={() => setIsChangingPassword(true)}>
                                <Text style={[styles.editButton, {color: theme.colors.primary}]}>Change Password</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {isChangingPassword && (
                        <>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, {color: theme.colors.text}]}>Current Password</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text}
                                    ]}
                                    value={passwordData.currentPassword}
                                    onChangeText={(value) => updatePasswordData('currentPassword', value)}
                                    placeholder="Enter current password"
                                    secureTextEntry
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, {color: theme.colors.text}]}>New Password</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text}
                                    ]}
                                    value={passwordData.newPassword}
                                    onChangeText={(value) => updatePasswordData('newPassword', value)}
                                    placeholder="Enter new password (min 8 characters)"
                                    secureTextEntry
                                    editable={!isLoading}
                                />
                                {passwordData.newPassword.length > 0 && (
                                    <View style={styles.passwordStrengthContainer}>
                                        <View style={styles.passwordStrengthBar}>
                                            {[1, 2, 3, 4, 5].map((level) => {
                                                const strength = getPasswordStrength(passwordData.newPassword);
                                                return (
                                                    <View
                                                        key={level}
                                                        style={[
                                                            styles.passwordStrengthSegment,
                                                            {
                                                                backgroundColor: level <= strength.strength
                                                                    ? strength.color
                                                                    : theme.colors.border
                                                            }
                                                        ]}
                                                    />
                                                );
                                            })}
                                        </View>
                                        <Text style={[styles.passwordStrengthText, {color: getPasswordStrength(passwordData.newPassword).color}]}>
                                            {getPasswordStrength(passwordData.newPassword).label}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.label, {color: theme.colors.text}]}>Confirm New Password</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text}
                                    ]}
                                    value={passwordData.confirmPassword}
                                    onChangeText={(value) => updatePasswordData('confirmPassword', value)}
                                    placeholder="Confirm new password"
                                    secureTextEntry
                                    editable={!isLoading}
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}
                                    onPress={cancelPasswordChange}
                                    disabled={isLoading}
                                >
                                    <Text style={[styles.cancelButtonText, {color: theme.colors.text}]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton, {backgroundColor: theme.colors.primary}]}
                                    onPress={handleChangePassword}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small"/>
                                    ) : (
                                        <Text style={styles.saveButtonText}>Change Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            )}

            <View style={[styles.section, {backgroundColor: theme.colors.surface}]}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#EBF8FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#3B82F6',
        fontSize: 12,
        fontWeight: '600',
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        margin: 16,
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 14,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    editButton: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    disabledInput: {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    switchLabel: {
        fontSize: 16,
        color: '#374151',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    cancelButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#DC2626',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    themeContainer: {
        paddingVertical: 12,
    },
    themeOptions: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    themeOption: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    themeOptionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    passwordStrengthContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    passwordStrengthBar: {
        flexDirection: 'row',
        flex: 1,
        height: 4,
        marginRight: 12,
        gap: 2,
    },
    passwordStrengthSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    passwordStrengthText: {
        fontSize: 12,
        fontWeight: '500',
        minWidth: 50,
        textAlign: 'right',
    },
});
