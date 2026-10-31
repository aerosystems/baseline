Option Explicit

Dim fso, baseDir, srcPath, dstPath, mask, overwriteFlag
Dim srcFolder, file, logStream
Dim copiedCount, skippedCount, totalFound, targetFilePath

Set fso = CreateObject("Scripting.FileSystemObject")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 1. Перевірка наявності аргументів командного рядка
If WScript.Arguments.Count < 1 Then
    WScript.Echo "Помилка 2: Відсутні обов'язкові аргументи."
    WScript.Echo "Використання: cscript //nologo task4_copier.vbs <розширення> [перезапис: 1|0]"
    WScript.Echo "Приклад:     cscript //nologo task4_copier.vbs log 0"
    WScript.Quit 2
End If

mask = LCase(Trim(WScript.Arguments(0)))

' Прапорець перезапису (за замовчуванням 1 = дозволено)
overwriteFlag = True
If WScript.Arguments.Count >= 2 Then
    If WScript.Arguments(1) = "0" Then
        overwriteFlag = False
    End If
End If

srcPath = baseDir & "\src"
dstPath = baseDir & "\out\copied"

' 2. Перевірка та підготовка каталогів
On Error Resume Next
If Not fso.FolderExists(srcPath) Then
    WScript.Echo "Помилка 76: Каталог джерела не знайдено: " & srcPath
    WScript.Quit 1
End If

If Not fso.FolderExists(baseDir & "\out") Then fso.CreateFolder baseDir & "\out"
If Not fso.FolderExists(dstPath) Then fso.CreateFolder dstPath

If Err.Number <> 0 Then
    WScript.Echo "Помилка файлової системи: " & Err.Description
    Err.Clear
    WScript.Quit 1
End If
On Error Goto 0

' 3. Відкриття файлу журналу для додавання (8 = ForAppending, True = Create, -1 = Unicode)
Set logStream = fso.OpenTextFile(baseDir & "\out\copylog.txt", 8, True, -1)
logStream.WriteLine "============================================================"
logStream.WriteLine "Сесія копіювання: " & Now
logStream.WriteLine "Маска: *." & mask & " | Перезапис: " & overwriteFlag
logStream.WriteLine "------------------------------------------------------------"

Set srcFolder = fso.GetFolder(srcPath)
copiedCount = 0
skippedCount = 0
totalFound = 0

' 4. Обробка файлів за маскою
For Each file In srcFolder.Files
    If LCase(fso.GetExtensionName(file.Name)) = mask Or mask = "*" Then
        totalFound = totalFound + 1
        targetFilePath = dstPath & "\" & file.Name
        
        If fso.FileExists(targetFilePath) Then
            If overwriteFlag Then
                On Error Resume Next
                fso.CopyFile file.Path, targetFilePath, True
                If Err.Number = 0 Then
                    logStream.WriteLine "[ПЕРЕЗАПИСАНО] " & file.Name & " (" & file.Size & " байт)"
                    WScript.Echo "[ПЕРЕЗАПИСАНО] " & file.Name
                    copiedCount = copiedCount + 1
                Else
                    logStream.WriteLine "[ПОМИЛКА] " & file.Name & ": " & Err.Description
                    WScript.Echo "[ПОМИЛКА] " & file.Name & ": " & Err.Description
                    Err.Clear
                End If
                On Error Goto 0
            Else
                logStream.WriteLine "[ПРОПУЩЕНО] Файл вже існує: " & file.Name
                WScript.Echo "[ПРОПУЩЕНО] " & file.Name & " (вже існує в out\copied)"
                skippedCount = skippedCount + 1
            End If
        Else
            On Error Resume Next
            fso.CopyFile file.Path, targetFilePath, False
            If Err.Number = 0 Then
                logStream.WriteLine "[СКОПІЙОВАНО] " & file.Name & " (" & file.Size & " байт)"
                WScript.Echo "[СКОПІЙОВАНО] " & file.Name
                copiedCount = copiedCount + 1
            Else
                logStream.WriteLine "[ПОМИЛКА] " & file.Name & ": " & Err.Description
                WScript.Echo "[ПОМИЛКА] " & file.Name & ": " & Err.Description
                Err.Clear
            End If
            On Error Goto 0
        End If
    End If
Next

logStream.WriteLine "Підсумок: знайдено " & totalFound & ", скопійовано/перезаписано " & copiedCount & ", пропущено " & skippedCount
logStream.Close

WScript.Echo "Операція завершена. Звіт записано в out\copylog.txt"
WScript.Quit 0
