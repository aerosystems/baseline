package auth

import (
        "net/http"
        "encoding/base64"
        "encoding/json/v2"
        "restapiserver/util"
)

var authCookie string = "AuthCookie"

func (api *Api) RegisterEndpoints(mux *http.ServeMux) {
        mux.Handle("POST /api/login", util.HandlerEFunc(api.handleLogin))
        mux.Handle("POST /api/users", util.WithTypes("", "application/json",
                util.HandlerEFunc(api.handleSignup)))

        // I wanted it to be login/challenge, but browser sets cookie scope
        // to upper of request endpoint
        mux.Handle("QUERY /api/challenge",
                util.WithTypes("", "application/json",
                        util.HandlerEFunc(api.handleLoginChallenge)))
        mux.Handle("POST /api/challenge",
                util.HandlerEFunc(api.handleChallengeResponse))

        mux.Handle("POST /api/otp",
                util.HandlerEFunc(api.handleTotpResponse))

        mux.Handle("DELETE /api/users/{name_or_email}",
                api.WithAuth(RoleAdmin, util.HandlerEFunc(api.handleDeleteUser)))
}

// Supports json and html forms
func (api *Api) handleLogin(w http.ResponseWriter, r *http.Request) error {
        login, password := readLoginPassword(r)

        tok, err := api.performLogin(login, password)
        if err != nil {return err}

        http.SetCookie(w, makeCookie(tok))
        return nil
}

// Accepts login only, returns challenge bytes returned as hex string
func (api *Api) handleLoginChallenge(w http.ResponseWriter, r *http.Request) error {
        login := readLogin(r)

        info, err := api.loginChallenge(login)
        if err != nil {return err}

        return json.MarshalWrite(w, info)
}

// Check challengle response. The password is challenge result
func (api *Api) handleChallengeResponse(w http.ResponseWriter, r *http.Request) error {
        login, password := readLoginPassword(r)

        tok, err := api.checkChallenge(login, password)
        if err != nil {return err}

        http.SetCookie(w, makeCookie(tok))
        return nil
}

func (api *Api) handleTotpResponse(w http.ResponseWriter, r *http.Request) error {
        // Password name is universal enough to be password, challenge response and otp key
        login, password := readLoginPassword(r)

        tok, err := loginOtp(login, password)
        if err != nil {return err}

        http.SetCookie(w, makeCookie(tok))
        return nil
}

func readLogin(r *http.Request) string {
        vals := readFormOrJson(r, []string{"login"})
        return vals[0]
}
func readLoginPassword(r *http.Request) (login string, password string) {
        vals := readFormOrJson(r, []string{"login", "password"})
        login, password = vals[0], vals[1]
        return
}
func readFormOrJson(r *http.Request, keys []string) []string {
        var vals []string = make([]string, len(keys))

        switch r.Header.Get("Content-Type") {
        case "application/json":
                var payload map[string]string
                if err := json.UnmarshalRead(r.Body, &payload); err != nil {
                        return vals
                }
                for i, key := range keys {
                        if val, ok := payload[key]; ok {
                                vals[i] = val
                        }
                }
        default:
                for i, key := range keys {
                        vals[i] = r.FormValue(key)
                }
        }

        return vals
}

func (api *Api) handleSignup(w http.ResponseWriter, r *http.Request) error {
        vals := readFormOrJson(r, []string{"login", "email", "password", "role"})
        newUser := userStruct{
                Name: vals[0],
                Email: vals[1],
                Pass: vals[2],
                Role: vals[3],
        }

        tok, totpSecret, err := api.performSignup(newUser)
        if err != nil {return err}

        http.SetCookie(w, makeCookie(tok))
        w.WriteHeader(http.StatusCreated)

        return json.MarshalWrite(w, struct{
                TotpSecret string `json:"totp_secret"`
        }{totpSecret})
}

func makeCookie(token string) *http.Cookie {
        return &http.Cookie{
                Name: authCookie,
                Value: base64.StdEncoding.EncodeToString([]byte("Bearer " + token)),
        };
}

func (api *Api) handleDeleteUser(w http.ResponseWriter, r *http.Request) error {
        return api.deleteUser(r.PathValue("name_or_email"))
}

// Middleware for checking authorization
func (api *Api) WithAuth(role string, next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                err := api.tryAuthFromRequest(role, r)
                if err != nil {
                        util.HandleHttpError(err, w)
                } else {
                        next.ServeHTTP(w, r)
                }
        })
}

func (api *Api) tryAuthFromRequest(role string, r *http.Request) (err error) {
        // The cookie is in the same format as Authorization header,
        // but encoded as base64
        cookies := r.CookiesNamed(authCookie)
        for _, cookie := range cookies {
                var bytes []byte
                bytes, err = base64.StdEncoding.DecodeString(cookie.Value)
                if err != nil {continue}

                if err = api.authorizate(role, string(bytes)); err == nil {return}
        }

        // Fall back to Authorization header
        payload := r.Header.Get("Authorization")
        if len(payload) > 0 {
                err = api.authorizate(role, payload)
        } else {
                err = errAccessDenied
        }
        return
}
