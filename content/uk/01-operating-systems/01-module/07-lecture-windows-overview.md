---
title: "Огляд операційної системи Windows"
type: lecture
order: 7
preview: "Історія Windows, архітектура NT, основні компоненти."
---

## Від MS-DOS до Windows 11

Windows — найпопулярніша операційна система для персональних комп'ютерів з часткою ринку ~70%. За 40 років Microsoft пройшла шлях від простої оболонки над DOS до складної гібридної ОС.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ЕВОЛЮЦІЯ WINDOWS                             │
│                                                                 │
│  1985──1990──1995──2000──2001──2006──2009──2012──2015──2021    │
│    │     │     │     │     │     │     │     │     │     │      │
│    ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼      │
│   1.0   3.0   95    Me    XP  Vista   7     8    10    11      │
│    │     │     │     │     │     │     │     │     │     │      │
│   DOS   DOS   DOS  DOS   NT    NT    NT    NT    NT    NT      │
│   based      32bit      kernel                                  │
│                         │                                       │
│                         └────────────────────────────────────── │
│                            Всі сучасні Windows базуються        │
│                            на архітектурі NT                    │
│                                                                 │
│   Дві лінії:                                                   │
│   • DOS-based: Win 1.0 → 3.x → 95 → 98 → Me (кінець 2000)      │
│   • NT-based:  NT 3.1 → NT 4 → 2000 → XP → Vista → 7 → 10 → 11 │
└─────────────────────────────────────────────────────────────────┘
```

### Ключові віхи

| Рік | Версія | Значення |
|-----|--------|----------|
| 1985 | Windows 1.0 | Перша версія, графічна оболонка над DOS |
| 1990 | Windows 3.0 | Комерційний успіх, 10 млн копій |
| 1993 | Windows NT 3.1 | Нове ядро, 32-біт, захищений режим |
| 1995 | Windows 95 | Start меню, 32-біт API, Plug & Play |
| 2001 | Windows XP | Злиття NT та consumer линій, масовий успіх |
| 2009 | Windows 7 | "Виправлений Vista", золотий стандарт |
| 2015 | Windows 10 | "Остання версія Windows", rolling updates |
| 2021 | Windows 11 | Новий UI, вимоги TPM 2.0, Android apps |

## Архітектура Windows NT

Windows NT (New Technology) — це повністю нова ОС, розроблена з нуля в 1988-1993 роках командою під керівництвом Dave Cutler (раніше працював над VMS у DEC).

```
┌─────────────────────────────────────────────────────────────────┐
│                    АРХІТЕКТУРА WINDOWS NT                       │
│                                                                 │
│   USER MODE                                                     │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              System Processes                     │   │  │
│   │  │  smss.exe │ csrss.exe │ winlogon.exe │ services  │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              Services                             │   │  │
│   │  │  svchost.exe │ spoolsv.exe │ lsass.exe           │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              Applications                         │   │  │
│   │  │  notepad.exe │ chrome.exe │ explorer.exe         │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │  │
│   │  │ Win32 API  │ │  WinRT     │ │    .NET CLR        │   │  │
│   │  │ (kernel32, │ │  (UWP)     │ │  (managed code)    │   │  │
│   │  │  user32)   │ │            │ │                    │   │  │
│   │  └────────────┘ └────────────┘ └────────────────────┘   │  │
│   │                         │                                │  │
│   │  ┌──────────────────────▼───────────────────────────┐   │  │
│   │  │                   NTDLL.DLL                       │   │  │
│   │  │         (Native API, syscall wrapper)             │   │  │
│   │  └──────────────────────┬───────────────────────────┘   │  │
│   │                         │                                │  │
│   └─────────────────────────┼────────────────────────────────┘  │
│                             │ System Call                       │
│   ══════════════════════════╪═══════════════════════════════   │
│                             │                                   │
│   KERNEL MODE               ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              Windows Executive                    │   │  │
│   │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │  │
│   │  │  │   I/O   │ │ Object  │ │ Process │ │ Memory  │ │   │  │
│   │  │  │ Manager │ │ Manager │ │ Manager │ │ Manager │ │   │  │
│   │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │   │  │
│   │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │  │
│   │  │  │Security │ │  Cache  │ │  PnP    │ │ Power   │ │   │  │
│   │  │  │Reference│ │ Manager │ │ Manager │ │ Manager │ │   │  │
│   │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              Windows Kernel                       │   │  │
│   │  │  Scheduling, Interrupts, Exceptions, DPC          │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              Device Drivers                       │   │  │
│   │  │  ntfs.sys │ tcpip.sys │ ndis.sys │ *.sys         │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   │  ┌──────────────────────────────────────────────────┐   │  │
│   │  │              HAL (Hardware Abstraction Layer)     │   │  │
│   │  │         hal.dll — приховує різницю CPU/чіпсетів  │   │  │
│   │  └──────────────────────────────────────────────────┘   │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                      HARDWARE                            │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Основні компоненти ядра Windows

