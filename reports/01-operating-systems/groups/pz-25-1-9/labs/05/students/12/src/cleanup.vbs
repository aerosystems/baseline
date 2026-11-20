Option Explicit
Dim fso, folder, f, days, preview, path, removed, i, a
days = 30 : preview = False : path = ""

' Аргументи: <каталог> <днів> [/preview]
If WScript.Arguments.Count < 2 Then
    WScript.Echo "Usage: cscript cleanup.vbs <folder> <days> [/preview]"
    WScript.Quit 2
End If
path = WScript.Arguments(0)
If Not IsNumeric(WScript.Arguments(1)) Then
    WScript.Echo "Error: days must be a number."
    WScript.Quit 3
End If
days = CLng(WScript.Arguments(1))
For i = 2 To WScript.Arguments.Count - 1
    If LCase(WScript.Arguments(i)) = "/preview" Then preview = True
Next

Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists(path) Then
    WScript.Echo "Error: folder not found: " & path
    WScript.Quit 1
End If

Set folder = fso.GetFolder(path)
removed = 0
For Each f In folder.Files
    If DateDiff("d", f.DateLastModified, Now) > days Then
        If preview Then
            WScript.Echo "[PREVIEW] would delete: " & f.Name & " (" & f.DateLastModified & ")"
        Else
            On Error Resume Next
            f.Delete True
            If Err.Number <> 0 Then
                WScript.Echo "Error deleting " & f.Name & ": " & Err.Description
                Err.Clear
            Else
                WScript.Echo "Deleted: " & f.Name
            End If
            On Error GoTo 0
        End If
        removed = removed + 1
    End If
Next
If preview Then
    WScript.Echo "Preview: " & removed & " file(s) older than " & days & " days."
Else
    WScript.Echo "Removed: " & removed & " file(s) older than " & days & " days."
End If
WScript.Quit 0