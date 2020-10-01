import React, { useState, useEffect } from 'react'
import { Input, Button, Comment, Tooltip } from 'antd'
import moment from 'moment'
import '@aws-amplify/ui/dist/style.css'
import './App.css'
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { createEntry, deleteEntry, updateEntry } from './graphql/mutations'
import { listEntrys } from './graphql/queries'

const { TextArea } = Input

function App() {
  const [entries, setEntries] = useState([])
  const [entry, setEntry] = useState('')
  const [id, setId] = useState('')

  useEffect(() => {
    getEntries()
  }, [])
  const getEntries = async () => {
    const result = await API.graphql(graphqlOperation(listEntrys))
    setEntries(result.data.listEntrys.items)
  }
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
    debugger
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
    <div
      style={{
        width: '90vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ textAlign: 'center', color: 'white' }}>My Journal</h1>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '60%',
          alignItems: 'center',
        }}
        className='mb3'
      >
        <TextArea
          autosize='true'
          rows={4}
          type='text'
          value={entry}
          className='pa2 f4'
          placeholder='Make an entry'
          onChange={handleChangeEntry}
        />
        <Button
          onClick={handleAddEntry}
          style={{
            width: '50%',
            margin: '5px',
            backgroundColor: id ? '' : '#ff9900',
            border: '0',
          }}
          size='large'
          type='primary'
          danger={id ? true : false}
          block
        >
          {id ? 'Update Entry' : 'Add Entry'}
        </Button>
      </form>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '70%',
          alignItems: 'center',
        }}
      >
        {entries.map((entry) => (
          <div
            style={{
              backgroundColor: 'whitesmoke',
              marginBottom: '2rem',
              minWidth: '100%',
              padding: '1rem',
            }}
            key={entry.id}
          >
            <Comment
              actions={[
                <Button
                  style={{
                    marginRight: '10px',
                    backgroundColor: '#ff9900',
                    border: '0',
                  }}
                  type='primary'
                >
                  <span onClick={() => handleSetNote(entry)}>Edit</span>
                </Button>,
                <Button danger>
                  <span onClick={() => handleDeleteEntry(entry.id)}>
                    Delete
                  </span>
                </Button>,
              ]}
              content={<p>{entry.description}</p>}
              datetime={
                <Tooltip
                  title={moment(entry.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                >
                  <span>{moment(entry.createdAt).fromNow()}</span>
                </Tooltip>
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default withAuthenticator(App, {
  includeGreetings: true,
  usernameAttributes: 'email',
})
