---
title: "Використання диспетчера вікон"
type: lecture
order: 17
preview: "Window managers, tiling WM, композитори."
---

## Що таке Window Manager?

**Window Manager (WM)** — програма, яка керує вікнами: їх розміром, позицією, рамками, фокусом. Desktop Environment (DE) завжди включає WM, але WM можна використовувати і окремо, без повного DE.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WM vs DE                                     │
│                                                                 │
│   Desktop Environment = WM + панель + файловий менеджер        │
│                        + налаштування + набір програм           │
│                                                                 │
│   GNOME = Mutter + GNOME Shell + Nautilus + Settings + ...     │
│   KDE   = KWin  + Plasma Shell + Dolphin  + System Settings    │
│                                                                 │
│   Window Manager alone:                                        │
│   • Тільки керування вікнами                                   │
│   • Мінімальне споживання ресурсів                             │
│   • Потрібна ручна конфігурація                                │
│   • Для power users                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Типи Window Managers

```
┌─────────────────────────────────────────────────────────────────┐
│                    ТИПИ WINDOW MANAGERS                         │
│                                                                 │
│   STACKING WM                      TILING WM                   │
│   (традиційний, floating)          (мозаїчний)                 │
│                                                                 │
│   ┌────────────────────┐           ┌───────┬───────┐           │
│   │ ┌────────────────┐ │           │       │       │           │
│   │ │    Window 2    │ │           │ Win 1 │ Win 2 │           │
│   │ │                │ │           │       │       │           │
│   │ └────────────────┘ │           ├───────┴───────┤           │
│   │┌────────────────┐  │           │    Win 3      │           │
│   ││   Window 1     │  │           │               │           │
│   │└────────────────┘  │           └───────────────┘           │
│   └────────────────────┘                                       │
│                                                                 │
│   • Вікна можуть накладатися       • Вікна не перекриваються  │
│   • Як Windows/macOS               • Автоматичне розміщення    │
│   • Керування мишею                • Керування клавіатурою     │
│   • Звичний для більшості          • Ефективне для розробників │
│                                                                 │
│   Приклади:                        Приклади:                   │
│   Mutter, KWin, Xfwm, Openbox     i3, Sway, bspwm, dwm        │
└─────────────────────────────────────────────────────────────────┘
```

## Stacking Window Managers

### WM, що входять до DE

| WM | DE | Особливості |
|----|----|----|
| **Mutter** | GNOME | Wayland compositor, animations |
| **KWin** | KDE Plasma | Найбільше ефектів, Wayland/X11 |
| **Xfwm** | XFCE | Легкий, стабільний, X11 |
| **Marco** | MATE | Fork Metacity, простий |
| **Muffin** | Cinnamon | Fork Mutter |

### Standalone Stacking WM

| WM | Особливості | Конфігурація |
|----|-------------|--------------|
| **Openbox** | Легкий, популярний | XML (~/.config/openbox/) |
| **Fluxbox** | Класичний, tabbed windows | Text files |
| **IceWM** | Windows-подібний | Text files |
| **JWM** | Дуже легкий | XML |

```bash
# Встановити Openbox
sudo apt install openbox obconf menumaker

# Конфігурація
ls ~/.config/openbox/
# rc.xml — основна конфігурація
# menu.xml — меню (правий клік)
# autostart — автозапуск

# Генерувати меню
mmaker -f OpenBox3

# GUI конфігуратор
obconf
```

## Tiling Window Managers

Tiling WM автоматично розміщує вікна так, щоб вони не перекривалися і займали весь екран. Ідеально для роботи з терміналами та кодом.

