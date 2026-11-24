package minidb

import (
        "os"
        "context"
        "errors"
        "strings"
        "reflect"

        "go.mongodb.org/mongo-driver/v2/bson"
        "go.mongodb.org/mongo-driver/v2/mongo"
        "go.mongodb.org/mongo-driver/v2/mongo/options"
)

/*
 * Public
 */

func InitMongo(ctxParam context.Context, dbName string) (MiniDB, error) {
        var err error
        var ctx mongoCtx
        ctx.ctx = ctxParam

        uri := os.Getenv("MONGODB_URI")
        if len(uri) == 0 {uri = "mongodb://127.0.0.1:27017"}

        connectOpts :=
                options.Client().
                ApplyURI(uri).
                SetServerAPIOptions(options.ServerAPI(options.ServerAPIVersion1)). // There is only version 1
                SetBSONOptions(&options.BSONOptions{UseJSONStructTags: true})

        ctx.mongoClient, err = mongo.Connect(connectOpts)
        if err != nil {return nil, err}

	// Ping database to verify connection. Otherwise its not checked whether connection succeed
	if err := ctx.mongoClient.Ping(ctx.ctx, nil); err != nil {return nil, err}

        ctx.db = ctx.mongoClient.Database(dbName)

        dishes     := ctx.db.Collection("dishes")
        categories := ctx.db.Collection("menu_categories")
        users      := ctx.db.Collection("users")

        // Add indexes
        if err = ctx.indexUnique(dishes,     bson.D{{"dish", 1}});     err != nil {return nil, err}
        if err = ctx.indexUnique(categories, bson.D{{"category", 1}}); err != nil {return nil, err}
        if err = ctx.indexUnique(users,      bson.D{{"name", 1}});     err != nil {return nil, err}
        if err = ctx.indexUnique(users,      bson.D{{"email", 1}});    err != nil {return nil, err}

        return &ctx, nil
}

func (ctx *mongoCtx) Deinit() {
        _ = ctx.mongoClient.Disconnect(ctx.ctx);
}

// Find all entries in collection matching. If out type if slice or array,
// then it will fill it with all matching results
func (ctx *mongoCtx) FindTo(out any, collName string, filter any) error {
        coll := ctx.db.Collection(collName)

        switch reflect.TypeOf(out).Elem().Kind() {
        case reflect.Slice, reflect.Array:
                cursor, err := coll.Find(ctx.ctx, filter)
                if err != nil {return err}
                defer cursor.Close(ctx.ctx)

                return cursor.All(ctx.ctx, out)
        default:
                err := coll.FindOne(ctx.ctx, filter).Decode(out)
                if errors.Is(err, mongo.ErrNoDocuments) {err = ErrNotExists}
                return err
        }
}

// Check if there are any documents in collection
func (ctx *mongoCtx) AreAny(collName string, filter any) bool {
        coll := ctx.db.Collection(collName)
        res := coll.FindOne(ctx.ctx, filter)
        return !errors.Is(res.Err(), mongo.ErrNoDocuments)
}

// Create new entry
func (ctx *mongoCtx) Create(collName string, new any) error {
        coll := ctx.db.Collection(collName)
        new = rmRoFields(new)
        _, err := coll.InsertOne(ctx.ctx, new)
        if mongo.IsDuplicateKeyError(err) {err = ErrAlreadyExists}
        return err
}

// Replace first document matching all field values from filter to new
func (ctx *mongoCtx) Replace(collName string, filter any, new any) error {
        coll := ctx.db.Collection(collName)
        new = rmRoFields(new)
        res, err := coll.ReplaceOne(ctx.ctx, filter, new)
        if res.MatchedCount == 0 {err = ErrNotExists}
        return err
}

// For all documents that matching filter apply changes (set fields named k to value v)
func (ctx *mongoCtx) Update(collName string, filter any, changes any) error {
        coll := ctx.db.Collection(collName)
        _, err := coll.UpdateMany(
                ctx.ctx,
                filter,
                bson.D{{"$set", changes}},
        )
        return err
}

// Delete first document matching matchKey-matchVal
func (ctx *mongoCtx) Delete(collName string, filter any) (int64, error) {
        coll := ctx.db.Collection(collName)
        res, err := coll.DeleteMany(ctx.ctx, filter)

        var count int64 = 0
        if err != nil {count = res.DeletedCount}
        return count, err
}

/*
 * Private
 */

type mongoCtx struct {
        ctx context.Context
        mongoClient *mongo.Client
        db *mongo.Database
}

func (ctx *mongoCtx) indexUnique(coll *mongo.Collection, keys bson.D) error {
        _, err := coll.Indexes().CreateOne(ctx.ctx, mongo.IndexModel{
                Keys: keys,
                Options: options.Index().SetUnique(true),
        })
        return err
}

// Allows to add ro to bson tag, which tells to read into struct, but
// not save this field from struct to db. Useful for ids
func rmRoFields(src any) any {
        srcType := reflect.TypeOf(src)
        var dstFields []reflect.StructField

        fields: for _, field := range reflect.VisibleFields(srcType) {
                tag, ok := field.Tag.Lookup("bson")

                if ok {for _, t := range strings.Split(tag, ",")[1:] {
                        if t == "ro" {continue fields}
                }}
                dstFields = append(dstFields, field)
        }

        dstType := reflect.StructOf(dstFields)
        dst := reflect.New(dstType).Elem()

        for _, field := range dstFields {
                dst.FieldByName(field.Name).Set(reflect.ValueOf(src).FieldByName(field.Name))
        }

        return dst.Interface()
}
