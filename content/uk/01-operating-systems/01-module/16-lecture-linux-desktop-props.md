---
title: "Основні властивості робочих столів Linux"
type: lecture
order: 16
preview: "Віртуальні робочі столи, гарячі клавіші, налаштування."
---

## Віртуальні робочі столи (Workspaces)

Віртуальні робочі столи (workspaces) — одна з найпотужніших функцій Linux desktop. Вони дозволяють організувати вікна по групах: робота, браузер, комунікація, розваги.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВІРТУАЛЬНІ РОБОЧІ СТОЛИ                      │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │ Workspace 1 │  │ Workspace 2 │  │ Workspace 3 │            │
│   │   "Робота"  │  │  "Браузер"  │  │   "Музика"  │            │
│   │             │  │             │  │             │            │
│   │  VS Code    │  │  Firefox    │  │  Spotify    │            │
│   │  Terminal   │  │  Slack      │  │  Files      │            │
│   │  DBeaver    │  │  Telegram   │  │             │            │
│   │             │  │             │  │             │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│        ▲                                                        │
│        └── Поточний робочий стіл                               │
│                                                                 │
│   Переваги:                                                    │
│   ✅ Організація роботи за контекстом                          │
│   ✅ Менше відволікання                                        │
│   ✅ Швидке перемикання (клавіатура)                           │
│   ✅ Більше простору (не потрібен великий монітор)            │
└─────────────────────────────────────────────────────────────────┘
```

### Реалізація в різних DE

| DE | Тип | Особливості |
|----|-----|-------------|
| **GNOME** | Динамічні | Автоматично створюються/видаляються |
| **KDE Plasma** | Фіксовані | Задаєте кількість вручну |
| **XFCE** | Фіксовані | Класична реалізація |
| **i3/Sway** | Динамічні | 10 workspace за замовчуванням |

### Гарячі клавіші для workspaces

**GNOME:**

| Комбінація | Дія |
|------------|-----|
| `Super` | Activities overview (показує всі workspaces) |
| `Super + PageDown` | Наступний workspace |
| `Super + PageUp` | Попередній workspace |
| `Super + Shift + PageDown` | Перемістити вікно на наступний |
| `Super + Shift + PageUp` | Перемістити вікно на попередній |

**KDE Plasma:**

| Комбінація | Дія |
|------------|-----|
| `Ctrl + F1...F4` | Перейти до workspace 1-4 |
| `Meta + Tab` | Показати всі workspaces |
| `Ctrl + Shift + F1...F4` | Перемістити вікно |
| `Ctrl + Right/Left` | Наступний/попередній workspace |

```bash
# GNOME: налаштування workspaces
gsettings get org.gnome.mutter dynamic-workspaces
# true = динамічні, false = фіксовані

# Вимкнути динамічні workspaces
gsettings set org.gnome.mutter dynamic-workspaces false

# Встановити кількість (якщо фіксовані)
gsettings set org.gnome.desktop.wm.preferences num-workspaces 4

# Workspaces тільки на основному моніторі
gsettings set org.gnome.mutter workspaces-only-on-primary true

# KDE: System Settings → Workspace Behavior → Virtual Desktops
# Або: kcmshell5 kcm_kwin_virtualdesktops
```

## Гарячі клавіші (Keyboard Shortcuts)

Ефективна робота з Linux desktop неможлива без знання гарячих клавіш. Вони значно прискорюють роботу.

### Загальні гарячі клавіші GNOME

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOME KEYBOARD SHORTCUTS                     │
│                                                                 │
│   Навігація:                                                   │
│   Super           Activities overview                          │
│   Super + A       Показати всі програми                        │
│   Alt + Tab       Перемикання вікон                            │
│   Super + Tab     Перемикання програм (групує вікна)           │
│   Alt + ` (тільда) Перемикання вікон однієї програми            │
│   Alt + F2        Командний рядок                              │
│                                                                 │
│   Вікна:                                                       │
│   Super + ↑       Максимізувати                                │
│   Super + ↓       Відновити/мінімізувати                       │
│   Super + ←       Snap ліворуч (50%)                           │
│   Super + →       Snap праворуч (50%)                          │
│   Super + H       Приховати (minimize)                         │
│   Alt + F4        Закрити вікно                                │
│   Alt + F7        Перемістити вікно (клавіатурою)              │
│   Alt + F8        Змінити розмір (клавіатурою)                 │
│   Super + Shift + ←/→  Перемістити на інший монітор           │
│                                                                 │
│   Система:                                                     │
│   Super + L       Заблокувати екран                            │
│   Super + M       Notification tray                            │
│   Ctrl + Alt + T  Термінал (якщо налаштовано)                  │
│   Print Screen    Скріншот (весь екран)                        │
│   Alt + Print     Скріншот (поточне вікно)                     │
│   Shift + Print   Скріншот (область)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Загальні гарячі клавіші KDE

