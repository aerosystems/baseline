const assert = @import("std").debug.assert;

/// Find inversed intager in modular arithmetic
/// (num * inversed(num)) % base == 1
pub fn inversed(num: anytype, base: anytype) ?@TypeOf(num, base) {
    const T = @TypeOf(num, base);

    const ST = if (@typeInfo(T).int.signedness != .signed)
        @Int(.signed, @typeInfo(T).int.bits + 1)
    else
        T;

    const gcd, const x, _ = egcd(@as(ST, @mod(num, base)), @as(ST, base));

    return if (gcd == 1) @as(T, @intCast(@mod(x, base))) else null;
}

/// Extended Greatest Common Divisor
/// s < b
fn egcd(s: anytype, b: anytype) struct{@TypeOf(s, b), @TypeOf(s, b), @TypeOf(s, b)} {
    if (@typeInfo(@TypeOf(s, b)).int.signedness != .signed) {
        @compileError("egcd does not work with signed intagers");
    }
    if (s == 0) return .{b, 0, 1};
    assert(s < b);

    const gcd, const x1, const y1 = egcd(@mod(b, s), s);
    const x = y1 - x1 * @divTrunc(b, s);
    const y = x1;
    return .{gcd, x, y};
}
