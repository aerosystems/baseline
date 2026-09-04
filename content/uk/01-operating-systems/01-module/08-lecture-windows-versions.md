---
title: "Порівняльний аналіз версій ОС Windows"
type: lecture
order: 8
preview: "Windows 10, 11, Server. Редакції та їх відмінності."
---

## Чому так багато версій Windows?

Microsoft випускає різні редакції Windows для різних категорій користувачів:
- **Домашні** — базові функції для звичайного використання
- **Професійні** — розширені функції для бізнесу
- **Корпоративні** — централізоване керування великими організаціями
- **Серверні** — обслуговування мережі, хостинг сервісів

Кожна редакція = той самий код, але з різними **увімкненими/вимкненими функціями**.

## Редакції Windows 10/11

```
┌─────────────────────────────────────────────────────────────────┐
│                    РЕДАКЦІЇ WINDOWS 10/11                       │
│                                                                 │
│                     ┌──────────────────┐                       │
│                     │   Enterprise     │  Корпорації           │
│                     │   Education      │  (Volume License)      │
│                     └────────┬─────────┘                       │
│                              │ + Long-Term Servicing           │
│                              │ + DirectAccess                  │
│                              │ + AppLocker повний              │
│                     ┌────────▼─────────┐                       │
│                     │   Pro for        │  Малий/середній       │
│                     │   Workstations   │  бізнес               │
│                     └────────┬─────────┘                       │
│                              │ + ReFS                          │
│                              │ + Persistent Memory             │
│                     ┌────────▼─────────┐                       │
│                     │      Pro         │  Просунуті            │
│                     │                  │  користувачі          │
│                     └────────┬─────────┘                       │
│                              │ + BitLocker                     │
│                              │ + Remote Desktop (host)         │
│                              │ + Group Policy                  │
│                              │ + Hyper-V                       │
│                              │ + Domain Join                   │
│                     ┌────────▼─────────┐                       │
│                     │      Home        │  Домашні              │
│                     │                  │  користувачі          │
│                     └──────────────────┘                       │
│                     Базові функції                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Порівняння Home vs Pro

| Функція | Home | Pro |
|---------|------|-----|
| **Максимум RAM** | 128 ГБ | 2 ТБ |
| **BitLocker** | ❌ | ✅ |
| **Remote Desktop (host)** | ❌ | ✅ |
| **Hyper-V** | ❌ | ✅ |
| **Group Policy** | ❌ | ✅ |
| **Domain Join** | ❌ | ✅ |
| **Windows Sandbox** | ❌ | ✅ |
| **Assigned Access (Kiosk)** | ❌ | ✅ |
| **Ціна** | ~$140 | ~$200 |

### Порівняння Pro vs Enterprise

| Функція | Pro | Enterprise |
|---------|-----|------------|
| **DirectAccess** | ❌ | ✅ |
| **AppLocker (повний)** | Обмежений | ✅ |
| **Credential Guard** | ❌ | ✅ |
| **Device Guard** | Обмежений | ✅ |
| **LTSC (Long-Term)** | ❌ | ✅ |
| **Windows To Go** | ❌ | ✅ |
| **Ліцензування** | Retail/OEM | Volume |

## Windows 10 vs Windows 11

```
┌─────────────────────────────────────────────────────────────────┐
│                    WINDOWS 10 vs WINDOWS 11                     │
│                                                                 │
│   WINDOWS 10 (2015)                WINDOWS 11 (2021)            │
│                                                                 │
│   ┌───────────────────────┐        ┌───────────────────────┐   │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │        │ ╭─────────────────────╮│   │
│   │ ┌───┐ Start          │        │ │                     ││   │
│   │ │ ≡ │ Menu           │        │ │    Centered         ││   │
│   │ └───┘ (кут)          │        │ │    Taskbar          ││   │
│   │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │        │ │     ⊞ ○ ▢           ││   │
│   └───────────────────────┘        │ ╰─────────────────────╯│   │
│                                    └───────────────────────┘   │
│   • Live Tiles                     • Widgets                    │
│   • Квадратні кути                 • Заокруглені кути          │
│   • Підтримка до 2025              • Підтримка до 2031+         │
│                                                                 │
│   Системні вимоги:                 Системні вимоги:             │
│   • 1 ГГц CPU                      • 1 ГГц 64-bit (2 ядра)     │
│   • 1 ГБ RAM (32-bit)              • 4 ГБ RAM                  │
│   • 16 ГБ HDD                      • 64 ГБ SSD                 │
│   • DirectX 9                      • DirectX 12                │
│   • TPM не обов'язковий            • TPM 2.0 ОБОВ'ЯЗКОВИЙ      │
│   • UEFI не обов'язковий           • UEFI + Secure Boot        │
└─────────────────────────────────────────────────────────────────┘
```

### Нові функції Windows 11

| Функція | Опис |
|---------|------|
| **Snap Layouts** | Швидке розташування вікон (Win+Z) |
| **Desktops** | Покращені віртуальні робочі столи |
| **Microsoft Teams** | Інтегрований в taskbar |
| **Android Apps** | WSA (Windows Subsystem for Android) |
| **DirectStorage** | Швидке завантаження ігор з NVMe |
| **Auto HDR** | Автоматичне покращення графіки |
| **WSL 2 з GUI** | Linux-додатки з графікою |

### Перевірка сумісності з Windows 11

```powershell
# Перевірити TPM
Get-Tpm

