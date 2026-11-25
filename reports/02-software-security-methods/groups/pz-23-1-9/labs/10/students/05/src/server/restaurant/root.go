package restaurant

import (
        "errors"
        "sync"
        "net/http"
        "restapiserver/util"
        "restapiserver/auth"
        "restapiserver/minidb"
        "go.mongodb.org/mongo-driver/v2/bson"
)

type menuCategory struct {
        ID          bson.ObjectID `json:"-" bson:"_id,ro"`
        Category    string        `json:"category"`
        Nationality string        `json:"nationality"`
}

type dishStruct struct {
        ID         bson.ObjectID `json:"-"        bson:"_id,ro"`
        CategoryID bson.ObjectID `json:"-"        bson:"category_id"`
        Category   string        `json:"category" bson:"-"`
        Dish       string        `json:"dish"`
        Price      float32       `json:"price"`
}

type dishEvent struct {
        Target string      `json:"target"`
        Dish   *dishStruct `json:"dish"`
}
type subscriberDishes struct {
        msgs      chan dishEvent
        closeSlow func()
}
type catgEvent struct {
        Target   string        `json:"target"`
        Category *menuCategory `json:"category"`
}
type subscriberCatgs struct {
        msgs      chan catgEvent
        closeSlow func()
}
type Api struct {
        db minidb.MiniDB
        auth auth.Api

        subsDishes     map[*subscriberDishes]struct{}
        subDishesMutex sync.Mutex

        subsCatgs     map[*subscriberCatgs]struct{}
        subCatgsMutex sync.Mutex
}
func NewApi(db minidb.MiniDB, authApi auth.Api) Api {
        return Api{
                db: db,
                auth: authApi,
                subsDishes: make(map[*subscriberDishes]struct{}),
                subsCatgs: make(map[*subscriberCatgs]struct{}),
        }
}

func (api *Api) pubDishes(target string, dish *dishStruct) {
        for sub := range api.subsDishes {
		select {
		case     sub.msgs <- dishEvent{target, dish}:
		default: go sub.closeSlow()
		}
        }
}
func (api *Api) pubCatgs(target string, category *menuCategory) {
        for sub := range api.subsCatgs {
		select {
		case     sub.msgs <- catgEvent{target, category}:
		default: go sub.closeSlow()
		}
        }
}

var errDishNotFound error = &util.HttpError{
        Code: http.StatusNotFound,
        Text: "dish not found",
}
var errCategoryNotFound error = &util.HttpError{
        Code: http.StatusNotFound,
        Text: "category not found",
}
var errCategoryInUse error = &util.HttpError{
        Code: http.StatusConflict,
        Text: "this menu category is in use",
}
var errUnknownCategory error = &util.HttpError{
        Code: http.StatusBadRequest,
        Text: "unknown category",
}
var errDishExists = &util.HttpError{
        Code: http.StatusConflict,
        Text: "such dish already exists",
}
var errCategoryExists = &util.HttpError{
        Code: http.StatusConflict,
        Text: "such category already exists",
}


func (api *Api) findDishByName(name string) (dish dishStruct, err error) {
        err = api.db.FindTo(&dish, "dishes", bson.D{{"dish", name}})
        if errors.Is(err, minidb.ErrNotExists) {err = errDishNotFound}
        return
}
func (api *Api) findCategoryByName(name string) (category menuCategory, err error) {
        err = api.db.FindTo(&category, "menu_categories", bson.D{{"category", name}})
        if errors.Is(err, minidb.ErrNotExists) {err = errDishNotFound}
        return
}
func (api *Api) findCategoryById(id bson.ObjectID) (category menuCategory, err error) {
        err = api.db.FindTo(&category, "menu_categories", bson.D{{"_id", id}})
        if errors.Is(err, minidb.ErrNotExists) {err = errDishNotFound}
        return
}

/*
 * Those two return errUnknownCategory instead errCategoryNotFound
 * to distinguish between category not found in path and in relation
 */