```
┌─────────────────────────────────────────────────────────────────┐
│                    TILING WM LAYOUTS                            │
│                                                                 │
│   Master-Stack (dwm, xmonad):      Columns (i3 default):       │
│   ┌───────────────┬───────┐        ┌───────┬───────┬───────┐   │
│   │               │ Win 2 │        │       │       │       │   │
│   │   Master      ├───────┤        │ Win 1 │ Win 2 │ Win 3 │   │
│   │   (Win 1)     │ Win 3 │        │       │       │       │   │
│   │               ├───────┤        └───────┴───────┴───────┘   │
│   │               │ Win 4 │                                     │
│   └───────────────┴───────┘                                     │
│                                                                 │
│   Monocle (fullscreen):            Fibonacci (bspwm):          │
│   ┌─────────────────────┐          ┌───────────┬───────┐       │
│   │                     │          │           │       │       │
│   │       Win 1         │          │   Win 1   │ Win 2 │       │
│   │    (fullscreen)     │          │           ├───┬───┤       │
│   │                     │          │           │ 3 │ 4 │       │
│   └─────────────────────┘          └───────────┴───┴───┘       │
│                                                                 │
│   Dwindle (bspwm):                 Grid:                       │
│   ┌───────────┬───────┐            ┌───────┬───────┐           │
│   │           │       │            │ Win 1 │ Win 2 │           │
│   │   Win 1   │ Win 2 │            ├───────┼───────┤           │
│   │           ├───┬───┤            │ Win 3 │ Win 4 │           │
│   │           │ 3 │ 4 │            └───────┴───────┘           │
│   └───────────┴───┴───┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Популярні Tiling WM

| WM | Display Server | Мова конфігурації | Особливості |
|----|----------------|-------------------|-------------|
| **i3** | X11 | Text (~/.config/i3/config) | Найпопулярніший, документація |
| **Sway** | Wayland | Text (i3-сумісний) | i3 для Wayland |
| **bspwm** | X11 | Shell scripts | Binary space partitioning |
| **dwm** | X11 | C (потрібна перекомпіляція) | Suckless philosophy, <2000 рядків |
| **Hyprland** | Wayland | Text | Анімації, blur, modern |
| **Awesome** | X11 | Lua | Widgets, extensible |
| **xmonad** | X11 | Haskell | Для Haskell-програмістів |
| **qtile** | X11/Wayland | Python | Для Python-програмістів |

### i3 Window Manager

**i3** — найпопулярніший tiling WM. Легко налаштовується, відмінна документація.

```bash
# Встановити i3
sudo apt install i3 i3status i3lock dmenu

# Fedora
sudo dnf install i3 i3status i3lock dmenu

# Arch
sudo pacman -S i3-wm i3status i3lock dmenu

# Перший запуск створить конфіг
# ~/.config/i3/config
```

**Базова конфігурація i3:**

```bash
# ~/.config/i3/config

# Модифікатор (Mod4 = Super/Win key, Mod1 = Alt)
set $mod Mod4

# Термінал
set $terminal alacritty
bindsym $mod+Return exec $terminal

# Закрити вікно
bindsym $mod+Shift+q kill

# Application launcher (dmenu)
bindsym $mod+d exec dmenu_run

# Навігація фокусу (vim-like)
bindsym $mod+h focus left
bindsym $mod+j focus down
bindsym $mod+k focus up
bindsym $mod+l focus right

# Або стрілками
bindsym $mod+Left focus left
bindsym $mod+Down focus down
bindsym $mod+Up focus up
bindsym $mod+Right focus right

# Переміщення вікон
bindsym $mod+Shift+h move left
bindsym $mod+Shift+j move down
bindsym $mod+Shift+k move up
bindsym $mod+Shift+l move right

# Split
bindsym $mod+v split v  # Наступне вікно вертикально
bindsym $mod+b split h  # Наступне вікно горизонтально

# Fullscreen
bindsym $mod+f fullscreen toggle

# Layout modes
bindsym $mod+s layout stacking
bindsym $mod+w layout tabbed
bindsym $mod+e layout toggle split

# Toggle floating
bindsym $mod+Shift+space floating toggle
bindsym $mod+space focus mode_toggle

# Workspaces
set $ws1 "1"
set $ws2 "2"
set $ws3 "3"
set $ws4 "4"

bindsym $mod+1 workspace $ws1
bindsym $mod+2 workspace $ws2
bindsym $mod+3 workspace $ws3
bindsym $mod+4 workspace $ws4

bindsym $mod+Shift+1 move container to workspace $ws1
bindsym $mod+Shift+2 move container to workspace $ws2

