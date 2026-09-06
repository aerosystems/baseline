---
title: "Робочий стіл користувача"
type: lecture
order: 14
preview: "Налаштування робочого столу, панелі, меню."
---

## Елементи робочого столу Linux

Робочий стіл (Desktop) — це візуальна оболонка для взаємодії з комп'ютером. Незалежно від DE, основні елементи схожі.

```
┌─────────────────────────────────────────────────────────────────┐
│                    АНАТОМІЯ РОБОЧОГО СТОЛУ                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ≡ Activities │ Firefox ▼ │                 🔊 🔋 📶 10:30│  │  ← Top Panel
│   ├─────────────────────────────────────────────────────────┤  │     (GNOME)
│   │                                                          │  │
│   │   ┌──────────────────┐     ┌──────────────────┐         │  │
│   │   │                  │     │                  │         │  │
│   │   │  Desktop Icons   │     │   Floating       │         │  │
│   │   │  📁 Home         │     │   Window         │         │  │
│   │   │  📁 Documents    │     │   (Application)  │         │  │
│   │   │  🗑️ Trash        │     │                  │         │  │
│   │   └──────────────────┘     └──────────────────┘         │  │
│   │                                                          │  │  ← Desktop
│   │                              Background Wallpaper        │  │     Area
│   │                                                          │  │
│   │                                                          │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ ┌───┐ ┌───┐ ┌───┐ ┌───┐           ┌───────────────────┐│  │  ← Dock/
│   │ │📁 │ │🌐 │ │💻 │ │⚙️ │           │  Show Applications││  │     Panel
│   │ └───┘ └───┘ └───┘ └───┘           └───────────────────┘│  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Компоненти робочого столу

| Компонент | Опис | GNOME | KDE |
|-----------|------|-------|-----|
| **Panel/Bar** | Панель з меню та індикаторами | Top Bar | Можна кастомізувати |
| **Dock** | Швидкий запуск улюблених програм | Dash (лівий край) | Task Manager |
| **System Tray** | Індикатори (мережа, звук, батарея) | Вбудовано в панель | System Tray widget |
| **Desktop Icons** | Іконки на робочому столі | Розширення | Вбудовано |
| **Application Menu** | Меню для запуску програм | Activities Overview | Application Launcher |
| **Notification Area** | Сповіщення | Notification Banner | Notification Popups |

## Налаштування GNOME

### GNOME Settings (gnome-control-center)

**GNOME Settings** — основний центр налаштувань. Відкрити: Activities → Settings або командою.

```bash
# Відкрити налаштування
gnome-control-center

# Відкрити конкретний розділ
gnome-control-center display
gnome-control-center keyboard
gnome-control-center background
```

**Основні розділи:**

| Розділ | Що налаштовує |
|--------|---------------|
| **Wi-Fi / Network** | Мережеві підключення |
| **Bluetooth** | Bluetooth-пристрої |
| **Background** | Шпалери робочого столу |
| **Appearance** | Стиль (світла/темна тема), акцентний колір |
| **Notifications** | Поведінка сповіщень |
| **Search** | Пошук в Activities |
| **Multitasking** | Робочі столи, hot corners |
| **Privacy** | Приватність, історія файлів |
| **Displays** | Роздільність, масштаб, орієнтація |
| **Keyboard** | Розкладки, гарячі клавіші |
| **Sound** | Гучність, пристрої |
| **Power** | Енергозбереження, автовимкнення |
| **Users** | Акаунти користувачів |

### GNOME Tweaks (Розширені налаштування)

**GNOME Tweaks** надає доступ до налаштувань, які недоступні в стандартних Settings.

```bash
# Встановити
sudo apt install gnome-tweaks