func (dish *dishStruct) FillCategory(api *Api) error {
        category, err := api.findCategoryById(dish.CategoryID)
        if err != nil {
                if errors.Is(err, errCategoryNotFound) {err = errUnknownCategory}
                return err
        }
        dish.Category = category.Category
        return nil
}
func (dish *dishStruct) FillCategoryID(api *Api) error {
        category, err := api.findCategoryByName(dish.Category)
        if err != nil {
                if errors.Is(err, errCategoryNotFound) {err = errUnknownCategory}
                return err
        }
        dish.CategoryID = category.ID
        return nil
}


func (api *Api) insertDish(dish dishStruct) error {
        if err := dish.FillCategoryID(api); err != nil {return err}
        err := api.db.Create("dishes", dish)
        if errors.Is(err, minidb.ErrAlreadyExists) {err = errDishExists}

        api.pubDishes(dish.Dish, &dish)
        return err
}

func (api *Api) insertCategory(category menuCategory) error {
        err := api.db.Create("menu_categories", category)
        if errors.Is(err, minidb.ErrAlreadyExists) {err = errCategoryExists}

        api.pubCatgs(category.Category, &category)
        return err
}

func (api *Api) findDishes(filter bson.D) (found []dishStruct, err error) {
        err = api.db.FindTo(&found, "dishes", filter)
        if err != nil {return}

        for i, _ := range found {
                if err = found[i].FillCategory(api); err != nil {return}
        }
        return
}

func (api *Api) dishesInCategory(name string) ([]dishStruct, error) {
        category, err := api.findCategoryByName(name)
        if err != nil {return []dishStruct{}, err}
        return api.findDishes(bson.D{{"category_id", category.ID}})
}

func (api *Api) deleteDish(name string) error {
        deleted, err := api.db.Delete("dishes", bson.D{{"dish", name}})
        if err != nil && deleted == 0 {err = errDishNotFound}

        api.pubDishes(name, nil)
        return err
}

func (api *Api) deleteCategory(name string) error {
        category, err := api.findCategoryByName(name)
        if err != nil {return err}

        if api.db.AreAny("dishes", bson.D{{"category_id", category.ID}}) {return errCategoryInUse}

        deleted, err := api.db.Delete("menu_categories", bson.D{{"category", name}})
        if err != nil {
                if deleted == 0 {err = errCategoryNotFound}
                return err
        }

        api.pubCatgs(name, nil)
        return nil
}


func (api *Api) modifyDish(name string, change dishStruct) error {
        target, err := api.findDishByName(name)
        if err != nil {return err}

        if err = target.FillCategory(api); err != nil {return err}

        if change.Category != "" && target.Category != change.Category {
                if err = change.FillCategoryID(api); err != nil {return err}
                target.CategoryID = change.CategoryID
        }
        if change.Dish != ""   {target.Dish = change.Dish}
        if change.Price != 0.0 {target.Price = change.Price}

        err = api.db.Replace("dishes", bson.D{{"dish", name}}, target)
        if err != nil {return err}

        api.pubDishes(name, &target)
        return nil
}

func (api *Api) modifyCategory(name string, change menuCategory) error {
        target, err := api.findCategoryByName(name)
        if err != nil {return err}

        updateDishes := false

        if change.Category != "" && change.Category != target.Category {
                updateDishes = true
                target.Category = change.Category
        }
        if change.Nationality != "" {target.Nationality = change.Nationality}

        // Update category
        err = api.db.Replace("menu_categories", bson.D{{"category", name}}, target)
        if !updateDishes || err != nil {return err}

        api.pubCatgs(name, &target)

        // Find new id and update it in dishes
        newCat, err := api.findCategoryByName(change.Category)
        if err != nil {return err}

        return api.db.Update(
                "dishes",
                bson.D{{"category_id", target.ID}},
                bson.D{{"category_id", newCat.ID}},
        )

        // There also should be pubDishes for each changed one
}
