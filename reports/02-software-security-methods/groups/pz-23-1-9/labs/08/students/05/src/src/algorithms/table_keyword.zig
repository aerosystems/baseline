//! Keyword letters order determine columns writting/reading order
const std = @import("std");
const Io = std.Io;
const util = @import("util/table_keyword.zig");

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const order, const cols = util.getKey(key_str) orelse return false;
    const cols_order = order[0..cols];

    const rows = @divFloor(source.len + cols - 1, cols);

    for (cols_order) |col_i| {
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
    const order, const rows = util.getDecrKey(key_str) orelse return false;
    const rows_order = order[0..rows];

    const cols = @divFloor(source.len + rows - 1, rows);

    for (0..cols) |col_i| {
        for (rows_order) |row_i| {
            const plain = source[row_i * cols + col_i];
            try sink.writeByte(plain);
        }
    }

    return true;
}
