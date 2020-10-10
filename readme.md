# Apollo Reactive Store

> A simple api for manage and update apollo reactive vars.

## Why?

Global state management is alway a problem, reactive store provide an option to manage global state with graphql api. Simplify the complexity to manage global state in other state management library.

## Usage

```js
import { gql, ApolloClient, useQuery } from "@apollo/client"
import create from "apollo-reactive-store";

// create store
const store = create({
  counter: 1,
  uiState: {
    open: false
  }
});

// initialize in apollo client
const client = new ApolloClient({
  uri: "API_URL",
  cache: new InMemoryCache({
    typePolicies: store.getTypePolicies()
  })
});

// use it in component
function App() {
  const { loading, error, data } = useQuery(gql`
    query {
      counter
    }
  `, { client });

  if (loading || error) { return null }

  const { counter } = data;

  return (
    <div>
      <h1>{counter}</h1>
      <button onClick={() => store.update("counter", counter + 1)}>+1</button>
      <button onClick={() => store.update("counter", counter - 1)}>-1</button>
    </div>
  );
}

// pass function to mutate state
const actions = {
  toggle: (open) => {
    return (uiState) => ({ ...uiState, open })
  }
}

function Modal() {
  const { loading, error, data } = useQuery(gql`
    query {
      uiState { open }
    }
  `, { client });

  if (loading || error) { return null }

  const { uiState: { open } } = data;

  return (
    <div>
      <h1>is it open? {open}</h1>
      <button onClick={() => store.update("uiState", actions.toggle(true))}>open</button>
      <button onClick={() => store.update("uiState", actions.toggle(false))}>close</button>
    </div>
  );
}
```