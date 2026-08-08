@echo off
rem  Taller — el editor visual, en su propia ventana.
rem
rem    doble clic en este archivo, o:  taller.cmd [puerto]
rem
rem  Hace las tres cosas seguidas: levanta el servidor, abre la ventana y, al
rem  cerrarla, mata el servidor. No hay que encender ni apagar nada a mano.
rem
rem  El servidor hace falta y no se puede quitar. La ventana es una página, y
rem  una página abierta con file:// no puede ni leer los .qb del disco —el
rem  navegador se lo prohíbe— ni ejecutar el Python que compone los modelos ni
rem  escribir en personajes.json. El servidor es lo que le da manos: vive
rem  mientras la ventana esté abierta y se muere con ella.
rem
rem  La ventana va sin barra de direcciones ni pestañas, que es lo que hace que
rem  parezca una aplicación. Se usa el Chromium que Playwright dejó cacheado; si
rem  no está, Edge, que en Windows viene de serie y entiende el mismo --app.
setlocal
set PUERTO=%1
if "%PUERTO%"=="" set PUERTO=8899
set RAIZ=%~dp0
set PERFIL=%TEMP%\aram-taller
set TITULO=taller-servidor-%PUERTO%

rem  Si ya hay un taller abierto en este puerto, se abre otra ventana contra él
rem  en vez de intentar levantar un segundo servidor —que fallaría con el puerto
rem  ocupado— y al cerrarla no se mata nada, que el otro sigue usándolo.
set REUSAR=
netstat -ano -p tcp | findstr /r /c:":%PUERTO% .*LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo Ya hay un taller escuchando en el %PUERTO%; abro otra ventana contra el.
  set REUSAR=1
) else (
  start "%TITULO%" /MIN cmd /c "node "%RAIZ%herramientas\editor\servidor.js" %PUERTO%"
  rem  Un momento para que el puerto esté escuchando antes de abrir la ventana.
  ping -n 2 127.0.0.1 >nul
)

set CHROME=%LOCALAPPDATA%\ms-playwright\chromium-1223\chrome-win64\chrome.exe
if exist "%CHROME%" goto abrir
set CHROME=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe
if exist "%CHROME%" goto abrir
set CHROME=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe
if exist "%CHROME%" goto abrir

echo No encuentro Chromium ni Edge. Abro en el navegador de siempre.
echo Cierra esta consola cuando termines: el servidor se para con ella.
start "" http://localhost:%PUERTO%
goto fin

:abrir
rem  /WAIT: esta consola se queda esperando a que se cierre la ventana. Con su
rem  propio perfil, el navegador no le pasa el encargo a una instancia que ya
rem  estuviera abierta, así que el proceso dura lo que dure la ventana.
start "" /WAIT "%CHROME%" --app=http://localhost:%PUERTO% --user-data-dir="%PERFIL%" --window-size=1400,900 --enable-unsafe-swiftshader

if defined REUSAR goto fin
rem  Ventana cerrada: se lleva por delante el servidor y el python que compone.
taskkill /FI "WINDOWTITLE eq %TITULO%*" /T /F >nul 2>&1

:fin
endlocal
