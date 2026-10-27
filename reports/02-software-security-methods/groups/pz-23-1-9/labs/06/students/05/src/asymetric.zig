const std = @import("std");
const Io = std.Io;
const global = @import("global.zig");

const algos = struct {
    pub const rsa = @import("algorithms/rsa.zig");
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

pub fn genKeys(
    algo_type: AlgoType, public_path: []const u8, private_path: []const u8
) !void {
    const public_file = try Io.Dir.cwd().createFile(global.io, public_path, .{});
    defer public_file.close();
    var public_buf: [512]u8 = undefined;
    var public_sink = public_file.writer(global.io, &public_buf);

    const private_file = try Io.Dir.cwd().createFile(global.io, private_path, .{});
    defer private_file.close();
    var private_buf: [512]u8 = undefined;
    var private_sink = private_file.writer(global.io, &private_buf);

    switch (algo_type) {
        inline else => |algo| try @field(algos, @tagName(algo)).genKeys(
            public_sink.interface, private_sink.interface
        );
    }
}

pub fn runCryptAlgo(
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
