const std = @import("std");
pub const inversed = @import("affine.zig").inversed;

pub fn genPrime(T: type, random: std.Random) T {
    const bits = @typeInfo(T).int.bits;

    while (true) {
        const candidate = random.intRangeAtMost(
            T, @as(T, 1) << (bits-1), ~@as(T, 0)
        ) | 1; // make odd
        if (isPrime(candidate, random)) return candidate;
    }
}

// pub fn isPrime(num: anytype) bool {
//     var div: @TypeOf(num) = 2;
//     while (div < @divTrunc(num, 2) + 1) : (div += 1) {
//         if (@rem(num, div) != 0) return false;
//     }
//     return true;
// }

pub fn isPrime(num: anytype, random: std.Random) bool {
    if (num == 2 or num == 3) return true;
    if (num < 2 or num % 2 == 0) return false;

    // num-1 as 2^r * d
    var d = num - 1;
    var r: usize = 0;
    while (d % 2 == 0) : (r += 1) {
        d /= 2;
    }

    const test_rounds = 10;

    for (0..test_rounds) |_| {
        var x = modPow(random.intRangeAtMost(@TypeOf(num), 2, num-2), // [2; num-2]
                       d, num);
        if (x == 1 or x == num - 1) continue;

        const composite = find_composite: for (0..r-1) |_| {
            x = modPow(x, 2, num);
            if (x == num - 1) {
                break :find_composite false;
            }
        } else true;

        if (composite) return false;
    }
    return true;
}

pub fn modPow(base: anytype, exp: anytype, mod: anytype) @TypeOf(base, exp, mod) {
    const T = @TypeOf(base, exp, mod);
    if (@typeInfo(T).int.signedness != .unsigned) {
        @compileError("Only unsigned type is supported");
    }
    const MT = @Int(.unsigned, @typeInfo(T).int.bits * 2); // Type for safe multiplying

    var res: T = 1;
    var b: T = base % mod;
    var e: T = exp;

    while (e > 0) {
        if (e & 1 == 1) {
            res = @intCast((@as(MT, res) * b) % mod);
        }
        e >>= 1;
        b = @intCast((@as(MT, b) * b) % mod);
    }

    return res;
}