### HAL (Hardware Abstraction Layer)

**hal.dll** — шар між ядром та апаратним забезпеченням.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HAL — АПАРАТНА АБСТРАКЦІЯ                    │
│                                                                 │
│   Ядро Windows (ntoskrnl.exe)                                   │
│   ┌────────────────────────────────────────────────────────┐   │
│   │   Один і той же код ядра                                │   │
│   └──────────────────────────┬─────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│   ┌────────────────────────────────────────────────────────┐   │
│   │                      HAL.DLL                            │   │
│   │   • Таймери                                             │   │
│   │   • Переривання                                         │   │
│   │   • DMA                                                 │   │
│   │   • Специфіка чіпсета                                   │   │
│   └────────────────────────────────────────────────────────┘   │
│            │                 │                 │                │
│            ▼                 ▼                 ▼                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   Intel PC   │  │   AMD PC     │  │   ARM64      │         │
│   │              │  │              │  │   (Surface)  │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│   Завдяки HAL, Windows може працювати на різному залізі        │
│   без зміни коду ядра                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Windows Kernel (ntoskrnl.exe)

Файл **ntoskrnl.exe** — серце Windows. Містить:

| Компонент | Функція |
|-----------|---------|
| **Scheduler** | Планування потоків (не процесів!) |
| **Interrupt Dispatcher** | Обробка апаратних переривань |
| **Exception Handler** | Обробка виключень (access violation, etc.) |
| **DPC/APC** | Відкладене виконання процедур |

### Windows Executive

Набір менеджерів, що реалізують основний функціонал:

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTIVE MANAGERS                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    I/O MANAGER                           │   │
│  │  • Управління драйверами                                 │   │
│  │  • IRP (I/O Request Packets)                            │   │
│  │  • Plug and Play                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   OBJECT MANAGER                         │   │
│  │  • Все в Windows — об'єкт (файли, процеси, потоки...)   │   │
│  │  • Іменування, безпека, підрахунок посилань             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   PROCESS MANAGER                        │   │
│  │  • Створення/завершення процесів і потоків              │   │
│  │  • Job objects (групи процесів)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   MEMORY MANAGER                         │   │
│  │  • Віртуальна пам'ять                                   │   │
│  │  • Working sets, page faults                            │   │
│  │  • Section objects (shared memory)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               SECURITY REFERENCE MONITOR                 │   │
│  │  • Перевірка прав доступу                               │   │
│  │  • Access tokens, ACL                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Процеси в Windows

Windows використовує **потоки (threads)** як одиниці планування, а не процеси.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ПРОЦЕС WINDOWS                               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    PROCESS (chrome.exe)                  │  │
│   │                                                          │  │
│   │   PID: 1234                                              │  │
│   │   Private virtual address space: 4GB (32-bit)            │  │
│   │                                  128TB (64-bit)          │  │
│   │                                                          │  │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │  │
│   │   │ Thread  │  │ Thread  │  │ Thread  │  │ Thread  │    │  │
│   │   │   #1    │  │   #2    │  │   #3    │  │   #4    │    │  │
│   │   │ (main)  │  │ (UI)    │  │ (network)  │ (render) │   │  │
│   │   └─────────┘  └─────────┘  └─────────┘  └─────────┘    │  │
│   │                                                          │  │
│   │   Handle table: файли, реєстр, об'єкти ядра             │  │
│   │   Security token: права користувача                      │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Потік = одиниця планування                                   │
│   Процес = контейнер для потоків + ресурсів                   │
└─────────────────────────────────────────────────────────────────┘
```

**PowerShell команди для роботи з процесами:**

```powershell
# Список процесів
Get-Process

# Детальна інформація
Get-Process chrome | Format-List *

# Потоки процесу
(Get-Process chrome).Threads.Count

# Топ за пам'яттю
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10

# Створити новий процес
Start-Process notepad.exe