```
┌─────────────────────────────────────────────────────────────────┐
│                    KDE PLASMA SHORTCUTS                         │
│                                                                 │
│   Навігація:                                                   │
│   Meta            Application Menu                              │
│   Meta + Tab      Показати всі вікна                           │
│   Alt + Tab       Перемикання вікон                            │
│   Meta + D        Показати робочий стіл                        │
│   Meta + T        Термінал                                     │
│                                                                 │
│   Вікна:                                                       │
│   Meta + Page Up  Максимізувати                                │
│   Meta + Page Down Мінімізувати                                │
│   Meta + ←/→      Tile ліворуч/праворуч                        │
│   Meta + ↑        Максимізувати вертикально                    │
│   Meta + ↓        Відновити                                    │
│   Alt + F3        Меню вікна                                   │
│   Alt + F4        Закрити вікно                                │
│                                                                 │
│   KWin Effects:                                                │
│   Meta + W        Overview (як macOS Exposé)                   │
│   Ctrl + F8       Desktop Grid (всі workspaces)                │
│   Meta + =/-      Zoom                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Налаштування гарячих клавіш

```bash
# GNOME: переглянути всі keybindings
gsettings list-recursively | grep keybinding
gsettings list-recursively | grep "org.gnome.desktop.wm.keybindings"

# Встановити кастомну комбінацію
gsettings set org.gnome.desktop.wm.keybindings switch-windows "['<Alt>Tab']"
gsettings set org.gnome.desktop.wm.keybindings close "['<Alt>F4', '<Super>q']"

# Термінал на Ctrl+Alt+T (GNOME)
gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/']"
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ name 'Terminal'
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ command 'gnome-terminal'
gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/custom0/ binding '<Ctrl><Alt>t'

# GUI: Settings → Keyboard → Keyboard Shortcuts
gnome-control-center keyboard

# KDE: System Settings → Shortcuts
kcmshell5 keys
```

## Hot Corners / Screen Edges

**Hot Corners** — дії при наведенні курсора на кут екрану. Дозволяють швидко виконувати часті операції.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOT CORNERS / SCREEN EDGES                   │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │🔲                                                      🔲│  │
│   │ Top-left           Top              Top-right           │  │
│   │ (Activities)                                             │  │
│   │                                                          │  │
│   │Left                                               Right  │  │
│   │                                                          │  │
│   │                                                          │  │
│   │🔲                                                      🔲│  │
│   │ Bottom-left       Bottom         Bottom-right           │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   GNOME: тільки top-left (Activities) за замовчуванням         │
│   KDE: повна кастомізація всіх кутів та сторін                 │
│                                                                 │
│   Можливі дії (KDE):                                           │
│   • Show Desktop                                               │
│   • Present All Windows                                        │
│   • Desktop Grid                                               │
│   • Application Launcher                                       │
│   • Lock Screen                                                │
│   • Custom script                                              │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# GNOME: увімкнути/вимкнути hot corners
gsettings get org.gnome.desktop.interface enable-hot-corners
gsettings set org.gnome.desktop.interface enable-hot-corners true

# GUI: Settings → Multitasking → Hot Corner

# KDE: System Settings → Workspace Behavior → Screen Edges
kcmshell5 kwinscreenedges
```

## Night Light / Blue Light Filter

**Night Light** — функція зменшення синього світла ввечері. Допомагає зберегти здоров'я очей та покращити сон.

