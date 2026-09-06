---
title: "Файлова система Linux"
type: lecture
order: 15
preview: "Структура /, ext4, права доступу, FHS."
---

## Все є файлом

Філософія UNIX: **"Everything is a file"**. В UNIX/Linux майже все представлено як файл: звичайні файли, каталоги, пристрої, сокети, процеси. Це спрощує взаємодію — один інтерфейс для всього.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ТИПИ ФАЙЛІВ В LINUX                          │
│                                                                 │
│   Символ    Тип              Приклад                           │
│   ──────    ────              ────────                          │
│      -      Regular file      /etc/passwd                       │
│      d      Directory         /home/user/                       │
│      l      Symbolic link     /lib → /usr/lib                   │
│      b      Block device      /dev/sda (HDD/SSD)                │
│      c      Character device  /dev/tty (термінал)               │
│      s      Socket            /var/run/docker.sock              │
│      p      Named pipe (FIFO) /tmp/mypipe                       │
│                                                                 │
│   ls -la показує тип як перший символ:                         │
│   drwxr-xr-x  ← d = directory                                  │
│   -rw-r--r--  ← - = regular file                               │
│   lrwxrwxrwx  ← l = symbolic link                              │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Визначити тип файлу
file /etc/passwd
# /etc/passwd: ASCII text

file /dev/sda
# /dev/sda: block special (8/0)

file /bin/ls
# /bin/ls: ELF 64-bit LSB pie executable...

# Тип в ls
ls -la /dev/sda
# brw-rw---- 1 root disk 8, 0 ...

