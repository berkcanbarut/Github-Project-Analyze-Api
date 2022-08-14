const fs = require("fs")
const path = require("path");
const shell = require("shelljs");
const projectRegister = (projects,owner) => {
    const pathString = path.join(__dirname,"../data/projects.json");
    let projectList = fs.readFileSync(pathString);

    const addProjectList = projects.map(item => {
        return {
            id : item.id,
            name : item.name,
            size : item.size,
            duration : 0,
            owner : owner,
            platforms : null,
        }
    })
    projectList = JSON.parse(projectList);

    let filterProjects = projectList.filter(item => item.owner != owner);

    addProjectList.forEach(element => {
        filterProjects.push(element);
    });

    filterProjects = JSON.stringify(filterProjects);

    fs.writeFile(pathString,filterProjects,err =>{
        if(err){
            throw Error("JSON FILE WRITE ERROR");
        }
    })
    return addProjectList;
}

const projectClone = (project,user) => {
    const gitCloneString = `git clone https://github.com/${user.userName}/${project.name}`;
    
    shell.cd(path.join(__dirname,"../app/Clones"));
    shell.exec(gitCloneString);
    
    shell.cd(path.join(__dirname,"../app/Projects"));

    let files = fs.readdirSync(path.join(__dirname,"../app/Projects"))

    const userFile = files.find(item => item == user.userName);

    if(!userFile){
        shell.mkdir(`./${user.userName}`);
    }
    shell.mkdir(`./${user.userName}/${project.name}`);

    shell.mkdir(`./${user.userName}/${project.name}/CPP`);
    shell.mkdir(`./${user.userName}/${project.name}/PY`);
    shell.mkdir(`./${user.userName}/${project.name}/JS`);
    
    shell.cd(path.join(__dirname,`../app/Projects/${user.userName}/${project.name}`));
    const analyzePath = path.join(__dirname,`../app/Clones/${project.name}`);
    let platforms = [{platformName : "CPP" , count : 0},{platformName : "PY" , count : 0},{platformName : "JS" , count : 0}]
    
    return {
        analyzePath,
        platforms,
    }

}

const projectAnalyze = function fromDir(startPath,project,platforms) {

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }
    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()) {
            platform = fromDir(filename,project,platforms);
        } else {
            if(filename.endsWith(".cpp")){
                shell.cp(filename,"./CPP");
                platforms = platforms.map( item => {
                    if(item.platformName == "CPP"){
                        item.count += 1
                        return item;
                    }
                    return item;
                })
            }
            else if(filename.endsWith(".py")){
                shell.cp(filename,"./PY");
                platforms = platforms.map( item => {
                    if(item.platformName == "PY"){
                        item.count += 1
                        return item;
                    }
                    return item;
                })
            }
            else if(filename.endsWith(".js") || filename.endsWith(".ts") || filename.endsWith(".jsx")){
                shell.cp(filename,"./JS");
                platforms = platforms.map( item => {
                    if(item.platformName == "JS"){
                        item.count += 1
                        return item;
                    }
                    return item;
                })
            }
        };
    };
    return platforms;
};

module.exports = {
    projectRegister,
    projectAnalyze,
    projectClone
};