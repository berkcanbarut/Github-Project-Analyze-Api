const fs = require("fs")
const path = require("path");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const {projectRegister} = require("./project");

const userRegister = async (user,access_token,repos_url,organizations_url) =>{
    const token = accessTokenEncrypt(access_token);
    const projects = await userProjectId(repos_url,user.id);
    const organizations = await userOrganizationId(organizations_url);

    const projectIdList = projects.map(item => {
        return item.id;
    })
    user = {
        ...user,
        access_token : token,
        projects : projectIdList,
        organizations : organizations,
    }

    const pathString = path.join(__dirname,"../data/users.json");
    let userList = fs.readFileSync(pathString);

    userList = JSON.parse(userList);

    const index = userList.findIndex(e => e.id == user.id);

    if(index == -1){
        userList.push(user);
    }
    else {
        userList[index].access_token = token;
        userList[index].projects = projectIdList;
    }

    userList = JSON.stringify(userList);

    fs.writeFile(pathString,userList,err =>{
        if(err){
            throw Error("JSON FILE WRITE ERROR");
        }
    })
    return {
        success : true,
        token : token,
        user : user,
        projects : projects
    }
}

const userProjectId = async (url,owner) =>{
    const repoResponse = await axios.get(url)
        .then(response => {return response})
        .catch(err => {
            throw err;
        });
    let projectList = [];

    if(repoResponse.status == 200){
        let addProjectList =  await projectRegister(repoResponse.data,owner);
        projectList = repoResponse.data.map(project => {
            return project.id
        });
        return addProjectList;
    }
}

const userOrganizationId = async(url) =>{
    const organizationResponse = await axios.get(url)
    .then(response => {
        return response
    })
    .catch(err => {
        throw Error("Github Get Repos Request Error");
    });
    
    let organizationsList = [];
    
    if(organizationResponse.status == 200){
        if(organizationResponse.data.lenght > 0){
            organizationsList = organizationResponse.data.map(organization => {
                return organization.id
            });
        }
    }
    return organizationsList;
}

const accessTokenEncrypt = (access_token) => {
    const secretKey = process.env.CRYPTO_SECRET_KEY;
    const token = CryptoJS.AES.encrypt(access_token,secretKey).toString();
    return token;
}

const accessTokenDecrypt = (access_token) => {
    const secretKey = process.env.CRYPTO_SECRET_KEY;
    const bytes  = CryptoJS.AES.decrypt(access_token,secretKey);
    const decodedToken = bytes.toString(CryptoJS.enc.Utf8);
    return decodedToken;
}

module.exports = userRegister;