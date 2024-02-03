const baseURL = 'https://raw.githubusercontent.com/BNHM/AmphibiaWebDiseasePortalAPI/master/data/'

// TESTING FETCH
// fetch(`https://amphibiaweb.org/amphib_names.json`).then(async response => {
//   try {
//     const data = await response.json()
//     console.log('response data?', data)
//   } catch(error) {
//     console.log('Error happened here')
//     console.error(error)
//   }
// })

// Colors to use in building charts based on what data is used.
// Orange
const bdColor = '#feb24c'
// Lavender
const bsalColor = '#bcbddc'
// Light Pink
const posColor = '#fbb4ae'
// Light Blue
const negColor = '#a6cee3'
// Grey
const genericColor = '#bdbdbd'

class Dashboard{
  constructor() {
    let mychart = this;
    buildCountryPage()

    let urlName = getUrlVars().id
    let tabLabel = getUrlVars().tab

    const charttab = document.getElementById('charts-tab')
    const tabletab = document.getElementById('table-tab')
    const listtab = document.getElementById('list-tab')

    if (urlName != undefined) {
      buildSpeciesDetail() 
    }

    if (tabLabel === undefined) {
      tabletab.style.display = 'block'
      charttab.style.display = 'none'
      listtab.style.display = 'none'

      buildSummaryTable()
      buildSpeciesTable()
      buildCountryTable()
      buildPathogenSummaryTable()

    } else if (tabLabel === 'list-tab') {
      buildSpeciesList()
      tabletab.style.display = 'none'
      charttab.style.display = 'none'
      listtab.style.display = 'block'

    } else if (tabLabel === 'table-tab') {
      tabletab.style.display = 'block'
      charttab.style.display = 'none'
      listtab.style.display = 'none'

      buildSummaryTable()
      buildSpeciesTable()
      buildCountryTable()
      buildPathogenSummaryTable()

    } else if (tabLabel === 'charts-tab') {
      tabletab.style.display = 'none'
      charttab.style.display = 'block'
      listtab.style.display = 'none'

    const resultSelect = document.getElementById('result-select')
    const byYearSelect = document.getElementById('by-year-select')
    const speciesSelect = document.getElementById('by-species-select')
   
    resultSelect.addEventListener('change', function() {
      byYearSelect.value = ''
      speciesSelect.value = ''

     if (this.value == 'bdDetectedByCountry') {
        bdDetectedByCountry()
      } else if (this.value == 'bsalDetectedByCountry') {
        bsalDetectedByCountry()
      } else if (this.value == 'bdDetectedByGenus') {
        bdDetectedByGenus()
      } else if (this.value == 'bsalDetectedByGenus') {
        bsalDetectedByGenus()
      } else if (this.value == 'bdDetectedByScientificName') {
        bdDetectedByScientificName()
      } else if (this.value == 'bsalDetectedByScientificName') {
        bsalDetectedByScientificName()
      } else if (this.value == 'bothDetectedByScientificName') {
        bothDetectedByScientificName()
      } else if (this.value == 'bothByCountryStacked') {
        countriesBothStackedChart()
      }
    })

    byYearSelect.addEventListener('change', function() {
      speciesSelect.value = ''
      resultSelect.value = ''

     if (this.value == 'bdDetectedByYear') {
        bdDetectedByYear()
      } else if (this.value == 'bsalDetectedByYear') {
        bsalDetectedByYear()
      } else if (this.value == 'bothDetectedByYear') {
        bothDetectedByYear()
      } 
    })

    speciesSelect.addEventListener('change', function() {
      resultSelect.value = ''
      byYearSelect.value = ''

      if (this.value == 'bdGenus') {
        bdGenus()
      } else if (this.value == 'bsalGenus') {
        bsalGenus()
      } else if (this.value == 'bothGenusStacked') {
        bothStackedGenus()
      } else if (this.value == 'bdScientificName') {
        bdScientificName()
      } else if (this.value == 'bsalScientificName') {
        bsalScientificName()
      } else if (this.value == 'bothScientificNameStacked') {
        bothScientificNameStacked()
      } else if (this.value == 'byOrder') {
        chartByOrder()
      }
    })
  } else if (tabLabel === undefined && urlName === undefined) {
    console.log('tabs undefined')
  }
  }
}

// TABLES TAB

async function buildSpeciesTable() {
  let data = await getBothScientificNameData()
  let objectArray = data.nameAndValue

  let sortedArray = objectArray.sort(function(a, b) {
    return parseFloat(b.value) - parseFloat(a.value)
  });

  let tenItems = sortedArray.slice(0, 10)

  return tenItems.forEach(entry => {
    let table = document.getElementById('species-table')
    let tr = document.createElement('tr')

    let arr = entry.scientificName.split(' ')
    let genus = arr[0]
    let species = arr[1]

      tr.innerHTML = `
        <td><a href='/dashboard/?id=${genus}+${species}'><em>${entry.scientificName}</em></a>
        </td>
        <td>${entry.value} </td>
      `
      table.appendChild(tr)
  })
}

async function buildCountryTable() {
  let data = await getDataBothPathogens()
  let objectArray = data.countryAndValue

  let sortedArray = objectArray.sort(function(a, b) {
    return parseFloat(b.value) - parseFloat(a.value)
  });

  let tenItems = sortedArray.slice(0, 10)
  
  return tenItems.forEach(entry => {
    let table = document.getElementById('country-table')
    let tr = document.createElement('tr')

      tr.innerHTML = `
        <td><a href='/dashboard/?country=${entry.country}'>${entry.country}</a></td>
        <td>${entry.value}</td>
      `
      table.appendChild(tr)
  })
}

