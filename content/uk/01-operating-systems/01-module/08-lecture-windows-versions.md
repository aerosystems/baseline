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

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ВИБІР ВЕРСІЙ WINDOWS У ENTERPRISE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   КОРПОРАЦІЇ (Enterprise Agreement)                                          │
│   ├── Microsoft, Google, Amazon офіси:                                      │
│   │   └── Windows 11 Enterprise + Microsoft 365 E5                          │
│   ├── Фінансові установи (Goldman Sachs, JP Morgan):                        │
│   │   └── Windows 10/11 Enterprise LTSC для торгових терміналів             │
│   └── Переваги: Volume Licensing, централізоване керування, support         │
│                                                                              │
│   СТАРТАПИ ТА МАЛИЙ БІЗНЕС                                                  │
│   ├── SaaS-компанії:                                                         │
│   │   └── Windows 11 Pro + Microsoft 365 Business                           │
│   ├── Переваги Pro над Home:                                                │
│   │   ├── BitLocker для захисту ноутбуків                                   │
│   │   ├── Remote Desktop для віддаленої роботи                              │
│   │   └── Hyper-V для розробки та тестування                                │
│   └── Вартість: ~$200 за ліцензію (одноразово)                              │
│                                                                              │
│   ДАТАЦЕНТРИ ТА ХМАРИ                                                       │
│   ├── Azure:                                                                 │
│   │   └── Windows Server Datacenter Azure Edition                           │
│   ├── On-premise датацентри:                                                │
│   │   └── Windows Server Datacenter (unlimited VMs)                         │
│   └── Ліцензування: Per-core (мінімум 16 cores)                             │
│                                                                              │
│   КРИТИЧНА ІНФРАСТРУКТУРА                                                   │
│   ├── Банкомати, медичне обладнання:                                        │
│   │   └── Windows 10 IoT Enterprise LTSC (10 років підтримки)               │
│   ├── Промислові системи:                                                    │
│   │   └── Windows Server IoT                                                 │
│   └── Чому LTSC: стабільність, без feature updates, тільки security         │
│                                                                              │
│   ОСВІТА                                                                     │
│   ├── Університети та школи:                                                │
│   │   └── Windows 11 Education (= Enterprise, дешевше)                      │
│   └── Azure Lab Services для віртуальних лабораторій                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    КАР'ЄРНІ МОЖЛИВОСТІ                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   MICROSOFT 365 ADMINISTRATOR                                                │
│   ├── Зарплата: $60,000 - $100,000 USD / €55,000 - €90,000 EUR              │
│   ├── Навички: Windows 10/11 deployment, Intune, Autopilot                 │
│   └── Сертифікації: MS-102, MD-102                                          │
│                                                                              │
│   WINDOWS DEPLOYMENT SPECIALIST                                              │
│   ├── Зарплата: $55,000 - $85,000 USD / €50,000 - €75,000 EUR               │
│   ├── Навички: MDT, SCCM/MECM, WDS, Windows Imaging                        │
│   └── Сертифікації: MD-102, AZ-140 (для AVD)                                │
│                                                                              │
│   ENDPOINT MANAGER / INTUNE SPECIALIST                                       │
│   ├── Зарплата: $70,000 - $120,000 USD / €65,000 - €100,000 EUR             │
│   ├── Навички: Intune, Autopilot, Windows Update for Business              │
│   └── Сертифікації: MD-102, SC-300                                          │
│                                                                              │
│   WINDOWS SERVER ADMINISTRATOR                                               │
│   ├── Зарплата: $60,000 - $110,000 USD / €55,000 - €95,000 EUR              │
│   ├── Навички: Server Core, Hyper-V, Failover Clustering                   │
│   └── Сертифікації: AZ-800, AZ-801                                          │
│                                                                              │
│   LICENSING SPECIALIST                                                       │
│   ├── Зарплата: $50,000 - $90,000 USD / €45,000 - €80,000 EUR               │
│   ├── Навички: Microsoft licensing, SAM, compliance                        │
│   └── Сертифікації: Microsoft Licensing Professional                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-платформи для практики

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| Microsoft Evaluation Center | Безкоштовні trial версії Windows Server | microsoft.com/evalcenter |
| Microsoft Learn | Модулі з Windows 11 та Server | learn.microsoft.com |
| Azure Free Account | Безкоштовні Windows VMs на 12 місяців | azure.microsoft.com/free |
| Windows Insider Program | Тестування нових версій | insider.windows.com |
| Hands-on Labs (Microsoft) | Віртуальні лабораторії | microsoft.com/handsonlabs |

