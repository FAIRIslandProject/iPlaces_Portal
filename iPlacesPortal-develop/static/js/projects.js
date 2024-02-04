// Base URL for fetching all projects from GEOME
const baseURL = 'https://api.geome-db.org/projects/stats?'
// API URL
const apiBaseURL = 'https://raw.githubusercontent.com/BNHM/AmphibiaWebDiseasePortalAPI/master/data/'

// Initialize local storage variable
let bigdatafile

//Uses the project Id to grab samples for each project and builds a chart.
function byProjectId(id) {
  fetch(`${apiBaseURL}scientificName_projectId_${id}.json`)
  .then(res => res.json())
  .then(function(data) {

    let scientificName = []
    let value = []
    
    data.forEach(entry => {
      // Exclude Unknown from charts
      if (entry.scientificName != 'Unknown') {
        scientificName.push(entry.scientificName)
        value.push(entry.value)
      }
    })
    buildChartAdjustedWidth(data.length, scientificName, value)
  })
}

function buildChartAdjustedWidth(dataLength, scientificName, value) {
  // console.log(dataLength)
  let chartWrapper = document.querySelector('.sample-chart-wrapper')
  let canvas = document.getElementById('sampleChart')
  let chartContainer = document.getElementById('sample-chart-container')
  let barType = 'bar'
  let rotation = 60

  if (dataLength <= 21) { // Less than 21
    newWidth = '100%' 
  } else if (dataLength > 21 && dataLength <= 50) { // more than 21 less than 50
    newWidth = '2000px'
  } else if (dataLength >= 51 && dataLength <= 99) { //More than 51 less than 99
    newWidth = '3000px'
  } else if (100 <= dataLength && dataLength <= 200) { // More than 100 less than 200
    newWidth = '6000px'  
  } else if (dataLength >= 2000 ) { // more than 2000
    // make two charts here? one with value less than 500 and one with over 500??
    newWidth = '4000px' 
    canvas.style.height = '61000px'
    chartWrapper.style.height = '800px'
    barType = 'horizontalBar'
    rotation = 90
  } else {
    newWidth = '3000px'
  }

  chartContainer.style.width = newWidth
  return makeBarChart(scientificName, 'Samples Collected', value, barType, rotation)
}

// Recovers link from the fetch using the project id, creates an anchor for it and clicks it.
function downloadDataFile(id) {
  fetch(`https://api.geome-db.org/records/Event/excel?networkId=1&q=_projects_:${id}+_select_:%5BSample,Diagnostics%5D+`)
  .then(res => res.json())
  .then(function(data) {
    let a = document.createElement('a')
    let downloadLink = data.url
    a.href = downloadLink
    console.log(downloadLink)
    console.log(a)
    a.click()
  })
  .catch(err => {
    alert('something went wrong '+ err)
  })
}

// Uses Regex to find partial matches 
function findMatches(wordToMatch, projectData) {

  return projectData.filter(project => {
    // Global insensitive
    const regex = new RegExp(wordToMatch, 'gi')
    // Amphibian Disease Team ID is 45, only searches public projects.
    if(project.projectConfiguration.id == 45 && project.public == true) {
      // Checks to see which radio button is selected to do the search
      const radioPI = document.getElementById('rad-proj-pi').checked
      const radioName = document.getElementById('rad-proj-name').checked
      const radioAffiliation = document.getElementById('rad-proj-affiliation').checked
      const radioContact = document.getElementById('rad-proj-contact').checked
      const radioAnyPerson = document.getElementById('any-proj-person').checked
      
      //TODO: Needs handling if PI and affiliation are null but there is a title

      // Checks for which radio button is selected, if PI or Affiliation is null, excludes from search
      if (radioPI == true && radioName == false && radioAffiliation == false && radioContact == false && radioAnyPerson == false && project.principalInvestigator != null) {
          return project.principalInvestigator.match(regex)
      } if (radioName == true && radioPI == false && radioAffiliation == false && radioContact == false && radioAnyPerson == false) {
        return project.projectTitle.match(regex)
      } if (radioAffiliation == true && radioPI == false && radioName == false && radioContact == false && radioAnyPerson == false && project.principalInvestigatorAffiliation != null) {
        return project.principalInvestigatorAffiliation.match(regex)
      } if (radioContact == true && radioPI == false && radioName == false && radioAffiliation == false && radioAnyPerson == false && project.projectContact != null) {        
        return project.projectContact.match(regex)
      }  if (radioAnyPerson == true && radioContact == false && radioPI == false && radioName == false && radioAffiliation == false && project.projectContact != null && project.principalInvestigator != null) {        
        return project.projectContact.match(regex) || project.principalInvestigator.match(regex)
      }
    }
  })
}

