---
title: "Командний режим роботи в ОС Windows"
type: lecture
order: 9
preview: "cmd.exe, PowerShell, базові команди."
---

## Навіщо командний рядок, коли є GUI?

Багато адміністративних задач неможливо виконати через графічний інтерфейс:
- Масові операції з файлами (перейменувати 1000 файлів за шаблоном)
- Автоматизація (щоденний бекап о 3:00 ночі)
- Віддалене керування серверами без GUI
- Скриптування повторюваних дій

Windows має два основних інтерпретатори командного рядка: **CMD** (класичний) та **PowerShell** (сучасний).

## CMD vs PowerShell

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMD vs POWERSHELL                            │
│                                                                 │
│   CMD (cmd.exe)                    PowerShell (pwsh.exe)        │
│   ═══════════════                  ══════════════════           │
│                                                                 │
│   • З 1987 року (MS-DOS)           • З 2006 року               │
│   • Текстові команди               • Об'єктно-орієнтований     │
│   • Обмежені можливості            • Повний доступ до .NET     │
│   • Batch-файли (.bat, .cmd)       • Скрипти (.ps1)            │
│   • Сумісність зі старими          • Сучасна автоматизація     │
│     скриптами                      • Кросплатформний (7+)      │
│                                                                 │
│   ┌─────────────────────┐          ┌─────────────────────┐     │
│   │ C:\> dir            │          │ PS C:\> Get-ChildItem│     │
│   │ C:\> copy file.txt  │          │ PS C:\> Copy-Item    │     │
│   │ C:\> del *.tmp      │          │ PS C:\> Remove-Item  │     │
│   └─────────────────────┘          └─────────────────────┘     │
│                                                                 │
│   Висновок: CMD для простих задач, PowerShell для всього       │
└─────────────────────────────────────────────────────────────────┘
```

## Запуск командного рядка

```
┌─────────────────────────────────────────────────────────────────┐
│                    СПОСОБИ ЗАПУСКУ                              │
│                                                                 │
│   CMD:                                                          │
│   • Win+R → cmd → Enter                                        │
│   • Пошук → "cmd" або "Command Prompt"                         │
│   • Win+X → Terminal (Admin)                                   │
│                                                                 │
│   PowerShell:                                                   │
│   • Win+R → powershell → Enter                                 │
│   • Пошук → "PowerShell" або "pwsh"                            │
│   • Win+X → Terminal (Admin)                                   │
│                                                                 │
│   Windows Terminal (рекомендовано):                            │
│   • Об'єднує CMD, PowerShell, WSL в одному вікні              │
│   • Вкладки, панелі, теми                                      │
│   • Налаштування через JSON                                    │
│                                                                 │
│   Запуск з правами адміністратора:                             │
│   • Ctrl+Shift+Enter замість Enter                             │
│   • Правий клік → "Run as administrator"                       │
└─────────────────────────────────────────────────────────────────┘
```

## Базові команди CMD

### Навігація файловою системою

```
┌─────────────────────────────────────────────────────────────────┐
│                    НАВІГАЦІЯ В CMD                              │
│                                                                 │
│   C:\Users\User> cd Desktop                                    │
│   C:\Users\User\Desktop> cd ..                                 │
│   C:\Users\User> cd \                                          │
│   C:\> cd "Program Files"                                      │
│   C:\Program Files> D:                                         │
│   D:\>                                                          │
└─────────────────────────────────────────────────────────────────┘
```

| Команда | Опис | Приклад |
|---------|------|---------|
| `cd` | Змінити каталог | `cd Desktop` |
| `cd ..` | Перейти на рівень вище | `cd ..` |
| `cd \` | Перейти до кореня диску | `cd \` |
| `D:` | Змінити диск | `D:` |
| `dir` | Показати вміст каталогу | `dir /a` |
| `tree` | Показати дерево каталогів | `tree /f` |

```cmd
:: Практичні приклади
dir                     :: Вміст поточного каталогу
dir /a                  :: + приховані файли
dir /s *.txt            :: Пошук рекурсивно
dir /o:d                :: Сортувати за датою
dir /o:-s               :: Сортувати за розміром (спадання)

tree                    :: Дерево каталогів
tree /f                 :: + файли
```

### Робота з файлами та каталогами

| Команда | Опис | Приклад |
|---------|------|---------|
| `copy` | Копіювати файл | `copy file.txt backup.txt` |
| `xcopy` | Копіювати з підкаталогами | `xcopy /s source dest` |
| `robocopy` | Надійне копіювання | `robocopy src dst /mir` |
| `move` | Перемістити/перейменувати | `move old.txt new.txt` |
| `del` | Видалити файл | `del *.tmp` |
| `rd` | Видалити каталог | `rd /s /q folder` |
| `md` | Створити каталог | `md newfolder` |
| `ren` | Перейменувати | `ren old.txt new.txt` |

```cmd
:: Практичні приклади
copy file.txt D:\backup\            :: Копіювати на інший диск
copy *.jpg photos\                  :: Копіювати всі jpg
xcopy /s /e source\ dest\           :: Копіювати з підкаталогами