### Книги

| Назва | Автор | Рівень |
|-------|-------|--------|
| Mastering Windows 11 | William Panek | Початковий-Середній |
| Windows Server 2022 Administration Fundamentals | Bekim Dauti | Початковий |
| Mastering Windows Server 2022 | Jordan Krause | Середній |
| Microsoft 365 Modern Desktop Administrator | Orin Thomas | Середній |
| Windows Server Automation with PowerShell Cookbook | Thomas Lee | Просунутий |

### YouTube канали

| Канал | Тематика |
|-------|----------|
| Windows | Офіційний канал Microsoft Windows |
| Microsoft Ignite | Конференції та анонси нових версій |
| Andy Malone | Windows 11 tips та deployment |
| NIC IT Academy | Windows Server українською |
| oWintero | Windows 10/11 глибоко |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WINDOWS VERSIONS - QUICK REFERENCE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   DESKTOP EDITIONS (Win 10/11)                                               │
│   ┌─────────────────┬───────────────────────────────────────────────────┐   │
│   │ Home            │ Базові функції, 128 GB RAM, без BitLocker        │   │
│   │ Pro             │ + BitLocker, Hyper-V, RDP host, Domain Join      │   │
│   │ Pro Workstation │ + ReFS, Persistent Memory                        │   │
│   │ Enterprise      │ + LTSC, DirectAccess, AppLocker                  │   │
│   │ Education       │ = Enterprise, академічна ліцензія                │   │
│   └─────────────────┴───────────────────────────────────────────────────┘   │
│                                                                              │
│   SERVER EDITIONS                                                            │
│   ┌─────────────────┬───────────────────────────────────────────────────┐   │
│   │ Essentials      │ До 25 users, 50 devices, спрощена ліцензія       │   │
│   │ Standard        │ 2 VMs per license, Hyper-V, Clustering           │   │
│   │ Datacenter      │ Unlimited VMs, Shielded VMs, SDN                 │   │
│   │ Azure Edition   │ Оптимізовано для Azure, Hot Patching             │   │
│   └─────────────────┴───────────────────────────────────────────────────┘   │
│                                                                              │
│   WINDOWS 11 ВИМОГИ                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • CPU: 64-bit, 2+ cores, 1 GHz  • TPM: версія 2.0 ОБОВ'ЯЗКОВО     │   │
│   │ • RAM: 4 GB мінімум             • UEFI + Secure Boot               │   │
│   │ • Диск: 64 GB мінімум           • DirectX 12 + WDDM 2.0            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ПЕРЕВІРКА ВЕРСІЇ (PowerShell)                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ (Get-WmiObject Win32_OperatingSystem).Caption   # Назва            │   │
│   │ [Environment]::OSVersion.Version                # Версія           │   │
│   │ Get-ComputerInfo | Select Windows*              # Детально         │   │
│   │ Get-Tpm                                         # Статус TPM       │   │
│   │ Confirm-SecureBootUEFI                          # Secure Boot      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка основна різниця між Windows Home та Windows Pro?** Назвіть три ключові функції, які є в Pro, але відсутні в Home.

2. **Для чого призначена редакція Windows Enterprise LTSC?** Чому вона підходить для банкоматів та медичного обладнання?

3. **Порівняйте Windows Server Standard та Datacenter.** Коли варто обирати Datacenter замість Standard?

4. **Які нові вимоги до обладнання має Windows 11 порівняно з Windows 10?** Чому Microsoft вимагає TPM 2.0?

5. **Що таке Windows Server Core?** Які переваги та недоліки використання Server Core замість версії з GUI?

## 🎯 Міні-проект (30 хв)

### Завдання: Windows Upgrade Advisor

Створіть власний інструмент для перевірки сумісності системи з Windows 11 та рекомендацій щодо апгрейду.

**Кроки:**

1. Створіть директорію для проекту:
```powershell
New-Item -Path "$env:USERPROFILE\UpgradeAdvisor" -ItemType Directory -Force
Set-Location "$env:USERPROFILE\UpgradeAdvisor"
```

2. Перевірте базові вимоги Windows 11:
```powershell
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    WINDOWS 11 UPGRADE ADVISOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Results = @{
    CheckDate = Get-Date
    PassedChecks = 0
    FailedChecks = 0
}

# Перевірка RAM (мінімум 4 GB)
$RAM_GB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
if ($RAM_GB -ge 4) {
    Write-Host "[PASS] RAM: $RAM_GB GB (потрібно: 4 GB)" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] RAM: $RAM_GB GB (потрібно: 4 GB)" -ForegroundColor Red
    $Results.FailedChecks++
}
```

