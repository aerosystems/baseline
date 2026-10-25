---
course: 01-operating-systems
group: pz-25-1-9
lab: 6
student: "Дєтков Нікіта"
number: 7
variant: 7
---

<!--
  Принципи функціонування ОС Linux
  Варіант 7: Час останнього завантаження — `/var`, `/tmp`, `/proc` — `ps` — `systemd-timesyncd` — Порівняти `uptime` і `who -b`

  Тему, мету й обладнання писати не треба — конвеєр візьме їх із лабораторної.
  Знімки екрана кладіть у assets/, вихідний код — у src/.
  Контрольні питання — лише одного рівня, того, на який захищаєте роботу:
  заголовок «### Достатній рівень», далі «1 Текст питання?» і відповідь.
  Покрокова інструкція — reports/README.md
-->

## Хід роботи

1 Отримав у викладача номер індивідуального варіанта 7. За таблицею варіантів мені дістався такий набір: параметр системи — час останнього завантаження; каталоги FHS — `/var`, `/tmp`, `/proc`; команда для дослідження — `ps`; служба — `systemd-timesyncd`; додаткове завдання — порівняти вивід `uptime` і `who -b`. Роботу виконував на віртуальній машині VirtualBox з Ubuntu 24.04 LTS під обліковим записом nikita (член групи sudo), у терміналі bash. Усі команди нижче вводяться без початкового символу `$`.

2 Склав паспорт системи. Версію ядра визначив командою `uname -r`, архітектуру — командою `uname -m`, назву й версію дистрибутива прочитав із файлу `/etc/os-release` (командою `head -4 /etc/os-release`), ім'я вузла, тип віртуалізації, ядро й архітектуру разом вивів командою `hostnamectl` з фільтром `grep -E 'Static|Virt|Operating|Kernel|Arch'`, а час роботи системи показав командою `uptime`. Версія ядра (6.8.0) і версія дистрибутива (24.04.3) не збігаються: перша належить проєкту Linux, друга — Canonical. Суфікс `-71-generic` означає 71-шу збірку цього ядра в Ubuntu з конфігурацією для звичайних комп'ютерів. Значення `oracle` у полі Virtualization означає, що система працює у VirtualBox.

```text
nikita@ubuntu-vm:~$ 
6.8.0-71-generic

nikita@ubuntu-vm:~$ uname -m
x86_64

nikita@ubuntu-vm:~$ head -4 /etc/os-release
PRETTY_NAME="Ubuntu 24.04.3 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.3 LTS (Noble Numbat)"

nikita@ubuntu-vm:~$ hostnamectl | grep -E 'Static|Virt|Operating|Kernel|Arch'
 Static hostname: ubuntu-vm
  Virtualization: oracle
Operating System: Ubuntu 24.04.3 LTS
          Kernel: Linux 6.8.0-71-generic
    Architecture: x86-64

nikita@ubuntu-vm:~$ uptime
 11:47:22 up  2:16,  1 user,  load average: 0.21, 0.28, 0.25
```

Лістинг 1 - Паспорт системи

Таблиця 1 – Паспорт системи

| Показник | Команда | Результат |
|----------|---------|-----------|
| Версія ядра | `uname -r` | 6.8.0-71-generic |
| Дистрибутив | `head -4 /etc/os-release` | Ubuntu 24.04.3 LTS (Noble Numbat) |
| Архітектура | `uname -m` | x86_64 |
| Ім'я вузла | `hostnamectl` | ubuntu-vm |
| Тип віртуалізації | `hostnamectl` | oracle (VirtualBox) |
| Час роботи системи | `uptime` | 2 год 16 хв |

3 Знайшов значення параметра свого варіанта — часу останнього завантаження системи. Основна команда — `uptime -s`: ключ `-s` (since) виводить момент запуску системи у форматі «рік-місяць-день години:хвилини:секунди». Для перевірки використав ще три незалежні джерела: `who -b` (час завантаження із записів utmp), `last reboot | head -1` (запис про перезавантаження в журналі wtmp) та рядок `btime` у файлі `/proc/stat`, де час подано в секундах від 1 січня 1970 року, а перетворення в звичну дату виконала команда `date -d @значення`. Усі чотири способи дали один і той самий момент: система востаннє завантажилась 25 жовтня 2026 року о 09:31:08.

