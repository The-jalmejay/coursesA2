let express = require("express");
let app = express();
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH,DELETE,HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
var port = process.env.PORT||2450;
app.listen(port, () => console.log(`Node app listening on port jai~ ${port}!`));
const { customers, courses, faculties, classes, students } = require("./courseserver");
app.post("/login", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  // console.log(email,password);
  let cust = customers.find((item) => (item.email === email && item.password === password));
  let custRes = {
    email: cust.email,
    role: cust.role,
    name: cust.name,
  }
  if (cust) {
    res.send(custRes);
  }
  else {
    res.status(500).send("Invalid username or password !");
  }
});
app.post("/register", function (req, res) {
  let maxId = customers.reduce((acc, cur) => (acc > cur.custId ? acc : cur.custId), 0);
  let body = req.body;
  console.log("bofy", body);
  const cust = {
    custId: maxId + 1,
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    role: req.body.role,
  };
  if (req.body.role === "student") {
    let maxId = students.reduce((acc, cur) => (acc > cur.id ? acc : cur.id), 0);
    console.log("stud", maxId)
    const std = {
      id: maxId + 1,
      name: req.body.name,
      dob: "",
      gender: "",
      about: "",
      courses: [],
    }
    students.unshift(std);
  }
  if (req.body.role === "faculty") {
    let maxId = faculties.reduce((acc, cur) => (acc > cur.id ? acc : cur.id), 0);
    const ft = {
      id: maxId + 1,
      name: req.body.name,
      courses: []
    }
    faculties.unshift(ft);
  }
  console.log(cust);
  customers.unshift(cust);
  let customerRes = {
    name: cust.name,
    email: cust.email,
    role: cust.role,
  }
  res.send(customerRes);
})
app.get("/getAllStudents", function (req, res) {
  let courses = req.query.courses;
  // console.log(courses);
  let coursesArr = courses ? courses.split(",") : [];
  // console.log(coursesArr)
  let page = req.query.page ? req.query.page : 1;
  let arr = students;
  // console.log(arr);
  if (courses) {
    arr = arr.filter((e) => coursesArr.find(c => e.courses.find(c2 => c2 === c)));
  }
  // console.log("ji",arr);
  let resArr = pagination(arr, parseInt(+page));
  let startIndex = (+page - 1) * 3;
  // console.log(startIndex,page);
  // let end = totalNum > start + 3 - 1 ? start + 3 - 1 : totalNum - 1;
  let endIndex = arr.length > startIndex + 3 - 1 ? startIndex + 3 - 1 : arr.length - 1;
  res.json({
    page: parseInt(page),
    items: resArr,
    totalNum: arr.length,
    totalItems: resArr.length,
    startIndex: startIndex,
    endIndex: endIndex,
  })
});

