const std = @import("std");
const Io = std.Io;

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;
    return crypt(key, source, sink);
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getDecrKey(key_str) orelse return false;
    return crypt(key, source, sink);
}

fn crypt(key: [256]u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    for (source) |ch| {
        try sink.writeByte(key[ch]);
    }
    return true;
}

/// Create map of letter to encrypted
fn getKey(key_str: []const u8) ?[256]u8 {
    var moved: [256]bool = @splat(false);
    var key: [256]u8 = undefined;
    for (0..key.len) |i| key[i] = @as(u8, @intCast(i));

    var key_i: usize = 0;

    // Move unique letters from input key to the beginning of key
    for (key_str) |ch| {
        if (!moved[ch]) {
            moved[ch] = true;
            key[key_i] = ch;
            key_i += 1;
        }
    }
    // Add rest of letters
    for (0..key.len) |ch_usize| {
        const ch: u8 = @intCast(ch_usize);
        if (!moved[ch]) {
            key[key_i] = ch;
            key_i += 1;
        }
    }
    return key;
}

/// Create backward-map: encrypted letter to plain
fn getDecrKey(key_str: []const u8) ?[256]u8 {
    const enc_key = getKey(key_str) orelse return null;
    var key: [enc_key.len]u8 = undefined;
    for (enc_key, 0..) |ch, i| {
        key[ch] = @intCast(i);
    }
    return key;
}
