import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    Switch,
    Modal,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
    User,
    CreditCard,
    Bell,
    Trash2,
    LogOut,
    ChevronRight,
    Zap,
    Crown,
    X,
    Camera,
    HelpCircle,
    Shield,
    FileText,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
    primary: "#F0421C",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    textMuted: "#A3A3A3",
    textDim: "#525252",
    border: "rgba(255,255,255,0.1)",
    success: "#10B981",
    danger: "#EF4444",
};

// Mock user data - in production this would come from auth context
const USER = {
    name: "John Creator",
    email: "john@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    plan: "Pro",
    credits: 250,
    maxCredits: 500,
    videosCreated: 47,
};

const ProfileHeader = ({ onEdit }: { onEdit: () => void }) => (
    <TouchableOpacity style={styles.profileHeader} onPress={onEdit} activeOpacity={0.8}>
        <Image source={{ uri: USER.avatar }} style={styles.avatar} alt="User Avatar" />
        <View style={styles.profileInfo}>
            <Text style={styles.userName}>{USER.name}</Text>
            <Text style={styles.userEmail}>{USER.email}</Text>
        </View>
        <View style={styles.planBadge}>
            <Crown size={12} color={COLORS.primary} />
            <Text style={styles.planText}>{USER.plan}</Text>
        </View>
    </TouchableOpacity>
);