# Спеціальні пристрої
cat /dev/null      # Ніщо (чорна діра)
head -c 10 /dev/zero | xxd  # Нулі
head -c 10 /dev/urandom | xxd  # Випадкові байти
```

## Filesystem Hierarchy Standard (FHS)

**FHS** — стандарт, що визначає структуру каталогів у Linux. Більшість дистрибутивів дотримуються цього стандарту.

```
/                              Root — корінь файлової системи
│
├── bin/  →  /usr/bin          Основні програми (ls, cp, cat)
├── sbin/ →  /usr/sbin         Системні програми (fdisk, mount)
│
├── boot/                      Файли завантажувача
│   ├── vmlinuz-*              Ядро Linux
│   ├── initrd.img-*           Initial RAM disk
│   └── grub/                  Конфігурація GRUB
│
├── dev/                       Файли пристроїв
│   ├── sda, sda1, sda2        Диски та розділи
│   ├── nvme0n1                NVMe SSD
│   ├── tty*, pts/*            Термінали
│   ├── null                   "Чорна діра"
│   ├── zero                   Джерело нулів
│   ├── random, urandom        Генератори випадкових чисел
│   └── loop0, loop1           Loop devices
│
├── etc/                       Конфігурація системи
│   ├── passwd, shadow, group  Користувачі
│   ├── fstab                  Монтування файлових систем
│   ├── hostname               Ім'я комп'ютера
│   ├── hosts                  Локальний DNS
│   ├── ssh/                   Конфігурація SSH
│   ├── apt/                   APT конфігурація
│   └── systemd/               Systemd конфігурація
│
├── home/                      Домашні каталоги користувачів
│   ├── alice/
│   │   ├── .bashrc            Конфігурація bash
│   │   ├── .config/           Конфігурація програм
│   │   └── Documents/
│   └── bob/
│
├── lib/, lib64/               Системні бібліотеки
│   └── x86_64-linux-gnu/      64-bit бібліотеки
│
├── media/                     Автомонтування змінних носіїв
│   └── usb-drive/             USB флешка
│
├── mnt/                       Ручне монтування
│   └── data/                  Додатковий диск
│
├── opt/                       Опціональне ПЗ (сторонні програми)
│   ├── google/
│   └── slack/
│
├── proc/                      Віртуальна ФС — процеси та ядро
│   ├── 1/                     Процес з PID 1 (systemd)
│   ├── cpuinfo                Інформація про CPU
│   ├── meminfo                Інформація про RAM
│   └── version                Версія ядра
│
├── root/                      Домашній каталог root
│
├── run/                       Runtime дані (PID, sockets)
│   ├── user/1000/             Дані поточного користувача
│   └── docker.sock            Docker socket
│
├── srv/                       Дані сервісів (web, ftp)
│
├── sys/                       Віртуальна ФС — апаратура
│   ├── class/                 Класи пристроїв
│   ├── block/                 Блочні пристрої
│   └── power/                 Управління живленням
│
├── tmp/                       Тимчасові файли (очищується)
│
├── usr/                       Користувацькі програми (User System Resources)
│   ├── bin/                   Програми
│   ├── sbin/                  Системні програми
│   ├── lib/                   Бібліотеки
│   ├── share/                 Архітектурно-незалежні дані
│   │   ├── applications/      .desktop файли
│   │   ├── icons/             Іконки
│   │   └── man/               Сторінки man
│   └── local/                 Локально встановлене ПЗ
│       ├── bin/
│       └── lib/
│
└── var/                       Змінні дані
    ├── log/                   Системні логи
    │   ├── syslog
    │   ├── auth.log
    │   └── apt/
    ├── cache/                 Кеш програм
    ├── lib/                   Стан програм (бази даних)
    │   ├── apt/
    │   └── docker/
    ├── mail/                  Пошта
    ├── spool/                 Черги (друк, пошта)
    └── tmp/                   Тимчасові (зберігаються при reboot)
```

### Ключові каталоги детальніше

```bash
# /etc — конфігурація
ls /etc/*.conf | head -5
cat /etc/hostname
cat /etc/os-release

# /var/log — логи
ls /var/log/
sudo tail -20 /var/log/syslog
sudo tail -20 /var/log/auth.log  # Логіни та sudo

# /proc — віртуальна ФС процесів
cat /proc/cpuinfo | grep "model name" | head -1
cat /proc/meminfo | head -5
cat /proc/version
ls /proc/1/  # Процес systemd

# /sys — віртуальна ФС апаратури
cat /sys/class/power_supply/BAT0/capacity  # Батарея
ls /sys/class/net/  # Мережеві інтерфейси

# /dev — пристрої
ls -la /dev/sd*  # SATA/USB диски
ls -la /dev/nvme*  # NVMe диски
```

## Типи файлових систем

**Файлова система** — спосіб організації даних на диску. Linux підтримує багато ФС.

| ФС | Призначення | Особливості |
|----|-------------|-------------|
| **ext4** | Основна ФС Linux | Журналювання, до 1 EB, стабільна |
| **XFS** | Сервери, великі файли | Висока продуктивність, масштабованість |
| **Btrfs** | Сучасна ФС | Copy-on-write, snapshots, стиснення |
| **ZFS** | Enterprise | RAID, snapshots, дедуплікація |
| **NTFS** | Windows сумісність | Читання/запис через ntfs-3g |
| **FAT32/exFAT** | USB, SD-карти | Універсальна сумісність |
| **tmpfs** | Тимчасові дані | В RAM, швидка |
| **proc, sysfs** | Віртуальні | Інформація ядра |
| **squashfs** | Read-only | Стиснута, для Live USB |

```bash
# Переглянути змонтовані ФС
df -hT
#Filesystem     Type      Size  Used Avail Use% Mounted on
#/dev/sda2      ext4      100G   45G   50G  47% /
#/dev/sda1      vfat      512M  128M  384M  25% /boot/efi

# Блочні пристрої з ФС
lsblk -f
#NAME   FSTYPE FSVER LABEL UUID                                 MOUNTPOINT
#sda
#├─sda1 vfat   FAT32       XXXX-XXXX                            /boot/efi
#├─sda2 ext4   1.0         xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx /
#└─sda3 swap   1           xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx [SWAP]

# Інформація про ext4
sudo tune2fs -l /dev/sda2 | head -20

# Перевірка ФС (тільки на unmounted!)
sudo fsck.ext4 -n /dev/sda2  # -n = dry run

# Створити ФС (ОБЕРЕЖНО!)
# sudo mkfs.ext4 /dev/sdX1
```

### ext4 vs Btrfs vs XFS

```
┌─────────────────────────────────────────────────────────────────┐
│                    ПОРІВНЯННЯ ФС                                │
│                                                                 │
│   Критерій          ext4          Btrfs         XFS            │
│   ────────          ────          ─────         ───            │
│   Стабільність      ✅ Відмінна   ⚠️ Добра       ✅ Відмінна   │
│   Snapshots         ❌            ✅             ❌            │
│   Стиснення         ❌            ✅             ❌            │
│   Великі файли      ✅            ✅             ✅✅          │
│   Розмір ФС max     1 EB          16 EB         8 EB           │
│   Online resize     ✅ grow       ✅ grow/shrink ✅ grow       │
│   Дефрагментація    Часткова     ✅             ✅            │
│                                                                 │
│   Рекомендація:                                                │
│   • Desktop/Laptop → ext4 (надійність)                         │
│   • Server з backup → Btrfs (snapshots)                        │
│   • Database/large files → XFS (продуктивність)                │
└─────────────────────────────────────────────────────────────────┘
```

## Права доступу (Permissions)

Linux — багатокористувацька система. Права контролюють, хто може читати, змінювати чи виконувати файли.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ПРАВА ДОСТУПУ                                │
│                                                                 │
│   ls -la file.txt                                              │
│   -rw-r--r-- 1 alice developers 1234 Jan 15 10:30 file.txt    │
│   │││ │││ │││ │ │     │          │    │            │           │
│   │││ │││ │││ │ │     │          │    │            └── ім'я    │
│   │││ │││ │││ │ │     │          │    └── дата модифікації    │
│   │││ │││ │││ │ │     │          └── розмір у байтах          │
│   │││ │││ │││ │ │     └── група                               │
│   │││ │││ │││ │ └── власник                                   │
│   │││ │││ │││ └── кількість hard links                        │
│   │││ │││ └┴┴─── others: r-- (read only) = 4                  │
│   │││ └┴┴─────── group:  r-- (read only) = 4                  │
│   │└┴───────────  owner:  rw- (read+write) = 6                │
│   └───────────── type: - (file), d (dir), l (link)            │
│                                                                 │
│   Числовий формат:                                             │
│   r = 4    w = 2    x = 1                                      │
│                                                                 │
│   Приклади:                                                    │
│   rwxrwxrwx = 777   (всім все дозволено)                      │
│   rwxr-xr-x = 755   (owner все, інші read+execute)            │
│   rw-r--r-- = 644   (owner read+write, інші read)             │
│   rwx------ = 700   (тільки owner)                            │
│   rw------- = 600   (тільки owner, без execute)               │
└─────────────────────────────────────────────────────────────────┘
```

### Команда chmod

```bash
# Числовий формат
chmod 755 script.sh     # rwxr-xr-x
chmod 644 document.txt  # rw-r--r--
chmod 600 secret.key    # rw-------
chmod 777 open.txt      # rwxrwxrwx (небезпечно!)

# Символьний формат
chmod u+x script.sh     # owner +execute
chmod g+w file.txt      # group +write
chmod o-r file.txt      # others -read
chmod a+r file.txt      # all +read
chmod u=rwx,g=rx,o=r file.txt

# Рекурсивно
chmod -R 755 directory/

# Типові права
# Файли:      644 (rw-r--r--)
# Скрипти:    755 (rwxr-xr-x)
# Приватні:   600 (rw-------)
# Каталоги:   755 (rwxr-xr-x)
```

### Команда chown

```bash
# Змінити власника
sudo chown alice file.txt

# Змінити власника та групу
sudo chown alice:developers file.txt

# Тільки групу
sudo chown :developers file.txt
# або
sudo chgrp developers file.txt

# Рекурсивно
sudo chown -R alice:alice /home/alice/project/

# Поточний користувач
whoami           # Ваш username
id               # uid, gid, groups
groups           # Ваші групи
```

### Спеціальні біти

```
┌─────────────────────────────────────────────────────────────────┐
│                    СПЕЦІАЛЬНІ БІТИ                              │
│                                                                 │
│   SUID (Set User ID)           = 4                             │
│   ────────────────────                                         │
│   Виконується від імені власника файлу                         │
│   Приклад: /usr/bin/passwd (щоб змінити /etc/shadow)           │
│   ls -la /usr/bin/passwd                                       │
│   -rwsr-xr-x 1 root root ...  ← 's' замість 'x'               │
│                                                                 │
│   SGID (Set Group ID)          = 2                             │
│   ─────────────────────                                        │
│   На файлі: виконується від імені групи                        │
│   На каталозі: нові файли успадковують групу                   │
│                                                                 │
│   Sticky Bit                   = 1                             │
│   ──────────                                                   │
│   На каталозі: файли може видалити тільки власник              │
│   Приклад: /tmp                                                │
│   drwxrwxrwt ← 't' замість 'x' в others                       │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# SUID
chmod u+s /usr/bin/myprogram   # або chmod 4755
ls -la /usr/bin/passwd         # -rwsr-xr-x

# SGID
chmod g+s /shared/project/     # або chmod 2755

# Sticky bit
chmod +t /tmp                   # або chmod 1777
ls -ld /tmp                     # drwxrwxrwt

# Знайти SUID/SGID файли
find / -perm /4000 2>/dev/null  # SUID
find / -perm /2000 2>/dev/null  # SGID
```

### umask

**umask** визначає права за замовчуванням для нових файлів.

```bash
# Поточний umask
umask
# 0022

# Як це працює:
# Файли:   666 - 022 = 644 (rw-r--r--)
# Каталоги: 777 - 022 = 755 (rwxr-xr-x)

# Встановити umask
umask 077  # Файли 600, каталоги 700 (приватно)

# Зберегти в ~/.bashrc
echo "umask 027" >> ~/.bashrc
```

## Монтування файлових систем

**Монтування** — підключення файлової системи до дерева каталогів.

```bash
# Показати змонтовані ФС
mount | column -t
findmnt
findmnt -t ext4

# Змонтувати USB-флешку
sudo mount /dev/sdb1 /mnt/usb

# З опціями
sudo mount -o ro /dev/sdb1 /mnt/usb        # Read-only
sudo mount -o noexec /dev/sdb1 /mnt/usb    # Без execute
sudo mount -o uid=1000,gid=1000 /dev/sdb1 /mnt/usb  # Для NTFS/FAT

# Відмонтувати
sudo umount /mnt/usb
# або
sudo umount /dev/sdb1

# Примусово відмонтувати (обережно!)
sudo umount -l /mnt/usb  # Lazy unmount
sudo umount -f /mnt/usb  # Force (для NFS)
```

### /etc/fstab

**/etc/fstab** — файл автоматичного монтування при завантаженні.

