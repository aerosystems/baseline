---
title: "Графічні середовища ОС Linux"
type: lecture
order: 13
preview: "GNOME, KDE, Xfce, X11, Wayland."
---

## Linux — не тільки командний рядок

Поширена помилка: "Linux — це тільки чорний екран з білим текстом". Насправді сучасний Linux має потужний графічний інтерфейс, який не поступається Windows чи macOS. На відміну від них, у Linux ви можете **обирати** графічне середовище на свій смак.

**Факти про GUI в Linux:**
- YouTube, Netflix, Spotify — працюють на серверах Linux
- Android — модифіковане ядро Linux з власним GUI
- Steam Deck — ігрова консоль на базі Arch Linux з KDE Plasma
- Більшість кінофільмів рендеряться на Linux-workstations

```
┌─────────────────────────────────────────────────────────────────┐
│                    АРХІТЕКТУРА GUI В LINUX                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Applications                          │  │
│   │        Firefox, GIMP, LibreOffice, Terminal             │  │
│   └─────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│   ┌─────────────────────────▼───────────────────────────────┐  │
│   │              Desktop Environment (DE)                    │  │
│   │        GNOME, KDE Plasma, Xfce, Cinnamon, MATE          │  │
│   └─────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│   ┌─────────────────────────▼───────────────────────────────┐  │
│   │                   Window Manager                         │  │
│   │            Mutter, KWin, Xfwm, Openbox                  │  │
│   └─────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│   ┌─────────────────────────▼───────────────────────────────┐  │
│   │              Display Server Protocol                     │  │
│   │                 X11 або Wayland                          │  │
│   └─────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│   ┌─────────────────────────▼───────────────────────────────┐  │
│   │              Linux Kernel + DRM/KMS                      │  │
│   │                   (GPU drivers)                          │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Display Server: X11 vs Wayland

Display server — це програма, що відповідає за відображення графіки на екрані. Вона приймає запити від програм ("намалюй вікно") і передає їх на GPU.

### X Window System (X11)

**X11** (або просто "X") — протокол, створений у 1984 році в MIT. Його реалізація для Linux — **Xorg**.

**Ключові особливості X11:**
- **Клієнт-сервер архітектура** — програми (клієнти) спілкуються з X-сервером
- **Network transparent** — можна запускати GUI-програми на віддаленому комп'ютері
- **Compositor** — окрема програма для ефектів (тіні, прозорість)
- **40 років legacy** — підтримує дуже старе ПЗ

```bash
# Перевірити версію Xorg
X -version

# Конфігурація
ls /etc/X11/
cat /etc/X11/xorg.conf  # Якщо існує

# Логи
cat ~/.local/share/xorg/Xorg.0.log | head -50

# Інформація про дисплей
xdpyinfo | head -20
```

### Wayland

**Wayland** — сучасний протокол (2008), створений для заміни X11. У Wayland **compositor** виконує роль і сервера, і менеджера вікон.

**Переваги Wayland:**
- **Безпечніший** — ізоляція вікон (програма не може читати інші вікна)
- **Швидший** — менше overhead, пряма робота з GPU
- **Кращий HiDPI** — fractional scaling (125%, 150%)
- **Менше tearing** — VSync за замовчуванням
- **Per-monitor scaling** — різний масштаб для різних моніторів

```
┌─────────────────────────────────────────────────────────────────┐
│                    X11 vs WAYLAND                               │
│                                                                 │
│   X11 (1984)                          Wayland (2008)           │
│   ═══════════════════════             ══════════════           │
│                                                                 │
│   App ──► X Server ──► Compositor    App ──► Compositor ──► GPU│
│                  │         │                                   │
│                  └────┬────┘                                   │
│                       ▼                                        │
│                      GPU                                       │
│                                                                 │
│   ✅ Network transparency            ✅ Безпечніший             │
│   ✅ Legacy support                  ✅ Швидший                  │
│   ✅ Remote apps (ssh -X)            ✅ HiDPI, per-monitor DPI  │
│   ✅ Screen sharing (easy)           ✅ No tearing               │
│                                                                 │
│   ❌ Застарілий код                  ❌ Деякі програми не працюють│
│   ❌ Security issues                 ❌ Складніший remote         │
│   ❌ Tearing                         ❌ Screen recording needs API│
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Який display server використовується?
echo $XDG_SESSION_TYPE
# Виведе: x11 або wayland

