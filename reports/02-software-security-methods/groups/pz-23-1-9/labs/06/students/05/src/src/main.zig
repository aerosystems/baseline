const std = @import("std");
const Io = std.Io;
const print = std.debug.print;

const algo = @import("algorithms.zig");
const global = @import("global.zig");

pub fn main(init: std.process.Init) !u8 {
    global.io = init.io;
    global.gpa = init.gpa;
    global.arena = init.arena.allocator();

    return try cliMain(init.minimal);
}

pub fn cliMain(init: std.process.Init.Minimal) !u8 {
    const params = parseCliArgs(init.args);

    if (params.help) {
        print("Usage: crypt [-h] -e=<algorithm|-h=<algorithm> <key> [input] [output]\n", .{});
        print("Usage: crypt [-h] -g=<algorithm> <key path>\n", .{});
        print("    --encrypt -e: encrypt using specified algorithm\n", .{});
        print("    --decrypt -d: decrypt using specified algorithm\n", .{});
        print("    --generate -g: generate public/private keys pair for asymetric algorithm\n", .{});
        print("    input: path of file, defaults to stdin\n", .{});
        print("    output: path of file, defaults to stdout\n", .{});
        print("Available algorithms:", .{});
        inline for (@typeInfo(algo.AlgoType).@"enum".field_names) |decl| {
            print(" {s}", .{decl});
        } print("\n", .{});
        return 0;
    }

    const key = params.key orelse {print("No key specified\n", .{}); return 1;};
    const algo_str = params.algo orelse {print("No algorithm specified", .{}); return 1;};
    const algo_type = std.meta.stringToEnum(algo.AlgoType, algo_str) orelse {print("No such algorithm: {s}", .{algo_str}); return 1;};

    if (params.gen_keys) {
        var public_key_buf: [std.fs.max_path_bytes]u8 = undefined;
        const public_key = std.fmt.bufPrint(&public_key_buf, "{s}.pub", .{key}) catch unreachable;
        algo.runGenKeys(algo_type, public_key, key) catch |e| {
            print("Error: {t}\n", .{e});
            return 1;
        };
        return 0;
    } else {
        const op_type = params.op orelse {print("No operation specified", .{}); return 1;};

        // Open files
        const in_file = if (params.in_path) |path|
            Io.Dir.cwd().openFile(global.io, path, .{.allow_directory = false}) catch |e| {
                print("Input file {s}: reading error: {t}\n", .{path, e});
                return 1;
        }
        else
            Io.File.stdin();
        defer in_file.close(global.io);

        const out_file = if (params.out_path) |path|
            Io.Dir.cwd().createFile(global.io, path, .{}) catch |e| {
                print("Output file {s}: open error: {t}\n", .{path, e});
                return 1;
        }
        else
            Io.File.stdout();
        defer out_file.close(global.io);

        // Start operation using specified algorithm
        const succeed = try algo.runCryptAlgoOnFiles(algo_type, op_type, key, in_file, out_file);
        if (succeed) {
            print("\nOperation succeed\n", .{});
            return 0;
        } else {
            print("\nOperation failed\n", .{});
            return 1;
        }
    }
}

const param = @import("libs/param.zig");

const CliParams = struct {
    key: ?[]const u8 = null,
    in_path: ?[]const u8 = null,
    out_path: ?[]const u8 = null,

    op: ?algo.OpType = null,
    algo: ?[]const u8 = null,
    gen_keys: bool = false,

    help: bool = false,
};

/// Parses command line arguments into struct using helper function form root.zig
fn parseCliArgs(args: std.process.Args) CliParams {
    var params = CliParams{};

    var params_it: param.ParamIterator = .init(args, .{
        .{"help", 'h'},
        .{"decrypt", 'd'},
        .{"encrypt", 'e'},
        .{"generate", 'g'},
    });
    defer params_it.deinit();

    while (params_it.next()) |p| switch (p) {
        .arg => |arg| {
            if (params.key == null)           {params.key = arg;}
            else if (params.in_path == null)  {params.in_path = arg;}
            else if (params.out_path == null) {params.out_path = arg;}
        },

        .flag => |f| switch (f) {
            'h' => params.help = true,
            else => print("No such flag: {c}\n", .{f}),
        },

        .parametrized_flag => |pf| switch (pf.flag) {
            'e' => {params.op = .encrypt; params.algo = pf.param;},
            'd' => {params.op = .decrypt; params.algo = pf.param;},
            'g' => {params.gen_keys = true; params.algo = pf.param;},
            else => print("No such parametrized flag: {c}\n", .{pf.flag}),
        },

        .long_flag => |lf|
            print("No such flag: {s}\n", .{lf}),

        .parametrized_long_flag => |plf|
            print("No such parametrized flag: {s}\n", .{plf.flag}),
    };

    return params;
}
