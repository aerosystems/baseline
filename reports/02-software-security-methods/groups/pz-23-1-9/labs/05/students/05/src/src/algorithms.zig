const std = @import("std");
const Io = std.Io;
const global = @import("global.zig");

const crypt_algos = struct {
    pub const cesar                  = @import("algorithms/cesar.zig");
    pub const cesar_affine           = @import("algorithms/cesar_affine.zig");
    pub const cesar_keyword          = @import("algorithms/cesar_keyword.zig");
    pub const table_simple           = @import("algorithms/table_simple.zig");
    pub const table_keyword          = @import("algorithms/table_keyword.zig");
    pub const table_double_transpose = @import("algorithms/table_double_transpose.zig");
    pub const polibius_square        = @import("algorithms/polibius_square.zig");
    pub const playfair               = @import("algorithms/playfair.zig");
    pub const playfair_double        = @import("algorithms/playfair_double.zig");
    pub const des                    = @import("algorithms/des.zig");
};

pub const OpType = enum{encrypt, decrypt};
pub const AlgoType = std.meta.DeclEnum(crypt_algos);

pub fn runCryptAlgoOnFiles(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, in: Io.File, out: Io.File
) !bool {
    const in_len = try in.length(global.io);
    const in_buf: []u8 = try global.gpa.alloc(u8, in_len);
    defer global.gpa.free(in_buf);
    _ = in.readStreaming(global.io, &.{in_buf}) catch |e|
        if (e != error.EndOfStream) return e;

    var out_buf: [1024]u8 = undefined;
    var sink = out.writer(global.io, &out_buf);

    const succeed = try runCryptAlgo(algo_type, op_type, key, in_buf, &sink.interface);
    if (succeed) try sink.flush();
    return succeed;
}

pub fn runCryptAlgo(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, source: []const u8, sink: *Io.Writer
) Io.Writer.Error!bool {
    return switch (algo_type) {
        inline else => |algo| switch(op_type) {
            inline else => |op|
                @field(@field(crypt_algos, @tagName(algo)), @tagName(op))(key, source, sink),
        },
    };
}
