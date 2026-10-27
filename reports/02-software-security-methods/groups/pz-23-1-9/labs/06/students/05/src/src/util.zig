const std = @import("std");
const Io = std.Io;


/// Take unicode codepoint from source
/// Return null if next sequence is not a valid codepoint
pub fn takeCp(source: *Io.Reader) Io.Reader.Error!?u21 {
    const first = try source.peekByte();
    const cp_len = std.unicode.utf8ByteSequenceLength(first) catch return null;

    const cp = switch (cp_len) {
        1 => first,
        inline 2...4 => |n| @field(std.unicode, "utf8Decode"++.{@as(u8, n) + '0'})(
            (source.peekArray(n) catch |e| switch (e) {
                error.EndOfStream => return null,
                else => return e,
            }).*
        ) catch return null,
        else => unreachable,
    };

    source.toss(cp_len);
    return cp;
}
