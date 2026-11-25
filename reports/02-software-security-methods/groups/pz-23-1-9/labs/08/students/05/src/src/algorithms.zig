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
    pub const sha256                 = @import("algorithms/sha256.zig");
};

pub const OpType = enum{encrypt, decrypt};
pub const AlgoType = std.meta.DeclEnum(algos);


fn readAll(
    io: std.Io,
    allocator: std.mem.Allocator,
    file: std.Io.File,
) ![]u8 {
    var read_buffer: [4096]u8 = undefined;
    var file_reader = file.reader(io, &read_buffer);

    return try file_reader.interface.readAlloc(
        allocator,
        std.math.maxInt(usize), // maximum allowed size
    );
}

fn readFile(file: Io.File) (Io.File.ReadStreamingError || std.mem.Allocator.Error)![]u8 {
    var al: std.ArrayList(u8) = .empty;
    while (true) {
        var buf: [512]u8 = undefined;
        const readen = file.readStreaming(global.io, &.{buf[0..]}) catch |e|
            if (e == error.EndOfStream) break else return e;
        try al.appendSlice(global.gpa, buf[0..readen]);
    }
    return try al.toOwnedSlice(global.gpa);
}

pub fn runAlgoOnFiles(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, in: Io.File, out: Io.File
) !bool {
    const in_buf = try readFile(in);
    defer global.gpa.free(in_buf);

    var out_buf: [1024]u8 = undefined;
    var sink = out.writer(global.io, &out_buf);

    const succeed = try runAlgo(algo_type, op_type, key, in_buf, &sink.interface);
    if (succeed) try sink.flush();
    return succeed;
}

pub fn runAlgo(
    algo_type: AlgoType, op_type: OpType,
    key: []const u8, source: []const u8, sink: *Io.Writer
) !bool {
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
) !bool {
    switch (algo_type) {
        inline else => |algo_tag| {
            const algo = @field(algos, @tagName(algo_tag));
            switch (op_type) {
                inline else => |op| {
                    if (@hasDecl(algo, @tagName(op))) {
                        return try @field(algo, @tagName(op))(key, source, sink);
                    } else {
                        return error.OperationNotSupportedByAlgorithm;
                    }
                }
            }
        },
    }
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