```text
nikita@ubuntu-vm:~$ uptime -s
2026-10-25 09:31:08

nikita@ubuntu-vm:~$ who -b
         system boot  2026-10-25 09:31

nikita@ubuntu-vm:~$ last reboot | head -1
reboot   system boot  6.8.0-71-generic Sun Oct 25 09:31   still running

nikita@ubuntu-vm:~$ grep btime /proc/stat
btime 1792913468

nikita@ubuntu-vm:~$ date -d @1792913468
Sun Oct 25 09:31:08 EET 2026
```

Лістинг 2 - Час останнього завантаження системи

4 Вивів перелік каталогів кореня командою `ls /`. Для трьох каталогів свого варіанта (`/var`, `/tmp`, `/proc`) переглянув вміст і права доступу командою `ls -ld /var /tmp /proc`, а також навів по одному файлу з кожного: `/var/log/dpkg.log`, власноруч створений `/tmp/lab6.txt` (командою `echo lab6 > /tmp/lab6.txt`) і `/proc/uptime`. У виводі `ls -ld` видно, що каталог `/tmp` має права `drwxrwxrwt`: літера `t` наприкінці — це sticky-біт, який дозволяє всім створювати в каталозі файли, але видаляти можна лише власні. Розмір `/proc` дорівнює нулю, бо цього каталогу на диску немає.

```text
nikita@ubuntu-vm:~$ ls /
bin                 lib                 proc                swap.img
bin.usr-is-merged   lib.usr-is-merged   root                sys
boot                lib64               run                 tmp
cdrom               lost+found          sbin                usr
dev                 media               sbin.usr-is-merged  var
etc                 mnt                 snap
home                opt                 srv

nikita@ubuntu-vm:~$ ls -ld /var /tmp /proc
drwxr-xr-x  14 root root 4096 Aug  7  2025 /var
drwxrwxrwt  17 root root 4096 Oct 25 11:49 /tmp
dr-xr-xr-x 318 root root    0 Oct 25 09:31 /proc

nikita@ubuntu-vm:~$ ls /var
backups  cache  crash  lib  local  lock  log  mail  opt  run  snap  spool  tmp

nikita@ubuntu-vm:~$ ls -l /var/log/dpkg.log
-rw-r--r-- 1 root root 412873 Oct 25 09:35 /var/log/dpkg.log

nikita@ubuntu-vm:~$ echo lab6 > /tmp/lab6.txt
nikita@ubuntu-vm:~$ ls -l /tmp/lab6.txt
-rw-rw-r-- 1 nikita nikita 5 Oct 25 11:49 /tmp/lab6.txt

nikita@ubuntu-vm:~$ ls -l /proc/uptime
-r--r--r-- 1 root root 0 Oct 25 11:50 /proc/uptime
```

Лістинг 3 - Каталоги кореня та каталоги варіанта

Таблиця 2 – Каталоги FHS свого варіанта

| Каталог | Призначення за FHS | Приклад файлу |
|---------|--------------------|---------------|
| `/var` | змінні дані, які змінюються під час роботи системи: журнали, кеші, черги, бази пакетного менеджера | `/var/log/dpkg.log` — журнал встановлення пакетів |
| `/tmp` | тимчасові файли програм і користувачів; вміст очищається під час перезавантаження | `/tmp/lab6.txt` — створений у роботі тестовий файл |
| `/proc` | віртуальна файлова система з відомостями про ядро та процеси; формується ядром у пам'яті | `/proc/uptime` — час роботи системи в секундах |

5 Дослідив команду свого варіанта `ps`. Командою `type ps` з'ясував, що `ps` не вбудована в оболонку, а є окремою програмою; `which ps` показала її виконуваний файл `/usr/bin/ps`; `whatis ps` вивела однорядковий опис «report a snapshot of the current processes». Розглянув три ключі команди: `-e` виводить усі процеси системи (а не лише процеси поточного терміналу); `-f` вмикає повний формат із колонками UID, PID, PPID, C, STIME, TTY, TIME, CMD; `-o` дозволяє самому вибрати колонки виводу (наприклад, `pid`, `lstart` — повний час запуску, `etime` — час, що минув від запуску, `comm` — ім'я команди). Саме ключ `-o` разом із `-p 1` дав ще один спосіб визначити час завантаження: процес із PID 1 запускається ядром на самому початку, тому його час запуску збігається з часом завантаження системи.

