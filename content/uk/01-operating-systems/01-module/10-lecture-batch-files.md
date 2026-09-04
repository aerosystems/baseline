---
title: "Командні файли та структура команд пакетних файлів"
type: lecture
order: 10
preview: "Batch-файли, змінні, умови, цикли."
---

## Що таке пакетний файл?

**Batch-файл (пакетний файл)** — текстовий файл з командами CMD, які виконуються послідовно. Це найпростіший спосіб автоматизувати повторювані задачі в Windows.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BATCH-ФАЙЛ                                   │
│                                                                 │
│   backup.bat                                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ @echo off                                                │  │
│   │ echo Starting backup...                                  │  │
│   │ xcopy C:\Data D:\Backup /s /y                           │  │
│   │ echo Backup complete!                                    │  │
│   │ pause                                                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Запуск:                                                      │
│   • Подвійний клік                                             │
│   • cmd.exe → backup.bat                                       │
│   • Планувальник завдань (Task Scheduler)                      │
│                                                                 │
│   Розширення: .bat або .cmd (еквівалентні)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Структура batch-файлу

### Базовий шаблон

```batch
@echo off
rem ============================================
rem Назва: backup.bat
rem Опис: Резервне копіювання даних
rem Автор: Student
rem Дата: 2024-01-15
rem ============================================

rem Основний код тут
echo Hello, World!

rem Очікування перед закриттям вікна
pause
```

### Ключові команди

| Команда | Опис |
|---------|------|
| `@echo off` | Вимкнути відображення команд |
| `echo` | Вивести текст |
| `rem` | Коментар |
| `pause` | Пауза (натисніть будь-яку клавішу) |
| `cls` | Очистити екран |
| `exit` | Завершити виконання |
| `call` | Викликати інший batch-файл |
| `goto` | Перейти до мітки |
| `setlocal` | Локальна область змінних |

## Змінні

### Встановлення та використання

```batch
@echo off

rem Встановлення змінної
set NAME=John
set AGE=20
set "MESSAGE=Hello, World!"

rem Використання змінної (з %)
echo Name: %NAME%
echo Age: %AGE%
echo %MESSAGE%

rem Арифметика
set /a RESULT=5+3
set /a YEAR=2024
set /a NEXT_YEAR=%YEAR%+1
echo %YEAR% + 1 = %NEXT_YEAR%

rem Введення від користувача
set /p USERNAME=Enter your name:
echo Hello, %USERNAME%!

pause
```

### Системні змінні

```
┌─────────────────────────────────────────────────────────────────┐
│                    СИСТЕМНІ ЗМІННІ                              │
│                                                                 │
│   %DATE%          → 15.01.2024                                 │
│   %TIME%          → 14:30:25.50                                │
│   %RANDOM%        → випадкове число 0-32767                    │
│                                                                 │
│   %CD%            → поточний каталог                           │
│   %USERPROFILE%   → C:\Users\Username                          │
│   %TEMP%          → каталог для тимчасових файлів             │
│   %COMPUTERNAME%  → ім'я комп'ютера                           │
│   %USERNAME%      → ім'я користувача                           │
│                                                                 │
│   %0              → ім'я batch-файлу                           │
│   %1, %2, ...     → параметри командного рядка                 │
│   %*              → всі параметри                              │
│   %ERRORLEVEL%    → код повернення попередньої команди         │
└─────────────────────────────────────────────────────────────────┘
```

```batch
@echo off
echo Current directory: %CD%
echo User: %USERNAME% on %COMPUTERNAME%
echo Date: %DATE% Time: %TIME%
echo Random: %RANDOM%

rem Параметри скрипта
echo Script name: %0
echo First argument: %1
echo All arguments: %*
```

### Розширення змінних

```batch
@echo off
set FILEPATH=C:\Users\Student\Documents\report.txt

rem Тільки ім'я файлу
echo Filename: %~n1

rem Розширення
echo Extension: %~x1

rem Повний шлях
echo Full path: %~f1

rem Каталог
echo Directory: %~dp1
```

## Умовні оператори (IF)

### Базовий синтаксис

```batch
@echo off

rem Перевірка рівності
set VALUE=10
if %VALUE%==10 echo Value is 10

rem З else
if %VALUE%==10 (
    echo Value is ten
) else (
    echo Value is not ten
)

rem Порівняння чисел
if %VALUE% GTR 5 echo Greater than 5
if %VALUE% LSS 20 echo Less than 20
if %VALUE% GEQ 10 echo Greater or equal to 10
if %VALUE% LEQ 10 echo Less or equal to 10
if %VALUE% NEQ 5 echo Not equal to 5
```

