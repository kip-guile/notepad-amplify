import React, { useState, useEffect } from 'react'
import '@aws-amplify/ui/dist/style.css'
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { createEntry, deleteEntry, updateEntry } from './graphql/mutations'
import { listEntrys } from './graphql/queries'

function App() {
  const [entries, setEntries] = useState([])
  const [entry, setEntry] = useState('')
  const [id, setId] = useState('')
  const getEntries = async () => {
    const result = await API.graphql(graphqlOperation(listEntrys))
    setEntries(result.data.listEntrys.items)
  }
  useEffect(() => {
    getEntries()
  }, [])
  const handleChangeEntry = (event) => {
    setEntry(event.target.value)
  }
  const hasExistingEntry = () => {
    if (id) {
      const isEntry = entries.findIndex((entry) => entry.id === id) > -1
      return isEntry
    }
    return false
  }
  const handleUpdateNote = async () => {
    const input = { id, description: entry }
    const result = await API.graphql(graphqlOperation(updateEntry, { input }))
    const updatedEntry = result.data.updateEntry
    const index = entries.findIndex((entry) => entry.id === updatedEntry.id)
    const updatedEntries = [
      ...entries.slice(0, index),
      updatedEntry,
      ...entries.slice(index + 1),
    ]
    setEntries(updatedEntries)
    setEntry('')
    setId('')
  }
  const handleAddEntry = async (event) => {
    event.preventDefault()
    // check if entry exists
    if (hasExistingEntry()) {
      handleUpdateNote()
    } else {
      const input = {
        description: entry,
        created: 'done',
      }
      const result = await API.graphql(graphqlOperation(createEntry, { input }))
      const newEntry = result.data.createEntry
      setEntries([newEntry, ...entries])
      setEntry('')
    }
  }
  const handleDeleteEntry = async (id) => {
    const input = { id }
    const result = await API.graphql(graphqlOperation(deleteEntry, { input }))
    const deletedNoteId = result.data.deleteEntry.id
    const updatedEntries = entries.filter((entry) => entry.id !== deletedNoteId)
    setEntries(updatedEntries)
  }
  const handleSetNote = ({ description, id }) => {
    setEntry(description)
    setId(id)
  }
  return (
    <div className='flex flex-column items-center justify-center pa3 bg-washed-green'>
      <h1 className='code f2-l'>My Journal</h1>
      <form onSubmit={handleAddEntry} className='mb3'>
        <input
          type='text'
          value={entry}
          className='pa2 f4'
          placeholder='Make an entry'
          onChange={handleChangeEntry}
        />
        <button className='pa2 f4' type='submit'>
          {id ? 'Update Entry' : 'Add Entry'}
        </button>
      </form>
      <div>
        {entries.map((entry) => (
          <div key={entry.id} className='flex items-center'>
            <li onClick={() => handleSetNote(entry)} className='list pa1 f3'>
              {entry.description}
            </li>
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className='bg-transparent bn f4'
            >
              <span>x</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withAuthenticator(App, { includeGreetings: true })