# Завершити процес
Stop-Process -Name "notepad"
```

## Реєстр Windows (Registry)

Централізована база даних конфігурації системи.

```
┌─────────────────────────────────────────────────────────────────┐
│                    СТРУКТУРА РЕЄСТРУ                            │
│                                                                 │
│   HKEY_LOCAL_MACHINE (HKLM)                                    │
│   ├── HARDWARE        ← Виявлене обладнання (volatile)         │
│   ├── SAM             ← Security Account Manager               │
│   ├── SECURITY        ← Політики безпеки                       │
│   ├── SOFTWARE        ← Налаштування програм (для всіх)        │
│   │   ├── Microsoft                                            │
│   │   │   └── Windows                                          │
│   │   │       └── CurrentVersion                               │
│   │   └── ...                                                  │
│   └── SYSTEM          ← Конфігурація завантаження             │
│       └── CurrentControlSet                                    │
│           └── Services                                         │
│                                                                 │
│   HKEY_CURRENT_USER (HKCU)                                     │
│   ├── SOFTWARE        ← Налаштування програм (для користувача) │
│   ├── Environment     ← Змінні середовища                      │
│   └── ...                                                      │
│                                                                 │
│   HKEY_CLASSES_ROOT (HKCR)                                     │
│   └── Асоціації файлів, COM об'єкти                           │
│                                                                 │
│   HKEY_USERS (HKU)                                             │
│   └── Профілі всіх користувачів                               │
└─────────────────────────────────────────────────────────────────┘
```

**Робота з реєстром:**

```powershell
# Читання ключа
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"

# Перегляд версії Windows
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").ProductName

# Список служб з реєстру
Get-ChildItem "HKLM:\SYSTEM\CurrentControlSet\Services" | Measure-Object

# Змінні середовища
Get-ItemProperty "HKCU:\Environment"
```

```cmd
:: CMD команди
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v ProductName
reg query "HKLM\SYSTEM\CurrentControlSet\Services" /s
```

## Файлова система NTFS

**NTFS (New Technology File System)** — стандартна файлова система Windows з 1993 року.

```
┌─────────────────────────────────────────────────────────────────┐
│                    МОЖЛИВОСТІ NTFS                              │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Журналювання (Journaling)                               │  │
│   │  • $LogFile зберігає транзакції                         │  │
│   │  • Відновлення після збою                               │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Безпека                                                 │  │
│   │  • ACL (Access Control Lists) на рівні файлів          │  │
│   │  • Аудит доступу                                        │  │
│   │  • EFS шифрування                                       │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Розширені атрибути                                     │  │
│   │  • Alternate Data Streams (ADS)                         │  │
│   │  • Sparse files                                         │  │
│   │  • Compression                                          │  │
│   │  • Hard links, Symbolic links                           │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Квоти та ліміти                                        │  │
│   │  • Disk quotas per user                                 │  │
│   │  • Максимальний розмір файлу: 16 EB (теоретично)       │  │
│   │  • Максимальний розмір тому: 256 TB (практично)        │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Практичні команди:**

```powershell
# Інформація про диск
Get-Volume

# NTFS-специфічні атрибути
Get-Item C:\Windows\System32\cmd.exe | Format-List *

# Права доступу (ACL)
Get-Acl C:\Windows\System32\cmd.exe | Format-List

# Alternate Data Streams
Get-Item file.txt -Stream *

# Жорсткі посилання
fsutil hardlink list C:\Windows\System32\cmd.exe
```

## Системні служби Windows

```
┌─────────────────────────────────────────────────────────────────┐
│                    СЛУЖБИ WINDOWS                               │
│                                                                 │
│   Служба = фоновий процес без UI                               │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │             Services Control Manager (SCM)               │  │
│   │                    services.exe                          │  │
│   └─────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│       ┌─────────────────────┼─────────────────────┐            │
│       │                     │                     │            │
│       ▼                     ▼                     ▼            │
│   ┌─────────┐         ┌─────────┐         ┌─────────┐         │
│   │svchost  │         │svchost  │         │ Custom  │         │
│   │ (group1)│         │ (group2)│         │ service │         │
│   │         │         │         │         │         │         │
│   │ • Dnscache│       │ • Themes │        │ • MySQL │         │
│   │ • Dhcp   │        │ • Audio  │        │ • NGINX │         │
│   │ • ...    │        │ • ...    │        │         │         │
│   └─────────┘         └─────────┘         └─────────┘         │
│                                                                 │
│   svchost.exe — host process для DLL-служб                     │
│   Один svchost може хостити багато служб                       │
└─────────────────────────────────────────────────────────────────┘
```