async function buildPathogenSummaryTable() {
  // BD
  const bdResponse = await fetch(`${baseURL}diseaseDetected_Bd.json`)
  const bdData = await bdResponse.json()

  let bdTrue, bdFalse, bdInconclusive, bdUnknown

  bdData.forEach(entry => {
    let diseaseDetected = entry.diseaseDetected.toLowerCase()
    if (diseaseDetected == 'true') {
      bdTrue = entry.value
    } else if (diseaseDetected == 'false') {
      bdFalse = entry.value
    } else if (diseaseDetected == 'no_confidence') {
      bdInconclusive = entry.value
    } else if (diseaseDetected == 'unknown') {
      bdUnknown = entry.value
    }
  })

  // BSAL
  const bsalResponse = await fetch(`${baseURL}diseaseDetected_Bsal.json`)
  const bsalData = await bsalResponse.json()

  let bsalTrue
  let bsalFalse
  let bsalInconclusive
  let bsalUnknown

  bsalData.forEach(entry => {
    let diseaseDetected = entry.diseaseDetected.toLowerCase()
    if (diseaseDetected == 'true') {
      bsalTrue = entry.value
    } else if (diseaseDetected == 'false') {
      bsalFalse = entry.value
    } else if (diseaseDetected == 'no_confidence') {
      bsalInconclusive = entry.value
    } else if (diseaseDetected == 'unknown') {
      bsalUnknown = entry.value
    }
  })

  // Both Tested
  const bothTestedResponse = await fetch(`${baseURL}diseaseTested_Both.json`)
  const bothTestedData = await bothTestedResponse.json()
  let bdTested, bsalTested, bothTested

  bothTestedData.forEach(entry => {
    let diseaseTested = entry.diseaseTested.toLowerCase()
    if (diseaseTested == 'bd') {
      bdTested = entry.value
    } else if (diseaseTested == 'bd+bsal') {
      bothTested = entry.value
    } else if (diseaseTested == 'bsal') {
      bsalTested = entry.value
    }
  })

  // Both detected
  const bothDetectedResponse = await fetch(`${baseURL}diseaseDetected_Both.json`)
  const bothDetectedData = await bothDetectedResponse.json()
  let totalTrue, totalFalse, totalInconclusive, totalUnknown

  bothDetectedData.forEach(entry => {
    let diseaseDetected = entry.diseaseDetected.toLowerCase()

    if (diseaseDetected == 'true') {
      totalTrue = entry.value
    } else if (diseaseDetected == 'false') {
      totalFalse = entry.value
    } else if (diseaseDetected == 'no_confidence') {
      totalInconclusive = entry.value
    } else if (diseaseDetected == 'unknown') {
      totalUnknown = entry.value
    }
  })

//  Build table
 let table = document.getElementById('pathogen-summary-table')
 let trOne = document.createElement('tr')  
 let trTwo = document.createElement('tr')
 let trThree = document.createElement('tr')
 let trFour = document.createElement('tr')

//  BD table row
 trOne.innerHTML = `
 <td>Bd</td>
 <td>${bdTested}</td>
 <td>${bdTrue}</td>
 <td>${bdFalse}</td>
 <td>${bdInconclusive}</td>
 <td>${bdUnknown}</td>
 `

//  Bsal table row
 trTwo.innerHTML = `
 <td>Bsal</td>
 <td>${bsalTested}</td>
 <td>${bsalTrue}</td>
 <td>${bsalFalse}</td>
 <td>${bsalInconclusive == undefined || null ? 'No Data' : bsalInconclusive}</td>
 <td>${bsalUnknown == undefined || null ? 'No Data' : bsalUnknown}</td>
 `
 
//  Bd+Bsal table row
 trThree.innerHTML = `
 <td>Bd + Bsal </td>
 <td>${bothTested}</td>
 <td>No Data</td>
 <td>No Data</td>
 <td>No Data</td>
 <td>No Data</td>
 `

//  Both table row
 trFour.innerHTML = `
 <td>Both Total</td>
 <td>${bdTested + bsalTested + bothTested}</td>
 <td>${totalTrue}</td>
 <td>${totalFalse}</td>
 <td>${totalInconclusive}</td>
 <td>${totalUnknown}</td>
 `
table.appendChild(trOne)
table.appendChild(trTwo)
table.appendChild(trThree)
table.appendChild(trFour)

}

async function buildSummaryTable() {
  const countryData = await getDataBothPathogens()
  const speciesData = await getBothScientificNameData()

  const summaryTable = document.getElementById('summary-data-table')
  let tr = document.createElement('tr')

  // Data from fetch function for country count
  let totalSamples = countryData.totalSamples
  let countries = countryData.country

  // Data from fetch function for species count
  let species = speciesData.scientificName

  let countryCount = 0
  let speciesCount = 0

  let sampleSum = totalSamples.reduce(function(a,b) {
    return a + b
  }, 0)

  countries.forEach(x => {
    countryCount++
  })

  species.forEach(x => {
    speciesCount++
  })

  tr.innerHTML = `
  <td>${sampleSum}</td>
  <td>${speciesCount}</td>
  <td>${countryCount}</td>
  `
  summaryTable.appendChild(tr)
}

// PER COUNTRY DETAIL PAGE
async function buildCountryPage() {
  const data = await getCountryDataBothStacked() 
  const allData = data.obj
  let countryURL = getUrlVars().country
  const countryDetailDiv = document.getElementById('country-detail-container')

  const checkForSpaces = countryURL && countryURL.includes('%20') ? countryURL.replace('%20', ' ') : countryURL

  allData.forEach(x => {

    if (checkForSpaces == x.country) {
      hideAllTabs()
      hideInfoDash()

      const checkBd = x.Bd === undefined ? 'No Bd Samples Were Collected' : x.Bd
      const checkBsal = x.Bsal === undefined ? 'No Bsal Samples Were Collected' : x.Bsal

      countryDetailDiv.innerHTML = `
      <p></p>
      <h3>${x.country}</h3>
      <button id="backBtn-country" class="species-detail-btn" onclick="location.href='/dashboard'">Back to Dashboard</button>      
      <br>
      <span>Bd Count:</span> ${checkBd} <br>
      <Span> Bsal Count:</span> ${checkBsal}<br>
      (More Coming Soon)
      `
    }
  }
)}

