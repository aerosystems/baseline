---
title: "Використання диспетчера вікон"
type: lecture
order: 17
preview: "Window managers, tiling WM, композитори."
---

## Що таке Window Manager?

**Window Manager (WM)** — програма, яка керує вікнами: розмір, позиція, рамки, фокус. DE включає WM, але WM можна використовувати окремо.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ТИПИ WINDOW MANAGERS                         │
│                                                                 │
│   STACKING WM               TILING WM                          │
│   (традиційний)             (мозаїчний)                        │
│                                                                 │
│   ┌────────────┐            ┌───────┬───────┐                  │
│   │ ┌────────┐ │            │       │       │                  │
│   │ │ Window │ │            │ Win 1 │ Win 2 │                  │
│   │ │   2    │ │            │       │       │                  │
│   │ └────────┘ │            ├───────┴───────┤                  │
│   │┌────────┐  │            │    Win 3      │                  │
│   ││Window 1│  │            │               │                  │
│   │└────────┘  │            └───────────────┘                  │
│   └────────────┘                                               │
│   Вікна накладаються        Вікна не перекриваються           │
│                                                                 │
│   Mutter, KWin, Xfwm        i3, Sway, bspwm, dwm               │
└─────────────────────────────────────────────────────────────────┘
```

## Stacking Window Managers

Входять до DE:
- **Mutter** — GNOME
- **KWin** — KDE Plasma
- **Xfwm** — XFCE
- **Marco** — MATE

Standalone:
- **Openbox** — легкий, конфігурація XML
- **Fluxbox** — класичний
- **IceWM** — Windows-подібний

## Tiling Window Managers

```
┌─────────────────────────────────────────────────────────────────┐
│                    TILING WM LAYOUT                             │
│                                                                 │
│   Master-Stack:              Columns:                          │
│   ┌───────────┬───────┐      ┌─────┬─────┬─────┐              │
│   │           │ Win 2 │      │     │     │     │              │
│   │  Master   ├───────┤      │Win1 │Win2 │Win3 │              │
│   │  (Win 1)  │ Win 3 │      │     │     │     │              │
│   │           ├───────┤      └─────┴─────┴─────┘              │
│   │           │ Win 4 │                                        │
│   └───────────┴───────┘      Fibonacci:                       │
│                              ┌─────────┬─────┐                │
│   Monocle:                   │         │     │                │
│   ┌─────────────────┐        │  Win 1  │Win2 │                │
│   │                 │        │         ├──┬──┤                │
│   │    Win 1        │        │         │3 │4 │                │
│   │    (fullscreen) │        └─────────┴──┴──┘                │
│   └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Популярні Tiling WM

| WM | Display Server | Конфігурація |
|----|----------------|--------------|
| **i3** | X11 | ~/.config/i3/config |
| **Sway** | Wayland | ~/.config/sway/config (i3-подібний) |
| **bspwm** | X11 | ~/.config/bspwm/bspwmrc (shell) |
| **dwm** | X11 | config.h (C, recompile) |
| **Hyprland** | Wayland | ~/.config/hypr/hyprland.conf |
| **Awesome** | X11 | ~/.config/awesome/rc.lua |

### i3 базові команди

```bash
# ~/.config/i3/config

# Модифікатор (Super key)
set $mod Mod4

# Запуск термінала
bindsym $mod+Return exec alacritty

# Закрити вікно
bindsym $mod+Shift+q kill

# Фокус
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right

# Переміщення вікна
bindsym $mod+Shift+h move left
bindsym $mod+Shift+l move right

# Робочі столи
bindsym $mod+1 workspace 1
bindsym $mod+Shift+1 move container to workspace 1

# Layout
bindsym $mod+v split v   # Vertical
bindsym $mod+b split h   # Horizontal
bindsym $mod+f fullscreen
```

## Compositor

**Compositor** — додає візуальні ефекти: тіні, прозорість, анімації, VSync.

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPOSITOR                                   │
│                                                                 │
│   X11:                         Wayland:                        │
│   • Picom (standalone)         • Вбудований в WM/compositor    │
│   • Compton                    • Mutter, KWin, Sway            │
│                                                                 │
│   Picom приклад (~/.config/picom/picom.conf):                  │
│   ─────────────────────────────────────────                    │
│   shadow = true                                                │
│   shadow-radius = 7                                            │
│   fading = true                                                │
│   fade-delta = 5                                               │
│   inactive-opacity = 0.9                                       │
│   corner-radius = 8                                            │
│   blur-background = true                                       │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Встановити picom
sudo apt install picom

# Запустити
picom --config ~/.config/picom/picom.conf &

# Без config файлу
picom --shadow --fading --inactive-opacity=0.9
```

## Status Bar

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS BARS                                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ⚙  │ 1 │ 2 │ 3 │              │ CPU 5% │ 🔊 │ 🔋 85% │ 14:30│
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Популярні:                                                   │
│   • Polybar (X11) — гнучкий, гарний                           │
│   • Waybar (Wayland) — для Sway, Hyprland                     │
│   • i3bar/i3status — стандартний для i3                       │
│   • Eww — widgets (Rust)                                      │
│   • Conky — системний монітор                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Практика: встановлення i3

```bash
# Встановити i3
sudo apt install i3 i3status dmenu i3lock

# Або на Fedora
sudo dnf install i3 i3status dmenu i3lock

# При логіні обрати i3 у display manager

# Перезавантажити конфіг
# $mod+Shift+r (в i3)

# dmenu — application launcher
# $mod+d (в i3)
```

## Коли використовувати Tiling WM?

| Для кого | Перевага |
|----------|----------|
| Розробники | Код + термінал без миші |
| Сисадміни | Багато терміналів |
| Power users | Швидкість, клавіатура |
| Мінімалісти | Низьке споживання ресурсів |

**Недоліки:**
- Крива навчання
- Не для всіх програм (GIMP)
- Конфігурація вручну

## Підсумок

| Тип | Приклади | Для кого |
|-----|----------|----------|
| Stacking (DE) | Mutter, KWin | Всі |
| Stacking | Openbox | Легкі системи |
| Tiling X11 | i3, bspwm | Power users |
| Tiling Wayland | Sway, Hyprland | Сучасні системи |

На наступній лекції — теми, шрифти та друк.
