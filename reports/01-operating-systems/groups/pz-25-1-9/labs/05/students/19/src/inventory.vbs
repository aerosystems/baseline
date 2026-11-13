Option Explicit
Dim fso, baseDir, srcFolder, reportStream, file, totalBytes

Set fso = CreateObject("Scripting.FileSystemObject")
baseDir = fso.GetParentFolderName(WScript.ScriptFullName)

If Not fso.FolderExists(baseDir & "\src") Then
    WScript.Echo "Помилка: Каталог src не знайдено."
    WScript.Quit 1
End If

If Not fso.FolderExists(baseDir & "\out") Then
    fso.CreateFolder baseDir & "\out"
End If

Set srcFolder = fso.GetFolder(baseDir & "\src")
' Третій аргумент True задає запис файлу у кодуванні Unicode (UTF-16 LE)
Set reportStream = fso.CreateTextFile(baseDir & "\out\out.txt", True, True)

totalBytes = 0
reportStream.WriteLine "=== Звіт інвентаризації каталогу src ==="
reportStream.WriteLine "Сформовано: " & Now
reportStream.WriteLine "------------------------------------------------------------"
reportStream.WriteLine "Ім'я файлу" & vbTab & "Розмір (байт)" & vbTab & "Дата зміни"

For Each file In srcFolder.Files
    reportStream.WriteLine file.Name & vbTab & file.Size & vbTab & file.DateLastModified
    totalBytes = totalBytes + file.Size
Next

reportStream.WriteLine "------------------------------------------------------------"
reportStream.WriteLine "Всього файлів: " & srcFolder.Files.Count & ", Загальний обсяг: " & totalBytes & " байт"
reportStream.Close

WScript.Echo "Звіт успішно збережено у: out\out.txt"
WScript.Quit 0