// CHECK OBJECTS FOR CASE
function whichFalseBooleanCase(object) {
  if (object.False) {
    // console.log('key is False')
    return object.False
  }
  if (object.FALSE) {
    // console.log('key is FALSE')
    return object.FALSE
  }
  if (object.false) {
    // console.log('key is false')
    return object.false
  }
}

function whichTrueBooleanCase(object) {
  if (object.True) {
    // console.log('key is True')
    return object.True
  }
  if (object.TRUE) {
    // console.log('key is TRUE')
    return object.TRUE
  }
  if (object.true) {
    // console.log('key is true')
    return object.true
  }
}

//CHARTS TAB

//FETCH Bd Detected by Scientific Name
async function getBdDetectedByScientificName() {
  const response = await fetch(`${baseURL}scientificName_diseaseDetected_Bd.json`)
  const data = await response.json()

  let scientificName = []
  let trueValue = []
  let falseValue = []
  let bdObj = []

  data.forEach(entry => {
    bdObj.push(entry)
  })

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(whichTrueBooleanCase(b)) - parseFloat(whichTrueBooleanCase(a)) || parseFloat(whichFalseBooleanCase(b)) - parseFloat(whichFalseBooleanCase(a))
  })

  sortedDescending.forEach(entry => {
    if (whichTrueBooleanCase(entry) != undefined || whichFalseBooleanCase(entry) != undefined) {
      if (entry.scientificName != 'Unknown') {
        scientificName.push(entry.scientificName)  
        trueValue.push(whichTrueBooleanCase(entry))
        falseValue.push(whichFalseBooleanCase(entry))
      }
  
    }
  })

  return { scientificName, trueValue, falseValue, bdObj }
}

// CHART Display Bd Detected By Scientific Name
async function bdDetectedByScientificName() {
  let data = await getBdDetectedByScientificName()
  makeHorizontalStackedBarChart(data.scientificName, 'Negative', data.falseValue, negColor, 'Positive', data.trueValue, posColor)
}

//FETCH Bsal Detected by Scientific Name
async function getBsalDetectedByScientificName() {
  const response = await fetch(`${baseURL}scientificName_diseaseDetected_Bsal.json`)
  const data = await response.json()

  let scientificName = []
  let trueValue = []
  let falseValue = []
  let bsalObj = []

  data.forEach(entry => {
    bsalObj.push(entry)
  })

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(whichTrueBooleanCase(b)) - parseFloat(whichTrueBooleanCase(a)) || parseFloat(whichFalseBooleanCase(b)) - parseFloat(whichFalseBooleanCase(a))
  })

  sortedDescending.forEach(entry => {
    if (whichTrueBooleanCase(entry) != undefined || whichFalseBooleanCase(entry) != undefined) {
      if (entry.scientificName != 'Unknown') {
        scientificName.push(entry.scientificName)  
        trueValue.push(whichTrueBooleanCase(entry))
        falseValue.push(whichFalseBooleanCase(entry))  
      }
  
    }
  })

  return { scientificName, trueValue, falseValue, bsalObj }

}

// CHART Display Bsal Detected By Scientific Name
async function bsalDetectedByScientificName() {
  let data = await getBsalDetectedByScientificName()
  makeStackedBarChart(data.scientificName, 'Negative', data.falseValue, negColor, 'Positive', data.trueValue, posColor)
}


// FETCH
async function getBdScientificNameData() {
  const response = await fetch(`${baseURL}scientificName_Bd.json`)
  const data = await response.json()

  let scientificName = []
  let value = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(b.value) - parseFloat(a.value)
  })

  sortedDescending.forEach(entry => {
    if (entry.scientificName != 'Unknown') {
      scientificName.push(entry.scientificName)
      value.push(entry.value)  
    }
   })

  return { scientificName, value }
}

// CHART
async function bdScientificName() {
  const data = await getBdScientificNameData()
  makeBarChart(data.scientificName, 'Bd by Scientific Name', data.value, bdColor)
}

// FETCH
async function getBsalScientificNameData() {
  const response = await fetch(`${baseURL}scientificName_Bsal.json`)
  const data = await response.json()

  let scientificName = []
  let value = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(b.value) - parseFloat(a.value)
  })

  sortedDescending.forEach(entry => {
    if (entry.scientificName != 'Unknown') {
      scientificName.push(entry.scientificName)
      value.push(entry.value)  
    }
   })

  return { scientificName, value }

}

// CHART
async function bsalScientificName() {
  const data = await getBsalScientificNameData()
  makeBarChart(data.scientificName, 'Bsal by Scientific Name', data.value, bsalColor)  
}

// FETCH
async function getBothScientificNameData() {
  const response = await fetch(`${baseURL}scientificName_Both.json`)
  const data = await response.json()

  let scientificName = []
  let value = []
  let nameAndValue = []

  data.forEach(entry => {
    if (entry.scientificName != 'Unknown') {
      nameAndValue.push(entry)
      scientificName.push(entry.scientificName)
      value.push(entry.value)
    }
  })
  return { scientificName, value, nameAndValue }
}

// FETCH
async function getBothScientificNameStackedData() {
  const response = await fetch(`${baseURL}scientificName_Both_stacked.json`)
  const data = await response.json()

  let scientificName = []
  let bdValue = []
  let bsalValue = []
  let stackedObj = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(b.Bd) - parseFloat(a.Bd) || parseFloat(b.Bsal) - parseFloat(a.Bsal)
  })

  sortedDescending.forEach(entry => {
    if (entry.scientificName != 'Unknown') {
      scientificName.push(entry.scientificName)
      bdValue.push(entry.Bd)
      bsalValue.push(entry.Bsal)
      stackedObj.push(entry)  
    }
  })

  return { scientificName, bdValue, bsalValue, stackedObj }
}

