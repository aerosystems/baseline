//! https://en.wikipedia.org/wiki/Polybius_square
//! Encrypt to coordinates on 16x16 matrix.
const std = @import("std");
const Io = std.Io;
const util = @import("util/bigrams.zig");

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const mat = getKey(key_str) orelse return false;

    for (source) |ch| {
        const y, const x = util.matrixYX(&mat, ch);
        try sink.print("{d}{d}", .{y, x});
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const src = std.mem.trim(u8, source, " \n");
    if (src.len % 2 != 0) {
        std.debug.print("Text length is not even\n", .{});
        return false;
    }

    const mat = getKey(key_str) orelse return false;

    for (0..src.len/2) |i| {
        const y_ch = src[i*2];
        const x_ch = src[i*2+1];
        if (y_ch < '0' or y_ch > '9' or x_ch < '0' or x_ch > '9') {
            std.debug.print("Text should consist only of digits\n", .{});
            return false;
        }
        const y = y_ch - '0';
        const x = x_ch - '0';
        try sink.print("{u}", .{mat[y*16 + x]});
    }
    return true;
}

pub fn getKey(key_str: []const u8) ?[16*16]u8 {
    const mat = util.makeMatrix(key_str) orelse return null;
    std.debug.print("Matrix:\n", .{});
    util.printMatrix(&mat);
    return mat;
}
