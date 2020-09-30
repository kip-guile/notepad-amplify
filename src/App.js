import React, { useState } from 'react'
import '@aws-amplify/ui/dist/style.css'
import { withAuthenticator } from 'aws-amplify-react'

function App() {
  const [entries, setEntries] = useState([
    { id: 1, created: '2-09-2020', description: 'first entry' },
  ])
  return (
    <div className='flex flex-column items-center justify-center pa3 bg-washed-green'>
      <h1 className='code f2-l'>My Journal</h1>
      <form className='mb3'>
        <input type='text' className='pa2 f4' placeholder='Make an entry' />
        <button className='pa2 f4' type='submit'>
          Add Entry
        </button>
      </form>
      <div>
        {entries.map((entry) => (
          <div key={entry.id} className='flex items-center'>
            <li className='list pa1 f3'>{entry.description}</li>
            <button className='bg-transparent bn f4'>
              <span>x</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withAuthenticator(App, { includeGreetings: true })