// Displays Search Results in a table
function displayMatches() {
  const allProjTable = document.getElementById('projects-display')
  let tr = document.createElement('tr')

  bigdatafile = JSON.parse(localStorage.getItem("bigdatafile"))

  const matchArray = findMatches(this.value, bigdatafile.value)

  const html = matchArray.map(project => {
      const regex = new RegExp(this.value, 'gi')
      const projName = project.projectTitle == null ? 'None Found' : project.projectTitle.replace(regex, `<span class="hl">${this.value}</span>`);
      const projPI = project.principalInvestigator == null ? 'None Found': project.principalInvestigator.replace(regex, `<span class="hl">${this.value}</span>`)
      const projAffiliation = project.principalInvestigatorAffiliation == null ? 'None Found' : project.principalInvestigatorAffiliation.replace(regex, `<span class="hl">${this.value}</span>`)
      const projContact = project.projectContact == null ? 'None Found' : project.projectContact.replace(regex, `<span class="hl">${this.value}</span>`)
      const formattedDate = new Date(project.latestDataModification).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});

      let icon
      if (project.discoverable && project.public == false) {
        icon = '<i class="fa fa-search" aria-hidden="true"></i>'
      } else {
        icon = '<i id="pubglobe" class="fa fa-globe"></i>'
      }

      return tr.innerHTML = `
      <tr>
      <td> ${icon} </td>
      <td class="th-resize-larger"> ${projName} </td>
      <td class="th-resize"> ${projPI} </td>
      <td class="th-resize-medium"> ${projAffiliation} </td>
      <td class="th-resize">${projContact}</td>
      <td>${formattedDate == null ? 'None Available' : formattedDate}</td>
      <td class="th-resize"><button onclick="window.location.href='/projects/?id=${project.projectId}'" class="detailsBtn" 
          id='project${project.projectId}'
          >Details</button></td>
          </tr>
      `
  }).join('')
  allProjTable.appendChild(tr)
  allProjTable.innerHTML = html
  } 
  
  // FETCH ALL PROJECT DATA AND STORE LOCALLY WITH EXPIRY
  function fetchProjectsStoreLocally() {

    fetch(baseURL)
    .then((res) => res.json())
    .then(data => {
      showLoader()
      // Setting local storage to expire in 24 hrs (approx)
      // Could be more precise but I don't think it really matters here 
      // as long as the data is refreshed about once a day.
      let oneDay = 1000 * 60 * 60 * 24
      bigdatafile = data
      setWithExpiry('bigdatafile', bigdatafile, oneDay)
      getWithExpiry(bigdatafile)
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => {
        hideLoader()
        displayProjects()
    })
  }

  function checkLocalStorage() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(bigdatafile) === null) {
        resolve(fetchProjectsStoreLocally())
      } else {
        reject('An error occured')
      }
    })
    }

  checkLocalStorage()


