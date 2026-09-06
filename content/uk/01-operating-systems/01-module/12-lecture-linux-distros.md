---
title: "Дистрибутиви Linux"
type: lecture
order: 12
preview: "Debian, Ubuntu, Fedora, Arch. Вибір дистрибутива."
---

## Що таке дистрибутив Linux?

**Дистрибутив (distro)** — це комплект, що включає ядро Linux + набір програм + систему управління пакетами + конфігурацію "з коробки".

```
┌─────────────────────────────────────────────────────────────────┐
│                    АНАТОМІЯ ДИСТРИБУТИВА                        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Ubuntu 24.04                          │  │
│   │                                                          │  │
│   │  ┌────────────────────────────────────────────────────┐ │  │
│   │  │ Desktop Environment: GNOME 46                       │ │  │
│   │  │ (KDE, XFCE, etc. — в інших редакціях)              │ │  │
│   │  └────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   │  ┌────────────────────────────────────────────────────┐ │  │
│   │  │ Pre-installed Apps: Firefox, LibreOffice, etc.     │ │  │
│   │  └────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   │  ┌────────────────────────────────────────────────────┐ │  │
│   │  │ Package Manager: APT + Snap                         │ │  │
│   │  │ Repositories: Ubuntu + Universe + Multiverse        │ │  │
│   │  └────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   │  ┌────────────────────────────────────────────────────┐ │  │
│   │  │ Init System: systemd                                │ │  │
│   │  │ Installer: Ubiquity / Ubuntu Desktop Installer      │ │  │
│   │  └────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   │  ┌────────────────────────────────────────────────────┐ │  │
│   │  │ Linux Kernel: 6.8.x                                 │ │  │
│   │  └────────────────────────────────────────────────────┘ │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Різні дистрибутиви = різний вибір компонентів               │
└─────────────────────────────────────────────────────────────────┘
```

## Родинне дерево дистрибутивів

```
┌─────────────────────────────────────────────────────────────────┐
│                    ГЕНЕАЛОГІЯ LINUX                             │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                     Debian (1993)                        │  │
│   │   Найстаріший активний дистрибутив                       │  │
│   │   .deb пакети, apt                                       │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                   │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐            │
│   │  Ubuntu  │      │   Mint   │      │   Kali   │            │
│   │  (2004)  │      │  (2006)  │      │  (2013)  │            │
│   │ Canonical│      │ Desktop  │      │ Security │            │
│   └────┬─────┘      └──────────┘      └──────────┘            │
│        │                                                       │
│   ┌────┴────┬──────────┬──────────┐                           │
│   ▼         ▼          ▼          ▼                           │
│ Kubuntu  Xubuntu    Pop!_OS    Elementary                     │
│ (KDE)    (XFCE)    (System76)    OS                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                   Red Hat (1994)                         │  │
│   │   .rpm пакети, dnf/yum                                   │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                   │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐            │
│   │   RHEL   │      │  Fedora  │      │  CentOS  │            │
│   │ (комерц.)│      │  (нове)  │      │(безкошт.)│            │
│   └──────────┘      └──────────┘      └────┬─────┘            │
│                                            │                   │
│                                      ┌─────┴─────┐             │
│                                      ▼           ▼             │
│                                  Rocky       AlmaLinux         │
│                                  Linux       (після CentOS)    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                   Arch Linux (2002)                      │  │
│   │   Rolling release, pacman, мінімалізм                    │  │
│   └────────────────────────┬────────────────────────────────┘  │
│                            │                                   │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                │
│   ┌──────────┐      ┌───────────┐      ┌──────────┐           │
│   │ Manjaro  │      │EndeavourOS│      │ SteamOS 3│           │
│   │(дружній) │      │ (просте)  │      │ (Valve)  │           │
│   └──────────┘      └───────────┘      └──────────┘           │
│                                                                 │
│   Інші незалежні:                                              │
│   ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐        │
│   │  Gentoo  │ │ Slackware │ │ openSUSE │ │  NixOS   │        │
│   │(compile) │ │(oldschool)│ │(SUSE base)│ │(функціон)│        │
│   └──────────┘ └───────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Основні дистрибутиви детально

### Ubuntu

```
┌─────────────────────────────────────────────────────────────────┐
│                         UBUNTU                                  │
│                                                                 │
│   Компанія: Canonical Ltd (Mark Shuttleworth)                  │
│   Перший реліз: 2004                                           │
│   Базується на: Debian                                         │
│   Цикл випусків: кожні 6 місяців + LTS кожні 2 роки           │
│                                                                 │
│   Версії:                                                      │
│   • 24.04 LTS "Noble Numbat" — підтримка до 2029              │
│   • 23.10 "Mantic Minotaur" — підтримка 9 місяців             │
│                                                                 │
│   Редакції:                                                    │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│   │   Desktop   │ │   Server    │ │    Core     │              │
│   │   (GNOME)   │ │  (без GUI)  │ │    (IoT)    │              │
│   └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│   Флейвори (офіційні):                                         │
│   • Kubuntu (KDE)                                              │
│   • Xubuntu (XFCE)                                             │
│   • Lubuntu (LXQt)                                             │
│   • Ubuntu MATE                                                │
│   • Ubuntu Studio (для медіа)                                  │
│                                                                 │
│   Переваги:                                                    │
│   ✅ Найбільша спільнота                                       │
│   ✅ Найкраща документація                                     │
│   ✅ Широка підтримка hardware                                 │
│   ✅ Легкий для початківців                                    │
│                                                                 │
│   Недоліки:                                                    │
│   ❌ Snap за замовчуванням (повільний)                         │
│   ❌ Не завжди найновіші пакети                               │
│   ❌ Canonical іноді приймає спірні рішення                   │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Встановлення пакетів Ubuntu
sudo apt update
sudo apt install nginx