### Оператори порівняння

| Оператор | Значення | Приклад |
|----------|----------|---------|
| `EQU` | дорівнює | `if %a% EQU %b%` |
| `NEQ` | не дорівнює | `if %a% NEQ 0` |
| `LSS` | менше | `if %a% LSS 10` |
| `LEQ` | менше або дорівнює | `if %a% LEQ 10` |
| `GTR` | більше | `if %a% GTR 5` |
| `GEQ` | більше або дорівнює | `if %a% GEQ 5` |

### Перевірка існування

```batch
@echo off

rem Чи існує файл?
if exist "C:\data\file.txt" (
    echo File exists
) else (
    echo File not found
)

rem Чи існує каталог?
if exist "C:\data\" (
    echo Directory exists
)

rem Чи визначена змінна?
if defined MYVAR (
    echo MYVAR is defined: %MYVAR%
) else (
    echo MYVAR is not defined
)

rem Перевірка коду помилки
copy file.txt backup.txt
if %ERRORLEVEL% EQU 0 (
    echo Copy successful
) else (
    echo Copy failed with error %ERRORLEVEL%
)

rem Скорочений варіант
copy file.txt backup.txt && echo Success || echo Failed
```

### Порівняння рядків

```batch
@echo off
set /p ANSWER=Continue? (Y/N):

rem Регістронезалежне порівняння
if /i "%ANSWER%"=="Y" (
    echo Continuing...
) else if /i "%ANSWER%"=="N" (
    echo Exiting...
    exit /b
) else (
    echo Invalid input
)
```

## Цикли (FOR)

### Цикл по списку

```batch
@echo off

rem Ітерація по списку
for %%a in (apple banana cherry) do (
    echo Fruit: %%a
)

rem Ітерація по файлах
for %%f in (*.txt) do (
    echo Processing: %%f
)

rem Ітерація по файлах рекурсивно
for /r C:\Data %%f in (*.log) do (
    echo Found: %%f
)
```

**Важливо:** В batch-файлах використовуйте `%%a`, в командному рядку — `%a`.

### Числовий цикл

```batch
@echo off

rem Від 1 до 10
for /l %%i in (1,1,10) do (
    echo Number: %%i
)

rem Від 0 до 100 з кроком 10
for /l %%i in (0,10,100) do (
    echo %%i%%
)

rem Зворотній відлік
for /l %%i in (10,-1,1) do (
    echo %%i...
)
echo Liftoff!
```

### Цикл по вмісту файлу

```batch
@echo off

rem Читання файлу рядок за рядком
for /f "delims=" %%line in (input.txt) do (
    echo Line: %%line
)

rem Парсинг CSV (розділювач — кома)
for /f "tokens=1,2,3 delims=," %%a in (data.csv) do (
    echo Name: %%a, Age: %%b, City: %%c
)

rem Результат команди
for /f %%i in ('dir /b *.txt') do (
    echo File: %%i
)
```

### Опції FOR /F

| Опція | Опис |
|-------|------|
| `delims=,` | Розділювач (за замовч. пробіл, таб) |
| `tokens=1,2,3` | Які поля брати |
| `skip=1` | Пропустити перші N рядків |
| `eol=;` | Символ коментаря |
| `usebackq` | Використовувати `` ` `` для команд |

## Мітки та переходи

```batch
@echo off

:menu
cls
echo ================================
echo         MAIN MENU
echo ================================
echo 1. Option One
echo 2. Option Two
echo 3. Exit
echo ================================
set /p CHOICE=Enter choice:

if "%CHOICE%"=="1" goto option1
if "%CHOICE%"=="2" goto option2
if "%CHOICE%"=="3" goto end
goto menu

:option1
echo You selected Option One
pause
goto menu

:option2
echo You selected Option Two
pause
goto menu

:end
echo Goodbye!
exit /b
```

## Функції (підпрограми)

```batch
@echo off

rem Виклик функції
call :greet John
call :greet Alice

rem Функція з поверненням значення
call :add 5 3
echo Result: %RESULT%

goto :eof

rem === Функції ===

:greet
echo Hello, %~1!
exit /b

:add
set /a RESULT=%~1+%~2
exit /b
```

## Практичні приклади

### 1. Бекап з датою

```batch
@echo off
setlocal

rem Створити ім'я бекапу з датою
set DATESTAMP=%DATE:~6,4%-%DATE:~3,2%-%DATE:~0,2%
set BACKUP_DIR=D:\Backups\%DATESTAMP%

echo Creating backup in %BACKUP_DIR%...
mkdir "%BACKUP_DIR%" 2>nul
xcopy "C:\Projects\*.*" "%BACKUP_DIR%\" /s /e /y

