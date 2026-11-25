//! https://en.wikipedia.org/wiki/Two-square_cipher
//! Key format: <first_keyword>,<second_keyword>
const std = @import("std");
const Io = std.Io;
const util = @import("util/bigrams.zig");

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const top, const btm = getKey(key_str) orelse return false;

    // std.debug.print("Bigrams:", .{});

    var it: util.BigramIter = .init(source, false); // As of different squares there is no
                                                      // need to add 'x' between same letters
    while (it.next()) |bigram| {
        // std.debug.print(" {c}{c}", .{bigram[0], bigram[1]});

        const y1, const x1 = util.matrixYX(&top, bigram[0]);
        const y2, const x2 = util.matrixYX(&btm, bigram[1]);

        var crypted: [2]u8 = undefined;
        if (x1 == x2) { // Same column
            crypted[0] = top[16 * ((y1 + 1) % 16) + x1];
            crypted[1] = btm[16 * ((y2 + 1) % 16) + x2];
        } else { // Rectangle
            crypted[0] = top[(16 * y1) + x2];
            crypted[1] = btm[(16 * y2) + x1];
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

    const top, const btm = getKey(key_str) orelse return false;
    for (0..source.len/2) |i| {
        const ch1 = source[i*2];
        const ch2 = source[i*2+1];

        const y1, const x1 = util.matrixYX(&top, ch1);
        const y2, const x2 = util.matrixYX(&btm, ch2);

        var plain: [2]u8 = undefined;
        if (x1 == x2) { // Same column
            plain[0] = top[16 * ((y1 + 15) % 16) + x1];
            plain[1] = btm[16 * ((y2 + 15) % 16) + x2];
        } else { // Rectangle
            plain[0] = top[(16 * y1) + x2];
            plain[1] = btm[(16 * y2) + x1];
        }
        try sink.writeAll(&plain);
    }


    return true;
}

fn getKey(key_str: []const u8) ?struct{[16*16]u8, [16*16]u8} {
    const sep_i = std.mem.findScalar(u8, key_str, ',') orelse {
        std.debug.print("Key must be in format '<first_keyword>;<second_keyword>'\n", .{});
        return null;
    };

    const top_mat = util.makeMatrix(key_str[0..sep_i]) orelse return null;
    const btm_mat = util.makeMatrix(key_str[sep_i+1..]) orelse return null;

    std.debug.print("Top matrix:\n", .{});
    util.printMatrix(&top_mat);

    std.debug.print("Bottom matrix:\n", .{});
    util.printMatrix(&btm_mat);

    return .{top_mat, btm_mat};
}