```
┌─────────────────────────────────────────────────────────────────┐
│                    NIGHT LIGHT                                  │
│                                                                 │
│   Колірна температура:                                         │
│                                                                 │
│   6500K ──────────────────────────────── Cold (денне світло)   │
│         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                        │
│   5000K ────────────────────────── Neutral                     │
│         ░░░░░░░░░░░░░░░░░░░░░                                  │
│   4000K ────────────────── Warm (вечірнє)                      │
│         ░░░░░░░░░░░░░░░                                        │
│   3000K ────────── Very warm (перед сном)                      │
│         ░░░░░░░                                                │
│                                                                 │
│   Чому це важливо:                                             │
│   • Синє світло пригнічує мелатонін (гормон сну)               │
│   • Вечірній екран може порушити сон                           │
│   • Тепле світло менш напружує очі                             │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# GNOME: вбудована функція
# Settings → Displays → Night Light

# Увімкнути через CLI
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true

# Температура (в Kelvin, нижче = тепліше)
gsettings set org.gnome.settings-daemon.plugins.color night-light-temperature 4000

# Автоматичний розклад (Sunset to Sunrise)
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-automatic true

# Ручний розклад
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-automatic false
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-from 20.0  # 20:00
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-to 6.0     # 06:00

# Альтернатива: Redshift (для X11)
sudo apt install redshift redshift-gtk
redshift -O 4000K    # Встановити температуру
redshift -x          # Скинути
redshift-gtk         # GUI з tray icon

# KDE: System Settings → Display and Monitor → Night Color
# або вбудований Night Color з Plasma 5.17+
```

## Scaling та HiDPI

Сучасні монітори мають високу щільність пікселів (HiDPI, Retina). Без правильного масштабування інтерфейс буде занадто дрібним.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HiDPI SCALING                                │
│                                                                 │
│   Масштаб     Приклад монітора              Результат          │
│   ──────     ──────────────────              ─────────          │
│   100%       1920×1080 на 24"               Нормальний         │
│   100%       3840×2160 на 24"               Занадто дрібно     │
│   200%       3840×2160 на 24"               Чітко, як 1080p    │
│   150%       2560×1440 на 27"               Компроміс          │
│                                                                 │
│   GNOME:                                                       │
│   • Integer scaling: 100%, 200%, 300%                          │
│   • Fractional scaling: 125%, 150%, 175% (experimental)       │
│                                                                 │
│   KDE:                                                         │
│   • Повна підтримка fractional scaling                         │
│   • Per-monitor scaling                                        │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# GNOME: основний масштаб
# Settings → Displays → Scale

# Через CLI (integer scaling)
gsettings set org.gnome.desktop.interface scaling-factor 2

# Увімкнути fractional scaling (GNOME Wayland)
gsettings set org.gnome.mutter experimental-features "['scale-monitor-framebuffer']"
# Після цього в Settings → Displays з'являться 125%, 150% тощо

# Перевірити поточний масштаб
gsettings get org.gnome.desktop.interface scaling-factor

# KDE: System Settings → Display and Monitor → Display Configuration
# Обрати монітор → Scale → будь-яке значення

# Для окремих програм (X11)
GDK_SCALE=2 firefox                    # GTK apps
QT_SCALE_FACTOR=2 dolphin              # Qt apps

# Xorg ~/.Xresources
echo "Xft.dpi: 192" >> ~/.Xresources   # 192 = 2× масштаб
xrdb -merge ~/.Xresources
```

## Accessibility (Доступність)

Linux має багато функцій доступності для людей з обмеженими можливостями.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY FEATURES                       │
│                                                                 │
│   Візуальні:                                                   │
│   ├── High Contrast themes                                     │
│   ├── Large Text                                               │
│   ├── Screen Reader (Orca)                                     │
│   ├── Screen Magnifier                                         │
│   └── Cursor size & color                                      │
│                                                                 │
│   Клавіатура:                                                  │
│   ├── Sticky Keys (натискати по одній)                         │
│   ├── Slow Keys (ігнорувати короткі натискання)               │
│   ├── Bounce Keys (ігнорувати повторні)                        │
│   └── On-Screen Keyboard                                       │
│                                                                 │
│   Миша:                                                        │
│   ├── Mouse Keys (керування мишею з клавіатури)               │
│   ├── Click Assist (автоматичний клік)                        │
│   └── Hover Click                                              │
│                                                                 │
│   Звук:                                                        │
│   ├── Visual Alerts (flash screen)                             │
│   └── Audio descriptions                                       │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# GNOME: Settings → Accessibility
gnome-control-center universal-access

# Screen Reader (Orca)
orca                              # Запустити
# Super + Alt + S — увімкнути/вимкнути Orca

# High Contrast
gsettings set org.gnome.desktop.interface gtk-theme 'HighContrast'

# Large Text
gsettings set org.gnome.desktop.interface text-scaling-factor 1.5

# Sticky Keys
gsettings set org.gnome.desktop.a11y.keyboard stickykeys-enable true

# On-Screen Keyboard
gsettings set org.gnome.desktop.a11y.applications screen-keyboard-enabled true

# Cursor size (24, 32, 48, 64, 96)
gsettings set org.gnome.desktop.interface cursor-size 48

# KDE: System Settings → Accessibility
# Більше налаштувань: System Settings → Input Devices → Keyboard/Mouse
```