if %ERRORLEVEL% EQU 0 (
    echo Backup completed successfully!
) else (
    echo Backup failed with error %ERRORLEVEL%
)

pause
```

### 2. Очищення тимчасових файлів

```batch
@echo off
echo Cleaning temporary files...

rem Видалення тимчасових файлів
del /q /s "%TEMP%\*.*" 2>nul
rd /s /q "%TEMP%\*" 2>nul

rem Очищення кошика (потрібні права)
rd /s /q C:\$Recycle.Bin 2>nul

echo Cleanup complete!
pause
```

### 3. Перевірка доступності сервера

```batch
@echo off
setlocal

set SERVER=google.com
set LOG=ping_log.txt

echo Monitoring %SERVER%... (Ctrl+C to stop)
echo Started: %DATE% %TIME% > %LOG%

:loop
ping -n 1 %SERVER% | find "TTL=" >nul
if %ERRORLEVEL% EQU 0 (
    echo %TIME% - %SERVER% is UP >> %LOG%
    echo [OK] %SERVER% is UP
) else (
    echo %TIME% - %SERVER% is DOWN >> %LOG%
    echo [FAIL] %SERVER% is DOWN
)

timeout /t 60 /nobreak >nul
goto loop
```

### 4. Меню вибору з підтвердженням

```batch
@echo off
setlocal enabledelayedexpansion

:menu
cls
echo ========================================
echo       FILE OPERATIONS MENU
echo ========================================
echo.
echo  [1] List files in current directory
echo  [2] Create new folder
echo  [3] Delete all .tmp files
echo  [4] Show system info
echo  [5] Exit
echo.
echo ========================================
set /p CHOICE=Enter your choice (1-5):

if "%CHOICE%"=="1" (
    echo.
    dir /b
    echo.
    pause
    goto menu
)

if "%CHOICE%"=="2" (
    set /p FOLDERNAME=Enter folder name:
    mkdir "!FOLDERNAME!" 2>nul && echo Folder created || echo Failed
    pause
    goto menu
)

if "%CHOICE%"=="3" (
    set /p CONFIRM=Delete all .tmp files? (Y/N):
    if /i "!CONFIRM!"=="Y" (
        del /s /q *.tmp 2>nul
        echo Done!
    )
    pause
    goto menu
)

if "%CHOICE%"=="4" (
    systeminfo | findstr /c:"OS Name" /c:"OS Version" /c:"Total Physical Memory"
    pause
    goto menu
)

if "%CHOICE%"=="5" (
    echo Goodbye!
    exit /b
)

echo Invalid choice!
timeout /t 2 >nul
goto menu
```

## Обробка помилок

```batch
@echo off
setlocal

rem Перевірка аргументів
if "%~1"=="" (
    echo Usage: %0 ^<filename^>
    exit /b 1
)

rem Перевірка існування файлу
if not exist "%~1" (
    echo Error: File "%~1" not found
    exit /b 2
)

rem Виконання з перевіркою
copy "%~1" backup.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error: Copy failed
    exit /b %ERRORLEVEL%
)

echo Success!
exit /b 0
```

## Delayed Expansion

```batch
@echo off
setlocal enabledelayedexpansion

rem Проблема: змінна всередині блоку не оновлюється
set COUNT=0
for %%f in (*.txt) do (
    set /a COUNT=!COUNT!+1
    echo !COUNT!: %%f
)
echo Total: !COUNT! files

rem Без enabledelayedexpansion це не працює правильно!
```

## Підсумок

| Конструкція | Синтаксис |
|-------------|-----------|
| **Змінна** | `set VAR=value`, `%VAR%` |
| **Введення** | `set /p VAR=Prompt: ` |
| **Арифметика** | `set /a RESULT=5+3` |
| **Умова** | `if %VAR%==value (...)` |
| **Цикл по списку** | `for %%a in (...) do (...)` |
| **Числовий цикл** | `for /l %%i in (start,step,end) do (...)` |
| **Файловий цикл** | `for /f %%a in (file.txt) do (...)` |
| **Мітка** | `:label` |
| **Перехід** | `goto label` |
| **Функція** | `call :function args` |
| **Коментар** | `rem text` або `:: text` |

**Поради:**
- Завжди починайте з `@echo off`
- Використовуйте `setlocal` для ізоляції змінних
- Додавайте `pause` в кінці для перегляду результату
- Перевіряйте `%ERRORLEVEL%` після критичних операцій
- Для складної логіки краще PowerShell

На наступній лекції розглянемо операційну систему Linux.
