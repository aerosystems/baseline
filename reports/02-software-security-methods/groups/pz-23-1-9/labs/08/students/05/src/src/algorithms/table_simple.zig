//! Write by rows, read by cols
const std = @import("std");
const Io = std.Io;

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const cols = getKey(key_str) orelse return false;
    const rows = @divFloor(source.len + cols - 1, cols);

    // Treat source like 2d array with width "cols"
    for (0..cols) |col_i| {
        for (0..rows) |row_i| {
            const idx = row_i * cols + col_i;

            const crypted = if (idx < source.len) source[idx]
                            else 0;

            try sink.writeByte(crypted);
        }
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const cols = getKey(key_str) orelse return false;
    const rows = @divFloor(source.len + cols - 1, cols);

    for (0..rows) |row_i| {
        for (0..cols) |col_i| {
            const plain = source[col_i * rows + row_i];
            try sink.writeByte(plain);
        }
    }

    return true;
}

fn getKey(key_str: []const u8) ?u8 {
    const key: u8 = std.fmt.parseInt(u8, key_str, 10) catch {
        std.debug.print("Key needs to be a number\n", .{});
        return null;
    };
    if (key == 0) {
        std.debug.print("Table width can not be zero\n", .{});
        return null;
    }
    return key;
}