```bash
cat /etc/fstab
# <device>        <mountpoint>  <type>  <options>       <dump> <pass>
# UUID=xxxx-xxxx  /             ext4    defaults        0      1
# UUID=yyyy-yyyy  /home         ext4    defaults        0      2
# UUID=zzzz-zzzz  none          swap    sw              0      0
# /dev/sdb1       /mnt/data     ntfs    uid=1000,gid=1000 0    0

# Монтувати все з fstab
sudo mount -a

# Перевірка fstab (без монтування)
sudo mount -a --fake

# Отримати UUID
blkid
# або
lsblk -f
```

## Посилання (Links)

Linux підтримує два типи посилань: hard links та symbolic (soft) links.

```
┌─────────────────────────────────────────────────────────────────┐
│   HARD LINK                        SYMBOLIC LINK               │
│   ─────────                        ─────────────               │
│                                                                 │
│   file.txt ──┬──► [inode] ──► data    file.txt ──► data       │
│   link.txt ──┘                        symlink ──► "file.txt"   │
│                                                                 │
│   Обидва файли посилаються            symlink — окремий файл   │
│   на той самий inode.                 що містить шлях          │
│                                                                 │
│   Переваги:                           Переваги:                │
│   ✅ Видалення оригіналу ОК           ✅ Можна на каталоги     │
│   ✅ Той самий розмір                 ✅ Cross-filesystem      │
│   ✅ Ті самі права                    ✅ Видно що це link      │
│                                                                 │
│   Обмеження:                          Обмеження:               │
│   ❌ Тільки файли (не каталоги)       ❌ Broken якщо оригінал  │
│   ❌ Тільки одна ФС                      видалено               │
│   ❌ Не видно що це link                                       │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Symbolic link (найчастіше використовується)
ln -s /path/to/original /path/to/symlink
ln -s ~/Documents/file.txt ~/Desktop/shortcut.txt

# Hard link
ln /path/to/original /path/to/hardlink

# Показати inode
ls -li file.txt
stat file.txt

# Знайти broken symlinks
find . -xtype l

# Видалити symlink (не оригінал!)
rm symlink
# або
unlink symlink
```

