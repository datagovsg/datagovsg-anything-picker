import fs from 'fs'
import axios from 'axios'

const url = 'https://sis.moe.gov.sg/WebServices/SchoolService.asmx/getChosenSchoolByEducationLevel'

const options = {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}

const levels = ['P', 'S', 'J', 'F', 'T']

const apiCalls = levels.map(level => {
  const data = JSON.stringify({educationLevel: level})
  return axios.post(url, data, options)
    .then(res => res.data)
    .then(json => json.d)
    .then(JSON.parse)
    .then(data => data.map(d => ({code: d.schoolCode, name: d.name})))
})

Promise.all(apiCalls)
  .then(schoolsByLevel => {
    const schoolList = []
    schoolsByLevel.forEach((schools, i) => {
      schools.forEach(school => {
        const match = schoolList.filter(row => row.code === school.code)[0]
        if (match) {
          match.levels += levels[i]
        } else {
          school.levels = levels[i]
          schoolList.push(school)
        }
      })
    })
    console.log(schoolList)
    fs.writeFileSync('data/schoolList.json', JSON.stringify(schoolList))
  })
  .catch(console.error)