# Версія
lsb_release -a
cat /etc/os-release
```

### Fedora

```
┌─────────────────────────────────────────────────────────────────┐
│                         FEDORA                                  │
│                                                                 │
│   Компанія: Red Hat / IBM (спонсорує)                          │
│   Перший реліз: 2003                                           │
│   Цикл: ~6 місяців, підтримка 13 місяців                      │
│                                                                 │
│   Філософія: "First" — нові технології першими                │
│   • Wayland за замовчуванням (2016)                           │
│   • PipeWire (новий аудіо стек)                               │
│   • Btrfs за замовчуванням                                    │
│   • Найновіші версії GNOME                                    │
│                                                                 │
│   Редакції (Editions):                                         │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│   │  Workstation│ │   Server    │ │    IoT      │              │
│   │   (GNOME)   │ │   (Cockpit) │ │   (Edge)    │              │
│   └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│   Spins (з різними DE):                                        │
│   • KDE Plasma                                                 │
│   • XFCE                                                       │
│   • Cinnamon                                                   │
│   • i3 (tiling WM)                                             │
│                                                                 │
│   Переваги:                                                    │
│   ✅ Найновіші пакети та технології                           │
│   ✅ Чистий, близький до upstream                             │
│   ✅ Полігон для RHEL                                         │
│   ✅ SELinux за замовчуванням                                 │
│                                                                 │
│   Недоліки:                                                    │
│   ❌ Коротка підтримка версій                                 │
│   ❌ Менше "готових рішень"                                   │
│   ❌ Менша база пакетів ніж Ubuntu                            │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Fedora
sudo dnf update
sudo dnf install nginx

