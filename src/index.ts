import { makeVar, ReactiveVar, useReactiveVar } from '@apollo/client'

type State<T> = Record<string | symbol, T>
type Store<T> = Record<string | symbol, ReactiveVar<T>>

type TypePolicies = {
  Query: {
    fields: {
      [key: string]: {
        read(): any
      }
    }
  }
}

type Updater<Value> = (state: Value) => Value | Value

export interface StoreApi<Value> {
  get<T>(key: string | symbol): Value
  update<StateSlice>(key: string | symbol, value: Updater<Value>): Value
  useStore<T>(key: string | symbol): Value
  getTypePolicies(): TypePolicies
}

export default function create<Value>(
  initialState: State<Value>,
  options = { debug: false }
): StoreApi<Value> {
  const store = Object.keys(initialState).reduce<Store<Value>>((sum, key) => {
    return {
      ...sum,
      [key]: makeVar<Value>(initialState[key]),
    }
  }, {})

  const debug = (key: string, value: Updater<Value>): void => {
    if (options.debug) {
      console.log(`store update: key ${key} with value: ${value}`)
    }
  }

  return {
    get(key: string) {
      const reactiveVar = store[key]

      if (!reactiveVar) {
        throw new Error(`store get: key "${key}" is invalid`)
      }

      return reactiveVar()
    },
    update(key: string, value) {
      const reactiveVar = store[key]

      if (!reactiveVar) {
        throw new Error(`store update: key "${key}" is invalid`)
      }

      debug(key, value)

      if (value instanceof Function) {
        return reactiveVar(value(reactiveVar()))
      } else {
        return reactiveVar(value)
      }
    },
    useStore(key: string) {
      const reactiveVar = store[key];

      if (!reactiveVar) {
        throw new Error(`useStore: key "${key} is invalid`);
      }

      return useReactiveVar(reactiveVar)
    },
    getTypePolicies() {
      return {
        Query: {
          fields: Object.keys(store).reduce((sum, key) => {
            return {
              ...sum,
              [key]: {
                read() {
                  return store[key]()
                },
              },
            }
          }, {}),
        },
      }
    },
  }
}