# Примусово запустити програму в X11 (через XWayland)
GDK_BACKEND=x11 firefox

# Примусово Wayland
GDK_BACKEND=wayland firefox
QT_QPA_PLATFORM=wayland dolphin

# Перевірити підтримку Wayland у GNOME
gnome-shell --version
loginctl show-session $(loginctl | grep $(whoami) | awk '{print $1}') -p Type
```

### XWayland — сумісність

**XWayland** — шар сумісності, що дозволяє X11-програмам працювати у Wayland-сесії. Більшість DE включають його автоматично.

```bash
# Перевірити чи програма працює через XWayland
xlsclients  # Покаже X11-клієнтів у Wayland

# Якщо програма не працює в Wayland
QT_QPA_PLATFORM=xcb app_name  # Для Qt
GDK_BACKEND=x11 app_name       # Для GTK
```

## Desktop Environment (DE)

Desktop Environment — це комплекс програм: window manager, панель, файловий менеджер, налаштування, набір базових програм.

### GNOME

**GNOME** (GNU Network Object Model Environment) — найпопулярніше DE. За замовчуванням у Ubuntu, Fedora, RHEL, Debian.

```
┌─────────────────────────────────────────────────────────────────┐
│                         GNOME 46                                │
│   Toolkit: GTK4 | Compositor: Mutter | Protocol: Wayland        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Activities  │  AppMenu  │              🔊 🔋 📶  10:30 │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │                                                         │  │
│   │            Чистий, мінімалістичний робочий стіл         │  │
│   │                                                         │  │
│   │            (Без іконок за замовчуванням)                │  │
│   │                                                         │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  Dash         │  │
│   │  │Files│ │Term │ │ Web │ │Code │ │ ... │  (Favorites)  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Особливості:                                                 │
│   ✅ Activities overview (Super key)                           │
│   ✅ Dynamic workspaces                                        │
│   ✅ Native Wayland                                            │
│   ✅ Touch-friendly                                            │
│   ❌ Обмежена кастомізація без розширень                       │
│   ❌ Вищі вимоги до RAM (~1 ГБ)                                │
└─────────────────────────────────────────────────────────────────┘
```

**Компоненти GNOME:**
- **GNOME Shell** — desktop shell, панель, overview
- **Mutter** — window manager та compositor
- **Nautilus (Files)** — файловий менеджер
- **GNOME Terminal** — термінал
- **Gedit / GNOME Text Editor** — текстовий редактор
- **GNOME Settings** — налаштування системи

```bash
# Версія GNOME
gnome-shell --version

# Налаштування через gsettings
gsettings list-schemas | grep gnome
gsettings list-keys org.gnome.desktop.interface
gsettings get org.gnome.desktop.interface gtk-theme

# GNOME Tweaks — розширені налаштування
sudo apt install gnome-tweaks
gnome-tweaks

# Extension Manager
sudo apt install gnome-shell-extension-manager
```

### KDE Plasma

**KDE Plasma** — друге за популярністю DE. Максимальна гнучкість та кастомізація. За замовчуванням у Kubuntu, openSUSE, Manjaro KDE.

```
┌─────────────────────────────────────────────────────────────────┐
│                       KDE PLASMA 6                              │
│   Toolkit: Qt6 | Compositor: KWin | Protocol: Wayland/X11       │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ┌──┐ File Edit View Help                   🔊 🔋 📶 10:30│  │
│   │ │🐧│                                      System Tray   │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │                                                         │  │
│   │     📁 📁 📁   Desktop Widgets можливі                  │  │
│   │                                                         │  │
│   │        System Monitor Widget   │   Notes Widget         │  │
│   │        ┌───────────────────┐   │   ┌──────────────┐    │  │
│   │        │ CPU: ████░░ 45%  │   │   │ TODO:        │    │  │
│   │        │ RAM: ██████░ 67% │   │   │ - Homework   │    │  │
│   │        └───────────────────┘   │   └──────────────┘    │  │
│   │                                                         │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ 🐧 │ Dolphin │ Konsole │ Firefox │        │ Task Manager │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Особливості:                                                 │
│   ✅ Максимальна кастомізація                                  │
│   ✅ Windows-like workflow                                     │
│   ✅ Widgets на desktop та панелі                             │
│   ✅ KDE Connect (інтеграція з Android)                       │
│   ❌ Може бути overwhelming для новачків                       │
│   ❌ Більше налаштувань = більше місць для помилок            │
└─────────────────────────────────────────────────────────────────┘
```

**Компоненти KDE Plasma:**
- **Plasma Shell** — desktop shell
- **KWin** — window manager та compositor
- **Dolphin** — файловий менеджер
- **Konsole** — термінал
- **Kate** — текстовий редактор
- **System Settings** — налаштування

```bash
# Версія Plasma
plasmashell --version

