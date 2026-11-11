# 📱 InnBite Notification & Device Setup Guide
### Complete Setup Manual for Restaurant Waiters & Administrators (Android & iOS)

This guide provides step-by-step instructions to configure waiter smartphones, tablets, and admin devices so that **new food order alerts ring loudly on the lock screen**, notifications never get missed, and custom alert sounds play reliably.

---

## 📋 Table of Contents
1. [Quick Overview: How InnBite Notifications Work](#1-quick-overview)
2. [Android Device Setup (Waiters & Admins)](#2-android-device-setup)
   - [Step A: Install / Add to Home Screen](#step-a-add-to-home-screen-android)
   - [Step B: Enable Browser & App Permissions](#step-b-enable-browser--app-permissions)
   - [Step C: Set Custom Loud Notification Sound](#step-c-set-custom-loud-notification-sound)
   - [Step D: Turn Off Battery Optimization (Crucial)](#step-d-turn-off-battery-optimization-crucial)
   - [Step E: Allow Lock Screen Notification Content](#step-e-allow-lock-screen-notification-content)
3. [iPhone / iPad (iOS) Setup (Waiters & Admins)](#3-iphone--ipad-ios-setup)
   - [Step A: Add to Home Screen (Mandatory for iOS Push)](#step-a-add-to-home-screen-mandatory-for-ios)
   - [Step B: Allow Notification Permissions](#step-b-allow-notification-permissions)
   - [Step C: Check Physical Ringer Switch & Focus / DND](#step-c-check-ringer-switch--focus-mode)
4. [In-App Setup on the Waiter Dashboard (`/bite-waiter`)](#4-in-app-waiter-dashboard-setup)
   - [Step 1: Sign in with Waiter Credentials](#step-1-sign-in)
   - [Step 2: Tap "Enable Lock-Screen Alerts"](#step-2-enable-lock-screen-alerts)
   - [Step 3: Test Audio & Web Push](#step-3-test-audio--web-push)
   - [Step 4: Turn On "Screen Wake Lock" During Active Shifts](#step-4-turn-on-screen-wake-lock)
5. [In-App Setup on Admin Dashboard (`/bite-admin`)](#5-in-app-admin-dashboard-setup)
6. [Troubleshooting & Frequently Asked Questions](#6-troubleshooting)

---

## 1. Quick Overview

InnBite features a dual notification engine designed for fast-paced commercial restaurants:
1. **Background Web Push:** Sends instant alerts to the device via Google FCM (Android) and Apple APNs (iOS) even when the phone is locked in the waiter's pocket or the browser is minimized.
2. **Urgent Looping Alarm (Swiggy / Zomato style):** When the waiter dashboard is open, incoming orders trigger a continuous looping bell sound, vibration, and full-screen order accept banner that rings until the waiter taps **"ACCEPT & START PREPARING"**.

---

## 2. Android Device Setup (Waiters & Admins)

Android allows full customization of notification tones and background running capabilities.

### Step A: Add to Home Screen (Android)
Installing InnBite as a Progressive Web App (PWA) gives it native app behavior:
1. Open **Google Chrome** (or Samsung Internet).
2. Go to your restaurant URL (e.g. `https://your-restaurant.com/bite-waiter/login`).
3. Tap the **Three Dots (⋮)** in the top-right corner.
4. Tap **"Install app"** or **"Add to Home screen"**.
5. Tap **Add / Install**. An InnBite app icon will appear on your phone home screen.

### Step B: Enable Browser & App Permissions
1. Open the phone's **Settings** app.
2. Go to **Apps** (or **App Management**) > **Chrome** (or **InnBite** if installed).
3. Tap **Permissions** > ensure **Notifications** is set to **Allowed**.

### Step C: Set Custom Loud Notification Sound
*By default, Android assigns its generic system ping to web notifications. Change it to a loud restaurant bell ringtone:*
1. Open **Settings** > **Apps** > **Chrome** (or **InnBite**).
2. Tap **Notifications**.
3. Tap **Notification categories** (on Samsung: scroll down to tap *Notification categories*).
4. Tap **Sites** (or the specific InnBite site address channel).
5. Ensure the alert style is set to **Alert** (not Silent).
6. Tap **Sound** > select a loud bell, ringing tone, or siren from your device sounds.
7. Turn on **Vibrate** and toggle **Pop on screen** to ON.

### Step D: Turn Off Battery Optimization (Crucial)
*Android aggressive battery savers freeze background tabs after 2–3 minutes of screen lock. Whitelist InnBite:*
1. In **Settings** > **Apps** > **Chrome** (or **InnBite**):
2. Tap **Battery** (or *Battery usage*).
3. Change setting from *Optimized* to **Unrestricted** (or *Don't optimize*).
4. Go to **Mobile data** > turn ON **"Allow background data usage"** and **"Allow data usage while Data saver is on"**.

### Step E: Allow Lock Screen Notification Content
1. In **Settings** > **Notifications** > **Lock screen notifications**:
2. Set to **"Show content"** (so the customer table number and order total appear without unlocking).

---

## 3. iPhone / iPad (iOS) Setup (Waiters & Admins)

> **Important iOS Rule:** Apple requires iOS 16.4 or newer. On iPhones, Web Push notifications **ONLY** work when the web app is added to the Home Screen.

### Step A: Add to Home Screen (Mandatory for iOS)
1. Open **Safari** (do not use Chrome on iOS for push setup; Apple only allows Safari to register system push).
2. Navigate to your waiter URL: `https://your-restaurant.com/bite-waiter`.
3. Tap the **Share** button (the square with an arrow pointing up at the bottom of Safari).
4. Scroll down and tap **"Add to Home Screen"** (`+`).
5. Tap **Add** in the top-right corner.
6. **Close Safari.** From now on, always launch InnBite by tapping the new **InnBite icon on your home screen**.

### Step B: Allow Notification Permissions
1. Launch InnBite from the **Home Screen icon**.
2. Log in with your waiter username and password.
3. Tap **"Enable Lock-Screen Alerts"** on the yellow/amber banner.
4. When iOS prompts *"InnBite Would Like to Send You Notifications"*, tap **Allow**.
5. Open iPhone **Settings** > scroll down to **InnBite**:
   - Tap **Notifications**.
   - Turn ON **Allow Notifications**.
   - Check all three alerts: **Lock Screen**, **Notification Centre**, and **Banners**.
   - Set Banner Style to **Persistent**.
   - Turn ON **Sounds** and **Badges**.

### Step C: Check Ringer Switch & Focus Mode
- Make sure the physical **Silent Switch** on the left side of your iPhone is NOT showing orange (must be in Ring mode).
- If using **Focus** or **Do Not Disturb (DND)** during shifts:
  1. Go to **Settings** > **Focus** > tap your active Focus.
  2. Tap **Apps** > add **InnBite** to *Allowed Notifications*.
  3. Turn ON **Time Sensitive Notifications**.

---

## 4. In-App Waiter Dashboard Setup (`/bite-waiter`)

Follow these simple in-app steps every time a waiter starts their shift:

### Step 1: Sign In
- Go to `/bite-waiter/login`.
- Enter your assigned waiter username (e.g., `waiter1`) and password.

### Step 2: Enable Lock-Screen Alerts
- Look at the top of the dashboard.
- If you see the yellow banner **"Enable Lock-Screen Notifications & Sounds"**, tap **"Enable Lock-Screen Alerts"**.
- Tap **Allow** when the browser asks for permission.
- A confirmation toast will appear: *"🎉 Lock-Screen & Background Push Alerts Activated!"*.

### Step 3: Test Audio & Web Push
Before starting table service, perform two quick sanity checks using the top buttons:
1. Tap **"Test Sound" (🔊)**: Confirms that phone audio is unmuted and the order bell chimes cleanly.
2. Tap **"Test Push" (🔔)**: Lock your phone screen immediately. Within 3 seconds, a test order alert (`🚨 Test Order #999`) will pop up on your lock screen.

### Step 4: Turn On "Screen Wake Lock" During Active Shifts
- Tap the **"Screen Awake" (☀️)** toggle in the top bar.
- When active, the icon highlights green (`Screen Awake ON`).
- **Benefit:** If you place your phone or tablet on a service station stand or cradle, the screen will stay awake and continuously ring like a restaurant POS whenever an order is submitted!

### Handling an Incoming Order:
- When a customer places an order, the screen displays a pulsating urgent card and sounds the looping bell.
- Tap **"🍳 ACCEPT & START PREPARING"** to claim the order and notify kitchen staff.
- Tap **"Silence Ring"** if you need to mute the loud loop while reviewing order notes.

---

## 5. In-App Admin Dashboard Setup (`/bite-admin`)

For managers and cashiers monitoring the admin portal:
1. Open `/bite-admin` on your computer, tablet, or phone and sign in.
2. Navigate to **Orders & Payments** (`/bite-admin/orders`).
3. In the top-right corner:
   - Ensure the **"Sound ON" (🔊)** button is active (green).
   - Tap **"System Notifications" (🔔)** and select **Allow** in your browser prompt.
4. Incoming orders will now trigger desktop notifications and sound alerts even if you are working in another tab or software.

---

## 6. Troubleshooting & FAQs

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **Notification arrives, but only plays default phone beep** | Android Chrome routes Web Push through Android Notification Channels | Open phone **Settings > Apps > Chrome (or InnBite) > Notifications > Sites > Sound** and pick your desired loud ringtone. |
| **No notification when phone screen has been off for 10+ minutes** | Android aggressive battery optimization put the app to sleep | Set Chrome / InnBite battery usage to **"Unrestricted"** in phone Settings. |
| **On iPhone, "Enable Lock-Screen Alerts" says unsupported** | App was opened directly in Safari instead of from Home Screen | Tap Safari Share icon ➔ **"Add to Home Screen"**. Launch the app from the Home Screen icon. |
| **Sound did not ring when order arrived** | Phone media volume muted or silent mode switch active | Increase **Media Volume** and **Ring/Notification Volume** using phone side keys. Turn off silent/vibrate switch. |
| **Notification permission shows "Denied" / Blocked** | Permission was clicked "Block" earlier | Tap the **Lock / Tune icon (🔒)** in the browser URL bar ➔ tap **Permissions** ➔ set Notifications to **Allow** ➔ reload page. |
| **Two notifications arrived for the same order** | Outdated browser cache | Clear browser cache or hard reload (`Ctrl+F5` / swipe down to refresh). Our latest update deduplicates all notifications with unified tags. |

---

*InnBite Point of Sale & Table Ordering System · Operational Staff Guide*
