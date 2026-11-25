Option Explicit
Dim name

If WScript.Arguments.Count > 0 Then
    name = WScript.Arguments(0)
Else
    name = "користувач"
End If

WScript.Echo "Привіт, " & name & "!"
WScript.Echo "Сценарій: " & WScript.ScriptName
WScript.Echo "Хост: " & WScript.FullName
WScript.Quit 0