# Версія KDE Frameworks
kf5-config --version

# Перезапустити Plasma (якщо глюки)
kquitapp5 plasmashell && kstart5 plasmashell

# KDE System Settings
systemsettings5
```

### XFCE

**XFCE** — легке та швидке DE. Ідеальне для старих комп'ютерів або тих, хто цінує простоту.

```
┌─────────────────────────────────────────────────────────────────┐
│                         XFCE 4.18                               │
│   Toolkit: GTK3 | WM: Xfwm | RAM: ~400 МБ                       │
│                                                                 │
│   Особливості:                                                 │
│   ✅ Дуже легке та швидке                                      │
│   ✅ Класичний desktop metaphor                                │
│   ✅ Стабільне (рідко ламається)                               │
│   ✅ Модульне (можна замінити компоненти)                      │
│   ❌ Менш сучасний вигляд                                      │
│   ❌ Повільніший розвиток                                      │
│                                                                 │
│   Дистрибутиви: Xubuntu, Manjaro XFCE, MX Linux                │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Встановити XFCE
sudo apt install xfce4 xfce4-goodies

# Компоненти
thunar           # Файловий менеджер
xfce4-terminal   # Термінал
mousepad         # Текстовий редактор
```

### LXQt

**LXQt** — найлегше повноцінне DE. Для дуже старих комп'ютерів.

```bash
# RAM: ~200-300 МБ
# Toolkit: Qt5
# Дистрибутиви: Lubuntu

sudo apt install lxqt
```

### Cinnamon

**Cinnamon** — DE від Linux Mint. Схожий на Windows 7, ідеальний для переходу з Windows.

```bash
# RAM: ~600-700 МБ
# Toolkit: GTK3
# Дистрибутиви: Linux Mint

sudo apt install cinnamon-desktop-environment
```

### MATE

**MATE** — продовження GNOME 2. Для тих, хто любить класичний GNOME.

```bash
# RAM: ~400-500 МБ
# Toolkit: GTK3
# Дистрибутиви: Ubuntu MATE

sudo apt install mate-desktop-environment
```

## Display Manager (DM)

**Display Manager** — це login screen (екран входу). Він запускається при завантаженні і дозволяє вибрати DE та ввести пароль.

| DM | DE | Особливості |
|----|----|----|
| **GDM** | GNOME | Wayland за замовчуванням |
| **SDDM** | KDE | Qt-based, кастомізація |
| **LightDM** | Універсальний | Легкий, різні greeters |
| **LY** | Будь-яке | TUI (текстовий), мінімалістичний |

```bash
# Який DM використовується?
cat /etc/X11/default-display-manager
# або
systemctl status display-manager

# Змінити DM
sudo dpkg-reconfigure gdm3
# або
sudo dpkg-reconfigure sddm

# Перезапустити DM (вийде з сесії!)
sudo systemctl restart gdm
```

## Порівняння Desktop Environments

| DE | RAM | Toolkit | Кастомізація | Для кого |
|----|-----|---------|--------------|----------|
| **GNOME** | ~1 ГБ | GTK4 | Низька* | macOS fans, touch |
| **KDE Plasma** | ~800 МБ | Qt6 | Максимальна | Power users, Windows fans |
| **XFCE** | ~400 МБ | GTK3 | Середня | Старі ПК, стабільність |
| **LXQt** | ~300 МБ | Qt5 | Низька | Дуже старі ПК |
| **Cinnamon** | ~700 МБ | GTK3 | Висока | Windows 7 fans |
| **MATE** | ~500 МБ | GTK3 | Середня | GNOME 2 fans |

*GNOME розширюється через extensions

## Практичні команди

```bash
# Поточне середовище
echo $XDG_CURRENT_DESKTOP
echo $DESKTOP_SESSION
echo $XDG_SESSION_TYPE  # x11/wayland