// CHART
async function bothScientificNameStacked() {
  const data = await getBothScientificNameStackedData()
  makeHorizontalStackedBarChart(data.scientificName, 'Bd', data.bdValue, bdColor, 'Bsal', data.bsalValue, bsalColor)  
}

// FETCH
async function bdDetectedByYearData() {
  const response = await fetch(`${baseURL}yearCollected_diseaseDetected_Bd.json`)
  const data = await response.json()

  let yearCollected = []
  let trueValue = []
  let falseValue = []

  data.forEach(entry => {
    if (!entry.yearCollected.includes('unknown')) {
      yearCollected.push(entry.yearCollected)
      trueValue.push(whichTrueBooleanCase(entry))
      falseValue.push(whichFalseBooleanCase(entry))
    } 
  })

  return { yearCollected, trueValue, falseValue }
}

// CHART
async function bdDetectedByYear() {
  let data = await bdDetectedByYearData()
makeStackedBarChart(data.yearCollected, 'Negative', data.falseValue, negColor, 'Positive', data.trueValue, posColor)
}

// FETCH
async function bsalDetectedByYearData() {
  const response = await fetch(`${baseURL}yearCollected_diseaseDetected_Bsal.json`)
  const data = await response.json()

  let yearCollected = []
  let trueValue = []
  let falseValue = []

  data.forEach(entry => {
    if (!entry.yearCollected.includes('unknown')) {
    yearCollected.push(entry.yearCollected)
    trueValue.push(whichTrueBooleanCase(entry))
    falseValue.push(whichFalseBooleanCase(entry))
  }
  })

  return { yearCollected, trueValue, falseValue }
}

// CHART
async function bsalDetectedByYear() {
  let data = await bsalDetectedByYearData()
makeStackedBarChart(data.yearCollected, 'Negative', data.falseValue, negColor, 'Positive', data.trueValue, posColor)
}

// FETCH
async function bdDetectedByGenusData() {
  const response = await fetch(`${baseURL}genus_diseaseDetected_Bd.json`)
  const data = await response.json()

  let genus = []
  let trueValue = []
  let falseValue = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(whichTrueBooleanCase(b)) - parseFloat(whichTrueBooleanCase(a)) || parseFloat(whichFalseBooleanCase(b)) - parseFloat(whichFalseBooleanCase(a))
  })

  sortedDescending.forEach(entry => {
    if (entry.genus != 'Unknown') {
      if (whichTrueBooleanCase(entry) != undefined || whichFalseBooleanCase(entry) != undefined) {
        genus.push(entry.genus)  
        trueValue.push(whichTrueBooleanCase(entry))
        falseValue.push(whichFalseBooleanCase(entry))
    
      }
    }

  })

  return { genus, trueValue, falseValue }
}

// CHART
async function bdDetectedByGenus() {
  let data = await bdDetectedByGenusData()
  makeStackedBarChart(data.genus, 'Negative', data.falseValue, negColor, 'Positive', data.trueValue, posColor)
}

// FETCH
async function bsalDetectedByGenusData() {
  const response = await fetch(`${baseURL}genus_diseaseDetected_Bsal.json`)
  const data = await response.json()

  let genus = []
  let trueValue = []
  let falseValue = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(whichTrueBooleanCase(b)) - parseFloat(whichTrueBooleanCase(a)) || parseFloat(whichFalseBooleanCase(b)) - parseFloat(whichFalseBooleanCase(a))
  })

  sortedDescending.forEach(entry => {
    if (entry.genus != 'Unknown') {
      if (whichTrueBooleanCase(entry) != undefined || whichFalseBooleanCase(entry) != undefined) {
        genus.push(entry.genus)  
        trueValue.push(whichTrueBooleanCase(entry))
        falseValue.push(whichFalseBooleanCase(entry))
      }
    }
  })

  return { genus, trueValue, falseValue }
}

// CHART
async function bsalDetectedByGenus() {
  let data = await bsalDetectedByGenusData()
makeStackedBarChart(data.genus, 'Negative', data.falseValue, negColor, 'Positive', data.trueValue, posColor)
}

// FETCH
async function getBdGenusData() {
  const response = await fetch(`${baseURL}genus_Bd.json`)
  const data = await response.json()

  let genus = []
  let value = []

  let sortedDescending = data.sort(function(a, b) {
    return parseFloat(b.value) - parseFloat(a.value)
  })

  sortedDescending.forEach(entry => {
    if (entry.genus != 'Unknown') {
      genus.push(entry.genus)
      value.push(entry.value)  
    }
  })
  return { genus, value }
}

// CHART
async function bdGenus() {
  let data = await getBdGenusData()
  makeBarChart(data.genus, 'Bd By Genus', data.value, bdColor)
}

// FETCH
async function getBsalGenusData() {
  const response = await fetch(`${baseURL}genus_Bsal.json`)
  const data = await response.json()

  let genus = []
  let value = []

  let sortedDescending = data.sort(function(a, b) {
    return parseFloat(b.value) - parseFloat(a.value)
  })

  sortedDescending.forEach(entry => {
    if (entry.genus != 'Unknown') {
      genus.push(entry.genus)
      value.push(entry.value)
    }
  })
  return { genus, value }
}

// CHART
async function bsalGenus() {
  let data = await getBsalGenusData()
  makeBarChart(data.genus, 'Bsal By Genus', data.value, bsalColor)
}

// FETCH
async function getBothStackedGenusData() {
  const response = await fetch(`${baseURL}genus_Both_stacked.json`)
  const data = await response.json()

  let genus = []
  let bdValue = []
  let bsalValue = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(b.Bd) - parseFloat(a.Bd) || parseFloat(b.Bsal) - parseFloat(a.Bsal)
  })

  sortedDescending.forEach(entry => {
    if (entry.genus != 'Unknown') {
      genus.push(entry.genus)
      bdValue.push(entry.Bd)
      bsalValue.push(entry.Bsal)
    }
  })
  return { genus, bdValue, bsalValue }
}

