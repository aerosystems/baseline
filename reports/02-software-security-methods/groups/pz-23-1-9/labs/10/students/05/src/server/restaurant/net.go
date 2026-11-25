package restaurant

import (
        "errors"
        "context"
        "fmt"
        "net/http"
        "encoding/json/v2"
        "restapiserver/auth"
        "restapiserver/util"
        "go.mongodb.org/mongo-driver/v2/bson"
        "github.com/coder/websocket"
        "github.com/coder/websocket/wsjson"
)

func (api *Api) RegisterEndpoints(mux *http.ServeMux) {
        mux.Handle("GET /api/dishes",
                api.auth.WithAuth(auth.RoleUser,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleGetDishes))))

        mux.Handle("GET /api/dishes/{name}",
                api.auth.WithAuth(auth.RoleUser,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleGetDish))))

        mux.Handle("GET /api/dishes/subscribe",
                api.auth.WithAuth(auth.RoleUser,
                        http.HandlerFunc(api.handleSubDishes)))

        mux.Handle("DELETE /api/dishes/{name}",
                api.auth.WithAuth(auth.RoleModerator,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleDeleteDish))))

        mux.Handle("POST /api/dishes",
                api.auth.WithAuth(auth.RoleModerator,
                        util.WithTypes("application/json", "",
                                util.HandlerParse[dishStruct](api.handleNewDish))))

        mux.Handle("PUT /api/dishes/{name}",
                api.auth.WithAuth(auth.RoleModerator,
                        util.WithTypes("application/json", "",
                                util.HandlerParse[dishStruct](api.handleUpdateDish))))


        mux.Handle("GET /api/categories",
                api.auth.WithAuth(auth.RoleUser,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleGetCategories))))

        mux.Handle("GET /api/categories/{name}",
                api.auth.WithAuth(auth.RoleUser,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleGetCategory))))

        mux.Handle("GET /api/categories/subscribe",
                api.auth.WithAuth(auth.RoleUser,
                        http.HandlerFunc(api.handleSubCatgs)))

        mux.Handle("DELETE /api/categories/{name}",
                api.auth.WithAuth(auth.RoleModerator,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleDeleteCategory))))

        mux.Handle("POST /api/categories",
                api.auth.WithAuth(auth.RoleModerator,
                        util.WithTypes("application/json", "",
                                util.HandlerParse[menuCategory](api.handleNewCategory))))

        mux.Handle("PUT /api/categories/{name}",
                api.auth.WithAuth(auth.RoleModerator,
                        util.WithTypes("application/json", "",
                                util.HandlerParse[menuCategory](api.handleUpdateCategory))))

        mux.Handle("GET /api/categories/{name}/dishes",
                api.auth.WithAuth(auth.RoleUser,
                        util.WithTypes("", "application/json",
                                util.HandlerEFunc(api.handleGetDishesInCategory))))
}

func (api *Api) handleGetDishes(w http.ResponseWriter, r *http.Request) error {
        dishes, err := api.findDishes(bson.D{})
        if err != nil {return err}

        // For non HttpError errors status automatically is
        // StatusInternalServerError, which is what we want here
        return json.MarshalWrite(w, &dishes)
}
func (api *Api) handleGetDish(w http.ResponseWriter, r *http.Request) error {
        dish, err := api.findDishByName(r.PathValue("name"))
        if err != nil {return err}

        return json.MarshalWrite(w, &dish)
}

func (api *Api) handleSubDishes(w http.ResponseWriter, r *http.Request) {
        api.handleSubscribe(w, r, "dishes")
}
func (api *Api) handleSubCatgs(w http.ResponseWriter, r *http.Request) {
        api.handleSubscribe(w, r, "categories")
}

func (api *Api) handleSubscribe(w http.ResponseWriter, r *http.Request, resource string) {
        var err error

        if (resource == "dishes") {
	        err = api.subDishes(w, r)
        } else if (resource == "categories") {
	        err = api.subCatgs(w, r)
        } else {
                return
        }

	if errors.Is(err, context.Canceled) ||
           websocket.CloseStatus(err) == websocket.StatusNormalClosure ||
           websocket.CloseStatus(err) == websocket.StatusGoingAway {
		return
	} else {
                fmt.Printf("WebSockets error: %s\n", err)
		return
	}
}