# Версії
gnome-shell --version     # GNOME
plasmashell --version     # KDE
xfce4-about --version     # XFCE

# Доступні сесії (для вибору при логіні)
ls /usr/share/xsessions/
ls /usr/share/wayland-sessions/

# Встановити DE (Ubuntu)
sudo apt install kubuntu-desktop    # KDE
sudo apt install xubuntu-desktop    # XFCE
sudo apt install lubuntu-desktop    # LXQt
sudo apt install cinnamon-desktop-environment

# Видалити DE (обережно!)
sudo apt purge kubuntu-desktop
sudo apt autoremove

# Перемикання DE
# При логіні (GDM/SDDM) — клік на шестерню біля імені
```

## Вибір DE: рекомендації

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВИБІР DE ЗА КРИТЕРІЯМИ                       │
│                                                                 │
│   "Хочу як macOS"                    → GNOME                   │
│   "Хочу як Windows"                  → KDE Plasma / Cinnamon   │
│   "Старий комп'ютер (4+ ГБ RAM)"     → XFCE                    │
│   "Дуже старий (2 ГБ RAM)"           → LXQt                    │
│   "Хочу все налаштувати"             → KDE Plasma              │
│   "Просто працювати"                 → GNOME / Cinnamon        │
│   "Для сервера з GUI"                → XFCE / MATE             │
│                                                                 │
│   Порада: спробуйте Live USB різних дистрибутивів,             │
│   щоб обрати найкомфортніше DE для себе.                       │
└─────────────────────────────────────────────────────────────────┘
```

## Практичне завдання