# Версія
cat /etc/fedora-release
```

### Debian

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEBIAN                                  │
│                                                                 │
│   Засновник: Ian Murdock (1993)                                │
│   "The Universal Operating System"                             │
│                                                                 │
│   Гілки:                                                       │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ stable    │ Поточний реліз (Debian 12 "Bookworm")     │    │
│   │           │ Старі, але надійні пакети                 │    │
│   ├───────────────────────────────────────────────────────┤    │
│   │ testing   │ Майбутній stable                          │    │
│   │           │ Новіші пакети, менш стабільні            │    │
│   ├───────────────────────────────────────────────────────┤    │
│   │ unstable  │ "Sid" — найновіше                        │    │
│   │ (sid)     │ Може ламатися                            │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   Переваги:                                                    │
│   ✅ Стабільність — "Debian stable ніколи не падає"           │
│   ✅ Величезний архів пакетів (59,000+)                       │
│   ✅ Безкоштовний, community-driven                           │
│   ✅ Підтримка багатьох архітектур                            │
│                                                                 │
│   Недоліки:                                                    │
│   ❌ Застарілі пакети в stable                                │
│   ❌ Довгий цикл релізів (2-3 роки)                           │
│   ❌ Менш user-friendly ніж Ubuntu                            │
└─────────────────────────────────────────────────────────────────┘
```

### Arch Linux

```
┌─────────────────────────────────────────────────────────────────┐
│                       ARCH LINUX                                │
│                                                                 │
│   Філософія: KISS (Keep It Simple, Stupid)                     │
│   Перший реліз: 2002                                           │
│   Rolling release — завжди останні версії                      │
│                                                                 │
│   Особливості:                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ • Мінімальна базова система                           │    │
│   │ • Користувач сам вирішує що встановлювати            │    │
│   │ • Найсвіжіші пакети                                   │    │
│   │ • Чудова документація (ArchWiki)                      │    │
│   │ • AUR — користувацький репозиторій                   │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   Пакетний менеджер:                                           │
│   • pacman — офіційні репозиторії                             │
│   • yay/paru — AUR helpers                                    │
│                                                                 │
│   Переваги:                                                    │
│   ✅ Завжди останні версії                                    │
│   ✅ Найкраща документація (ArchWiki)                         │
│   ✅ Максимальний контроль                                    │
│   ✅ AUR — будь-яке ПЗ                                        │
│                                                                 │
│   Недоліки:                                                    │
│   ❌ Складне встановлення (ручне)                             │
│   ❌ Може ламатися після оновлень                             │
│   ❌ Потребує знань Linux                                     │
│   ❌ "I use Arch btw" мем                                     │
│                                                                 │
│   Для кого: Досвідчені користувачі, які хочуть вчитися       │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Arch
sudo pacman -Syu              # Оновити все
sudo pacman -S nginx          # Встановити

# AUR (через yay)
yay -S visual-studio-code-bin
```

### Enterprise дистрибутиви

