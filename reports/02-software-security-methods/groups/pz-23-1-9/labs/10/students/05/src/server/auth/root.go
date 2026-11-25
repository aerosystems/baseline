package auth

import (
        "fmt"
        "os"
        "reflect"
        "crypto/sha256"
        "strings"
        "strconv"
	"math/rand/v2"
        "time"
        "net/http"
        "encoding/base64"
        "restapiserver/util"
        "restapiserver/bcrypt"
        "restapiserver/minidb"
        "go.mongodb.org/mongo-driver/v2/bson"
        "github.com/golang-jwt/jwt/v5"

        "github.com/pquerna/otp"
        "github.com/pquerna/otp/totp"
)

type Api struct {
        db  minidb.MiniDB
        rng *rand.Rand
}
func NewApi(db minidb.MiniDB) Api {
        return Api{
                db: db,
                rng: rand.New(rand.NewPCG(rand.Uint64(), rand.Uint64())),
        }
}

const (
        RoleAdmin = "admin"
        RoleModerator = "moderator"
        RoleUser = "user"
)
var roleRights = map[string]int{ // Less is more rights
        RoleAdmin: 0,
        RoleModerator: 1,
        RoleUser: 2,
}

var errUnknownAuth error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "unknown authorization method",
}
var errAuthFormat error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "authorization format error",
}
var errWrongLogin error = &util.HttpError{
        Code: http.StatusForbidden,
        Text: "wrong login",
}
var errWrongPassword error = &util.HttpError{
        Code: http.StatusForbidden,
        Text: "wrong password",
}
var errEmptyLogin error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "empty login",
}
var errEmptyPassword error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "empty password",
}
var errAccessDenied error = &util.HttpError{
        Code: http.StatusForbidden,
        Text: "user has no access to resource",
}
var errNoChallange error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "there were no challenge query for this user",
}
var errNeed2FA error = &util.HttpError{
        Code: http.StatusAccepted,
        Text: "is you see this error then something is fucked up",
}

// Password hashing
func hashPassword(pass []byte) ([]byte, error) {
        return bcrypt.GenerateFromPassword(pass, bcrypt.DefaultCost)
}
func checkHashPassword(hash []byte, pass []byte) error {
        return bcrypt.CompareHashAndPassword(hash, pass)
}

func (api *Api) performSignup(user userStruct) (string, string, error) {
        err := api.newUser(user)
        if err != nil {return "", "", err}

        dbUser, err := api.findUserByLogin(user.Name, errWrongLogin)
        if err != nil {return "", "", err}

        tok, err := makeToken(dbUser.ID)
        return tok, dbUser.TotpCode, err
}

// Get access tocken.
func (api *Api) performLogin(login, password string) (string, error) {
        // Try find user
        dbUser, err := api.userIfPasswordCorrect(login, password)
        if err != nil {return "", err}

        // Consider this a migration strategy
        if dbUser.TotpCode == "" {
                return makeToken(dbUser.ID)
        } else {
                otps[login] = otpQue{code: dbUser.TotpCode, uid: dbUser.ID}
                return "", errNeed2FA
        }
}

// Challenge login protocol

// This definetly should not map to login
var challenges map[string]string = make(map[string]string)
var otps map[string]otpQue = make(map[string]otpQue)
type otpQue struct {
        code string
        uid  bson.ObjectID
}

type challengeInfo struct {
        Random string `json:"random"`
        Salt   string `json:"salt"`
}

func (api *Api) loginChallenge(login string) (info challengeInfo, err error) {
        if len(login) == 0 {err = errEmptyLogin; return}

        info.Random = strconv.FormatUint(api.rng.Uint64(), 16)
        challenges[login] = info.Random;

        // Find user
        dbUser, err := api.findUserByLogin(login, errWrongLogin)
        if err != nil {return}

        // Getting salt form hashed password
	p, err := bcrypt.NewFromHash(dbUser.PassHash)
	if err != nil {return}

        info.Salt = fmt.Sprintf("$%c%c$%d$%s",
                p.Major, p.Minor, p.Cost, string(p.Salt))

        return
}

