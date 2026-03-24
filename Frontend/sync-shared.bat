@echo off
echo Syncing shared code to all apps...
echo.

set apps=employee admin maintenance college-dean president deployment-office driver

for %%a in (%apps%) do (
  echo Syncing to %%a...
  xcopy /E /I /Y shared apps\%%a\shared
)

echo.
echo Done! Shared code synced to all apps!
pause