# Запустити
gnome-tweaks
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOME TWEAKS                                 │
│                                                                 │
│   Appearance                                                   │
│   ├── Themes                                                   │
│   │   ├── Applications (GTK theme)                            │
│   │   ├── Cursor                                               │
│   │   ├── Icons                                                │
│   │   └── Shell (потрібен user-theme extension)               │
│   └── Background                                               │
│                                                                 │
│   Fonts                                                        │
│   ├── Interface Text: Cantarell Regular 11                    │
│   ├── Document Text: Sans Regular 11                          │
│   ├── Monospace Text: Monospace Regular 11                    │
│   ├── Antialiasing: Subpixel                                  │
│   └── Scaling Factor: 1.00                                    │
│                                                                 │
│   Keyboard & Mouse                                             │
│   ├── Acceleration Profile                                    │
│   └── Additional Layout Options                               │
│                                                                 │
│   Startup Applications                                         │
│   └── Програми для автозапуску                                │
│                                                                 │
│   Top Bar                                                      │
│   ├── Clock: Show Seconds                                     │
│   └── Calendar: Show Week Numbers                             │
│                                                                 │
│   Window Titlebars                                             │
│   └── Titlebar Buttons: Minimize, Maximize                    │
└─────────────────────────────────────────────────────────────────┘
```

### GNOME Extensions

**Extensions** — головний спосіб кастомізації GNOME. Це плагіни, написані на JavaScript, що змінюють поведінку Shell.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ПОПУЛЯРНІ EXTENSIONS                         │
│                                                                 │
│   Dock & Panel:                                                │
│   • Dash to Dock — dock внизу/збоку, auto-hide                │
│   • Dash to Panel — Windows-подібна панель знизу              │
│   • Arc Menu — класичне меню Start                            │
│                                                                 │
│   Productivity:                                                │
│   • Clipboard History — буфер обміну з історією               │
│   • GSConnect — інтеграція з Android (KDE Connect)            │
│   • Caffeine — не вимикати екран                              │
│                                                                 │
│   Appearance:                                                  │
│   • User Themes — дозволяє Shell themes                       │
│   • Blur my Shell — розмиття фону                             │
│   • Rounded Window Corners — заокруглення вікон               │
│                                                                 │
│   System:                                                      │
│   • system-monitor — графіки CPU/RAM в панелі                 │
│   • Vitals — температура, швидкість вентиляторів              │
│   • AppIndicator Support — підтримка tray icons               │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Extension Manager (рекомендовано)
sudo apt install gnome-shell-extension-manager

# Або через браузер
# https://extensions.gnome.org
# (потрібен browser integration)

# CLI керування
gnome-extensions list                    # Список встановлених
gnome-extensions list --enabled          # Тільки увімкнені
gnome-extensions enable extension-name   # Увімкнути
gnome-extensions disable extension-name  # Вимкнути
gnome-extensions info extension-name     # Інформація

# Де зберігаються extensions
ls ~/.local/share/gnome-shell/extensions/
ls /usr/share/gnome-shell/extensions/
```

### gsettings — налаштування через CLI

**gsettings** — інструмент для зміни налаштувань GNOME з командного рядка.

```bash
# Структура: gsettings [команда] [schema] [key] [value]

# Переглянути всі схеми
gsettings list-schemas | grep gnome

# Ключі конкретної схеми
gsettings list-keys org.gnome.desktop.interface

# Поточне значення
gsettings get org.gnome.desktop.interface gtk-theme

# Встановити значення
gsettings set org.gnome.desktop.interface gtk-theme "Adwaita-dark"

# Скинути до default
gsettings reset org.gnome.desktop.interface gtk-theme

# Корисні налаштування
gsettings set org.gnome.desktop.interface clock-show-seconds true
gsettings set org.gnome.desktop.interface show-battery-percentage true
gsettings set org.gnome.desktop.wm.preferences button-layout 'close,minimize,maximize:'
gsettings set org.gnome.mutter center-new-windows true
```

## Налаштування KDE Plasma

### System Settings

**System Settings** — центральна утиліта налаштування KDE. Значно потужніша за GNOME Settings.