## Notifications (Сповіщення)

Система сповіщень дозволяє програмам інформувати користувача про події.

```bash
# GNOME: Settings → Notifications
gnome-control-center notifications

# Тестове сповіщення
notify-send "Заголовок" "Текст повідомлення"
notify-send -u critical "Помилка!" "Щось пішло не так"
notify-send -i firefox "Firefox" "Завантаження завершено"

# Режим Do Not Disturb
# GNOME: клік на годинник → Do Not Disturb
# Або через CLI:
gsettings set org.gnome.desktop.notifications show-banners false

# KDE: System Settings → Notifications
# Кожна програма окремо налаштовується
```

## Практичне завдання

```bash
# 1. Перевірити кількість workspaces
gsettings get org.gnome.desktop.wm.preferences num-workspaces

# 2. Перевірити чи динамічні workspaces
gsettings get org.gnome.mutter dynamic-workspaces

# 3. Поточні гарячі клавіші для вікон
gsettings get org.gnome.desktop.wm.keybindings switch-windows

# 4. Статус Night Light
gsettings get org.gnome.settings-daemon.plugins.color night-light-enabled

# 5. Статус hot corners
gsettings get org.gnome.desktop.interface enable-hot-corners

# 6. Поточний масштаб
gsettings get org.gnome.desktop.interface scaling-factor

# 7. Увімкнути Night Light
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true

# 8. Надіслати тестове сповіщення
notify-send "Тест" "Ваша система працює!"

# 9. Розмір курсора
gsettings get org.gnome.desktop.interface cursor-size

# 10. Список всіх accessibility налаштувань
gsettings list-keys org.gnome.desktop.a11y.keyboard
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────┐
│           DESKTOP CONFIGURATION В ENTERPRISE                    │
│                                                                 │
│   IT-компанії (Google, Microsoft, Meta):                        │
│   ├── Стандартизовані робочі станції Linux                     │
│   ├── Централізоване управління shortcuts через dconf/GPO      │
│   ├── Обов'язковий Night Light для здоров'я працівників        │
│   └── HiDPI scaling для 4K моніторів розробників               │
│                                                                 │
│   Enterprise Desktop Management:                                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • dconf + Ansible для масового розгортання налаштувань │   │
│   │ • GNOME Initial Setup для onboarding нових працівників │   │
│   │ • Kiosk mode для публічних терміналів                   │   │
│   │ • Accessibility compliance (ADA, Section 508)           │   │
│   │ • Corporate branding через theming                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Фінансові установи:                                           │
│   • Multi-monitor trading desks з workspaces per market        │
│   • Hot corners заборонені (випадкові кліки = втрати)          │
│   • Великий cursor size для швидкої навігації                  │
│                                                                 │
│   Call-центри та служби підтримки:                              │
│   • Accessibility features для інклюзивності                   │
│   • On-screen keyboard для планшетних терміналів               │
│   • Screen reader інтеграція (Orca) для незрячих операторів    │
│                                                                 │
│   Remote Development (GitLab, Automattic):                      │
│   • Налаштування workspaces для context switching              │
│   • Keyboard-centric workflow (мінімум миші)                   │
│   • Night Light + f.lux для роботи в різних часових зонах      │
└─────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   Desktop Support Specialist                                    │
│   ├── Зарплата: $45,000 - $70,000 (EUR 40,000 - 60,000)        │
│   ├── Навички: GNOME/KDE config, accessibility, troubleshooting│
│   └── Задачі: підтримка Linux workstations, user training      │
│                                                                 │
│   Linux Desktop Administrator                                   │
│   ├── Зарплата: $55,000 - $85,000 (EUR 50,000 - 75,000)        │
│   ├── Навички: dconf, gsettings, policy management             │
│   └── Задачі: масове розгортання, стандартизація desktops      │
│                                                                 │
│   UX Engineer (Linux)                                           │
│   ├── Зарплата: $70,000 - $120,000 (EUR 65,000 - 105,000)      │
│   ├── Навички: GTK/Qt, accessibility, HiDPI, theming           │
│   └── Задачі: покращення user experience в Linux apps          │
│                                                                 │
│   Systems Integration Engineer                                  │
│   ├── Зарплата: $75,000 - $130,000 (EUR 68,000 - 115,000)      │
│   ├── Навички: multi-monitor, kiosk mode, enterprise config    │
│   └── Задачі: інтеграція Linux desktops в корпоративне середовище│
│                                                                 │
│   Accessibility Specialist                                      │
│   ├── Зарплата: $60,000 - $100,000 (EUR 55,000 - 90,000)       │
│   ├── Навички: Orca, screen readers, accessibility standards   │
│   └── Задачі: забезпечення доступності для людей з інвалідністю│
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **GNOME Help** | Офіційна документація GNOME | help.gnome.org |
| **KDE UserBase** | Wiki для користувачів KDE | userbase.kde.org |
| **Arch Wiki - GNOME** | Детальні налаштування | wiki.archlinux.org/title/GNOME |
| **Linux Accessibility HOWTO** | Доступність в Linux | tldp.org/HOWTO/Accessibility-HOWTO |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│              LINUX DESKTOP PROPERTIES CHEAT SHEET               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GNOME WORKSPACES:                                            │
│   Super              Activities overview                       │
│   Super+PageDown/Up  Наступний/попередній workspace            │
│   Super+Shift+PageDown  Перемістити вікно на workspace         │
│                                                                 │
│   GNOME WINDOWS:                                                │
│   Super+←/→         Snap ліворуч/праворуч                      │
│   Super+↑           Максимізувати                              │
│   Alt+Tab           Перемикання вікон                          │
│   Super+L           Заблокувати екран                          │
│   Alt+F4            Закрити вікно                              │
│                                                                 │
│   GSETTINGS КОМАНДИ:                                           │
│   gsettings list-schemas             Всі схеми                 │
│   gsettings list-keys SCHEMA         Ключі схеми               │
│   gsettings get SCHEMA KEY           Отримати значення         │
│   gsettings set SCHEMA KEY VALUE     Встановити значення       │
│                                                                 │
│   ПОПУЛЯРНІ НАЛАШТУВАННЯ:                                      │
│   org.gnome.desktop.interface        Інтерфейс (теми, шрифти)  │
│   org.gnome.desktop.wm.keybindings   Гарячі клавіші            │
│   org.gnome.mutter                   Workspaces                │
│   org.gnome.settings-daemon.plugins.color  Night Light         │
│                                                                 │
│   ACCESSIBILITY:                                                │
│   Super+Alt+S       Toggle Orca (screen reader)                │
│   org.gnome.desktop.a11y.*  Accessibility налаштування         │
│                                                                 │
│   TOOLS:                                                        │
│   gnome-tweaks      GUI для розширених налаштувань             │
│   gnome-control-center  Системні налаштування                  │
│   dconf-editor      Редактор всіх dconf keys                   │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка перевага віртуальних робочих столів (workspaces)?** Як вони допомагають організувати роботу?

2. **Чим відрізняються динамічні workspaces в GNOME від фіксованих в KDE?** Які переваги кожного підходу?

3. **Що таке Night Light і чому він важливий для здоров'я?** Як працює автоматичний режим?

4. **Що таке HiDPI scaling і коли воно потрібне?** Чому 4K монітор без scaling буде незручним?

5. **Які accessibility функції є в Linux?** Як вони допомагають людям з обмеженими можливостями?

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть власну систему productivity shortcuts

Налаштуйте гарячі клавіші та workspaces для максимальної продуктивності. Це те, що відрізняє досвідченого користувача Linux!

**Кроки:**

1. Створіть скрипт налаштування productivity:
```bash
mkdir -p ~/scripts
nano ~/scripts/productivity-setup.sh
```

2. Напишіть код:
```bash
#!/bin/bash
# Productivity Setup Script
# Налаштування для ефективної роботи

