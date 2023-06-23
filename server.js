const express = require('express')
const app = express()
const path = require('path')

app.use(express.json())

const Rollbar = require('rollbar')
const rollbar = new Rollbar({
  accessToken: 'a37954e15d924aa2b2d14d5a93dd1331',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

rollbar.log('Hello world!')

const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    res.status(200).send(students)
    rollbar.log('student list sent')
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
           students.push(name)
           rollbar.info('new student added')
           res.status(200).send(students)
           rollbar.log('student list sent', students)
       } else if (name === ''){
        rollbar.critical('attempted empty name')
           res.status(400).send('You must enter a name.')
       } else {
        rollbar.error('attempted duplicate student')
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