## Практичні команди

```bash
# Навігація
pwd                  # Поточний каталог
cd /var/log          # Перейти
cd ~                 # Додому
cd -                 # Попередній каталог
cd ..                # На рівень вгору

# Перегляд
ls -la               # Детальний список
ls -lah              # Human-readable розміри
ls -latr             # Сортування за часом (старі спочатку)
tree -L 2            # Дерево каталогів (2 рівні)
tree -d              # Тільки каталоги

# Пошук
find /home -name "*.txt"
find . -type f -size +100M
find . -type f -mtime -7       # Змінені за 7 днів
find . -type f -user alice
locate filename                 # Швидкий пошук (updatedb)
which python3                   # Де програма

# Розмір
du -sh /var/*        # Розмір каталогів
du -sh .             # Розмір поточного
df -h                # Вільне місце
df -i                # Inodes

# Операції з файлами
cp file1 file2       # Копіювати
cp -r dir1 dir2      # Копіювати каталог
mv old.txt new.txt   # Перемістити/перейменувати
rm file.txt          # Видалити файл
rm -rf directory/    # Видалити каталог (ОБЕРЕЖНО!)
mkdir -p a/b/c       # Створити вкладені каталоги
touch newfile.txt    # Створити порожній файл

# Перегляд файлів
cat file.txt         # Весь файл
less file.txt        # Посторінково (q для виходу)
head -n 20 file.txt  # Перші 20 рядків
tail -n 20 file.txt  # Останні 20 рядків
tail -f logfile.log  # Follow (live)
```

