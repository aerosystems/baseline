package main

import (
        "fmt"
        "os"
        "context"
        "net/http"
        "restapiserver/restaurant"
        "restapiserver/auth"
        "restapiserver/minidb"
)

func main() {
        // Typo in database name saved becouse mongo apparently does not know about secret technique of renaming
        db, err := minidb.InitMongo(context.Background(), "restourant_db")

        if err != nil {
                fmt.Printf("Error connecting to mongo: %s\n", err)
                return
        }
        defer db.Deinit()

        mux := http.NewServeMux()
        mux.HandleFunc("/", notFound)

        authApi := auth.NewApi(db)
        authApi.RegisterEndpoints(mux)

        restaurantApi := restaurant.NewApi(db, authApi)
        restaurantApi.RegisterEndpoints(mux)

        port := os.Getenv("PORT")
        if len(port) == 0 {port = "8080"}

        panic(http.ListenAndServe(":"+port, mux))
}

func notFound(w http.ResponseWriter, r *http.Request) {
        http.Error(w, "address not found", http.StatusNotFound)
}
