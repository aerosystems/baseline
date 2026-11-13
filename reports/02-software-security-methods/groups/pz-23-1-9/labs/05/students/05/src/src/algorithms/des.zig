//! Type u1 is cursed, it breaks everything!
const std = @import("std");
const Io = std.Io;

fn roundFn(key: u48, br: u32) u32 {
    // Extending br right half to 48 bits
    const ebr = permutate(br, u48, &E);

    // Key mixing
    const mixed = ebr ^ key;

    // Reducing each mixed 6bits to 4bits using round S-box
    var sbox: u32 = 0;
    for (0..8) |i| {
        const b6: u6 = @truncate(mixed >> @intCast(i * 6));
        const row: u2 = @intCast((((b6 >> 5) & 1) << 1) | (b6 & 0b1));
        const col: u4 = @truncate(b6 >> 1);
        sbox += @as(u32, S[i][row][col]) << @intCast(i * 4);
    }

    // S-box permutation
    sbox = permutate(sbox, u32, &P);

    return sbox;
}

pub fn encrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    return crypt(false, key_str, source, sink);
}

pub fn decrypt(key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    return crypt(true, key_str, source, sink);
}

pub fn crypt(decr: bool, key_str: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str) orelse return false;

    var it = BlockIter.init(source);

    while (it.next()) |block| {
        // Block halves
        var bl: u32 = @truncate(block >> 32);
        var br: u32 = @truncate(block);

        for (0..16) |round| {
            const tmp = br;
            br = bl ^ roundFn(key[if (decr) 16-round-1 else round], br);
            bl = tmp;
        }

        const res: u64 = (@as(u64, br) << 32) | bl; // Connect with transposition
        const unpermutated = permutate(res, u64, FP);

        try sink.writeInt(u64, unpermutated, .big);
    }

    return true;
}

/// Key is string representation of 64 bit hexadecimal number
fn getKey(key_str: []const u8) ?[16]u48 {
    const key64 = std.fmt.parseInt(u64, key_str, 16) catch |e| {
        std.debug.print("Error parsing intager: {t}\n", .{e});
        return null;
    };

    const k56 = permutate(key64, u56, &RIK);
    var c: u28 = @truncate(k56 >> 28);
    var d: u28 = @truncate(k56);

    var keys: [16]u48 = undefined;
    const shifts = [16]usize{1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1};

    for (0..16) |i| {
        c = std.math.rotl(u28, c, shifts[i]);
        d = std.math.rotl(u28, d, shifts[i]);
        const cd = (@as(u56, c) << 28) | d;

        keys[i] = permutate(cd, u48, &RRK);
        // std.debug.print("Key {0}: hex: {1X}; binary: {1b}\n", .{i+1, keys[i]});
    }

    return keys;
}

/// Create digit from another with same or different size using permutation table
fn permutate(src: anytype, comptime Dst: type, comptime tbl: anytype) Dst {
    const src_bits = @bitSizeOf(@TypeOf(src));
    const dst_bits = @bitSizeOf(Dst);

    if (tbl.len != dst_bits) @compileError("table length must equal destination bit width");

    var dst: Dst = 0;
    for (tbl, 1..) |pos, i| {
        const bit = (src >> @intCast(src_bits - pos)) & 1;
        dst |= @as(Dst, @intCast(bit)) << @intCast(dst_bits - i);
    }
    return dst;
}

/// Iterate over permutated blocks 64 bit length
const BlockIter = struct {
    text: []const u8,

    pub fn init(text: []const u8) BlockIter {
        return .{.text = text};
    }

    pub fn next(it: *BlockIter) ?u64 {
        if (it.text.len == 0) return null;

        const srcv = it.text[0..@min(8, it.text.len)];
        it.text = it.text[srcv.len..];

        var src: u64 = 0;
        for (srcv, 1..) |byte, i| {
            src |= @as(u64, byte) << @intCast((8 - i) * 8);
        }
        return permutate(src, u64, IP);
    }
};

const IP = [64]u8{ // Initial Permutation of bits
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17,  9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7,
};

const FP = [64]u8{ // Final Permutation of bits
    40, 8, 48, 16, 56, 24, 64, 32,
    39, 7, 47, 15, 55, 23, 63, 31,
    38, 6, 46, 14, 54, 22, 62, 30,
    37, 5, 45, 13, 53, 21, 61, 29,
    36, 4, 44, 12, 52, 20, 60, 28,
    35, 3, 43, 11, 51, 19, 59, 27,
    34, 2, 42, 10, 50, 18, 58, 26,
    33, 1, 41,  9, 49, 17, 57, 25,
};

const RIK = [56]u8{ // Reduce Input Key: 64 to 56 bits
    57, 49, 41, 33, 25, 17,  9,
     1, 58, 50, 42, 34, 26, 18,
    10,  2, 59, 51, 43, 35, 27,
    19, 11,  3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
     7, 62, 54, 46, 38, 30, 22,
    14,  6, 61, 53, 45, 37, 29,
    21, 13,  5, 28, 20, 12,  4,
};

const RRK = [48]u8{ // Reduce Round Key: 56 to 48 bits
    14, 17, 11, 24,  1,  5,
     3, 28, 15,  6, 21, 10,
    23, 19, 12,  4, 26,  8,
    16,  7, 27, 20, 13,  2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32,
};

const E = [48]u8{ // Extension
    32,  1,  2,  3,  4,  5,
     4,  5,  6,  7,  8,  9,
     8,  9, 10, 11, 12, 13,
    12, 13, 14, 15, 16, 17,
    16, 17, 18, 19, 20, 21,
    20, 21, 22, 23, 24, 25,
    24, 25, 26, 27, 28, 29,
    28, 29, 30, 31, 32,  1
};

const P = [32]u8{ // Round permutation
    16,  7, 20, 21, 29, 12, 28, 17,
     1, 15, 23, 26,  5, 18, 31, 10,
     2,  8, 24, 14, 32, 27,  3,  9,
    19, 13, 30,  6, 22, 11,  4, 25,
};

const S = [8][4][16]u4{ // S-blocks
    .{
        .{14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7},
        .{0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8},
        .{4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0},
        .{15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13},
    }, .{
        .{15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10},
        .{3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5},
        .{0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15},
        .{13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9},
    }, .{
        .{10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8},
        .{13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1},
        .{13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7},
        .{1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12},
    }, .{
        .{7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15},
        .{13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9},
        .{10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4},
        .{3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14},
    }, .{
        .{2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9},
        .{14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6},
        .{4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14},
        .{11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3},
    }, .{
        .{12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11},
        .{10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8},
        .{9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6},
        .{4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13},
    }, .{
        .{4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1},
        .{13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6},
        .{1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2},
        .{6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12},
    }, .{
        .{13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7},
        .{1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2},
        .{7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8},
        .{2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11},
    },
};