## 🏢 Real World: Як це використовують у великих компаніях

```
┌─────────────────────────────────────────────────────────────────┐
│           ФАЙЛОВА СИСТЕМА В ENTERPRISE                          │
│                                                                 │
│   Netflix, Spotify, Google, Amazon:                            │
│   ├── /var/log/ → централізований збір логів (ELK Stack)       │
│   ├── /etc/ → конфігурація через Ansible/Puppet                │
│   ├── /opt/ → контейнеризовані додатки (Docker, K8s)           │
│   └── /mnt/ → монтування NFS/S3 для розподіленого зберігання   │
│                                                                 │
│   DevOps практики:                                              │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • FHS стандарт = передбачувана структура на 1000+ серверах│  │
│   │ • chmod 600 для secrets, 755 для скриптів                │   │
│   │ • Окремі розділи: /var, /home, /tmp (безпека + квоти)    │   │
│   │ • Read-only root filesystem в контейнерах                │   │
│   │ • tmpfs для /tmp (швидкість + автоочищення)              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Банки та фінтех:                                              │
│   • Аудит файлових операцій через auditd                       │
│   • Шифрування /home та sensitive directories                   │
│   • Immutable infrastructure: права 444 на конфіги             │
│                                                                 │
│   Cloud providers (AWS, GCP, Azure):                            │
│   • EBS/Persistent Disks монтуються як /dev/xvd*, /dev/sd*     │
│   • fstab автоматизація для auto-mount при старті EC2/VM       │
│   • Snapshot-based backup через Btrfs/LVM                      │
└─────────────────────────────────────────────────────────────────┘
```

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   Linux System Administrator                                    │
│   ├── Зарплата: $60,000 - $95,000 (EUR 55,000 - 85,000)        │
│   ├── Навички: FHS, permissions, mount, LVM, fsck              │
│   └── Задачі: управління дисками, квоти, backup                │
│                                                                 │
│   DevOps Engineer                                               │
│   ├── Зарплата: $80,000 - $140,000 (EUR 70,000 - 120,000)      │
│   ├── Навички: автоматизація прав, Infrastructure as Code      │
│   └── Задачі: Ansible для chmod/chown на 100+ серверів         │
│                                                                 │
│   Site Reliability Engineer (SRE)                               │
│   ├── Зарплата: $100,000 - $180,000 (EUR 90,000 - 150,000)     │
│   ├── Навички: filesystem monitoring, performance tuning       │
│   └── Задачі: inode exhaustion alerts, disk space automation   │
│                                                                 │
│   Cloud Infrastructure Engineer                                 │
│   ├── Зарплата: $90,000 - $160,000 (EUR 80,000 - 140,000)      │
│   ├── Навички: EBS, NFS, S3 mounting, persistent volumes       │
│   └── Задачі: storage provisioning, disaster recovery          │
│                                                                 │
│   Security Engineer                                             │
│   ├── Зарплата: $95,000 - $170,000 (EUR 85,000 - 145,000)      │
│   ├── Навички: SUID/SGID audit, permission hardening           │
│   └── Задачі: find SUID files, implement least privilege       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **OverTheWire Bandit** | Wargame для Linux CLI | overthewire.org/wargames/bandit |
| **Linux Journey** | Інтерактивний курс | linuxjourney.com |
| **Filesystem Hierarchy Standard** | Офіційна специфікація | refspecs.linuxfoundation.org/FHS_3.0 |
| **Katacoda/Killercoda** | Інтерактивні сценарії | killercoda.com |