```text
nikita@ubuntu-vm:~$ type ps
ps is /usr/bin/ps

nikita@ubuntu-vm:~$ which ps
/usr/bin/ps

nikita@ubuntu-vm:~$ whatis ps
ps (1)               - report a snapshot of the current processes.

nikita@ubuntu-vm:~$ ps -e | head -3
    PID TTY          TIME CMD
      1 ?        00:00:03 systemd
      2 ?        00:00:00 kthreadd

nikita@ubuntu-vm:~$ ps -f -p 1
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 09:31 ?        00:00:03 /sbin/init splash

nikita@ubuntu-vm:~$ ps -p 1 -o pid,lstart,etime,comm
    PID                  STARTED     ELAPSED COMMAND
      1 Sun Oct 25 09:31:08 2026    02:20:41 systemd
```

Лістинг 4 - Дослідження команди ps

6 Знайшов засобами довідки команду, яка виконує задачу свого варіанта — показує, відколи працює система. Спершу спробував пошук за словом `apropos boot`, але він дав забагато результатів (близько двох десятків команд, пов'язаних із завантажувачем та initramfs). Тоді звузив пошук фразою з очікуваного опису: `apropos "been running"`. Серед результатів з'явилась команда `uptime`, її призначення уточнив через `whatis uptime`, а потім відкрив `man uptime` і в розділі OPTIONS знайшов ключ `-s, --since`, який виводить час, з якого система працює. Англійські слова для пошуку довелося добирати самому, бо описи сторінок man англійською.

```text
nikita@ubuntu-vm:~$ apropos "been running"
uptime (1)           - Tell how long the system has been running.

nikita@ubuntu-vm:~$ whatis uptime
uptime (1)           - Tell how long the system has been running.

nikita@ubuntu-vm:~$ man uptime
UPTIME(1)                User Commands                UPTIME(1)

NAME
       uptime - Tell how long the system has been running.
...
       -s, --since
              system up since, in yyyy-mm-dd HH:MM:SS format
```

Лістинг 5 - Пошук команди за допомогою apropos

7 Вивів відомості про свій обліковий запис командами `whoami`, `id` і `groups`. UID користувача — 1000, основна група — nikita (GID 1000), серед додаткових груп є `adm` (читання системних журналів) і `sudo`. Членство в групі `sudo` дає право виконувати окремі команди з правами root: команда `sudo -l` підтверджує, що дозволено все. Різницю доступу до файлу `/etc/shadow` показав так: `ls -l /etc/shadow` вивела права `-rw-r-----` (власник root, група shadow, решта доступу не мають), тому `head -1 /etc/shadow` без `sudo` завершилась повідомленням Permission denied, а `sudo head -1 /etc/shadow` після введення пароля вивела перший рядок файлу. Ядро перевіряє права під час кожного відкриття файлу, і `sudo` лише запускає команду від імені root.

```text
nikita@ubuntu-vm:~$ whoami
nikita

nikita@ubuntu-vm:~$ id
uid=1000(nikita) gid=1000(nikita) groups=1000(nikita),4(adm),27(sudo)

nikita@ubuntu-vm:~$ groups
nikita adm sudo

nikita@ubuntu-vm:~$ sudo -l
[sudo] password for nikita:
Matching Defaults entries for nikita on ubuntu-vm:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User nikita may run the following commands on ubuntu-vm:
    (ALL : ALL) ALL

nikita@ubuntu-vm:~$ ls -l /etc/shadow
-rw-r----- 1 root shadow 1487 Aug 12  2025 /etc/shadow

nikita@ubuntu-vm:~$ head -1 /etc/shadow
head: cannot open '/etc/shadow' for reading: Permission denied

nikita@ubuntu-vm:~$ sudo head -1 /etc/shadow
root:*:20318:0:99999:7:::
```

Лістинг 6 - Відомості про обліковий запис і різниця доступу з sudo та без нього

8 Отримав перелік процесів і визначив процес із PID 1 командою `ps -p 1 -o pid,comm`: це `systemd`. Структуру дерева процесів переглянув командою `ps -ef --forest | head -5`: процес 1 запущений як `/sbin/init splash` (на Ubuntu це посилання на systemd), а потоки ядра стоять під процесом `kthreadd` із PID 2 і виводяться в квадратних дужках. Перелік служб у стані running отримав командою `systemctl list-units --type=service --state=running --no-legend | head -5`. Докладний стан служби свого варіанта вивів командою `systemctl status systemd-timesyncd --no-pager`: служба має стан `active (running)`, увімкнена в автозавантаження (`enabled`) і запустилась одразу після завантаження системи, о 09:31:12, тобто через кілька секунд після старту ядра. Службу не довелося встановлювати, бо `systemd-timesyncd` входить до складу Ubuntu. Додатково командою `timedatectl` перевірив, що годинник синхронізовано: це важливо, бо від точності системного часу залежить і правильність виведеного часу завантаження.

```text
nikita@ubuntu-vm:~$ ps -p 1 -o pid,comm
    PID COMMAND
      1 systemd

nikita@ubuntu-vm:~$ ps -ef --forest | head -5
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 09:31 ?        00:00:03 /sbin/init splash
root           2       0  0 09:31 ?        00:00:00 [kthreadd]
root           3       2  0 09:31 ?        00:00:00  \_ [pool_workqueue_release]
root           4       2  0 09:31 ?        00:00:00  \_ [kworker/R-rcu_g]

nikita@ubuntu-vm:~$ systemctl list-units --type=service --state=running --no-legend | head -5
  NetworkManager.service     loaded active running Network Manager
  accounts-daemon.service    loaded active running Accounts Service
  avahi-daemon.service       loaded active running Avahi mDNS/DNS-SD Stack
  cron.service               loaded active running Regular background program processing daemon
  dbus.service               loaded active running D-Bus System Message Bus

nikita@ubuntu-vm:~$ systemctl status systemd-timesyncd --no-pager
● systemd-timesyncd.service - Network Time Synchronization
     Loaded: loaded (/usr/lib/systemd/system/systemd-timesyncd.service; enabled; preset: enabled)
     Active: active (running) since Sun 2026-10-25 09:31:12 EET; 2h 22min ago
       Docs: man:systemd-timesyncd.service(8)
   Main PID: 612 (systemd-timesyn)
     Status: "Contacted time server 185.125.190.58:123 (ntp.ubuntu.com)."
      Tasks: 2 (limit: 4545)
     Memory: 1.6M (peak: 2.2M)
        CPU: 183ms
     CGroup: /system.slice/systemd-timesyncd.service
             └─612 /usr/lib/systemd/systemd-timesyncd

nikita@ubuntu-vm:~$ timedatectl | grep -E 'synchronized|NTP'
System clock synchronized: yes
              NTP service: active
```

Лістинг 7 - Процеси та стан служби systemd-timesyncd

9 Отримав три показники стану системи з віртуальної файлової системи `/proc`: час роботи в секундах (`cat /proc/uptime`), середнє навантаження (`cat /proc/loadavg`) і загальний обсяг оперативної пам'яті (`grep MemTotal /proc/meminfo`). У `/proc/uptime` перше число — секунди від завантаження (8742 с — це 2 год 25 хв 42 с, що збігається з часом із пункту 3), друге — сумарний час простою всіх ядер процесора. У `/proc/loadavg` перші три числа — середнє навантаження за 1, 5 і 15 хвилин, далі кількість виконуваних і всіх потоків, а останнє число — PID, виданий найпізніше. Команда `ls -l` показує для цих файлів розмір 0, хоча `cat` виводить дані. Причина в тому, що `/proc` не зберігається на диску: ядро формує вміст файлів у пам'яті щоразу в момент читання. Це наочно ілюструє принцип «все є файлом»: відомості про ядро читаються звичайною командою `cat`.

```text
nikita@ubuntu-vm:~$ cat /proc/uptime
8742.31 33991.05

nikita@ubuntu-vm:~$ cat /proc/loadavg
0.18 0.24 0.23 1/487 5921

nikita@ubuntu-vm:~$ grep MemTotal /proc/meminfo
MemTotal:        4012672 kB

nikita@ubuntu-vm:~$ ls -l /proc/uptime /proc/loadavg /proc/meminfo
-r--r--r-- 1 root root 0 Oct 25 11:57 /proc/loadavg
-r--r--r-- 1 root root 0 Oct 25 11:57 /proc/meminfo
-r--r--r-- 1 root root 0 Oct 25 11:57 /proc/uptime
```

Лістинг 8 - Показники з файлової системи /proc

10 Виконав додаткове завдання варіанта №7: порівняв вивід `uptime` і `who -b`. Для цього запустив `uptime` (поточний час і тривалість роботи), `uptime -p` (тривалість словами), `uptime -s` (абсолютний час запуску) та `who -b` (час останнього завантаження). Порівняння показало, що ці команди відповідають на різні запитання: `uptime` повідомляє, скільки часу система працює (2 год 27 хв), а `who -b` — коли саме вона завантажилась (09:31). Обидва результати узгоджуються: 09:31 плюс 2 год 27 хв дорівнює 11:58, тобто поточному часу. Відмінності такі. По-перше, `uptime` обчислює тривалість за лічильником ядра (`/proc/uptime`), а `who -b` читає запис про завантаження з файлу utmp, який записується один раз під час старту. По-друге, `who -b` показує час із точністю до хвилини, а `uptime -s` — до секунди. По-третє, якщо системний годинник після завантаження було скориговано (наприклад, службою `systemd-timesyncd` при синхронізації), час у записі utmp може відрізнятися від обчисленого `uptime -s` на кілька секунд або навіть хвилин; у моєму випадку розбіжності немає.

```text
nikita@ubuntu-vm:~$ uptime
 11:58:40 up  2:27,  1 user,  load average: 0.15, 0.20, 0.21

nikita@ubuntu-vm:~$ uptime -p
up 2 hours, 27 minutes

nikita@ubuntu-vm:~$ uptime -s
2026-10-25 09:31:08

nikita@ubuntu-vm:~$ who -b
         system boot  2026-10-25 09:31
```

Лістинг 9 - Порівняння uptime і who -b

11 Оформив звіт і зробив висновок.

## Відповіді на контрольні питання

### Достатній рівень

1 Чому версія ядра й версія дистрибутива не збігаються? Що показує кожна з них?

Linux у вузькому розумінні — це лише ядро, яке розробляє окремий проєкт, а дистрибутив збирає інша організація з ядра, системних утиліт, менеджера пакетів і програм та додає власну політику оновлень. Тому в мене ядро має версію 6.8.0-71-generic, а дистрибутив — Ubuntu 24.04.3 LTS. Версія ядра (`uname -r`) говорить про підтримку обладнання й системні можливості, а версія дистрибутива (`/etc/os-release`) — про склад програм і термін підтримки. Ядро в межах одного дистрибутива оновлюється частіше, ніж змінюється сам випуск дистрибутива, тому ці числа не збігаються й не мають збігатися.

2 Чому `cd` є вбудованою командою оболонки, а `ls` — окремою програмою?

Окрема програма виконується у дочірньому процесі, створеному системним викликом `fork`, і змінила б поточний каталог лише самому цьому процесу, а після її завершення оболонка залишилась би в старому каталозі. Тому команди, які змінюють стан самої оболонки (`cd`, `export`, `exit`), мусять бути вбудованими. Команда `ls` лише читає вміст каталогу й виводить його, тож їй окремий процес не заважає: це звичайна програма `/usr/bin/ls`, яку оболонка знаходить у каталогах зі змінної `PATH`. Перевірити природу будь-якої команди можна через `type`.

3 Чим `man` відрізняється від `--help` і коли зручніший кожен із них?

`man` відкриває повну сторінку посібника, поділену на розділи (NAME, SYNOPSIS, DESCRIPTION, OPTIONS, EXAMPLES, SEE ALSO), з усіма ключами, форматами та прикладами; сторінки бувають з різних розділів, наприклад `man 5 passwd` описує файл `/etc/passwd`. Ключ `--help` виводить стислий перелік ключів, який подає сама програма, тому він завжди відповідає встановленій версії. `--help` зручніший, коли треба швидко згадати назву ключа, а `man` — коли треба зрозуміти, як працює команда, і побачити всі можливості та приклади. Деякі вбудовані команди оболонки не мають сторінок man, для них є `help ім'я`.

4 Чому каталоги `/proc` і `/sys` не займають місця на диску?

Це віртуальні файлові системи: їхні файли не зберігаються на жодному носії, а створюються ядром у пам'яті в момент звернення. Коли програма читає, наприклад, `/proc/uptime`, ядро на льоту обчислює значення й повертає його як вміст файлу. Тому `ls -l` показує для таких файлів розмір 0, хоча `cat` виводить дані, а сам каталог `/proc` у моєму випадку має розмір 0 і дату, що збігається з часом завантаження. Каталог `/proc` дає відомості про ядро та процеси, а `/sys` — про пристрої й драйвери.

5 Чому повсякденна робота від імені root вважається помилкою? Що дає `sudo` натомість?

Користувач root має необмежені права, тому одна описка (наприклад, зайвий пробіл у `rm -rf`) або запуск шкідливої програми може знищити систему чи дані без жодного попередження. Крім того, при роботі під root у журналі не видно, яка саме людина виконала дію. Команда `sudo` піднімає права лише для однієї команди, потребує пароля користувача, а факт підвищення записує в журнал (його можна переглянути через `journalctl _COMM=sudo`). Хто має право на `sudo`, задає файл `/etc/sudoers`: в Ubuntu це члени групи `sudo`, а вхід у систему під root за паролем вимкнено.

6 Запишіть команду, яка покаже п'ять найбільших каталогів у `/var`.

Команда: `sudo du -h --max-depth=1 /var | sort -rh | head -n 6`. Утиліта `du` із ключем `--max-depth=1` підраховує розмір кожного підкаталогу першого рівня (`-h` виводить розміри в зручному вигляді — К, М, Г), `sort -rh` сортує рядки за людиночитними числами в порядку спадання (`-r` — зворотний порядок, `-h` — розуміє суфікси К, М, Г), а `head -n 6` залишає шість рядків. Беруться шість, бо перший рядок — це сумарний розмір самого `/var`, а решта п'ять — і є п'ять найбільших підкаталогів. `sudo` потрібен, тому що частина підкаталогів `/var` недоступна звичайному користувачеві.

7 Що показує `systemctl status` для служби і які поля в ньому найважливіші?

Команда показує стан служби systemd: коротке описання, шлях до файлу опису, стан у поточний момент, головний процес, використання ресурсів, групу керування (cgroup) та кілька останніх рядків журналу цієї служби. Найважливіші поля: `Loaded` (де лежить файл служби, чи вона `enabled` — запускається під час завантаження, чи `disabled`), `Active` (поточний стан: `active (running)`, `inactive (dead)` чи `failed`, і з якого моменту) та `Main PID` (ідентифікатор головного процесу). Окремо важливі останні рядки журналу внизу, бо саме вони найчастіше містять причину збою. У моєму випадку служба `systemd-timesyncd` мала стан `active (running)` і статус «Contacted time server» — тобто контакт із сервером часу встановлено.

8 Як за допомогою `apropos` знайти команду, призначення якої відоме, а ім'я — ні?

Команда `apropos` шукає задане слово в назвах і коротких описах усіх сторінок man, тому треба сформулювати англійською ключові слова з опису задачі: `apropos "been running"`, `apropos copy`, `apropos "list directory"`. Якщо результатів забагато, слід звузити пошук точнішою фразою або обмежити розділ (`apropos -s 1 слово` — лише команди користувача), а для кількох слів одночасно скористатися ключем `-a` (`apropos -a boot time`). Після знаходження кандидата перевіряють його через `whatis ім'я`, а детально читають через `man ім'я`. Саме так у цій роботі за описом «скільки часу працює система» було знайдено команду `uptime`. Якщо `apropos` нічого не знаходить, база сторінок може бути не створена: її оновлює команда `sudo mandb`.

## Висновок

За цю лабораторну роботу я на практиці розібрався з будовою Linux: навчився визначати версію ядра командою `uname -r` і версію дистрибутива за файлом `/etc/os-release` та з'ясував, чим ядро відрізняється від дистрибутива. Опанував орієнтування в структурі каталогів за стандартом FHS (зокрема призначення `/var`, `/tmp` і `/proc`), роботу з командою `ps` та її ключами `-e`, `-f` і `-o`, а також отримання довідки через `man`, `--help`, `whatis` і `apropos`. Дізнався різницю між вбудованими командами оболонки й окремими програмами (`type`, `which`), побачив, як `sudo` змінює доступ до захищеного файлу `/etc/shadow`, і дослідив процес із PID 1 та службу `systemd-timesyncd` засобами `systemctl`. Параметр свого варіанта — час останнього завантаження системи (25 жовтня 2026 року, 09:31:08) — визначив чотирма способами (`uptime -s`, `who -b`, `last reboot` і `/proc/stat`) та порівняв вивід `uptime` і `who -b`. Читання `/proc/uptime`, `/proc/loadavg` і `/proc/meminfo` наочно показало принцип «все є файлом»: ядро подає свої внутрішні відомості у вигляді файлів, які не займають місця на диску й читаються звичайною командою `cat`.