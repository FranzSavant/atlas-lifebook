@echo off
REM ============================================================
REM  atlas-login.cmd — Login unico de Facebook para el sistema
REM ============================================================
REM  Abre Chrome con el perfil dedicado "AtlasAgent" (separado de
REM  tu Chrome personal). Logueate en Facebook UNA vez en esa
REM  ventana y cerrala. A partir de ahi, el sistema puede leer
REM  los videos/links de Facebook que le mandes — silencioso y local.
REM
REM  Si Facebook te desloguea algun dia, volve a correr este archivo.
REM ============================================================

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo No se encontro Chrome. Edita este archivo con la ruta de tu navegador.
  pause
  exit /b 1
)

start "" "%CHROME%" --user-data-dir="%LocalAppData%\Google\Chrome\User Data\AtlasAgent" https://www.facebook.com

echo.
echo Se abrio el perfil AtlasAgent en Chrome.
echo 1) Logueate en Facebook en esa ventana.
echo 2) Cerrala cuando termines.
echo 3) Listo: el sistema ya puede leer tus links de Facebook.
echo.
pause
