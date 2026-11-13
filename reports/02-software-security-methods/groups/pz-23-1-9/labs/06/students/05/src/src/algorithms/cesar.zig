const std = @import("std");
const Io = std.Io;

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key: u8 = getKey(key_str) orelse return false;

    for (source) |ch| {
        try sink.writeByte(@intCast(@mod(@as(u16, ch) + key, 256)));
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key: u8 = getKey(key_str) orelse return false;

    for (source) |ch| {
        const plain: u8 = @intCast(@mod(@as(i32, ch) - key, 256));
        try sink.writeByte(plain);
    }
    return true;
}

fn getKey(key_str: []const u8) ?u8 {
    const key: u8 = std.fmt.parseInt(u8, key_str, 10) catch {
        std.debug.print("Key must be a number\n", .{});
        return null;
    };
    if (key >= 256) {
        std.debug.print("Key must be a in range [0; 256)\n", .{});
        return null;
    }
    return key;
}
