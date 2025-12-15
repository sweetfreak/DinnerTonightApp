import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import Constants from "expo-constants"
import { Platform } from "react-native"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { db } from '../firebase/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import { useUserProfile } from '../contexts/UserProfileContext'



interface PushNotificationState {
    expoPushToken?: Notifications.ExpoPushToken
    notification?: Notifications.Notification
}

export const usePushNotifications = (): PushNotificationState => {
    
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    })

    const { currentUserProfile } = useUserProfile();


    //store device's expo push token
    const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined >()

    //keep track of latest received notification
    const [notification, setNotification] = useState< Notifications.Notification | undefined >()

    //help subscribe to notification events
    const notificationListener = useRef<Notifications.EventSubscription | null>(null)
    const responseListener = useRef<Notifications.EventSubscription | null>(null)

    //precent duplicate navigations when a notification is tapped
    const isNavigatingRef = useRef(false)

    const router = useRouter()

    const savePushTokenToFirestore = async (uid: string, token: string) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, { pushToken: token }, { merge: true });
        } catch (err) {
            console.error('Error saving push token:', err);
        }
    };

    async function registerForPushNotificationsAsync() {
        if (!Device.isDevice || !currentUserProfile?.uid) return;

        

        if (Device.isDevice) {
            const { status: existingStatus } =  await Notifications.getPermissionsAsync()
            let finalStatus = existingStatus

            //for requesting permission when not granted
            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync()
                finalStatus = status
            }

            if (finalStatus !== "granted") {
                return
            }

            try {
                const token = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                })
                 //sets expo push token and saves in backend
                setExpoPushToken(token)
                await savePushTokenToFirestore(currentUserProfile.uid, token.data)
            } catch (error) {
                console.error("Error getting push token:", error)
                return
            }

            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: "default",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF231F7C",
                });
            }
        }
    }

    const handleNotificationResponse = useCallback(
        async (response: Notifications.NotificationResponse) => {

            //prevent multiple navigations
            if (isNavigatingRef.current) return

            const data = response.notification.request.content.data

            if (!data.screen) return

            isNavigatingRef.current = true

            try {
                router.push({
                pathname: data.screen as never, 
                params: (data.params ?? {}) as any, //params: (data.params ?? {}) as Record<string, string>
                });
            } catch (error) {
                console.error("Error handling notification tap:", error)

            } finally {
                //reset flag after delay
                setTimeout(() => {
                    isNavigatingRef.current = false
                }, 1000)
            }
        }, [router]
    )

    useEffect(() => {

        registerForPushNotificationsAsync();

        //sets notification
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification)
        })

        //runs handleNotification Reponse when Notification is clicked
        responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse)

        //cleans up the function
        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, [handleNotificationResponse, currentUserProfile?.uid]) //checkForInitialNotification])


    return {
        expoPushToken,
        notification
    }

}