robocopy C:\source D:\dest /mir     :: Дзеркальне копіювання
robocopy source dest /mov           :: Перемістити (не копіювати)

del /q *.tmp                        :: Видалити без підтвердження
del /s /q temp\                     :: Видалити рекурсивно

md "New Folder"                     :: Створити каталог
rd /s /q "Old Folder"               :: Видалити каталог з вмістом
```

### Перегляд та редагування файлів

```cmd
:: Показати вміст файлу
type file.txt

:: Перші/останні рядки (PowerShell-style в CMD не працює)
more file.txt                       :: Посторінково

:: Пошук тексту у файлі
find "error" logfile.txt
findstr /i "error\|warning" *.log   :: Регулярні вирази

:: Редагування
notepad file.txt                    :: Відкрити в Notepad
code file.txt                       :: Відкрити в VS Code (якщо встановлено)
```

### Інформація про систему

```cmd
:: Системна інформація
systeminfo                          :: Повна інформація
hostname                            :: Ім'я комп'ютера
whoami                              :: Поточний користувач
ver                                 :: Версія Windows

:: Мережа
ipconfig                            :: IP-адреси
ipconfig /all                       :: Детально
ping google.com                     :: Перевірка з'єднання
tracert google.com                  :: Маршрут до хоста
netstat -an                         :: Активні з'єднання
nslookup google.com                 :: DNS-запит

:: Процеси
tasklist                            :: Список процесів
taskkill /im notepad.exe            :: Завершити за іменем
taskkill /pid 1234                  :: Завершити за PID
```

## Базові команди PowerShell

### Концепція Cmdlet

PowerShell використовує команди у форматі **Verb-Noun** (Дієслово-Іменник):

```
┌─────────────────────────────────────────────────────────────────┐
│                    СТРУКТУРА CMDLET                             │
│                                                                 │
│   Get-Process                                                   │
│   ├── Get      ← Дієслово (що робити)                          │
│   └── Process  ← Іменник (з чим)                               │
│                                                                 │
│   Типові дієслова:                                             │
│   • Get     — отримати інформацію                              │
│   • Set     — змінити значення                                 │
│   • New     — створити новий об'єкт                            │
│   • Remove  — видалити                                         │
│   • Start   — запустити                                        │
│   • Stop    — зупинити                                         │
│   • Copy    — копіювати                                        │
│   • Move    — перемістити                                      │
│   • Test    — перевірити                                       │
│                                                                 │
│   Приклади:                                                    │
│   Get-Service      Set-Location      New-Item                  │
│   Get-Process      Set-Content       Remove-Item               │
│   Get-ChildItem    Set-Variable      Start-Process             │
└─────────────────────────────────────────────────────────────────┘
```

### Еквіваленти CMD → PowerShell

| CMD | PowerShell | Аліас |
|-----|------------|-------|
| `dir` | `Get-ChildItem` | `ls`, `dir`, `gci` |
| `cd` | `Set-Location` | `cd`, `sl` |
| `copy` | `Copy-Item` | `cp`, `copy` |
| `move` | `Move-Item` | `mv`, `move` |
| `del` | `Remove-Item` | `rm`, `del` |
| `md` | `New-Item -Type Directory` | `mkdir` |
| `type` | `Get-Content` | `cat`, `gc` |
| `cls` | `Clear-Host` | `clear`, `cls` |

### Навігація

```powershell
# Навігація
Get-Location                        # Поточний каталог (pwd)
Set-Location C:\Users               # Змінити каталог (cd)
Set-Location ..                     # На рівень вище
Push-Location D:\temp               # Зберегти поточний, перейти
Pop-Location                        # Повернутися

# Перегляд
Get-ChildItem                       # Вміст каталогу (ls)
Get-ChildItem -Hidden               # + приховані
Get-ChildItem -Recurse -Filter *.txt  # Рекурсивний пошук
Get-ChildItem | Sort-Object Length -Descending  # Сортування
```

### Робота з файлами

```powershell
# Створення
New-Item -Path "file.txt" -ItemType File
New-Item -Path "folder" -ItemType Directory
"Hello World" | Out-File file.txt
Set-Content file.txt "New content"

# Читання
Get-Content file.txt
Get-Content file.txt -Head 10       # Перші 10 рядків
Get-Content file.txt -Tail 5        # Останні 5 рядків
Select-String "error" *.log         # Grep-аналог

# Копіювання/переміщення
Copy-Item file.txt backup.txt
Copy-Item folder -Recurse newfolder
Move-Item old.txt new.txt

# Видалення
Remove-Item file.txt
Remove-Item folder -Recurse -Force  # Каталог з вмістом
```

### Pipeline — потужність PowerShell

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE (КОНВЕЄР)                           │
│                                                                 │
│   CMD pipeline передає ТЕКСТ:                                  │
│   dir | find "txt"                                             │
│   └────────────────┘                                           │
│   "file.txt" — просто рядок символів                           │
│                                                                 │
│   PowerShell pipeline передає ОБ'ЄКТИ:                         │
│   Get-ChildItem | Where-Object {$_.Length -gt 1MB}             │
│   └────────────────────────────────────────────────┘           │
│   Кожен елемент — об'єкт з властивостями:                      │
│   • Name, Length, LastWriteTime, FullName...                   │
│                                                                 │
│   Це дозволяє:                                                 │
│   • Фільтрувати за будь-якою властивістю                       │
│   • Сортувати                                                  │
│   • Групувати                                                  │
│   • Обчислювати                                                │
└─────────────────────────────────────────────────────────────────┘
```

