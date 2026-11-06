//! Decryption key: 2 prime numbers
const std = @import("std");
const Io = std.Io;
const print = std.debug.print;
const global = @import("../global.zig");
const util = @import("util/rsa.zig");
const BlockIter = @import("util/block_iter.zig").BlockIter;

const Key = u2048;
const Prime = @Int(.unsigned, @typeInfo(Key).int.bits / 2);

const key_file_len = (@typeInfo(Key).int.bits / 8) * 2;

pub fn genKeys(pub_sink: *Io.Writer, priv_sink: *Io.Writer) Io.Writer.Error!void {
    var rng = std.Random.DefaultPrng.init(
        @bitCast(@as(i64, @truncate(std.Io.Timestamp.now(global.io, .real).nanoseconds)))
    );
    const random = rng.random();

    // Generate 2 prime numbers
    const p = util.genPrime(Prime, random);
    var q = util.genPrime(Prime, random);
    while (q == p) q = util.genPrime(Prime, random);

    const n: Key = @as(Key, p) * q; // Part of public and private key
    const phi: Key = @as(Key, p - 1) * (q - 1);

    // Open exponent
    // var e: Key = 65537; // Part of public key
    // if (e >= phi) e = 17;
    // while (std.math.gcd(e, phi) != 1) e += 2;

    // Generate maximum size open exponent, embrase chaos!
    var e = phi - 1;
    while (std.math.gcd(e, phi) != 1) e -= 1;

    // The only private part of key
    // We have e as part of public key, so the only thing keeping us private is phi
    // for which to get from n we need to find its simple multipliers, which is very expensive,
    // so we must be safe.
    const d = util.inversed(e, phi).?; // Part of private key

    try pub_sink.writeInt(Key, n, .big);
    try pub_sink.writeInt(Key, e, .big);

    try priv_sink.writeInt(Key, n, .big);
    try priv_sink.writeInt(Key, d, .big);
}

fn readKey(key: []const u8) ?struct{Key, Key} {
    if (key.len != key_file_len) {
        print("Key file is wrong length! It is {} bytes, but must be {}\n",
              .{key.len, key_file_len});
        return null;
    }
    var key_sink = Io.Reader.fixed(key);
    return .{
        key_sink.takeInt(Key, .big) catch unreachable,
        key_sink.takeInt(Key, .big) catch unreachable,
    };
}

pub fn encrypt(pub_key: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const n, const e = readKey(pub_key) orelse return false;

    var iter: BlockIter((@typeInfo(Key).int.bits / 8) / 2) = .init(source);
    while (iter.next()) |block| {
        const C: Key = util.modPow(@as(Key, block), e, n);
        try sink.writeInt(Key, C, .big);
    }

    return true;
}

pub fn decrypt(priv_key: []const u8, source: []const u8, sink: *Io.Writer) Io.Writer.Error!bool {
    const n, const d = readKey(priv_key) orelse return false;

    var iter: BlockIter(@typeInfo(Key).int.bits / 8) = .init(source);
    while (iter.next()) |block| {
        const P: Key = util.modPow(block, d, n);
        const Pblock = std.math.cast(Prime, P) orelse {
            print("Failed to cast intager to block size. Probably key is wrong\n", .{});
            return false;
        };
        try sink.writeInt(Prime, Pblock, .big);
    }

    return true;
}