```bash
# Відкрити
systemsettings5
# або через меню: Settings → System Settings
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    KDE SYSTEM SETTINGS                          │
│                                                                 │
│   APPEARANCE                          WORKSPACE                 │
│   ├── Global Theme                    ├── Workspace Behavior   │
│   ├── Plasma Style                    │   ├── General Behavior │
│   ├── Application Style               │   ├── Desktop Effects  │
│   │   ├── GNOME/GTK Apps Style       │   ├── Screen Edges      │
│   │   └── Window Decorations         │   ├── Screen Locking    │
│   ├── Colors                          │   └── Virtual Desktops │
│   ├── Icons                           ├── Window Management     │
│   ├── Cursors                         ├── Shortcuts            │
│   └── Fonts                           └── Startup & Shutdown   │
│                                                                 │
│   HARDWARE                            PERSONALIZATION          │
│   ├── Input Devices                   ├── Notifications        │
│   │   ├── Keyboard                    ├── Users                │
│   │   ├── Mouse                       ├── Regional Settings    │
│   │   └── Touchpad                    └── Accessibility        │
│   ├── Display & Monitor                                        │
│   ├── Audio                                                    │
│   └── Power Management                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Plasma Widgets

**Widgets** (плазмоїди) — інтерактивні елементи, які можна розміщувати на панелі та робочому столі.

```bash
# Додати widget на панель:
# 1. Правий клік на панелі
# 2. "Add Widgets..." або "Enter Edit Mode"
# 3. Drag & drop widget

# Додати widget на робочий стіл:
# Правий клік на робочому столі → "Add Widgets..."
```

| Widget | Опис |
|--------|------|
| **System Monitor** | Графіки CPU, RAM, мережа |
| **Weather** | Прогноз погоди |
| **Notes** | Sticky notes на робочому столі |
| **Event Calendar** | Календар з подіями |
| **Media Player** | Контроль плеєра |
| **KDE Connect** | Інтеграція з телефоном |
| **Digital Clock** | Годинник з налаштуваннями |
| **Folder View** | Відображення вмісту папки |

### KDE Store

**KDE Store** (store.kde.org) — репозиторій тем, віджетів та інших ресурсів.

```bash
# В System Settings → Get New... кнопки
# Автоматично завантажує з KDE Store

# Ручне встановлення теми:
# 1. Завантажити .tar.gz
# 2. System Settings → Global Theme → Install from File

# Популярні теми:
# • Breeze (default)
# • Kvantum (з QSS стилями)
# • Layan
# • Sweet
# • Nordic
```

## Шпалери та теми

### Встановлення шпалер

```bash
# GNOME — через GUI
# Settings → Background

# GNOME — через командний рядок
gsettings set org.gnome.desktop.background picture-uri "file:///home/user/wallpaper.jpg"
gsettings set org.gnome.desktop.background picture-uri-dark "file:///home/user/wallpaper-dark.jpg"
gsettings set org.gnome.desktop.background picture-options 'zoom'
# Опції: none, wallpaper, centered, scaled, stretched, zoom, spanned

# KDE — через GUI
# Settings → Appearance → Wallpaper
# Або правий клік на робочому столі → Configure Desktop and Wallpaper
```

### Встановлення GTK тем

```bash
# Системні теми
ls /usr/share/themes/

# Користувацькі теми
mkdir -p ~/.themes
# Розпакувати тему в ~/.themes/ThemeName/

# Застосувати (GNOME)
gsettings set org.gnome.desktop.interface gtk-theme "ThemeName"

# Застосувати (GNOME Tweaks)
# Appearance → Applications → вибрати тему

# Популярні теми для встановлення
sudo apt install arc-theme               # Arc (світла/темна)
sudo apt install numix-gtk-theme         # Numix
sudo apt install materia-gtk-theme       # Materia (Material Design)
sudo apt install adwaita-qt              # Adwaita для Qt програм
```

### Встановлення іконок

```bash
# Системні іконки
ls /usr/share/icons/

# Користувацькі іконки
mkdir -p ~/.local/share/icons
# Розпакувати в ~/.local/share/icons/IconTheme/

# Популярні набори іконок
sudo apt install papirus-icon-theme      # Papirus (найпопулярніший)
sudo apt install numix-icon-theme        # Numix
sudo apt install breeze-icon-theme       # Breeze (KDE)

# Застосувати (GNOME)
gsettings set org.gnome.desktop.interface icon-theme "Papirus"
```

## Автозапуск програм

### GNOME (GUI)

```bash
# GNOME Tweaks → Startup Applications
# Додати програми для автозапуску

