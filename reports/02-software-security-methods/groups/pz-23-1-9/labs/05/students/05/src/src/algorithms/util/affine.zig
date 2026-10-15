/// Greatest Common Divisor (there is also std.math.gcd in standard library)
pub fn findGcd(a: i32, b: i32) i32 {
    return if (a == 0) b else findGcd(@mod(b, a), a);
}

/// Find inversed intager in modular arithmetic
/// (num * inversed(num)) % base == 1
pub fn inversed(num: i32, base: i32) ?i32 {
    const gcd, const x, _ = egcd(@mod(num, base), base);
    return if (gcd == 1) @mod(x, base) else null;
}

/// Extended Greatest Common Divisor
pub fn egcd(smol: i32, big: i32) struct{i32, i32, i32} {
    if (smol == 0) return .{big, 0, 1};
    const gcd, const down_smol_c, const down_big_c = egcd(@mod(big, smol), smol);
    const smol_c = down_big_c - @divTrunc(big, smol) * down_smol_c;
    const big_c = down_smol_c;
    return .{gcd, smol_c, big_c};
}
