const path = require("path");
const axios =  require("axios").default;
const querystring = require("node:querystring");
const fs = require("fs");
const {performance} = require("perf_hooks");
const userController = require("../helpers/user");
const {projectAnalyze,projectClone} =require("../helpers/project");

exports.getTokenGithub = async(req,res,next) =>{
    const client_id = process.env.GITHUB_CLIENT_ID
    const client_secret = process.env.GITHUB_CLIENT_SECRET
    const authToken = req.query.code;
    if(!authToken){
        res.status(404).json({
            success : false,
            message : "Github Code Not Found"
        })
    }
    const githubResponse = await axios.post(`https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${authToken}`)
        .then(response =>{
            if(response.status == 200){
                return response.data
            }
        })
        .catch(err =>{
            throw err;
        });
    req.githubResponse = githubResponse;
    next();
}

exports.getLoginUser =  async (req,res,next) => {

    const decoded = querystring.decode(req.githubResponse);

    const access_token = decoded.access_token;

    const user = await axios.get("https://api.github.com/user",{
        headers : {Authorization : `Bearer ${access_token}`}
        }).then(response =>{
            return response.data
        })
        .catch(err => {
            throw err;
        })
    
    const newUser = {
        id : user.id,
        userName : user.login,
        avatarUrl : user.avatar_url,
        email : user.email,
        bio : user.bio,
    }

    const status = await userController(newUser,access_token,user.repos_url,user.organizations_url);
    if(status.success){
        res.status(201).cookie("ct_token","Bearer:"+status.token,{
            httpOnly : true,
            expires : new Date(Date.now() + (60000 * 60)),
        }).json({
            user : status.user,
            projects : status.projects,
            token : status.token,
        });
    }
}

exports.getAuthentication = (req,res,next) => {
    const cookie = req.cookies;
    let authToken = cookie.ct_token;
    if(authToken == undefined){
        return res.status(401).json({
            success : false,
            message : "Please Login",
        }) 
    }
    authToken = authToken.split(":")[1];
    const pathString = path.join(__dirname,"../data/users.json");
    let userList = fs.readFileSync(pathString);
    userList = JSON.parse(userList);

    const authUser = userList.find(user => user.access_token == authToken );

    if(authUser){
        req.user = authUser;
        next();
    }
    else {
        res.status(401).json({
            success : false,
            message : "Please Login",
        })
    }
}

exports.getUserInfo = async (req,res,next) => {
    const user = req.user;

    res.status(200).json({
        success : true,
        data : user,
    });
}

exports.getProjectInfo = (req,res,next) => {
    const projectId = req.query.id;
    const pathString = path.join(__dirname,"../data/projects.json");
    let projectList = fs.readFileSync(pathString);
    projectList = JSON.parse(projectList);

    const project = projectList.find(project => project.id == projectId);

    if(project){
        res.status(200).json({
            success : true,
            data : project,
        })
    }
    else{
        res.status(404).json({
            success : true,
            message : "Project not found",
        })
    }

}

exports.getProjectClone = async (req,res,next) => {
    const projectId = req.query.key;
    const user = req.user;
    
    const pathString = path.join(__dirname,"../data/projects.json");
    let projectList = fs.readFileSync(pathString);
    projectList = JSON.parse(projectList);

    const project = projectList.find(project => project.id == projectId);
    if(project){
        if(project.platforms != null){
            return res.status(200).json({
                success : true,
                data : project,
            })
        }
        else {        
            const startTime = performance.now()
            let {analyzePath,platforms} = projectClone(project,user);
            
            platforms = await projectAnalyze(analyzePath,project,platforms);
            const endTime = performance.now();

            project.platforms = platforms
            project.duration = (endTime - startTime);
            const index = projectList.findIndex(item => item.id == project.id);
            projectList[index] = project;

            fs.writeFile(pathString,JSON.stringify(projectList),err =>{
                if(err){
                    throw Error("JSON FILE WRITE ERROR");
                }
            })

            return res.status(200).json({
                success : true,
                data : project
            });
        }
    }
    else {
        res.status(404).json({
            success : true,
            message : "Project not found",
        })
    }

}