# Resize mode
mode "resize" {
    bindsym h resize shrink width 10 px
    bindsym j resize grow height 10 px
    bindsym k resize shrink height 10 px
    bindsym l resize grow width 10 px
    bindsym Escape mode "default"
}
bindsym $mod+r mode "resize"

# Reload config
bindsym $mod+Shift+c reload

# Restart i3
bindsym $mod+Shift+r restart

# Exit i3
bindsym $mod+Shift+e exec "i3-nagbar -t warning -m 'Exit i3?' -b 'Yes' 'i3-msg exit'"

# Status bar
bar {
    status_command i3status
    position top
}
```

### i3 основні команди

| Комбінація | Дія |
|------------|-----|
| `$mod+Return` | Відкрити термінал |
| `$mod+d` | Application launcher (dmenu) |
| `$mod+Shift+q` | Закрити вікно |
| `$mod+h/j/k/l` | Фокус ліво/вниз/вгору/право |
| `$mod+Shift+h/j/k/l` | Перемістити вікно |
| `$mod+v` | Split вертикально |
| `$mod+b` | Split горизонтально |
| `$mod+f` | Fullscreen |
| `$mod+1-9` | Перейти до workspace |
| `$mod+Shift+1-9` | Перемістити вікно до workspace |
| `$mod+Shift+c` | Перезавантажити конфіг |
| `$mod+Shift+r` | Перезапустити i3 |

### Sway (Wayland)

**Sway** — це i3-сумісний compositor для Wayland. Якщо знаєте i3, легко перейти на Sway.

```bash
# Встановити
sudo apt install sway swaybar swayidle swaylock

# Конфігурація (майже ідентична i3)
cp /etc/sway/config ~/.config/sway/config

# Запустити (з TTY)
sway

# Відмінності від i3:
# - Wayland замість X11
# - output замість xrandr
# - input замість xinput
# - Деякі X11 програми потребують XWayland
```

## Compositor

**Compositor** — програма, що об'єднує вікна в фінальне зображення. Додає візуальні ефекти: тіні, прозорість, анімації, blur.

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPOSITOR                                   │
│                                                                 │
│   X11 Standalone Compositors:      Wayland:                    │
│   ─────────────────────────        ────────                    │
│   • Picom (fork Compton)           • Compositor = частина WM   │
│   • Compton (deprecated)           • Mutter, KWin, Sway        │
│                                    • Wlroots-based              │
│                                                                 │
│   Ефекти:                                                      │
│   • Тіні вікон                                                 │
│   • Прозорість (inactive windows)                              │
│   • Blur (розмиття фону)                                       │
│   • Fade in/out анімації                                       │
│   • Rounded corners                                            │
│   • VSync (no tearing)                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Picom конфігурація

```bash
# Встановити picom
sudo apt install picom

# Базова конфігурація
mkdir -p ~/.config/picom
```

```bash
# ~/.config/picom/picom.conf

# Тіні
shadow = true;
shadow-radius = 12;
shadow-offset-x = -7;
shadow-offset-y = -7;
shadow-opacity = 0.6;

# Виключити тіні для деяких вікон
shadow-exclude = [
    "name = 'Notification'",
    "class_g = 'dmenu'",
    "class_g = 'Dunst'"
];

# Fade (анімація появи/зникнення)
fading = true;
fade-in-step = 0.03;
fade-out-step = 0.03;
fade-delta = 5;

# Прозорість
inactive-opacity = 0.9;
active-opacity = 1.0;
frame-opacity = 0.9;

# Blur
blur-background = true;
blur-method = "dual_kawase";
blur-strength = 5;

# Rounded corners
corner-radius = 10;

# VSync
vsync = true;

# Backend
backend = "glx";  # або "xrender"
```

```bash
# Запустити picom
picom --config ~/.config/picom/picom.conf &

# Або без конфіг файлу
picom --shadow --fading --inactive-opacity=0.9 &