```bash
# 1. Визначити поточне DE
echo "Desktop: $XDG_CURRENT_DESKTOP"
echo "Session Type: $XDG_SESSION_TYPE"

# 2. Перевірити версію
gnome-shell --version 2>/dev/null || plasmashell --version 2>/dev/null

# 3. Переглянути доступні сесії
ls /usr/share/xsessions/ 2>/dev/null
ls /usr/share/wayland-sessions/ 2>/dev/null

# 4. Перевірити Display Manager
cat /etc/X11/default-display-manager

# 5. Скільки пам'яті займає DE?
ps aux --sort=-%mem | head -20
# Шукайте gnome-shell, plasmashell, xfce4-session

# 6. Список GTK тем
ls /usr/share/themes/

# 7. Список іконок
ls /usr/share/icons/
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────┐
│           LINUX GUI ТЕХНОЛОГІЇ У PRODUCTION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PIXAR / DISNEY / DREAMWORKS                                   │
│   ├── Linux workstations з GNOME/KDE для аніматорів            │
│   ├── Тисячі робочих станцій на RHEL/Ubuntu                    │
│   └── X11 forwarding для remote rendering farms                │
│                                                                 │
│   AUTOMOTIVE (Tesla, Mercedes, BMW)                             │
│   ├── Wayland для in-car infotainment displays                 │
│   ├── Qt/KDE технології для dashboard UI                      │
│   └── Embedded Linux GUI на основі Weston compositor           │
│                                                                 │
│   GAMING                                                        │
│   ├── Valve Steam Deck: KDE Plasma + Wayland                   │
│   ├── Proton/Wine: X11 сумісність для Windows ігор             │
│   └── Vulkan + Wayland для native Linux gaming                 │
│                                                                 │
│   GOOGLE                                                        │
│   ├── ChromeOS: Wayland-based compositor (Exo)                 │
│   ├── Android: SurfaceFlinger (не X11/Wayland)                 │
│   └── gLinux workstations: GNOME + Wayland                     │
│                                                                 │
│   RED HAT / IBM                                                 │
│   ├── GNOME за замовчуванням у RHEL                            │
│   ├── Wayland з RHEL 8+ для security                           │
│   └── Cockpit web UI для серверів без GUI                      │
│                                                                 │
│   VFX STUDIOS (ILM, Weta, MPC)                                  │
│   ├── CentOS/Rocky workstations з KDE                          │
│   ├── Remote desktop через X11/VNC для рендерингу              │
│   └── Custom Qt applications для VFX pipeline                  │
│                                                                 │
│   SCIENTIFIC COMPUTING (CERN, NASA)                             │
│   ├── X11 forwarding для remote visualization                  │
│   ├── Scientific Linux → CentOS → Rocky/Alma                   │
│   └── VNC для доступу до суперкомп'ютерів                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│        КАР'ЄРА: LINUX GUI ТА DESKTOP TECHNOLOGIES               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LINUX DESKTOP ADMINISTRATOR                                   │
│   ├── Рівень: Junior → Senior                                  │
│   ├── Зарплата: $55,000 - $100,000 USD / €48,000 - €85,000     │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ Налаштування GNOME, KDE для корпорацій                 │
│   │   ✓ Управління display managers (GDM, SDDM)                │
│   │   ✓ X11 forwarding, VNC, remote desktop                    │
│   └── Компанії: VFX студії, університети, банки                │
│                                                                 │
│   EMBEDDED LINUX GUI ENGINEER                                   │
│   ├── Рівень: Middle → Senior                                  │
│   ├── Зарплата: $90,000 - $160,000 USD / €75,000 - €140,000    │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ Wayland compositor development                         │
│   │   ✓ Qt/QML для embedded UI                                 │
│   │   ✓ Оптимізація GPU для low-power devices                  │
│   └── Компанії: Tesla, BMW, Mercedes, IoT startups             │
│                                                                 │
│   QT/KDE DEVELOPER                                              │
│   ├── Рівень: Junior → Principal                               │
│   ├── Зарплата: $70,000 - $150,000 USD / €60,000 - €130,000    │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ KDE Plasma architecture                                │
│   │   ✓ Qt6 та Wayland integration                             │
│   │   ✓ KWin compositor customization                          │
│   └── Компанії: KDAB, Blue Systems, automotive                 │
│                                                                 │
│   GTK/GNOME DEVELOPER                                           │
│   ├── Рівень: Junior → Senior                                  │
│   ├── Зарплата: $65,000 - $140,000 USD / €55,000 - €120,000    │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ GNOME Shell architecture                               │
│   │   ✓ GTK4 та Mutter compositor                              │
│   │   ✓ GJS (GNOME JavaScript)                                 │
│   └── Компанії: Red Hat, Canonical, Endless                    │
│                                                                 │
│   GRAPHICS/DISPLAY ENGINEER                                     │
│   ├── Рівень: Senior → Principal                               │
│   ├── Зарплата: $120,000 - $220,000 USD / €100,000 - €180,000  │
│   ├── Навички з цієї лекції:                                   │
│   │   ✓ X11/Wayland protocols                                  │
│   │   ✓ DRM/KMS kernel subsystem                               │
│   │   ✓ Mesa/GPU drivers                                       │
│   └── Компанії: AMD, NVIDIA, Intel, Valve                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-платформи для практики

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **GNOME Extensions** | Офіційний репозиторій розширень | extensions.gnome.org |
| **KDE Store** | Теми, віджети для KDE | store.kde.org |
| **Wayland Book** | Повний гайд по Wayland протоколу | wayland-book.com |
| **X.Org Wiki** | Документація X11 | x.org/wiki |
| **Regolith Linux** | Тайлінговий i3 + GNOME | regolith-desktop.com |

### Книги

| Назва | Автор | Рівень |
|-------|-------|--------|
| **The Wayland Protocol** | Drew DeVault | Середній-Просунутий |
| **Qt 6 for Beginners** | Various | Початковий |
| **GTK 4 Programming Guide** | GNOME Project | Середній |
| **X Window System Protocol** | X.Org Foundation | Просунутий |
| **Programming with Qt** | Matthias Kalle | Середній |

### YouTube канали

| Канал | Тематика |
|-------|----------|
| **Brodie Robertson** | Wayland, tiling WMs, Linux GUI |
| **Nick @ The Linux Experiment** | DE огляди, GNOME vs KDE |
| **Chris @ DistroTube** | Tiling WMs, dwm, i3, bspwm |
| **TechHut** | KDE Plasma tutorials |
| **Linux Scoop** | DE огляди та порівняння |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                    LINUX GUI CHEAT SHEET                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ВИЗНАЧЕННЯ DISPLAY SERVER                                     │
│   ──────────────────────────────────────────────────────────── │
│   echo $XDG_SESSION_TYPE      # x11 або wayland                │
│   echo $WAYLAND_DISPLAY       # Якщо Wayland                   │
│   echo $DISPLAY               # Якщо X11 (:0, :1, etc)         │
│                                                                 │
│   ВИЗНАЧЕННЯ DESKTOP ENVIRONMENT                                │
│   ──────────────────────────────────────────────────────────── │
│   echo $XDG_CURRENT_DESKTOP   # GNOME, KDE, XFCE               │
│   echo $DESKTOP_SESSION       # Сесія                          │
│   gnome-shell --version       # Версія GNOME                   │
│   plasmashell --version       # Версія KDE Plasma              │
│                                                                 │
│   X11 КОМАНДИ                                                   │
│   ──────────────────────────────────────────────────────────── │
│   xrandr                      # Монітори та роздільність       │
│   xrandr --output HDMI-1 --mode 1920x1080                      │
│   xdpyinfo                    # Інформація про X display       │
│   xlsclients                  # X11 клієнти                    │
│   xev                         # Тестування input events        │
│                                                                 │
│   WAYLAND КОМАНДИ                                               │
│   ──────────────────────────────────────────────────────────── │
│   wlr-randr                   # Wayland аналог xrandr          │
│   weston-info                 # Weston compositor info         │
│   GDK_BACKEND=wayland app     # Запустити у Wayland            │
│   QT_QPA_PLATFORM=wayland app # Qt app у Wayland               │
│                                                                 │
│   DISPLAY MANAGER                                               │
│   ──────────────────────────────────────────────────────────── │
│   systemctl status display-manager                             │
│   cat /etc/X11/default-display-manager                         │
│   sudo dpkg-reconfigure gdm3  # Змінити DM                     │
│                                                                 │
│   ВСТАНОВЛЕННЯ DE                                               │
│   ──────────────────────────────────────────────────────────── │
│   sudo apt install gnome-shell          # GNOME                │
│   sudo apt install kubuntu-desktop      # KDE Plasma           │
│   sudo apt install xfce4                # XFCE                 │
│   sudo apt install cinnamon             # Cinnamon             │
│                                                                 │
│   ДОСТУПНІ СЕСІЇ                                                │
│   ──────────────────────────────────────────────────────────── │
│   ls /usr/share/xsessions/              # X11 сесії            │
│   ls /usr/share/wayland-sessions/       # Wayland сесії        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка різниця між X11 та Wayland?** Чому Wayland вважається безпечнішим за X11?

2. **Що таке compositor і яку роль він відіграє?** Як compositor в X11 відрізняється від compositor в Wayland?

3. **Порівняйте GNOME та KDE Plasma.** Для якого типу користувачів краще підходить кожне DE?

4. **Що таке XWayland і навіщо він потрібен?** Як визначити, чи програма працює через XWayland?

5. **Яка роль Display Manager (GDM, SDDM)?** Чим він відрізняється від Desktop Environment?

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть скрипт-детектив графічної підсистеми

Напишіть скрипт, який детально аналізує вашу графічну підсистему і виводить зрозумілий звіт. Це допоможе при troubleshooting графічних проблем!

**Кроки:**

1. Створіть скрипт:
```bash
mkdir -p ~/scripts
nano ~/scripts/graphics-info.sh
```

2. Напишіть код:
```bash
#!/bin/bash
# Graphics Subsystem Analyzer

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║            GRAPHICS SUBSYSTEM REPORT                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Display Server
echo "🖥️  DISPLAY SERVER"
if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
    echo "   Protocol:     Wayland ✓ (сучасний, безпечний)"
    echo "   Compositor:   $(echo $WAYLAND_DISPLAY)"
