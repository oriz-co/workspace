@echo off
call "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
set "PYTHON=C:\Users\C5420321\AppData\Local\Python\pythoncore-3.14-64\python.exe"
echo === MSVC active, python: %PYTHON% ===
"%PYTHON%" --version
where cl.exe
echo.
echo === Hr upgrade via pipx ===
"%PYTHON%" -m pipx upgrade headroom-ai --pip-args "--upgrade --pre"
echo.
echo === Hr version after ===
"C:\Users\C5420321\pipx\venvs\headroom-ai\Scripts\python.exe" -c "from headroom.cli import main; import sys; sys.argv=['headroom','--version']; main()"