# Додати в автозапуск i3
# exec --no-startup-id picom --config ~/.config/picom/picom.conf
```

## Status Bar

Status bar — панель з інформацією про систему (час, батарея, CPU, мережа) та workspaces.

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATUS BARS                                  │
│                                                                 │
│   ┌───────────────────────────────────────────────────────────┐│
│   │ ⚙ │ 1 │ 2 │ 3 │ 4 │          │ CPU 5% │ 🔊 │ 🔋 85% │ 14:30││
│   └───────────────────────────────────────────────────────────┘│
│     │     └─── workspaces ───┘    └─── system info ──────────┘ │
│     └── menu                                                   │
│                                                                 │
│   Популярні bars:                                              │
│   ──────────────                                               │
│   • i3bar + i3status — вбудований в i3, простий               │
│   • Polybar (X11) — гнучкий, красивий, популярний             │
│   • Waybar (Wayland) — для Sway, Hyprland                     │
│   • Eww (Rust) — widgets, для advanced users                  │
│   • Conky — системний монітор, гнучкий                        │
│   • Lemonbar — мінімалістичний, shell scripting               │
└─────────────────────────────────────────────────────────────────┘
```

### Polybar

```bash
# Встановити
sudo apt install polybar

# Конфігурація
mkdir -p ~/.config/polybar
cp /usr/share/doc/polybar/examples/config.ini ~/.config/polybar/

# Запустити
polybar example &

# Launch script для i3
cat > ~/.config/polybar/launch.sh << 'EOF'
#!/bin/bash
killall -q polybar
while pgrep -u $UID -x polybar >/dev/null; do sleep 1; done
polybar main &
EOF
chmod +x ~/.config/polybar/launch.sh
```

### Waybar (для Sway/Wayland)

```bash
# Встановити
sudo apt install waybar

# Конфігурація
mkdir -p ~/.config/waybar
# ~/.config/waybar/config — JSON
# ~/.config/waybar/style.css — CSS стилі

# Автозапуск в Sway
# exec waybar
```

## Коли використовувати Tiling WM?

```
┌─────────────────────────────────────────────────────────────────┐
│                    TILING WM: ЗА І ПРОТИ                        │
│                                                                 │
│   Ідеально для:                    Не найкращий вибір для:     │
│   ────────────                     ─────────────────────       │
│   ✅ Розробників                   ❌ Графічних дизайнерів     │
│   ✅ Сисадмінів                    ❌ Відеоредакторів          │
│   ✅ DevOps/SRE                    ❌ Новачків в Linux         │
│   ✅ Data Scientists               ❌ GIMP, Inkscape users     │
│   ✅ Keyboard-first users          ❌ Тих, хто любить мишку   │
│   ✅ Multiple monitors             ❌ Gaming (деякі ігри)      │
│   ✅ Мінімалістів                                               │
│                                                                 │
│   Переваги:                        Недоліки:                   │
│   ──────────                       ──────────                   │
│   • Ефективне використання         • Крива навчання            │
│     простору екрану                • Ручна конфігурація        │
│   • Швидкість (клавіатура)         • Не для всіх програм       │
│   • Низьке споживання RAM          • Потрібен час на setup     │
│   • Консистентність                                            │
│   • Reproducible config                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Практика: встановлення i3

```bash
# 1. Встановити i3 та залежності
sudo apt install i3 i3status i3lock dmenu picom feh dunst

# feh — для шпалер
# dunst — для нотифікацій
# picom — compositor

# 2. При логіні обрати i3 у Display Manager

# 3. Перший запуск — натиснути Enter для генерації конфігу

# 4. Базові команди:
# $mod+Enter — термінал
# $mod+d — dmenu (запуск програм)
# $mod+Shift+q — закрити вікно
# $mod+Shift+e — вийти з i3

# 5. Налаштувати шпалери
feh --bg-scale ~/Pictures/wallpaper.jpg
# Додати в config: exec --no-startup-id feh --bg-scale ~/Pictures/wallpaper.jpg

# 6. Увімкнути compositor
# Додати в config: exec --no-startup-id picom