**Керування службами:**

```powershell
# Список служб
Get-Service

# Запущені служби
Get-Service | Where-Object Status -eq "Running"

# Зупинити службу
Stop-Service -Name "Spooler"

# Запустити службу
Start-Service -Name "Spooler"

# Тип запуску
Get-Service Spooler | Select-Object Name, StartType

# Залежності
Get-Service Spooler | Select-Object -ExpandProperty DependentServices
```

```cmd
:: CMD команди
sc query
sc query Spooler
sc stop Spooler
sc start Spooler
sc qc Spooler
```

## Практичне завдання

Дослідіть вашу Windows-систему:

```powershell
# 1. Версія Windows
Get-ComputerInfo | Select-Object WindowsVersion, WindowsBuildLabEx

# 2. Час роботи
(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime

# 3. Кількість процесів/потоків
(Get-Process).Count
(Get-Process | ForEach-Object { $_.Threads.Count } | Measure-Object -Sum).Sum

# 4. Використання пам'яті
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5 Name, @{N='MB';E={[math]::Round($_.WorkingSet/1MB,2)}}

# 5. Системні служби
Get-Service | Where-Object {$_.Status -eq "Running"} | Measure-Object

# 6. Інформація про диски
Get-Volume | Where-Object {$_.DriveLetter}
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    АРХІТЕКТУРА WINDOWS У ENTERPRISE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   MICROSOFT / AZURE                                                          │
│   ├── Hyper-V побудований на архітектурі NT                                 │
│   ├── Azure використовує модифіковане ядро Windows Server                   │
│   └── Мільйони серверів працюють на Windows Server Datacenter               │
│                                                                              │
│   БАНКІВСЬКИЙ СЕКТОР (ПриватБанк, Monobank інфраструктура)                  │
│   ├── Active Directory для автентифікації 10,000+ співробітників            │
│   ├── Registry GPO для централізованих політик безпеки                      │
│   └── NTFS ACL для захисту фінансових даних                                 │
│                                                                              │
│   ВИРОБНИЦТВО / ПРОМИСЛОВІСТЬ                                               │
│   ├── Windows Embedded для промислових контролерів                          │
│   ├── HAL забезпечує роботу на спеціалізованому обладнанні                  │
│   └── Служби Windows для моніторингу 24/7                                   │
│                                                                              │
│   RETAIL / E-COMMERCE                                                        │
│   ├── Windows Server для backend систем                                      │
│   ├── IIS + .NET для веб-додатків                                           │
│   └── Windows Services для обробки замовлень                                │
│                                                                              │
│   МЕДИЦИНА                                                                   │
│   ├── Медичне обладнання часто працює на Windows Embedded                   │
│   ├── NTFS шифрування (EFS) для захисту медичних записів                    │
│   └── Сертифіковані драйвери для медичних пристроїв                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    КАР'ЄРНІ МОЖЛИВОСТІ                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   WINDOWS SYSTEM ADMINISTRATOR                                               │
│   ├── Зарплата: $50,000 - $90,000 USD / €45,000 - €80,000 EUR               │
│   ├── Навички: Active Directory, Group Policy, Registry, Services          │
│   └── Сертифікації: Microsoft Certified: Windows Server Hybrid Admin        │
│                                                                              │
│   WINDOWS KERNEL DEVELOPER                                                   │
│   ├── Зарплата: $120,000 - $200,000 USD / €100,000 - €170,000 EUR           │
│   ├── Навички: C/C++, Windows Driver Kit, NT Architecture                  │
│   └── Роботодавці: Microsoft, антивірусні компанії, hardware vendors       │
│                                                                              │
│   SECURITY ENGINEER (Windows)                                                │
│   ├── Зарплата: $80,000 - $150,000 USD / €70,000 - €130,000 EUR             │
│   ├── Навички: Security Reference Monitor, ACL, Credential Guard           │
│   └── Сертифікації: Microsoft SC-200, CompTIA Security+                    │
│                                                                              │
│   AZURE INFRASTRUCTURE ENGINEER                                              │
│   ├── Зарплата: $90,000 - $160,000 USD / €80,000 - €140,000 EUR             │
│   ├── Навички: Windows Server, Hyper-V, Azure Stack                         │
│   └── Сертифікації: AZ-104, AZ-800/801                                      │
│                                                                              │
│   DEVOPS ENGINEER (Windows)                                                  │
│   ├── Зарплата: $80,000 - $140,000 USD / €70,000 - €120,000 EUR             │
│   ├── Навички: PowerShell, Windows Services, CI/CD on Windows              │
│   └── Сертифікації: AZ-400, GitHub Actions                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-платформи для практики

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| Microsoft Learn | Офіційні безкоштовні курси з Windows | learn.microsoft.com |
| Pluralsight | Курси Windows Administration | pluralsight.com |
| TryHackMe | Windows Fundamentals (безпека) | tryhackme.com |
| ITProTV | Windows Server курси | itpro.tv |
| CBT Nuggets | Microsoft certification prep | cbtnuggets.com |

### Книги

| Назва | Автор | Рівень |
|-------|-------|--------|
| Windows Internals, Part 1 & 2 | Mark Russinovich, et al. | Просунутий |
| Windows Server Administration Fundamentals | Microsoft Press | Початковий |
| Windows Registry Forensics | Harlan Carvey | Середній |
| Troubleshooting Windows Server with PowerShell | Derek Schauland | Середній |
| Inside Windows Debugging | Tarik Soulami | Просунутий |

### YouTube канали

| Канал | Тематика |
|-------|----------|
| Microsoft Mechanics | Офіційні новини та демо від Microsoft |
| John Savill's Technical Training | Azure та Windows Server глибоко |
| PowerCert Animated Videos | Основи IT та Windows візуально |
| ITFreeTraining | Windows Server покроково |
| David Bombal | Мережі та Windows |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WINDOWS NT ARCHITECTURE - QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   КОМПОНЕНТИ ЯДРА                                                           │
│   ┌─────────────────┬───────────────────────────────────────────────────┐   │
│   │ ntoskrnl.exe    │ Ядро Windows (планувальник, переривання)          │   │
│   │ hal.dll         │ Hardware Abstraction Layer                        │   │
│   │ *.sys           │ Драйвери пристроїв                                │   │
│   │ ntdll.dll       │ Native API (syscall wrapper)                      │   │
│   └─────────────────┴───────────────────────────────────────────────────┘   │
│                                                                              │
│   EXECUTIVE MANAGERS                                                         │
│   ┌─────────────────┬───────────────────────────────────────────────────┐   │
│   │ I/O Manager     │ Драйвери, IRP, Plug and Play                      │   │
│   │ Object Manager  │ Все — об'єкт, іменування, безпека                 │   │
│   │ Process Manager │ Процеси, потоки, jobs                             │   │
│   │ Memory Manager  │ Віртуальна пам'ять, paging                        │   │
│   │ Security Ref.   │ ACL, токени, перевірка доступу                    │   │
│   └─────────────────┴───────────────────────────────────────────────────┘   │
│                                                                              │
│   КЛЮЧОВІ ШЛЯХИ                                                             │
│   Реєстр:           %SystemRoot%\System32\config                            │
│   Драйвери:         %SystemRoot%\System32\drivers                           │
│   Служби:           HKLM\SYSTEM\CurrentControlSet\Services                  │
│                                                                              │
│   КОРИСНІ КОМАНДИ                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Get-Process | Sort CPU -Desc | Select -First 10  # Топ процесів    │   │
│   │ Get-Service | Where Status -eq Running           # Запущені служби │   │
│   │ Get-ItemProperty "HKLM:\SOFTWARE\...\CurrentVersion" # Реєстр      │   │
│   │ Get-Volume                                       # Інфо про диски  │   │
│   │ Get-Acl C:\path\file                             # Права доступу   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка різниця між User Mode та Kernel Mode у Windows?** Поясніть, чому ця ізоляція важлива для стабільності та безпеки системи.

2. **Що таке HAL (Hardware Abstraction Layer) і яку проблему він вирішує?** Наведіть приклад, коли HAL дозволяє Windows працювати на різному обладнанні без зміни ядра.

3. **Чому Windows використовує потоки (threads) як одиниці планування, а не процеси?** Які переваги це дає для багатозадачності?

4. **Опишіть структуру реєстру Windows.** Яка різниця між HKEY_LOCAL_MACHINE та HKEY_CURRENT_USER? Для чого використовується кожен з них?

5. **Назвіть основні можливості файлової системи NTFS.** Чому NTFS краще підходить для серверів, ніж FAT32?

## 🎯 Міні-проект (30 хв)

### Завдання: Створення Windows System Reporter

Створіть PowerShell-скрипт, який автоматично збирає повну інформацію про архітектуру Windows-системи та генерує красивий HTML-звіт.

**Кроки:**

1. Створіть директорію для проекту:
```powershell
New-Item -Path "$env:USERPROFILE\WinReporter" -ItemType Directory -Force
Set-Location "$env:USERPROFILE\WinReporter"
```

2. Створіть скрипт збору інформації:
```powershell
# Збираємо дані про систему
$Report = @{
    GeneratedAt = Get-Date
    ComputerName = $env:COMPUTERNAME
    UserName = $env:USERNAME
}