else
    echo "   Protocol:     X11 (legacy)"
    echo "   Display:      $DISPLAY"
fi
echo ""

# Desktop Environment
echo "🎨  DESKTOP ENVIRONMENT"
echo "   DE:           $XDG_CURRENT_DESKTOP"
if command -v gnome-shell &> /dev/null; then
    echo "   GNOME Shell:  $(gnome-shell --version 2>/dev/null)"
fi
if command -v plasmashell &> /dev/null; then
    echo "   KDE Plasma:   $(plasmashell --version 2>/dev/null)"
fi
echo ""

# GPU Information
echo "🎮  GPU"
GPU_INFO=$(lspci | grep -i vga | cut -d: -f3)
echo "   Card:         $GPU_INFO"
if command -v glxinfo &> /dev/null; then
    RENDERER=$(glxinfo 2>/dev/null | grep "OpenGL renderer" | cut -d: -f2)
    echo "   Renderer:    $RENDERER"
fi
echo ""

# Display Manager
echo "🔐  DISPLAY MANAGER"
DM=$(cat /etc/X11/default-display-manager 2>/dev/null | xargs basename)
echo "   DM:           ${DM:-unknown}"
echo "   Status:       $(systemctl is-active display-manager)"
echo ""

# Available Sessions
echo "📋  AVAILABLE SESSIONS"
echo "   X11:"
for session in /usr/share/xsessions/*.desktop; do
    [ -f "$session" ] && echo "      - $(basename $session .desktop)"
done
echo "   Wayland:"
for session in /usr/share/wayland-sessions/*.desktop; do
    [ -f "$session" ] && echo "      - $(basename $session .desktop)"
done
echo ""

# Monitors
echo "🖵  MONITORS"
if [ "$XDG_SESSION_TYPE" = "x11" ]; then
    xrandr --query 2>/dev/null | grep " connected" | while read line; do
        echo "   $line"
    done
else
    echo "   (Use 'gnome-control-center display' for Wayland)"
fi
echo ""

# Theme Info
echo "🎭  CURRENT THEME (GNOME)"
if command -v gsettings &> /dev/null; then
    echo "   GTK Theme:    $(gsettings get org.gnome.desktop.interface gtk-theme 2>/dev/null)"
    echo "   Icons:        $(gsettings get org.gnome.desktop.interface icon-theme 2>/dev/null)"
    echo "   Color Scheme: $(gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null)"
fi

echo ""
echo "📅  Generated: $(date)"
```

3. Зробіть виконуваним та запустіть:
```bash
chmod +x ~/scripts/graphics-info.sh
~/scripts/graphics-info.sh
```

4. Збережіть звіт у файл:
```bash
~/scripts/graphics-info.sh > ~/graphics-report.txt
cat ~/graphics-report.txt
```

**Очікуваний результат:**
- Скрипт `~/scripts/graphics-info.sh`
- Файл звіту `~/graphics-report.txt`
- Повне розуміння вашої графічної підсистеми

**Бонус (для допитливих):**
- Додайте перевірку драйверів NVIDIA: `nvidia-smi` (якщо є)
- Визначте, чи працює compositor: `pgrep -l "picom\|compton\|mutter\|kwin"`
- Додайте рекомендації: якщо X11 — порадьте спробувати Wayland, якщо старий GPU — порадьте легке DE
- Експортуйте звіт у HTML-формат для красивого перегляду в браузері

## Підсумок

| Компонент | Опис | Приклади |
|-----------|------|----------|
| **Display Server** | Протокол відображення | X11 (Xorg), Wayland |
| **Compositor** | Композитор (ефекти) | Mutter, KWin, Picom |
| **Window Manager** | Керування вікнами | Mutter, KWin, Xfwm, i3 |
| **Desktop Environment** | Повний набір ПЗ | GNOME, KDE, XFCE |
| **Display Manager** | Екран входу | GDM, SDDM, LightDM |

| Критерій | GNOME | KDE | XFCE |
|----------|-------|-----|------|
| RAM | ~1 ГБ | ~800 МБ | ~400 МБ |
| Wayland | ✅ Native | ✅ Native | ❌ X11 only |
| Кастомізація | Через extensions | Вбудована | Середня |
| Стиль | macOS | Windows | Класика |

На наступній лекції налаштуємо робочий стіл Linux.
