//! Keyword processing functions for table_keyword and table_double_transpose cyphers
const std = @import("std");

pub const key_max_len = 30;
pub const Key = struct{[key_max_len]usize, usize};

pub fn getKey(key_str: []const u8) ?Key {
    var keyword: [key_max_len]u8 = undefined;
    var len: usize = 0;
    for (key_str) |ch| {
        if (len >= key_max_len) {
            std.debug.print("Key length is limited to {}\n", .{key_max_len});
            return null;
        }
        keyword[len] = ch;
        len += 1;
    }

    if (len < 2) {
        std.debug.print("Keyword must be at least 2 characters long", .{});
        return null;
    }

    // Reduce letters alphabetic number to relative alphabetic order
    var key: [key_max_len]usize = undefined;
    for (0..len) |i| {
        const min_i = std.mem.findMin(u8, keyword[0..len]);
        key[min_i] = i;
        keyword[min_i] = std.math.maxInt(u8);
    }

    return .{key, len};
}

pub fn getDecrKey(key_str: []const u8) ?Key {
    const enc_key, const len = getKey(key_str) orelse return null;
    var key: [key_max_len]usize = undefined;

    for (0..len) |i| {
        key[enc_key[i]] = i;
    }

    return .{key, len};
}