# Або через Settings → Apps (деякі версії)
```

### Desktop Entry файли

```bash
# Автозапуск через .desktop файли
mkdir -p ~/.config/autostart

# Створити autostart entry
cat > ~/.config/autostart/myapp.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=My Application
Comment=Starts at login
Exec=/usr/bin/myapp
Icon=myapp
Terminal=false
Hidden=false
X-GNOME-Autostart-enabled=true
EOF

# Скопіювати існуючий .desktop
cp /usr/share/applications/firefox.desktop ~/.config/autostart/

# Вимкнути autostart (не видаляючи файл)
# Додати: Hidden=true або X-GNOME-Autostart-enabled=false
```

### Systemd user services

```bash
# Більш потужний спосіб автозапуску

# Створити service
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/mybackground.service << 'EOF'
[Unit]
Description=My Background Service
After=graphical-session.target

[Service]
Type=simple
ExecStart=/home/user/scripts/background.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

# Перезавантажити systemd
systemctl --user daemon-reload

# Увімкнути (автозапуск)
systemctl --user enable mybackground.service

# Запустити зараз
systemctl --user start mybackground.service

# Статус
systemctl --user status mybackground.service

# Логи
journalctl --user -u mybackground.service
```

## Панелі та меню

### Налаштування панелі GNOME

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOME TOP BAR                                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Activities │ App Menu │           │ System Tray │ 10:30 │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Activities (ліворуч):                                        │
│   • Клік або Super key → Overview                              │
│   • Type to search                                             │
│   • Drag windows to workspaces                                 │
│                                                                 │
│   System Tray (праворуч):                                      │
│   • Мережа, звук, батарея                                     │
│   • Quick Settings (клік)                                      │
│   • Notifications                                              │
│                                                                 │
│   Dash (в Overview):                                           │
│   • Улюблені програми                                         │
│   • Running apps (з точками)                                   │
│   • Trash, Files, Show Applications                            │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Налаштувати через gsettings
gsettings set org.gnome.desktop.interface clock-show-seconds true
gsettings set org.gnome.desktop.calendar show-weekdate true

# Dash to Dock extension налаштування
# Extension Manager → Dash to Dock → Settings
```

### Налаштування панелі KDE

```
┌─────────────────────────────────────────────────────────────────┐
│                    KDE PLASMA PANEL                             │
│                                                                 │
│   Редагування панелі:                                          │
│   1. Правий клік на панелі                                     │
│   2. "Enter Edit Mode" або "Panel Options"                     │
│                                                                 │
│   Можливості:                                                  │
│   • Додати/видалити widgets                                    │
│   • Змінити позицію панелі (top/bottom/left/right)            │
│   • Налаштувати висоту панелі                                 │
│   • Auto-hide                                                  │
│   • Максимальна/центрована ширина                             │
│   • Floating panel                                             │
│                                                                 │
│   Стандартні widgets на панелі:                               │
│   [App Launcher] [Task Manager] [System Tray] [Clock]          │
│   [Pager] [Media Player] [Weather] [etc.]                      │
└─────────────────────────────────────────────────────────────────┘
```

## Гарячі клавіші та жести

### GNOME Keyboard Shortcuts

```bash
# Settings → Keyboard → Keyboard Shortcuts
# або
gnome-control-center keyboard

# Через gsettings
gsettings list-recursively | grep keybindings

# Приклад: змінити відкриття терміналу
gsettings set org.gnome.settings-daemon.plugins.media-keys terminal "['<Super>Return']"

# Custom shortcuts
# Settings → Keyboard → Custom Shortcuts → Add
```

| Комбінація | Дія |
|------------|-----|
| `Super` | Activities Overview |
| `Super+A` | Show All Applications |
| `Alt+Tab` | Switch Windows |
| `Super+Tab` | Switch Applications |
| `Alt+F4` | Close Window |
| `Super+Left/Right` | Tile Window Left/Right |
| `Super+Up` | Maximize |
| `Super+Down` | Restore/Minimize |
| `Super+H` | Hide Window |
| `Ctrl+Alt+T` | Terminal (якщо налаштовано) |
| `PrintScreen` | Screenshot |

