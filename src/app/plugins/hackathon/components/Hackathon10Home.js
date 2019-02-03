import React from 'react'

class Hackathon10Home extends React.Component {
  render () {
    return (
      <div>
        <h1>Hackathon 10 Home</h1>
        <p>
          This Hackathon is an exploration of how a UI can be built visually.
        </p>
        <p>
          It consists of 2 parts: a node editor for functions, and a form builder for
          the actual visual components of the UI.
        </p>
        <p>
          The node editor allows functions (workflows) to be defined as a series of
          nodes that flow from one to another.  Each node can be clicked on to modify
          its properties.
        </p>
        <p>
          Nodes can be added to a canvas and their inputs and outputs wired up to
          each other to form a "flow".
        </p>
        <p>
          Additionally, selecting a node shows its before and after to make programming
          more interactive and to overcome the problem of programming blind.
        </p>
        <p>
          The Form Builder has a pallete of components such as TextFields, Checkboxes,
          PickLists, Buttons, etc.  This components can be dropped onto a form.
        </p>
        <p>
          Their initial values can be populated from functions.  They can call
          functions when their value changes.
        </p>
        <p>
          Also, a function can be called when the form is submitted.
        </p>
        <img width="1200" src="https://firebasestorage.googleapis.com/v0/b/wowzrs-quantified-self.appspot.com/o/share%2Fhack10.jpg?alt=media&token=66245828-4c37-408a-8f44-5c7f97c7bdf2" />
      </div>
    )
  }
}

export default Hackathon10Home
