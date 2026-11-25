//! If you think about it, hash algorithm is also an encryption algorithm,
//! but without decryption.
//! Key is ignored for now, use - in arguments.
//! Maybe it has sense to make key to be the size of algorithm: sha256, 512, ...
const std = @import("std");
const Io = std.Io;
const print = std.debug.print;
const global = @import("../global.zig");
const rotr = std.math.rotr;

const chunk_bytes = 512 / 8;   // what size the text must be multiple of (after transformations)
const tail_len_sz = 64 / 8; // length of text appended at the end of text


pub fn encrypt(
    key: []const u8, source: []const u8, sink: *Io.Writer
) (std.mem.Allocator.Error || Io.Writer.Error)!bool {
    _ = key;

    const buf = try padSource(source);
    defer global.gpa.free(buf);

    // try sink.writeAll(buf);

    const hash = computeHash(buf);

    for (hash) |chunk| {
        try sink.printInt(chunk, 16, .lower, .{.width = 8, .fill = '0'});
    }

    return true;
}


/// Add padding and length suffix
fn padSource(source: []const u8) std.mem.Allocator.Error![]u8 {
    var blocks: usize = @divCeil(source.len, chunk_bytes);
    var after_end_bytes: usize = blocks * chunk_bytes - source.len;

    // Ensure to be enough bytes for length and padding
    if (after_end_bytes < tail_len_sz + 1) {
        blocks += 1;
        after_end_bytes += chunk_bytes;
    }

    // Text buffer with right len for length and etc
    const buf = try global.gpa.alloc(u8, blocks * chunk_bytes);
    errdefer global.gpa.free(buf);

    @memcpy(buf[0..source.len], source);

    // Add padding
    buf[source.len] = 0b10000000;
    @memset(buf[source.len+1..], 0);

    // Add length suffix. Length in bits
    const length = std.mem.nativeToBig(u64, @as(u64, source.len)*8);
    @memcpy(buf[buf.len-8..], @as([*]const u8, @ptrCast(&length)));

    return buf;
}


/// Computes hash from padded message
fn computeHash(buf: []const u8) [8]u32 {
    // Initial hash values
    // First 32 bits of the fractional parts of the square roots of the first 8 primes
    var hash = [8]u32{
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    };

    // Iterate over chunks
    for (0..buf.len/chunk_bytes) |chnk_i| {
        var w: [64]u32 = @splat(0); // Message schedule

        // Copy first 16 words from chunk
        for (0..16) |word_i| {
            w[word_i] = std.mem.readInt(u32, buf[chnk_i*chunk_bytes + word_i*4..][0..4], .big);
        }
        // Extend 16 words to 63 words
        for (16..64) |i| {
            const s0 = rotr(u32, w[i-15], 7) ^ rotr(u32, w[i-15], 18) ^ (w[i-15] >> 3);
            const s1 = rotr(u32, w[i-2], 17) ^ rotr(u32, w[i-2], 19)  ^ (w[i-2] >> 10);
            w[i] = w[i-16] +% s0 +% w[i-7] +% s1;
        }

        var h = hash; // compressed chunk, start from current hash

        // Compression loop
        for (0..64) |i| {
            const s1 = rotr(u32, h[4], 6) ^ rotr(u32, h[4], 11) ^ rotr(u32, h[4], 25);
            const ch = (h[4] & h[5]) ^ (~h[4] & h[6]);
            const temp1 = h[7] +% s1 +% ch +% k[i] +% w[i];

            const s0 = rotr(u32, h[0], 2) ^ rotr(u32, h[0], 13) ^ rotr(u32, h[0], 22);
            const maj = (h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2]);
            const temp2 = s0 +% maj;

            h = [8]u32{
                temp1 +% temp2,
                h[0],
                h[1],
                h[2],
                h[3] +% temp1,
                h[4],
                h[5],
                h[6],
            };
        }
        // Add compressed chunk to final result
        hash[0] +%= h[0];
        hash[1] +%= h[1];
        hash[2] +%= h[2];
        hash[3] +%= h[3];
        hash[4] +%= h[4];
        hash[5] +%= h[5];
        hash[6] +%= h[6];
        hash[7] +%= h[7];
    }
    return hash;
}

// Round constants
// First 32 bits of the fractional parts of the cube roots of the first 64 primes
const k = [64]u32{
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
};