echo "⚡ Setting up productivity features..."

# === WORKSPACES ===
echo "📱 Configuring workspaces..."
gsettings set org.gnome.mutter dynamic-workspaces false
gsettings set org.gnome.desktop.wm.preferences num-workspaces 4
gsettings set org.gnome.mutter workspaces-only-on-primary true

# === WINDOW MANAGEMENT ===
echo "🪟 Configuring windows..."
gsettings set org.gnome.mutter center-new-windows true
gsettings set org.gnome.desktop.wm.preferences focus-mode 'click'

# === CUSTOM SHORTCUTS ===
echo "⌨️ Setting up custom shortcuts..."

# Термінал на Super+Return
gsettings set org.gnome.settings-daemon.plugins.media-keys terminal "['<Super>Return']"

# Закрити вікно на Super+Q (додатково до Alt+F4)
gsettings set org.gnome.desktop.wm.keybindings close "['<Alt>F4', '<Super>q']"

# Максимізувати вікно на Super+M
gsettings set org.gnome.desktop.wm.keybindings toggle-maximized "['<Super>m']"

# Швидке переключення workspaces
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-1 "['<Super>1']"
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-2 "['<Super>2']"
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-3 "['<Super>3']"
gsettings set org.gnome.desktop.wm.keybindings switch-to-workspace-4 "['<Super>4']"

