# 🔄 How to See Your Code Changes in React Native

## Quick Reload Methods

### Method 1: Fast Refresh (Recommended)

**In the Expo terminal, press:**

- `r` - Reload app
- `Shift + r` - Hard reload (clears cache)

### Method 2: Browser Reload

**If running web version:**

- Press `Ctrl + R` (or `Cmd + R` on Mac) in the browser
- Or click the browser refresh button

### Method 3: Clear Cache & Restart

**If changes still don't appear:**

```powershell
# Stop the running Metro bundler (Ctrl+C in terminal)
# Then restart with --clear flag:
cd apps/mobile
npx expo start --clear
```

### Method 4: Full Reset (Nuclear Option)

**If nothing else works:**

```powershell
# Delete node_modules and reinstall
cd apps/mobile
rm -rf node_modules
npm install

# Clear Metro cache
npx expo start --clear
```

---

## 🐛 Troubleshooting: Why Changes Don't Appear

### 1. Metro Bundler Cache

**Symptom**: Code changes don't reflect in the app

**Solution**: Always use `--clear` flag when starting:

```powershell
npx expo start --clear
```

### 2. Backend Not Running

**Symptom**: Cashier portal shows errors, API calls fail

**Check**: Open Task Manager and look for `node.exe` processes

- You should see 2: Backend API + Metro bundler

**Fix**: Restart backend:

```powershell
cd apps/backend
npm run dev
```

### 3. Wrong Directory

**Symptom**: Expo starts but shows wrong app

**Fix**: Always ensure you're in `apps/mobile`:

```powershell
cd c:\Users\ABAMOTDIANEENONGENE\OneDrive - ubuea.cm\Desktop\EkutyEbu\U_OS
cd apps\mobile
npx expo start --clear
```

### 4. TypeScript Compilation Errors

**Symptom**: Backend won't start, shows errors in terminal

**Check**: Look for red error messages in the backend terminal window

**Fix**: Check the error, fix the code issue, backend will auto-restart

---

## ✅ Verification Checklist

Before testing:

- [ ] Backend running (check for "Nest application successfully started" message)
- [ ] Mobile app running (check for QR code in terminal)
- [ ] Changes saved in editor
- [ ] Metro cache cleared (`npx expo start --clear`)
- [ ] App reloaded (press `r` in Expo terminal or refresh browser)

---

## 🎯 For Your Current Issue

**To see the cashier portal:**

1. **Stop all running terminals** (Ctrl+C)
2. **Navigate to mobile app**:

   ```powershell
   cd apps\mobile
   ```

3. **Start with cache clear**:

   ```powershell
   npx expo start --clear
   ```

4. **Press `w`** for web browser
5. **Login**: `cashier@university.edu` / `password`
6. **You should now see**: Cashier Portal with your name!
