package util

import (
        "errors"
        "fmt"
        "io"
        "encoding/json/v2"
        "net/http"
)

func JsonUnmarshalRead(in io.Reader, out any, opts ...json.Options) error {
        err := json.UnmarshalRead(in, out, opts...)
        if err != nil {return &HttpError{
                Code: http.StatusBadRequest,
                Text: err.Error(),
        }}
        return nil
}

// Middleware for checking input content type and setting output content type.
// Output type can be overriden by handler
func WithTypes(in string, out string, next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if in != "" && r.Header.Get("Content-Type") != in {
                err := fmt.Errorf("request type is %s while required is %s", r.Header.Get("Content-Type"), in)
                fmt.Printf("Error: %s\n", err)
                http.Error(w, err.Error(), http.StatusBadRequest)
        } else {
                if out != "" {w.Header().Set("Content-Type", out)}
                next.ServeHTTP(w, r)
        }
    })
}


// Error carrying http response code
type HttpError struct {
        Code int
        Text string
}
func (he *HttpError) Error() string {
        return he.Text
}

func ToHttpErr(err error, code int) error {
        return &HttpError{
                Code: code,
                Text: err.Error(),
        }
}

func HandleHttpError(err error, w http.ResponseWriter) {
        var code int = http.StatusInternalServerError

        var he *HttpError
        if errors.As(err, &he) {code = he.Code}

        fmt.Printf("Http error %d: %s\n", code, err.Error())
        http.Error(w, err.Error(), code) // Automatically sets Content-Type and does other headers,
                                         // so error can not be a json
}

// Handler errornous function
type HandlerEFunc func(w http.ResponseWriter, r *http.Request) error

func (handler HandlerEFunc) ServeHTTP(w http.ResponseWriter, r *http.Request) {
        if err := handler(w, r); err != nil {HandleHttpError(err, w)}
}

// Handler with json parsing
type HandlerParse[T any] func(w http.ResponseWriter, r *http.Request, data T) error

func (handler HandlerParse[T]) ServeHTTP(w http.ResponseWriter, r *http.Request) {
        var data T
        if err := json.UnmarshalRead(r.Body, &data); err != nil {
                fmt.Printf("Error parsing json request: %s\n", err)
                http.Error(w, err.Error(), http.StatusBadRequest)
        } else if err := handler(w, r, data); err != nil {
                HandleHttpError(err, w)
        }
}

/*
 * Other option could be middleware passing context:
 *
 * ctx := context.WithValue(r.Context(), "data", data)
 * next.ServeHTTP(w, r.WithContext(ctx))
 *
 * and than in handler retrieve this data:
 *
 * data := r.Context().Value("data").(dataType)
 */
