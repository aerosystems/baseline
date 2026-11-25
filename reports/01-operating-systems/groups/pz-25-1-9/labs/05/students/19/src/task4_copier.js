var fso = new ActiveXObject("Scripting.FileSystemObject");
var baseDir = fso.GetParentFolderName(WScript.ScriptFullName);

if (WScript.Arguments.length < 1) {
    WScript.Echo("Використання: cscript //nologo task4_copier.js <розширення> [перезапис: 1|0]");
    WScript.Quit(2);
}

var mask = WScript.Arguments(0).toLowerCase();
var overwrite = true;
if (WScript.Arguments.length >= 2 && WScript.Arguments(1) === "0") {
    overwrite = false;
}

var srcPath = baseDir + "\\src";
var dstPath = baseDir + "\\out\\copied";

if (!fso.FolderExists(srcPath)) {
    WScript.Echo("Помилка 76: Каталог src не знайдено.");
    WScript.Quit(1);
}

if (!fso.FolderExists(baseDir + "\\out")) fso.CreateFolder(baseDir + "\\out");
if (!fso.FolderExists(dstPath)) fso.CreateFolder(dstPath);

var logStream = fso.OpenTextFile(baseDir + "\\out\\copylog_js.txt", 8, true, -1);
logStream.WriteLine("--- JScript Copy Session: " + new Date().toLocaleString() + " ---");

var folder = fso.GetFolder(srcPath);
var files = new Enumerator(folder.Files);
var copied = 0, skipped = 0;

for (; !files.atEnd(); files.moveNext()) {
    var file = files.item();
    var ext = fso.GetExtensionName(file.Name).toLowerCase();

    if (ext === mask || mask === "*") {
        var target = dstPath + "\\" + file.Name;
        if (fso.FileExists(target)) {
            if (overwrite) {
                fso.CopyFile(file.Path, target, true);
                logStream.WriteLine("[OVERWRITTEN] " + file.Name);
                WScript.Echo("[OVERWRITTEN] " + file.Name);
                copied++;
            } else {
                logStream.WriteLine("[SKIPPED] " + file.Name);
                WScript.Echo("[SKIPPED] " + file.Name);
                skipped++;
            }
        } else {
            fso.CopyFile(file.Path, target, false);
            logStream.WriteLine("[COPIED] " + file.Name);
            WScript.Echo("[COPIED] " + file.Name);
            copied++;
        }
    }
}

logStream.WriteLine("Підсумок: скопійовано " + copied + ", пропущено " + skipped);
logStream.Close();
WScript.Echo("JScript копіювання завершено успішно.");
WScript.Quit(0);
