var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable = require('formidable');
var readdir2 = require('readdir-recursive-promise');
var rimraf = require('rimraf');

/* GET home page. */
router.get('/', function(req, res, next) {

    //get the files inside our uploadedFiles directory

    var parentFolder = './uploadedFiles/';

    //get the names of the subdirectories and files

    var allFilesData = []; // array of objects .. each object contains name and date and folder name(id)

    readdir2.readdirAsync(parentFolder).then(function(res) {

        res.files.forEach(function(folder){

            // use the stat function on the path to get the date of the folder creation .. we will use the sync instead of the default async one
            var stats = fs.statSync(folder.path);




            //getting the date
            var originalDate = stats.ctime;



            var uploadedFolderData = {
                folderName : folder.name,
                fileName : folder.files[0].name,
                date : originalDate
            };

            allFilesData.push(uploadedFolderData);
        });

        //take the allFilesData(not sorted original format format) converted to (sorted original format)
        allFilesData.sort(function(file1,file2){
            return file2.date - file1.date;
        });

        //convert the original format to readable format
        allFilesData.forEach(function(file){
            var month = parseInt(file.date.getMonth())+1;
            var convertedDate = file.date.getDate() + ' / ' + month +' / '+ file.date.getFullYear();
            file.date = convertedDate;
        });


    }).then(function(){

        res.render('index', { title: 'ZIPZAP' , data:allFilesData});
    });




});




router.post('/deleteFile/:id', function(req, res, next) {

    var id = req.params.id;

    //used rimraf module for now instead of fs unlink because unlink will only remove files or empty folders
    rimraf('./uploadedFiles/'+id, function(err){

    if (err){
        console.log(err);
        res.redirect('/');
    }else{
        console.log('successfully deleted');
        res.redirect('/');
    }

    });

});








router.post('/upload', function(req, res, next) {


    var ourForm = new formidable.IncomingForm();

    ourForm.parse(req, function(err, fields, files) {

        //fakepath
        var old_path = files.file.path;

        //file is the name of the html field
        var uploadedFileName = files.file.name.split('.')[0];
        var uploadedFileExt = files.file.name.split('.')[1];

        //double check here aside from the client side check for the type passed and that something was passed
        //check if something was
        if (uploadedFileExt && uploadedFileExt.toUpperCase() === "ZIP") {
            //this part for duplicate names
            var pathID = old_path.lastIndexOf('/') + 1;
            var uniqueCode = old_path.substr(pathID); //a folder containing the uploaded file


            //create new directory with the unique upload id
            var newDir = './uploadedFiles/' + uniqueCode;
            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir);
            }

            //use this directory and create the file uploaded there
            var new_path = './uploadedFiles/' + uniqueCode + '/' + uploadedFileName + '.' + uploadedFileExt;


            fs.readFile(old_path, function (err, data) {
                fs.writeFile(new_path, data, function (err) {
                    if (err) {
                        //do nothing for now
                        console.log("error happened");
                        res.redirect('/');

                    } else {
                        //do nothing for now
                        console.log("file uploaded");
                        res.redirect('/');

                    }
                });
            });

        }else{
            console.log("nothing passed");
            res.redirect('/');

        }
    });


});


module.exports = router;



/*
var month = parseInt(originalDate.getMonth())+1;
 var convertedDate = originalDate.getDate() + ' / ' + month +' / '+ originalDate.getFullYear();


 */