// CHART
async function bothStackedGenus() {
  let data = await getBothStackedGenusData()
  makeStackedBarChart(data.genus, 'Bd', data.bdValue, bdColor, 'Bsal', data.bsalValue, bsalColor)
}

// Bsal Detected by country
async function getBsalDetectedByCountryData() {
  const response = await fetch(`${baseURL}country_diseaseDetected_Bsal.json`)
  const data = await response.json()

  console.log(data.length)

  
  let country = []
  let trueValue = []
  let falseValue = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(whichTrueBooleanCase(b)) - parseFloat(whichTrueBooleanCase(a)) || parseFloat(whichFalseBooleanCase(b)) - parseFloat(whichFalseBooleanCase(a))
  })

  sortedDescending.forEach(entry => {
    if (whichTrueBooleanCase(entry) != undefined || whichFalseBooleanCase(entry) != undefined) {
      country.push(entry.country)  
      trueValue.push(whichTrueBooleanCase(entry))
      falseValue.push(whichFalseBooleanCase(entry))
    }
  })

  return { country, trueValue, falseValue }
}

// Stacked Bsal by Country Bar Chart
async function bsalDetectedByCountry() {
  let data = await getBsalDetectedByCountryData()
  makeStackedBarChart(data.country, 'Bsal Negative', data.falseValue, negColor, 'Bsal Positive', data.trueValue, posColor)
}

// Bd Detected by country
async function getBdDetectedByCountryData() {
  const response = await fetch(`${baseURL}country_diseaseDetected_Bd.json`)
  const data = await response.json()
  
  let country = []
  let trueValue = []
  let falseValue = []
  let countryObj = []

  let sortedDescending = data.sort(function(a,b) {
    return parseFloat(whichTrueBooleanCase(b)) - parseFloat(whichTrueBooleanCase(a)) || parseFloat(whichFalseBooleanCase(b)) - parseFloat(whichFalseBooleanCase(a))
  })

  sortedDescending.forEach(entry => {
    if (whichTrueBooleanCase(entry) != undefined || whichFalseBooleanCase(entry) != undefined) {
      country.push(entry.country)  
      trueValue.push(whichTrueBooleanCase(entry))
      falseValue.push(whichFalseBooleanCase(entry))
    }
  })

  return { country, trueValue, falseValue, countryObj }
}

// Stacked Bd by Country Bar Chart
async function bdDetectedByCountry() {
  let data = await getBdDetectedByCountryData()
  makeStackedBarChart(data.country, 'Bd Negative', data.falseValue, negColor, 'Bd Positive', data.trueValue, posColor)
}

// Get totals together for both pathogens
async function getDataBothPathogens() {
  const response = await fetch(`${baseURL}country_Both.json`)
  const data = await response.json()

  let country = []
  let totalSamples = []
  let countryAndValue = []

  data.forEach(event => {
    countryAndValue.push(event)
    country.push(event.country)
    totalSamples.push(event.value)
  })
  return { country, totalSamples, countryAndValue }
}

// Get both pathogens stacked per country
async function getCountryDataBothStacked() {
  const res = await fetch(`${baseURL}country_Both_stacked.json`)
  const data = await res.json()

  let countries = []
  let bdcounts = []
  let bsalcounts = []
  let obj = []

  data.forEach(x => {
    countries.push(x.country)
    bdcounts.push(x.Bd)
    bsalcounts.push(x.Bsal)
    obj.push(x)
  })
  return { countries, bdcounts, bsalcounts, obj }
}

// CHART
async function countriesBothStackedChart() {
  const data = await getCountryDataBothStacked()
  makeStackedBarChart(data.countries, 'Bd Count', data.bdcounts, bdColor, 'Bsal Count', data.bsalcounts, bsalColor)
}


  // TABS TOGGLE 