func (api *Api) subDishes(w http.ResponseWriter, r *http.Request) error {
        wsConn, err := websocket.Accept(w, r, nil)
        if err != nil {return err}
        defer wsConn.CloseNow()

        sub := &subscriberDishes{
                msgs: make(chan dishEvent, 128),
                closeSlow: func() {
                        if wsConn == nil {return}
                        wsConn.Close(websocket.StatusPolicyViolation,
                                "connection too slow to keep up with messages")
                },
        }

        api.subDishesMutex.Lock()
        api.subsDishes[sub] = struct{}{}
        api.subDishesMutex.Unlock()

        defer func(){
                api.subDishesMutex.Lock()
                delete(api.subsDishes, sub)
                api.subDishesMutex.Unlock()
        }()

        ctx := wsConn.CloseRead(context.Background())

        // Loop for sending messages to subscriber.
        // Message asyncronously written to subscriber chan somewhere else
        // and consumed here
        for {
                select {
                case msg := <-sub.msgs:
                        err := wsjson.Write(ctx, wsConn, msg)
                        if err != nil {return err}
                case <-ctx.Done():
                        return ctx.Err()
                }
        }
}
func (api *Api) subCatgs(w http.ResponseWriter, r *http.Request) error {
        wsConn, err := websocket.Accept(w, r, nil)
        if err != nil {return err}
        defer wsConn.CloseNow()

        sub := &subscriberCatgs{
                msgs: make(chan catgEvent, 128),
                closeSlow: func() {
                        if wsConn == nil {return}
                        wsConn.Close(websocket.StatusPolicyViolation,
                                "connection too slow to keep up with messages")
                },
        }

        api.subCatgsMutex.Lock()
        api.subsCatgs[sub] = struct{}{}
        api.subCatgsMutex.Unlock()

        defer func(){
                api.subCatgsMutex.Lock()
                delete(api.subsCatgs, sub)
                api.subCatgsMutex.Unlock()
        }()

        ctx := wsConn.CloseRead(context.Background())

        // Loop for sending messages to subscriber.
        // Message asyncronously written to subscriber chan somewhere else
        // and consumed here
        for {
                select {
                case msg := <-sub.msgs:
                        err := wsjson.Write(ctx, wsConn, msg)
                        if err != nil {return err}
                case <-ctx.Done():
                        return ctx.Err()
                }
        }
}

func (api *Api) handleNewDish(w http.ResponseWriter, r *http.Request, newDish dishStruct) error {
        w.WriteHeader(http.StatusCreated)
        return api.insertDish(newDish)
}

func (api *Api) handleGetCategories(w http.ResponseWriter, r *http.Request) error {
        var categories []menuCategory
        err := api.db.FindTo(&categories, "menu_categories", bson.D{})
        if err != nil {return err}

        return json.MarshalWrite(w, &categories)
}
func (api *Api) handleGetCategory(w http.ResponseWriter, r *http.Request) error {
        category, err := api.findCategoryByName(r.PathValue("name"))
        if err != nil {return err}

        return json.MarshalWrite(w, &category)
}


func (api *Api) handleNewCategory(w http.ResponseWriter, r *http.Request, newCategory menuCategory) error {
        w.WriteHeader(http.StatusCreated)
        return api.insertCategory(newCategory)
}

func (api *Api) handleDeleteDish(w http.ResponseWriter, r *http.Request) error {
        return api.deleteDish(r.PathValue("name"))
}

func (api *Api) handleDeleteCategory(w http.ResponseWriter, r *http.Request) error {
        return api.deleteCategory(r.PathValue("name"))
}

func (api *Api) handleUpdateDish(w http.ResponseWriter, r *http.Request, dishChange dishStruct) error {
        return api.modifyDish(r.PathValue("name"), dishChange)
}

func (api *Api) handleUpdateCategory(w http.ResponseWriter, r *http.Request, categoryChange menuCategory) error {
        return api.modifyCategory(r.PathValue("name"), categoryChange)
}

func (api *Api) handleGetDishesInCategory(w http.ResponseWriter, r *http.Request) error {
        dishes, err := api.dishesInCategory(r.PathValue("name"))
        if err != nil {return err}

        return json.MarshalWrite(w, &dishes)
}