app.get("/getCourses", function (req, res) {
  res.send(courses);
});
app.get("/getStudentNameList", function (req, res) {
  let arr = students.reduce((a, c) => (a.find(e => e === c.name) ? a : [...a, c.name]), []);
  res.send(arr);
})
app.get("/getFacultyNameList", function (req, res) {
  let arr = faculties.reduce((a, c) => (a.find(e => e === c.name) ? a : [...a, c.name]), []);
  res.send(arr);
})
app.put("/putCourse", function (req, res) {
  let body = req.body;
  // console.log("put", body);
  let listOfStudent = body.students;
  let listOfFaculty=body.faculty;
  let index = courses.findIndex(e => e.courseId === body.courseId);
  if (index >= 0) {
    courses[index] = body;
    res.send(body);
  }
  else {
    res.status(404).send("No Data Found");
  }
  students.map(e => {
    let fins = listOfStudent.find(s => s === e.name);
    let finstd = students.find(s => s.name === fins);
    if (fins) {
        finstd.courses.push(req.body.name);
    }
    else {
      let fini = students.filter(s => s.courses.find(c => c === req.body.name));
      let reststd = fini.map(e => e.name);
      let rfin = reststd.filter(e => listOfStudent.indexOf(e) === -1);
      rfin.map(e => {
        let fins = students.find(s => s.name === e);
        let ind = fins.courses.findIndex(s => s === req.body.name);
        if (fins) {
          fins.courses.splice(ind, 1);
        }
      })
    }
  });
  faculties.map(e => {
    let fins = listOfFaculty.find(s => s === e.name);
    let finstd = faculties.find(s => s.name === fins);
    if (fins) {
        finstd.courses.push(req.body.name);
    }
    else {
      let fini = faculties.filter(s => s.courses.find(c => c === req.body.name));
      let reststd = fini.map(e => e.name);
      let rfin = reststd.filter(e => listOfFaculty.indexOf(e) === -1);
      rfin.map(e => {
        let fins = faculties.find(s => s.name === e);
        let ind = fins.courses.findIndex(s => s === req.body.name);
        if (fins) {
          fins.courses.splice(ind, 1);
        }
      })
    }
  });



});
app.get("/getFaculties", function (req, res) {
  let courses = req.query.courses;
  // console.log(courses);
  let coursesArr = courses ? courses.split(",") : [];
  // console.log(coursesArr)
  let page = req.query.page ? req.query.page : 1;
  let arr = faculties;
  // console.log(arr);
  if (courses) {
    arr = arr.filter((e) => coursesArr.find(c => e.courses.find(c2 => c2 === c)));
  }
  // console.log("ji",arr);
  let resArr = pagination(arr, parseInt(+page));
  let startIndex = (+page - 1) * 3;
  // console.log(startIndex,page);
  // let end = totalNum > start + 3 - 1 ? start + 3 - 1 : totalNum - 1;
  let endIndex = arr.length > startIndex + 3 - 1 ? startIndex + 3 - 1 : arr.length - 1;
  res.json({
    page: parseInt(page),
    items: resArr,
    totalNum: arr.length,
    totalItems: resArr.length,
    startIndex: startIndex,
    endIndex: endIndex,
  })
});
app.get("/getStudentCourse/:username", function (req, res) {
  let username = req.params.username;
  console.log(username);
  let arr = courses.filter(c => c.students.find(e => e === username));
  let fin = courses.find(c => c.students.find(e => e === username));
  if (fin) {
    console.log("135", arr);
    res.send(arr);
  }
  else {
    res.status(500).send("No data found");
  }
});
app.get("/getStudentClass/:username", function (req, res) {
  let username = req.params.username;
  console.log(username);
  let arr = students.find(c => c.name === username);
  let corArr = arr.courses;
  console.log(corArr);
  let studentArr = classes.filter((e) => corArr.find(c => c === e.course));
  console.log("st", studentArr);
  res.send(studentArr);
});

app.post("/postStudentDetails", function (req, res) {
  let fin = students.find(e => e.name === req.body.name);
  let index = students.findIndex(e => e.name === req.body.name);
  let std = {
    id: fin.id,
    name: req.body.name,
    dob: req.body.dob,
    gender: req.body.gender,
    about: req.body.about,
    courses: fin.courses,
  }
  console.log(std);
  students[index] = std;
  res.send(std);
});
app.get("/getStudentDetails/:username", function (req, res) {
  let username = req.params.username;
  let fin = students.find(e => e.name === username);
  res.send(fin)
});
app.get("/getFacultyCourse/:username", function (req, res) {
  let username = req.params.username;
  console.log(username);
  let arr = courses.filter(c => c.faculty.find(e => e === username));
  let fin = courses.find(c => c.faculty.find(e => e === username));
  if (fin) {
    console.log("247", arr);
    res.send(arr);
  }
  else {
    res.status(500).send("No data found");
  }
});
app.get("/getFacultyClass/:username", function (req, res) {
  let username = req.params.username;
  console.log(username);
  let arr = faculties.find(c => c.name === username);
  let corArr = arr.courses;
  console.log(corArr);
  let facultyArr = classes.filter((e) => corArr.find(c => c === e.course));
  console.log("st", facultyArr);
  res.send(facultyArr);
});
app.get("/getCourseArr/:username",function(req,res){
  let username = req.params.username;
  let fin=faculties.find(e=>e.name===username);
  res.send(fin.courses);
});
app.post("/postClass",function(req,res){
 let body=req.body;
 let maxId=classes.reduce((a,c)=>(a>c.classId?a:c.classId),0);
 let update={classId:maxId+1,...body}
 classes.push(update);
 res.send(update);
});
app.get("/getClass/:id",function(req,res){
  let id=+req.params.id;
  let fin=classes.find(e=>e.classId===id);
  res.send(fin);
})
app.put("/postClass/:id",function(req,res){
  let id=+req.params.id;
  let body=req.body;
  let index=classes.findIndex(e=>e.classId===id);
  if(index>=0){
    classes[index]=body;
    res.send(body);
  }
  else{
    res.status(400).send("No data Found");
  }
})
pagination = (obj, page) => {

  resArr = obj.slice(page * 3 - 3, page * 3);
  //page=1
  //1*3-3,1*3
  //3-3,3
  //3,3;
  return resArr;

}