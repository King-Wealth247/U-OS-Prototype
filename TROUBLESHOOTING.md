# Quick Fixes for Common Issues

## ❌ "SurfaceRegistryBinding::startSurface failed" Error

**Cause**: Metro bundler cache corruption or React Native initialization issue.

**Solution**:
```bash
# Stop all running processes
taskkill /F /IM node.exe

# Clear Metro cache
cd apps/mobile
npx expo start --clear

# Or use the full setup script
cd ../..
setup.bat
```

## ❌ Prisma Client outdated

**Symptoms**: `Cannot find module '@prisma/client'` or missing exports like `Role`, `RoomType`

**Solution**:
```bash
cd packages/database
npx prisma generate
npx prisma db push
```

## ❌ Database connection issues

**Check Docker**:
```bash
docker ps
```

Should show `postgres:15-postgis` running.

**Restart Docker**:
```bash
docker-compose down
docker-compose up -d
```

## 🎯 Fresh Start (Recommended)

Run `setup.bat` - it handles everything:
1. Installs dependencies
2. Starts Docker database
3. Generates Prisma client
4. Seeds data (Super Admin, Cashier, Students)
5. Clears React Native cache
6. Launches backend + mobile app

## 📝 Accessing Different Roles

- **Cashier Portal**: Login with `cashier@university.edu` / `password`
- **Super Admin**: `admin@university.edu` / `password`
- **Student**: `std_0@university.edu` / `password`
- **Guest browsing**: `guest_test@university.edu` / `password`

See `test_credentials.md` for complete list.