# Версія TPM
(Get-WmiObject -Namespace "root\cimv2\security\microsofttpm" -Class Win32_Tpm).SpecVersion

# Перевірити Secure Boot
Confirm-SecureBootUEFI

# Детальна інформація про систему
Get-ComputerInfo | Select-Object BiosFirmwareType, CsProcessors, OsTotalVisibleMemorySize
```

## Windows Server

```
┌─────────────────────────────────────────────────────────────────┐
│                    WINDOWS SERVER РЕДАКЦІЇ                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              Datacenter                                  │  │
│   │  • Unlimited VMs                                        │  │
│   │  • Storage Spaces Direct                                │  │
│   │  • Software Defined Networking                          │  │
│   │  • Shielded VMs                                         │  │
│   │  Для великих датацентрів та хмар                        │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                    │
│   ┌────────────────────────▼────────────────────────────────┐  │
│   │              Standard                                    │  │
│   │  • 2 VMs на ліцензію                                    │  │
│   │  • Hyper-V, Failover Clustering                         │  │
│   │  • Storage Replica                                      │  │
│   │  Для більшості організацій                              │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                    │
│   ┌────────────────────────▼────────────────────────────────┐  │
│   │              Essentials                                  │  │
│   │  • До 25 користувачів, 50 пристроїв                    │  │
│   │  • Простіше ліцензування                               │  │
│   │  Для малого бізнесу                                     │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Особливі версії:                                             │
│   • Azure Edition — оптимізований для Azure                    │
│   • Core — без GUI (менше ресурсів, безпечніше)               │
│   • Nano Server — мінімальний для контейнерів                  │
└─────────────────────────────────────────────────────────────────┘
```

### Windows Server vs Desktop

| Характеристика | Desktop (Win 11) | Server 2022 |
|----------------|------------------|-------------|
| **Основне призначення** | Робоча станція | Обслуговування мережі |
| **GUI** | Завжди | Опціонально (Core) |
| **Максимум RAM** | 2 ТБ (Pro) | 48 ТБ (Datacenter) |
| **Максимум CPU** | 2 сокети | 64 сокети |
| **Hyper-V** | Workstation | Production |
| **Active Directory** | Client | Domain Controller |
| **IIS** | Обмежений | Повний |
| **Ліцензування** | Per device | Per core |

### Server Core vs GUI

```
┌─────────────────────────────────────────────────────────────────┐
│         SERVER CORE               SERVER WITH GUI               │
│                                                                 │
│   ┌─────────────────────┐        ┌─────────────────────┐       │
│   │                     │        │ ┌─────────────────┐ │       │
│   │   C:\> _            │        │ │ Server Manager  │ │       │
│   │                     │        │ │                 │ │       │
│   │   PowerShell/CMD    │        │ │  ┌───┐ ┌───┐   │ │       │
│   │   тільки            │        │ │  │ 1 │ │ 2 │   │ │       │
│   │                     │        │ │  └───┘ └───┘   │ │       │
│   │                     │        │ └─────────────────┘ │       │
│   └─────────────────────┘        └─────────────────────┘       │
│                                                                 │
│   • Менше диску (~6 ГБ)          • Більше диску (~12 ГБ)       │
│   • Менше оновлень               • Більше оновлень              │
│   • Менша поверхня атаки         • Зручніше для новачків       │
│   • Керування: PowerShell,       • Локальний GUI               │
│     Windows Admin Center,                                       │
│     Remote Server Tools                                        │
│                                                                 │
│   Рекомендовано для             Для навчання та                │
│   production                    невеликих середовищ            │
└─────────────────────────────────────────────────────────────────┘
```

```powershell
# Перевірити, чи це Server Core
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").InstallationType