```
┌─────────────────────────────────────────────────────────────────┐
│                 ENTERPRISE LINUX                                │
│                                                                 │
│   RHEL (Red Hat Enterprise Linux)                              │
│   ───────────────────────────────                              │
│   • Комерційна підписка ($800+/рік)                           │
│   • 10 років підтримки                                        │
│   • Сертифікації (SAP, Oracle, VMware)                        │
│   • 24/7 підтримка від Red Hat                                │
│                                                                 │
│   Безкоштовні альтернативи RHEL:                              │
│   ┌──────────────────────────────────────────────────────┐     │
│   │ Rocky Linux      │ Заснований співзасновником CentOS │     │
│   │ AlmaLinux        │ Підтримується CloudLinux          │     │
│   │ Oracle Linux     │ Від Oracle (UEK kernel)           │     │
│   │ CentOS Stream    │ Upstream для RHEL (не 1:1)        │     │
│   └──────────────────────────────────────────────────────┘     │
│                                                                 │
│   SUSE Linux Enterprise (SLE)                                  │
│   ───────────────────────────                                  │
│   • Популярний в Європі                                       │
│   • SAP HANA сертифікація                                     │
│   • openSUSE — community версія                               │
│                                                                 │
│   Ubuntu Pro                                                   │
│   ──────────                                                   │
│   • Безкоштовно для 5 машин                                   │
│   • 10 років підтримки                                        │
│   • Livepatch (оновлення ядра без ребуту)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Спеціалізовані дистрибутиви

| Дистрибутив | Призначення |
|-------------|-------------|
| **Kali Linux** | Penetration testing, security |
| **Tails** | Privacy, анонімність (Tor) |
| **Qubes OS** | Security through isolation |
| **Ubuntu Studio** | Audio/video production |
| **SteamOS** | Gaming (Steam Deck) |
| **Raspberry Pi OS** | Raspberry Pi |
| **Alpine Linux** | Контейнери (мінімальний розмір) |
| **Clear Linux** | Оптимізований для Intel |
| **Void Linux** | runit замість systemd |

## Порівняльна таблиця

| Критерій | Ubuntu | Fedora | Debian | Arch |
|----------|--------|--------|--------|------|
| **Складність** | Легко | Середньо | Середньо | Складно |
| **Свіжість пакетів** | LTS: старі, regular: середні | Свіжі | stable: старі | Найсвіжіші |
| **Стабільність** | Добра | Добра | Відмінна | Залежить |
| **Підтримка** | 5 років (LTS) | 13 місяців | ~5 років | Rolling |
| **Документація** | Відмінна | Добра | Добра | Найкраща |
| **Enterprise** | Ubuntu Pro | → RHEL | Debian | — |
| **Пакети** | apt, snap | dnf, flatpak | apt | pacman, AUR |

## Як обрати дистрибутив?

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВИБІР ДИСТРИБУТИВА                           │
│                                                                 │
│   Новачок?                                                     │
│   └──→ Ubuntu або Linux Mint                                   │
│                                                                 │
│   Хочу вчитися?                                                │
│   └──→ Arch Linux або Fedora                                   │
│                                                                 │
│   Сервер для продакшену?                                       │
│   └──→ Ubuntu Server LTS, RHEL/Rocky, Debian stable           │
│                                                                 │
│   Контейнери/Kubernetes?                                       │
│   └──→ Alpine Linux (мінімальний)                              │
│                                                                 │
│   Старий комп'ютер?                                            │
│   └──→ Lubuntu, Xubuntu, antiX                                │
│                                                                 │
│   Security/Pentesting?                                         │
│   └──→ Kali Linux                                              │
│                                                                 │
│   Gaming?                                                      │
│   └──→ Pop!_OS, Nobara (Fedora gaming), Garuda                │
│                                                                 │
│   Максимальна приватність?                                     │
│   └──→ Tails, Whonix, Qubes OS                                │
└─────────────────────────────────────────────────────────────────┘
```

## Практичне завдання

