# Prostate Cancer Findings

Prostate Cancer Findings is a web application for identification of clinically significant prostate cancer in MRI, developed on Tesseract-MI platform. 

Installation
---------
**What you need:**

1. Nodejs
2. Meteor to run the app
3. If you want to use DICOM server (dcm4che or Orthnac) [*Optional*]


**How to start the app:**

1. Install Nodejs : https://nodejs.org/en/download/

2. Install Meteor : https://www.meteor.com/install
	- First install **Chocolatey**, by runingn this command using an **Administrator command prompt**: 
	````
	@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
	````	
3. In the app directory:
    * to install npm packages run: `meteor npm install`
	
4. Finally, run this command using an **General command prompt**: `meteor`

----------------------------
**If you want to use your own DICOM server setup then In the app directory:**

	* for orthanc run: `METEOR_PACKAGE_DIRS="packages" meteor`
	* for dcm4chee run: `METEOR_PACKAGE_DIRS="packages" meteor --settings config/dcm4cheeDICOMWeb.json`
    
For Developers
---------
Technologies:

* Docker
* Meteor
* MongoDB
* BlazeJs/Spacebars
* Node.js
* JavaScript
* HTML
* CSS/Stylus
* VPS

Main app components:

**tesseract-ai**:
Components and functionality for AI.

**tesseract-fiducial**:
Similar to cornerstone tools probe with customizable information.

**tesseract-report**:
Reporting area for any predictions and calculations, also contains the settings for AI models.

**tesseract-server-probe**:
A cornerstone tool probe like tool that displays findings on the DICOM images. The probe cannot be deleted or manipulated by user.

**tesseract-sync-scroll**:
A toll similar to crosshair tool from cornerstone tools to sync the scrolling on view ports.

**tesseract-cancer-study**:
A replaceable package to add different cancer studies to the app.

**tesseract-sync-tools**:
A tool to sync tools like probe or any other drawing tool.

Deploying to Production VPS
---------
You need app specific files on App's root directory for deploying to server:

1. Orthanc configuration file **orthanc.json**, generate this file by following <a href="http://book.orthanc-server.com/users/docker.html#id5" target="_blank">this</a> instruction
2. App configuration **production.env** which is similar to development.env file
3. In **models** directory run ```docker-compose up -d```
4. In **main** directory run ```docker-compose up -d```

These files contain all the confirmation and important information like password and server IP for orthanc and MongoDB to connect.

Orthanc username and password can be changed in orthanc.json file.

Orthanc Installation
---------
### Docker usage
Following the instructions below, the docker image will listen for DICOM connections on port 4242, and for web traffic on port 8042. The default username for the web interface is `orthanc`, and the password is `orthanc`.
#### Temporary data storage
````
docker run --rm -p 4242:4242 -p 8042:8042 jodogne/orthanc-plugins
````

#### Persistent data storage
1. Create a persistant data volume for Orthanc to use

    ````
    docker create --name sampledata -v /sampledata jodogne/orthanc-plugins
    ````

    **Note: On Windows, you need to use an absolute path for the data volume, like so:**

    ````
    docker create --name sampledata -v '//C/Users/erik/sampledata' jodogne/orthanc-plugins
    ````

2. Run Orthanc from Docker with the data volume attached

    ````
    docker run --volumes-from sampledata -p 4242:4242 -p 8042:8042 jodogne/orthanc-plugins
    ````

3. Upload your data and it will be persisted


dcm4che Installation
---------
How to install dcm4che:

1. Install docker-compose https://docs.docker.com/compose/install/
2. Clone dcm4che from https://github.com/dcm4che-dockerfiles/dcm4chee-arc-psql
3. Run `docker-compose up` in dcm4che directory