# Встановити GUI на Server Core
Install-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra

# Видалити GUI
Uninstall-WindowsFeature Server-Gui-Shell
```

## Windows версії: хронологія підтримки

```
┌─────────────────────────────────────────────────────────────────┐
│                    ЖИТТЄВИЙ ЦИКЛ WINDOWS                        │
│                                                                 │
│   2015      2020      2025      2030      2035                 │
│     │         │         │         │         │                   │
│     ├─────────┴─────────┴─────────┴─────────┴─────────          │
│     │                                                           │
│  Win 7  ████████░░░░░░░░░  Кінець: 2020                        │
│     │                                                           │
│  Win 8.1 ████████████░░░░  Кінець: 2023                        │
│     │                                                           │
│  Win 10  ████████████████████████░  Кінець: 2025              │
│     │                                                           │
│  Win 11  ░░░░░████████████████████████████████████████         │
│     │         Мін. 10 років підтримки                          │
│     │                                                           │
│  Server ████████████████████████████████████                   │
│  2019        10 років (5 mainstream + 5 extended)              │
│     │                                                           │
│  Server ░░░░░░░░████████████████████████████████████████       │
│  2022                                                          │
│                                                                 │
│  ████ = Активна підтримка                                      │
│  ░░░░ = Розширена підтримка (тільки безпека)                  │
└─────────────────────────────────────────────────────────────────┘
```

### Канали оновлень Windows

| Канал | Опис | Для кого |
|-------|------|----------|
| **General Availability** | Стабільні оновлення, 2 рази на рік | Більшість |
| **Windows Insider (Dev)** | Найновіші функції, нестабільно | Розробники |
| **Windows Insider (Beta)** | Майже стабільно | Ентузіасти |
| **LTSC** | Оновлення безпеки 10 років, без feature updates | Критична інфраструктура |

## Встановлення Windows: режими

```
┌─────────────────────────────────────────────────────────────────┐
│                    РЕЖИМИ ВСТАНОВЛЕННЯ                          │
│                                                                 │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│   │  Clean Install │  │   Upgrade     │  │   Reset       │      │
│   │               │  │               │  │               │      │
│   │  Новий диск   │  │  Win10→Win11  │  │  Скинути до   │      │
│   │  або форматув.│  │  Зберігає     │  │  заводських   │      │
│   │               │  │  програми     │  │  налаштувань  │      │
│   │  Boot from    │  │               │  │               │      │
│   │  USB/DVD      │  │  Settings →   │  │  Settings →   │      │
│   │               │  │  Update       │  │  Recovery     │      │
│   └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
│   ┌───────────────┐  ┌───────────────┐                         │
│   │  Image-based  │  │   WDS/MDT     │                         │
│   │  (WIM/FFU)    │  │               │                         │
│   │               │  │  Масове       │                         │
│   │  DISM         │  │  розгортання  │                         │
│   │  для техніків │  │  по мережі    │                         │
│   │               │  │               │                         │
│   └───────────────┘  └───────────────┘                         │
│                                                                 │
│   Корпоративні інструменти:                                    │
│   • Windows Deployment Services (WDS)                          │
│   • Microsoft Deployment Toolkit (MDT)                         │
│   • Microsoft Endpoint Configuration Manager (SCCM/MECM)       │
│   • Windows Autopilot (cloud-based)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Практичне порівняння

