//! Functions bigram cyphers: polibius, playfair and playfair_double

const std = @import("std");
const Io = std.Io;

pub fn makeMatrix(keyword: []const u8) ?[16*16]u8 {
    var moved: [16*16]bool = @splat(false);
    var key: [16*16]u8 = undefined;
    var key_i: usize = 0;

    // Move unique letters from input key to the beginning of key
    for (keyword) |ch| {
        if (!moved[ch]) {
            moved[ch] = true;
            key[key_i] = ch;
            key_i += 1;
        }
    }
    // Add rest of letters
    for (0..key.len) |ch| {
        if (!moved[ch]) {
            key[key_i] = @intCast(ch);
            key_i += 1;
        }
    }

    return key;
}

pub fn printMatrix(mat: *const [16*16]u8) void {
    for (0..16) |i| {
        for (0..16) |j| {
            std.debug.print("{:>3} ", .{mat.*[i*16 + j]});
        }
        std.debug.print("\n", .{});
    }
}

pub fn matrixYX(mat: *const [16*16]u8, ch: u8) struct{usize, usize} {
    const idx = find_idx: for (mat, 0..) |mat_ch, i| {
        if (ch == mat_ch) break :find_idx i;
    } else unreachable;
    return .{idx / 16, idx % 16};
}

const special = 'x';
const special2 = 'X'; // Use if both letters in bigram == special

// Itarate over bigrams, inserting special char between same chars or
// to make entire length even
pub const BigramIter = struct {
    text: []const u8,
    pos: usize,
    ensure_diff: bool, // Ensure letters in bigram are different

    pub fn init(text: []const u8, ensure_diff: bool) BigramIter {
        return .{
            .text = text,
            .pos = 0,
            .ensure_diff = ensure_diff,
        };
    }
    pub fn next(it: *BigramIter) ?[2]u8 {
        if (it.pos >= it.text.len) {
            return null;
        }

        var bg: [2]u8 = .{it.text[it.pos], undefined};

        it.pos += 1;
        if (it.pos >= it.text.len) {
            bg[1] = special;
        } else if (it.ensure_diff and it.text[it.pos] == bg[0]) {
            bg[1] = if (bg[0] == special) special2 else special;
        } else {
            bg[1] = it.text[it.pos];
            it.pos += 1;
        }

        return bg;
    }
};