# 7. Перезавантажити конфіг
# $mod+Shift+r
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────┐
│           WINDOW MANAGERS В ENTERPRISE                          │
│                                                                 │
│   Tech компанії (Google, Amazon, Meta):                         │
│   ├── i3/Sway для DevOps та SRE команд                         │
│   ├── Багато терміналів + моніторинг dashboards                │
│   ├── Keyboard-centric workflow для швидкості                  │
│   └── Reproducible dotfiles через Git                          │
│                                                                 │
│   Фінансові трейдинг-компанії:                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • Multi-monitor setups (6-8 моніторів)                  │   │
│   │ • Tiling WM для максимального використання простору     │   │
│   │ • Кожен workspace = окремий ринок/інструмент            │   │
│   │ • Мінімум анімацій (швидкість реакції критична)         │   │
│   │ • KWin з custom scripts для автоматизації               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Стартапи та agile команди:                                    │
│   • i3 + tmux для pair programming через screen sharing       │
│   • Однакове середовище: dev laptop = production server        │
│   • Dotfiles в репозиторії компанії                            │
│                                                                 │
│   Data Science / ML команди:                                    │
│   • Jupyter + Terminal + Visualization паралельно              │
│   • Tiling для порівняння графіків side-by-side               │
│   • GPU моніторинг завжди видимий (nvidia-smi)                 │
│                                                                 │
│   DevOps / Platform Engineering:                                │
│   • Sway на Wayland для security (ізоляція вікон)              │
│   • Polybar/Waybar з cluster health статусами                  │
│   • Workspace per environment (dev, staging, prod)             │
└─────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   DevOps Engineer                                               │
│   ├── Зарплата: $80,000 - $150,000 (EUR 70,000 - 130,000)      │
│   ├── Навички: i3/Sway, tmux, dotfiles management              │
│   └── Чому WM: ефективна робота з терміналами та моніторингом │
│                                                                 │
│   Site Reliability Engineer (SRE)                               │
│   ├── Зарплата: $100,000 - $200,000 (EUR 90,000 - 170,000)     │
│   ├── Навички: tiling WM, multi-monitor, automation            │
│   └── Чому WM: швидка реакція на інциденти, багато терміналів  │
│                                                                 │
│   Backend Developer (Senior)                                    │
│   ├── Зарплата: $90,000 - $180,000 (EUR 80,000 - 155,000)      │
│   ├── Навички: i3/Sway, vim, keyboard-driven workflow          │
│   └── Чому WM: фокус на коді, мінімум відволікань              │
│                                                                 │
│   Security Engineer                                             │
│   ├── Зарплата: $95,000 - $175,000 (EUR 85,000 - 150,000)      │
│   ├── Навички: Sway (Wayland security), minimal attack surface │
│   └── Чому WM: контроль над системою, аудит можливостей        │
│                                                                 │
│   Linux Desktop Developer                                       │
│   ├── Зарплата: $70,000 - $130,000 (EUR 65,000 - 115,000)      │
│   ├── Навички: X11/Wayland internals, compositor development   │
│   └── Задачі: розробка та покращення WM/DE                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **i3wm.org** | Офіційна документація i3 | i3wm.org/docs |
| **Sway Wiki** | Документація Sway | github.com/swaywm/sway/wiki |
| **r/unixporn** | Натхнення для customization | reddit.com/r/unixporn |
| **Arch Wiki - Window Managers** | Порівняння всіх WM | wiki.archlinux.org/title/Window_manager |

### Книги

| Назва | Автор | Рівень |
|-------|-------|--------|
| "i3 User's Guide" | i3 Documentation | Початковий |
| "Mastering Linux Administration" | Alexandru Calcatinge | Середній |
| "The Linux Programming Interface" | Michael Kerrisk | Просунутий |
| "X Window System Administrator's Guide" | O'Reilly | Просунутий |

### YouTube канали

