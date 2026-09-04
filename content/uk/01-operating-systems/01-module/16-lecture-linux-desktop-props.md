---
title: "Основні властивості робочих столів Linux"
type: lecture
order: 16
preview: "Віртуальні робочі столи, гарячі клавіші, налаштування."
---

## Віртуальні робочі столи (Workspaces)

Віртуальні робочі столи дозволяють організувати вікна по групах: робота, браузер, музика.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВІРТУАЛЬНІ РОБОЧІ СТОЛИ                      │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │ Workspace 1 │  │ Workspace 2 │  │ Workspace 3 │            │
│   │             │  │             │  │             │            │
│   │  Terminal   │  │  Firefox    │  │  Spotify    │            │
│   │  VS Code    │  │  Slack      │  │  Files      │            │
│   │             │  │             │  │             │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│        ▲                                                        │
│        └── Поточний                                            │
│                                                                 │
│   GNOME: динамічні (створюються автоматично)                   │
│   KDE: фіксовані (задаєте кількість)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Гарячі клавіші для робочих столів

| Дія | GNOME | KDE |
|-----|-------|-----|
| Перегляд всіх | `Super` | `Super+Tab` |
| Наступний | `Super+PageDown` | `Ctrl+Right` |
| Попередній | `Super+PageUp` | `Ctrl+Left` |
| До N-го | `Super+N` | `Ctrl+F1...F4` |
| Перемістити вікно | `Super+Shift+PageUp/Down` | `Ctrl+Shift+Right/Left` |

```bash
# GNOME: налаштувати кількість
gsettings set org.gnome.mutter dynamic-workspaces false
gsettings set org.gnome.desktop.wm.preferences num-workspaces 4

# KDE: System Settings → Workspace Behavior → Virtual Desktops
```

## Гарячі клавіші

### Загальні (GNOME)

| Комбінація | Дія |
|------------|-----|
| `Super` | Activities overview |
| `Super+A` | Показати всі програми |
| `Alt+Tab` | Перемикання вікон |
| `Super+Tab` | Перемикання програм |
| `Alt+F4` | Закрити вікно |
| `Super+Arrow` | Snap вікна |
| `Super+H` | Згорнути вікно |
| `Super+M` | Notification tray |
| `Super+L` | Lock screen |
| `Ctrl+Alt+T` | Terminal |
| `PrintScreen` | Screenshot |

### Налаштування

```bash
# GNOME: переглянути всі
gsettings list-recursively | grep keybindings

# Змінити
gsettings set org.gnome.desktop.wm.keybindings switch-windows "['<Alt>Tab']"

# GUI: Settings → Keyboard → Keyboard Shortcuts
# KDE: System Settings → Shortcuts
```

## Hot Corners / Screen Edges

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOT CORNERS (GNOME)                          │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │🔲 Activities          (top-left за замовч.)      🔲│    │
│   │                                                       │    │
│   │                                                       │    │
│   │                                                       │    │
│   │                                                       │    │
│   │🔲                                                  🔲│    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   GNOME: Settings → Multitasking → Hot Corner                  │
│   KDE: System Settings → Workspace Behavior → Screen Edges     │
│         (набагато більше опцій)                                │
└─────────────────────────────────────────────────────────────────┘
```

## Night Light / Redshift

Зменшення синього світла ввечері.

```bash
# GNOME: вбудовано
# Settings → Displays → Night Light

# Через командний рядок
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true
gsettings set org.gnome.settings-daemon.plugins.color night-light-temperature 4000

# Redshift (альтернатива)
sudo apt install redshift
redshift -O 4000K  # Теплий колір
redshift -x        # Скинути
```

## Scaling та HiDPI

```bash
# GNOME: Settings → Displays → Scale

# Командний рядок
gsettings set org.gnome.desktop.interface scaling-factor 2

# Fractional scaling (125%, 150%)
gsettings set org.gnome.mutter experimental-features "['scale-monitor-framebuffer']"

# KDE: System Settings → Display and Monitor → Display Configuration

# Xorg: ~/.Xresources
# Xft.dpi: 192
```

## Accessibility

```
┌─────────────────────────────────────────────────────────────────┐
│                    ДОСТУПНІСТЬ                                  │
│                                                                 │
│   Screen Reader:    Orca (espeak)                              │
│   Magnifier:        GNOME Magnifier, KMag                      │
│   High Contrast:    Settings → Accessibility                   │
│   Large Text:       Settings → Accessibility                   │
│   On-Screen Keyboard: GNOME OSK, Onboard                       │
│   Sticky Keys:      Settings → Accessibility → Typing          │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Screen reader
orca  # Запустити Orca

# GNOME Accessibility
# Settings → Accessibility

# KDE
# System Settings → Accessibility
```

## Практичне завдання

```bash
# 1. Кількість робочих столів
gsettings get org.gnome.desktop.wm.preferences num-workspaces

# 2. Поточні гарячі клавіші
gsettings get org.gnome.desktop.wm.keybindings switch-windows

# 3. Увімкнути Night Light
gsettings set org.gnome.settings-daemon.plugins.color night-light-enabled true

# 4. Hot corner статус
gsettings get org.gnome.desktop.interface enable-hot-corners

# 5. Масштаб
gsettings get org.gnome.desktop.interface scaling-factor
```

## Підсумок

| Функція | Як налаштувати |
|---------|----------------|
| Workspaces | Settings → Multitasking |
| Shortcuts | Settings → Keyboard |
| Hot Corners | Settings → Multitasking |
| Night Light | Settings → Displays |
| Scaling | Settings → Displays |
| Accessibility | Settings → Accessibility |

На наступній лекції — диспетчер вікон.
