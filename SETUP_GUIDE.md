# U-OS Setup Scripts

## Quick Reference

### 🚀 Normal Start (Recommended)
```batch
setup.bat
```
**What it does:**
- ✅ Checks if database is running (starts only if needed)
- ✅ Checks if backend is running (starts only if needed)
- ✅ Checks if mobile app is running (starts only if needed)
- ❌ Does NOT clear cache
- ❌ Does NOT reset database

**Use when:** You want to start/resume work

---

### 🔄 Full Reset
```batch
setup.bat --full
```
**What it does:**
- ✅ Regenerates Prisma client
- ✅ Pushes schema to database
- ✅ Reseeds database with test data
- ✅ Clears Metro bundler cache
- ✅ Starts all services

**Use when:**
- Database schema changed
- You added new seed data
- Cache is corrupted
- Something is broken and needs a clean slate

---

### ⚡ Quick Restart
```batch
restart.bat
```
**What it does:**
- Stops all Node.js processes (backend + mobile)
- Restarts both services
- ❌ Does NOT touch database or cache

**Use when:**
- Code changes aren't being picked up
- Backend needs a fresh start
- You want to restart without waiting for setup.bat checks

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Mobile Web | 8081 | http://localhost:8081 |
| PostgreSQL | 5433 | localhost:5433 |

---

## Common Workflows

### Starting a Fresh Day
```batch
# Just run setup - it'll check what's needed
setup.bat
```

### After Changing Database Schema
```batch
# Full reset to apply schema changes
setup.bat --full
```

### After Editing Backend Code
Backend has **hot reload** - just save the file!
- Watch backend terminal for "File change detected"
- If it doesn't reload: use `restart.bat`

### After Editing Mobile Code
Mobile has **fast refresh** - just save the file!
- If changes don't appear: press `r` in Expo terminal
- If still not working: `Ctrl+Shift+R` in browser
- Last resort: `setup.bat --full`

### Something is Broken
1. Try `restart.bat` first (quick)
2. If still broken: `setup.bat --full` (thorough)
3. If STILL broken: Check `TROUBLESHOOTING.md`

---

## Environment Variables

All configured in `.env` files:
- `packages/database/.env` - Database connection
- `apps/backend/.env` - Backend config (if needed)
- `apps/mobile/.env` - Mobile config (if needed)

---

## Docker Commands

```batch
# Check if database container is running
docker ps

# View database logs
docker logs uos_db

# Stop database
docker-compose down

# Start database
docker-compose up -d

# Completely remove database (destroys data!)
docker-compose down -v
```

---

## Database Commands

```batch
# Generate Prisma client (after schema.prisma changes)
npm run db:generate --workspace=@u-os/database

# Push schema to database
npm run db:push --workspace=@u-os/database

# Seed database with test data
npm run db:seed --workspace=@u-os/database

# Open Prisma Studio (database GUI)
npm run db:studio --workspace=@u-os/database
```

---

## Troubleshooting Quick Fixes

### "Port 3000 already in use"
```batch
# Kill node processes
taskkill /F /IM node.exe

# Then restart
setup.bat
```

### "Database connection failed"
```batch
# Restart Docker container
docker-compose restart
```

### "Module not found" errors
```batch
# Reinstall dependencies
npm install

# Then regenerate Prisma client
npm run db:generate --workspace=@u-os/database
```

### Mobile app shows white screen
```batch
# Full reset with cache clear
setup.bat --full
```

---

## File Watcher Limits (Linux/Mac)

If you get file watching errors:
```bash
# Increase inotify limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

(Windows users don't need this)