function toggleData(evt, tabType) {
  // Get all elements with class="tablinks" and remove the class "active"
  let tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  
  // Sets URL to either 'table-tab, chart-tab, list-tab'
  location.href = `/dashboard/?tab=${tabType}`

  // Show the current tab, and add an "active" class to the button that opened the tab
  evt.currentTarget.className += " active";
}

  //LIST TAB
  async function getSpeciesAssociatedProject() {
    const response = await fetch(`${baseURL}scientificName_listing.json`)
    const data = await response.json()

    let obj = []
    data.forEach(x => {
      obj.push(x)
    })
    return { obj }
  }

  //TODO: display species by order
  async function chartByOrder() {
    const data = await getSpeciesAssociatedProject()
    let allData = data.obj

    let orders = ['Anura', 'Caudata', 'Gymnophiona']
    let anuraCount = []
    let caudataCount = []
    let gymCount = []

    allData.forEach(x => {
      let associated = x.associatedProjects

      if (x.order == 'Anura') {
        associated.forEach(y => {
          anuraCount.push(y.count)
        })
      } else if (x.order == 'Caudata') {
        associated.forEach(y => {
          caudataCount.push(y.count)
        })
      } else if (x.order == 'Gymnophiona') {
        associated.forEach(y => {
          gymCount.push(y.count)
        })
      }
    })

    let anuraSum = anuraCount.reduce(function(a,b) {
      return a + b
    }, 0)

    let caudataSum = caudataCount.reduce(function(a,b) {
      return a + b
    }, 0)   
    
    let gymSum = gymCount.reduce(function(a,b) {
      return a + b
    }, 0)

    let totalCounts = [anuraSum, caudataSum, gymSum]

    makeBarChart(orders, 'Total Samples By Order', totalCounts, genericColor)
  }

  async function getTxtData() {
    const res = await fetch('https://amphibiaweb.org/amphib_names.json')
    const data = await res.json()
    return {data}
  }

  function searchSpecies(select) {
    let input, filter, li, i, txtValue;
    input = document.getElementById('species-input');
    filter = input.value.toUpperCase();
    li = select.getElementsByTagName('li');
  
    // Loop through all list items, and hide those which don't match the search query
    for (i = 0; i < li.length; i++) {
      txtValue = li[i].innerText
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = ""
      } else {
        li[i].style.display = "none"
      }
    }

    // TODO: hide letters on search
    // for (let el of document.querySelectorAll('.hide-on-search')) {
    //   el.style.display = 'none'
    // }
  }


  async function buildSpeciesList() {
    const allData = await getBothScientificNameData()
    let names = allData.scientificName
    
   // If there is no scientific name in URL, load entire list.
      hideInfoDash()
      names.forEach(name => {
        let arr = name.split(' ')
        let genus = arr[0]
        let species = arr[1]
      
        // Builds List of species sampled by Scientific Name & organize alphabetically
        const aNames = document.querySelector('#sort-a ul')
        const bNames = document.querySelector('#sort-b ul')
        const cNames = document.querySelector('#sort-c ul')
        const dNames = document.querySelector('#sort-d ul')
        const eNames = document.querySelector('#sort-e ul')
        const fNames = document.querySelector('#sort-f ul')
        const gNames = document.querySelector('#sort-g ul')
        const hNames = document.querySelector('#sort-h ul')
        const iNames = document.querySelector('#sort-i ul')
        const jNames = document.querySelector('#sort-j ul')
        const kNames = document.querySelector('#sort-k ul')
        const lNames = document.querySelector('#sort-l ul')
        const mNames = document.querySelector('#sort-m ul')
        const nNames = document.querySelector('#sort-n ul')
        const oNames = document.querySelector('#sort-o ul')
        const pNames = document.querySelector('#sort-p ul')
        const qNames = document.querySelector('#sort-q ul')
        const rNames = document.querySelector('#sort-r ul')
        const sNames = document.querySelector('#sort-s ul')
        const tNames = document.querySelector('#sort-t ul')
        const uNames = document.querySelector('#sort-u ul')
        const vNames = document.querySelector('#sort-v ul')
        const wNames = document.querySelector('#sort-w ul')
        const xNames = document.querySelector('#sort-x ul')
        const yNames = document.querySelector('#sort-y ul')
        const zNames = document.querySelector('#sort-z ul')
      
        listBuilder(name, 'A', aNames, genus, species)
        listBuilder(name, 'B', bNames, genus, species)
        listBuilder(name, 'C', cNames, genus, species)
        listBuilder(name, 'D', dNames, genus, species)
        listBuilder(name, 'E', eNames, genus, species)
        listBuilder(name, 'F', fNames, genus, species)
        listBuilder(name, 'G', gNames, genus, species)
        listBuilder(name, 'H', hNames, genus, species)
        listBuilder(name, 'I', iNames, genus, species)
        listBuilder(name, 'J', jNames, genus, species)
        listBuilder(name, 'K', kNames, genus, species)
        listBuilder(name, 'L', lNames, genus, species)
        listBuilder(name, 'M', mNames, genus, species)
        listBuilder(name, 'N', nNames, genus, species)
        listBuilder(name, 'O', oNames, genus, species)
        listBuilder(name, 'P', pNames, genus, species)
        listBuilder(name, 'Q', qNames, genus, species)
        listBuilder(name, 'R', rNames, genus, species)
        listBuilder(name, 'S', sNames, genus, species)
        listBuilder(name, 'T', tNames, genus, species)
        listBuilder(name, 'U', uNames, genus, species)
        listBuilder(name, 'V', vNames, genus, species)
        listBuilder(name, 'W', wNames, genus, species)
        listBuilder(name, 'X', xNames, genus, species)
        listBuilder(name, 'Y', yNames, genus, species)
        listBuilder(name, 'Z', zNames, genus, species)
        })
}

// TODO: Find a less clunky solution for this whole process (issues with incognito mode)
async function fetchProjectData() {
  const res = await fetch('https://api.geome-db.org/projects/stats?') 
  const data = await res.json() 

  let projectStorage = []
  data.map(item => {
    if(item.projectConfiguration.id == 45) {
      projectStorage.push(item)
    }
  })
    return {projectStorage}
}
  
// TODO: Uncomment when getTxtData json is fixed