```bash
# 1. Визначити ваш дистрибутив
cat /etc/os-release
lsb_release -a 2>/dev/null

# 2. Пакетний менеджер
which apt dnf pacman yum 2>/dev/null

# 3. Версія ядра
uname -r

# 4. Desktop Environment
echo $XDG_CURRENT_DESKTOP
echo $DESKTOP_SESSION

# 5. Init system
ps -p 1 -o comm=

# 6. Скільки пакетів встановлено
# Debian/Ubuntu
dpkg -l | wc -l
# Fedora
rpm -qa | wc -l
# Arch
pacman -Q | wc -l
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────┐
│           LINUX ДИСТРИБУТИВИ У PRODUCTION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   NETFLIX                                                       │
│   ├── FreeBSD на CDN (Open Connect)                            │
│   ├── Ubuntu/Debian для backend сервісів                       │
│   └── Amazon Linux для AWS workloads                           │
│                                                                 │
│   GOOGLE                                                        │
│   ├── Debian-based gLinux для всіх робочих станцій            │
│   ├── Container-Optimized OS (Chromium OS based) для GKE      │
│   └── 2 мільйони+ серверів на custom Linux                     │
│                                                                 │
│   AMAZON (AWS)                                                  │
│   ├── Amazon Linux 2023 (Fedora-based) для EC2                 │
│   ├── Bottlerocket (container OS)                              │
│   └── RHEL/Ubuntu найпопулярніші серед клієнтів               │
│                                                                 │
│   META (FACEBOOK)                                               │
│   ├── CentOS → перехід на CentOS Stream / Rocky                │
│   ├── Власний дистрибутив для production                       │
│   └── Tupperware containers на custom Linux                    │
│                                                                 │
│   SPOTIFY                                                       │
│   ├── Debian для production серверів                           │
│   ├── Ubuntu для development workstations                      │
│   └── Alpine Linux для Docker контейнерів                      │
│                                                                 │
│   BANKING / ENTERPRISE                                          │
│   ├── RHEL — 80%+ банків та фінансових установ                 │
│   ├── SUSE Linux Enterprise для SAP                            │
│   └── Ubuntu Pro для державних установ                         │
│                                                                 │
│   GAMING (Valve)                                                │
│   ├── SteamOS 3.0 (Arch-based) на Steam Deck                   │
│   └── Proton працює на всіх дистрибутивах                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│       КАР'ЄРА: ЗНАННЯ ДИСТРИБУТИВІВ = ГНУЧКІСТЬ                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LINUX SYSTEM ADMINISTRATOR                                    │
│   ├── Рівень: Junior → Senior                                  │
│   ├── Зарплата: $50,000 - $120,000 USD / €45,000 - €100,000    │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ Ubuntu Server та Desktop                               │
│   │   ✓ RHEL/CentOS/Rocky для enterprise                       │
│   │   ✓ Різні пакетні менеджери (apt, dnf, pacman)             │
│   └── Сертифікації: LPIC-1, CompTIA Linux+                     │
│                                                                 │
│   RHEL/ENTERPRISE SPECIALIST                                    │
│   ├── Рівень: Middle → Senior                                  │
│   ├── Зарплата: $80,000 - $150,000 USD / €70,000 - €130,000    │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ RHEL, Rocky Linux, AlmaLinux                           │
│   │   ✓ SELinux, enterprise security                           │
│   │   ✓ Subscription management                                 │
│   ├── Сертифікації: RHCSA, RHCE, RHCA                          │
│   └── Компанії: банки, страхові, Fortune 500                   │
│                                                                 │
│   CLOUD ENGINEER                                                │
│   ├── Рівень: Junior → Senior                                  │
│   ├── Зарплата: $90,000 - $170,000 USD / €75,000 - €140,000    │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ Amazon Linux, Ubuntu на AWS                            │
│   │   ✓ Container OS (Alpine, Bottlerocket)                    │
│   │   ✓ Вибір дистрибутива під задачу                          │
│   └── Компанії: AWS, Azure, GCP partners                       │
│                                                                 │
│   DEVOPS ENGINEER                                               │
│   ├── Рівень: Middle → Principal                               │
│   ├── Зарплата: $100,000 - $200,000 USD / €85,000 - €170,000   │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ Alpine Linux для мінімальних контейнерів               │
│   │   ✓ Debian/Ubuntu для CI/CD серверів                       │
│   │   ✓ Fedora/RHEL для production                             │
│   └── Компанії: Netflix, Spotify, tech startups                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-платформи для практики

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **DistroWatch** | Рейтинг та огляди дистрибутивів | distrowatch.com |
| **DistroTest** | Тестування дистрибутивів у браузері | distrotest.net |
| **Linux From Scratch** | Побудова дистрибутива з нуля | linuxfromscratch.org |
| **Boxes (GNOME)** | Легке створення VM для тестування | wiki.gnome.org/Apps/Boxes |
| **Ventoy** | Мультизавантажувальна USB флешка | ventoy.net |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│              LINUX DISTROS CHEAT SHEET                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ВИЗНАЧЕННЯ ДИСТРИБУТИВА                                       │
│   ──────────────────────────────────────────────────────────── │
│   cat /etc/os-release         # Повна інформація               │
│   lsb_release -a              # LSB інформація                 │
│   hostnamectl                 # Hostname + OS info             │
│   uname -a                    # Ядро та архітектура            │
│                                                                 │
│   DEBIAN/UBUNTU (APT)                                           │
│   ──────────────────────────────────────────────────────────── │
│   apt update                  # Оновити індекс пакетів         │
│   apt upgrade                 # Оновити пакети                 │
│   apt install <pkg>           # Встановити                     │
│   apt remove <pkg>            # Видалити                       │
│   apt search <query>          # Пошук                          │
│   dpkg -l                     # Список встановлених            │
│                                                                 │
│   FEDORA/RHEL/ROCKY (DNF)                                       │
│   ──────────────────────────────────────────────────────────── │
│   dnf update                  # Оновити все                    │
│   dnf install <pkg>           # Встановити                     │
│   dnf remove <pkg>            # Видалити                       │
│   dnf search <query>          # Пошук                          │
│   rpm -qa                     # Список встановлених            │
│                                                                 │
│   ARCH LINUX (PACMAN)                                           │
│   ──────────────────────────────────────────────────────────── │
│   pacman -Syu                 # Оновити все                    │
│   pacman -S <pkg>             # Встановити                     │
│   pacman -R <pkg>             # Видалити                       │
│   pacman -Ss <query>          # Пошук                          │
│   yay -S <aur-pkg>            # AUR пакети                     │
│                                                                 │
│   СІМЕЙСТВА ДИСТРИБУТИВІВ                                       │
│   ──────────────────────────────────────────────────────────── │
│   Debian → Ubuntu → Mint, Pop!_OS, Elementary                  │
│   RHEL → Fedora → CentOS Stream, Rocky, Alma                   │
│   Arch → Manjaro, EndeavourOS, SteamOS 3                       │
│   Independent: Gentoo, Slackware, NixOS, openSUSE              │
│                                                                 │
│   ВИБІР ДИСТРИБУТИВА                                            │
│   ──────────────────────────────────────────────────────────── │
│   Новачок         → Ubuntu, Linux Mint                         │
│   Сервер          → Debian stable, RHEL/Rocky, Ubuntu LTS      │
│   Desktop + новий → Fedora                                     │
│   Контейнери      → Alpine Linux (5 MB image)                  │
│   Enterprise      → RHEL, SUSE, Ubuntu Pro                     │
│   Навчання        → Arch, Gentoo                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Чим відрізняється дистрибутив Linux від самого ядра Linux?** Які компоненти входять у типовий дистрибутив?

2. **Поясніть різницю між rolling release (Arch) та point release (Ubuntu LTS).** Які переваги та недоліки кожного підходу?

3. **Чому компанії обирають RHEL, а не безкоштовний Fedora чи Rocky Linux для production?** Що дає комерційна підтримка?

4. **Яка роль Alpine Linux в екосистемі контейнерів?** Чому Docker образи на Alpine важать 5-10 MB замість 200+ MB?

5. **Порівняйте apt, dnf та pacman.** Як встановити пакет nginx на Debian, Fedora та Arch?

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть універсальний пакетний менеджер-обгортку

Напишіть скрипт, який автоматично визначає ваш дистрибутив і працює з правильним пакетним менеджером. Це реальний інструмент, який використовують DevOps-інженери!

**Кроки:**

1. Створіть скрипт:
```bash
mkdir -p ~/scripts
nano ~/scripts/pkg.sh
```

2. Напишіть код:
```bash
#!/bin/bash
# Universal Package Manager Wrapper
# Підтримує: apt (Debian/Ubuntu), dnf (Fedora/RHEL), pacman (Arch)

