Option Explicit
Dim fso, folder, f, ts, total, cnt
Set fso = CreateObject("Scripting.FileSystemObject")
Set folder = fso.GetFolder(fso.GetParentFolderName(WScript.ScriptFullName) & "\src")
Set ts = fso.CreateTextFile(fso.GetParentFolderName(WScript.ScriptFullName) & "\out\out.txt", True, True) ' True = Unicode
total = 0 : cnt = 0
For Each f In folder.Files
    ts.WriteLine f.Name & vbTab & f.Size & " bytes" & vbTab & f.DateLastModified
    total = total + f.Size
    cnt = cnt + 1
Next
ts.WriteLine "Total: " & cnt & " files, " & total & " bytes"
ts.Close
WScript.Echo "Done: " & cnt & " files"