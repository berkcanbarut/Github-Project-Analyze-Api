> # The Task Details

- **Writing an API that connects to a dynamically given GitHub account using OAuth v2 authentication.**

### Here are the use cases and requirements

- A User will be created using the authenticated user information from Github. Use a
database to store this User information or store it inside a JSON file. You must encrypt the
access token before storing it in the User object. All data types are specified under the
Notes section.

- A service that runs after a successful authentication that will save the organizations and
repositories allowed by the user inside the User object. Github organizations in
organizations field and repositories will be saved in the projects field/property of the User.

- A service will be written to perform the analysis when the user triggers it. The service will
clone the project (from the github repository) to be analyzed under the Clones directory.
After the cloning process is finished, the directory where the project is located will be
traversed. All files in the Clones directory will be checked and technology/platform used
in the traversed project will be detected with the capacity of at least 3 platforms (JS, CS,
CPP, PY etc). All these files will be grouped by its platform inside a new directory whose
name is the platform.

- Individual projects will be listed in the folder named after the user who created them. And
the files will be grouped under a platform directory to which they belong.

- Also service will create a Project object before the cloning process and will update
platforms property/field. Moreover, it will calculate the elapsed time between when the
analysis is triggered and ends. At last this duration will be stored in the duration field of
the Project object.

> # The Endpoints
### Here are the endpoint relative URLs that your API should support

- GET /access/github (authenticate with OAUTH2)
- GET /projects?key=<organization_name> (list projects)
- GET /analyze?key=<project_id> (analyze project)
- GET /user (get user information)
- GET /project?id=< project_id> (get overview information)