### KDE Shortcuts

```bash
# System Settings → Shortcuts

# Основні категорії:
# • KWin (window management)
# • Plasma (workspace)
# • Common Actions
# • Custom Shortcuts
```

## Практичне завдання

```bash
# 1. Визначити поточну тему GTK
gsettings get org.gnome.desktop.interface gtk-theme

# 2. Встановити та застосувати Papirus іконки
sudo apt install papirus-icon-theme
gsettings set org.gnome.desktop.interface icon-theme 'Papirus'

# 3. Перевірити автозапуск
ls -la ~/.config/autostart/

# 4. Список GNOME extensions
gnome-extensions list 2>/dev/null || echo "Not GNOME"

# 5. Змінити шпалери через CLI
# Спочатку завантажте картинку в ~/Pictures/
gsettings set org.gnome.desktop.background picture-uri "file://$HOME/Pictures/wallpaper.jpg"

# 6. Увімкнути dark mode (GNOME)
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

# 7. Роздільність екрану
xrandr --query | grep " connected"

# 8. Відкрити файловий менеджер
nautilus . 2>/dev/null || dolphin . 2>/dev/null || thunar .
```

## 💼 Real World: Desktop Linux у компаніях

```
┌─────────────────────────────────────────────────────────────────┐
│                 LINUX DESKTOP В ENTERPRISE                       │
│                                                                 │
│   🎬 PIXAR / DreamWorks / Industrial Light & Magic             │
│   • 3D-анімація на Linux workstations                          │
│   • KDE Plasma для художників                                  │
│   • Кастомізовані панелі для render farms                      │
│                                                                 │
│   🚗 TESLA / BMW / Mercedes                                    │
│   • Linux для розробки автопілоту                              │
│   • Embedded GUI на Qt/KDE frameworks                          │
│   • Інженерні workstations                                     │
│                                                                 │
│   🎮 VALVE / Steam Deck                                        │
│   • SteamOS базується на Arch Linux                            │
│   • KDE Plasma як desktop environment                          │
│   • Кастомізація через gsettings/kwriteconfig5                 │
│                                                                 │
│   💻 RED HAT / Canonical / SUSE                                │
│   • Enterprise Linux distributions                              │
│   • Розробники працюють на GNOME/KDE                           │
│   • Автоматизація через gsettings в deployment                 │
│                                                                 │
│   🏛️ УРЯДИ (Німеччина, Франція, Мюнхен)                       │
│   • LiMux project: 15000+ комп'ютерів                         │
│   • Стандартизовані desktop configurations                     │
│   • Автозапуск корпоративних програм                          │
└─────────────────────────────────────────────────────────────────┘
```

### Реальні сценарії налаштування

| Компанія/Сфера | Налаштування | Чому |
|----------------|--------------|------|
| **Фінанси (Bloomberg)** | GNOME + множинні монітори | Торгові термінали |
| **Наука (CERN)** | Scientific Linux + extensions | Аналіз даних |
| **DevOps (GitLab)** | Tiling WM + автозапуск | Ефективність |
| **Освіта (школи)** | Locked-down GNOME | Безпека |
| **Медіа (Netflix)** | Ubuntu workstations | Content creation |

## 🎯 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   Linux Desktop Administrator                                   │
│   ├── Зарплата: $50,000 - $90,000/рік                         │
│   ├── Навички: GNOME/KDE, gsettings, dconf, MDM               │
│   └── Компанії: Enterprise IT, освіта, уряд                   │
│                                                                 │
│   Enterprise Desktop Engineer                                   │
│   ├── Зарплата: $70,000 - $120,000/рік                        │
│   ├── Навички: Configuration management, imaging               │
│   └── Компанії: Red Hat, Canonical, consultancies             │
│                                                                 │
│   Linux Support Specialist                                      │
│   ├── Зарплата: $40,000 - $70,000/рік                         │
│   ├── Навички: Troubleshooting, user training                 │
│   └── Компанії: IT support, MSP                               │
│                                                                 │
│   Open Source Developer (Desktop)                               │
│   ├── Зарплата: $80,000 - $150,000/рік                        │
│   ├── Навички: C/C++, GTK, Qt, JavaScript (GNOME)             │
│   └── Компанії: Red Hat, Canonical, KDE e.V.                  │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Resources