### Книги

| Назва | Автор | Рівень |
|-------|-------|--------|
| "How Linux Works" | Brian Ward | Початковий-Середній |
| "The Linux Command Line" | William Shotts | Початковий |
| "UNIX and Linux System Administration" | Nemeth et al. | Просунутий |
| "Linux Bible" | Christopher Negus | Початковий-Середній |

### YouTube канали

| Канал | Фокус |
|-------|-------|
| **Learn Linux TV** | Системне адміністрування |
| **NetworkChuck** | Linux для початківців |
| **The Linux Experiment** | Linux новини та огляди |
| **tutoriaLinux** | DevOps та Linux |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                 LINUX FILESYSTEM CHEAT SHEET                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   КЛЮЧОВІ КАТАЛОГИ:                                            │
│   /etc      Конфігурація        /var/log   Логи                │
│   /home     Користувачі         /tmp       Тимчасові           │
│   /usr/bin  Програми            /dev       Пристрої            │
│   /proc     Процеси (virtual)   /sys       Hardware (virtual)  │
│                                                                 │
│   ПРАВА ДОСТУПУ:                                               │
│   r=4  w=2  x=1                                                │
│   755 = rwxr-xr-x (програми)    644 = rw-r--r-- (файли)       │
│   700 = rwx------ (приватне)    600 = rw------- (секрети)     │
│                                                                 │
│   КОМАНДИ:                                                      │
│   chmod 755 file     Змінити права                             │
│   chown user:group   Змінити власника                          │
│   ls -la             Показати права                            │
│   df -h              Вільне місце                              │
│   du -sh dir/        Розмір каталогу                           │
│   mount /dev/sdb1 /mnt  Змонтувати                             │
│   umount /mnt        Відмонтувати                              │
│   ln -s target link  Symbolic link                             │
│                                                                 │
│   СПЕЦІАЛЬНІ БІТИ:                                             │
│   SUID (4xxx) → виконується від імені власника                 │
│   SGID (2xxx) → успадкування групи                             │
│   Sticky (1xxx) → тільки власник може видалити                 │
│                                                                 │
│   ФАЙЛОВІ СИСТЕМИ:                                             │
│   ext4  → стандарт Linux        XFS   → великі файли           │
│   Btrfs → snapshots             tmpfs → в RAM                  │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Що означає філософія "Everything is a file" в Linux?** Як це застосовується до пристроїв (/dev/sda) та процесів (/proc)?

2. **Яка різниця між правами 755 та 644?** Коли використовується кожен варіант?

3. **Що таке SUID біт і чому /usr/bin/passwd його має?** Які ризики безпеки пов'язані з SUID?

4. **Чим відрізняється hard link від symbolic link?** Коли краще використовувати кожен тип?

5. **Для чого потрібен файл /etc/fstab?** Що станеться, якщо в ньому буде помилка?

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть скрипт-аналізатор дискового простору

Напишіть скрипт, який знаходить найбільші файли та каталоги, аналізує використання диска та виводить рекомендації. Це реальний інструмент для адміністрування!

**Кроки:**

1. Створіть скрипт:
```bash
mkdir -p ~/scripts
nano ~/scripts/disk-analyzer.sh
```