# Інформація про ОС
$OS = Get-WmiObject Win32_OperatingSystem
$Report.OSName = $OS.Caption
$Report.OSVersion = $OS.Version
$Report.OSBuild = $OS.BuildNumber
$Report.OSArchitecture = $OS.OSArchitecture

# Інформація про залізо
$Report.TotalRAM = [math]::Round($OS.TotalVisibleMemorySize / 1MB, 2)
$Report.FreeRAM = [math]::Round($OS.FreePhysicalMemory / 1MB, 2)
$Report.CPUCores = (Get-WmiObject Win32_Processor).NumberOfCores
```

3. Додайте інформацію про процеси та служби:
```powershell
# Топ-5 процесів за RAM
$Report.TopProcesses = Get-Process |
    Sort-Object WorkingSet -Descending |
    Select-Object -First 5 Name, @{N='RAM_MB';E={[math]::Round($_.WorkingSet/1MB)}}

# Кількість служб
$Services = Get-Service
$Report.RunningServices = ($Services | Where-Object Status -eq "Running").Count
$Report.StoppedServices = ($Services | Where-Object Status -eq "Stopped").Count
```

4. Додайте інформацію про диски:
```powershell
# Інформація про томи
$Report.Volumes = Get-Volume |
    Where-Object DriveLetter |
    Select-Object DriveLetter, FileSystemType,
        @{N='Size_GB';E={[math]::Round($_.Size/1GB, 2)}},
        @{N='Free_GB';E={[math]::Round($_.SizeRemaining/1GB, 2)}}