### Онлайн практика
- [GNOME Developer Documentation](https://developer.gnome.org/) — офіційна документація
- [KDE UserBase](https://userbase.kde.org/) — туторіали для KDE
- [ArchWiki - GNOME](https://wiki.archlinux.org/title/GNOME) — детальні налаштування
- [Linux Journey](https://linuxjourney.com/) — інтерактивний курс

### Книги
- **"The Linux Command Line"** by William Shotts — основи CLI
- **"How Linux Works"** by Brian Ward — як працює система
- **"Linux Administration Handbook"** — enterprise налаштування

### YouTube
- **Chris Titus Tech** — Linux desktop customization
- **The Linux Experiment** — огляди DE та дистрибутивів
- **DistroTube** — тюнінг Linux desktop
- **Learn Linux TV** — системне адміністрування

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOME/KDE QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GNOME Settings:                                               │
│   gsettings get/set org.gnome.desktop.interface <key>          │
│   gsettings list-keys org.gnome.desktop.interface              │
│   gnome-control-center [section]                               │
│   gnome-tweaks                                                 │
│                                                                 │
│   Теми та іконки:                                              │
│   ~/.themes/           ~/.local/share/icons/                   │
│   gsettings set org.gnome.desktop.interface gtk-theme "Name"  │
│   gsettings set org.gnome.desktop.interface icon-theme "Name" │
│                                                                 │
│   Extensions:                                                   │
│   gnome-extensions list --enabled                              │
│   gnome-extensions enable/disable <name>                       │
│   ~/.local/share/gnome-shell/extensions/                       │
│                                                                 │
│   Автозапуск:                                                  │
│   ~/.config/autostart/*.desktop                                │
│   ~/.config/systemd/user/*.service                             │
│   systemctl --user enable/start <service>                      │
│                                                                 │
│   Корисні ключі gsettings:                                     │
│   org.gnome.desktop.interface  color-scheme, gtk-theme         │
│   org.gnome.desktop.background picture-uri                     │
│   org.gnome.desktop.wm.preferences button-layout               │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка різниця між GNOME Settings та GNOME Tweaks?**
   - Settings — базові налаштування (мережа, звук, дисплей)
   - Tweaks — розширені (теми, шрифти, titlebar buttons)

2. **Де зберігаються користувацькі GNOME extensions?**
   - `~/.local/share/gnome-shell/extensions/`

3. **Як створити autostart entry для програми?**
   - Створити `.desktop` файл у `~/.config/autostart/`

4. **Яка команда для зміни GTK теми через термінал?**
   - `gsettings set org.gnome.desktop.interface gtk-theme "ThemeName"`

5. **Що таке Plasma Widgets і як їх додати?**
   - Інтерактивні елементи робочого столу KDE
   - Правий клік → Add Widgets

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть власну тему робочого столу та backup-скрипт

Налаштуйте робочий стіл під себе та створіть скрипт для збереження/відновлення налаштувань. Це дозволить швидко налаштувати новий комп'ютер!

**Кроки:**

1. Спочатку зробіть backup поточних налаштувань:
```bash
mkdir -p ~/dotfiles/gnome
dconf dump / > ~/dotfiles/gnome/dconf-backup-original.txt
```

2. Створіть скрипт налаштування:
```bash
nano ~/dotfiles/gnome/my-desktop-setup.sh
```

3. Напишіть скрипт:
```bash
#!/bin/bash
# My Personal Desktop Setup
# Автор: [Ваше ім'я]

echo "🎨 Applying my desktop configuration..."

# Тема та іконки
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings set org.gnome.desktop.interface gtk-theme 'Adwaita-dark'
gsettings set org.gnome.desktop.interface icon-theme 'Papirus-Dark'

# Шрифти
gsettings set org.gnome.desktop.interface font-name 'Ubuntu 11'
gsettings set org.gnome.desktop.interface monospace-font-name 'JetBrains Mono 10'

# Вікна
gsettings set org.gnome.desktop.wm.preferences button-layout 'close,minimize,maximize:'
gsettings set org.gnome.mutter center-new-windows true

# Годинник
gsettings set org.gnome.desktop.interface clock-show-seconds true
gsettings set org.gnome.desktop.interface clock-show-weekday true

# Workspaces
gsettings set org.gnome.mutter dynamic-workspaces false
gsettings set org.gnome.desktop.wm.preferences num-workspaces 4

# Мої улюблені shortcuts
gsettings set org.gnome.settings-daemon.plugins.media-keys terminal "['<Super>Return']"

# Автозапуск улюблених програм
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/startup-apps.desktop << 'AUTOSTART'
[Desktop Entry]
Type=Application
Name=My Startup Apps
Exec=bash -c 'sleep 3 && notify-send "Welcome!" "Your desktop is ready"'
Hidden=false
X-GNOME-Autostart-enabled=true
AUTOSTART

echo "✅ Desktop configured!"
echo ""
echo "Applied settings:"
echo "  Theme:      $(gsettings get org.gnome.desktop.interface gtk-theme)"
echo "  Icons:      $(gsettings get org.gnome.desktop.interface icon-theme)"
echo "  Font:       $(gsettings get org.gnome.desktop.interface font-name)"
echo "  Workspaces: $(gsettings get org.gnome.desktop.wm.preferences num-workspaces)"
```

4. Створіть скрипт для backup:
```bash
nano ~/dotfiles/gnome/backup-desktop.sh
```

```bash
#!/bin/bash
# Backup Desktop Settings

BACKUP_DIR=~/dotfiles/gnome
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Backing up GNOME settings..."

# Повний backup dconf
dconf dump / > "$BACKUP_DIR/dconf-full-$DATE.txt"

# Збереження окремих схем
dconf dump /org/gnome/desktop/ > "$BACKUP_DIR/gnome-desktop-$DATE.txt"
dconf dump /org/gnome/shell/ > "$BACKUP_DIR/gnome-shell-$DATE.txt"

# Збереження extensions
gnome-extensions list --enabled > "$BACKUP_DIR/extensions-$DATE.txt" 2>/dev/null

echo "✅ Backup saved to $BACKUP_DIR"
ls -la "$BACKUP_DIR"/*$DATE*
```

5. Застосуйте та протестуйте:
```bash
chmod +x ~/dotfiles/gnome/*.sh
~/dotfiles/gnome/my-desktop-setup.sh
~/dotfiles/gnome/backup-desktop.sh
```

**Очікуваний результат:**
- Каталог `~/dotfiles/gnome/` з вашими скриптами
- Налаштований робочий стіл під ваші вподобання
- Backup налаштувань для швидкого відновлення

**Бонус (для допитливих):**
- Додайте скрипт відновлення: `dconf load / < backup.txt`
- Завантажте dotfiles на GitHub для синхронізації між комп'ютерами
- Встановіть 3 корисні GNOME extensions та додайте їх у скрипт
- Створіть різні "профілі": work-setup.sh, home-setup.sh, minimal-setup.sh

## Підсумок

| Дія | GNOME | KDE |
|-----|-------|-----|
| Основні налаштування | Settings | System Settings |
| Розширені налаштування | GNOME Tweaks | System Settings (все в одному) |
| Розширення/Widgets | Extensions + Extension Manager | Plasma Widgets |
| Теми | Tweaks → Appearance | Appearance |
| Панель | Фіксована top bar | Повна кастомізація |
| Автозапуск | Tweaks → Startup | Autostart |
| CLI налаштування | gsettings | kwriteconfig5 |

| Файл/Каталог | Призначення |
|--------------|-------------|
| `~/.config/autostart/` | Autostart .desktop файли |
| `~/.themes/` | Користувацькі GTK теми |
| `~/.local/share/icons/` | Користувацькі іконки |
| `~/.local/share/gnome-shell/extensions/` | GNOME extensions |
| `~/.config/systemd/user/` | Systemd user services |

На наступній лекції розглянемо файлову систему Linux детальніше.