// Displays the data in a table.
function displayProjects() {
  let projectId = getUrlVars().id
  
  // If no project id is defined display project table using local storage
  if (projectId === undefined) { 
    const container = document.getElementById('detail-container')
    container.style.display = "none"

    const searchInput = document.querySelector('.search')

    searchInput.addEventListener('change', displayMatches)
    searchInput.addEventListener('keyup', displayMatches)

    bigdatafile = JSON.parse(localStorage.getItem("bigdatafile")).value

    return bigdatafile.forEach(function(project) {
      // 45 is the Amphibian Disease Portal TEAM configuration ID.
      if(project.projectConfiguration.id == 45) {
        let icon
        // Display public and discoverable projects
        if (project.public == true || project.discoverable == true) {

          // Different icon based on public or discoverable
          if (project.discoverable && project.public == false) { 
            icon = '<i class="fa fa-search" aria-hidden="true"></i>'
          } else {
            icon = '<i id="pubglobe" class="fa fa-globe"></i>'
          }
          const allProjTable = document.getElementById('projects-display')
          let tr = document.createElement('tr') // Table row
          // tr.style.cursor = 'pointer'
  
          const formattedDate = new Date(project.latestDataModification).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
  
          tr.innerHTML = `
            <td> ${icon} </td>
            <td> ${project.projectTitle} </td>
            <td> ${project.principalInvestigator == null ? 'None Listed' : project.principalInvestigator} </td>
            <td> ${project.principalInvestigatorAffiliation == null ? 'None Listed' : project.principalInvestigatorAffiliation} </td>
            <td>${project.projectContact == null ? 'None Listed' : project.projectContact}</td>
            <td>${formattedDate == null ? 'None Listed' : formattedDate}</td>
            <td class="th-resize"><button onclick="window.location.href='/projects/?id=${project.projectId}'" class="detailsBtn" 
            id='project${project.projectId}'
            >Details</button></td>
            `
          allProjTable.appendChild(tr)
  
          // Click on each table row to see project details
          // tr.addEventListener('click', function() { window.location.href = `/projects/?id=${project.projectId}` })
          }
      }
    })

  } else {
    bigdatafile = JSON.parse(localStorage.getItem("bigdatafile")).value
    hideMainTable()

    // Loops through the objects in localstorage
    for (let i = 0; i < bigdatafile.length; i++) {
      let local = bigdatafile[i]
      // Makes sure the project is public, is the right team (45), and that the project id matches.
      if (local.projectConfiguration.id == 45 && local.public == true && local.projectId == projectId) {
        const div = document.getElementById('project')
        let p = document.createElement('p')
        let sampleData = local.entityStats

        // Check if project contact is null
        let checkForProjectContact = () => {
          if(local.projectContact == null) {
            return `None Listed <br>`
          } else {
            return `${local.projectContact} <a href="mailto:${local.projectContactEmail}" target="_blank"><i class="fa fa-envelope"></i> </a><br>`
          }
        }

        // Check if date data last modified is null.
        let checkForModificationDate = () => {
          const modificationDate = local.latestDataModification
          let date = new Date(modificationDate).toDateString()

          if (modificationDate == null) {
            return 'Data Last Modified: Unavailable'
          } else {
            return `Data Last Modified: ${date}`
            
          }
        }
        
        // Check if dataset DOI is null.
        let checkForDataDoi =  () => {
          if (local.projectDataGuid == null) {
            return 'None Available'
          } else {
            return `<a href="${local.projectDataGuid}" target="_blank">${local.projectDataGuid}</a> `
          }
        } 

        // Check if Publication DOI is null.
        let checkForPublicationDoi = () => {
          if (local.publicationGuid == null) {
            return 'None Available'
          } else {
            return `<a href="${local.publicationGuid}" target="_blank">${local.publicationGuid}</a>`
          }
        }
        

        // Checks to see if there is event & sample data
        let handleSamples = () => {
          if (sampleData.EventCount == 0 || sampleData.EventCount == null) {
            return `No Sample Data Available<br>`
          } else {
            byProjectId(local.projectId)

            return `
            Events: ${sampleData.EventCount} || 
            Samples Collected: ${sampleData.SampleCount} 
            <br>
            <small> Click on each bar for more details. For larger datasets, chart scrolling is enabled.</small>

            <div class="sample-chart-wrapper"  style="margin: auto;">
              <div id="sample-chart-container">
                <canvas id="sampleChart" height="600px"></canvas>
              </div>
            </div>

            <br>

            <button id="data-btn" onclick="window.open('https://geome-db.org/query?q=_projects_:${local.projectId}')" target="_blank">Map Dataset in GEOME <i class="fa fa-external-link"></i></button>
            <button id="download-btn" onclick="downloadDataFile(${local.projectId})"><i class="fa fa-download"></i>Download Newest Datafile</button>
    
            `
          }
        }

        p.innerHTML = `
        <h2>${local.projectTitle}</h2>
        <h6 style="font-size:12px;">Recommended Citation: </h6>
        <h6 id="date">${local.recommendedCitation == null ? 'No Citation Available.' : local.recommendedCitation} <br> ${checkForModificationDate()}</h6>

        
        <h3>Project Description</h3>
        <hr>
        ${local.description == null ? 'No Description Availabe' : local.description}

        <h3>Information</h3>
        <hr>
        Project PI: ${local.principalInvestigator == null ? 'None' : local.principalInvestigator} <br>
        Project Contact: ${checkForProjectContact()}
        Dataset DOI: ${checkForDataDoi()}
        
        <br>
        Publication DOI: ${checkForPublicationDoi()} <br>

        <h3 style="margin-top: 15px;">Project Data - Public <i class="fa fa-globe"></i></h3> 
        <hr>
        ${handleSamples()}

        <button id="view-btn" onclick="window.open('https://geome-db.org/workbench/project-overview?projectId=${local.projectId}')">View Project in GEOME <i class="fa fa-external-link"></i></button>

        <button id="back-btn" onclick="location.href='/projects'">Back to Projects</button>

        `
        div.appendChild(p)

        // console.log(local)
        // console.log(local.entityStats)
      }
    }
  }
}

  // Displays "Loading Data..." while it is being fetched
  function showLoader() {
    const p = document.createElement('p')
    const searchDiv = document.getElementById('search-container')

    p.innerHTML = `Loading Data.....`
    p.setAttribute('id', 'loader')
    searchDiv.appendChild(p)
  }
  // Hides "Loading Data..." after data has been fetched.
  function hideLoader() {
    const p = document.getElementById('loader')
    p.style.display = 'none'
  }