```powershell
# Приклади pipeline
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5

Get-ChildItem -Recurse | Where-Object {$_.Length -gt 10MB} |
    Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}

Get-Service | Where-Object Status -eq "Running" | Measure-Object

Get-EventLog System -Newest 100 |
    Where-Object {$_.EntryType -eq "Error"} |
    Group-Object Source
```

### Системна інформація

```powershell
# Комп'ютер
Get-ComputerInfo
$env:COMPUTERNAME
$env:USERNAME

# Процеси
Get-Process
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10
Stop-Process -Name "notepad" -Force

# Служби
Get-Service
Get-Service | Where-Object Status -eq "Running"
Start-Service -Name "Spooler"
Stop-Service -Name "Spooler"

# Мережа
Get-NetIPAddress
Get-NetAdapter
Test-Connection google.com
Resolve-DnsName google.com
```

### Довідка

```powershell
# Отримати довідку
Get-Help Get-Process
Get-Help Get-Process -Full
Get-Help Get-Process -Examples
Get-Help *process*                  # Пошук команд

# Оновити довідку (потрібні права адміна)
Update-Help

# Список всіх команд
Get-Command
Get-Command -Verb Get
Get-Command -Noun Process

# Властивості об'єкта
Get-Process | Get-Member
```

## Змінні середовища (Environment Variables)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ЗМІННІ СЕРЕДОВИЩА                            │
│                                                                 │
│   Системні (для всіх):             Користувача:                │
│   • PATH                           • USERPROFILE               │
│   • COMPUTERNAME                   • APPDATA                   │
│   • OS                             • LOCALAPPDATA              │
│   • SYSTEMROOT                     • TEMP                      │
│                                                                 │
│   PATH — список каталогів для пошуку програм:                  │
│   C:\Windows\System32;C:\Windows;C:\Python310;...              │
└─────────────────────────────────────────────────────────────────┘
```

```cmd
:: CMD
echo %PATH%
echo %USERPROFILE%
set MYVAR=Hello
echo %MYVAR%

:: Додати до PATH тимчасово
set PATH=%PATH%;C:\MyProgram

:: Постійно — через GUI:
:: System Properties → Environment Variables
```

```powershell
# PowerShell
$env:PATH
$env:USERPROFILE
$env:MYVAR = "Hello"
$env:MYVAR

# Всі змінні
Get-ChildItem env:

# Додати до PATH
$env:PATH += ";C:\MyProgram"

# Постійно
[Environment]::SetEnvironmentVariable("MYVAR", "Hello", "User")
```

## Практичне завдання

Виконайте наступні команди:

```cmd
:: CMD
:: 1. Дізнатися версію Windows
ver

:: 2. Показати мережеву конфігурацію
ipconfig /all

:: 3. Знайти всі .txt файли в Documents
dir %USERPROFILE%\Documents\*.txt /s

:: 4. Створити структуру каталогів
md project\src project\docs project\tests

:: 5. Системна інформація
systeminfo | find "OS"
```

```powershell
# PowerShell
# 1. Топ-5 процесів за пам'яттю
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 Name, @{N='MB';E={[math]::Round($_.WorkingSet/1MB)}}

# 2. Запущені служби
Get-Service | Where-Object Status -eq Running | Measure-Object

# 3. Файли більше 100 МБ
Get-ChildItem C:\Users -Recurse -ErrorAction SilentlyContinue |
    Where-Object {$_.Length -gt 100MB} |
    Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB)}}

# 4. Історія команд
Get-History

# 5. Версія PowerShell
$PSVersionTable
```

## Підсумок

| Аспект | CMD | PowerShell |
|--------|-----|------------|
| **Рік створення** | 1987 | 2006 |
| **Тип даних** | Текст | Об'єкти |
| **Скрипти** | .bat, .cmd | .ps1 |
| **Автодоповнення** | Обмежене | Tab, Ctrl+Space |
| **Кросплатформність** | Ні | Так (7+) |
| **Рекомендація** | Legacy | Основний інструмент |

**Ключові команди для запам'ятовування:**

| Дія | CMD | PowerShell |
|-----|-----|------------|
| Список файлів | `dir` | `Get-ChildItem` / `ls` |
| Змінити каталог | `cd` | `Set-Location` / `cd` |
| Копіювати | `copy` | `Copy-Item` / `cp` |
| Видалити | `del` | `Remove-Item` / `rm` |
| Вміст файлу | `type` | `Get-Content` / `cat` |
| Процеси | `tasklist` | `Get-Process` |
| Мережа | `ipconfig` | `Get-NetIPAddress` |

На наступній лекції розглянемо створення пакетних файлів (batch scripts) для автоматизації.
