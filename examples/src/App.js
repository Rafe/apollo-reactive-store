import React from 'react';
import './App.css';
import { gql, ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import create from './apollo-reactive-store';

const store = create({
  counter: 0,
  modal: {
    open: true
  }
});

const client = new ApolloClient({
  uri: "http://localhost:3000/",
  cache: new InMemoryCache({
    typePolicies: store.getTypePolicies()
  })
});

const actions = {
  increase(n) {
    return (state) => state + n
  },
  toggle() {
    return (state) => ({ open: !state.open })
  }
}

function App() {
  const { loading, error, data } = useQuery(gql`
    query {
      counter
      modal {
        open
      }
    }
  `, { client: client });

  if (loading || error) { return null }

  const { counter, modal: { open } } = data;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Example</h1>
        <h2>{counter}</h2>
        <button onClick={() => store.update("counter", actions.increase(1))}>+1</button>
        <button onClick={() => store.update("counter", actions.increase(-1))}>-1</button>
        <h2>is open? {open.toString()}</h2>
        <button onClick={() => store.update("modal", actions.toggle())}>Toggle</button>
      </header>
    </div>
  );
}

export default App;