// SET LOCALSTORAGE WITH TIME LIMIT
function setWithExpiry(key, value, ttl) {
  const now = new Date()

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl
  }
  localStorage.setItem(key, JSON.stringify(item))
}

// GET FROM LOCAL STORAGE
function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key)

  // if the item doesn't exist, return null
  if (!itemStr) {
    return null
  }
  const item = JSON.parse(itemStr)
  const now = new Date()

  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key)
    return null
  }
  return item.value
}


function getUrlVars() {
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function hideMainTable() {
  const searchbar = document.getElementById('search-container')
  searchbar.style.display = "none"
  const mainTable = document.getElementById('table-container')
  mainTable.style.display = "none"
}

// add attrs: type, rotation # 90 or 60
function makeBarChart(xLabel, dataLabel, values, type, rotationInt) {
  let canvas = document.getElementById('sampleChart')
  let ctx = document.getElementById('sampleChart').getContext('2d');

   let samplesChart = new Chart(ctx, {
    type: type,
    options: {
      animation: false,
      maintainAspectRatio: false,
      legend: {
        display: true
      },
      scales: {
        xAxes: [{
          ticks: {
            autoSkip: false,
            maxRotation: rotationInt,
            minRotation: rotationInt
          }
        }]
      }
    },
    data: {
      labels: xLabel,
      datasets: [
        {
          label: dataLabel,
          data: values,
          backgroundColor: '#b3cde3'
        }
      ]
    }
  });

  canvas.addEventListener('mouseover', function(e) {
      e.target.style.cursor = 'pointer'
  })

  canvas.addEventListener('click', function(event) {
    let firstPoint = samplesChart.getElementAtEvent(event)[0]

    if(firstPoint) {
      let label = samplesChart.data.labels[firstPoint._index];
      let arr = label.split(' ')
      let genus = arr[0]
      let species = arr[1]

      window.location.href = `/dashboard/?id=${genus}+${species}`
    }
  })
}