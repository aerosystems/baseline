package auth

import (
        "fmt"
        "testing"
	"math/rand/v2"
        "encoding/base64"
        "crypto/sha256"
        "restapiserver/bcrypt"
        "go.mongodb.org/mongo-driver/v2/bson"
)

// This is arrange too
type FakeDB struct {
        Login    string
        Passwd   string
        PassHash []byte
}

func (db *FakeDB) Deinit() {}
func (db *FakeDB) FindTo(out any, collName string, filter any) error {
        switch out.(type) {
        case *userStruct:
                if db.PassHash == nil {
                        db.PassHash, _ = hashPassword([]byte(db.Passwd))
                }
                *out.(*userStruct) = userStruct{
                        ID: bson.ObjectID{},
                        Name: db.Login,
                        Email: db.Login + "@mail.com",
                        Pass: "",
                        PassHash: db.PassHash,
                        Role: RoleUser,
                }
                return nil
        default: return fmt.Errorf("unexpected type passed to FindTo")
        }
}
func (db *FakeDB) AreAny(collName string, filter any) bool {return false}
func (db *FakeDB) Create(collName string, new any) error {return nil}
func (db *FakeDB) Replace(collName string, filter any, new any) error {return nil}
func (db *FakeDB) Update(collName string, filter any, changes any) error {return nil}
func (db *FakeDB) Delete(collName string, filter any) (int64, error) {return 0, nil}

func TestLoginBasicProtocol(t *testing.T) {
        // Arrange
        login := "user"
        passwd := "12345"
        expectedTok := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0.CljutBkkwZRlUz8DqfrGj29kUikOT1AdFY29UUp38Bs"
        api := Api{
                db: &FakeDB{Login: login, Passwd: passwd},
                rng: rand.New(rand.NewPCG(16, 42)),
        }

        // Act
        tok, err := api.performLogin(login, passwd)

        // Assert
        if err != nil {
                t.Errorf("performLogin failed: %s", err)
        } else if tok != expectedTok {
                t.Errorf("Tocken mismatch: got: %s, expected: %s", tok, expectedTok)
        }
}

func TestLoginChallangeProtocol(t *testing.T) {
        // Arrange
        login := "user"
        passwd := "12345"
        expectedTok := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0.CljutBkkwZRlUz8DqfrGj29kUikOT1AdFY29UUp38Bs"
        api := Api{
                db: &FakeDB{Login: login, Passwd: passwd},
                rng: rand.New(rand.NewPCG(16, 42)),
        }

        // Act
        info, err := api.loginChallenge(login)

        // Assert
        if err != nil {
                t.Errorf("loginChallenge for %s:%s failed with error: %s", login, passwd, err)
                return
        }

        // Act
        var major, minor int
        var salt string
        _, err = fmt.Sscanf(info.Salt, "$%x$%d$%s", &major, &minor, &salt)

        // Assert
        if err != nil {
                t.Errorf("Scanf on salt %s failed with error: %s", info.Salt, err)
                return
        }

        // Act
        passHash, _ := bcrypt.GenerateFromPasswordSalt(
                []byte(passwd), minor, []byte(salt),
        )
        hmac := append([]byte(info.Random), passHash...)
        answer := fmt.Sprintf("%x", sha256.Sum256(hmac))

        tok, err := api.checkChallenge(login, answer)

        // Assert
        if err != nil {
                t.Errorf("checkChallenge for %s:%s failed with error: %s", login, passwd, err)
        } else if tok != expectedTok {
                t.Errorf("Tocken mismatch: got: %s, expected: %s", tok, expectedTok)
        }
}

func TestAuth(t *testing.T) {
        // Arrange
        login := "user"
        passwd := "12345"
        tok := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0.CljutBkkwZRlUz8DqfrGj29kUikOT1AdFY29UUp38Bs"

        api := Api{
                db: &FakeDB{Login: login, Passwd: passwd},
                rng: rand.New(rand.NewPCG(16, 42)),
        }

        // Act
        err := api.authorizate(
                RoleUser,
                "Basic "+base64.StdEncoding.EncodeToString([]byte(login+":"+passwd)),
        )

        // Assert
        if err != nil {
                t.Errorf("Failed to authorizate via login and password: %s", err)
                return
        }

        // Act
        err = api.authorizate(
                RoleUser,
                "Bearer "+tok,
        )

        // Assert
        if err != nil {
                t.Errorf("Failed to authorizate via bearer jwt tocken: %s", err)
                return
        }
}