async function buildSpeciesDetail() {
  const allStacked = await getBothScientificNameStackedData()
  const bdData = await getBdDetectedByScientificName()
  const bsalData = await getBsalDetectedByScientificName()
  const projData = await getSpeciesAssociatedProject()
  const txtData = await getTxtData()
  const allData =  await fetchProjectData()
  
  let urlName = getUrlVars().id
  let bdObj = bdData.bdObj
  let bsalObj = bsalData.bsalObj
  let stackedData = allStacked.stackedObj
  let projects = projData.obj
  let amphInfo = txtData.data

    hideAllTabs()
    const dash = document.getElementById('info-dash')
    dash.style.display = 'flex'

    const speciesDiv = document.getElementById('species-stats')
    const bdDiv = document.getElementById('bd-chart-container')
    const bsalDiv = document.getElementById('bsal-chart-container')
    const bsalCanvas = document.getElementById('bsal-chart')
    const bdCanvas = document.getElementById('bd-chart')
    const projectsUl = document.getElementById('associated-projects')

    let displayName = urlName.replace('+', ' ')
    let nameArr = displayName.split(' ')
    let genus = nameArr[0]
    let species = nameArr[1]

    let order = []
    let family = []
    let iucn = []
    let commonName = []
    amphInfo.map(x => {
      if (genus == x.genus && species == x.species) {
        if(x.common_name) {commonName.push(x.common_name)} 
        if (x.order) {order.push(x.order)}
        if(x.family) {family.push(x.family)}
       if (x.iucn) {iucn.push(x.iucn)}}
    })

    // Displays common name, family, order and iucn status
    const checkCommonName = commonName.length === 0 ? '<span>Common Name(s): </span> Unavailable' : `<span>Common Name(s): </span> ${commonName}`
    const checkFamily = family.length === 0 ? '<span>Family: </span> Unavailable' : `<span>Family: </span>${family}`
    const checkOrder = order.length === 0 ? '<span>Order: </span> Unavailable' : `<span>Order: </span>${order}`
    const checkIucn = iucn.length === 0 ? '<span>IUCN Status: </span> Unavailable' : `<span>IUCN Status: </span>${iucn}`

    speciesDiv.innerHTML = `
    <p></p>
    <h3><em>${displayName}</em></h3>

    <button class="species-detail-btn" type="submit" onclick="location.href='https://amphibiaweb.org/cgi/amphib_query?where-genus=${genus}&where-species=${species}'">View in AmphibiaWeb <i class="fa fa-external-link"></i></button>
    <button class="species-detail-btn" onclick="location.href='/dashboard/?tab=list-tab'">Back to Dashboard</button>      
    
    <ul id="info-stats">
    <li> ${checkCommonName} </li>
    <li> ${checkIucn} </li>
    <li> ${checkOrder} </li>
    <li> ${checkFamily} </li>
    </ul>
    `

    // For Associated Projects DIV
    let titles = []
    function returnTitle(id) {
      if (JSON.parse(localStorage.getItem("bigdatafile")) == null) {
        let titleData = allData.projectStorage

        titleData.forEach(x => {
          if(x.projectId == id) {
            titles.push(x.projectTitle)
          }
        })

      } else {
        bigdatafile = JSON.parse(localStorage.getItem("bigdatafile")).value
        for (let i = 0; i < bigdatafile.length; i++) {
          let local = bigdatafile[i]
  
          if(local.projectId == id) {titles.push(local.projectTitle)}
        }
      }
    }

    // Stores IDs of each associated project
    let idParam = []
    let sampleCounts = []
    projects.map(x => {
      if(x.scientificName === displayName) {
        let projObj = x.associatedProjects

        projObj.forEach(y => {
          sampleCounts.push(y.count)
          idParam.push(y.projectId)
        })
      }
     })

     // Uses the Ids to return titles and links associated with the ID
     let links = []
     idParam.forEach(num => {
      returnTitle(num)
      links.push(`/projects/?id=${num}`)
     })

     // Combines ID, title and Link into new arrays
     let mixed = idParam.map(function(x, i) {
       return [x, titles[i], links[i], sampleCounts[i]]
     })

     mixed.forEach(item => {
      let li = document.createElement('li')
      li.className = 'li-detail'
      li.innerHTML = `<td><a href="${item[2]}">${item[1]} (${item[3]} Samples)</a></td>`
      
      projectsUl.appendChild(li)
     })
    
    // Totals div for displaying bd/bsal tested
    stackedData.forEach(x => {
      if(x.scientificName === displayName) {
        makePieChart('totals-chart-container', 'both-chart', 'Bd', 'Bsal', x.Bd, x.Bsal, bdColor, bsalColor)
      }        
    })
    
    // Checks for and displays Bd data
   let checkBd = () => bdObj.map(x => {
      if(x.scientificName === displayName) {
        makePieChart('bd-chart-container', 'bd-chart', 'Bd Positive', 'Bd Negative', whichTrueBooleanCase(x), whichFalseBooleanCase(x), posColor, negColor)
      } else {
        return false
      }
    })

    // Janky fix for displaying 'No Data available'
    if (!checkBd().includes(undefined)) {
      bdCanvas.style.display = 'none'
      let p = document.createElement('p')
      p.className = 'detail-p'
      p.innerHTML = `No Bd data available for ${displayName}`
      bdDiv.appendChild(p)
    }
    
    // Checks for and displays Bsal Data
    let checkBsal = () => bsalObj.map(x => {
      if (x.scientificName === displayName) {  
        makePieChart('bsal-chart-container', 'bsal-chart', 'Bsal Positive', 'Bsal Negative', whichTrueBooleanCase(x), whichFalseBooleanCase(x), posColor, negColor)
      } else {          
        return false
      }
    })

    if (!checkBsal().includes(undefined)) {
      bsalCanvas.style.display = 'none'
      let p = document.createElement('p')
      p.className = 'detail-p'
      p.innerHTML = `No Bsal data available for ${displayName}`
      bsalDiv.appendChild(p)
    }
  }

function hideAllTabs() {
  const p = document.getElementById('description')
  const tabNav = document.getElementById('tab-nav')
  const tableTab = document.getElementById('table-tab')
  const listTab = document.getElementById('list-tab')
  const chartTab = document.getElementById('charts-tab')

  p.style.display = 'none'
  tabNav.style.display = 'none'
  tableTab.style.display = 'none'
  chartTab.style.display = 'none'
  listTab.style.display = 'none'
}

function hideInfoDash() {
  const dash = document.getElementById('info-dash')
  dash.style.display = 'none'
}

function listBuilder(name, letter, selector, genus, species) {
  let li = document.createElement('li')
  const searchInput = document.getElementById('species-input')
  if (name.startsWith(letter) === true) {
    li.innerHTML = `
      <span><em>${name}</em></span>
      <div id="list-buttons">
      <button id="${name}" class="species-btn">Portal Stats</button>
      <button class="species-btn" type="submit" onclick="location.href='https://amphibiaweb.org/cgi/amphib_query?where-genus=${genus}&where-species=${species}'">View in AmphibiaWeb <i class="fa fa-external-link"></i></button>
      </div>
      `
    selector.appendChild(li)

    document.getElementById(name).addEventListener('click', function() {
      window.location.href = `/dashboard/?id=${genus}+${species}`
    })

    searchInput.addEventListener('keyup', function() {
      searchSpecies(selector)
    })
  }
}

