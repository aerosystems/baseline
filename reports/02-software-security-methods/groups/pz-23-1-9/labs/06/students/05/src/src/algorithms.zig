const std = @import("std");
const Io = std.Io;
const global = @import("global.zig");

const algos = struct {
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
    pub const rsa                    = @import("algorithms/rsa.zig");
};

pub const OpType = enum{encrypt, decrypt};
pub const AlgoType = std.meta.DeclEnum(algos);

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
) (Io.Dir.ReadFileAllocError || Io.Writer.Error)!bool {
    if (isAsymetricAlgo(algo_type)) {
        const key_contents = try Io.Dir.cwd().readFileAlloc(global.io, key, global.gpa, .unlimited);
        defer global.gpa.free(key_contents);
        return try runAlgoWithKey(algo_type, op_type, key_contents, source, sink);
    } else {
        return try runAlgoWithKey(algo_type, op_type, key, source, sink);
    }
}

fn runAlgoWithKey(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, source: []const u8, sink: *Io.Writer
) Io.Writer.Error!bool {
    return switch (algo_type) {
        inline else => |algo| switch(op_type) {
            inline else => |op|
                @field(@field(algos, @tagName(algo)), @tagName(op))(key, source, sink),
        },
    };
}

pub fn runGenKeys(
    algo_type: AlgoType,
    pub_key_path: []const u8,
    priv_key_path: []const u8
) !void {
    if (!isAsymetricAlgo(algo_type)) return error.NotAnAsymetricAlgorithm;

    var pub_key_file = try Io.Dir.cwd().createFile(global.io, pub_key_path, .{});
    defer pub_key_file.close(global.io);
    var pub_key_buf: [512]u8 = undefined;
    var pub_key_sink = pub_key_file.writer(global.io, &pub_key_buf);

    var priv_key_file = try Io.Dir.cwd().createFile(global.io, priv_key_path, .{});
    defer priv_key_file.close(global.io);
    var priv_key_buf: [512]u8 = undefined;
    var priv_key_sink = priv_key_file.writer(global.io, &priv_key_buf);

    switch (algo_type) {
        inline else => |algo_tag| {
            const algo = @field(algos, @tagName(algo_tag));
            if (@hasDecl(algo, "genKeys")) {
                try algo.genKeys(&pub_key_sink.interface, &priv_key_sink.interface);
            } else {
                unreachable;
            }
        },
    }
    try pub_key_sink.flush();
    try priv_key_sink.flush();
}

fn isAsymetricAlgo(algo_type: AlgoType) bool {
    return switch (algo_type) {
        inline else => |algo_tag| @hasDecl(@field(algos, @tagName(algo_tag)), "genKeys"),
    };
}
