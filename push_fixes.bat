@echo off
echo ============================================
echo   EyE PunE - Push Fixes to GitHub + Vercel
echo ============================================
echo.

cd /d "c:\Users\found\Desktop\EyE PunE Final\Website Final\eyepune"

git add .
git status
echo.

set /p msg="Enter commit message (or press Enter for default): "
if "%msg%"=="" set msg=fix: cron consolidation, drip timeout fix, env documentation

git commit -m "%msg%"
git pull origin main --rebase
git push

echo.
echo ✅ Pushed to GitHub - Vercel will auto-deploy in ~2 minutes
echo.
echo ============================================
echo   ACTION REQUIRED - Manual Steps:
echo ============================================
echo.
echo 1. CRON_SECRET: Verify it's set in Vercel AND GitHub Secrets
echo    - Vercel: https://vercel.com/eyepune/eyepune/settings/environment-variables
echo    - GitHub: https://github.com/[your-org]/eyepune/settings/secrets/actions
echo.
echo 2. RAZORPAY_WEBHOOK_SECRET: Add to Vercel env vars
echo    - Get from: Razorpay Dashboard → Settings → Webhooks
echo.
echo 3. LinkedIn Token: Verify it's in Supabase system_settings
echo    - Table: system_settings, Key: linkedin_config, Value: {"token":"...","urn":"..."}
echo.
pause
