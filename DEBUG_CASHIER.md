# 🔍 Cashier Dashboard Debug Checklist

## Step-by-Step Diagnosis

### Step 1: Check Backend Logs

**Open your backend terminal** and look for login logs.

When you login as `cashier@university.edu`, you should see:

```json
User logged in: {"role": "CASHIER", "fullName": "Cash Clerk", ...}
```

**If you see:**

```json
User logged in: {"role": "STUDENT", ...}  ❌ WRONG!
```

**Then**: Backend didn't reload. Stop it (Ctrl+C) and restart:

```powershell
cd apps\backend
npm run start:dev
```

---

### Step 2: Check Mobile App Console

**Open browser console** (F12 or Ctrl+Shift+I) and look for:

```json
User logged in: {role: "CASHIER"}
```

**If you DON'T see this log**, the mobile app isn't logging. That's okay, continue.

---

### Step 3: Force Reload Mobile App

**CRITICAL**: You must clear the cache and reload!

**In your mobile app terminal:**

1. Press `Ctrl+C` to stop
2. Run:

   ```powershell
   npx expo start --clear
   ```

3. Wait for QR code
4. Press `w` for web
5. **Hard refresh in browser**: `Ctrl+Shift+R` (not just Ctrl+R!)

---

### Step 4: Check Navigation Code

After reloading, test login again. The mobile app should:

1. **Check user role** in HomeScreen
2. **If CASHIER**: Redirect to Cashier screen
3. **If STUDENT**: Show timetable view

**To verify the code is loaded:**

Open browser console and type:

```javascript
window.location.reload(true)
```

Then login again.

---

### Step 5: Verify Screens Exist

Check if these files exist:

- ✅ `apps/mobile/src/screens/CashierScreen.tsx`
- ✅ `apps/mobile/src/screens/ProfileScreen.tsx`
- ✅ `apps/mobile/src/screens/ComplaintScreen.tsx`

If ANY are missing, the app will crash!

---

## 🐛 Common Issues

### Issue 1: "Cannot find screen"

**Error**: `The action 'NAVIGATE' with payload {"name":"Cashier"} was not handled`

**Fix**: App.tsx doesn't have the route registered. Check if you have:

```tsx
<Stack.Screen name="Cashier" component={CashierScreen} .../>
```

### Issue 2: Bottom navigation shows but doesn't work

**Symptom**: You see Map 🗺️ | Timetable 📅 | Profile 👤 buttons but clicking does nothing

**Fix**: Navigation hasn't loaded. Do a **hard reload** (Ctrl+Shift+R)

### Issue 3: Still seeing student view as cashier

**Symptom**: Login works but shows timetable instead of cashier portal

**Fix**: HomeScreen redirect isn't loaded. **Stop mobile app**, run `npx expo start --clear`, then reload browser.

---

## ✅ Success Indicators

When working correctly, you should see:

1. **Backend log**: `role: "CASHIER"`
2. **Screen change**: Green cashier portal appears
3. **Header**: "Cash Clerk • Student Payment & Registration"
4. **No bottom nav**: Cashier screen doesn't show Map/Timetable/Profile buttons
5. **Form visible**: Payment registration fields appear

---

## 🚨 Emergency Reset

If **nothing works**:

```powershell
# Stop ALL terminals (Ctrl+C on each)

# Kill all Node processes
Get-Process node | Stop-Process -Force

# Navigate to project root
cd C:\Users\ABAMOTDIANEENONGENE\OneDrive - ubuea.cm\Desktop\EkutyEbu\U_OS

# Full restart
.\setup.bat
```

Then test again!
