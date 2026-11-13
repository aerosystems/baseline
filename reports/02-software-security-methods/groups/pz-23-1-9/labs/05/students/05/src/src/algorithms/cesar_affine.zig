//! Modified cesar cipher, uses multiply instead of add
//! Key has 2 components: coefficient,base
//! Multiply letter by coefficient and add base
const std = @import("std");
const Io = std.Io;
const util = @import("util/affine.zig");

const Key = struct {
    coef: u8,
    base: u8,
};

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;

    for (source) |ch| {
        const crypted: u8 = @intCast(@mod(@as(u32, ch) * key.coef + key.base, 256));
        try sink.writeByte(crypted);
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;

    for (source) |ch| {
        const plain: u8 =
            @intCast(@mod((@as(i32, ch) - key.base) * util.inversed(key.coef, 256).?,
                          256));
        try sink.writeByte(plain);
    }
    return true;
}

fn getKey(key_str: []const u8) ?Key {
    const sep_i = std.mem.findScalar(u8, key_str, ',') orelse {
        std.debug.print("Key must be in format 'coefficient,base'\n", .{});
        return null;
    };

    const key = Key{
        .coef = std.fmt.parseInt(u8, key_str[0..sep_i], 10) catch {
            std.debug.print("Coefficient needs to be a number\n", .{});
            return null;
        },
        .base = std.fmt.parseInt(u8, key_str[sep_i+1..], 10) catch {
            std.debug.print("Base needs to be a number\n", .{});
            return null;
        },
    };

    if (key.base >= 256) {
        std.debug.print("Base ({}) needs to be a in range [0; 256)\n", .{key.base});
        return null;
    }
    if (key.coef < 2) {
        std.debug.print("Coefficient must be greater then one\n", .{});
        return null;
    }
    if (util.findGcd(key.coef, 256) != 1) {
        std.debug.print("Coefficient ({}) and number of bytes (256) must be coprime\n", .{key.coef});
        return null;
    }

    return key;
}