func (api *Api) checkChallenge(login string, resp string) (string, error) {
        if len(login) == 0 {return "", errEmptyLogin}
        if len(resp) == 0 {return "", errEmptyPassword}

        // Find challenge generated before
        challenge, ok := challenges[login]
        if !ok {return "", errNoChallange}

        // Find user
        dbUser, err := api.findUserByLogin(login, errWrongLogin)
        if err != nil {return "", err}

        // Check expected result with returned by clent
        hmac := append([]byte(challenge), dbUser.PassHash...)
        expected := fmt.Sprintf("%x", sha256.Sum256(hmac))

        if !reflect.DeepEqual(expected, resp) {return "", errWrongPassword}

        delete(challenges, login)

        // Consider this a migration strategy
        if dbUser.TotpCode == "" {
                return makeToken(dbUser.ID)
        } else {
                otps[login] = otpQue{code: dbUser.TotpCode, uid: dbUser.ID}
                return "", errNeed2FA
        }
}

func loginOtp(login, passCode string) (string, error) {
        info, ok := otps[login]
        if !ok {return "", errWrongLogin}

        opts := totp.ValidateOpts {
                Period: 60, // seconds
                Skew: 0,
                Digits: 6, // 6 or 8
                Algorithm: otp.AlgorithmSHA256,
        }

        valid, err := totp.ValidateCustom(passCode, info.code, time.Now().UTC(), opts)
        if err != nil {return "", err}
        if !valid {return "", errWrongPassword}

        return makeToken(info.uid)
}

// Authorizate user: check if operation is permitted
// taking role into consideration
func (api *Api) authorizate(minRole, payload string) error {
        // payload must be in format: <Method> <auth_payload>
        parts := strings.Split(payload, " ")
        if len(parts) != 2 {return errAuthFormat}

        // Find user info from payload
        var user userStruct
        var err error

        switch parts[0] {
        case "Basic":
                if user, err = api.authorizateBasic(parts[1]); err != nil {return err}
        case "Bearer":
                if user, err = api.authorizateJWT(parts[1]); err != nil {return err}
        default:
                return errUnknownAuth
        }

        // Check user privileges
        userRights := roleRights[user.Role]
        requiredRights, ok := roleRights[minRole]
        if !ok {panic(fmt.Sprintf("wrong minRole argument: %s", minRole))}

        if !ok { // Role is verified on signup, but mongodb can be modified from outside
                return errUnknownRole
        } else if userRights > requiredRights {
                return errAccessDenied
        } else {
                return nil
        }
}

// Authorize via basic scheme
func (api *Api) authorizateBasic(infoB64 string) (user userStruct, err error) {
        nameOrEmail, password, err := decodeBasicPayload(infoB64)
        if err != nil {return}

        // Find user
        user, err = api.findUserByLogin(nameOrEmail, errUserNotFound)
        if err != nil {return}

        // Check password
        err = checkHashPassword(user.PassHash, []byte(password))
        if err != nil {err = errWrongPassword}
        return
}

// Authorize via JWT
func (api *Api) authorizateJWT(tokenStr string) (user userStruct, err error) {
        tok, err := jwt.Parse(tokenStr, func(tok *jwt.Token) (any, error) {
                return jwtKey(), nil
        }, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
        if err != nil {return}

        // Find user id from claims
        claims, ok := tok.Claims.(jwt.MapClaims)
        if !ok {return userStruct{}, fmt.Errorf("failed to get claims from token")}

        userId, err := bson.ObjectIDFromHex(claims["user"].(string))
        if err != nil {return}

        user, err = api.findUserById(userId, errUserNotFound)
        return
}

// Find user and return it if password is correct
func (api *Api) userIfPasswordCorrect(login, password string) (*userStruct, error) {
        if len(login) == 0 {return nil, errEmptyLogin}
        if len(password) == 0 {return nil, errEmptyPassword}

        dbUser, err := api.findUserByLogin(login, errWrongLogin)
        if err != nil {return nil, err}

        err = checkHashPassword(dbUser.PassHash, []byte(password))
        if err != nil {return nil, errWrongPassword}

        return &dbUser, nil
}

// Generate Bearer JWT access tocken
func makeToken(userID bson.ObjectID) (string, error) {
        tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
                "user": userID.Hex(),
        })
        return tok.SignedString(jwtKey())
}

// Basic (as all other auth methods) encodes payload in base64 in format login:password.
// This decodes base64 and splits login and password
func decodeBasicPayload(infoB64 string) (string, string, error) {
        infoStr, err := base64.StdEncoding.DecodeString(infoB64)
        if err != nil {return "", "", err}

        info := strings.Split(string(infoStr), ":")
        if len(info) < 2 {return "", "", errAuthFormat}

        return info[0], info[1], nil
}

func jwtKey() []byte {
        key := []byte(os.Getenv("JWT_SECRET"))
        if len(key) == 0 {key = []byte("my_jwt_secret")}
        return key
}