// LIST SCROLL TO TOP 
const scrollToTop = () => {
  // number of pixels we are from the top of the document.
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  // If that number is greater than 0 - scroll back to 0, or the top of the document.
  // Animate scroll
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    // ScrollTo takes an x and a y coordinate.
    // Increase the '10' value to get a smoother/slower scroll
    window.scrollTo(0, c - c / 5);
  }

    // location.href = window.location.href.split('#')[0]    
    // console.log(window.location.href.split('#')[0]);
  
}

  // Get url variable
  function getUrlVars() {
    let vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
  }

    // GENERIC STACKED BAR CHART
    function makeStackedBarChart(xLabel, valueLabelOne, valuesOne, colorOne, valueLabelTwo, valuesTwo, colorTwo) {
      let dashChart = document.querySelector('.toggle-chart')
      let horizontalDashChart = document.querySelector('.toggle-horizontal-chart')
      if(dashChart.style.display == 'none' && horizontalDashChart.style.display == 'block') {
        horizontalDashChart.style.display = 'none'
        dashChart.style.display = 'block'
      }

      let chartContainer = document.getElementById('chart-container')
      let element = document.getElementById('dashboardChart');
      chartContainer.removeChild(element)
  
      let canvas = document.createElement('canvas')
      canvas.id = 'dashboardChart'
      canvas.width = '1000px'
      canvas.height = '600px'
      chartContainer.appendChild(canvas)

      let wrap = document.querySelector('.wrapper')
      adjustChartSize(xLabel.length, chartContainer, wrap)

      let ctx = document.getElementById('dashboardChart').getContext('2d');
    
      let dataChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: xLabel,
          datasets: [
            {
              label: valueLabelOne,
              data: valuesOne,
              backgroundColor: colorOne,
            },
            {
              label: valueLabelTwo,
              data: valuesTwo,
              backgroundColor: colorTwo,
            }
          ],
        },
        options: {
          scales: {
            xAxes: [{ 
              stacked: true,
              ticks: {
                autoSkip: false,
                // maxRotation: 90,
                // minRotation: 90
              }
             }],
            yAxes: [{ stacked: true }],
            barThickness : 30,
          },
          responsive: true,
          maintainAspectRatio: true,
          legend: {
            display: true
          }
        }
      });
    }
    
    // GENERIC BAR CHART
    async function makeBarChart(xLabel, dataLabel, values, color) {
      let chartContainer = document.getElementById('chart-container')
      // Removed the previously existing canvas
      let element = document.getElementById('dashboardChart');
      element.parentNode.removeChild(element)
  
      let canvas = document.createElement('canvas')
      canvas.id = 'dashboardChart'
      canvas.width = '1000px'
      canvas.height = '600px'
      chartContainer.appendChild(canvas)

      let wrap = document.querySelector('.wrapper')
      adjustChartSize(xLabel.length, chartContainer, wrap, canvas)

      let ctx = document.getElementById('dashboardChart').getContext('2d');
    
       let barChart = new Chart(ctx, {
        type: 'bar',
        options: {
          maintainAspectRatio: false,
          legend: {
            display: true
          }
        },
        data: {
          labels: xLabel,
          datasets: [
            {
              label: dataLabel,
              data: values,
              backgroundColor: color
            }
          ]
        }
      });
    }
    

// GENERIC HORIZONTAL BAR CHART
function makeHorizontalStackedBarChart(xLabel, valueLabelOne, valuesOne, colorOne, valueLabelTwo, valuesTwo, colorTwo) {
  let dashChart = document.querySelector('.toggle-chart')
  let horizontalDashChart = document.querySelector('.toggle-horizontal-chart')

  if(dashChart.style.display == 'block' && horizontalDashChart.style.display == 'none') {
    horizontalDashChart.style.display = 'block'
    dashChart.style.display = 'none'
  }
  
  let chartContainer = document.getElementById('horizontal-chart-container')

  let canvas = document.createElement('canvas')
  canvas.id = 'dashboardHorizontalChart2'
  canvas.width = '1000px'
  canvas.height = '61000px'
  chartContainer.appendChild(canvas)
  let ctx = document.getElementById('dashboardHorizontalChart').getContext('2d');

  let dataChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: xLabel,
      datasets: [
        {
          label: valueLabelOne,
          data: valuesOne,
          backgroundColor: colorOne,
        },
        {
          label: valueLabelTwo,
          data: valuesTwo,
          backgroundColor: colorTwo,
        }
      ],
    },
    options: {
      animation: false,
      scales: {
        xAxes: [{ 
          stacked: true,
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90
          }
         }],
        yAxes: [{ stacked: true }],
        barThickness : 30,
      },
      responsive: true,
      maintainAspectRatio: true,
      legend: {
        display: true
      }
    }
  });
}

// GENERIC PIE CHART
function makePieChart(containerId, canvasId, labelOne, labelTwo, valuesOne, valuesTwo, colorOne, colorTwo) {
  const container = document.getElementById(containerId)

  let canvas = document.createElement('canvas')
  canvas.id = canvasId
  canvas.width = '300px'
  canvas.height = '300px'
  container.appendChild(canvas)

  let ctx = document.getElementById(canvasId).getContext('2d')
  return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [labelOne, labelTwo],
            datasets: [{
                backgroundColor: [colorOne, colorTwo],
                data: [valuesOne, valuesTwo]
            }]
        },
        options: {
          maintainAspectRatio: true,
          legend: {
            display: true
          },
          tooltips: {
            bodyFontSize: 12
          }
        }
    });
}

function adjustChartSize(datasize, containerEl, wrapperEl) {

  // console.log(datasize, ' DATASIZE')
  // console.log(containerEl, ' CONTAINER')
  // console.log(wrapperEl, ' WRAPPER')

  if (datasize <= 20) {
    newWidth = '100%'
    // containerEl.style.border = '1px solid red'

  } else if (501 <= datasize <= 1000) {

    newWidth = '6000px'
    // containerEl.style.border = '1px solid lime'

  } else if (500 >= dataset >= 100) {

    newWidth = '5000px'
    // containerEl.style.border = '1px solid purple'
  }
  containerEl.style.width = newWidth
}
