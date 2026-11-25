//! Iterate over blocks of text adding zeroes to incomplete block
pub fn BlockIter(comptime block_size: u16) type {
    return struct {
        text: []const u8,

        pub fn init(text: []const u8) @This() {
            return .{.text = text};
        }

        pub fn next(it: *@This()) ?@Int(.unsigned, block_size * 8) {
            const T = @Int(.unsigned, block_size * 8);

            if (it.text.len == 0) return null;

            // Take block
            const srcv = it.text[0..@min(block_size, it.text.len)];
            it.text = it.text[srcv.len..];

            // To single intager
            var src: T = 0;
            for (srcv, 1..) |byte, i| {
                src |= @as(T, byte) << @intCast((block_size - i) * 8);
            }
            return src;
        }
    };
}