**Перевірка поточної системи:**

```powershell
# Повна інформація про ОС
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsHardwareAbstractionLayer

# Редакція Windows
(Get-WmiObject Win32_OperatingSystem).Caption

# Версія та білд
[System.Environment]::OSVersion.Version

# Ліцензія
Get-CimInstance -ClassName SoftwareLicensingProduct | Where-Object {$_.PartialProductKey} | Select-Object Name, LicenseStatus

# Функції Windows
Get-WindowsOptionalFeature -Online | Where-Object {$_.State -eq "Enabled"} | Select-Object FeatureName

# Чи це Server?
(Get-WmiObject Win32_OperatingSystem).ProductType
# 1 = Workstation, 2 = Domain Controller, 3 = Server
```

## Яку версію обрати?

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВИБІР РЕДАКЦІЇ WINDOWS                       │
│                                                                 │
│   Домашнє використання                                         │
│   └──→ Windows 11 Home                                         │
│        • Найдешевша                                            │
│        • Достатньо для ігор, інтернету, офісу                 │
│                                                                 │
│   Фрілансер / Розробник                                        │
│   └──→ Windows 11 Pro                                          │
│        • Hyper-V для віртуалок                                 │
│        • BitLocker для шифрування                              │
│        • Remote Desktop                                        │
│                                                                 │
│   Малий бізнес (< 25 ПК)                                       │
│   └──→ Windows 11 Pro + Server Essentials                      │
│        • Централізоване керування                              │
│        • Спільний файловий сервер                              │
│                                                                 │
│   Середній/Великий бізнес                                      │
│   └──→ Windows 11 Enterprise + Server Standard/Datacenter      │
│        • Active Directory                                       │
│        • Group Policy                                          │
│        • Volume licensing                                       │
│                                                                 │
│   Датацентр / Хмара                                            │
│   └──→ Windows Server Datacenter / Azure Edition               │
│        • Unlimited VMs                                         │
│        • Software Defined everything                           │
│        • Shielded VMs                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Практичне завдання

Дослідіть вашу Windows-систему:

```powershell
# 1. Яка редакція встановлена?
Get-WmiObject Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber

# 2. Чи підтримується Windows 11?
# (перевірка TPM, Secure Boot, CPU)
Get-Tpm
Confirm-SecureBootUEFI
Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores

# 3. Перелік встановлених ролей/функцій (Server)
Get-WindowsFeature | Where-Object {$_.Installed}

# 4. Історія оновлень
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10

# 5. Канал оновлень
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name CommercialId -ErrorAction SilentlyContinue
```

## Підсумок

| Редакція | Для кого | Ключові функції |
|----------|----------|-----------------|
| **Home** | Домашні користувачі | Базові функції |
| **Pro** | Малий бізнес, розробники | BitLocker, Hyper-V, RDP |
| **Enterprise** | Корпорації | LTSC, DirectAccess, AppLocker |
| **Education** | Навчальні заклади | = Enterprise, інша ліцензія |
| **Server Essentials** | Малий бізнес | До 25 користувачів |
| **Server Standard** | Середній бізнес | 2 VM на ліцензію |
| **Server Datacenter** | Великі організації | Unlimited VMs |

**Ключовий висновок:** Обирайте мінімально достатню редакцію. Якщо не потрібен BitLocker чи Hyper-V — Home цілком достатньо. Для серверів починайте з Server Core — це безпечніше та легше підтримувати.

На наступній лекції розглянемо роботу з командним рядком Windows (CMD).
