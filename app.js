const express=require("express");
const bodyParser=require("body-parser");
//const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
const  _=require("lodash");


const app=express();

const port = 3000;
const uri="mongodb+srv://ank:Ankit@123@cluster0.xqgqi.mongodb.net/todoListDB"
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema= new mongoose.Schema({
  name :String
});



const Item=mongoose.model("Item",itemsSchema);

const Sleep =new Item({name:"sleep"});
const Cook =new Item({name:"Cook Food"});
const Eat =new Item({name:"Eat Food"});

const defaultItems=[Sleep,Cook,Eat];


const listSchema= new mongoose.Schema({
name:String,
items:[itemsSchema]
});

const List=mongoose.model("List",listSchema);





app.get("/",function(req,res){

//name:"sleep"
  Item.find({},function(error,docs){

    if(docs.length===0){
      Item.insertMany(defaultItems,function(error){
        if(error){
          console.log(error);
        }else{
          console.log("Data inserted") ;
        }
      });

    };


    if(error){
      console.log(error);
    }else{
      res.render("list",{listTitle:"Today",newListitems:docs});
    };

  });




 //var day="";

  // if(today.getDay()==0 || today.getDay()==6){
  //   day="Weekend";
  // }else{
  //   day="Weekday";
  // }


// var weekday = new Array(7);
// weekday[0] = "Sunday";
// weekday[1] = "Monday";
// weekday[2] = "Tuesday";
// weekday[3] = "Wednesday";
// weekday[4] = "Thursday";
// weekday[5] = "Friday";
// weekday[6] = "Saturday";
//
//  day = weekday[today.getDay()];
//
//
//   res.render("list",{kindofDay:day});
});

app.post("/",function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item =new Item({name:itemName});

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(error,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }

});

app.post("/delete",function(req,res){
const checkedboxitem=req.body.checkeditem;
const listName=req.body.listName;

if(listName===" Today"){

  Item.findByIdAndRemove(checkedboxitem,function(err){
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });

}else{

List.findOneAndUpdate(
  {name:listName},
  {$pull:{items:{_id:checkedboxitem}}},
  function(error,foundList){
    if(!error){
      res.redirect("/"+listName);
    }
  })

}

});




app.get("/:customListName",function(req,res){

//_.capitalize
  const customListName=_.startCase(_.toLower(req.params.customListName));



 List.findOne({name:customListName},function(error,foundList){

   if(error){
     console.log(error);
  }else{

    if(!foundList){
      //Create a new list
      const newcustomListName =new List({
        name:customListName,
        items:defaultItems
      });

     newcustomListName.save();

     res.redirect("/"+customListName);
    }else{
      //Show an existing list
      res.render("list",{listTitle:foundList.name,newListitems:foundList.items});
    }
  }
 });



});


app.get("/about",function(req,res){
  res.render("about");
})



app.listen(port,function(){
  console.log(`Server is listening at port http://localhost:${port}`);
});
