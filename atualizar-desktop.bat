@echo off
set "ORIGEM=%~dp0dist"
set "DESTINO=C:\Users\TIDesigner\Desktop\DaveMotos_PWA_Completo\dist"

echo ==========================================
echo ATUALIZANDO PWA NO DESKTOP
echo ==========================================
echo.
echo Origem: %ORIGEM%
echo Destino: %DESTINO%
echo.

if not exist "%DESTINO%" (
    echo [ERRO] A pasta de destino nao existe ou o caminho esta incorreto.
    echo Verifique se a pasta DaveMotos_PWA_Completo esta no Desktop.
    pause
    exit /b
)

echo Copiando arquivos...
xcopy "%ORIGEM%\*" "%DESTINO%\" /E /I /Y

echo.
echo ==========================================
echo ATUALIZACAO CONCLUIDA!
echo ==========================================
echo.
echo Agora reinicie o servidor na pasta do Desktop.
pause