```

5. Згенеруйте текстовий звіт:
```powershell
$TextReport = @"
========================================
    WINDOWS SYSTEM REPORT
========================================
Generated: $($Report.GeneratedAt)
Computer: $($Report.ComputerName)
User: $($Report.UserName)

--- OPERATING SYSTEM ---
Name: $($Report.OSName)
Version: $($Report.OSVersion)
Build: $($Report.OSBuild)
Architecture: $($Report.OSArchitecture)

--- HARDWARE ---
Total RAM: $($Report.TotalRAM) GB
Free RAM: $($Report.FreeRAM) GB
CPU Cores: $($Report.CPUCores)

--- SERVICES ---
Running: $($Report.RunningServices)
Stopped: $($Report.StoppedServices)

--- TOP PROCESSES BY RAM ---
$($Report.TopProcesses | Format-Table -AutoSize | Out-String)

--- DISK VOLUMES ---
$($Report.Volumes | Format-Table -AutoSize | Out-String)
========================================
"@

$TextReport | Out-File "SystemReport.txt"
Write-Host "Report saved to SystemReport.txt" -ForegroundColor Green
```

6. Перегляньте результат:
```powershell
Get-Content "SystemReport.txt"
```

**Очікуваний результат:**
Файл `SystemReport.txt` у директорії `WinReporter` з повним звітом про архітектуру вашої Windows-системи.

**Бонус (для допитливих):**
- Додайте до звіту інформацію з реєстру (встановлені програми)
- Згенеруйте HTML-версію звіту з таблицями та кольорами
- Налаштуйте автоматичний запуск через Task Scheduler щодня

## Підсумок

| Компонент | Призначення | Розташування |
|-----------|-------------|--------------|
| **HAL** | Апаратна абстракція | hal.dll |
| **Kernel** | Планування, переривання | ntoskrnl.exe |
| **Executive** | I/O, Memory, Process managers | ntoskrnl.exe |
| **Drivers** | Робота з пристроями | *.sys |
| **Registry** | Конфігурація системи | %SystemRoot%\System32\config |
| **Services** | Фонові процеси | services.exe, svchost.exe |

**Ключові особливості Windows NT:**
- Гібридне ядро (Executive + мікроядро-подібний Kernel)
- Об'єктна модель (все — об'єкт)
- Потоки як одиниці планування
- Централізований реєстр
- NTFS з журналюванням та ACL

На наступній лекції розглянемо різні версії та редакції Windows — від Home до Server Datacenter.
