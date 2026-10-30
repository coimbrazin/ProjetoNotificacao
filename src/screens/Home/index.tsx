import React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      (token) => token && setExpoPushToken(token),
    );

    if (Platform.OS === "android") {
      Notifications.getNotificationChannelsAsync().then((value) =>
        setChannels(value ?? []),
      );
    }
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.cardTitle}>
        Aperte o botão para agendar uma notificação
      </Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={async () => {
          await schedulePushNotification();
        }}
      >
        <Text style={styles.buttonText}>
          Pressione para receber notificação
        </Text>
      </TouchableOpacity>
    </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Boleto Gerado 📬",
      body: "Um boleto foi gerado no no valor de R$ 1000,00!",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("myNotificationChannel", {
      name: "A channel is needed for the permissions prompt to appear",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }
  // Learn more about projectId:
  // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
  // EAS projectId is used here.
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log(token);
  } catch (e) {
    token = `${e}`;
  }

  return token;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F4F5F2",
  },
  cardTitle: {
    maxWidth: 360,
    marginBottom: 32,
    color: "#18211B",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
  },
  button: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#baff19",
  },
  buttonText: {
    color: "FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
});