# Визначення пакетного менеджера
detect_pm() {
    if command -v apt &> /dev/null; then
        echo "apt"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    else
        echo "unknown"
    fi
}

PM=$(detect_pm)
ACTION=$1
PACKAGE=$2

show_help() {
    echo "🐧 Universal Package Manager"
    echo "Detected: $PM"
    echo ""
    echo "Usage: pkg.sh <action> [package]"
    echo ""
    echo "Actions:"
    echo "  install <pkg>  - Install package"
    echo "  remove <pkg>   - Remove package"
    echo "  search <pkg>   - Search for package"
    echo "  update         - Update package list"
    echo "  upgrade        - Upgrade all packages"
    echo "  info <pkg>     - Show package info"
    echo "  list           - List installed packages"
}

case "$PM" in
    apt)
        case "$ACTION" in
            install) sudo apt install -y "$PACKAGE" ;;
            remove)  sudo apt remove -y "$PACKAGE" ;;
            search)  apt search "$PACKAGE" ;;
            update)  sudo apt update ;;
            upgrade) sudo apt upgrade -y ;;
            info)    apt show "$PACKAGE" ;;
            list)    dpkg -l | tail -20 ;;
            *)       show_help ;;
        esac
        ;;
    dnf)
        case "$ACTION" in
            install) sudo dnf install -y "$PACKAGE" ;;
            remove)  sudo dnf remove -y "$PACKAGE" ;;
            search)  dnf search "$PACKAGE" ;;
            update)  sudo dnf check-update ;;
            upgrade) sudo dnf upgrade -y ;;
            info)    dnf info "$PACKAGE" ;;
            list)    rpm -qa | tail -20 ;;
            *)       show_help ;;
        esac
        ;;
    pacman)
        case "$ACTION" in
            install) sudo pacman -S --noconfirm "$PACKAGE" ;;
            remove)  sudo pacman -R --noconfirm "$PACKAGE" ;;
            search)  pacman -Ss "$PACKAGE" ;;
            update)  sudo pacman -Sy ;;
            upgrade) sudo pacman -Syu --noconfirm ;;
            info)    pacman -Si "$PACKAGE" ;;
            list)    pacman -Q | tail -20 ;;
            *)       show_help ;;
        esac
        ;;
    *)
        echo "❌ Unknown package manager"
        exit 1
        ;;