# Перемістити вікно на workspace
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-1 "['<Super><Shift>1']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-2 "['<Super><Shift>2']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-3 "['<Super><Shift>3']"
gsettings set org.gnome.desktop.wm.keybindings move-to-workspace-4 "['<Super><Shift>4']"

# === NIGHT LIGHT ===
echo "🌙 Configuring night light..."
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true
gsettings set org.gnome.settings-daemon.plugins.color night-light-temperature 4500
gsettings set org.gnome.settings-daemon.plugins.color night-light-schedule-automatic true

# === HOT CORNERS ===
echo "📐 Configuring hot corners..."
gsettings set org.gnome.desktop.interface enable-hot-corners true

# === ACCESSIBILITY (корисні для всіх) ===
echo "♿ Setting up useful accessibility features..."
gsettings set org.gnome.desktop.interface cursor-size 32

echo ""
echo "✅ Productivity setup complete!"
echo ""
echo "📋 YOUR NEW SHORTCUTS:"
echo "   Super+Return      - Open terminal"
echo "   Super+Q           - Close window"
echo "   Super+M           - Maximize/restore window"
echo "   Super+1/2/3/4     - Switch to workspace"
echo "   Super+Shift+1/2/3/4 - Move window to workspace"
echo ""
echo "🌙 Night Light: enabled (auto sunset-sunrise)"
echo "🪟 Workspaces: 4 fixed"
```

3. Створіть шпаргалку:
```bash
nano ~/Desktop/shortcuts.txt
```

```
MY PRODUCTIVITY SHORTCUTS
=========================

WINDOWS:
  Super+Return     Open terminal
  Super+Q          Close window
  Super+M          Maximize/restore
  Alt+Tab          Switch windows
  Super+Left/Right Tile left/right

WORKSPACES:
  Super+1/2/3/4    Go to workspace
  Super+Shift+1-4  Move window to workspace

SYSTEM:
  Super            Activities
  Super+L          Lock screen
  Print            Screenshot
```

4. Застосуйте:
```bash
chmod +x ~/scripts/productivity-setup.sh
~/scripts/productivity-setup.sh
```

**Очікуваний результат:**
- Скрипт `~/scripts/productivity-setup.sh`
- 4 фіксовані workspaces з швидким доступом
- Кастомні shortcuts для вікон та терміналу
- Шпаргалка на робочому столі

**Бонус (для допитливих):**
- Створіть окремі "профілі" workspaces: Workspace 1 = Code, Workspace 2 = Browser, etc.
- Налаштуйте правила для автоматичного розміщення вікон (потрібен devilspie2 або extension)
- Додайте custom shortcuts для улюблених програм
- Створіть скрипт для перемикання між "work mode" та "relax mode" (різні налаштування)

## Підсумок

| Функція | GNOME | KDE |
|---------|-------|-----|
| Workspaces | Динамічні (за замовч.) | Фіксовані |
| Hot Corners | Тільки Activities | Повна кастомізація |
| Night Light | Вбудовано | Night Color |
| Scaling | 100%, 200% + fractional | Будь-яке значення |
| Accessibility | Settings → Accessibility | System Settings → Accessibility |
| Shortcuts | Settings → Keyboard | System Settings → Shortcuts |

| Налаштування | Як змінити |
|--------------|------------|
| Workspaces | Settings → Multitasking |
| Shortcuts | Settings → Keyboard |
| Hot Corners | Settings → Multitasking |
| Night Light | Settings → Displays |
| Scaling | Settings → Displays |
| Accessibility | Settings → Accessibility |
| Notifications | Settings → Notifications |

| Корисні команди |
|-----------------|
| `gsettings list-recursively \| grep workspaces` |
| `gsettings list-recursively \| grep keybindings` |
| `notify-send "Title" "Message"` |
| `xrandr --query` |

На наступній лекції — диспетчер вікон.