| Канал | Фокус |
|-------|-------|
| **Luke Smith** | i3, suckless tools, minimalism |
| **DistroTube** | WM огляди та туторіали |
| **Brodie Robertson** | Wayland, Sway, Hyprland |
| **Mental Outlaw** | Linux ricing та WM |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                 WINDOW MANAGERS CHEAT SHEET                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   i3 SHORTCUTS (default $mod = Super):                         │
│   $mod+Enter       Відкрити термінал                           │
│   $mod+d           dmenu (app launcher)                        │
│   $mod+Shift+q     Закрити вікно                               │
│   $mod+h/j/k/l     Фокус ліво/вниз/вгору/право                 │
│   $mod+Shift+h/j/k/l  Перемістити вікно                        │
│   $mod+v           Split вертикально                           │
│   $mod+b           Split горизонтально                         │
│   $mod+f           Fullscreen toggle                           │
│   $mod+1-9         Перейти до workspace                        │
│   $mod+Shift+1-9   Перемістити вікно до workspace              │
│   $mod+Shift+c     Reload config                               │
│   $mod+Shift+r     Restart i3                                  │
│   $mod+Shift+e     Exit i3                                     │
│                                                                 │
│   LAYOUTS:                                                      │
│   $mod+s           Stacking layout                             │
│   $mod+w           Tabbed layout                               │
│   $mod+e           Toggle split layout                         │
│   $mod+Shift+space Toggle floating                             │
│                                                                 │
│   RESIZE MODE:                                                  │
│   $mod+r           Enter resize mode                           │
│   h/j/k/l          Resize в режимі resize                      │
│   Escape           Exit resize mode                            │
│                                                                 │
│   CONFIG FILES:                                                 │
│   ~/.config/i3/config        i3 конфігурація                   │
│   ~/.config/sway/config      Sway конфігурація                 │
│   ~/.config/picom/picom.conf Compositor                        │
│   ~/.config/polybar/         Status bar                        │
│                                                                 │
│   USEFUL COMMANDS:                                              │
│   i3-msg reload              Reload config                     │
│   i3-msg restart             Restart in place                  │
│   i3-msg "workspace 1"       Script workspace switch           │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка різниця між stacking та tiling window manager?** Для яких задач краще підходить кожен тип?

2. **Чому i3/Sway популярні серед DevOps інженерів?** Які переваги keyboard-driven workflow?

3. **Що таке compositor і чому він потрібен?** Яка різниця між Picom (X11) та вбудованим compositor у Wayland?

4. **Чим Sway відрізняється від i3?** Чому Wayland вважається більш безпечним за X11?

5. **Що таке status bar (Polybar, Waybar)?** Яку інформацію зазвичай показують на status bar?

## 🎯 Міні-проект (30 хв)

### Завдання: Спробуйте tiling WM без встановлення (або з мінімальним налаштуванням)

Познайомтеся з концепцією tiling window manager, використовуючи вбудовані можливості вашого DE або легке налаштування. Якщо ви готові — встановіть i3!

**Варіант A: Tiling в GNOME (без встановлення)**

1. Використовуйте вбудований tiling:
```bash
# GNOME має базовий tiling:
# Super + Left  = вікно займає ліву половину
# Super + Right = вікно займає праву половину
# Super + Up    = максимізувати

# Встановіть extension для повноцінного tiling:
# 1. Відкрийте: https://extensions.gnome.org
# 2. Встановіть "Pop Shell" або "Tiling Assistant"
```

2. Практикуйте keyboard workflow:
```
Тренуйте ці комбінації 10 хвилин:
- Super+Left, Super+Right (tile вікна)
- Alt+Tab (швидке переключення)
- Super+1/2/3/4 (workspaces)
- Super+Q (закрити вікно)
```

**Варіант B: Встановіть i3 (повноцінний досвід)**

1. Встановіть i3:
```bash
sudo apt install i3 i3status dmenu feh picom
```

2. Logout та виберіть i3 в Display Manager (GDM/SDDM)

3. Перший запуск — натисніть Enter для генерації конфігу

4. Базові команди (за замовчуванням $mod = Super):
```
$mod + Enter     = Термінал
$mod + d         = dmenu (запуск програм)
$mod + Shift + q = Закрити вікно
$mod + 1-9       = Переключити workspace
$mod + Shift + e = Вийти з i3
```

5. Створіть свій мінімальний конфіг:
```bash
nano ~/.config/i3/config
```

Додайте в кінець файлу:
```bash
# Мої налаштування
# Шпалери
exec --no-startup-id feh --bg-scale ~/Pictures/wallpaper.jpg

# Compositor (тіні, прозорість)
exec --no-startup-id picom

# Мої програми
bindsym $mod+b exec firefox
bindsym $mod+e exec nautilus
bindsym $mod+c exec code

# Gaps (якщо i3-gaps)
# gaps inner 10
# gaps outer 5
```