esac
```

3. Налаштуйте та протестуйте:
```bash
chmod +x ~/scripts/pkg.sh
~/scripts/pkg.sh              # Показати help
~/scripts/pkg.sh search htop  # Пошук пакета
~/scripts/pkg.sh info htop    # Інформація про пакет
```

4. Створіть alias:
```bash
echo 'alias pkg="~/scripts/pkg.sh"' >> ~/.bashrc
source ~/.bashrc
```

**Очікуваний результат:**
- Скрипт `~/scripts/pkg.sh`, який працює на будь-якому дистрибутиві
- Alias `pkg` для швидкого виклику
- Уніфікований інтерфейс: `pkg install htop`, `pkg search vim`

**Бонус (для допитливих):**
- Додайте підтримку zypper (openSUSE): `zypper install`, `zypper search`
- Додайте логування операцій у файл `~/.pkg.log`
- Реалізуйте команду `pkg installed` — показати всі встановлені пакети з пошуком: `pkg installed | grep python`
- Додайте кольоровий вивід для success (зелений) та error (червоний)

## Підсумок

| Дистрибутив | Для кого |
|-------------|----------|
| **Ubuntu** | Початківці, загальне використання |
| **Fedora** | Розробники, ентузіасти нових технологій |
| **Debian** | Сервери, стабільність понад усе |
| **Arch** | Досвідчені користувачі, кастомізація |
| **RHEL/Rocky** | Enterprise, корпорації |
| **Mint** | Перехід з Windows |
| **Pop!_OS** | Геймери, розробники |

**Порада:** Не витрачайте багато часу на вибір першого дистрибутива. Почніть з Ubuntu або Fedora, а потім експериментуйте.

На наступній лекції розглянемо графічний інтерфейс Linux (X11, Wayland, Desktop Environments).
