//! https://en.wikipedia.org/wiki/Playfair_cipher
//! Encrypt to coordinates on 16x16 matrix.
const std = @import("std");
const Io = std.Io;
const util = @import("util/bigrams.zig");

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const mat = getKey(key_str) orelse return false;

    // std.debug.print("Bigrams:", .{});

    var it: util.BigramIter = .init(source, true);
    while (it.next()) |bigram| {
        // std.debug.print(" {c}{c}", .{bigram[0], bigram[1]});

        const y1, const x1 = util.matrixYX(&mat, bigram[0]);
        const y2, const x2 = util.matrixYX(&mat, bigram[1]);
        std.debug.assert(y1 != y2 or x1 != x2);

        var crypted: [2]u8 = undefined;
        if (y1 == y2) { // Same row
            crypted[0] = mat[(16 * y1) + (x1 + 1) % 16];
            crypted[1] = mat[(16 * y2) + (x2 + 1) % 16];
        } else if (x1 == x2) { // Same column
            crypted[0] = mat[16 * ((y1 + 1) % 16) + x1];
            crypted[1] = mat[16 * ((y2 + 1) % 16) + x2];
        } else { // Rectangle
            crypted[0] = mat[(16 * y1) + x2];
            crypted[1] = mat[(16 * y2) + x1];
        }
        try sink.writeAll(&crypted);
    }

    // std.debug.print("\n", .{});

    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    if (source.len % 2 != 0) {
        std.debug.print("Text length is not even\n", .{});
        return false;
    }

    const mat = getKey(key_str) orelse return false;
    for (0..source.len/2) |i| {
        const ch1 = source[i*2];
        const ch2 = source[i*2+1];

        // Check for text to be really playfair encrypted
        const y1, const x1 = util.matrixYX(&mat, ch1);
        const y2, const x2 = util.matrixYX(&mat, ch2);
        if (y1 == y2 and x1 == x2) {
            std.debug.print("Pair consists of same characters\n", .{});
            return false;
        }

        var plain: [2]u8 = undefined;
        if (y1 == y2) { // Same row
            plain[0] = mat[(16 * y1) + (x1 + 15) % 16]; // (x + 15) % 16 == (x - 1) % 16
            plain[1] = mat[(16 * y2) + (x2 + 15) % 16];
        } else if (x1 == x2) { // Same column
            plain[0] = mat[16 * ((y1 + 15) % 16) + x1];
            plain[1] = mat[16 * ((y2 + 15) % 16) + x2];
        } else { // Rectangle
            plain[0] = mat[(16 * y1) + x2];
            plain[1] = mat[(16 * y2) + x1];
        }
        try sink.writeAll(&plain);
    }
    return true;
}

pub fn getKey(key_str: []const u8) ?[16*16]u8 {
    const mat = util.makeMatrix(key_str) orelse return null;
    std.debug.print("Matrix:\n", .{});
    util.printMatrix(&mat);
    return mat;
}