6. Перезавантажте конфіг: `$mod + Shift + r`

**Варіант C: Створіть скрипт-порівняння WM**

```bash
nano ~/scripts/compare-wm.sh
```

```bash
#!/bin/bash
# Window Manager Comparison Script

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           WINDOW MANAGER COMPARISON                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🖥️ CURRENT SETUP:"
echo "   Desktop:    $XDG_CURRENT_DESKTOP"
echo "   Session:    $XDG_SESSION_TYPE"
echo ""

echo "📦 AVAILABLE SESSIONS:"
echo "   X11 sessions:"
ls /usr/share/xsessions/*.desktop 2>/dev/null | while read f; do
    name=$(grep "^Name=" "$f" | cut -d= -f2)
    echo "      - $name"
done

echo "   Wayland sessions:"
ls /usr/share/wayland-sessions/*.desktop 2>/dev/null | while read f; do
    name=$(grep "^Name=" "$f" | cut -d= -f2)
    echo "      - $name"
done
echo ""

echo "📊 WM COMPARISON TABLE:"
echo "┌─────────────┬───────────┬─────────────┬──────────────┐"
echo "│ WM          │ Type      │ RAM Usage   │ Best For     │"
echo "├─────────────┼───────────┼─────────────┼──────────────┤"
echo "│ GNOME/Mutter│ Stacking  │ ~1 GB       │ Everyone     │"
echo "│ KDE/KWin    │ Stacking  │ ~800 MB     │ Customizers  │"
echo "│ XFCE/Xfwm   │ Stacking  │ ~400 MB     │ Old PCs      │"
echo "│ i3          │ Tiling    │ ~50 MB      │ Developers   │"
echo "│ Sway        │ Tiling    │ ~80 MB      │ Wayland+dev  │"
echo "└─────────────┴───────────┴─────────────┴──────────────┘"
echo ""

echo "💡 RECOMMENDATIONS:"
if [ "$XDG_CURRENT_DESKTOP" = "GNOME" ]; then
    echo "   You're on GNOME. Try Pop Shell extension for tiling!"
elif [ "$XDG_CURRENT_DESKTOP" = "KDE" ]; then
    echo "   You're on KDE. Enable 'Tiling' in KWin scripts!"
fi
echo "   For full tiling experience: try i3 or Sway"
```

**Очікуваний результат:**
- Розуміння концепції tiling WM
- Практичний досвід keyboard-driven workflow
- (Опціонально) Працюючий i3 з базовим конфігом

**Бонус (для допитливих):**
- Встановіть Polybar замість i3bar для красивого статус-бару
- Налаштуйте кольорову схему i3 (у конфігу `client.focused`, `client.unfocused`)
- Спробуйте rofi замість dmenu: `sudo apt install rofi`, потім `bindsym $mod+d exec rofi -show drun`
- Створіть workspace rules: конкретні програми на конкретних workspaces

## Підсумок

| Тип | WM | Для кого |
|-----|----|----|
| Stacking (DE) | Mutter, KWin | Всі користувачі |
| Stacking standalone | Openbox, Fluxbox | Легкі системи |
| Tiling X11 | i3, bspwm, dwm | Power users, розробники |
| Tiling Wayland | Sway, Hyprland | Сучасні системи |

| Компонент | X11 | Wayland |
|-----------|-----|---------|
| Compositor | Picom, Compton | Вбудований в WM |
| Status bar | Polybar, Lemonbar | Waybar |
| Launcher | dmenu, rofi | wofi, fuzzel |
| WM | i3, bspwm | Sway, Hyprland |

| i3 Shortcut | Дія |
|-------------|-----|
| `$mod+Return` | Термінал |
| `$mod+d` | App launcher |
| `$mod+Shift+q` | Закрити вікно |
| `$mod+h/j/k/l` | Навігація |
| `$mod+1-9` | Workspace |
| `$mod+f` | Fullscreen |
| `$mod+Shift+r` | Restart i3 |

На наступній лекції — теми, шрифти та друк.
