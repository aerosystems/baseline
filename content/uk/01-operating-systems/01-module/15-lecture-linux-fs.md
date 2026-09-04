---
title: "Файлова система Linux"
type: lecture
order: 15
preview: "Структура /, ext4, права доступу, FHS."
---

## Все є файлом

В UNIX/Linux майже все представлено як файл: звичайні файли, каталоги, пристрої, сокети, процеси. Це спрощує взаємодію — один інтерфейс для всього.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ТИПИ ФАЙЛІВ В LINUX                          │
│                                                                 │
│   Тип    Символ   Приклад                                      │
│   ─────  ──────   ────────                                     │
│   Regular    -    /etc/passwd                                  │
│   Directory  d    /home/user/                                  │
│   Symlink    l    /lib → /usr/lib                              │
│   Block dev  b    /dev/sda (диск)                              │
│   Char dev   c    /dev/tty (термінал)                          │
│   Socket     s    /var/run/docker.sock                         │
│   FIFO/Pipe  p    named pipe                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Filesystem Hierarchy Standard (FHS)

```
/                           Root — корінь
├── bin/      → /usr/bin    Базові програми
├── boot/                   Ядро та завантажувач
│   ├── vmlinuz-*           Ядро
│   └── initrd.img-*        Initial RAM disk
├── dev/                    Пристрої
│   ├── sda, sda1           Диски
│   ├── null                "Чорна діра"
│   ├── zero                Нулі
│   └── random              Випадкові дані
├── etc/                    Конфігурація
│   ├── passwd              Користувачі
│   ├── fstab               Монтування
│   └── ssh/                SSH config
├── home/                   Домашні каталоги
│   └── username/
├── lib/, lib64/            Бібліотеки
├── mnt/, media/            Точки монтування
├── opt/                    Опціональне ПЗ
├── proc/                   Віртуальна ФС (процеси)
├── root/                   Домашній каталог root
├── run/                    Runtime дані (PID, sockets)
├── sbin/ → /usr/sbin       Системні команди
├── sys/                    Віртуальна ФС (ядро)
├── tmp/                    Тимчасові файли
├── usr/                    User programs
│   ├── bin/                Програми
│   ├── lib/                Бібліотеки
│   ├── share/              Дані (docs, icons)
│   └── local/              Локально встановлене
└── var/                    Змінні дані
    ├── log/                Логи
    ├── cache/              Кеш
    └── lib/                Стан (бази даних)
```

## Типи файлових систем

| ФС | Призначення | Особливості |
|----|-------------|-------------|
| **ext4** | Основна для Linux | Журнал, до 1EB, стабільна |
| **XFS** | Сервери, великі файли | Швидка, масштабована |
| **Btrfs** | Сучасна, snapshot | Copy-on-write, стиснення |
| **NTFS** | Windows диски | Підтримка через ntfs-3g |
| **FAT32** | USB, SD-карти | Універсальна сумісність |
| **tmpfs** | /tmp, /run | В RAM |
| **proc, sys** | Віртуальні | Інформація ядра |

```bash
# Змонтовані файлові системи
df -hT

# Тип ФС
lsblk -f

# Інформація про ext4
sudo tune2fs -l /dev/sda1

# Перевірка ФС
sudo fsck.ext4 -n /dev/sda1
```

## Права доступу

```
┌─────────────────────────────────────────────────────────────────┐
│                    ПРАВА ДОСТУПУ                                │
│                                                                 │
│   ls -la file.txt                                              │
│   -rw-r--r-- 1 user group 1234 Jan 15 10:30 file.txt          │
│   │││ │││ │││                                                  │
│   │││ │││ └┴┴─ others: r-- (4)                                │
│   │││ └┴┴───── group:  r-- (4)                                │
│   │└┴───────── owner:  rw- (6)                                │
│   └─────────── type:   - (файл), d (каталог), l (link)        │
│                                                                 │
│   Числовий формат:                                             │
│   r=4  w=2  x=1                                                │
│   rw-r--r-- = 644                                              │
│   rwxr-xr-x = 755                                              │
│   rwx------ = 700                                              │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Змінити права
chmod 755 script.sh
chmod u+x script.sh      # owner +execute
chmod g-w file.txt       # group -write
chmod o=r file.txt       # others = read only

# Змінити власника
sudo chown user:group file.txt
sudo chown -R user:group directory/

# Маска за замовчуванням
umask 022   # 777 - 022 = 755 для каталогів

# Спеціальні біти
chmod u+s /usr/bin/passwd   # SUID
chmod g+s directory/        # SGID
chmod +t /tmp               # Sticky bit
```

## Монтування

```bash
# Показати точки монтування
mount | column -t
findmnt

# Змонтувати USB
sudo mount /dev/sdb1 /mnt/usb

# Змонтувати з опціями
sudo mount -o ro,noexec /dev/sdb1 /mnt/usb

# Відмонтувати
sudo umount /mnt/usb

# Автоматичне монтування — /etc/fstab
# /dev/sda1  /          ext4  defaults        0 1
# /dev/sda2  /home      ext4  defaults        0 2
# UUID=xxx   /mnt/data  ntfs  uid=1000,gid=1000 0 0
```

## Посилання (Links)

```
┌─────────────────────────────────────────────────────────────────┐
│   HARD LINK                        SYMBOLIC LINK               │
│   ─────────                        ─────────────               │
│                                                                 │
│   file.txt ──┬──► [inode] ──► data    file.txt ──► data       │
│   link.txt ──┘                        symlink ──► "file.txt"   │
│                                                                 │
│   • Той самий inode                • Окремий файл              │
│   • Не можна на каталоги           • Можна на каталоги         │
│   • Не можна cross-filesystem      • Можна cross-filesystem    │
│   • Видалення оригіналу ОК         • Видалення = broken link   │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Hard link
ln original.txt hardlink.txt

# Symbolic link
ln -s /path/to/original symlink

# Перевірити inode
ls -li
stat file.txt
```

## Практичні команди

```bash
# Навігація
pwd              # Де я?
cd /var/log      # Перейти
cd ~             # Додому
cd -             # Попередній каталог

# Перегляд
ls -la           # Детально
ls -lh           # Human-readable розмір
tree -L 2        # Дерево (2 рівні)

# Пошук
find /home -name "*.txt"
find . -type f -size +100M
locate filename  # Швидкий пошук (updatedb)

# Розмір
du -sh /var/*
df -h

# Операції
cp -r dir1 dir2
mv old.txt new.txt
rm -rf directory/
mkdir -p a/b/c
```

## Підсумок

| Каталог | Призначення |
|---------|-------------|
| `/etc` | Конфігурація |
| `/home` | Користувачі |
| `/var/log` | Логи |
| `/tmp` | Тимчасові |
| `/usr/bin` | Програми |
| `/dev` | Пристрої |
| `/proc`, `/sys` | Ядро |

| Права | Значення |
|-------|----------|
| 755 | rwxr-xr-x (програми) |
| 644 | rw-r--r-- (файли) |
| 700 | rwx------ (приватне) |
| 777 | rwxrwxrwx (всім все) |

На наступній лекції — додаткові властивості робочого столу.
