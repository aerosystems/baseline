package auth

import (
        "errors"
        "net/http"
        "encoding/base32"
        "encoding/binary"
        "restapiserver/util"
        "restapiserver/minidb"
        "go.mongodb.org/mongo-driver/v2/bson"
)

type userStruct struct {
        ID       bson.ObjectID `json:"-"                bson:"_id,ro"`
        Name     string        `json:"name,omitempty"`
        Email    string        `json:"email,omitempty"`
        Pass     string        `json:"password"         bson:"-"`
        PassHash []byte        `json:"-"                bson:"passhash"`
        Role     string        `json:"role"`
        TotpCode string        `json:"-"                bson:"totp_code"`
}

var errNoEmail error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "email must be specified",
}
var errNoPassword error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "password must be specified",
}
var errUnknownRole error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "unknown role",
}
var errUserNotFound error = &util.HttpError{
        Code: http.StatusNotFound,
        Text: "no such user",
}
var errUserExists = &util.HttpError{
        Code: http.StatusConflict,
        Text: "user with same name or email already registered",
}

// Create new user.
// Checks to be unique (with indexes) and hashes password
// Does not stores password in database
func (api *Api) newUser(user userStruct) error {
        if len(user.Email) == 0 {return errNoEmail}
        if len(user.Name) == 0 {user.Name = user.Email}

        if len(user.Pass) == 0 {return errNoPassword}
        if len(user.Role) == 0 {
                user.Role = RoleUser
        } else if _, ok := roleRights[user.Role]; !ok {
                return errUnknownRole;
        }

        var err error
        user.PassHash, err = hashPassword([]byte(user.Pass))
        user.Pass = ""

        user.TotpCode = base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(
                binary.AppendUvarint(
                        binary.AppendUvarint([]byte{}, api.rng.Uint64()),
                        api.rng.Uint64(),
                ),
        )

        err = api.db.Create("users", user)
        if errors.Is(err, minidb.ErrAlreadyExists) {err = errUserExists}
        return err
}

// Try delete by name, if no such user - by email
func (api *Api) deleteUser(nameOrEmail string) error {
        _, err := api.db.Delete("users", bson.D{{"name", nameOrEmail}})
        if err != nil {return err}

        deleted, err := api.db.Delete("users", bson.D{{"email", nameOrEmail}})
        if err != nil {return err}

        if deleted == 0 {return minidb.ErrNotExists} else {return nil}
}

// Find user and return it decoded into T
func (api *Api) findUserByLogin(nameOrEmail string, notFoundErr error) (user userStruct, err error) {
        err = api.db.FindTo(&user, "users", bson.D{{"email", nameOrEmail}})
        if !errors.Is(err, minidb.ErrNotExists) {return user, err}

        err = api.db.FindTo(&user, "users", bson.D{{"name", nameOrEmail}})
        if errors.Is(err, minidb.ErrNotExists) {err = notFoundErr}

        return
}
func (api *Api) findUserById(id bson.ObjectID, notFoundErr error) (user userStruct, err error) {
        err = api.db.FindTo(&user, "users", bson.D{{"_id", id}})
        if errors.Is(err, minidb.ErrNotExists) {err = notFoundErr}

        return
}