const CreditsCard = () => {
    const usagePercent = (USER.credits / USER.maxCredits) * 100;
    const router = useRouter();

    return (
        <View style={styles.creditsCard}>
            <LinearGradient
                colors={["#1A1A1A", "#252525"]}
                style={styles.creditsGradient}
            >
                <View style={styles.creditsHeader}>
                    <View style={styles.creditsIcon}>
                        <Zap size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.creditsInfo}>
                        <Text style={styles.creditsLabel}>Available Credits</Text>
                        <Text style={styles.creditsValue}>
                            {USER.credits} <Text style={styles.creditsMax}>/ {USER.maxCredits}</Text>
                        </Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressBg}>
                        <LinearGradient
                            colors={["#F0421C", "#FF6B4A"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${usagePercent}%` }]}
                        />
                    </View>
                    <Text style={styles.progressText}>Resets in 15 days</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{USER.videosCreated}</Text>
                        <Text style={styles.statLabel}>Videos Created</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{USER.plan}</Text>
                        <Text style={styles.statLabel}>Current Plan</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.upgradeButton}
                    activeOpacity={0.8}
                    onPress={() => router.push('/paywall')}
                >
                    <LinearGradient
                        colors={["#F0421C", "#E0320C"]}
                        style={styles.upgradeGradient}
                    >
                        <Text style={styles.upgradeText}>Buy More Credits</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const SettingsItem = ({
    icon: Icon,
    label,
    value,
    danger = false,
    showSwitch = false,
    switchValue = false,
    onSwitchChange,
    onPress,
}: {
    icon: any;
    label: string;
    value?: string;
    danger?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: () => void;
}) => (
    <TouchableOpacity
        style={styles.settingsItem}
        onPress={showSwitch ? undefined : onPress}
        activeOpacity={showSwitch ? 1 : 0.7}
    >
        <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
            <Icon size={18} color={danger ? COLORS.danger : COLORS.textMuted} />
        </View>
        <Text style={[styles.settingsLabel, danger && styles.settingsLabelDanger]}>
            {label}
        </Text>
        <View style={styles.settingsRight}>
            {showSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: '#3e3e3e', true: COLORS.primary }}
                    thumbColor={switchValue ? '#fff' : '#f4f3f4'}
                />
            ) : (
                <>
                    {value && <Text style={styles.settingsValue}>{value}</Text>}
                    <ChevronRight size={18} color={COLORS.textDim} />
                </>
            )}
        </View>
    </TouchableOpacity>
);

// Edit Profile Modal
const EditProfileModal = ({
    visible,
    onClose
}: {
    visible: boolean;
    onClose: () => void;
}) => {
    const [name, setName] = useState(USER.name);
    const [email, setEmail] = useState(USER.email);

    const handleSave = () => {
        // In production, this would call an API
        Alert.alert("Success", "Profile updated successfully!");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.avatarEdit}>
                        <Image source={{ uri: USER.avatar }} style={styles.avatarLarge} alt="Edit Profile Avatar" />
                        <TouchableOpacity style={styles.avatarEditButton}>
                            <Camera size={18} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={COLORS.textDim}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholderTextColor={COLORS.textDim}
                        />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const [showEditModal, setShowEditModal] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSubscription = () => {
        router.push('/paywall');
    };

    const handleNotificationToggle = (value: boolean) => {
        setNotificationsEnabled(value);
        // In production, this would persist to AsyncStorage and update push notification settings
    };

    const handleClearCache = async () => {
        Alert.alert(
            "Clear Cache",
            "This will clear all cached images and data. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Clear file system cache
                            // @ts-ignore
                            const cacheDir = FileSystem.cacheDirectory;
                            if (cacheDir) {
                                const files = await FileSystem.readDirectoryAsync(cacheDir);
                                for (const file of files) {
                                    await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
                                }
                            }
                            // Clear AsyncStorage (except important keys)
                            const keysToKeep = ['@onboarding_complete', '@auth_token'];
                            const allKeys = await AsyncStorage.getAllKeys();
                            const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
                            await AsyncStorage.multiRemove(keysToRemove);

                            Alert.alert("Success", "Cache cleared successfully!");
                        } catch (error) {
                            Alert.alert("Error", "Failed to clear cache. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Clear auth token
                            await AsyncStorage.removeItem('@auth_token');
                            // Navigate to login/onboarding
                            router.replace('/onboarding');
                        } catch (error) {
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const handleHelp = () => {
        Alert.alert(
            "Help & Support",
            "Contact us at support@phovideo.app or visit our FAQ at phovideo.app/help"
        );
    };

    const handlePrivacy = () => {
        Alert.alert("Privacy Policy", "Opening privacy policy...");
        // In production: Linking.openURL('https://phovideo.app/privacy')
    };

    const handleTerms = () => {
        Alert.alert("Terms of Service", "Opening terms of service...");
        // In production: Linking.openURL('https://phovideo.app/terms')
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <StatusBar style="light" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.title}>Profile</Text>

                <ProfileHeader onEdit={() => setShowEditModal(true)} />
                <CreditsCard />

                {/* Account Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon={User}
                            label="Edit Profile"
                            onPress={() => setShowEditModal(true)}
                        />
                        <SettingsItem
                            icon={CreditCard}
                            label="Subscription"
                            value={USER.plan}
                            onPress={handleSubscription}
                        />
                        <SettingsItem
                            icon={Bell}
                            label="Notifications"
                            showSwitch
                            switchValue={notificationsEnabled}
                            onSwitchChange={handleNotificationToggle}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon={HelpCircle}
                            label="Help & FAQ"
                            onPress={handleHelp}
                        />
                        <SettingsItem
                            icon={Shield}
                            label="Privacy Policy"
                            onPress={handlePrivacy}
                        />
                        <SettingsItem
                            icon={FileText}
                            label="Terms of Service"
                            onPress={handleTerms}
                        />
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon={Trash2}
                            label="Clear Cache"
                            onPress={handleClearCache}
                        />
                        <SettingsItem
                            icon={LogOut}
                            label="Sign Out"
                            danger
                            onPress={handleSignOut}
                        />
                    </View>
                </View>

                <Text style={styles.versionText}>Phở Video v1.0.0</Text>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={showEditModal}
                onClose={() => setShowEditModal(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 8,
        marginBottom: 24,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.surface,
    },
    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    userName: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "bold",
    },
    userEmail: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginTop: 2,
    },
    planBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(240, 66, 28, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    planText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: "bold",
    },
    creditsCard: {
        marginBottom: 28,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    creditsGradient: {
        padding: 20,
    },
    creditsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    creditsIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(240, 66, 28, 0.1)",
        justifyContent: "center",
        alignItems: "center",
    },
    creditsInfo: {
        marginLeft: 14,
    },
    creditsLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
    },
    creditsValue: {
        color: COLORS.text,
        fontSize: 26,
        fontWeight: "bold",
    },
    creditsMax: {
        color: COLORS.textDim,
        fontSize: 16,
        fontWeight: "normal",
    },
    progressContainer: {
        marginBottom: 20,
    },
    progressBg: {
        height: 8,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressText: {
        color: COLORS.textDim,
        fontSize: 11,
        marginTop: 8,
        textAlign: "right",
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "bold",
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    upgradeButton: {
        borderRadius: 14,
        overflow: "hidden",
    },
    upgradeGradient: {
        paddingVertical: 14,
        alignItems: "center",
    },
    upgradeText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "bold",
    },
    settingsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    settingsGroup: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    settingsItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    settingsIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
    },
    settingsIconDanger: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    settingsLabel: {
        flex: 1,
        color: COLORS.text,
        fontSize: 15,
        marginLeft: 12,
    },
    settingsLabelDanger: {
        color: COLORS.danger,
    },
    settingsRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    settingsValue: {
        color: COLORS.textMuted,
        fontSize: 14,
    },
    versionText: {
        color: COLORS.textDim,
        fontSize: 12,
        textAlign: "center",
        marginTop: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "bold",
    },
    modalClose: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarEdit: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarEditButton: {
        position: "absolute",
        bottom: 0,
        right: "35%",
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 8,
    },
    saveButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "bold",
    },
});