2. Напишіть код:
```bash
#!/bin/bash
# Disk Space Analyzer
# Знаходить "пожирачів" місця на диску

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              DISK SPACE ANALYZER                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Загальна інформація
echo "💾 DISK USAGE OVERVIEW"
df -h / /home 2>/dev/null | awk 'NR==1 || /\/$/ || /\/home/'
echo ""

# Розмір основних каталогів
echo "📁 TOP DIRECTORIES BY SIZE (this may take a moment...)"
echo "   Analyzing /home/$USER..."
du -sh ~/Documents ~/Downloads ~/Pictures ~/.cache ~/.local 2>/dev/null | sort -hr | head -10
echo ""

# Найбільші файли
echo "📄 TOP 10 LARGEST FILES IN HOME"
find ~ -type f -size +10M 2>/dev/null | head -20 | while read file; do
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    echo "   $size  $file"
done | sort -hr | head -10
echo ""

# Старі файли в Downloads
echo "📥 OLD FILES IN DOWNLOADS (>30 days)"
find ~/Downloads -type f -mtime +30 2>/dev/null | wc -l | xargs -I {} echo "   {} files older than 30 days"
echo ""

# Кеш
echo "🗑️ CACHE SIZES"
echo "   ~/.cache:          $(du -sh ~/.cache 2>/dev/null | cut -f1)"
echo "   Apt cache:         $(du -sh /var/cache/apt 2>/dev/null | cut -f1)"
echo "   Snap cache:        $(du -sh ~/snap 2>/dev/null | cut -f1)"
echo ""

# Trash
echo "🗂️ TRASH SIZE"
TRASH_SIZE=$(du -sh ~/.local/share/Trash 2>/dev/null | cut -f1)
echo "   Trash:             ${TRASH_SIZE:-empty}"
echo ""

# Рекомендації
echo "💡 RECOMMENDATIONS"
CACHE_MB=$(du -sm ~/.cache 2>/dev/null | cut -f1)
if [ "${CACHE_MB:-0}" -gt 1000 ]; then
    echo "   ⚠️  Cache is large (${CACHE_MB}MB). Consider: rm -rf ~/.cache/*"
fi

DOWNLOADS_OLD=$(find ~/Downloads -type f -mtime +30 2>/dev/null | wc -l)
if [ "$DOWNLOADS_OLD" -gt 10 ]; then
    echo "   ⚠️  $DOWNLOADS_OLD old files in Downloads. Review and clean up."
fi

if [ -n "$TRASH_SIZE" ] && [ "$TRASH_SIZE" != "0" ]; then
    echo "   ⚠️  Trash is not empty. Empty it: rm -rf ~/.local/share/Trash/*"
fi

echo ""
echo "📅 Report generated: $(date)"
```

3. Зробіть виконуваним та запустіть:
```bash
chmod +x ~/scripts/disk-analyzer.sh
~/scripts/disk-analyzer.sh
```

4. Створіть скрипт для очищення:
```bash
nano ~/scripts/disk-cleanup.sh
```

```bash
#!/bin/bash
# Safe Disk Cleanup Script

echo "🧹 Starting safe cleanup..."

# Показати що буде очищено
echo "Will clean:"
echo "  - APT cache"
echo "  - User cache older than 7 days"
echo "  - Trash"

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning APT cache..."
    sudo apt clean

    echo "Cleaning old cache files..."
    find ~/.cache -type f -mtime +7 -delete 2>/dev/null

    echo "Emptying trash..."
    rm -rf ~/.local/share/Trash/*

    echo "✅ Cleanup complete!"
    df -h /
fi
```

**Очікуваний результат:**
- Скрипт `~/scripts/disk-analyzer.sh` для аналізу
- Скрипт `~/scripts/disk-cleanup.sh` для очищення
- Розуміння, що займає місце на вашому диску

**Бонус (для допитливих):**
- Додайте аналіз журналів: `journalctl --disk-usage`
- Знайдіть дублікати файлів за допомогою `fdupes` або власного скрипта з `md5sum`
- Створіть cron job для щотижневого звіту: `crontab -e`
- Додайте інтерактивне видалення великих файлів з підтвердженням

## Підсумок

| Каталог | Призначення |
|---------|-------------|
| `/` | Корінь файлової системи |
| `/etc` | Конфігурація системи |
| `/home` | Домашні каталоги |
| `/var/log` | Системні логи |
| `/tmp` | Тимчасові файли |
| `/usr/bin` | Програми користувача |
| `/dev` | Файли пристроїв |
| `/proc`, `/sys` | Віртуальні ФС ядра |
| `/mnt`, `/media` | Точки монтування |

| Права | Числовий | Опис |
|-------|----------|------|
| `rwxr-xr-x` | 755 | Програми, скрипти |
| `rw-r--r--` | 644 | Звичайні файли |
| `rw-------` | 600 | Приватні файли |
| `rwxrwxrwx` | 777 | Всім все (небезпечно!) |

| Команда | Призначення |
|---------|-------------|
| `chmod` | Змінити права |
| `chown` | Змінити власника |
| `mount` | Змонтувати ФС |
| `umount` | Відмонтувати ФС |
| `ln -s` | Symbolic link |
| `df -h` | Вільне місце |
| `du -sh` | Розмір каталогу |

На наступній лекції — додаткові властивості робочого столу.
