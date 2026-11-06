//! Like table_keyword but with second keyword for rows
//! Key format: <rows_key>,<cols_key>
const std = @import("std");
const Io = std.Io;
const util = @import("util/table_keyword.zig");

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    return crypt(false, key_str, source, sink);
}
pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    return crypt(true, key_str, source, sink);
}

pub fn crypt(decr: bool, key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str, decr) orelse return false;
    const rows_order = key.row.@"0"[0..key.row.@"1"];
    const cols_order = key.col.@"0"[0..key.col.@"1"];

    const iter_len = rows_order.len * cols_order.len;

    for (0..@divFloor(source.len + iter_len - 1, iter_len)) |i| {
        for (cols_order) |col_i| {
            for (rows_order) |row_i| {
                const idx = i * iter_len + row_i * cols_order.len + col_i;
                if (decr) {
                    const plain = source[idx];
                    try sink.writeByte(plain);
                } else {
                    const crypted = if (idx < source.len) source[idx]
                    else 0;
                    try sink.writeByte(crypted);
                }
            }
        }
    }
    return true;
}


const Key = struct{row: util.Key, col: util.Key};

fn getKey(key_str: []const u8, decr: bool) ?Key {
    const sep_i = std.mem.findScalar(u8, key_str, ',') orelse {
        std.debug.print("Key must be in format '<rows_keyword>,<columns_keyword>'\n", .{});
        return null;
    };
    const row_key, const col_key = if (decr)
        .{util.getKey(key_str[0..sep_i]),
          util.getKey(key_str[sep_i+1..])}
    else
        .{util.getDecrKey(key_str[sep_i+1..]),
          util.getDecrKey(key_str[0..sep_i])};


    return .{
        .row = row_key orelse return null,
        .col = col_key orelse return null,
    };
}
