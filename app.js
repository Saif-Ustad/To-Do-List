const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(express.static("public"));

//mongodb connection
//mongoose.connect("mongodb://127.0.0.1:27017/toDoList", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://Saif-Ustad:saif0509@cluster0.onl9hci.mongodb.net/toDoList", {useNewUrlParser: true});

//mongoose schema
const itemsSchema = mongoose.Schema({
    name: String
});

//mongoose model for collection items
const Item = mongoose.model("item", itemsSchema );

const item1 = new Item({
    name:"Eat Food"
});

const item2 = new Item({
    name:"Cook Food"
});

const item3 = new Item({
    name:"Good Food"
});


//var items = ["Eat Food", "Cook Food", "Make Food"];

var workList = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {

    var day = date.getDate();

    Item.find({}, function(err, foundItems){
        
        if(foundItems.length === 0)
        {
            Item.insertMany([item1, item2, item3], function(err){
                if(err)
                {
                    console.log(err);
                }else{
                    console.log("3 items added successfully");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", { listTitle: day, newListItem: foundItems });
        }
        
    })

    
})

const listSchema = {
    name: String,
    item: [itemsSchema]
} 

const File = mongoose.model("file", listSchema);



app.get("/:newTitle", function(req, res){
    const newTitle = _.capitalize(req.params.newTitle) ;
    const defaultItems = [item1, item2, item3] ;

    File.findOne({name:newTitle}, function(err, foundList){
        if(!err)
        {
            if(!foundList){
                const file = new File({
                name:newTitle,
                item: defaultItems
                });
                file.save();
                res.redirect("/" + newTitle);

            }else{
                res.render("list", {listTitle: newTitle, newListItem: foundList.item  });
            }
        }
    });
        
      
    
});


app.post("/", function (req, res) {
    var item = req.body.newItem;
    var listTitle = req.body.list;
    
    /*
    if (list === "Work List") {
        workList.push(item);
        res.redirect("/work");
    }
    else {
        
        const DBitem = new Item({
            name:req.body.newItem
        });
        
        DBitem.save();

        //items.push(item);
        res.redirect("/");
    } */

    const DBitem = new Item({
        name:item
    });
    
    if(listTitle === date.getDate())
    {
       
        DBitem.save();
        res.redirect("/");
    }else{
           File.findOne({name:listTitle}, function(err, foundList){
           foundList.item.push(DBitem);
           foundList.save();
           res.redirect("/" + listTitle);
        });
        
    }


})

app.post("/delete", function(req,res){
    const CheckboxId = req.body.checkbox ;
    const ListName = req.body.ListName ;

    if(ListName === date.getDate())
    {
        Item.findByIdAndRemove(CheckboxId, function(err){
            if(err)
            {
                console.log(err);
            }else{
                console.log("deleted successfuly");
                res.redirect("/");
            }
        });
        
    }else{
        //find the list and remove from database
        File.findOneAndUpdate({name:ListName}, {$pull: {item: {_id: CheckboxId} } }, function (err , foundList){
            if(!err)
            {
                res.redirect("/" + ListName);
            }
        })

    }
   
    
})

/*
app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItem: workList });
})
*/


app.listen(process.env.PORT || 3000, function () {
    console.log("server has been started on port 3000");
})