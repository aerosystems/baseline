Option Explicit
Dim net, arg
Set net = CreateObject("WScript.Network")
If WScript.Arguments.Count > 0 Then
    arg = WScript.Arguments(0)
Else
    arg = "user"
End If
WScript.Echo "Hello, " & arg & "!" & vbCrLf & _
             "Script: " & WScript.ScriptName & vbCrLf & _
             "Host: " & net.ComputerName