3. Перевірте TPM та Secure Boot:
```powershell
# Перевірка TPM
$tpm = Get-Tpm -ErrorAction SilentlyContinue
if ($tpm.TpmPresent -and $tpm.TpmReady) {
    Write-Host "[PASS] TPM 2.0: Присутній та готовий" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] TPM 2.0: Відсутній або не готовий" -ForegroundColor Red
    $Results.FailedChecks++
}

# Перевірка Secure Boot
try {
    $SecureBoot = Confirm-SecureBootUEFI
    if ($SecureBoot) {
        Write-Host "[PASS] Secure Boot: Увімкнено" -ForegroundColor Green
        $Results.PassedChecks++
    } else {
        Write-Host "[WARN] Secure Boot: Вимкнено" -ForegroundColor Yellow
        $Results.FailedChecks++
    }
} catch {
    Write-Host "[FAIL] Secure Boot: Не підтримується (Legacy BIOS?)" -ForegroundColor Red
    $Results.FailedChecks++
}
```

4. Перевірте CPU та диск:
```powershell
# Перевірка CPU (мінімум 2 ядра, 1 GHz)
$CPU = Get-WmiObject Win32_Processor
$Cores = $CPU.NumberOfCores
if ($Cores -ge 2) {
    Write-Host "[PASS] CPU: $($CPU.Name) ($Cores cores)" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] CPU: $Cores cores (потрібно: 2+)" -ForegroundColor Red
    $Results.FailedChecks++
}

# Перевірка диску (мінімум 64 GB)
$SystemDrive = Get-Volume -DriveLetter C
$Disk_GB = [math]::Round($SystemDrive.Size / 1GB, 2)
if ($Disk_GB -ge 64) {
    Write-Host "[PASS] Диск C: $Disk_GB GB (потрібно: 64 GB)" -ForegroundColor Green
    $Results.PassedChecks++
} else {
    Write-Host "[FAIL] Диск C: $Disk_GB GB (потрібно: 64 GB)" -ForegroundColor Red
    $Results.FailedChecks++
}
```

5. Виведіть підсумок та рекомендації:
```powershell
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           ПІДСУМОК" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Пройдено перевірок: $($Results.PassedChecks)" -ForegroundColor Green
Write-Host "Провалено перевірок: $($Results.FailedChecks)" -ForegroundColor Red
Write-Host ""

if ($Results.FailedChecks -eq 0) {
    Write-Host "ВИСНОВОК: Ваша система ГОТОВА до Windows 11!" -ForegroundColor Green
    Write-Host "Рекомендована редакція: Windows 11 Pro" -ForegroundColor Cyan
} else {
    Write-Host "ВИСНОВОК: Потрібні оновлення перед апгрейдом" -ForegroundColor Yellow
    Write-Host "Рекомендації:" -ForegroundColor Cyan
    Write-Host "- Перевірте налаштування BIOS (TPM, Secure Boot)" -ForegroundColor White
    Write-Host "- Можливо, потрібне оновлення обладнання" -ForegroundColor White
}
```

6. Збережіть результати у файл:
```powershell
$ReportFile = "UpgradeReport_$(Get-Date -Format 'yyyyMMdd').txt"
@"
WINDOWS 11 UPGRADE ADVISOR REPORT
Generated: $(Get-Date)

RAM: $RAM_GB GB
CPU: $($CPU.Name) ($Cores cores)
Disk: $Disk_GB GB
TPM: $(if($tpm.TpmPresent){'Present'}else{'Missing'})
Secure Boot: $(if($SecureBoot){'Enabled'}else{'Disabled'})

Passed: $($Results.PassedChecks)
Failed: $($Results.FailedChecks)

Ready for Windows 11: $(if($Results.FailedChecks -eq 0){'YES'}else{'NO'})
"@ | Out-File $ReportFile

Write-Host ""
Write-Host "Звіт збережено: $ReportFile" -ForegroundColor Cyan
```

**Очікуваний результат:**
Скрипт, який перевіряє сумісність з Windows 11 та генерує файл звіту з рекомендаціями.

**Бонус (для допитливих):**
- Додайте перевірку сумісності CPU за списком підтримуваних процесорів
- Створіть GUI-версію з Windows Forms
- Додайте порівняння редакцій (Home vs Pro vs Enterprise)

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
